from dataclasses import replace

import pytest
from app.models.location import Destination, DestinationAlias
from app.services.destinations import PROVIDER, sync_destinations
from app.services.ingestion import resolve_destination
from sqlalchemy import func, select
from tests.test_lifecycle import setup


def test_catalog_resolves_city_and_airport_preserving_existing(isolated_db):
    db = isolated_db
    raw = setup(db)
    db.add(
        Destination(
            city="My Milan",
            country="Italy",
            country_code="IT",
            iata_code="MXP",
            slug="milan",
            is_active=True,
        )
    )
    db.commit()
    first = sync_destinations(db)
    db.commit()
    assert first["destinations_added"] > 50
    milan = db.scalar(select(Destination).where(Destination.slug == "milan"))
    assert milan.city == "My Milan" and milan.iata_code == "MXP"
    for city, airport, slug in [
        ("MIL", "BGY", "milan"),
        ("PAR", "BVA", "paris"),
        ("ROM", "CIA", "rome"),
        ("BUD", "BUD", "budapest"),
    ]:
        target = db.scalar(select(Destination).where(Destination.slug == slug))
        assert resolve_destination(
            db, PROVIDER, replace(raw, destination=city, payload={"destination_airport": airport})
        ) == (target.id, False)
    second = sync_destinations(db)
    assert second["destinations_added"] == second["aliases_added"] == 0
    # No speculative mapping of Girona to Barcelona, or Memmingen to Munich.
    assert resolve_destination(db, PROVIDER, replace(raw, destination="GRO", payload={})) == (
        None,
        False,
    )


def test_conflict_rolls_back_catalog(isolated_db):
    db = isolated_db
    db.add(Destination(id=999, city="Other", country="Italy", country_code="IT", slug="other"))
    db.add(DestinationAlias(provider_code="*", code="MIL", kind="CITY", destination_id=999))
    db.commit()
    with pytest.raises(ValueError, match="mapping conflict: MIL"):
        sync_destinations(db)
    db.rollback()
    assert db.scalar(select(func.count()).select_from(Destination)) == 1


def test_dry_run_and_disabled_destination(isolated_db):
    db = isolated_db
    sync_destinations(db)
    db.rollback()
    assert db.scalar(select(func.count()).select_from(Destination)) == 0
    db.add(
        Destination(
            city="Milan",
            country="Italy",
            country_code="IT",
            slug="milan",
            iata_code="MXP",
            is_active=False,
        )
    )
    db.commit()
    sync_destinations(db)
    db.commit()
    assert not db.scalar(select(Destination).where(Destination.slug == "milan")).is_active
