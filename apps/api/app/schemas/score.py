from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class ScorePart(BaseModel):
    key: str
    points: Decimal = Field(ge=0, le=100, allow_inf_nan=False)
    max_points: int = Field(gt=0, le=100)


class ScoreExplanation(BaseModel):
    status: Literal["CURRENT", "PROVISIONAL", "LEGACY", "UNAVAILABLE"] = "UNAVAILABLE"
    parts: list[ScorePart] = Field(default_factory=list)
    total_before_rounding: Decimal | None = None
    sample_count: int | None = Field(default=None, ge=0)
    current_price_pln: Decimal | None = None
    median_price_pln: Decimal | None = None
    price_difference_percent: Decimal | None = None
    observed_at: datetime | None = None
    calculated_at: datetime | None = None
    observation_basis: Literal["SOURCE", "FIRST_SEEN"] | None = None
