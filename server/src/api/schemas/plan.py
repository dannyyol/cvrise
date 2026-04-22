from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
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
    model_config = ConfigDict(from_attributes=True)

class UserBalanceResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    balance: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TokenTransactionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    plan_id: Optional[str] = None
    amount: int
    description: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SelectPlanRequest(BaseModel):
    plan_id: str

class PaymentInitiationResponse(BaseModel):
    checkout_url: str

class CheckoutStatusResponse(BaseModel):
    status: Literal["pending", "fulfilled", "unpaid"]
    balance: Optional[UserBalanceResponse] = None
