from datetime import date
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator

EventName = Literal["PAGE_VIEW", "DEAL_IMPRESSION", "DEAL_VIEW", "SEARCH", "FILTER_USE", "ACTIVITY_CLICK", "SEARCH_RESULT", "PARTNER_CLICK", "BUDGET_USE", "TRIP_SAVE", "ALERT_CONFIRMED"]


class ActivityContext(BaseModel):
    city: str = Field(max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    activity_id: str = Field(max_length=100, pattern=r"^(?:tiqets-[0-9]+|official-[a-z0-9-]+)$")
    page: str = Field(max_length=240, pattern=r"^/(?:info|deals)/[a-z0-9-]+$")
    link_kind: Literal["affiliate", "official"]


class ActivityClickSummary(ActivityContext):
    clicks: int
    sessions: int


class SearchFilters(BaseModel):
    origin: str | None = Field(None, pattern=r"^(?:[A-Z]{3}|WAW,WMI)$")
    destination: str | None = Field(None, max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    departure_from: date | None = None
    departure_to: date | None = None
    budget: Decimal | None = Field(None, ge=0, le=1000000)
    duration_min: int | None = Field(None, ge=0, le=365)
    duration_max: int | None = Field(None, ge=0, le=365)
    offset: int | None = Field(None, ge=0, le=10000)
    weekend: bool | None = None


class SearchContext(BaseModel):
    filters: SearchFilters
    result_count: int | None = Field(None, ge=0, le=100)
    error: Literal["invalid_filters", "unavailable"] | None = None


class PartnerContext(BaseModel):
    category: Literal["flight", "stay", "activity"]
    provider: Literal["catalog", "stay22", "tiqets"]


class AnalyticsEventCreate(BaseModel):
    event_id: str | None = Field(None, pattern=r"^[a-fA-F0-9-]{36}$")
    event_name: EventName
    anonymous_session_id: str = Field(min_length=8, max_length=120)
    deal_slug: str | None = Field(default=None, max_length=220)
    component: str | None = Field(default=None, max_length=40)
    source: str | None = Field(default=None, max_length=80)
    metadata: dict[str, Any] = Field(default_factory=dict)
    activity: ActivityContext | None = None
    search: SearchContext | None = None
    partner: PartnerContext | None = None

    @field_validator("source")
    @classmethod
    def allowed_source(cls, value):
        return value if value in {"homepage", "google", "facebook", "instagram", "newsletter", "direct", "test"} else None

    @model_validator(mode="after")
    def activity_matches_event(self):
        if (self.event_name == "ACTIVITY_CLICK") != (self.activity is not None):
            raise ValueError("Activity context is required only for ACTIVITY_CLICK")
        if self.event_name == "SEARCH_RESULT":
            if self.search is None or (self.search.result_count is None) == (self.search.error is None):
                raise ValueError("Search result needs either a count or an error")
        if self.search and self.event_name not in {"SEARCH", "SEARCH_RESULT"}:
            raise ValueError("Search context only belongs to search events")
        if (self.event_name == "PARTNER_CLICK") != (self.partner is not None):
            raise ValueError("Partner context is required only for PARTNER_CLICK")
        return self


class AnalyticsEventAccepted(BaseModel):
    accepted: bool = True


class AnalyticsSummary(BaseModel):
    total_activity_clicks: int = 0
    activity_clicks: list[ActivityClickSummary] = Field(default_factory=list)
    session_ctr_percent: Decimal = Decimal("0.00")
    attributed_conversions: int = 0
    unattributed_conversions: int = 0
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
