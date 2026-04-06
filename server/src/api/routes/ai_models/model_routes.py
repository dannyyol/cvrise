from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from src.database import get_db
from src.models.ai_model import AIModel
from src.api.schemas.ai_model import AIModelResponse, TestConnectionRequest
from src.services.ai.ai_connection import AIConnectionService

router = APIRouter()

@router.get("/", response_model=List[AIModelResponse])
async def get_ai_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel))
    models = result.scalars().all()
    return models

@router.post("/test-connection")
async def test_connection(request: TestConnectionRequest):
    try:
        success = await AIConnectionService.test_connection(
            provider=request.provider,
            base_url=request.base_url,
            api_key=request.api_key,
            model_id=request.model_id
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Connection failed. Please check your credentials and network connection.")
        
        return {"status": "success", "message": "Connection successful"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
