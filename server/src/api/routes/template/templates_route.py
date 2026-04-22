from typing import List, Literal, Union
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict

from src.database import get_db
from src.models.resume import Template
from src.models.cover_letter_template import CoverLetterTemplate

router = APIRouter()

class ResumeTemplateResponse(BaseModel):
    id: str
    key: str
    name: str
    description: str
    thumbnail: str
    supports_accent: bool
    sidebar_section_keys: list[str] | None = None
    model_config = ConfigDict(from_attributes=True)

class CoverLetterTemplateResponse(BaseModel):
    id: str
    key: str
    name: str
    description: str
    guidelines: dict
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[Union[ResumeTemplateResponse, CoverLetterTemplateResponse]])
async def get_templates(
    session: AsyncSession = Depends(get_db),
    document: Literal["resume", "cover-letter"] = Query("resume"),
):
    if document == "cover-letter":
        stmt = select(CoverLetterTemplate)
        result = await session.execute(stmt)
        return result.scalars().all()

    stmt = select(Template)
    result = await session.execute(stmt)
    return result.scalars().all()
