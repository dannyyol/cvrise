import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.api.routes.ai_models.model_routes import get_provider_defaults
from src.services.ai.ai_provider_registry_service import (
    DEFAULT_AI_BASE_URLS,
    DEFAULT_AI_MODEL_IDS,
    resolve_ai_model_id,
)


def test_provider_defaults_endpoint_returns_registry_values():
    result = asyncio.run(get_provider_defaults())
    assert result == {"baseUrls": DEFAULT_AI_BASE_URLS, "modelIds": DEFAULT_AI_MODEL_IDS}


def test_resolve_ai_model_id_alias_and_defaults():
    assert resolve_ai_model_id("anthropic", "claude-3-5-sonnet") == "claude-sonnet-4-6"
    assert resolve_ai_model_id("anthropic", None) == "claude-sonnet-4-6"
    assert resolve_ai_model_id("openai", None, fallback_model_id="gpt-4o") == "gpt-4o"

