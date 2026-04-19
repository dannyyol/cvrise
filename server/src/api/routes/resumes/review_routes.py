from fastapi import APIRouter, HTTPException, Depends
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from src.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.services.resumes.review_service import create_cv_review_service
from src.services.settings.ai_service import get_configured_ai_client
from src.services.settings.plan_service import PlanService
from src.config import settings

router = APIRouter()

@router.post("/review")
async def review_resume(
    payload: Dict[str, Any], 
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        plan_service = PlanService(session, user)
        
        client, model_id, is_platform_mode = await get_configured_ai_client(session)
        
        cost = settings.COST_CV_REVIEW
        if is_platform_mode:
            if not await plan_service.has_sufficient_balance(cost):
                 raise HTTPException(status_code=402, detail=f"Insufficient tokens. This action requires at least {cost} tokens.")

        service = create_cv_review_service(client, model_id)

        if payload.get("sections"):
            result = await service.review_cv_payload(payload)
            
            if is_platform_mode:
                await plan_service.deduct_tokens(cost, "CV Review Generation")
                
            return result
            
        raise HTTPException(status_code=400, detail="Provide 'sections' in payload.")

    except HTTPException:
        raise
    except ValueError as e:
        logger.warning("Review failed: {}", e)
        raise HTTPException(status_code=502, detail="AI analysis failed. Please try again.")
    except Exception as e:
        logger.exception("Review failed: {}", e)
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")
