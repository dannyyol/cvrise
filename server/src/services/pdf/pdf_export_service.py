import asyncio
import json
from urllib.parse import urlsplit
from typing import Any, Dict
from loguru import logger
from playwright.async_api import async_playwright

from src.config import get_settings


_pdf_export_semaphore: asyncio.Semaphore | None = None


def _get_pdf_export_semaphore() -> asyncio.Semaphore:
    global _pdf_export_semaphore
    if _pdf_export_semaphore is None:
        settings = get_settings()
        limit = max(1, int(settings.PDF_EXPORT_MAX_CONCURRENT_JOBS))
        _pdf_export_semaphore = asyncio.Semaphore(limit)
    return _pdf_export_semaphore

async def generate_pdf_from_preview(preview_url: str, template: str, data: Dict[str, Any]) -> bytes:
    ready_timeout_ms = 120000
    navigation_timeout_ms = 60000
    semaphore = _get_pdf_export_semaphore()
    await semaphore.acquire()
    try:
        preview_netloc = urlsplit(preview_url).netloc
        allowed_netlocs = {preview_netloc} if preview_netloc else set()

        async with async_playwright() as p:
            settings = get_settings()
            launch_args = [
                "--disable-dev-shm-usage",
            ]
            if settings.PDF_EXPORT_NO_SANDBOX:
                launch_args.extend(["--no-sandbox", "--disable-setuid-sandbox"])

            browser = await p.chromium.launch(args=launch_args)
            context = await browser.new_context(accept_downloads=False)
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

            async def _route_guard(route, request) -> None:
                try:
                    url = request.url
                    parsed = urlsplit(url)
                    scheme = (parsed.scheme or "").lower()
                    if scheme in {"data", "blob", "about"}:
                        await route.continue_()
                        return
                    if scheme in {"http", "https", "ws", "wss"} and parsed.netloc in allowed_netlocs:
                        await route.continue_()
                        return
                except Exception:
                    pass
                await route.abort()

            await context.route("**/*", _route_guard)
            page.set_default_timeout(ready_timeout_ms)
            page.set_default_navigation_timeout(navigation_timeout_ms)

            try:
                export_payload = json.dumps({"template": template, "data": data}, separators=(",", ":"), ensure_ascii=True)
                await page.add_init_script(f"window.__CV_EXPORT__ = {export_payload};")
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
    finally:
        semaphore.release()
