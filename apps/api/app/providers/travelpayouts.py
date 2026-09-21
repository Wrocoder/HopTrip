import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation
from email.utils import parsedate_to_datetime
from math import isfinite
from typing import Any

import httpx

from app.config import get_settings
from app.providers.base import (
    ProviderNotConfigured,
    ProviderPermanentError,
    ProviderTransientError,
    RawTravelOffer,
    SearchQuery,
)


@dataclass
class SearchDiagnostics:
    pages_fetched: int = 0
    received_items: int = 0
    rejected_items: int = 0
    filtered_items: int = 0
    duplicate_offers: int = 0
    stop_reason: str = "not_started"


class TravelpayoutsDataProvider:
    """Cached v3 prices, not live inventory. Unknown observation times remain unknown."""

    code = "travelpayouts_data"

    def __init__(
        self,
        token: str | None = None,
        base_url: str | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
        max_pages: int | None = None,
    ):
        settings = get_settings()
        self.token = token if token is not None else settings.travelpayouts_api_token
        self.base_url = (base_url or settings.travelpayouts_api_base_url).rstrip("/")
        self.transport = transport
        self.max_pages = settings.provider_max_pages if max_pages is None else max_pages
        if not 1 <= self.max_pages <= 100:
            raise ValueError("max_pages must be between 1 and 100")
        self.diagnostics = SearchDiagnostics()

    @property
    def rejected_items(self) -> int:
        return self.diagnostics.rejected_items

    async def search(self, query: SearchQuery) -> list[RawTravelOffer]:
        self.diagnostics = SearchDiagnostics()
        if query.trip_class != 0 or query.limit < 1 or query.page < 1:
            raise ProviderPermanentError("Unsupported search parameters")
        if not self.token:
            raise ProviderNotConfigured("Travelpayouts API token is not configured")
        params: dict[str, Any] = {
            "origin": query.origin,
            "currency": query.currency,
            "market": query.market,
            "one_way": str(query.one_way).lower(),
            "limit": min(query.limit, 1000),
            "sorting": "price",
            "unique": "false",
        }
        if query.destination:
            params["destination"] = query.destination
        if query.beginning_of_period:
            params["departure_at"] = query.beginning_of_period.strftime("%Y-%m")
        offers: dict[str, RawTravelOffer] = {}
        seen_pages: set[str] = set()
        self.diagnostics.stop_reason = "error"
        async with httpx.AsyncClient(timeout=30, transport=self.transport) as client:
            for page in range(query.page, query.page + self.max_pages):
                params["page"] = page
                try:
                    response = await client.get(
                        f"{self.base_url}/aviasales/v3/prices_for_dates",
                        params=params,
                        headers={"X-Access-Token": self.token},
                    )
                except httpx.TransportError as exc:
                    raise ProviderTransientError("Travelpayouts transport failure") from exc
                if response.status_code == 429 or response.status_code >= 500:
                    raise ProviderTransientError(
                        f"Travelpayouts temporary HTTP {response.status_code}",
                        _retry_after(response.headers.get("Retry-After")),
                    )
                if response.is_error:
                    raise ProviderPermanentError(f"Travelpayouts HTTP {response.status_code}")
                try:
                    body = response.json()
                except ValueError as exc:
                    raise ProviderPermanentError("Travelpayouts invalid JSON") from exc
                if not isinstance(body, dict) or body.get("success") is not True:
                    raise ProviderPermanentError("Travelpayouts unsuccessful response")
                data = body.get("data")
                if not isinstance(data, list):
                    raise ProviderPermanentError("Travelpayouts data must be a list")
                self.diagnostics.pages_fetched += 1
                self.diagnostics.received_items += len(data)
                page_key = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
                if page_key in seen_pages:
                    self.diagnostics.stop_reason = "repeated_page"
                    break
                seen_pages.add(page_key)
                for item in data:
                    try:
                        offer = self._normalize(item, query)
                    except (ValueError, TypeError, InvalidOperation, KeyError, OverflowError):
                        self.diagnostics.rejected_items += 1
                        continue
                    if query.trip_duration is not None and (
                        not offer.return_at
                        or (offer.return_at.date() - offer.depart_at.date()).days
                        != query.trip_duration
                    ):
                        self.diagnostics.filtered_items += 1
                        continue
                    if offer.external_id in offers:
                        self.diagnostics.duplicate_offers += 1
                    offers[offer.external_id] = offer
                if len(data) < params["limit"]:
                    self.diagnostics.stop_reason = "short_page" if data else "empty_page"
                    break
            else:
                self.diagnostics.stop_reason = "page_limit"
        return list(offers.values())

    def _normalize(self, item: dict[str, Any], query: SearchQuery) -> RawTravelOffer:
        if not isinstance(item, dict):
            raise ValueError("Offer must be an object")
        departure = item.get("departure_at") or item.get("depart_date")
        depart_at = _parse_datetime(departure)
        return_at = _parse_datetime(item.get("return_at") or item.get("return_date"))
        if depart_at is None or (return_at and return_at < depart_at):
            raise ValueError("Invalid travel dates")
        if not query.one_way and return_at is None:
            raise ValueError("Round-trip response has no return date")
        price = Decimal(str(item.get("price", item.get("value"))))
        if not price.is_finite() or price <= 0 or price >= Decimal("10000000000"):
            raise ValueError("Invalid price")
        currency = str(item.get("currency") or query.currency).upper()
        if len(currency) != 3 or not currency.isascii() or not currency.isalpha():
            raise ValueError("Invalid currency")
        destination = str(item.get("destination") or query.destination or "").upper()
        origin = str(item.get("origin_airport") or item.get("origin") or query.origin).upper()
        if not all(
            len(code) == 3 and code.isascii() and code.isalpha() for code in (origin, destination)
        ):
            raise ValueError("Invalid route")
        identity = "|".join(
            str(value)
            for value in (
                origin,
                destination,
                depart_at.isoformat(),
                return_at.isoformat() if return_at else "",
                item.get("airline", ""),
                item.get("flight_number", ""),
                item.get("transfers", ""),
            )
        )
        return RawTravelOffer(
            external_id=hashlib.sha256(identity.encode()).hexdigest(),
            origin=origin,
            destination=destination,
            depart_at=depart_at,
            return_at=return_at,
            price=price,
            currency=currency,
            expires_at=_parse_datetime(item.get("expires_at")),
            source=self.code,
            payload=item,
            source_observed_at=_parse_datetime(item.get("found_at")),
            departure_precision="DATE" if len(str(departure)) == 10 else "TIME",
        )


def _parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None
    text = str(value)
    parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        if len(text) != 10:
            raise ValueError("A timed value requires an explicit offset")
        parsed = parsed.replace(tzinfo=UTC)  # date-only: conservative start of UTC day
    return parsed.astimezone(UTC)


def _retry_after(value: str | None) -> float:
    if not value:
        return 0
    try:
        seconds = float(value)
        return min(300, max(0, seconds)) if isfinite(seconds) else 0
    except ValueError:
        try:
            return min(
                300, max(0, (parsedate_to_datetime(value) - datetime.now(UTC)).total_seconds())
            )
        except (ValueError, TypeError, OverflowError):
            return 0
