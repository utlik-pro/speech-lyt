from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SpeechLyt"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://speechlyt:speechlyt@localhost:5432/speechlyt"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # S3 Storage
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "speechlyt-audio"

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # Audio processing
    MAX_AUDIO_SIZE_MB: int = 500
    SUPPORTED_AUDIO_FORMATS: list[str] = ["wav", "mp3", "ogg", "flac"]
    AUDIO_RETENTION_DAYS: int = 90

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
