import asyncio
from datetime import UTC, datetime
from decimal import Decimal

import httpx
from app.providers.base import ProviderNotConfigured, SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider


def test_travelpayouts_requires_token() -> None:
    provider = TravelpayoutsDataProvider(token=None)

    async def run() -> None:
        try:
            await provider.search(SearchQuery(origin="WRO"))
        except ProviderNotConfigured:
            return
        raise AssertionError("Provider should require a token")

    asyncio.run(run())


def test_travelpayouts_normalizes_fixture() -> None:
    provider = TravelpayoutsDataProvider(token="test-token")
    offer = provider._normalize(
        {
            "destination": "BCN",
            "price": 179,
            "airline": "FR",
            "flight_number": 1234,
            "departure_at": "2026-10-18T08:00:00Z",
            "return_at": "2026-10-21T20:00:00Z",
            "expires_at": "2026-09-20T08:00:00Z",
        },
        SearchQuery(origin="WRO", currency="pln"),
    )
    assert offer.price == Decimal(179)
    assert offer.currency == "PLN"
    assert offer.depart_at == datetime(2026, 10, 18, 8, tzinfo=UTC)
    assert offer.destination == "BCN"


def test_distinct_explicit_return_airports_do_not_overwrite_each_other():
    provider = TravelpayoutsDataProvider(token="fixture")
    item = {"origin_airport":"WRO", "destination":"LON", "destination_airport":"STN",
            "departure_at":"2030-10-24T10:00:00Z", "return_at":"2030-10-27T10:00:00Z", "price":200}
    query = SearchQuery(origin="WRO")
    stn = provider._normalize(item | {"return_origin_airport":"STN", "return_destination_airport":"WRO"}, query)
    ltn = provider._normalize(item | {"return_origin_airport":"LTN", "return_destination_airport":"WRO"}, query)
    assert stn.external_id != ltn.external_id
    assert stn.payload["return_origin_airport"] == "STN"
    assert ltn.payload["return_origin_airport"] == "LTN"


def test_diagnostics_preserve_all_quotes_while_ingestion_keeps_the_lowest_fare():
    item = {'origin_airport':'WRO', 'destination':'BCN', 'departure_at':'2030-11-01T10:00:00Z',
            'return_at':'2030-11-04T08:00:00Z', 'airline':'FR', 'flight_number':'123',
            'price':289, 'link':'/search/WRO0111BCN04111?t=original'}
    rows = [item, item | {'price':541, 'link':'/search/WRO0111BCN04111?t=alternative'}]
    provider = TravelpayoutsDataProvider(token='fixture', transport=httpx.MockTransport(
        lambda _: httpx.Response(200, json={'success':True, 'data':rows})))
    query = SearchQuery(origin='WRO')
    normal = asyncio.run(provider.search(query))
    assert len(normal) == 1 and normal[0].price == Decimal(289)
    variants = asyncio.run(provider.search(query, preserve_variants=True))
    assert [item.price for item in variants] == [Decimal(289), Decimal(541)]
    assert variants[0].external_id == variants[1].external_id
    assert provider.diagnostics.duplicate_offers == 1
