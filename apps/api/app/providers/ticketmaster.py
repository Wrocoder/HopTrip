"""Bounded Discovery adapter. No raw responses, credentials or request URLs are logged."""

import logging
import re
from dataclasses import dataclass
from datetime import date, time
from decimal import Decimal, InvalidOperation
from typing import Literal
from urllib.parse import parse_qsl, urlsplit

import httpx

from app.schemas.event import EventCategory, EventRead


@dataclass(frozen=True)
class EventCity:
    names: tuple[str, ...]
    country: str
    timezone: str


# Reviewed pilot mapping, independent of IATA aliases. No fuzzy neighbouring-city matches.
EVENT_CITIES = {
    "milan": EventCity(("Milan", "Milano"), "IT", "Europe/Rome"),
    "stockholm": EventCity(("Stockholm",), "SE", "Europe/Stockholm"),
    "paris": EventCity(("Paris",), "FR", "Europe/Paris"),
    "oslo": EventCity(("Oslo",), "NO", "Europe/Oslo"),
}
SEGMENTS = {"MUSIC": "Music", "SPORTS": "Sports", "CULTURE": "Arts & Theatre"}
TICKET_HOSTS = {
    "ticketmaster.it", "www.ticketmaster.it", "shop.ticketmaster.it",
    "ticketmaster.se", "www.ticketmaster.se", "ticketmaster.fr", "www.ticketmaster.fr",
    "ticketmaster.no", "www.ticketmaster.no", "universe.com", "www.universe.com",
}


class DiscoveryLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # httpx logs the full URL at INFO, including query credentials.
        message = record.getMessage()
        if "app.ticketmaster.com" in message:
            record.msg = re.sub(r"(?i)(apikey=)[^&\s\"']+", r"\1[REDACTED]", message)
            record.args = ()
        return True


logging.getLogger("httpx").addFilter(DiscoveryLogFilter())


class EventsUnavailable(Exception):
    def __init__(self):
        super().__init__("Event source temporarily unavailable")


def safe_ticket_url(value: str) -> str | None:
    try:
        url = urlsplit(value)
        if (
            url.scheme != "https" or url.hostname not in TICKET_HOSTS
            or url.username or url.password or url.port not in (None, 443)
            or "\\" in value or any(ord(char) < 32 for char in value)
            or any(key.lower() in {"apikey", "api_key"} for key, _ in parse_qsl(url.query))
        ):
            return None
        return value
    except (ValueError, TypeError):
        return None


def normalize_event(raw: dict, city: EventCity, start: date, end: date) -> EventRead | None:
    try:
        dates = raw["dates"]
        first = dates["start"]
        status = dates["status"]["code"]
        if (raw.get("test") or first.get("dateTBA") or first.get("dateTBD")
                or status not in {"onsale", "offsale", "rescheduled"}):
            return None
        start_date = date.fromisoformat(first["localDate"])
        last = dates.get("end") or {}
        end_date = date.fromisoformat(last["localDate"]) if last.get("localDate") else None
        if (end_date and end_date < start_date) or start_date > end or (end_date or start_date) < start:
            return None
        venues = raw["_embedded"]["venues"]
        venue = next((v for v in venues if
                      v.get("city", {}).get("name", "").casefold() in
                      {name.casefold() for name in city.names}
                      and v.get("country", {}).get("countryCode") == city.country), None)
        if not venue:
            return None
        # The reviewed city zone is a fallback when the event omits it.
        zone = dates.get("timezone") or venue.get("timezone") or city.timezone
        if zone != city.timezone:
            return None
        url = safe_ticket_url(raw["url"])
        if not url:
            return None
        segments = {c.get("segment", {}).get("name") for c in raw.get("classifications", [])}
        category: Literal["MUSIC", "SPORTS", "CULTURE", "OTHER"] = "OTHER"
        if "Music" in segments:
            category = "MUSIC"
        elif "Sports" in segments:
            category = "SPORTS"
        elif "Arts & Theatre" in segments:
            category = "CULTURE"
        price, currency = None, None
        for entry in raw.get("priceRanges") or []:
            try:
                amount = Decimal(str(entry.get("min")))
                code = entry.get("currency", "")
                if amount.is_finite() and amount >= 0 and re.fullmatch(r"[A-Z]{3}", code):
                    price, currency = amount, code
                    break
            except (InvalidOperation, TypeError):
                continue
        return EventRead(
            id=raw["id"], name=raw["name"], category=category,
            genre=next((c.get("genre", {}).get("name") for c in raw.get("classifications", [])
                        if c.get("segment", {}).get("name") == SEGMENTS.get(category)
                        and c.get("genre", {}).get("name") not in (None, "Undefined", "Other")), None),
            venue=venue["name"], venue_id=venue.get("id"),
            city=venue["city"]["name"], start_date=start_date,
            end_date=end_date, timezone=zone, status=status, url=url,
            local_time=time.fromisoformat(first["localTime"])
            if first.get("localTime") and not first.get("timeTBA")
            and not first.get("noSpecificTime") else None,
            price_from=price, currency=currency,
        )
    except (ValueError, TypeError, KeyError, AttributeError):
        # One malformed item must not break a flight page or other valid events.
        return None


class TicketmasterProvider:
    def fetch_page(
        self, client: httpx.Client, key: str, city: EventCity, start: date, end: date,
        category: EventCategory, page: int,
    ) -> tuple[list[EventRead], bool]:
        params = {
            "apikey": key, "city": ",".join(city.names), "countryCode": city.country,
            "locale": "*", "size": "100", "page": str(page), "sort": "date,asc",
            "localStartEndDateTime": f"{start}T00:00:00,{end}T23:59:59",
            "includeTBA": "no", "includeTBD": "no", "includeTest": "no",
        }
        if category in SEGMENTS:
            params["segmentName"] = SEGMENTS[category]
        try:
            response = client.get("https://app.ticketmaster.com/discovery/v2/events.json", params=params)
            response.raise_for_status()
            data = response.json()
            rows = data.get("_embedded", {}).get("events", [])
            total_pages = int(data["page"]["totalPages"])
            if not isinstance(rows, list) or total_pages < 0:
                raise ValueError("Invalid response")
            events = [event for raw in rows if isinstance(raw, dict)
                      and (event := normalize_event(raw, city, start, end)) is not None
                      and (category == "ALL" or event.category == category)]
            return events, page + 1 < total_pages
        except (httpx.HTTPError, ValueError, TypeError, KeyError, AttributeError):
            raise EventsUnavailable() from None
