from pydantic import BaseModel

class AIModelBase(BaseModel):
    id: str
    name: str
    description: str
    provider: str
    key_id: str

class AIModelCreate(AIModelBase):
    pass

class AIModelResponse(AIModelBase):
    class Config:
        from_attributes = True

class TestConnectionRequest(BaseModel):
    provider: str
    base_url: str
    api_key: str | None = None
    model_id: str | None = None
