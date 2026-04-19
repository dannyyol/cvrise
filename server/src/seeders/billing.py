from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.billing import TokenPlan, UserBalance
from src.models.user import User
from src.seeders.base import BaseSeeder
import logging

logger = logging.getLogger(__name__)

INITIAL_PLANS = [
    {
        "name": "Starter",
        "tokens": 100,
        "price": 5.00,
        "currency": "USD",
        "is_popular": False,
        "features": "No subscription, Secure payment, Never expire"
    },
    {
        "name": "Pro",
        "tokens": 500,
        "price": 20.00,
        "currency": "USD",
        "is_popular": True,
        "features": "No subscription, Secure payment, Never expire"
    },
    {
        "name": "Enterprise",
        "tokens": 2000,
        "price": 70.00,
        "currency": "USD",
        "is_popular": False,
        "features": "No subscription, Secure payment, Never expire"
    }
]

class BillingSeeder(BaseSeeder):
    async def run(
        self,
        session: AsyncSession,
        user_id: Optional[str] = None,
        ensure_plans: bool = True,
        commit: bool = True,
    ) -> None:
        if ensure_plans:
            for plan_data in INITIAL_PLANS:
                result = await session.execute(select(TokenPlan).where(TokenPlan.name == plan_data["name"]))
                existing_plan = result.scalar_one_or_none()
                
                if not existing_plan:
                    logger.info(f"Creating Token Plan: {plan_data['name']}")
                    plan = TokenPlan(**plan_data)
                    session.add(plan)
                else:
                    logger.info(f"Token Plan already exists: {plan_data['name']}")
                    for key, value in plan_data.items():
                        setattr(existing_plan, key, value)
        
        if user_id:
            user_result = await session.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()

            if user:
                result = await session.execute(select(UserBalance).where(UserBalance.user_id == user_id))
                existing_balance = result.scalar_one_or_none()
                
                if not existing_balance:
                    logger.info(f"Initializing User Balance for user {user_id}")
                    balance = UserBalance(balance=0, user_id=user_id)
                    session.add(balance)
            else:
                logger.info(f"Skipping User Balance seeding: user {user_id} does not exist")
        
        if commit:
            await session.commit()
