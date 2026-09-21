from dataclasses import replace
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.data_provider import DataProvider
from app.models.location import Airport, Destination, DestinationAlias
from app.models.offer import PriceObservation, TravelOffer
from app.providers.base import RawTravelOffer
from app.services.availability import available_deals_query
from app.services.currency import PlnOnlyConverter
from app.services.deals import expire_deals, generate_flight_deal
from app.services.ingestion import ingest_offers
from app.services.time import utc
from sqlalchemy import select

NOW = datetime(2030, 9, 1, tzinfo=UTC)


def setup(db):
    db.add_all(
        [
            DataProvider(code="test", name="Test"),
            Airport(iata_code="WRO", name="Wrocław", city="Wrocław", country_code="PL"),
            Destination(
                iata_code="BCN",
                city="Barcelona",
                country="Spain",
                country_code="ES",
                slug="barcelona",
            ),
        ]
    )
    db.commit()
    return RawTravelOffer(
        "one", "WRO", "BCN", NOW + timedelta(days=30), None, Decimal("200"), "PLN", None, "test", {}
    )


def ingest(db, raw, now):
    return ingest_offers(
        db, provider_code="test", offers=[raw], converter=PlnOnlyConverter(), now=now
    )


def test_repeated_cache_does_not_rejuvenate_and_known_new_observation_counts(isolated_db):
    db = isolated_db
    raw = setup(db)
    ingest(db, raw, NOW)
    result = ingest(db, raw, NOW + timedelta(hours=49))
    assert result.duplicate_observations == 1
    offer = db.scalar(select(TravelOffer))
    assert utc(offer.last_verified_at) == NOW
    assert db.query(PriceObservation).count() == 1
    raw = replace(raw, source_observed_at=NOW + timedelta(hours=49))
    ingest(db, raw, NOW + timedelta(hours=49))
    assert db.query(PriceObservation).count() == 2


def test_hidden_deal_survives_regeneration_and_ttl_boundary(isolated_db):
    db = isolated_db
    raw = setup(db)
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, NOW)
    deal.is_visible = False
    db.commit()
    generate_flight_deal(db, offer, NOW + timedelta(hours=1))
    assert not deal.is_visible
    deal.is_visible = True
    db.commit()
    assert db.scalar(available_deals_query(NOW + timedelta(hours=48))) is None
    assert expire_deals(db, NOW + timedelta(hours=48)) == 1
    assert deal.status == "EXPIRED" and deal.is_visible


def test_aliases_and_ambiguity(isolated_db):
    db = isolated_db
    raw = setup(db)
    db.add_all(
        [
            DestinationAlias(provider_code="test", code="GRO", kind="AIRPORT", destination_id=1),
            DestinationAlias(provider_code="test", code="REU", kind="AIRPORT", destination_id=1),
        ]
    )
    db.commit()
    assert ingest(db, replace(raw, destination="GRO"), NOW).saved_offers == 1
    assert ingest(db, replace(raw, destination="REU"), NOW).updated_offers == 1
    unresolved = ingest(db, replace(raw, destination="ZZZ"), NOW)
    assert unresolved.skipped_unresolved_routes == 1
    assert unresolved.unresolved_routes == ["WRO-ZZZ"]
    db.add(Destination(id=2, city="Other", country="Spain", country_code="ES", slug="other"))
    db.add(DestinationAlias(provider_code="*", code="GRO", kind="AIRPORT", destination_id=2))
    db.commit()
    ambiguous = ingest(db, replace(raw, destination="GRO"), NOW)
    assert ambiguous.skipped_ambiguous_routes == 1
    assert ambiguous.ambiguous_routes == ["WRO-GRO"]


def test_departure_in_past_is_not_generated(isolated_db):
    raw = setup(isolated_db)
    ingest(isolated_db, replace(raw, depart_at=NOW - timedelta(seconds=1)), NOW)
    assert generate_flight_deal(isolated_db, isolated_db.scalar(select(TravelOffer)), NOW) is None
