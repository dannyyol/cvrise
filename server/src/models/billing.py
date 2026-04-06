from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, func, ForeignKey
from src.database import Base
import uuid

class TokenPlan(Base):
    __tablename__ = "token_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)  # e.g., "Starter"
    tokens = Column(Integer, nullable=False)  # e.g., 100
    price = Column(Float, nullable=False)  # e.g., 5.00
    currency = Column(String, default="USD")
    is_popular = Column(Boolean, default=False)
    features = Column(String, nullable=True) # JSON or comma-separated list of features
    created_at = Column(DateTime, default=func.now())

class UserBalance(Base):
    __tablename__ = "user_balances"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Temporarily nullable for migration
    balance = Column(Integer, default=0)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class TokenTransaction(Base):
    __tablename__ = "token_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Temporarily nullable for migration
    plan_id = Column(String, nullable=True) # Link to a plan if purchased
    amount = Column(Integer, nullable=False) # Positive for purchase, negative for usage
    description = Column(String, nullable=True) # e.g., "Purchase Starter Plan", "Generated Resume"
    created_at = Column(DateTime, default=func.now())
