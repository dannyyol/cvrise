from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"

class AppSettings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    API_PREFIX: str

    HOST: str
    PORT: int

    DEBUG: bool

    CORS_ALLOWED_ORIGINS: List[str]

    CLIENT_BASE_URL: str
    PDF_CLIENT_BASE_URL: Optional[str] = None
    TOKEN_TTL_SECONDS: int = Field(default=300)

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    RESET_TOKEN_EXPIRE_MINUTES: int
    VERIFY_TOKEN_EXPIRE_HOURS: int
    
    DATABASE_URL: str
    
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    PLATFORM_OPENAI_API_KEY: Optional[str] = None
    PLATFORM_OPENAI_MODEL: str = "gpt-4o"
    PLATFORM_ANTHROPIC_API_KEY: Optional[str] = None
    PLATFORM_ANTHROPIC_MODEL: str = "claude-3-opus-20240229"
    PLATFORM_GEMINI_API_KEY: Optional[str] = None
    PLATFORM_GEMINI_MODEL: str = "gemini-1.5-pro"
    
    COST_CV_REVIEW: int = 20
    COST_GENERATE_COVER_LETTER: int = 10
    COST_TAILOR_RESUME: int = 15
    COST_PARSE_RESUME: int = 15

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    def _split_csv(cls, v):
        """
        Allows CORS_ALLOWED_ORIGINS to be configured as a comma-separated string:
        CORS_ALLOWED_ORIGINS=http://a.com,http://b.com
        """
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    return AppSettings()

settings = get_settings()
