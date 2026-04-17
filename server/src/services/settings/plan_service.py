import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from src.models.billing import TokenPlan, UserBalance, TokenTransaction
from src.models.user import User
from src.config import get_settings
from src.utils.pagination import paginate
from src.api.schemas.common import PaginatedResponse
from src.api.schemas.plan import TokenTransactionResponse
from fastapi import HTTPException, Depends
import stripe
from loguru import logger
from src.database import get_db
from src.api.dependencies import get_current_user

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY
WEBHOOK_SECRET = settings.STRIPE_WEBHOOK_SECRET
CLIENT_URL = settings.CLIENT_BASE_URL

class PlanService:
    def __init__(self, session: AsyncSession, user: Optional[User] = None):
        self.session = session
        self.user = user

    @property
    def user_id(self) -> Optional[str]:
        return self.user.id if self.user else None

    async def get_all_plans(self) -> List[TokenPlan]:
        result = await self.session.execute(select(TokenPlan))
        return result.scalars().all()

    async def get_plan_by_id(self, plan_id: str) -> Optional[TokenPlan]:
        result = await self.session.execute(select(TokenPlan).where(TokenPlan.id == plan_id))
        return result.scalar_one_or_none()
    
    async def get_user_balance(self, user_id: Optional[str] = None) -> UserBalance:
        target_user_id = user_id or self.user_id
        
        if not target_user_id:
             logger.error("get_user_balance called without user_id")
             raise ValueError("User context is required to retrieve balance")
             
        stmt = select(UserBalance)
        stmt = stmt.where(UserBalance.user_id == target_user_id)
        result = await self.session.execute(stmt)
        balance = result.scalars().first()
        
        if not balance:
            logger.info(f"Self-healing: Creating missing balance for user {target_user_id}")
            balance = UserBalance(balance=0, user_id=target_user_id)
            self.session.add(balance)
            await self.session.commit()
            await self.session.refresh(balance)
        return balance

    async def has_sufficient_balance(self, amount: int) -> bool:
        balance = await self.get_user_balance()
        logger.info(f"{self.user_id} has balance {balance.balance}")
        return balance.balance >= amount

    async def deduct_tokens(self, amount: int, description: str) -> UserBalance:
        balance = await self.get_user_balance()
        
        if balance.balance < amount:
            raise HTTPException(status_code=402, detail="Insufficient tokens")
        
        balance.balance -= amount
        self.session.add(balance)
        
        transaction = TokenTransaction(
            amount=-amount,
            description=description,
            user_id=self.user_id
        )
        self.session.add(transaction)
        
        await self.session.commit()
        await self.session.refresh(balance)
        return balance

    async def get_transactions(self, page: int = 1, size: int = 10) -> PaginatedResponse[TokenTransactionResponse]:
        query = select(TokenTransaction).order_by(TokenTransaction.created_at.desc())
        query = query.where(TokenTransaction.user_id == self.user_id).where(TokenTransaction.plan_id != None)            
        return await paginate(self.session, query, page, size, schema=TokenTransactionResponse)

    async def purchase_plan(self, plan_id: str) -> str:
        """
        Initiates a purchase by creating a Stripe Checkout Session.
        Returns the checkout URL.
        """
        plan = await self.get_plan_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan with id {plan_id} not found")
        
        if not stripe.api_key:
             logger.warning("Stripe API key not set. Falling back to immediate simulation.")
             await self._fulfill_purchase(plan, user_id=self.user_id)
             return f"{CLIENT_URL}/dashboard/settings?tab=billing&success=true"

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': plan.currency.lower(),
                        'product_data': {
                            'name': f"{plan.name} Plan ({plan.tokens} Tokens)",
                        },
                        'unit_amount': int(plan.price * 100), # Amount in cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'{CLIENT_URL}/dashboard/settings?tab=billing&success=true&session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{CLIENT_URL}/dashboard/settings?tab=billing&canceled=true',
                metadata={
                    'plan_id': plan.id,
                    'tokens': str(plan.tokens),
                    'user_id': self.user_id
                }
            )
            return checkout_session.url
        except Exception as e:
            logger.error(f"Stripe checkout creation failed: {e}")
            raise ValueError(f"Failed to initiate payment: {str(e)}")

    async def _fulfill_purchase(self, plan: TokenPlan, payment_id: str = None, user_id: str = None) -> UserBalance:
        transaction = TokenTransaction(
            plan_id=plan.id,
            amount=plan.tokens,
            description=f"Purchase {plan.name} Plan" + (f" (Stripe: {payment_id})" if payment_id else ""),
            user_id=user_id
        )
        self.session.add(transaction)
        
        balance = await self.get_user_balance(user_id=user_id)
        balance.balance += plan.tokens
        self.session.add(balance)
        
        await self.session.commit()
        await self.session.refresh(balance)
        return balance

    async def get_checkout_status(self, checkout_session_id: str) -> dict:
        session = stripe.checkout.Session.retrieve(checkout_session_id)

        metadata = session["metadata"] if "metadata" in session else {}
        metadata_user_id = metadata.get("user_id") if isinstance(metadata, dict) else metadata["user_id"] if "user_id" in metadata else None
        if metadata_user_id and metadata_user_id != self.user_id:
            raise HTTPException(status_code=403, detail="Invalid checkout session")

        payment_status = session["payment_status"] if "payment_status" in session else None
        if payment_status != "paid":
            return {"status": "unpaid"}

        payment_id = session["payment_intent"] if "payment_intent" in session else None
        if not payment_id:
            return {"status": "pending"}

        result = await self.session.execute(
            select(TokenTransaction.id).where(
                TokenTransaction.user_id == self.user_id,
                TokenTransaction.description.like(f"%Stripe: {payment_id}%"),
            )
        )
        found = result.scalar_one_or_none()
        if found:
            balance = await self.get_user_balance(user_id=self.user_id)
            return {"status": "fulfilled", "balance": balance}

        return {"status": "pending"}

    async def handle_webhook(self, payload: bytes, sig_header: str):
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, WEBHOOK_SECRET
            )
        except ValueError as e:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError("Invalid signature")

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            metadata = session["metadata"] if "metadata" in session else {}
            plan_id = metadata.get("plan_id") if isinstance(metadata, dict) else metadata["plan_id"] if "plan_id" in metadata else None
            user_id = metadata.get("user_id") if isinstance(metadata, dict) else metadata["user_id"] if "user_id" in metadata else None
            
            if plan_id:
                plan = await self.get_plan_by_id(plan_id)
                if plan:
                    payment_id = session["payment_intent"] if "payment_intent" in session else None
                    await self._fulfill_purchase(plan, payment_id=payment_id, user_id=user_id)

def get_plan_service(db: AsyncSession = Depends(get_db)) -> PlanService:
    return PlanService(db)

def get_authenticated_plan_service(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
) -> PlanService:
    return PlanService(db, user)
