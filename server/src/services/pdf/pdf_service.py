from typing import Any, Dict
from uuid import uuid4

from fastapi import HTTPException
from fastapi.responses import Response
from loguru import logger

from src.config import get_settings
from src.services.pdf.pdf_export_service import generate_pdf_from_preview, get_token, put_token

class PdfService:
    def get_cv_data(self, token: str) -> Dict[str, Any]:
        return get_token(token)

    async def export_pdf(self, payload: Dict[str, Any]) -> Response:
        try:
            template = payload.get("template")
            data = payload.get("data")
            if not template or not data:
                raise HTTPException(status_code=400, detail="Missing template or data")

            token = uuid4().hex
            put_token(token, data)

            settings = get_settings()
            base_url = settings.PDF_CLIENT_BASE_URL or settings.CLIENT_BASE_URL
            preview_url = f"{base_url}/pdf-render?template={template}&token={token}"
            try:
                pdf_bytes = await generate_pdf_from_preview(preview_url)
                headers = {"Content-Disposition": "attachment; filename=cv.pdf"}
                return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
            except ModuleNotFoundError:
                raise HTTPException(status_code=500, detail="Playwright is not installed")
            except Exception as e:
                logger.exception("Failed to generate PDF for template {}: {}", template, e)
                raise HTTPException(status_code=500, detail="Failed to generate PDF")
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Unexpected PDF export failure: {}", e)
            raise HTTPException(status_code=500, detail="Export failed")

