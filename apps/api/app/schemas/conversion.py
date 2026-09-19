from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

ConversionStatus = Literal["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]


class ConversionCreate(BaseModel):
    provider_code: str = Field(min_length=1, max_length=80)
    program_code: str | None = Field(default=None, max_length=80)
    provider_conversion_id: str = Field(min_length=1, max_length=160)
    click_id: int | None = Field(default=None, ge=1)
    deal_slug: str | None = Field(default=None, max_length=220)
    booking_category: str = Field(min_length=1, max_length=40)
    booking_value: Decimal | None = Field(default=None, ge=0)
    commission: Decimal | None = None
    currency: str = Field(default="PLN", min_length=3, max_length=3)
    status: ConversionStatus = "PENDING"
    occurred_at: datetime | None = None
    confirmed_at: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("provider_code", mode="before")
    @classmethod
    def normalize_provider_code(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("booking_category", mode="before")
    @classmethod
    def normalize_booking_category(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class ConversionUpsertResponse(BaseModel):
    id: int
    created: bool


class ConversionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_code: str
    program_code: str | None
    provider_conversion_id: str
    click_id: int | None
    deal_id: int | None
    booking_category: str
    booking_value: Decimal | None
    commission: Decimal | None
    currency: str
    status: str
    occurred_at: datetime | None
    confirmed_at: datetime | None
    metadata_json: dict[str, Any]
    created_at: datetime | None
