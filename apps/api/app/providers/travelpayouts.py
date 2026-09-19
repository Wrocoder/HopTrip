from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import httpx

from app.config import get_settings
from app.providers.base import ProviderError, ProviderNotConfigured, RawTravelOffer, SearchQuery


class TravelpayoutsDataProvider:
    """Adapter for Travelpayouts' cached flight data API.

    The adapter only normalizes provider data. It does not manufacture a PLN conversion
    when the provider returns another currency; a later currency service must do that.
    """

    code = "travelpayouts_data"

    def __init__(self, token: str | None = None, base_url: str | None = None) -> None:
        settings = get_settings()
        self.token = token or settings.travelpayouts_api_token
        self.base_url = (base_url or settings.travelpayouts_api_base_url).rstrip("/")

    async def search(self, query: SearchQuery) -> list[RawTravelOffer]:
        if not self.token:
            raise ProviderNotConfigured("Travelpayouts API token is not configured")

        params: dict[str, Any] = {
            "origin": query.origin,
            "currency": query.currency,
            "market": query.market,
            "period_type": query.period_type,
            "one_way": str(query.one_way).lower(),
            "trip_class": query.trip_class,
            "limit": query.limit,
            "page": query.page,
        }
        if query.destination:
            params["destination"] = query.destination
        if query.beginning_of_period:
            params["beginning_of_period"] = query.beginning_of_period.isoformat()
        if query.trip_duration is not None:
            params["trip_duration"] = query.trip_duration

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/v2/prices/latest",
                    params=params,
                    headers={"X-Access-Token": self.token, "Accept-Encoding": "gzip, deflate"},
                )
                response.raise_for_status()
                body = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError(f"Travelpayouts request failed: {exc}") from exc

        if not body.get("success", False):
            raise ProviderError(f"Travelpayouts returned an error: {body.get('error')}")
        data = body.get("data", [])
        if isinstance(data, dict):
            data = list(data.values())
        return [self._normalize(item, query) for item in data if isinstance(item, dict)]

    def _normalize(self, item: dict[str, Any], query: SearchQuery) -> RawTravelOffer:
        depart_at = _parse_datetime(item.get("departure_at") or item.get("depart_date"))
        return_at = _parse_datetime(item.get("return_at") or item.get("return_date"))
        if depart_at is None:
            raise ProviderError("Travelpayouts offer has no departure date")
        destination = str(item.get("destination") or query.destination or "")
        price = item.get("value", item.get("price"))
        if price is None:
            raise ProviderError("Travelpayouts offer has no price")
        external_id = ":".join(
            str(part)
            for part in (
                query.origin,
                destination,
                depart_at.isoformat(),
                return_at,
                item.get("airline"),
                item.get("flight_number"),
            )
        )
        return RawTravelOffer(
            external_id=external_id,
            origin=query.origin,
            destination=destination,
            depart_at=depart_at,
            return_at=return_at,
            price=Decimal(str(price)),
            currency=str(body_currency(item) or query.currency).upper(),
            expires_at=_parse_datetime(item.get("expires_at")),
            source=self.code,
            payload=item,
        )


def body_currency(item: dict[str, Any]) -> str | None:
    value = item.get("currency")
    return str(value) if value else None


def _parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed
