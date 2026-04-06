from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TokenPlanResponse(BaseModel):
    id: str
    name: str
    tokens: int
    price: float
    currency: str
    is_popular: bool
    features: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserBalanceResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    balance: int
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenTransactionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    plan_id: Optional[str] = None
    amount: int
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SelectPlanRequest(BaseModel):
    plan_id: str

class PaymentInitiationResponse(BaseModel):
    checkout_url: str
