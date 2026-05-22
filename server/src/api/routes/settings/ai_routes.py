from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from src.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.api.schemas.ai_settings import AISettingsUpdate, PAYGToggle
from src.services.settings.ai_service import AISettingsService
from src.services.settings.payg_service import PAYGService

router = APIRouter()

def get_ai_settings_service(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AISettingsService:
    return AISettingsService(db, user.id)

def get_payg_service(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PAYGService:
    return PAYGService(db, user.id)

@router.get("", response_model=Dict[str, Any])
async def get_ai_settings(service: AISettingsService = Depends(get_ai_settings_service)):
    return await service.get_ai_settings()

@router.post("", response_model=Dict[str, Any])
async def update_ai_settings(settings_data: AISettingsUpdate, service: AISettingsService = Depends(get_ai_settings_service)):
    return await service.update_ai_settings(settings_data)

@router.get("/payg", response_model=Dict[str, Any])
async def get_payg_status(service: PAYGService = Depends(get_payg_service)):
    return await service.get_payg_status()

@router.patch("/payg", response_model=Dict[str, Any])
async def update_payg(body: PAYGToggle, service: PAYGService = Depends(get_payg_service)):
    return await service.set_payg_enabled(body.enabled)
