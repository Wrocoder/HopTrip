"""Cached observations must keep their lifetime across intervening price changes."""

import asyncio
from dataclasses import replace
from datetime import datetime, timedelta
from decimal import Decimal

import httpx
import pytest
from app.models.affiliate_click import AffiliateClick
from app.models.offer import PriceObservation, TravelOffer
from app.providers.base import SearchQuery
from app.services.availability import available_deals_query
from app.services.currency import PlnOnlyConverter
from app.services.deals import generate_flight_deal
from app.services.ingestion import ingest_offers
from app.services.price_freshness import price_freshness
from app.services.price_refresh import refresh_prices
from app.services.time import utc
from sqlalchemy import select
from test_lifecycle import NOW, setup
from test_lifecycle import ingest as ingest_fixture
from test_price_refresh import fixtures


@pytest.mark.parametrize("replacement_expiry", [None, NOW + timedelta(days=5)])
@pytest.mark.parametrize("legacy_history", [False, True])
def test_expired_cached_quote_cannot_return_as_fresh_after_another_price(
    isolated_db, api_client, monkeypatch, replacement_expiry, legacy_history
):
    db = isolated_db
    offer, provider, routes, _, _ = fixtures(db, price=209)
    original = provider._normalize(offer.raw_payload, SearchQuery(origin="WRO"))
    original_deadline = NOW + timedelta(hours=1)
    # Duplicate delivery shortens A's advertised lifetime, then B replaces A.
    ingest_offers(db, provider_code=provider.code,
                  offers=[replace(original, expires_at=original_deadline)],
                  converter=PlnOnlyConverter(), now=NOW)
    ingest_offers(db, provider_code=provider.code,
                  offers=[replace(original, price=Decimal(220))],
                  converter=PlnOnlyConverter(), now=NOW + timedelta(minutes=30))
    offer.route_details = {**offer.route_details, "value": 220}
    if legacy_history:
        # Lost pre-0019 deadlines cannot be reconstructed after the offer changed price.
        old = db.scalar(select(PriceObservation).where(PriceObservation.original_price == 209))
        old.expires_at = None
    db.commit()
    deal = generate_flight_deal(db, offer, NOW + timedelta(minutes=30))
    assert db.scalar(available_deals_query(NOW + timedelta(minutes=30))) == deal
    if replacement_expiry is not None:
        # The date-specific cache may now omit or extend A's old expiry.
        transport = provider.transport

        def respond(request):
            response = transport.handle_request(request)
            body = response.json()
            for row in body["data"]:
                row["expires_at"] = replacement_expiry.isoformat()
            return httpx.Response(200, json=body)

        provider.transport = httpx.MockTransport(respond)
    checked = NOW + timedelta(hours=2)
    expected_deadline = NOW if legacy_history else original_deadline
    result = asyncio.run(refresh_prices(db, provider, routes, checked))
    assert result.updated == 1 and offer.price_pln == Decimal(209)
    assert utc(offer.last_verified_at) == NOW
    assert utc(offer.expires_at) == expected_deadline
    # Read-time safety applies even before the stale Deal snapshot is regenerated.
    assert db.scalar(available_deals_query(checked)) is None
    assert price_freshness(deal, offer, checked).hidden_after == expected_deadline

    class Clock(datetime):
        @classmethod
        def now(cls, tz=None):
            return checked

    from app.services import availability

    monkeypatch.setattr(availability, "datetime", Clock)
    assert api_client.get("/api/v1/deals?include_total=true").json()["total"] == 0
    assert api_client.get("/api/v1/deals/" + deal.slug).status_code == 404
    assert api_client.get("/go/" + deal.slug + "/flight").status_code == 404
    assert db.scalar(select(AffiliateClick)) is None
    assert generate_flight_deal(db, offer, checked).status == "EXPIRED"
    history = list(db.scalars(select(PriceObservation).order_by(PriceObservation.observed_at)))
    assert len(history) == 2
    assert [row.original_price for row in history] == [Decimal(209), Decimal(220)]
    assert [utc(row.observed_at) for row in history] == [NOW, NOW + timedelta(minutes=30)]
    assert utc(history[0].expires_at) == expected_deadline


def test_legacy_current_deadline_is_retained_and_new_source_observation_can_renew(isolated_db):
    db = isolated_db
    raw = replace(setup(db), expires_at=NOW + timedelta(hours=1))
    ingest_fixture(db, raw, NOW)
    history = db.scalar(select(PriceObservation))
    history.expires_at = None  # A pre-0019 history row, with known expiry on the current offer.
    db.commit()
    ingest_fixture(db, replace(raw, expires_at=None), NOW + timedelta(minutes=30))
    assert utc(history.expires_at) == NOW + timedelta(hours=1)
    renewed_at = NOW + timedelta(hours=2)
    ingest_fixture(db, replace(raw, expires_at=None, source_observed_at=renewed_at), renewed_at)
    stored = db.scalar(select(TravelOffer))
    assert utc(stored.last_verified_at) == renewed_at
    assert utc(stored.expires_at) == renewed_at + timedelta(hours=48)
    assert db.query(PriceObservation).count() == 2
    assert utc(history.expires_at) == NOW + timedelta(hours=1)


@pytest.mark.parametrize("same_observation", [True, False])
def test_protected_snapshot_still_accepts_an_earlier_deadline_only_for_the_same_quote(
    isolated_db, same_observation
):
    db = isolated_db
    offer, provider, routes, payload, _ = fixtures(db)
    asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(minutes=30)))
    price, link, expiry = offer.price_pln, offer.raw_payload["link"], utc(offer.expires_at)
    raw = provider._normalize({**payload, "price": 249 if same_observation else 209,
                               "link": "/search/old-broad-ticket?t=untrusted-for-overwrite"},
                              SearchQuery(origin="WRO"))
    earlier = NOW + timedelta(hours=1)
    result = ingest_offers(db, provider_code=provider.code,
                          offers=[replace(raw, expires_at=earlier)],
                          converter=PlnOnlyConverter(), now=NOW + timedelta(hours=2))
    assert result.snapshot_protected == 1
    assert offer.price_pln == price and offer.raw_payload["link"] == link
    assert utc(offer.expires_at) == (earlier if same_observation else expiry)
    observation = db.scalar(select(PriceObservation).where(
        PriceObservation.observation_key == offer.observation_key))
    assert utc(observation.expires_at) == utc(offer.expires_at)
