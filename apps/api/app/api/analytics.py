from decimal import ROUND_HALF_UP, Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.admin import require_admin
from app.db.session import get_db
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal
from app.schemas.analytics import AnalyticsEventAccepted, AnalyticsEventCreate, AnalyticsSummary

router = APIRouter(prefix="/api/v1", tags=["analytics"])


def _money(value: Decimal | int | None) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _per_unit(value: Decimal, units: int) -> Decimal:
    if units <= 0:
        return Decimal("0.00")
    return _money(value / Decimal(units))


def _percent(numerator: int, denominator: int) -> Decimal:
    if denominator <= 0:
        return Decimal("0.00")
    return _money(Decimal(numerator) * Decimal(100) / Decimal(denominator))


@router.post(
    "/analytics/events",
    response_model=AnalyticsEventAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
def record_event(payload: AnalyticsEventCreate, db: Session = Depends(get_db)) -> AnalyticsEventAccepted:
    deal_id = None
    if payload.deal_slug:
        deal = db.scalar(select(Deal.id).where(Deal.slug == payload.deal_slug))
        if deal is None:
            raise HTTPException(status_code=404, detail="Deal not found")
        deal_id = deal
    db.add(
        AnalyticsEvent(
            event_name=payload.event_name,
            anonymous_session_id=payload.anonymous_session_id,
            deal_id=deal_id,
            component=payload.component,
            source=payload.source,
            metadata_json=payload.metadata,
        )
    )
    db.commit()
    return AnalyticsEventAccepted()


@router.get("/admin/analytics/summary", response_model=AnalyticsSummary, dependencies=[Depends(require_admin)])
def analytics_summary(db: Session = Depends(get_db)) -> AnalyticsSummary:
    total_events = db.scalar(select(func.count(AnalyticsEvent.id))) or 0
    total_sessions = (
        db.scalar(select(func.count(func.distinct(AnalyticsEvent.anonymous_session_id)))) or 0
    )
    total_deal_views = db.scalar(
        select(func.count(AnalyticsEvent.id)).where(AnalyticsEvent.event_name == "DEAL_VIEW")
    ) or 0
    total_affiliate_clicks = db.scalar(
        select(func.count(AffiliateClick.id)).where(AffiliateClick.status == "REDIRECTED")
    ) or 0
    total_conversions = db.scalar(select(func.count(AffiliateConversion.id))) or 0
    confirmed_bookings = db.scalar(
        select(func.count(AffiliateConversion.id)).where(AffiliateConversion.status == "CONFIRMED")
    ) or 0
    confirmed_commission_pln = (
        db.scalar(
            select(func.coalesce(func.sum(AffiliateConversion.commission), 0)).where(
                AffiliateConversion.status == "CONFIRMED",
                AffiliateConversion.currency == "PLN",
            )
        )
        or 0
    )
    confirmed_commission_pln = _money(confirmed_commission_pln)
    rows = db.execute(
        select(AnalyticsEvent.event_name, func.count(AnalyticsEvent.id)).group_by(AnalyticsEvent.event_name)
    )
    revenue_filters = (
        AffiliateConversion.status == "CONFIRMED",
        AffiliateConversion.currency == "PLN",
    )
    provider_rows = db.execute(
        select(
            AffiliateConversion.provider_code,
            func.coalesce(func.sum(AffiliateConversion.commission), 0),
        )
        .where(*revenue_filters)
        .group_by(AffiliateConversion.provider_code)
    )
    category_rows = db.execute(
        select(
            AffiliateConversion.booking_category,
            func.coalesce(func.sum(AffiliateConversion.commission), 0),
        )
        .where(*revenue_filters)
        .group_by(AffiliateConversion.booking_category)
    )
    deal_rows = db.execute(
        select(Deal.slug, func.coalesce(func.sum(AffiliateConversion.commission), 0))
        .join(AffiliateConversion, AffiliateConversion.deal_id == Deal.id)
        .where(*revenue_filters)
        .group_by(Deal.slug)
    )
    return AnalyticsSummary(
        total_events=total_events,
        by_event={name: count for name, count in rows},
        total_sessions=total_sessions,
        total_deal_views=total_deal_views,
        total_affiliate_clicks=total_affiliate_clicks,
        confirmed_bookings=confirmed_bookings,
        affiliate_ctr_percent=_percent(total_affiliate_clicks, total_deal_views),
        booking_conversion_percent=_percent(confirmed_bookings, total_affiliate_clicks),
        revenue_per_session_pln=_per_unit(confirmed_commission_pln, total_sessions),
        revenue_per_affiliate_click_pln=_per_unit(confirmed_commission_pln, total_affiliate_clicks),
        revenue_per_1000_sessions_pln=_money(
            _per_unit(confirmed_commission_pln, total_sessions) * Decimal(1000)
        ),
        total_conversions=total_conversions,
        confirmed_commission_pln=confirmed_commission_pln,
        revenue_by_provider_pln={name: _money(value) for name, value in provider_rows},
        revenue_by_category_pln={name: _money(value) for name, value in category_rows},
        revenue_by_deal_pln={slug: _money(value) for slug, value in deal_rows},
    )
