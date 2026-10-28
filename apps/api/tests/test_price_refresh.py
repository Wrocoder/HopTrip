import asyncio
import json
from copy import deepcopy
from datetime import timedelta
from decimal import Decimal

import httpx
import pytest
from app.models.data_provider import DataProvider
from app.models.offer import PriceObservation
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.providers.travelpayouts_routes import TravelpayoutsRouteProvider
from app.services.currency import PlnOnlyConverter
from app.services.deals import generate_flight_deal
from app.services.flight_facts import flight_facts
from app.services.flight_routes import validated_segments
from app.services.ingestion import ingest_offers, observation_key
from app.services.price_refresh import refresh_prices
from app.services.time import utc
from sqlalchemy import select
from test_lifecycle import NOW
from test_return_routes import evidence, route_fixture


def fixtures(db, kind="changed", price=249):
    offer, original = route_fixture(db)
    db.get(DataProvider, offer.data_provider_id).code = "travelpayouts_data"
    # Keep this shared fixture's observation identity consistent with its renamed provider.
    raw = TravelpayoutsDataProvider(token="fixture")._normalize(offer.raw_payload, SearchQuery(origin="WRO"))
    offer.observation_key = observation_key("travelpayouts_data", raw)
    db.scalar(select(PriceObservation)).observation_key = offer.observation_key
    offer.route_details = evidence(original)
    db.commit()
    payload = {**offer.raw_payload, "price": price,
               "link": "/search/WRO0111LON04111?t=new-quote"}
    row = deepcopy(original)
    row.update(value=price - 0.2, ticket_link="/WRO0111LON04111?t=new-quote")
    if kind == "return_airport":
        row["segments"][1]["flight_legs"][0]["origin"] = "STN"
    elif kind == "return_flight":
        row["segments"][1]["flight_legs"][0]["flight_number"] = "9999"
    elif kind == "return_time":
        row["segments"][1]["flight_legs"][0]["departure_at"] = "2030-11-04T22:31:00Z"
    elif kind == "missing_carrier":
        row["segments"][1]["flight_legs"][0].pop("operating_carrier")
    elif kind == "currency":
        row["currency"] = "eur"
    requests = []

    def rest(request):
        requests.append(dict(request.url.params))
        if kind == "rest_error":
            return httpx.Response(429)
        data = [] if kind == "missing" else [payload]
        if kind == "multiple_fares":
            data += [{**payload, "price": 461, "link": "/search/WRO0111LON04111?t=expensive"}]
        if kind == "truncated_rest":
            data *= 1000
        return httpx.Response(200, json={"success": True, "data": data})

    def gql(request):
        variables = json.loads(request.content)["variables"]
        assert variables["market"] == "us"
        assert variables["params"]["destination_type"] == "CITY"
        if kind == "graphql_error":
            return httpx.Response(200, json={"errors": [{"message": "private"}]})
        data = [row]
        if kind == "multiple_fares":
            data += [{**row, "value": 461, "ticket_link": "/WRO0111LON04111?t=expensive"}]
        if kind == "repeated_graphql":
            data *= 400
        return httpx.Response(200, json={"data": {"prices_round_trip": data}})

    provider = TravelpayoutsDataProvider(token="fixture", max_pages=1, transport=httpx.MockTransport(rest))
    routes = TravelpayoutsRouteProvider(token="fixture", interval=0, transport=httpx.MockTransport(gql))
    return offer, provider, routes, payload, requests


@pytest.mark.parametrize("price", [249, 141])
def test_exact_trip_refresh_changes_price_and_selected_ticket_preserving_history(isolated_db, price):
    db = isolated_db
    offer, provider, routes, payload, requests = fixtures(db, price=price)
    before = flight_facts(offer)
    deal = generate_flight_deal(db, offer, NOW)
    original_id, slug = offer.id, deal.slug
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=1)))
    assert result.updated == 1 and result.requests == 2
    assert offer.id == original_id and offer.price_pln == Decimal(price)
    assert flight_facts(offer) == before and validated_segments(offer, offer.route_details)
    assert offer.raw_payload["link"] == payload["link"]
    assert len(list(db.scalars(select(PriceObservation)))) == 2
    assert generate_flight_deal(db, offer, NOW + timedelta(hours=1)).slug == slug
    assert deal.flight_price_pln == Decimal(price)
    assert requests[0]["market"] == "us" and requests[0]["currency"] == "pln"
    assert requests[0]["departure_at"] == "2030-11-01" and requests[0]["return_at"] == "2030-11-04"
    # A stale broad snapshot must not undo the checked price or its selected-ticket URL.
    old = {**payload, "price": 209, "link": "/search/WRO0111LON04111?t=old-stale"}
    protected = ingest_offers(db, provider_code=provider.code,
        offers=[provider._normalize(old, SearchQuery(origin="WRO"))], converter=PlnOnlyConverter(),
        now=NOW + timedelta(hours=2))
    assert protected.snapshot_protected == 1 and offer.price_pln == Decimal(price)
    assert offer.raw_payload["link"] == payload["link"]


@pytest.mark.parametrize("kind", ["return_airport", "return_flight", "return_time", "missing_carrier",
                                  "currency", "rest_error", "graphql_error", "missing",
                                  "truncated_rest", "repeated_graphql"])
def test_inconclusive_cache_never_changes_price_ticket_freshness_or_expiry(isolated_db, kind):
    db = isolated_db
    offer, provider, routes, _, _ = fixtures(db, kind)
    original = (offer.original_price, offer.raw_payload, offer.last_verified_at, offer.expires_at)
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=1)))
    assert result.updated == 0 and result.inconclusive == 1
    assert (offer.original_price, offer.raw_payload, offer.last_verified_at, offer.expires_at) == original
    assert len(list(db.scalars(select(PriceObservation)))) == 1
    assert validated_segments(offer, offer.route_details)
    assert "private" not in str(result)


def test_lowest_fare_is_selected_only_after_full_both_direction_match(isolated_db):
    offer, provider, routes, _, _ = fixtures(isolated_db, "multiple_fares")
    result = asyncio.run(refresh_prices(isolated_db, provider, routes, NOW + timedelta(hours=1)))
    assert result.updated == 1 and offer.price_pln == Decimal(249)


def test_repeated_quote_keeps_original_first_seen_and_never_renews_expiry(isolated_db):
    db = isolated_db
    offer, provider, routes, _, _ = fixtures(db, price=209)
    expiry = offer.expires_at
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=1)))
    assert result.unchanged == 1
    assert utc(offer.last_verified_at) == NOW and offer.expires_at == expiry
    assert len(list(db.scalars(select(PriceObservation)))) == 1
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=2)))
    assert result.groups == 0 and result.deferred == 1
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=2), offer_ids=[offer.id]))
    assert result.unchanged == 1 and utc(offer.last_verified_at) == NOW and offer.expires_at == expiry


def test_budget_and_expired_records_are_skipped(isolated_db):
    _, provider, routes, _, requests = fixtures(isolated_db)
    assert asyncio.run(refresh_prices(isolated_db, provider, routes, NOW, max_groups=0)).groups == 0
    assert asyncio.run(refresh_prices(isolated_db, provider, routes, NOW + timedelta(hours=49))).groups == 0
    assert requests == []


def test_cached_price_seen_before_is_not_made_fresh_when_it_returns(isolated_db):
    db = isolated_db
    offer, provider, routes, payload, _ = fixtures(db)
    # Simulate an older sighting of the newly returned fare, followed by another quote.
    raw = provider._normalize(payload, SearchQuery(origin="WRO"))
    original = db.scalar(select(PriceObservation))
    db.add(PriceObservation(observation_key=observation_key(provider.code, raw),
        data_provider_id=original.data_provider_id, origin_airport_id=original.origin_airport_id,
        destination_id=original.destination_id, product_type="FLIGHT",
        departure_date=original.departure_date, trip_duration_days=original.trip_duration_days,
        observed_price_pln=249, original_price=249, original_currency="PLN",
        source=provider.code, observed_at=NOW - timedelta(hours=2)))
    db.commit()
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=1)))
    assert result.updated == 1 and offer.price_pln == Decimal(249)
    assert utc(offer.last_verified_at) == NOW - timedelta(hours=2)
    assert len(list(db.scalars(select(PriceObservation)))) == 2


def test_failed_followup_keeps_previous_snapshot_protected(isolated_db):
    db = isolated_db
    offer, provider, routes, payload, _ = fixtures(db)
    asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=1)))
    snapshot = deepcopy(offer.route_details["price_snapshot"])
    provider.transport = httpx.MockTransport(lambda _: httpx.Response(503))
    result = asyncio.run(refresh_prices(db, provider, routes, NOW + timedelta(hours=2), offer_ids=[offer.id]))
    assert result.failed_groups == 1 and result.inconclusive == 1
    assert offer.route_details["price_snapshot"] == snapshot
    stale = provider._normalize({**payload, "price": 209}, SearchQuery(origin="WRO"))
    result = ingest_offers(db, provider_code=provider.code, offers=[stale], converter=PlnOnlyConverter(),
                          now=NOW + timedelta(hours=3))
    assert result.snapshot_protected == 1 and offer.price_pln == Decimal(249)


def test_ingestion_keeps_lowest_quote_independent_of_input_order():
    payload = {"origin": "WRO", "destination": "LON", "departure_at": "2030-11-01T10:00:00Z",
               "return_at": "2030-11-04T10:00:00Z", "price": 141}
    for rows in [[payload, {**payload, "price": 332}], [{**payload, "price": 332}, payload]]:
        provider = TravelpayoutsDataProvider(token="fixture", transport=httpx.MockTransport(
            lambda _: httpx.Response(200, json={"success": True, "data": rows})))
        assert asyncio.run(provider.search(SearchQuery(origin="WRO")))[0].price == Decimal(141)
