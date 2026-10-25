import asyncio
from datetime import UTC, datetime
from decimal import Decimal

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
