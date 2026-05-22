from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any

from src.models.settings import Setting


class PAYGService:
    def __init__(self, session: AsyncSession, user_id: str):
        self.session = session
        self.user_id = user_id

    async def get_payg_status(self) -> Dict[str, Any]:
        result = await self.session.execute(
            select(Setting).where(Setting.user_id == self.user_id, Setting.key == "ai_config")
        )
        setting = result.scalar_one_or_none()
        usage_mode = (setting.value or {}).get("usageMode", "custom") if setting else "custom"
        return {"enabled": usage_mode == "platform"}

    async def set_payg_enabled(self, enabled: bool) -> Dict[str, Any]:
        result = await self.session.execute(
            select(Setting).where(Setting.user_id == self.user_id, Setting.key == "ai_config")
        )
        setting = result.scalar_one_or_none()
        usage_mode = "platform" if enabled else "custom"

        if setting:
            updated = dict(setting.value or {})
            updated["usageMode"] = usage_mode
            setting.value = updated
        else:
            setting = Setting(
                user_id=self.user_id,
                key="ai_config",
                value={"usageMode": usage_mode},
            )
            self.session.add(setting)

        await self.session.commit()
        await self.session.refresh(setting)
        return {"enabled": (setting.value or {}).get("usageMode") == "platform"}
