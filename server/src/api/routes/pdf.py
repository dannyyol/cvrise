from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from typing import Any, Dict
from uuid import uuid4

from ...config import get_settings
from ...services.pdf_export import generate_pdf_from_preview, get_token, put_token

router = APIRouter()

@router.get("/cv-data/{token}")
def get_cv_data(token: str) -> Dict[str, Any]:
    return get_token(token)

@router.post("/export-pdf")
async def export_pdf(payload: Dict[str, Any]):
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
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Export failed")
