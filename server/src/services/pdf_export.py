from fastapi import HTTPException
from typing import Any, Dict
import time
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
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=[
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
        ])
        context = await browser.new_context()
        page = await context.new_page()
        await page.emulate_media(media="screen")
        await page.goto(preview_url, wait_until="networkidle")
        await page.evaluate(
            """
            () => new Promise((resolve) => {
                try {
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(() => resolve(null)).catch(() => resolve(null));
                    } else {
                        resolve(null);
                    }
                } catch { resolve(null); }
            })
            """
        )

        # Wait for the preview to be ready (signaled by window.CV_PREVIEW_READY)
        try:
            await page.wait_for_function("window.CV_PREVIEW_READY === true", timeout=30000)
        except Exception:
            # If timeout or error, we might still get a result, or it might be partial.
            # Logging would be good here.
            pass

        try:
            await page.add_style_tag(content="""
              @page { size: A4; margin: 0 !important; }
              html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
            """)
        except Exception:
            pass

        pdf_bytes = await page.pdf(
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"},
        )
        await context.close()
        await browser.close()
        return pdf_bytes
