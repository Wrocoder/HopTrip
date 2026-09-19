from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HopTrip API"
    app_env: str = "development"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://hoptrip:hoptrip@localhost:5432/hoptrip"
    admin_token: str = "change-me-in-development"
    travelpayouts_api_token: str | None = None
    travelpayouts_api_base_url: str = "https://api.travelpayouts.com"
    affiliate_allowed_hosts: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
