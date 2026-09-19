from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.admin import require_admin
from app.db.session import get_db
from app.models.analytics import AnalyticsEvent
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal
from app.schemas.analytics import AnalyticsEventAccepted, AnalyticsEventCreate, AnalyticsSummary

router = APIRouter(prefix="/api/v1", tags=["analytics"])


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
    total_conversions = db.scalar(select(func.count(AffiliateConversion.id))) or 0
    confirmed_commission_pln = (
        db.scalar(
            select(func.coalesce(func.sum(AffiliateConversion.commission), 0)).where(
                AffiliateConversion.status == "CONFIRMED",
                AffiliateConversion.currency == "PLN",
            )
        )
        or 0
    )
    rows = db.execute(
        select(AnalyticsEvent.event_name, func.count(AnalyticsEvent.id)).group_by(AnalyticsEvent.event_name)
    )
    return AnalyticsSummary(
        total_events=total_events,
        by_event={name: count for name, count in rows},
        total_conversions=total_conversions,
        confirmed_commission_pln=confirmed_commission_pln,
    )
