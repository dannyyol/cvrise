import httpx
import re
import json
from typing import Protocol, Optional
from loguru import logger


class AIConfigurationError(Exception):
    pass


class AIProviderError(Exception):
    pass


def _raise_ai_error(exc: Exception) -> None:
    if isinstance(exc, (httpx.UnsupportedProtocol, httpx.InvalidURL)):
        raise AIConfigurationError("Invalid AI Base URL. Please check your AI configuration settings.") from exc
    if isinstance(exc, httpx.HTTPStatusError):
        status_code = exc.response.status_code if exc.response is not None else None
        if status_code in {401, 403}:
            raise AIConfigurationError("AI authentication failed. Please check your AI API key in Settings.") from exc
        raise AIProviderError("AI provider returned an error. Please try again.") from exc
    if isinstance(exc, httpx.RequestError):
        raise AIProviderError("AI provider connection failed. Please check your AI configuration and try again.") from exc
    raise AIProviderError("AI request failed. Please try again.") from exc

class AsyncLLMClient(Protocol):
    async def generate(self, prompt: str, model: str) -> str:
        ...

class TextProcessor:
    @staticmethod
    def strip_code_fences(text: str) -> str:
        return re.sub(r"```(?:json)?\s*|\s*```", "", text, flags=re.IGNORECASE).strip()
    @staticmethod
    def extract_json(text: str) -> Optional[dict]:
        text = TextProcessor.strip_code_fences(text)
        start = text.find("{")
        if start == -1:
            return None
        stack = 0
        end = None
        for i in range(start, len(text)):
            ch = text[i]
            if ch == "{":
                stack += 1
            elif ch == "}":
                stack -= 1
                if stack == 0:
                    end = i + 1
                    break
        if end is None:
            return None
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            return None
    @staticmethod
    def safe_number(value, default: float = 0.0) -> float:
        try:
            num = float(value)
            if num < 0:
                return 0.0
            if num > 100:
                return 100.0
            return num
        except Exception:
            return default

class OllamaClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    async def generate(self, prompt: str, model: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(1200.0)) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={"model": model, "prompt": prompt, "stream": False},
                )
                response.raise_for_status()
                return response.json().get("response", "")
        except Exception as exc:
            logger.error(f"Ollama API call failed: {repr(exc)}")
            _raise_ai_error(exc)

class OpenAIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    async def generate(self, prompt: str, model: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as exc:
            logger.error("OpenAI API call failed: {}", str(exc))
            _raise_ai_error(exc)

class AnthropicClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    async def generate(self, prompt: str, model: str) -> str:
        try:
            url = f"{self.base_url}/v1/messages" if not self.base_url.endswith("/v1") else f"{self.base_url}/messages"
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    url,
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 4096,
                        "temperature": 0.2
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["content"][0]["text"]
        except Exception as exc:
            logger.error("Anthropic API call failed: {}", str(exc))
            _raise_ai_error(exc)

class GoogleClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    async def generate(self, prompt: str, model: str) -> str:
        try:
            version = "v1beta"
            if "/v1" in self.base_url:
                version = "v1"
                base = self.base_url.split("/v1")[0]
            elif "/v1beta" in self.base_url:
                version = "v1beta"
                base = self.base_url.split("/v1beta")[0]
            else:
                base = self.base_url

            url = f"{base}/{version}/models/{model}:generateContent"
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    url,
                    params={"key": self.api_key},
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}]
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as exc:
            logger.error("Google API call failed: {}", str(exc))
            _raise_ai_error(exc)

def get_ai_client(provider: str, base_url: str, api_key: Optional[str] = None) -> AsyncLLMClient:
    if provider == "ollama":
        return OllamaClient(base_url)
    elif provider == "openai":
        if not api_key:
            raise AIConfigurationError("AI API key is missing. Please check your AI configuration settings.")
        return OpenAIClient(base_url, api_key)
    elif provider == "anthropic":
        if not api_key:
            raise AIConfigurationError("AI API key is missing. Please check your AI configuration settings.")
        return AnthropicClient(base_url, api_key)
    elif provider == "google":
        if not api_key:
            raise AIConfigurationError("AI API key is missing. Please check your AI configuration settings.")
        return GoogleClient(base_url, api_key)
    else:
        raise AIConfigurationError(f"Unsupported AI provider: {provider}")
