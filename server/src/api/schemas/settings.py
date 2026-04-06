from pydantic import BaseModel
from typing import Dict, Any

class SettingBase(BaseModel):
    key: str
    value: Dict[str, Any]

class SettingCreate(SettingBase):
    pass

class SettingResponse(SettingBase):
    pass
