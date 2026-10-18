"""Resolve missing destinations from official reference data, never from price labels."""

import json
import re
import unicodedata
from dataclasses import dataclass
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from app.models.location import Destination, DestinationAlias
from app.providers.base import RawTravelOffer
from app.services.destinations import CATALOG, PROVIDER, sync_destinations
from app.services.ingestion import resolve_destination
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


@dataclass
class DiscoveryResult:
    status: str = "not_needed"
    destinations_added: int = 0
    aliases_added: int = 0
    unresolved_offers: int = 0
    conflicts: int = 0


def _index(rows: object) -> dict[str, dict]:
    if not isinstance(rows, list):
        raise ValueError("Invalid reference list")
    result: dict[str, dict] = {}
    duplicates = set()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get("code"), str):
            continue
        code = row["code"]
        if code in result:
            duplicates.add(code)
        result[code] = row
    return {k: v for k, v in result.items() if k not in duplicates}


def _city_for(code: str, cities: dict, airports: dict) -> str | None:
    if not re.fullmatch(r"[A-Z]{3}", code):
        return None
    airport = airports.get(code)
    airport_city = airport.get("city_code") if airport else None
    if airport and (airport.get("iata_type") != "airport" or not isinstance(airport_city, str)
                    or not re.fullmatch(r"[A-Z]{3}", airport_city) or airport_city not in cities):
        return None
    if code in cities:
        return code if not airport or airport_city == code else None
    return airport_city


async def discover_destinations(
    db: Session, offers: list[RawTravelOffer], *,
    base_url: str = "https://api.travelpayouts.com",
    transport: httpx.AsyncBaseTransport | None = None,
) -> DiscoveryResult:
    result = DiscoveryResult()
    missing = [offer for offer in offers if resolve_destination(db, PROVIDER, offer) == (None, False)]
    if not missing:
        return result
    result.unresolved_offers = len(missing)
    # Public endpoints; no token and no arbitrary URLs supplied by price records.
    try:
        async with httpx.AsyncClient(timeout=30, transport=transport) as client:
            catalogs = []
            for name in ("cities", "airports", "countries"):
                response = await client.get(f"{base_url.rstrip('/')}/data/en/{name}.json")
                response.raise_for_status()
                catalogs.append(_index(response.json()))
        cities, airports, countries = catalogs
    except (httpx.HTTPError, ValueError):
        # Known routes still ingest. Missing routes are counted and retried next run.
        result.status = "reference_unavailable"
        return result
    reviewed = {r["code"]: r for r in json.loads(CATALOG.read_text(encoding="utf-8-sig"))["destinations"]}
    result.status = "completed"
    for offer in missing:
        if resolve_destination(db, PROVIDER, offer) != (None, False):
            continue
        codes = {offer.destination}
        if offer.payload.get("destination_airport"):
            codes.add(str(offer.payload["destination_airport"]))
        targets = {_city_for(code, cities, airports) for code in codes}
        if None in targets or len(targets) != 1:
            result.conflicts += 1
            continue
        city_code = targets.pop()
        assert city_code is not None
        city = cities[city_code]
        country_code = city.get("country_code", "")
        if not isinstance(country_code, str):
            result.conflicts += 1
            continue
        country = countries.get(country_code, {})
        city_name, country_name = city.get("name"), country.get("name")
        if (not isinstance(country_code, str) or not re.fullmatch(r"[A-Z]{2}", country_code)
                or not isinstance(city_name, str) or not 1 <= len(city_name.strip()) <= 120
                or not isinstance(country_name, str) or not 1 <= len(country_name.strip()) <= 120
                or any(airports[c].get("country_code") != country_code for c in codes if c in airports)):
            result.conflicts += 1
            continue
        try:
            timezone = city.get("time_zone", "")
            ZoneInfo(timezone)
        except (ZoneInfoNotFoundError, ValueError, TypeError):
            result.conflicts += 1
            continue
        # Only attach airports explicitly seen in these offers. Add city identity too.
        all_codes = codes | {city_code}
        ids = set(db.scalars(select(DestinationAlias.destination_id).where(
            DestinationAlias.provider_code.in_([PROVIDER, "*"]),
            DestinationAlias.code.in_(all_codes),
        ))) | set(db.scalars(select(Destination.id).where(Destination.iata_code.in_(all_codes))))
        existing = db.get(Destination, next(iter(ids))) if len(ids) == 1 else None
        if len(ids) > 1 or (existing and (not existing.is_active or existing.country_code != country_code)):
            result.conflicts += 1
            continue
        if existing:
            slug = existing.slug
        elif city_code in reviewed:
            slug = reviewed[city_code]["slug"]
            if reviewed[city_code]["country_code"] != country_code:
                result.conflicts += 1
                continue
        else:
            stem = unicodedata.normalize("NFKD", city_name).encode("ascii", "ignore").decode().lower()
            stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")[:120] or "city"
            slug = f"{stem}-{country_code.lower()}-{city_code.lower()}"
        collision = db.scalar(select(Destination).where(Destination.slug == slug))
        if collision and (not existing or collision.id != existing.id):
            # Reviewed slug can belong to a manually maintained/disabled city.
            result.conflicts += 1
            continue
        row = {"code": city_code, "city": city_name, "country": country_name,
               "country_code": country_code, "slug": slug,
               "airports": sorted(code for code in codes if code in airports)}
        try:
            with db.begin_nested():
                changes = sync_destinations(db, rows=[row])
                destination = db.scalar(select(Destination).where(Destination.slug == slug))
                assert destination is not None
                if changes["destinations_added"]:
                    destination.timezone = timezone
                db.flush()
            result.destinations_added += changes["destinations_added"]
            result.aliases_added += changes["aliases_added"]
        except (ValueError, IntegrityError):
            result.conflicts += 1
    result.unresolved_offers = sum(
        resolve_destination(db, PROVIDER, offer)[0] is None for offer in missing
    )
    return result
