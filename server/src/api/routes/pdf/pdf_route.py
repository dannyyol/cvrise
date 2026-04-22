from fastapi import APIRouter
from typing import Any, Dict
from src.services.pdf.pdf_service import PdfService

router = APIRouter()
service = PdfService()

@router.get("/cv-data/{token}")
def get_cv_data(token: str) -> Dict[str, Any]:
    return service.get_cv_data(token)

@router.post("/export-pdf")
async def export_pdf(payload: Dict[str, Any]):
    return await service.export_pdf(payload)
