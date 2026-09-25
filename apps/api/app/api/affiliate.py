from urllib.parse import urlsplit
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.deal import Deal, DealComponent
from app.services.affiliate import component_policy
from app.services.availability import available_deals_query

router = APIRouter(tags=["affiliate"])


@router.get("/go/{slug}/{component}")
def outbound_click(
    slug: str,
    component: str,
    session_id: str | None = Query(None, min_length=8, max_length=120),
    source: str | None = Query(None, max_length=80),
    campaign: str | None = Query(None, max_length=80),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    deal = db.scalar(available_deals_query().where(Deal.slug == slug))
    if deal is None:
        raise HTTPException(404, "Deal not found")
    part = db.scalar(
        select(DealComponent).where(
            DealComponent.deal_id == deal.id,
            func.upper(DealComponent.component_type) == component.upper(),
        )
    )
    if part is None:
        raise HTTPException(404, "Deal component not found")
    policy = component_policy(db, part)
    if not policy.available:
        raise HTTPException(503, policy.reason)
    analytics_consent = session_id is not None
    session_id = session_id or "not-provided"
    if not analytics_consent:
        source = campaign = None
    tracking_id = "ht-" + uuid4().hex
    policy = component_policy(db, part, tracking_id)
    if not policy.url or not policy.program or not policy.provider:
        raise HTTPException(503, "Affiliate link unavailable")
    db.add(
        AffiliateClick(
            deal_id=deal.id,
            component_type=component.upper(),
            anonymous_session_id=session_id,
            source=source,
            campaign=campaign,
            status="REDIRECTED",
            outbound_host=urlsplit(policy.url).hostname,
            program_id=policy.program.id,
            provider_id=policy.provider.id,
            tracking_id=tracking_id if policy.program.tracking_param else None,
        )
    )
    if analytics_consent:
        db.add(
            AnalyticsEvent(
                event_id=str(uuid4()),
                event_name="AFFILIATE_CLICK",
                anonymous_session_id=session_id,
                deal_id=deal.id,
                component=component.upper(),
                source=source,
                metadata_json={"campaign": campaign},
            )
        )
    db.commit()
    return RedirectResponse(policy.url, status_code=307, headers={"Cache-Control": "no-store"})
