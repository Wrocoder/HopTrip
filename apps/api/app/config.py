from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HopTrip API"
    app_env: str = "development"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://hoptrip:hoptrip@localhost:5432/hoptrip"
    admin_token: str = "change-me-in-development"
    travelpayouts_api_token: str | None = None
    travelpayouts_api_base_url: str = "https://api.travelpayouts.com"
    travelpayouts_links_enabled: bool = False
    travelpayouts_marker: int = Field(default=0, ge=0)
    travelpayouts_project_id: int = Field(default=0, ge=0)
    ingestion_origins: str = "WRO,WAW,WMI,KRK,GDN,KTW,POZ"
    affiliate_allowed_hosts: str = ""
    affiliate_tracking_query_param: str = ""
    pipeline_max_attempts: int = Field(default=1, ge=1, le=5)
    pipeline_retry_delay_seconds: float = Field(default=5.0, ge=0, le=300)
    pipeline_interval_seconds: int = Field(default=3600, ge=60, le=86400)
    cors_origins: str = "http://localhost:3000"
    public_rate_limit: int = Field(default=120, ge=1, le=10000)
    provider_max_pages: int = Field(default=5, ge=1, le=100)
    analytics_retention_days: int = Field(default=90, ge=1, le=730)

    @model_validator(mode="after")
    def production_secrets(self):
        if self.app_env.lower() == "production":
            if (
                len(self.admin_token) < 32
                or self.admin_token == "change-me-in-development"
                or self.admin_token.startswith("replace-with-")
            ):
                raise ValueError(
                    "Production ADMIN_TOKEN must be a unique secret of at least 32 characters"
                )
            from sqlalchemy.engine import make_url

            password = make_url(self.database_url).password
            if (
                not password
                or password in {"hoptrip", "password", "change-me"}
                or password.startswith("replace-with-")
            ):
                raise ValueError("Production DATABASE_URL must use a non-default database password")
        return self

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
