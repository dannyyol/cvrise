from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from typing import Dict, Any, Optional, Tuple

from src.models.settings import Setting
from src.models.ai_model import AIModel
from src.api.schemas.ai_settings import AISettingsUpdate
from src.services.ai.ai_clients import (
    AsyncLLMClient, OpenAIClient, AnthropicClient, GoogleClient, OllamaClient
)
from src.config import get_settings

class AISettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_ai_settings(self) -> Dict[str, Any]:
        result = await self.session.execute(select(Setting).where(Setting.key == 'ai_config'))
        setting = result.scalar_one_or_none()
        if not setting:
            return {}
        return setting.value

    async def update_ai_settings(self, settings_data: AISettingsUpdate) -> Dict[str, Any]:
        active_model_id = settings_data.activeModelId
        
        model_result = await self.session.execute(select(AIModel).where(AIModel.id == active_model_id))
        model = model_result.scalar_one_or_none()
        if not model:
             raise HTTPException(status_code=400, detail="Invalid Active Model ID")
             
        configs = settings_data.configs
        provider_config_model = configs.get(model.key_id)
        provider_config = provider_config_model.model_dump() if provider_config_model else {}
        validation_errors = {}
        
        result = await self.session.execute(select(Setting).where(Setting.key == 'ai_config'))
        existing_setting = result.scalar_one_or_none()
        existing_value = existing_setting.value if existing_setting else {}

        if settings_data.usageMode == 'custom' and existing_value.get('usageMode') == 'custom':
            if not provider_config.get('baseUrl'):
                validation_errors['baseUrl'] = "Base URL is required"
                
            if not provider_config.get('modelId'):
                 validation_errors['modelId'] = "Model ID is required"
                
            if model.key_id != 'ollama' and not provider_config.get('apiKey'):
                 validation_errors['apiKey'] = "API Key is required"
        
        if validation_errors:
            raise HTTPException(status_code=400, detail=validation_errors)

        value_to_store = settings_data.model_dump()
        
        if existing_setting:
            existing_setting.value = value_to_store
            await self.session.commit()
            await self.session.refresh(existing_setting)
            return existing_setting.value
        else:
            new_setting = Setting(key='ai_config', value=value_to_store)
            self.session.add(new_setting)
            await self.session.commit()
            await self.session.refresh(new_setting)
            return new_setting.value

async def get_configured_ai_client(session: AsyncSession) -> Tuple[AsyncLLMClient, str, bool]:
    """
    Returns (client, model_id, is_platform_mode)
    """
    stmt = select(Setting).where(Setting.key == "ai_config")
    result = await session.execute(stmt)
    setting = result.scalar_one_or_none()
    ai_settings = setting.value if setting else {}
    
    usage_mode = ai_settings.get("usageMode", "custom")
    
    if usage_mode == "platform":
        app_settings = get_settings()
        
        if not app_settings.PLATFORM_OPENAI_API_KEY:
             raise HTTPException(
                 status_code=400, 
                 detail="Platform OpenAI API Key is not configured on the server. Please contact support or switch to Custom mode."
             )
        
        client = OpenAIClient(
            base_url="https://api.openai.com/v1", 
            api_key=app_settings.PLATFORM_OPENAI_API_KEY
        )
        return client, app_settings.PLATFORM_OPENAI_MODEL, True
        
    else:
        active_model_id = ai_settings.get("activeModelId")
        if not active_model_id:
             raise HTTPException(status_code=400, detail="No active AI model selected. Please configure an AI model in Settings.")
             
        stmt = select(AIModel).where(AIModel.id == active_model_id)
        result = await session.execute(stmt)
        active_model = result.scalar_one_or_none()
        
        if not active_model:
            raise HTTPException(status_code=400, detail="Invalid Active Model ID")
            
        provider = active_model.key_id
        configs = ai_settings.get("configs", {})
        provider_config = configs.get(provider, {})
        
        base_url = provider_config.get("baseUrl", "")
        api_key = provider_config.get("apiKey", "")
        model_id = provider_config.get("modelId") or active_model.id
        
        if provider == "openai":
            client = OpenAIClient(base_url, api_key)
        elif provider == "anthropic":
            client = AnthropicClient(base_url, api_key)
        elif provider == "google":
            client = GoogleClient(base_url, api_key)
        elif provider == "ollama":
            client = OllamaClient(base_url)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
            
        return client, model_id, False
