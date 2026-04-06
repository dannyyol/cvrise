from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.database import get_db
from src.api.schemas.settings import SettingCreate, SettingResponse
from src.services.settings import SettingsService

router = APIRouter()

def get_settings_service(db: AsyncSession = Depends(get_db)) -> SettingsService:
    return SettingsService(db)

@router.get("/", response_model=List[SettingResponse])
async def get_settings(service: SettingsService = Depends(get_settings_service)):
    return await service.get_all_settings()

@router.get("/{key}", response_model=SettingResponse)
async def get_setting(key: str, service: SettingsService = Depends(get_settings_service)):
    return await service.get_setting_by_key(key)

@router.post("/", response_model=SettingResponse)
async def create_or_update_setting(setting_data: SettingCreate, service: SettingsService = Depends(get_settings_service)):
    return await service.create_or_update_setting(setting_data)
