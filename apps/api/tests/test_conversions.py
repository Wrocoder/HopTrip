from datetime import date
from decimal import Decimal

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal
from app.models.location import Airport, Destination
from fastapi.testclient import TestClient
from helpers import approved_program
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
        program = approved_program(db)
        airport = Airport(
            iata_code="WRO", name="Wroclaw Airport", city="Wroclaw", country_code="PL"
        )
        destination = Destination(
            iata_code="BCN",
            city="Barcelona",
            country="Spain",
            country_code="ES",
            slug="barcelona",
        )
        db.add_all([airport, destination])
        db.flush()
        deal = Deal(
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
        db.add(deal)
        db.flush()
        db.add_all(
            [
                AnalyticsEvent(
                    event_name="DEAL_VIEW",
                    anonymous_session_id="analytics-session-1",
                    source="homepage",
                ),
                AnalyticsEvent(
                    event_name="DEAL_VIEW",
                    anonymous_session_id="analytics-session-2",
                    source="homepage",
                ),
                AffiliateClick(
                    provider_id=program.provider_id,
                    program_id=program.id,
                    deal_id=deal.id,
                    component_type="FLIGHT",
                    anonymous_session_id="analytics-session-1",
                    source="deal-page",
                    status="REDIRECTED",
                    outbound_host="partner.example",
                ),
            ]
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
        summary_json = summary.json()
        assert summary_json["total_sessions"] == 2
        assert summary_json["total_deal_views"] == 2
        assert summary_json["total_affiliate_clicks"] == 1
        assert summary_json["confirmed_bookings"] == 1
        assert summary_json["affiliate_ctr_percent"] == "50.00"
        assert summary_json["booking_conversion_percent"] == "0.00"
        assert summary_json["unattributed_conversions"] == 1
        assert summary_json["revenue_per_session_pln"] == "15.00"
        assert summary_json["revenue_per_affiliate_click_pln"] == "30.00"
        assert summary_json["revenue_per_1000_sessions_pln"] == "15000.00"
        assert summary_json["total_conversions"] == 1
        assert summary_json["confirmed_commission_pln"] == "30.00"
        assert summary_json["revenue_by_provider_pln"] == {"travelpayouts": "30.00"}
        assert summary_json["revenue_by_category_pln"] == {"FLIGHT": "30.00"}
        assert summary_json["revenue_by_deal_pln"] == {"conversion-test-deal": "30.00"}

        with Session(engine) as db:
            conversion = db.scalar(select(AffiliateConversion))
            assert conversion is not None
            assert conversion.deal_id is not None
    finally:
        app.dependency_overrides.clear()


def test_admin_conversion_can_resolve_provider_tracking_id() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        program = approved_program(db)
        airport = Airport(
            iata_code="WRO", name="Wroclaw Airport", city="Wroclaw", country_code="PL"
        )
        destination = Destination(
            iata_code="BCN",
            city="Barcelona",
            country="Spain",
            country_code="ES",
            slug="barcelona",
        )
        db.add_all([airport, destination])
        db.flush()
        deal = Deal(
            slug="tracking-conversion-deal",
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
        db.add(deal)
        db.flush()
        db.add(
            AffiliateClick(
                provider_id=program.provider_id,
                program_id=program.id,
                deal_id=deal.id,
                component_type="FLIGHT",
                anonymous_session_id="tracking-session",
                source="deal-page",
                status="REDIRECTED",
                outbound_host="partner.example",
                tracking_id="hoptrip-42",
            )
        )
        db.commit()

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    headers = {"X-Admin-Token": "change-me-in-development"}
    try:
        response = TestClient(app).post(
            "/api/v1/admin/conversions",
            headers=headers,
            json={
                "provider_code": "travelpayouts",
                "provider_conversion_id": "tracking-conversion-1",
                "tracking_id": "hoptrip-42",
                "booking_category": "flight",
                "commission": "12.50",
                "currency": "pln",
                "status": "CONFIRMED",
            },
        )
        assert response.status_code == 201

        with Session(engine) as db:
            conversion = db.scalar(select(AffiliateConversion))
            assert conversion is not None
            assert conversion.click_id is not None
            assert conversion.deal_id is not None
    finally:
        app.dependency_overrides.clear()
