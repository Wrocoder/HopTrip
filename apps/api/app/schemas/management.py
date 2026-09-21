from typing import Literal

from app.models.affiliate import ProviderCapability
from app.schemas.affiliate import OnboardingUpdate
from pydantic import BaseModel, Field, field_validator


class ProgramUpdate(OnboardingUpdate):
    capabilities_json: list[ProviderCapability] | None = Field(None, max_length=20)
    allowed_hosts: list[str] | None = Field(None, max_length=20)
    tracking_param: str | None = Field(None, pattern=r"^[a-zA-Z][a-zA-Z0-9_]{0,39}$")
    adapter_code: Literal["stored_link"] | None = None

    @field_validator("allowed_hosts")
    @classmethod
    def hosts(cls, value):
        if value is not None:
            import re

            if any(
                not re.fullmatch(r"[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?", h)
                for h in value
            ):
                raise ValueError("Expected exact hostname without URL, port or wildcard")
            return [h.lower() for h in value]
        return value


class ProgramCreate(ProgramUpdate):
    provider_id: int = Field(ge=1)
    code: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9_-]+$")
    name: str = Field(min_length=1, max_length=160)


class ComponentUpdate(BaseModel):
    affiliate_program_id: int | None = Field(None, ge=1)
    outbound_url: str | None = Field(None, max_length=4000)


class DealUpdate(BaseModel):
    is_visible: bool | None = None
    is_featured: bool | None = None
