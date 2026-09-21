from datetime import UTC, datetime
from decimal import Decimal

from app.db.base import Base
from app.models.data_provider import DataProvider
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation, TravelOffer
from app.providers.base import RawTravelOffer
from app.services.currency import PlnOnlyConverter
from app.services.ingestion import ingest_offers
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session


def make_db() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    db = Session(engine)
    db.add(DataProvider(code="test_data", name="Test data provider"))
    db.add(Airport(iata_code="WRO", name="Wroclaw", city="Wroclaw", country_code="PL"))
    db.add(
        Destination(
            iata_code="BCN",
            city="Barcelona",
            country="Spain",
            country_code="ES",
            slug="barcelona",
        )
    )
    db.commit()
    return db


def test_ingestion_persists_offer_and_observation() -> None:
    db = make_db()
    raw = RawTravelOffer(
        external_id="offer-1",
        origin="WRO",
        destination="BCN",
        depart_at=datetime(2026, 10, 18, 8, tzinfo=UTC),
        return_at=datetime(2026, 10, 21, 20, tzinfo=UTC),
        price=Decimal(179),
        currency="PLN",
        expires_at=datetime(2026, 9, 20, tzinfo=UTC),
        source="test_data",
        payload={"fixture": True},
    )

    result = ingest_offers(
        db, provider_code="test_data", offers=[raw], converter=PlnOnlyConverter()
    )

    assert result.saved_offers == 1
    assert result.saved_observations == 1
    offer = db.scalar(select(TravelOffer))
    observation = db.scalar(select(PriceObservation))
    assert offer is not None and offer.price_pln == Decimal("179.00")
    assert observation is not None and observation.trip_duration_days == 3


def test_ingestion_updates_same_external_offer() -> None:
    db = make_db()
    raw = RawTravelOffer(
        external_id="offer-1",
        origin="WRO",
        destination="BCN",
        depart_at=datetime(2026, 10, 18, 8, tzinfo=UTC),
        return_at=None,
        price=Decimal(179),
        currency="PLN",
        expires_at=None,
        source="test_data",
        payload={},
    )
    ingest_offers(db, provider_code="test_data", offers=[raw], converter=PlnOnlyConverter())
    result = ingest_offers(
        db, provider_code="test_data", offers=[raw], converter=PlnOnlyConverter()
    )
    assert result.updated_offers == 1
    assert db.query(TravelOffer).count() == 1
