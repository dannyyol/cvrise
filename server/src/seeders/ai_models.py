from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.ai_model import AIModel
from src.seeders.base import BaseSeeder
import logging

logger = logging.getLogger(__name__)

INITIAL_MODELS = [
    {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro",
        "description": "Google's most capable AI model for highly complex tasks.",
        "provider": "Google",
        "key_id": "google",
    },
    {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "description": "OpenAI's flagship model, excellent for reasoning and coding.",
        "provider": "OpenAI",
        "key_id": "openai",
    },
    {
        "id": "claude-3-5-sonnet",
        "name": "Claude 3.5 Sonnet",
        "description": "Anthropic's most intelligent model, great for nuanced writing.",
        "provider": "Anthropic",
        "key_id": "anthropic",
    },
    {
        "id": "ollama",
        "name": "Ollama",
        "description": "Run open-source models locally.",
        "provider": "Ollama",
        "key_id": "ollama",
    },
]

class AIModelSeeder(BaseSeeder):
    async def run(self, session: AsyncSession) -> None:
        result = await session.execute(select(AIModel).where(AIModel.id == "llama-3"))
        old_model = result.scalar_one_or_none()
        if old_model:
            logger.info("Removing deprecated Llama 3 model")
            await session.delete(old_model)

        for model_data in INITIAL_MODELS:
            result = await session.execute(select(AIModel).where(AIModel.id == model_data["id"]))
            existing_model = result.scalar_one_or_none()
            
            if not existing_model:
                logger.info(f"Creating AI model: {model_data['name']}")
                model = AIModel(**model_data)
                session.add(model)
            else:
                logger.info(f"AI model already exists: {model_data['name']}")
                for key, value in model_data.items():
                    setattr(existing_model, key, value)
        
        await session.commit()
