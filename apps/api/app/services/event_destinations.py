"""Resolve reviewed catalog destinations without guessing nearby cities or time zones."""

import json
import unicodedata
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.services.flight_reference import airport_timezone

MARKETS = frozenset('AT BE CH CY CZ DE DK ES FI FR GB GR IE IT NL NO PL SE TR'.split())
# Local spellings used by Discovery. English catalog names remain valid aliases.
ALIASES = {
    'vienna': ('Wien',), 'brussels': ('Bruxelles', 'Brussel'), 'prague': ('Praha',),
    'copenhagen': ('København', 'Kobenhavn'), 'aarhus': ('Århus',),
    'athens': ('Athina', 'Αθήνα', 'Αθήνα'), 'thessaloniki': ('Θεσσαλονίκη',),
    'milan': ('Milano',), 'rome': ('Roma',), 'naples': ('Napoli',),
    'venice': ('Venezia',), 'turin': ('Torino',), 'genoa': ('Genova',),
    'gothenburg': ('Göteborg',), 'aalesund': ('Ålesund',), 'tromso': ('Tromsø',),
    'warsaw': ('Warszawa',), 'krakow': ('Kraków',), 'gdansk': ('Gdańsk',),
    'wroclaw': ('Wrocław',), 'poznan': ('Poznań',), 'rzeszow': ('Rzeszów',),
    'zielona-gora': ('Zielona Góra',), 'palma': ('Palma de Mallorca',),
    'larnaca': ('Larnaka',), 'paphos': ('Pafos',),
}


def city_name(value: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFKD', value.casefold())
                   if not unicodedata.combining(c)).replace('ł', 'l').strip()


@dataclass(frozen=True)
class EventCity:
    names: tuple[str, ...]
    country: str
    timezone: str


@lru_cache
def event_cities() -> dict[str, EventCity]:
    path = Path(__file__).resolve().parents[1] / 'data/destinations.json'
    result = {}
    for row in json.loads(path.read_text(encoding='utf-8-sig'))['destinations']:
        zones = {zone for airport in row['airports'] if (zone := airport_timezone(airport))}
        # Basel's airport has Swiss and French codes; the destination is Switzerland.
        if row['slug'] == 'basel':
            zones = {'Europe/Zurich'}
        if row['country_code'] in MARKETS and len(zones) == 1:
            result[row['slug']] = EventCity(
                (row['city'], *ALIASES.get(row['slug'], ())), row['country_code'], zones.pop(),
            )
    return result


def event_city(
    slug: str, country: str, enabled_countries: str,
    name: str = '', timezone: str | None = None,
) -> EventCity | None:
    city = event_cities().get(slug)
    enabled = {code.strip().upper() for code in enabled_countries.split(',')}
    # Newly ingested destinations carry a reviewed timezone in the database.
    # These values come from the server's destination record, never request parameters.
    if not city and country in MARKETS and name and timezone:
        try:
            ZoneInfo(timezone)
        except (ValueError, ZoneInfoNotFoundError):
            return None
        city = EventCity((name, *ALIASES.get(slug, ())), country, timezone)
    return city if city and city.country == country and country in enabled else None
