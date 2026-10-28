"""Bounded exact-trip cache refresh. This never claims live availability."""
from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from app.config import get_settings
from app.models.offer import TravelOffer
from app.providers.base import ProviderError, SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.providers.travelpayouts_routes import PAGE_SIZE, TravelpayoutsRouteProvider
from app.services.currency import PlnOnlyConverter
from app.services.flight_routes import instant, ticket_key, validated_segments
from app.services.ingestion import ingest_offers
from app.services.price_lifetime import fresh_price_clause
from app.services.time import utc
from app.services.trip_dates import trip_dates
from sqlalchemy import select
from sqlalchemy.orm import Session


@dataclass
class PriceRefreshResult:
    groups: int = 0
    checked: int = 0
    updated: int = 0
    unchanged: int = 0
    inconclusive: int = 0
    failed_groups: int = 0
    requests: int = 0
    deferred: int = 0


def itinerary(segments: list[list[dict]] | None) -> tuple | None:
    """Include every leg, both airport pairs, UTC instants and operating flights."""
    if not segments:
        return None
    result = []
    for legs in segments:
        direction = []
        for leg in legs:
            departure, arrival = instant(leg.get("departure_at")), instant(leg.get("arrival_at"))
            carrier, number = leg.get("operating_carrier"), leg.get("flight_number")
            if not departure or not arrival or not carrier or not number:
                return None
            direction.append((leg["origin"], leg["destination"], departure, arrival,
                              str(carrier), str(number)))
        result.append(tuple(direction))
    return tuple(result)


async def refresh_prices(
    db: Session, provider: TravelpayoutsDataProvider | None = None,
    routes: TravelpayoutsRouteProvider | None = None, now: datetime | None = None,
    *, offer_ids: list[int] | None = None, max_groups: int | None = None,
) -> PriceRefreshResult:
    provider = provider or TravelpayoutsDataProvider(max_pages=2)
    routes = routes or TravelpayoutsRouteProvider()
    result = PriceRefreshResult()
    if not provider.token or not routes.token:
        return result
    checked = now or datetime.now(UTC)
    limit = max_groups if max_groups is not None else get_settings().flight_price_refresh_groups
    conditions = [TravelOffer.source == "travelpayouts_data", TravelOffer.product_type == "FLIGHT",
                  TravelOffer.depart_at > checked, TravelOffer.return_at.is_not(None),
                  TravelOffer.original_currency == "PLN"]
    if offer_ids is not None:
        conditions.append(TravelOffer.id.in_(offer_ids))
    else:
        conditions.extend([fresh_price_clause(TravelOffer.last_verified_at, TravelOffer.depart_at, checked),
                           TravelOffer.expires_at.is_(None) | (TravelOffer.expires_at > checked)])
    groups: dict[tuple[str, str, date, date | None], list[TravelOffer]] = defaultdict(list)
    deadlines: dict[tuple[str, str, date, date | None], datetime] = {}
    for offer in db.scalars(select(TravelOffer).where(*conditions)).all():
        payload = offer.raw_payload or {}
        origin, city = payload.get("origin_airport"), payload.get("destination")
        if (offer.departure_precision != "TIME" or not itinerary(validated_segments(offer, offer.route_details))
                or not all(isinstance(c, str) and len(c) == 3 and c.isascii() and c.isalpha()
                           and c.isupper() for c in (origin, city))):
            result.deferred += 1
            continue
        interval = timedelta(hours=1 if utc(offer.depart_at) <= checked + timedelta(days=7)
                             else 4 if utc(offer.depart_at) <= checked + timedelta(days=30) else 12)
        attempted = instant((offer.route_details or {}).get("price_refresh_at"))
        due = attempted + interval if attempted else checked
        if offer_ids is None and due > checked:
            result.deferred += 1
            continue
        start, end = trip_dates(offer)
        assert isinstance(origin, str) and isinstance(city, str)
        key = (origin, city, start, end)
        groups[key].append(offer)
        deadlines[key] = min(deadlines.get(key, due), due)
    ordered = sorted(groups, key=lambda k: (deadlines[k], k[2], k))
    initial_requests = routes.requests
    for key in ordered[:limit]:
        if routes.requests - initial_requests >= 80:
            break
        group = groups[key]
        # Capture identities before awaits/commits, then re-check them under the row lock.
        targets = [(o.id, o.observation_key, ticket_key(o.raw_payload.get("link")),
                    itinerary(validated_segments(o, o.route_details))) for o in group]
        result.groups += 1
        origin, city, start, end = key
        complete = False
        rows: list[dict] = []
        candidates = []
        try:
            candidates = await provider.search(SearchQuery(
                origin=origin, destination=city, departure_date=start, return_date=end,
                market=routes.market, currency="pln", limit=1000), preserve_variants=True)
            result.requests += provider.diagnostics.pages_fetched
            if (provider.diagnostics.stop_reason in {"empty_page", "short_page"}
                    and provider.diagnostics.rejected_items == 0):
                params = {"origin": origin, "origin_type": "AIRPORT", "destination": city,
                          "destination_type": "CITY", "depart_dates": [start.isoformat()]}
                seen = set()
                for page in range(3):
                    if routes.requests - initial_requests >= 80:
                        break
                    batch = await routes.page(params, page * PAGE_SIZE)
                    fingerprint = tuple(sorted(str(ticket_key(r.get("ticket_link")))
                                               for r in batch if isinstance(r, dict)))
                    if batch and fingerprint in seen:
                        break
                    seen.add(fingerprint)
                    rows.extend(r for r in batch if isinstance(r, dict))
                    if len(batch) < PAGE_SIZE:
                        complete = True
                        break
        except ProviderError:
            db.rollback()
            result.failed_groups += 1
        by_ticket: dict[str | None, list[dict]] = defaultdict(list)
        for row in rows:
            by_ticket[ticket_key(row.get("ticket_link"))].append(row)
        for offer_id, observation, old_ticket, reference in targets:
            current = db.scalar(select(TravelOffer).where(TravelOffer.id == offer_id)
                                .with_for_update().execution_options(populate_existing=True))
            if (not current or current.observation_key != observation
                    or ticket_key(current.raw_payload.get("link")) != old_ticket):
                result.deferred += 1
                continue
            matches = []
            if complete:
                for raw in candidates:
                    if raw.external_id != current.external_id or raw.currency != "PLN":
                        continue
                    probe = TravelOffer(depart_at=raw.depart_at, return_at=raw.return_at,
                                        departure_precision=raw.departure_precision, raw_payload=raw.payload,
                                        original_price=raw.price, original_currency=raw.currency)
                    candidate_ticket = ticket_key(raw.payload.get("link"))
                    for row in by_ticket.get(candidate_ticket, []):
                        evidence = {k: row.get(k) for k in (
                            "departure_at", "return_at", "origin_airport_iata", "destination_airport_iata",
                            "currency", "value", "segments")}
                        evidence.update(source="travelpayouts_graphql", ticket_key=candidate_ticket,
                                        fetched_at=checked.isoformat())
                        if candidate_ticket and itinerary(validated_segments(probe, evidence)) == reference:
                            matches.append((raw, evidence))
            details = dict(current.route_details or {})
            result.checked += 1
            if matches:
                raw, evidence = min(matches, key=lambda pair: pair[0].price)
                old_price = Decimal(current.original_price)
                ingest_offers(db, provider_code=provider.code, offers=[raw],
                              converter=PlnOnlyConverter(), now=checked, price_snapshot=True, commit=False)
                db.refresh(current)
                if (current.original_price == raw.price
                        and ticket_key(current.raw_payload.get("link")) == ticket_key(raw.payload.get("link"))):
                    details.update(evidence)
                    details["price_snapshot"] = {"observation_key": current.observation_key,
                                                 "market": routes.market, "checked_at": checked.isoformat()}
                    if old_price != current.original_price:
                        result.updated += 1
                    else:
                        result.unchanged += 1
                else:
                    result.inconclusive += 1
            else:
                # Absence from a cached snapshot is not proof that a flight is sold out.
                result.inconclusive += 1
            details["price_refresh_at"] = checked.isoformat()
            current.route_details = details
            db.commit()
    result.deferred += sum(len(groups[k]) for k in ordered[result.groups:])
    result.requests += routes.requests - initial_requests
    return result
