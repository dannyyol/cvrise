from pydantic import BaseModel, ConfigDict

class AIModelBase(BaseModel):
    id: str
    name: str
    description: str
    provider: str
    key_id: str

class AIModelCreate(AIModelBase):
    pass

class AIModelResponse(AIModelBase):
    model_config = ConfigDict(from_attributes=True)

class TestConnectionRequest(BaseModel):
    provider: str
    base_url: str
    api_key: str | None = None
    model_id: str | None = None
