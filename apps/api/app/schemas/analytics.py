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
    total_sessions: int = 0
    total_deal_views: int = 0
    total_affiliate_clicks: int = 0
    confirmed_bookings: int = 0
    affiliate_ctr_percent: Decimal = Decimal("0.00")
    booking_conversion_percent: Decimal = Decimal("0.00")
    revenue_per_session_pln: Decimal = Decimal("0.00")
    revenue_per_affiliate_click_pln: Decimal = Decimal("0.00")
    revenue_per_1000_sessions_pln: Decimal = Decimal("0.00")
    total_conversions: int = 0
    confirmed_commission_pln: Decimal = Decimal("0.00")
    revenue_by_provider_pln: dict[str, Decimal] = Field(default_factory=dict)
    revenue_by_category_pln: dict[str, Decimal] = Field(default_factory=dict)
    revenue_by_deal_pln: dict[str, Decimal] = Field(default_factory=dict)
