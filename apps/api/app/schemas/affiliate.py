from datetime import datetime

from pydantic import BaseModel, ConfigDict


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

