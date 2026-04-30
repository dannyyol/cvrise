from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, func, ForeignKey, Index
from src.database import Base
import uuid

class TokenPlan(Base):
    __tablename__ = "token_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False) 
    tokens = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    is_popular = Column(Boolean, default=False)
    features = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

class UserBalance(Base):
    __tablename__ = "user_balances"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    balance = Column(Integer, default=0)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class TokenTransaction(Base):
    __tablename__ = "token_transactions"
    __table_args__ = (
        Index("ix_token_transactions_user_id_created_at", "user_id", "created_at"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    plan_id = Column(String, nullable=True)
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
