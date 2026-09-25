"""Refresh approved Aviasales links without logging tokens or provider payloads."""

import asyncio
from dataclasses import dataclass
from urllib.parse import parse_qs, urlsplit

import httpx
from app.config import get_settings
from app.models.affiliate import AffiliateProgram, AffiliateProvider
from app.models.deal import Deal, DealComponent
from app.models.offer import TravelOffer
from app.providers.base import ProviderNotConfigured, ProviderPermanentError, ProviderTransientError
from app.providers.travelpayouts import _retry_after
from app.services.availability import available_deals_query
from sqlalchemy import select
from sqlalchemy.orm import Session


def source_url(link: object) -> str:
    if not isinstance(link, str) or not link.startswith("/search/"):
        raise ValueError("Invalid source link")
    if any(ord(c) < 32 or c == "\\" for c in link):
        raise ValueError("Invalid source link")
    url = "https://www.aviasales.com" + link
    if urlsplit(url).fragment:
        raise ValueError("Invalid source fragment")
    return url


def same_url(first: str, second: str) -> bool:
    a, b = urlsplit(first), urlsplit(second)
    return (a.scheme, a.netloc, a.path, a.fragment, parse_qs(a.query, keep_blank_values=True)) == (
        b.scheme,
        b.netloc,
        b.path,
        b.fragment,
        parse_qs(b.query, keep_blank_values=True),
    )


def valid_partner(url: object, direct: str, marker: int, project: int) -> bool:
    if not isinstance(url, str) or any(ord(c) < 32 or c == "\\" for c in url):
        return False
    try:
        parsed = urlsplit(url)
        query = parse_qs(parsed.query)
        return (
            parsed.scheme == "https"
            and parsed.netloc == "tp.media"
            and parsed.path == "/r"
            and not parsed.fragment
            and query.get("marker") == [str(marker)]
            and query.get("trs") == [str(project)]
            and len(query.get("u", [])) == 1
            and same_url(query["u"][0], direct)
        )
    except ValueError:
        return False


@dataclass
class LinkSyncResult:
    enabled: bool = False
    updated: int = 0
    unchanged: int = 0
    invalid_sources: int = 0


async def sync_partner_links(
    db: Session, *, transport: httpx.AsyncBaseTransport | None = None
) -> LinkSyncResult:
    settings = get_settings()
    result = LinkSyncResult(enabled=settings.travelpayouts_links_enabled)
    if not result.enabled:
        return result
    marker, project = settings.travelpayouts_marker, settings.travelpayouts_project_id
    if not settings.travelpayouts_api_token or not marker or not project:
        raise ProviderNotConfigured("Partner link credentials are incomplete")
    program = db.scalar(
        select(AffiliateProgram)
        .join(AffiliateProvider)
        .where(
            AffiliateProvider.code == "travelpayouts",
            AffiliateProgram.code == "aviasales",
            AffiliateProvider.is_active.is_(True),
            AffiliateProgram.is_active.is_(True),
            AffiliateProvider.onboarding_status == "APPROVED",
            AffiliateProgram.onboarding_status == "APPROVED",
        )
    )
    if program is None:
        raise ProviderNotConfigured("Aviasales program is not approved and active")
    provider = db.get(AffiliateProvider, program.provider_id)
    if (
        provider is None
        or "AFFILIATE_LINK" not in provider.capabilities_json
        or "AFFILIATE_LINK" not in program.capabilities_json
        or "tp.media" not in program.allowed_hosts
        or program.adapter_code != "stored_link"
        or program.tracking_param is not None
    ):
        raise ProviderNotConfigured("Unsupported Aviasales link policy")
    active_ids = available_deals_query().with_only_columns(Deal.id)
    rows = db.execute(
        select(DealComponent, TravelOffer)
        .join(TravelOffer, DealComponent.travel_offer_id == TravelOffer.id)
        .where(
            DealComponent.deal_id.in_(active_ids),
            DealComponent.component_type == "FLIGHT",
            TravelOffer.source == "travelpayouts_data",
        )
        .order_by(DealComponent.id)
    ).all()
    pending: list[tuple[DealComponent, str]] = []
    for component, offer in rows:
        # Explicit manual binding to another program takes precedence.
        if component.affiliate_program_id not in (None, program.id):
            continue
        metadata = dict(component.metadata_json or {})
        try:
            direct = source_url(offer.raw_payload.get("link"))
        except ValueError:
            metadata.pop("outbound_url", None)
            component.metadata_json = metadata
            result.invalid_sources += 1
            continue
        if component.affiliate_program_id == program.id and valid_partner(
            metadata.get("outbound_url"), direct, marker, project
        ):
            result.unchanged += 1
            continue
        # An old URL must not keep advertising previous dates/prices if conversion fails.
        metadata.pop("outbound_url", None)
        component.metadata_json = metadata
        pending.append((component, direct))
    db.commit()
    async with httpx.AsyncClient(timeout=30, transport=transport, follow_redirects=False) as client:
        for start in range(0, len(pending), 10):
            if start:
                await asyncio.sleep(0.7)  # Below 100 requests/minute; pipeline lock is shared.
            batch = pending[start : start + 10]
            requested = {direct for _, direct in batch}
            try:
                response = await client.post(
                    "https://api.travelpayouts.com/links/v1/create",
                    headers={"X-Access-Token": settings.travelpayouts_api_token},
                    json={
                        "trs": project,
                        "marker": marker,
                        "shorten": False,
                        "links": [{"url": direct} for direct in sorted(requested)],
                    },
                )
            except httpx.TransportError:
                raise ProviderTransientError("Partner links transport failure") from None
            if response.status_code == 429 or response.status_code >= 500:
                raise ProviderTransientError(
                    f"Partner links HTTP {response.status_code}",
                    _retry_after(response.headers.get("Retry-After")),
                )
            if response.status_code != 200:
                raise ProviderPermanentError(f"Partner links HTTP {response.status_code}")
            try:
                body = response.json()
                if body.get("code") != "success":
                    raise ValueError
                converted: dict[str, str] = {}
                for item in body["result"]["links"]:
                    direct, partner = item["url"], item["partner_url"]
                    if (
                        item["code"] != "success"
                        or direct not in requested
                        or not valid_partner(partner, direct, marker, project)
                    ):
                        raise ValueError
                    converted[direct] = partner
                if set(converted) != requested:
                    raise ValueError
            except (ValueError, TypeError, KeyError, AttributeError):
                raise ProviderPermanentError("Invalid partner links response") from None
            for component, direct in batch:
                component.affiliate_program_id = program.id
                component.metadata_json = {
                    **(component.metadata_json or {}),
                    "outbound_url": converted[direct],
                }
                result.updated += 1
            db.commit()
    return result
