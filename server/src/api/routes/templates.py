from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from src.database import get_db
from src.models.resume import Template

router = APIRouter()

class TemplateResponse(BaseModel):
    id: str
    key: str
    name: str
    description: str
    thumbnail: str
    supports_accent: bool
    sidebar_section_keys: list[str] | None = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[TemplateResponse])
async def get_templates(session: AsyncSession = Depends(get_db)):
    """Get all available resume templates."""
    stmt = select(Template)
    result = await session.execute(stmt)
    templates = result.scalars().all()
    return templates
