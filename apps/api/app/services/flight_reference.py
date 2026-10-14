"""Offline snapshot of the existing provider's reference data; no guessed zones."""

import json
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

_data = json.loads((Path(__file__).resolve().parents[1] / "data/flight-reference.json").read_text(encoding="utf-8"))


def airport_timezone(code: str | None) -> str | None:
    zone = _data["airport_timezones"].get(code)
    if not zone:
        return None
    try:
        ZoneInfo(zone)
    except (ZoneInfoNotFoundError, ValueError):
        return None
    return zone


def airline_name(code: str | None) -> str | None:
    return _data["airlines"].get(code)
