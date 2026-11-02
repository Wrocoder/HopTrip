from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class UsageMetric(BaseModel):
    key: str
    status: Literal["available", "no_data", "unavailable"]
    numerator: int | None = Field(default=None, ge=0)
    denominator: int | None = Field(default=None, ge=0)
    percent: Decimal | None = Field(default=None, ge=0, le=100)


class PageCohort(BaseModel):
    page_type: str
    sessions: int = Field(ge=0)
    partner_sessions: int | None = Field(default=None, ge=0)
    percent: Decimal | None = Field(default=None, ge=0, le=100)


class UsageReport(BaseModel):
    start: datetime
    end: datetime
    observed_events: int
    observed_sessions: int
    excluded_events: int
    invalid_results: int
    unlinked_detail_views: int
    metrics: list[UsageMetric]
    page_cohorts: list[PageCohort]
