"""Structured cached segments from the official GraphQL Data API, not live search."""
import asyncio
import time

import httpx

from app.config import get_settings
from app.providers.base import (
    ProviderNotConfigured,
    ProviderPermanentError,
    ProviderTransientError,
)

PAGE_SIZE = 400

QUERY = """query($params:ParamsRoundTrip!,$offset:Int!){
 prices_round_trip(params:$params,grouping:NONE,currency:"pln",market:"pl",
 paging:{limit:400,offset:$offset},sorting:VALUE_ASC){
  departure_at return_at origin_airport_iata destination_airport_iata value currency
  segments{departure_at arrival_at flight_legs{
   origin destination departure_at arrival_at flight_number operating_carrier
  }} ticket_link
 }}"""


class TravelpayoutsRouteProvider:
    def __init__(self, *, token: str | None = None, base_url: str | None = None,
                 transport: httpx.AsyncBaseTransport | None = None, interval: float = 1.1):
        settings = get_settings()
        self.token = token if token is not None else settings.travelpayouts_api_token
        self.base_url = (base_url or settings.travelpayouts_api_base_url).rstrip("/")
        self.transport = transport
        self.interval = max(0, interval)
        self.last_request = 0.0
        self.requests = 0

    async def page(self, params: dict, offset: int) -> list[dict]:
        if not self.token:
            raise ProviderNotConfigured("Route Data API token is not configured")
        # Shared across origin groups: stay below the documented 60 requests/minute.
        delay = self.interval - (time.monotonic() - self.last_request)
        if delay > 0:
            await asyncio.sleep(delay)
        self.last_request = time.monotonic()
        self.requests += 1
        try:
            async with httpx.AsyncClient(timeout=30, transport=self.transport) as client:
                response = await client.post(
                    f"{self.base_url}/graphql/v1/query",
                    headers={"X-Access-Token": self.token},
                    json={"query": QUERY, "variables": {"params": params, "offset": offset}},
                )
        except httpx.TransportError as exc:
            raise ProviderTransientError("Route Data API transport failure") from exc
        if response.status_code == 429 or response.status_code >= 500:
            raise ProviderTransientError(f"Route Data API temporary HTTP {response.status_code}")
        if response.is_error:
            raise ProviderPermanentError(f"Route Data API HTTP {response.status_code}")
        try:
            body = response.json()
        except ValueError as exc:
            raise ProviderPermanentError("Route Data API invalid JSON") from exc
        data = body.get("data") if isinstance(body, dict) else None
        rows = data.get("prices_round_trip") if isinstance(data, dict) else None
        if not isinstance(body, dict) or body.get("errors") or not isinstance(rows, list):
            raise ProviderPermanentError("Route Data API invalid result")
        return rows
