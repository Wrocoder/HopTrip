from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, Field

EventName = Literal["DEAL_VIEW", "AFFILIATE_CLICK", "SEARCH", "FILTER_USE"]


class AnalyticsEventCreate(BaseModel):
    event_name: EventName
    anonymous_session_id: str = Field(min_length=8, max_length=120)
    deal_slug: str | None = Field(default=None, max_length=220)
    component: str | None = Field(default=None, max_length=40)
    source: str | None = Field(default=None, max_length=80)
    metadata: dict[str, Any] = Field(default_factory=dict)


class AnalyticsEventAccepted(BaseModel):
    accepted: bool = True


class AnalyticsSummary(BaseModel):
    total_events: int
    by_event: dict[str, int]
    total_conversions: int = 0
    confirmed_commission_pln: Decimal = Decimal("0.00")
