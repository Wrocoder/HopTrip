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
