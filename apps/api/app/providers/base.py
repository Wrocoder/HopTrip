from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Protocol


class ProviderError(RuntimeError):
    """A provider failed without making the whole ingestion process fatal."""


class ProviderNotConfigured(ProviderError):
    """The provider needs credentials or configuration before it can be called."""


@dataclass(frozen=True)
class SearchQuery:
    origin: str
    destination: str | None = None
    beginning_of_period: date | None = None
    period_type: str = "year"
    one_way: bool = False
    trip_class: int = 0
    trip_duration: int | None = None
    currency: str = "pln"
    market: str = "pl"
    limit: int = 100
    page: int = 1


@dataclass(frozen=True)
class RawTravelOffer:
    external_id: str
    origin: str
    destination: str
    depart_at: datetime
    return_at: datetime | None
    price: Decimal
    currency: str
    expires_at: datetime | None
    source: str
    payload: dict[str, Any]


class TravelDataProvider(Protocol):
    code: str

    async def search(self, query: SearchQuery) -> list[RawTravelOffer]: ...

