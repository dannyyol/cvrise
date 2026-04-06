from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from src.database import get_db
from src.api.schemas.ai_settings import AISettingsUpdate
from src.services.settings.ai_service import AISettingsService

router = APIRouter()

def get_ai_settings_service(db: AsyncSession = Depends(get_db)) -> AISettingsService:
    return AISettingsService(db)

@router.get("", response_model=Dict[str, Any])
async def get_ai_settings(service: AISettingsService = Depends(get_ai_settings_service)):
    return await service.get_ai_settings()

@router.post("", response_model=Dict[str, Any])
async def update_ai_settings(settings_data: AISettingsUpdate, service: AISettingsService = Depends(get_ai_settings_service)):
    return await service.update_ai_settings(settings_data)
