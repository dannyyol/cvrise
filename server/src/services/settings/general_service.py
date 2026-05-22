from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from typing import List, Optional

from src.models.settings import Setting
from src.api.schemas.settings import SettingCreate

class SettingsService:
    def __init__(self, session: AsyncSession, user_id: str):
        self.session = session
        self.user_id = user_id

    async def get_all_settings(self) -> List[Setting]:
        result = await self.session.execute(select(Setting).where(Setting.user_id == self.user_id))
        return result.scalars().all()

    async def get_setting_by_key(self, key: str) -> Optional[Setting]:
        result = await self.session.execute(select(Setting).where(Setting.user_id == self.user_id, Setting.key == key))
        setting = result.scalar_one_or_none()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        return setting

    async def create_or_update_setting(self, setting_data: SettingCreate) -> Setting:
        result = await self.session.execute(
            select(Setting).where(Setting.user_id == self.user_id, Setting.key == setting_data.key)
        )
        existing_setting = result.scalar_one_or_none()
        
        if existing_setting:
            existing_setting.value = setting_data.value
            await self.session.commit()
            await self.session.refresh(existing_setting)
            return existing_setting
        else:
            new_setting = Setting(user_id=self.user_id, key=setting_data.key, value=setting_data.value)
            self.session.add(new_setting)
            await self.session.commit()
            await self.session.refresh(new_setting)
            return new_setting
