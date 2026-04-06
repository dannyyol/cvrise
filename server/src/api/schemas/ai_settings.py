from pydantic import BaseModel
from typing import Dict, Any, Optional

class AISettingsConfig(BaseModel):
    baseUrl: Optional[str] = None
    modelId: Optional[str] = None
    apiKey: Optional[str] = None

class AISettingsUpdate(BaseModel):
    activeModelId: str
    usageMode: str = 'custom' # 'platform' or 'custom'
    configs: Dict[str, AISettingsConfig]
