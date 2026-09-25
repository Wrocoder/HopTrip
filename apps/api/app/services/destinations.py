"""Apply a reviewed provider catalog; never fetch or guess mappings during ingestion."""

import json
from pathlib import Path

from app.models.location import Destination, DestinationAlias
from sqlalchemy import select
from sqlalchemy.orm import Session

CATALOG = Path(__file__).resolve().parents[1] / "data" / "destinations.json"
PROVIDER = "travelpayouts_data"


def sync_destinations(db: Session) -> dict[str, int]:
    """Flush changes without committing; caller owns transaction and pipeline lock.

    Preserve existing names, primary IATA, visibility and manual mappings. Conflicts
    abort the transaction instead of redirecting an existing destination silently.
    """
    rows = json.loads(CATALOG.read_text(encoding="utf-8-sig"))["destinations"]
    result = {"destinations_added": 0, "aliases_added": 0, "destinations_existing": 0}
    for row in rows:
        destination = db.scalar(select(Destination).where(Destination.slug == row["slug"]))
        if destination is None:
            destination = Destination(
                city=row["city"],
                country=row["country"],
                country_code=row["country_code"],
                iata_code=row["code"],
                slug=row["slug"],
                destination_type="CITY",
                is_active=True,
            )
            db.add(destination)
            db.flush()
            result["destinations_added"] += 1
        else:
            if destination.country_code != row["country_code"]:
                raise ValueError(f"Destination country conflict: {row['slug']}")
            result["destinations_existing"] += 1
        for code, kind in [(row["code"], "CITY"), *[(a, "AIRPORT") for a in row["airports"]]]:
            aliases = db.scalars(
                select(DestinationAlias).where(
                    DestinationAlias.provider_code.in_([PROVIDER, "*"]),
                    DestinationAlias.code == code,
                )
            ).all()
            legacy = db.scalars(select(Destination).where(Destination.iata_code == code)).all()
            if any(a.destination_id != destination.id for a in aliases) or any(
                d.id != destination.id for d in legacy
            ):
                raise ValueError(f"Destination mapping conflict: {code}")
            if not any(a.provider_code == PROVIDER and a.kind == kind for a in aliases):
                db.add(
                    DestinationAlias(
                        provider_code=PROVIDER,
                        code=code,
                        kind=kind,
                        destination_id=destination.id,
                    )
                )
                db.flush()
                result["aliases_added"] += 1
    return result
