from fastapi import APIRouter, Depends
from typing import Any, Dict
from src.services.pdf.pdf_service import PdfService
from src.api.dependencies import get_current_user

router = APIRouter()
service = PdfService()

@router.post("/export-pdf", dependencies=[Depends(get_current_user)])
async def export_pdf(payload: Dict[str, Any]):
    return await service.export_pdf(payload)
