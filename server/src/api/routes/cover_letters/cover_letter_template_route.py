from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict

from src.database import get_db
from src.models.cover_letter_template import CoverLetterTemplate

router = APIRouter()

class CoverLetterTemplateResponse(BaseModel):
    id: str
    key: str
    name: str
    description: str
    guidelines: dict
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[CoverLetterTemplateResponse])
async def get_cover_letter_templates(session: AsyncSession = Depends(get_db)):
    stmt = select(CoverLetterTemplate)
    result = await session.execute(stmt)
    return result.scalars().all()
