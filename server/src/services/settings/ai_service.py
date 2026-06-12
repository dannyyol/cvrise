from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from typing import Dict, Any, Optional, Tuple
from urllib.parse import urlsplit

from src.models.settings import Setting
from src.models.ai_model import AIModel
from src.api.schemas.ai_settings import AISettingsUpdate
from src.services.ai.ai_clients_service import (
    AsyncLLMClient, OpenAIClient, AnthropicClient, GoogleClient, OllamaClient
)
from src.services.ai.ai_provider_registry_service import resolve_ai_base_url, resolve_ai_model_id
from src.config import get_settings

class AISettingsService:
    def __init__(self, session: AsyncSession, user_id: str):
        self.session = session
        self.user_id = user_id

    async def get_ai_settings(self) -> Dict[str, Any]:
        result = await self.session.execute(select(Setting).where(Setting.user_id == self.user_id, Setting.key == 'ai_config'))
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
        
        result = await self.session.execute(select(Setting).where(Setting.user_id == self.user_id, Setting.key == 'ai_config'))
        existing_setting = result.scalar_one_or_none()
        if settings_data.usageMode == 'custom':
            base_url = resolve_ai_base_url(model.key_id, provider_config.get('baseUrl'))
            model_id = resolve_ai_model_id(model.key_id, provider_config.get('modelId'), model.id)
            api_key = str(provider_config.get('apiKey') or '').strip()

            if not base_url:
                validation_errors['baseUrl'] = "Base URL is required"
            else:
                parsed = urlsplit(base_url)
                if parsed.scheme.lower() not in {"http", "https"} or not parsed.netloc:
                    validation_errors['baseUrl'] = "Base URL must be a valid http(s) URL (e.g. https://api.openai.com/v1)"

            if not model_id:
                validation_errors['modelId'] = "Model ID is required"

            if model.key_id != 'ollama' and not api_key:
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
            new_setting = Setting(user_id=self.user_id, key='ai_config', value=value_to_store)
            self.session.add(new_setting)
            await self.session.commit()
            await self.session.refresh(new_setting)
            return new_setting.value

async def get_configured_ai_client(session: AsyncSession, user_id: str) -> Tuple[AsyncLLMClient, str, bool]:
    """
    Returns (client, model_id, is_platform_mode)
    """
    stmt = select(Setting).where(Setting.user_id == user_id, Setting.key == "ai_config")
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
        
        base_url = resolve_ai_base_url(provider, provider_config.get("baseUrl", ""))
        api_key = str(provider_config.get("apiKey", "") or "").strip()
        model_id = resolve_ai_model_id(provider, provider_config.get("modelId"), active_model.id)

        if not model_id:
            raise HTTPException(status_code=400, detail="No AI model configured. Please check your AI configuration settings.")

        if not base_url:
            raise HTTPException(status_code=400, detail="AI Base URL is missing. Please check your AI configuration settings.")

        if not (base_url.startswith("http://") or base_url.startswith("https://")):
            raise HTTPException(status_code=400, detail="AI Base URL must start with http:// or https://. Please check your AI configuration settings.")

        if provider != "ollama" and not api_key:
            raise HTTPException(status_code=400, detail="AI API key is missing. Please check your AI configuration settings.")
        
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
