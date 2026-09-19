from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.deal import Deal, DealComponent

router = APIRouter(tags=["affiliate"])


@router.get("/go/{slug}/{component}")
def outbound_click(
    slug: str,
    component: str,
    session_id: str = Query("anonymous-session", min_length=8, max_length=120),
    source: str | None = Query(None, max_length=80),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    deal = db.scalar(
        select(Deal).where(
            Deal.slug == slug,
            Deal.is_visible.is_(True),
            Deal.status == "ACTIVE",
        )
    )
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")

    normalized_component = component.upper()
    deal_component = db.scalar(
        select(DealComponent).where(
            DealComponent.deal_id == deal.id,
            func.upper(DealComponent.component_type) == normalized_component,
        )
    )
    if deal_component is None:
        raise HTTPException(status_code=404, detail="Deal component not found")

    outbound_url = (deal_component.metadata_json or {}).get("outbound_url")
    parsed = urlparse(outbound_url) if isinstance(outbound_url, str) else None
    settings = get_settings()
    allowed_hosts = {
        host.strip().lower()
        for host in settings.affiliate_allowed_hosts.split(",")
        if host.strip()
    }
    host = parsed.hostname.lower() if parsed and parsed.hostname else None
    if (
        parsed is None
        or parsed.scheme != "https"
        or not host
        or parsed.username
        or parsed.password
        or host not in allowed_hosts
    ):
        click_status = "REJECTED"
    else:
        click_status = "REDIRECTED"

    click = AffiliateClick(
        deal_id=deal.id,
        component_type=normalized_component,
        anonymous_session_id=session_id,
        source=source,
        status=click_status,
        outbound_host=host,
    )
    db.add(click)
    db.flush()
    redirect_url = outbound_url
    tracking_id = None
    tracking_param = settings.affiliate_tracking_query_param.strip()
    if click_status == "REDIRECTED" and tracking_param:
        tracking_id = f"hoptrip-{click.id}"
        click.tracking_id = tracking_id
        query = [(key, value) for key, value in parse_qsl(parsed.query, keep_blank_values=True) if key != tracking_param]
        query.append((tracking_param, tracking_id))
        redirect_url = urlunparse(parsed._replace(query=urlencode(query)))
    db.add(
        AnalyticsEvent(
            event_name="AFFILIATE_CLICK",
            anonymous_session_id=session_id,
            deal_id=deal.id,
            component=normalized_component,
            source=source,
            metadata_json={"status": click_status, "tracking_id": tracking_id},
        )
    )
    db.commit()

    if click_status != "REDIRECTED":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Affiliate link is not configured for this component",
        )
    return RedirectResponse(url=redirect_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
