from datetime import datetime
from typing import Literal

from app.models.affiliate import OnboardingStatus, ProviderCapability
from pydantic import BaseModel, ConfigDict, Field


class ProviderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    onboarding_status: str
    is_active: bool
    priority: int
    capabilities: list[str]
    website_url: str | None = None
    last_health_check: datetime | None = None
    last_health_check_error: str | None = None
    notes: str | None = None


class ProgramRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    code: str
    name: str
    onboarding_status: str
    is_active: bool
    applied_at: datetime | None = None
    approved_at: datetime | None = None
    notes: str | None = None


class OnboardingUpdate(BaseModel):
    onboarding_status: OnboardingStatus | None = None
    is_active: bool | None = None
    notes: str | None = Field(default=None, max_length=4000)


class ProviderUpdate(OnboardingUpdate):
    capabilities: list[ProviderCapability] | None = Field(default=None, max_length=20)


class ProviderHealthUpdate(BaseModel):
    success: bool
    error: str | None = Field(default=None, max_length=4000)
    checked_at: datetime | None = None


class SystemStatusRead(BaseModel):
    status: Literal["READY", "BLOCKED"]
    app_env: str
    provider_token_configured: bool
    affiliate_hosts_configured: bool
    affiliate_tracking_configured: bool
    blockers: list[str]
    warnings: list[str]
