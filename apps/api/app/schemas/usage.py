from datetime import datetime
from decimal import Decimal
from typing import Literal

from app.schemas.analytics import AnalyticsLocale, AnalyticsViewport
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


FunnelStage = Literal["page_view", "search", "positive_results", "deal_view", "partner_click"]


class FunnelStep(BaseModel):
    key: FunnelStage
    sessions: int = Field(ge=0)
    previous_sessions: int | None = Field(default=None, ge=0)
    percent: Decimal | None = Field(default=None, ge=0, le=100)
    status: Literal["available", "no_data"]


class OrderedFunnel(BaseModel):
    version: Literal["ordered-session-funnel-v1"] = "ordered-session-funnel-v1"
    steps: list[FunnelStep]


class EngagementReport(BaseModel):
    version: Literal["received-session-engagement-v1"] = "received-session-engagement-v1"
    metrics: list[UsageMetric]


OriginKey = Literal[
    "WRO", "WAW", "WMI", "KRK", "GDN", "KTW", "POZ", "RZE", "SZZ", "LUZ",
    "BZG", "LCJ", "SZY", "RDO", "IEG", "WAW,WMI", "unknown",
]


class OriginCohort(BaseModel):
    origin: OriginKey
    sessions: int = Field(ge=0)
    percent: Decimal | None = Field(default=None, ge=0, le=100)
    metrics: list[UsageMetric]


class OriginCohortReport(BaseModel):
    version: Literal["first-search-origin-cohorts-v1"] = "first-search-origin-cohorts-v1"
    rows: list[OriginCohort]


LocaleKey = Literal[AnalyticsLocale, "unknown"]


class LocaleCohort(BaseModel):
    locale: LocaleKey
    sessions: int = Field(ge=0)
    percent: Decimal | None = Field(default=None, ge=0, le=100)
    metrics: list[UsageMetric]


class LocaleCohortReport(BaseModel):
    version: Literal["first-received-locale-cohorts-v1"] = "first-received-locale-cohorts-v1"
    rows: list[LocaleCohort]


ViewportKey = Literal[AnalyticsViewport, "unknown"]


class ViewportCohort(BaseModel):
    viewport: ViewportKey
    sessions: int = Field(ge=0)
    percent: Decimal | None = Field(default=None, ge=0, le=100)
    ordered_funnel: OrderedFunnel
    metrics: list[UsageMetric]


class ViewportCohortReport(BaseModel):
    version: Literal["first-received-viewport-cohorts-v1"] = "first-received-viewport-cohorts-v1"
    rows: list[ViewportCohort]


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
    ordered_funnel: OrderedFunnel | None = None
    engagement: EngagementReport | None = None
    origin_cohorts: OriginCohortReport | None = None
    locale_cohorts: LocaleCohortReport | None = None
    viewport_cohorts: ViewportCohortReport | None = None
