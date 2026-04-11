from fastapi import APIRouter, Depends, HTTPException, Request, Header
from typing import List

from src.api.schemas.plan import TokenPlanResponse, UserBalanceResponse, SelectPlanRequest, PaymentInitiationResponse, TokenTransactionResponse, CheckoutStatusResponse
from src.services.settings.plan_service import PlanService, get_plan_service, get_authenticated_plan_service
from src.api.schemas.common import PaginatedResponse

router = APIRouter()

@router.get("/", response_model=List[TokenPlanResponse])
async def get_plans(service: PlanService = Depends(get_plan_service)):
    return await service.get_all_plans()

@router.get("/balance", response_model=UserBalanceResponse)
async def get_user_balance(service: PlanService = Depends(get_authenticated_plan_service)):
    return await service.get_user_balance()

@router.get("/transactions", response_model=PaginatedResponse[TokenTransactionResponse])
async def get_transactions(
    page: int = 1,
    size: int = 5,
    service: PlanService = Depends(get_authenticated_plan_service)
):
    return await service.get_transactions(page, size)

@router.put("/select-plan", response_model=PaymentInitiationResponse)
async def select_plan(
    request: SelectPlanRequest,
    service: PlanService = Depends(get_authenticated_plan_service)
):
    try:
        url = await service.purchase_plan(request.plan_id)
        return PaymentInitiationResponse(checkout_url=url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/checkout-status", response_model=CheckoutStatusResponse)
async def checkout_status(
    session_id: str,
    service: PlanService = Depends(get_authenticated_plan_service)
):
    try:
        return await service.get_checkout_status(session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    service: PlanService = Depends(get_plan_service)
):
    try:
        payload = await request.body()
        await service.handle_webhook(payload, stripe_signature)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
