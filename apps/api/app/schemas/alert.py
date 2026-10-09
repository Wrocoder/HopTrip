import re
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AlertFilters(BaseModel):
    model_config = ConfigDict(extra="forbid")
    origin: str = Field(min_length=3, max_length=240)
    budget: Decimal = Field(gt=0, le=1000000)
    duration_min: int = Field(default=0, ge=0, le=365)
    duration_max: int = Field(default=14, ge=0, le=365)
    destination: str | None = Field(default=None, max_length=160)
    departure_from: date | None = None
    departure_to: date | None = None

    @model_validator(mode="after")
    def ranges(self):
        if self.duration_min > self.duration_max:
            raise ValueError("Invalid duration range")
        if self.departure_from and self.departure_to and self.departure_from > self.departure_to:
            raise ValueError("Invalid departure range")
        return self


class AlertSignup(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(max_length=254)
    filters: AlertFilters
    consent: Literal[True]

    @field_validator("email")
    @classmethod
    def email_address(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+", value):
            raise ValueError("Enter a valid email address")
        return value


class AlertToken(BaseModel):
    token: str = Field(min_length=64, max_length=160)


class AlertUpdate(AlertToken):
    filters: AlertFilters
