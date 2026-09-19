from datetime import date
from decimal import Decimal

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


def test_unconfigured_affiliate_click_is_recorded_without_redirect() -> None:
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
        deal = Deal(
            slug="flight-test-deal",
            origin_airport_id=airport.id,
            destination_id=destination.id,
            trip_start=date(2026, 10, 1),
            trip_end=date(2026, 10, 1),
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
        db.add(DealComponent(deal_id=deal.id, component_type="FLIGHT", metadata_json={}))
        db.commit()

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = TestClient(app).get(
            "/go/flight-test-deal/flight?session_id=affiliate-session-1&source=deal_page"
        )
        assert response.status_code == 503
        with Session(engine) as db:
            click = db.scalar(select(AffiliateClick))
            event = db.scalar(select(AnalyticsEvent))
            assert click is not None
            assert click.status == "REJECTED"
            assert event is not None
            assert event.event_name == "AFFILIATE_CLICK"
    finally:
        app.dependency_overrides.clear()
