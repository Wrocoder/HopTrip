"""Shared destination search vocabulary for API resolution and browser suggestions."""

import json
from functools import lru_cache
from pathlib import Path

from app.models.location import Destination, DestinationAlias
from app.services.airports import normalize_airport_input
from sqlalchemy import select
from sqlalchemy.orm import Session

# Polish labels are presentation only: persisted slugs and provider codes stay unchanged.
POLISH_NAMES = {
    "rome": "Rzym", "lisbon": "Lizbona", "athens": "Ateny", "milan": "Mediolan",
    "paris": "Paryż", "london": "Londyn", "brussels": "Bruksela", "chisinau": "Kiszyniów",
    "basel": "Bazylea", "podgorica": "Podgorica", "gdansk": "Gdańsk", "budapest": "Budapeszt",
    "venice": "Wenecja", "nice": "Nicea", "warsaw": "Warszawa", "valencia": "Walencja",
    "stockholm": "Sztokholm", "pisa": "Piza", "bologna": "Bolonia", "bratislava": "Bratysława",
    "vilnius": "Wilno", "prague": "Praga", "vienna": "Wiedeń", "dubrovnik": "Dubrownik",
    "bucharest": "Bukareszt", "bourgas": "Burgas", "copenhagen": "Kopenhaga",
    "krakow": "Kraków", "riga": "Ryga", "wroclaw": "Wrocław", "madrid": "Madryt",
    "brasov": "Braszów", "kutaisi": "Kutaisi", "catania": "Katania", "naples": "Neapol",
    "larnaca": "Larnaka", "paphos": "Pafos", "poznan": "Poznań", "malaga": "Malaga", "aalesund": "Ålesund", "tromso": "Tromsø",
}


@lru_cache
def _catalog():
    path = Path(__file__).resolve().parents[1] / "data" / "destinations.json"
    return {row["slug"]: row for row in json.loads(path.read_text(encoding="utf-8-sig"))["destinations"]}


def destination_search_fields(db: Session, destinations: list[Destination]) -> dict[int, dict]:
    codes: dict[int, set[str]] = {d.id: set() for d in destinations}
    for alias in db.scalars(select(DestinationAlias)):
        if alias.destination_id in codes:
            codes[alias.destination_id].add(alias.code)
    result = {}
    for destination in destinations:
        row = _catalog().get(destination.slug)
        reviewed = row is not None and row["country_code"] == destination.country_code
        label = POLISH_NAMES.get(destination.slug, destination.city) if reviewed else destination.city
        aliases = {destination.city}
        if reviewed:
            aliases.add(row["city"])
            codes[destination.id].update([row["code"], *row["airports"]])
        if destination.iata_code:
            codes[destination.id].add(destination.iata_code)
        result[destination.id] = {
            "display_name": label,
            "aliases": sorted(aliases | {label}),
            "iata_codes": sorted(codes[destination.id]),
        }
    return result


def matching_destinations(db: Session, value: str) -> list[Destination]:
    normalized = normalize_airport_input(value)
    if not normalized:
        return []
    destinations = list(db.scalars(select(Destination).where(Destination.is_active.is_(True))))
    # A canonical slug always resolves itself, even when labels or IATA codes collide.
    exact = [d for d in destinations if d.slug == value.strip()]
    if exact:
        return exact
    fields = destination_search_fields(db, destinations)
    return [d for d in destinations if normalized in {
        normalize_airport_input(term)
        for term in (d.slug, *fields[d.id]["aliases"], *fields[d.id]["iata_codes"])
    }]
