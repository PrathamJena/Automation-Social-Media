import secrets
import warnings

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache

# Value that must never be used to sign real tokens.
INSECURE_SECRET = "change_this_to_a_random_64_char_string"


class Settings(BaseSettings):
    APP_NAME: str = "AakSidhi Automation"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    # No usable default on purpose. In development an ephemeral key is
    # generated (sessions reset on restart); in production the app refuses
    # to start unless SECRET_KEY is set properly.
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aksidhi"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    REDIS_CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "aksidhi-media"
    S3_REGION: str = "us-east-1"
    S3_USE_SSL: bool = False
    S3_PROVIDER: str = "minio"

    FACEBOOK_CLIENT_ID: str = ""
    FACEBOOK_CLIENT_SECRET: str = ""
    FACEBOOK_REDIRECT_URI: str = "http://localhost:8000/api/social-accounts/facebook/callback"

    INSTAGRAM_CLIENT_ID: str = ""
    INSTAGRAM_CLIENT_SECRET: str = ""
    INSTAGRAM_REDIRECT_URI: str = "http://localhost:8000/api/social-accounts/instagram/callback"

    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/api/social-accounts/linkedin/callback"

    WHATSAPP_CLIENT_ID: str = ""
    WHATSAPP_CLIENT_SECRET: str = ""
    WHATSAPP_REDIRECT_URI: str = "http://localhost:8000/api/social-accounts/whatsapp/callback"

    AI_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3.5:4b"
    OLLAMA_VISION_MODEL: str = "llava"

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@aksidhi.com"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()

    is_production = settings.APP_ENV.lower() in {"production", "prod"}

    if not settings.SECRET_KEY or settings.SECRET_KEY == INSECURE_SECRET:
        if is_production:
            raise RuntimeError(
                "SECRET_KEY must be set to a unique random value in production. "
                "Generate one with:\n"
                "  python -c \"import secrets; print(secrets.token_urlsafe(64))\"\n"
                "Then set SECRET_KEY in your .env file."
            )

        # Development convenience: a random key per process. This keeps
        # nothing predictable in the source tree, and sessions simply
        # expire when the container restarts.
        settings.SECRET_KEY = secrets.token_urlsafe(64)
        warnings.warn(
            "SECRET_KEY is not set. Generated an ephemeral development key; "
            "all sessions will be invalidated on restart. Set SECRET_KEY in .env "
            "to keep sessions across restarts.",
            RuntimeWarning,
            stacklevel=2,
        )

    if is_production and len(settings.SECRET_KEY) < 32:
        raise RuntimeError("SECRET_KEY must be at least 32 characters in production.")

    return settings
