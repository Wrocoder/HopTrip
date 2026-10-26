"""Enrich fresh cached offers without replacing or renewing their prices."""
from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime

from app.models.offer import TravelOffer
from app.providers.base import ProviderError
from app.providers.travelpayouts_routes import PAGE_SIZE, TravelpayoutsRouteProvider
from app.services.flight_routes import instant, ticket_key, validated_segments
from app.services.price_lifetime import fresh_price_clause
from sqlalchemy import select
from sqlalchemy.orm import Session


@dataclass
class RouteEnrichmentResult:
    attempted_offers: int = 0
    already_known: int = 0
    enriched: int = 0
    unmatched: int = 0
    rejected: int = 0
    requests: int = 0
    groups_failed: int = 0
    truncated: bool = False


async def enrich_routes(db: Session, provider: TravelpayoutsRouteProvider | None = None,
                        now: datetime | None = None) -> RouteEnrichmentResult:
    provider = provider or TravelpayoutsRouteProvider()
    result = RouteEnrichmentResult()
    if not provider.token:
        return result
    checked = now or datetime.now(UTC)
    offers = db.scalars(select(TravelOffer).where(
        TravelOffer.source == "travelpayouts_data", TravelOffer.product_type == "FLIGHT",
        TravelOffer.return_at.is_not(None), TravelOffer.depart_at > checked,
        TravelOffer.original_currency == "PLN",
        fresh_price_clause(TravelOffer.last_verified_at, TravelOffer.depart_at, checked),
        TravelOffer.expires_at.is_(None) | (TravelOffer.expires_at > checked),
    ).order_by(TravelOffer.depart_at, TravelOffer.id)).all()
    groups: dict[str, list[TravelOffer]] = defaultdict(list)
    for offer in offers:
        if validated_segments(offer, offer.route_details):
            result.already_known += 1
        elif (offer.departure_precision == "TIME" and instant(offer.raw_payload.get("departure_at"))
              and all(isinstance(offer.raw_payload.get(k), str)
                      and len(offer.raw_payload[k]) == 3 and offer.raw_payload[k].isascii()
                      and offer.raw_payload[k].isalpha() and offer.raw_payload[k].isupper()
                      for k in ("origin_airport", "destination_airport"))
              and ticket_key(offer.raw_payload.get("link"))):
            groups[offer.raw_payload.get("origin_airport", "")].append(offer)
    batches = []
    for origin, group in groups.items():
        dates = sorted({o.raw_payload["departure_at"][:10] for o in group})
        for start in range(0, len(dates), 5):
            days = dates[start:start + 5]
            batches.append((origin, [o for o in group if o.raw_payload["departure_at"][:10] in days], days))
    # Prioritize near departures across airports, rather than spending the budget on one airport.
    batches.sort(key=lambda batch: min(o.depart_at for o in batch[1]))
    for origin, group, dates in batches:
        if provider.requests >= 35:
            result.truncated = True
            break
        # Batch by departure airport. Do not guess a return departure date from REST return_at.
        params = {"origin": origin, "origin_type": "AIRPORT", "depart_dates": dates}
        targets: dict[str | None, list[int]] = defaultdict(list)
        for offer in group:
            targets[ticket_key(offer.raw_payload.get("link"))].append(offer.id)
        result.attempted_offers += len(group)
        completed: set[int] = set()
        seen_pages: set[str] = set()
        try:
            for page in range(5):
                if provider.requests >= 35:
                    result.truncated = True
                    break
                rows = await provider.page(params, page * PAGE_SIZE)
                page_key = "|".join(sorted(str(ticket_key(r.get("ticket_link")))
                                           for r in rows if isinstance(r, dict)))
                if rows and page_key in seen_pages:
                    result.truncated = True
                    break
                seen_pages.add(page_key)
                for row in rows:
                    if not isinstance(row, dict):
                        continue
                    key = ticket_key(row.get("ticket_link"))
                    for offer_id in targets.get(key, []):
                        if offer_id in completed:
                            continue
                        current = db.scalar(select(TravelOffer).where(TravelOffer.id == offer_id)
                                            .with_for_update().execution_options(populate_existing=True))
                        evidence = {k: row.get(k) for k in (
                            "departure_at", "return_at", "origin_airport_iata", "destination_airport_iata",
                            "currency", "value", "segments")}
                        evidence.update(source="travelpayouts_graphql", ticket_key=key,
                                        fetched_at=checked.isoformat())
                        if current and validated_segments(current, evidence):
                            current.route_details = evidence
                            completed.add(offer_id)
                            result.enriched += 1
                        else:
                            result.rejected += 1
                db.commit()
                if len(completed) == len(group) or len(rows) < PAGE_SIZE:
                    break
            else:
                result.truncated = True
        except ProviderError:
            # Cached prices remain usable under their existing TTL if route lookup fails.
            db.rollback()
            result.groups_failed += 1
        result.unmatched += len(group) - len(completed)
    result.requests = provider.requests
    return result
