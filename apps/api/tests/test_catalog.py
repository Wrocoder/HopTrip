from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.deal import Deal
from app.models.location import Airport, Destination
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


def test_deal_catalog_filters_by_route() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        wro = Airport(iata_code="WRO", name="Wroclaw Airport", city="Wroclaw", country_code="PL")
        waw = Airport(iata_code="WAW", name="Warsaw Airport", city="Warsaw", country_code="PL")
        barcelona = Destination(
            iata_code="BCN",
            city="Barcelona",
            country="Spain",
            country_code="ES",
            slug="barcelona",
        )
        rome = Destination(
            iata_code="ROM", city="Rome", country="Italy", country_code="IT", slug="rome"
        )
        db.add_all([wro, waw, barcelona, rome])
        db.flush()
        db.add_all(
            [
                _deal(
                    "wro-barcelona",
                    wro.id,
                    barcelona.id,
                    (datetime.now(UTC) + timedelta(days=30)).date(),
                ),
                _deal("waw-rome", waw.id, rome.id, (datetime.now(UTC) + timedelta(days=60)).date()),
            ]
        )
        db.commit()

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        client = TestClient(app)
        by_origin = client.get("/api/v1/deals?origin=wro")
        assert by_origin.status_code == 200
        assert [item["slug"] for item in by_origin.json()] == ["wro-barcelona"]

        by_destination = client.get("/api/v1/deals?destination=rome")
        assert by_destination.status_code == 200
        assert [item["slug"] for item in by_destination.json()] == ["waw-rome"]

        invalid_range = client.get(
            "/api/v1/deals?departure_from=2026-12-01&departure_to=2026-11-01"
        )
        assert invalid_range.status_code == 422
    finally:
        app.dependency_overrides.clear()


def _deal(slug: str, airport_id: int, destination_id: int, trip_start: date) -> Deal:
    return Deal(
        slug=slug,
        origin_airport_id=airport_id,
        destination_id=destination_id,
        trip_start=trip_start,
        trip_end=trip_start,
        travelers=1,
        flight_price_pln=Decimal("250.00"),
        total_estimated_pln=Decimal("250.00"),
        price_per_person_pln=Decimal("250.00"),
        deal_score=80,
        confidence=Decimal("0.5000"),
        explanation=["Test deal"],
    )
