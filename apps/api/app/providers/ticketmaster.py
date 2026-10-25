"""Bounded Discovery adapter. No raw responses, credentials or request URLs are logged."""

import logging
import re
from datetime import UTC, date, datetime, time
from decimal import Decimal, InvalidOperation
from typing import Literal
from urllib.parse import parse_qsl, urlsplit
from zoneinfo import ZoneInfo

import httpx

from app.schemas.event import EventCategory, EventRead
from app.services.event_destinations import EventCity, city_name

SEGMENTS = {"MUSIC": "Music", "SPORTS": "Sports", "CULTURE": "Arts & Theatre"}
TICKET_HOSTS = {prefix + 'ticketmaster.' + suffix
                for prefix in ('', 'www.', 'shop.')
                for suffix in ('at', 'be', 'ch', 'cy', 'cz', 'de', 'dk', 'es', 'fi', 'fr',
                               'co.uk', 'gr', 'ie', 'it', 'nl', 'no', 'pl', 'se', 'com.tr')}


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
    def __init__(self, status_code: int | None = None):
        self.status_code = status_code
        super().__init__("Event source temporarily unavailable")


def exact_datetime(raw: object) -> datetime | None:
    if not isinstance(raw, str) or 'T' not in raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace('Z', '+00:00'))
        return parsed.astimezone(UTC) if parsed.tzinfo is not None else None
    except ValueError:
        return None


def safe_ticket_url(value: str, affiliate_id: str = '7853869') -> str | None:
    try:
        url = urlsplit(value)
        if (
            url.scheme != "https" or url.hostname != 'ticketmaster.evyy.net'
            or url.username or url.password or url.port not in (None, 443)
            or "\\" in value or any(ord(char) < 32 for char in value)
            or any(key.lower() in {"apikey", "api_key"} for key, _ in parse_qsl(url.query))
        ):
            return None
        if not re.fullmatch(r'/c/' + re.escape(affiliate_id) + r'/\d+/\d+', url.path):
            return None
        targets = [target for key, target in parse_qsl(url.query) if key == 'u']
        if len(targets) != 1:
            return None
        target = urlsplit(targets[0])
        if (target.scheme != 'https' or target.hostname not in TICKET_HOSTS
                or target.username or target.password or target.port not in (None, 443)
                or '\\' in targets[0] or any(ord(c) < 32 for c in targets[0])
                or any(k.lower() in {'apikey', 'api_key', 'url', 'redirect', 'redirect_url'}
                       for k, _ in parse_qsl(target.query))):
            return None
        return value
    except (ValueError, TypeError):
        return None


def normalize_event(
    raw: dict, city: EventCity, start: date, end: date, affiliate_id: str = '7853869',
) -> EventRead | None:
    try:
        dates = raw["dates"]
        first = dates["start"]
        status = dates["status"]["code"]
        if (raw.get("test") or first.get("dateTBA") or first.get("dateTBD")
                or status not in {"onsale", "rescheduled"}):
            return None
        start_date = date.fromisoformat(first["localDate"])
        last = dates.get("end") or {}
        end_date = date.fromisoformat(last["localDate"]) if last.get("localDate") else None
        ends_at = exact_datetime(last.get('dateTime')) if not last.get('approximate') and not last.get('noSpecificTime') else None
        if end_date is None and ends_at:
            end_date = ends_at.astimezone(ZoneInfo(city.timezone)).date()
        if (end_date and end_date < start_date) or start_date > end or (end_date or start_date) < start:
            return None
        venues = raw["_embedded"]["venues"]
        venue = next((v for v in venues if
                      city_name(v.get("city", {}).get("name", "")) in
                      {city_name(name) for name in city.names}
                      and v.get("country", {}).get("countryCode") == city.country), None)
        if not venue:
            return None
        # The reviewed city zone is a fallback when the event omits it.
        zone = dates.get("timezone") or venue.get("timezone") or city.timezone
        if zone != city.timezone:
            return None
        local_time = time.fromisoformat(first["localTime"]) if first.get("localTime") and not first.get("timeTBA") and not first.get("noSpecificTime") else None
        starts_at = exact_datetime(first.get('dateTime')) if not first.get('timeTBA') and not first.get('noSpecificTime') else None
        if starts_at and (starts_at.astimezone(ZoneInfo(zone)).date() != start_date
                          or (local_time is not None and starts_at.astimezone(ZoneInfo(zone)).time() != local_time)):
            starts_at = None
            local_time = None
        if starts_at and local_time is None:
            local_time = starts_at.astimezone(ZoneInfo(zone)).time()
        if ends_at:
            local_end_date = ends_at.astimezone(ZoneInfo(zone)).date()
            if local_end_date < start_date or (end_date is not None and end_date != local_end_date) or (starts_at and ends_at <= starts_at):
                ends_at = None
            else:
                end_date = local_end_date
        url = safe_ticket_url(raw["url"], affiliate_id)
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
            local_time=local_time, start_at=starts_at, end_at=ends_at,
            price_from=price, currency=currency,
        )
    except (ValueError, TypeError, KeyError, AttributeError):
        # One malformed item must not break a flight page or other valid events.
        return None


class TicketmasterProvider:
    def fetch_page(
        self, client: httpx.Client, key: str, city: EventCity, start: date, end: date,
        category: EventCategory, page: int,
        affiliate_id: str = '7853869', strict: bool = False,
    ) -> tuple[list[EventRead], bool]:
        rows, more = self.fetch_raw_page(client, key, city, start, end, category, page)
        if strict:
            # A malformed response cannot authorize hiding the previous catalogue.
            try:
                for raw in rows:
                    if not raw['id'] or not raw['name'] or not raw['dates']['status']['code']:
                        raise ValueError()
                    first = raw['dates']['start']
                    if not first.get('dateTBA') and not first.get('dateTBD'):
                        date.fromisoformat(first['localDate'])
                if more and not rows:
                    raise ValueError()
            except (ValueError, KeyError, TypeError, AttributeError):
                raise EventsUnavailable() from None
        events = [event for raw in rows if isinstance(raw, dict)
                  and (event := normalize_event(raw, city, start, end, affiliate_id)) is not None
                  and (category == 'ALL' or event.category == category)]
        return events, more

    def fetch_raw_page(
        self, client: httpx.Client, key: str, city: EventCity, start: date, end: date,
        category: EventCategory, page: int,
    ) -> tuple[list[dict], bool]:
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
            if any(not isinstance(raw, dict) for raw in rows):
                raise ValueError('Invalid event row')
            return rows, page + 1 < total_pages
        except httpx.HTTPStatusError as exc:
            raise EventsUnavailable(exc.response.status_code) from None
        except (httpx.HTTPError, ValueError, TypeError, KeyError, AttributeError):
            raise EventsUnavailable() from None
