import httpx
from loguru import logger
from typing import Optional

class AIConnectionService:
    @staticmethod
    async def test_connection(provider: str, base_url: str, api_key: Optional[str], model_id: Optional[str]) -> bool:
        """
        Test connection to the AI provider.
        Returns True if connection is successful, False otherwise.
        """
        if not base_url:
            raise ValueError("Base URL is required")
            
        if not model_id:
            raise ValueError("Model ID is required")
            
        if provider != "ollama" and not api_key:
            raise ValueError("API Key is required")

        try:
            base_url = base_url.rstrip("/")
            
            logger.info(f"Testing connection for {provider} at {base_url}")

            async with httpx.AsyncClient(timeout=10.0) as client:
                if provider == "openai":
                    response = await client.get(
                        f"{base_url}/models",
                        headers={"Authorization": f"Bearer {api_key}"}
                    )
                    return response.status_code == 200
                
                elif provider == "anthropic":
                    
                    url = f"{base_url}/v1/models" if not base_url.endswith("/v1") else f"{base_url}/models"
                    
                    response = await client.get(
                        url,
                        headers={
                            "x-api-key": api_key,
                            "anthropic-version": "2023-06-01"
                        }
                    )
                    return response.status_code == 200

                elif provider == "google":
                    
                    if "/v1" in base_url:
                        url = f"{base_url}/models"
                    else:
                        url = f"{base_url}/v1beta/models"
                        
                    response = await client.get(url, params={"key": api_key})
                    return response.status_code == 200
                
                elif provider == "ollama":
                    response = await client.get(f"{base_url}/api/tags")
                    if response.status_code != 200:
                        return False
                    try:
                        data = response.json()
                        items = []
                        if isinstance(data, dict):
                            items = data.get("models") or data.get("tags") or []
                        elif isinstance(data, list):
                            items = data
                        names = []
                        for it in items:
                            if isinstance(it, dict):
                                name = it.get("name") or it.get("model") or ""
                                if name:
                                    names.append(name)
                            elif isinstance(it, str):
                                names.append(it)
                        target = str(model_id or "").strip()
                        if not target:
                            return False
                        exact = target in names
                        with_latest = f"{target}:latest" in names
                        return exact or with_latest
                    except Exception:
                        return False
                
                else:
                    logger.warning(f"Unknown provider for connection test: {provider}")
                    return False

        except Exception as e:
            logger.error(f"Connection test failed for {provider}: {e}")
            return False
