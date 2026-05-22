from pydantic import BaseModel, field_validator
from typing import Dict, Any, Optional

class AISettingsConfig(BaseModel):
    baseUrl: Optional[str] = None
    modelId: Optional[str] = None
    apiKey: Optional[str] = None

    @field_validator("baseUrl", "modelId", "apiKey", mode="before")
    @classmethod
    def _strip_strings(cls, v):
        if isinstance(v, str):
            value = v.strip()
            return value if value else None
        return v

class AISettingsUpdate(BaseModel):
    activeModelId: str
    usageMode: str = 'custom' # 'platform' or 'custom'
    configs: Dict[str, AISettingsConfig]
