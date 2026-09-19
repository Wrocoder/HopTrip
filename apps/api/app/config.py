from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HopTrip API"
    app_env: str = "development"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://hoptrip:hoptrip@localhost:5432/hoptrip"
    admin_token: str = "change-me-in-development"
    travelpayouts_api_token: str | None = None
    travelpayouts_api_base_url: str = "https://api.travelpayouts.com"
    ingestion_origins: str = "WRO,WAW,WMI,KRK,GDN,KTW,POZ"
    affiliate_allowed_hosts: str = ""
    pipeline_max_attempts: int = Field(default=1, ge=1, le=5)
    pipeline_retry_delay_seconds: float = Field(default=5.0, ge=0, le=300)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
