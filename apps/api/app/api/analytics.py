from datetime import UTC, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.admin import require_admin
from app.config import get_settings
from app.db.session import get_db
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal
from app.schemas.analytics import AnalyticsEventAccepted, AnalyticsEventCreate, AnalyticsSummary

router = APIRouter(prefix="/api/v1", tags=["analytics"])


def _money(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _per_unit(value, units: int) -> Decimal:
    return _money(Decimal(str(value)) / units) if units else Decimal("0.00")


def _percent(numerator: int, denominator: int) -> Decimal:
    return _per_unit(numerator * 100, denominator)


@router.post("/analytics/events", response_model=AnalyticsEventAccepted, status_code=202)
def record_event(payload: AnalyticsEventCreate, db: Session = Depends(get_db)):
    deal_id = None
    if payload.deal_slug:
        deal_id = db.scalar(select(Deal.id).where(Deal.slug == payload.deal_slug))
        if deal_id is None:
            raise HTTPException(404, "Deal not found")
    # Arbitrary client metadata is discarded; keep only bounded campaign context.
    metadata = {k: str(v)[:80] for k, v in payload.metadata.items() if k in {"campaign"}}
    event = AnalyticsEvent(
        event_id=payload.event_id,
        event_name=payload.event_name,
        anonymous_session_id=payload.anonymous_session_id,
        deal_id=deal_id,
        component=payload.component,
        source=payload.source,
        metadata_json=metadata,
    )
    try:
        with db.begin_nested():
            db.add(event)
            db.flush()
        db.commit()
    except IntegrityError:
        if not payload.event_id or not db.scalar(
            select(AnalyticsEvent.id).where(AnalyticsEvent.event_id == payload.event_id)
        ):
            raise
    return AnalyticsEventAccepted()


@router.get(
    "/admin/analytics/summary",
    response_model=AnalyticsSummary,
    dependencies=[Depends(require_admin)],
)
def analytics_summary(
    start: datetime | None = None, end: datetime | None = None, db: Session = Depends(get_db)
):
    for bound in (start, end):
        if bound and bound.tzinfo is None:
            raise HTTPException(422, "Use timezone-aware period bounds")
    end = end or datetime.now(UTC)
    start = start or end - timedelta(days=get_settings().analytics_retention_days)
    if start and start >= end:
        raise HTTPException(422, "start must precede end")

    def window(column):
        return [column < end] + ([column >= start] if start else [])

    events = list(db.scalars(select(AnalyticsEvent).where(*window(AnalyticsEvent.created_at))))
    clicks = list(
        db.scalars(
            select(AffiliateClick).where(
                AffiliateClick.status == "REDIRECTED", *window(AffiliateClick.created_at)
            )
        )
    )
    conversions = list(
        db.scalars(
            select(AffiliateConversion).where(
                *window(
                    func.coalesce(AffiliateConversion.occurred_at, AffiliateConversion.created_at)
                )
            )
        )
    )
    sessions = {e.anonymous_session_id for e in events}
    views = [e for e in events if e.event_name == "DEAL_VIEW"]
    view_sessions = {e.anonymous_session_id for e in views}
    click_sessions = {c.anonymous_session_id for c in clicks}
    confirmed = [c for c in conversions if c.status == "CONFIRMED"]
    pln = [c for c in confirmed if c.currency == "PLN"]
    revenue = sum((c.commission or Decimal(0) for c in pln), Decimal(0))
    by_event: dict[str, int] = {}
    by_provider: dict[str, Decimal] = {}
    by_category: dict[str, Decimal] = {}
    by_deal: dict[str, Decimal] = {}
    for event in events:
        by_event[event.event_name] = by_event.get(event.event_name, 0) + 1
    for conversion in pln:
        value = conversion.commission or Decimal(0)
        by_provider[conversion.provider_code] = (
            by_provider.get(conversion.provider_code, Decimal(0)) + value
        )
        by_category[conversion.booking_category] = (
            by_category.get(conversion.booking_category, Decimal(0)) + value
        )
        deal = db.get(Deal, conversion.deal_id) if conversion.deal_id else None
        if deal:
            by_deal[deal.slug] = by_deal.get(deal.slug, Decimal(0)) + value
    attributed = sum(c.click_id is not None for c in conversions)
    return AnalyticsSummary(
        total_events=len(events),
        by_event=by_event,
        total_sessions=len(sessions),
        total_deal_views=len(views),
        total_affiliate_clicks=len(clicks),
        total_conversions=len(conversions),
        confirmed_bookings=len(confirmed),
        confirmed_commission_pln=_money(revenue),
        affiliate_ctr_percent=_percent(len(clicks), len(views)),
        session_ctr_percent=_percent(len(view_sessions & click_sessions), len(view_sessions)),
        booking_conversion_percent=_percent(
            sum(c.click_id is not None for c in confirmed), len(clicks)
        ),
        attributed_conversions=attributed,
        unattributed_conversions=len(conversions) - attributed,
        revenue_per_session_pln=_per_unit(revenue, len(sessions)),
        revenue_per_affiliate_click_pln=_per_unit(revenue, len(clicks)),
        revenue_per_1000_sessions_pln=_per_unit(revenue * 1000, len(sessions)),
        revenue_by_provider_pln=by_provider,
        revenue_by_category_pln=by_category,
        revenue_by_deal_pln=by_deal,
    )
