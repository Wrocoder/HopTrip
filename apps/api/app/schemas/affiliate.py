from datetime import datetime

from app.models.affiliate import OnboardingStatus
from pydantic import BaseModel, ConfigDict, Field


class ProviderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    onboarding_status: str
    is_active: bool
    priority: int
    website_url: str | None = None
    last_health_check: datetime | None = None
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
