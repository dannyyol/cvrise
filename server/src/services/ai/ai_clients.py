import httpx
import re
import json
from typing import Protocol, Optional
from loguru import logger

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
            raise

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
            raise

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
            raise

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
            raise

def get_ai_client(provider: str, base_url: str, api_key: Optional[str] = None) -> AsyncLLMClient:
    if provider == "ollama":
        return OllamaClient(base_url)
    elif provider == "openai":
        if not api_key:
            raise ValueError("API Key required for OpenAI")
        return OpenAIClient(base_url, api_key)
    elif provider == "anthropic":
        if not api_key:
            raise ValueError("API Key required for Anthropic")
        return AnthropicClient(base_url, api_key)
    elif provider == "google":
        if not api_key:
            raise ValueError("API Key required for Google")
        return GoogleClient(base_url, api_key)
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")
