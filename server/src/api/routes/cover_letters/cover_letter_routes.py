from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.api.schemas.resume import CoverLetterItem, CoverLetterCreate, CoverLetterGenerateRequest
from src.services.cover_letters.cover_letters_service import CoverLetterService

router = APIRouter()

def get_cover_letter_service(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
) -> CoverLetterService:
    return CoverLetterService(db, user)

@router.get("/", response_model=list[CoverLetterItem])
async def list_cover_letters(resume_id: str, service: CoverLetterService = Depends(get_cover_letter_service)):
    return await service.list_cover_letters(resume_id)

@router.post("/", response_model=CoverLetterItem)
async def create_cover_letter(resume_id: str, body: CoverLetterCreate, service: CoverLetterService = Depends(get_cover_letter_service)):
    return await service.create_cover_letter(resume_id, body)

@router.post("/generate", response_model=CoverLetterItem)
async def generate_cover_letter(resume_id: str, body: CoverLetterGenerateRequest, service: CoverLetterService = Depends(get_cover_letter_service)):
    return await service.generate_cover_letter(resume_id, body)
