from typing import Optional


DEFAULT_AI_BASE_URLS: dict[str, str] = {
    "openai": "https://api.openai.com/v1",
    "anthropic": "https://api.anthropic.com",
    "google": "https://generativelanguage.googleapis.com",
    "ollama": "http://localhost:11434",
}

DEFAULT_AI_MODEL_IDS: dict[str, str] = {
    "openai": "gpt-4o",
    "anthropic": "claude-sonnet-4-6",
    "google": "gemini-1.5-pro",
    "ollama": "llama3.1",
}

MODEL_ID_ALIASES: dict[str, dict[str, str]] = {
    "anthropic": {
        "claude-3-5-sonnet": "claude-sonnet-4-6",
    },
}


def get_default_ai_base_url(provider: str) -> Optional[str]:
    return DEFAULT_AI_BASE_URLS.get(provider)


def resolve_ai_base_url(provider: str, base_url: Optional[str]) -> str:
    candidate = str(base_url or "").strip()
    if candidate:
        return candidate
    return str(get_default_ai_base_url(provider) or "").strip()


def get_default_ai_model_id(provider: str) -> Optional[str]:
    return DEFAULT_AI_MODEL_IDS.get(provider)


def resolve_ai_model_id(provider: str, model_id: Optional[str], fallback_model_id: Optional[str] = None) -> str:
    candidate = str(model_id or "").strip()
    if candidate:
        aliases = MODEL_ID_ALIASES.get(provider) or {}
        return str(aliases.get(candidate) or candidate).strip()
    if provider == "anthropic":
        default = str(get_default_ai_model_id(provider) or "").strip()
        if default:
            return default
    if provider == "ollama":
        return str(get_default_ai_model_id(provider) or "").strip()
    fallback = str(fallback_model_id or "").strip()
    if fallback:
        return fallback
    return str(get_default_ai_model_id(provider) or "").strip()

