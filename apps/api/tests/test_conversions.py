from datetime import date
from decimal import Decimal

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal
from app.models.location import Airport, Destination
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


def test_admin_conversion_upsert_and_summary() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        airport = Airport(iata_code="WRO", name="Wroclaw Airport", city="Wroclaw", country_code="PL")
        destination = Destination(
            iata_code="BCN",
            city="Barcelona",
            country="Spain",
            country_code="ES",
            slug="barcelona",
        )
        db.add_all([airport, destination])
        db.flush()
        db.add(
            Deal(
                slug="conversion-test-deal",
                origin_airport_id=airport.id,
                destination_id=destination.id,
                trip_start=date(2026, 10, 1),
                trip_end=date(2026, 10, 3),
                travelers=1,
                flight_price_pln=Decimal("200.00"),
                total_estimated_pln=Decimal("200.00"),
                price_per_person_pln=Decimal("200.00"),
                deal_score=80,
                confidence=Decimal("0.5000"),
                explanation=["Test deal"],
            )
        )
        db.commit()

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    headers = {"X-Admin-Token": "change-me-in-development"}
    payload = {
        "provider_code": "travelpayouts",
        "program_code": "flight-program",
        "provider_conversion_id": "conversion-1",
        "deal_slug": "conversion-test-deal",
        "booking_category": "FLIGHT",
        "booking_value": "500.00",
        "commission": "25.00",
        "currency": "pln",
        "status": "PENDING",
    }
    try:
        client = TestClient(app)
        assert client.post("/api/v1/admin/conversions", json=payload).status_code == 401

        created = client.post("/api/v1/admin/conversions", json=payload, headers=headers)
        assert created.status_code == 201
        assert created.json()["created"] is True

        payload["status"] = "CONFIRMED"
        payload["commission"] = "30.00"
        updated = client.post("/api/v1/admin/conversions", json=payload, headers=headers)
        assert updated.status_code == 201
        assert updated.json() == {"id": created.json()["id"], "created": False}

        conversions = client.get("/api/v1/admin/conversions", headers=headers)
        assert conversions.status_code == 200
        assert len(conversions.json()) == 1
        assert conversions.json()[0]["status"] == "CONFIRMED"

        summary = client.get("/api/v1/admin/analytics/summary", headers=headers)
        assert summary.status_code == 200
        assert summary.json()["total_conversions"] == 1
        assert summary.json()["confirmed_commission_pln"] == "30.00"

        with Session(engine) as db:
            conversion = db.scalar(select(AffiliateConversion))
            assert conversion is not None
            assert conversion.deal_id is not None
    finally:
        app.dependency_overrides.clear()
