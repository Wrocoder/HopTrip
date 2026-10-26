"""Only structured route evidence for the very same cached ticket may fill its legs."""
import hashlib
import json
import re
from datetime import UTC, datetime, timedelta
from decimal import Decimal, InvalidOperation
from urllib.parse import parse_qs, urlsplit

from app.models.offer import TravelOffer
from app.services.time import utc


def ticket_key(link: object) -> str | None:
    if not isinstance(link, str) or len(link) > 16000:
        return None
    try:
        url = urlsplit(link)
        if url.netloc and url.hostname not in {"www.aviasales.com", "www.aviasales.ru"}:
            return None
        path = "/" + url.path[len("/search/"):] if url.path.startswith("/search/") else url.path
        tokens = parse_qs(url.query, keep_blank_values=True).get("t", [])
        if not path.startswith("/") or len(tokens) != 1 or not tokens[0]:
            return None
        # Compare the opaque selected-ticket identifier; never decode it into airports.
        return hashlib.sha256(json.dumps([path, tokens[0]]).encode()).hexdigest()
    except ValueError:
        return None


def instant(value: object) -> datetime | None:
    if not isinstance(value, str) or "T" not in value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.astimezone(UTC) if parsed.tzinfo else None
    except (ValueError, OverflowError):
        return None


def validated_segments(offer: TravelOffer, evidence: object) -> list[list[dict]] | None:
    if (offer.departure_precision != "TIME" or not isinstance(evidence, dict)
            or evidence.get("source") != "travelpayouts_graphql"):
        return None
    payload = offer.raw_payload or {}
    key = ticket_key(payload.get("link"))
    if not key or evidence.get("ticket_key") != key or offer.return_at is None:
        return None
    currency = evidence.get("currency")
    if (not isinstance(currency, str) or instant(evidence.get("departure_at")) != utc(offer.depart_at)
            or evidence.get("origin_airport_iata") != payload.get("origin_airport")
            or evidence.get("destination_airport_iata") != payload.get("destination_airport")
            or currency.upper() != offer.original_currency.upper()):
        return None
    try:
        value = Decimal(str(evidence.get("value")))
        # The same opaque ticket has slightly different converted/rounded PLN values.
        if not value.is_finite() or abs(value - Decimal(offer.original_price)) > Decimal("1"):
            return None
    except (InvalidOperation, TypeError, ValueError):
        return None
    segments = evidence.get("segments")
    if not isinstance(segments, list) or len(segments) != 2:
        return None
    result = []
    previous_end = None
    for index, segment in enumerate(segments):
        if not isinstance(segment, dict):
            return None
        legs = segment.get("flight_legs")
        if not isinstance(legs, list) or not 1 <= len(legs) <= 21:
            return None
        start, end = instant(segment.get("departure_at")), instant(segment.get("arrival_at"))
        if not start or not end or not timedelta(0) < end - start <= timedelta(days=7):
            return None
        if previous_end and start < previous_end:
            return None
        previous_end = end
        last_arrival = None
        airborne = 0.0
        for leg in legs:
            if not isinstance(leg, dict):
                return None
            if not all(isinstance(leg.get(k), str) and re.fullmatch(r"[A-Z]{3}", leg[k])
                       for k in ("origin", "destination")):
                return None
            departure, arrival = instant(leg.get("departure_at")), instant(leg.get("arrival_at"))
            if (not departure or not arrival or arrival <= departure
                    or (last_arrival and departure < last_arrival)):
                return None
            last_arrival = arrival
            airborne += (arrival - departure).total_seconds() / 60
        if instant(legs[0]["departure_at"]) != start or last_arrival != end:
            return None
        # Do not compare same-named fields across APIs: REST is departure, GQL arrival.
        if index == 1 and (utc(offer.return_at) != start or instant(evidence.get("return_at")) != end):
            return None
        stops = payload.get("transfers" if index == 0 else "return_transfers")
        if type(stops) is int and stops != len(legs) - 1:
            return None
        duration = payload.get("duration_to" if index == 0 else "duration_back")
        if type(duration) is int:
            elapsed = (end - start).total_seconds() / 60
            if min(abs(elapsed - duration), abs(airborne - duration)) > 1:
                return None
        result.append(legs)
    if (result[0][0]["origin"] != payload.get("origin_airport")
            or result[0][-1]["destination"] != payload.get("destination_airport")
            or instant(result[0][0]["departure_at"]) != utc(offer.depart_at)):
        return None
    for name, actual in (("return_origin_airport", result[1][0]["origin"]),
                         ("return_destination_airport", result[1][-1]["destination"])):
        explicit = payload.get(name)
        if isinstance(explicit, str) and re.fullmatch(r"[A-Z]{3}", explicit) and explicit != actual:
            return None
    return result
