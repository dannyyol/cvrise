from fastapi import HTTPException
from typing import Any, Dict
import time
from loguru import logger
from playwright.async_api import async_playwright

from ..config import get_settings

_STORE: Dict[str, Dict[str, Any]] = {}

def put_token(token: str, data: Dict[str, Any]) -> None:
    settings = get_settings()
    _STORE[token] = {
        "data": data,
        "expires": time.time() + int(settings.TOKEN_TTL_SECONDS),
    }

def get_token(token: str) -> Dict[str, Any]:
    entry = _STORE.get(token)
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    if time.time() > entry["expires"]:
        _STORE.pop(token, None)
        raise HTTPException(status_code=410, detail="Expired")
    return entry["data"]

async def generate_pdf_from_preview(preview_url: str) -> bytes:
    """
    Loads the Next.js PDF render route in a headless browser and prints it to PDF.

    This runs inside the server container, so preview_url should usually be an
    internal Docker DNS name (e.g. http://client:3000/) rather than the public domain.
    """
    ready_timeout_ms = 120000
    navigation_timeout_ms = 60000

    async with async_playwright() as p:
        browser = await p.chromium.launch(args=[
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
        ])
        context = await browser.new_context()
        page = await context.new_page()
        console_tail: list[str] = []
        page_errors: list[str] = []

        def _on_console(msg) -> None:
            entry = f"[{msg.type}] {msg.text}"
            console_tail.append(entry)
            if len(console_tail) > 50:
                console_tail.pop(0)

        def _on_page_error(exc) -> None:
            page_errors.append(str(exc))

        page.on("console", _on_console)
        page.on("pageerror", _on_page_error)

        try:
            await page.emulate_media(media="screen")
            await page.goto(preview_url, wait_until="domcontentloaded", timeout=navigation_timeout_ms)
            try:
                await page.add_style_tag(content="""
                  nextjs-portal,
                  #__next-build-watcher,
                  #__next-route-announcer {
                    display: none !important;
                  }
                """)
            except Exception:
                pass

            try:
                """
                Primary readiness signal is window.CV_PREVIEW_READY, set by the preview component.
                Fallback condition: once at least one '.cv-page' exists and the loader icon is gone.
                """
                await page.wait_for_function(
                    """() => {
                      if (window.CV_PREVIEW_READY === true) return true;
                      const pages = document.querySelectorAll('.cv-page');
                      if (!pages || pages.length === 0) return false;
                      const loaderIcon = document.querySelector('svg.lucide-loader2');
                      if (loaderIcon) return false;
                      return true;
                    }""",
                    timeout=ready_timeout_ms,
                )
            except Exception as e:
                try:
                    cv_pages = await page.evaluate("document.querySelectorAll('.cv-page').length")
                except Exception:
                    cv_pages = None
                try:
                    body_text = await page.evaluate("(document.body && document.body.innerText) ? document.body.innerText : ''")
                except Exception:
                    body_text = ""

                logger.error("PDF export timed out waiting for render readiness: {}", e)
                logger.error("PDF diagnostics: cv_pages={}, url={}", cv_pages, preview_url)
                if page_errors:
                    logger.error("PDF page errors:\n{}", "\n".join(page_errors[-10:]))
                if console_tail:
                    logger.error("PDF console tail:\n{}", "\n".join(console_tail))
                if body_text:
                    logger.error("PDF body text (head): {}", body_text[:2000])
                raise

            try:
                await page.add_style_tag(content="""
                  @page { size: A4; margin: 0 !important; }
                  html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
                """)
            except Exception:
                pass

            return await page.pdf(
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
                margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"},
            )
        finally:
            await context.close()
            await browser.close()
