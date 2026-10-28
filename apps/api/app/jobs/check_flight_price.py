"""Read-only, date-specific comparison with the cached Data API, not live inventory."""
import argparse
import asyncio
import json
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.deal import Deal, DealComponent
from app.models.offer import TravelOffer
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.services.flight_routes import ticket_key
from app.services.time import utc
from app.services.trip_dates import trip_dates


async def check(slug: str, provider: TravelpayoutsDataProvider | None = None) -> dict:
    provider = provider or TravelpayoutsDataProvider()
    with SessionLocal() as db:
        deal = db.scalar(select(Deal).where(Deal.slug == slug))
        if deal is None:
            raise ValueError("Unknown deal")
        part = db.scalar(select(DealComponent).where(
            DealComponent.deal_id == deal.id, DealComponent.component_type == "FLIGHT"))
        offer = db.get(TravelOffer, part.travel_offer_id) if part and part.travel_offer_id else None
        if offer is None or offer.source != "travelpayouts_data":
            raise ValueError("No linked Data API offer")
        payload = offer.raw_payload
        origin = payload.get("origin_airport") or payload.get("origin")
        destination = payload.get("destination") or payload.get("destination_airport")
        if not origin or not destination:
            raise ValueError("Missing original route")
        start, end = trip_dates(offer)
        query = SearchQuery(origin=origin, destination=destination, departure_date=start,
                            return_date=end, currency=offer.original_currency.lower(),
                            one_way=offer.return_at is None, limit=1000)
        identity = offer.external_id
        reference_ticket = ticket_key(payload.get("link"))
        price = Decimal(offer.original_price)
        currency = offer.original_currency
        stored = {"slug": slug, "hoptrip_price_pln": str(deal.flight_price_pln),
                  "source_price": str(price), "currency": currency,
                  "observed_at": utc(offer.last_verified_at).isoformat(),
                  "fetched_at": utc(offer.fetched_at).isoformat()}
    offers = await provider.search(query, preserve_variants=True)
    candidates = [item for item in offers if item.external_id == identity]
    matches = [item for item in candidates if reference_ticket is not None
               and ticket_key(item.payload.get("link")) == reference_ticket]
    quotes = {(item.price, item.currency) for item in matches}
    match = matches[0] if len(quotes) == 1 else None
    complete = (provider.diagnostics.stop_reason in {"empty_page", "short_page"}
                and not provider.diagnostics.rejected_items)
    status = ("CACHE_UNCHANGED" if match.price == price else "CACHE_PRICE_CHANGED") if match else (
        "NOT_IN_CACHE_RESPONSE" if complete and not candidates else "INCONCLUSIVE")
    if match and match.currency != currency:
        status = "INCONCLUSIVE"
    return {**stored, "checked_at": datetime.now(UTC).isoformat(), "status": status,
            "source": "CACHED_DATA_API", "live_availability_verified": False,
            "matched_price": str(match.price) if match else None,
            "matched_currency": match.currency if match else None,
            "match_basis": "EXACT_TICKET" if matches else "ITINERARY_ONLY" if candidates else "NONE",
            "candidate_prices": [{"price": str(value), "currency": code}
                                 for value, code in sorted({(item.price, item.currency) for item in candidates})],
            "received": len(offers), "complete_response": complete,
            "stop_reason": provider.diagnostics.stop_reason,
            "rejected": provider.diagnostics.rejected_items}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug")
    args = parser.parse_args()
    try:
        result = asyncio.run(check(args.slug))
    except Exception:
        # Provider exceptions must not leak credential-bearing URLs into diagnostics.
        print(json.dumps({"slug": args.slug, "status": "CHECK_FAILED", "live_availability_verified": False}))
        raise SystemExit(2) from None
    print(json.dumps(result))


if __name__ == "__main__":
    main()
