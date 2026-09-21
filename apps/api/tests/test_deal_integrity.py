from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate_click import AffiliateClick
from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.models.statistics import RouteStatistics
from app.providers.base import RawTravelOffer
from app.services.currency import PlnOnlyConverter
from app.services.deals import generate_flight_deal
from app.services.ingestion import ingest_offers
from fastapi.testclient import TestClient
from helpers import approved_program
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    with Session(engine, autoflush=False) as session:
        session.add_all(
            [
                DataProvider(code="test", name="Test"),
                Airport(iata_code="WRO", name="Wroclaw", city="Wroclaw", country_code="PL"),
                Destination(
                    iata_code="BCN",
                    city="Barcelona",
                    country="Spain",
                    country_code="ES",
                    slug="barcelona",
                ),
            ]
        )
        session.commit()
        yield session
    engine.dispose()


@pytest.mark.parametrize("unavailable", ["expired", "stale", "inactive", "hidden"])
def test_all_public_routes_reject_unavailable_deals(db, monkeypatch, unavailable):
    now = datetime.now(UTC)
    program = approved_program(db)
    for slug in ["fresh", "unavailable"]:
        deal = Deal(
            slug=slug,
            origin_airport_id=1,
            destination_id=1,
            trip_start=(now + timedelta(days=30)).date(),
            trip_end=(now + timedelta(days=33)).date(),
            total_estimated_pln=Decimal(200),
            price_per_person_pln=Decimal(200),
            deal_score=70,
            confidence=Decimal("0.5"),
            last_verified_at=now,
            expires_at=now + timedelta(hours=1),
        )
        if slug == "unavailable":
            if unavailable == "expired":
                deal.expires_at = now
            elif unavailable == "stale":
                deal.last_verified_at = now - timedelta(hours=48, seconds=1)
            elif unavailable == "inactive":
                deal.status = "EXPIRED"
            else:
                deal.is_visible = False
        db.add(deal)
        db.flush()
        db.add(
            DealComponent(
                deal_id=deal.id,
                component_type="FLIGHT",
                affiliate_program_id=program.id,
                metadata_json={"outbound_url": "https://partner.example/flight"},
            )
        )
    db.commit()

    def override_db():
        yield db

    app.dependency_overrides[get_db] = override_db
    try:
        with TestClient(app) as client:
            for path in [
                "/api/v1/deals",
                "/api/v1/departures/WRO/deals",
                "/api/v1/destinations/barcelona/deals",
            ]:
                response = client.get(path)
                assert response.status_code == 200
                assert [item["slug"] for item in response.json()] == ["fresh"]
            assert client.get("/api/v1/deals/fresh").status_code == 200
            assert client.get("/api/v1/deals/unavailable").status_code == 404
            assert client.get("/go/unavailable/flight", follow_redirects=False).status_code == 404
            assert db.scalar(select(AffiliateClick)) is None
            assert client.get("/go/fresh/flight", follow_redirects=False).status_code == 307
    finally:
        app.dependency_overrides.clear()


def make_offer(db, duration):
    depart_at = datetime.now(UTC) + timedelta(days=30)
    offer = TravelOffer(
        data_provider_id=1,
        external_id="offer",
        product_type="FLIGHT",
        origin_airport_id=1,
        destination_id=1,
        depart_at=depart_at,
        return_at=depart_at + timedelta(days=duration) if duration is not None else None,
        original_price=Decimal(100),
        original_currency="PLN",
        price_pln=Decimal(100),
        source="test",
        last_verified_at=datetime.now(UTC),
    )
    db.add(offer)
    db.commit()
    return offer


@pytest.mark.parametrize("duration", [None, 3])
def test_baseline_matches_duration_and_component_price_is_refreshed(db, duration):
    offer = make_offer(db, duration)
    for bucket_duration, price in [(7, 900), (None, 200), (3, 300)]:
        db.add(
            RouteStatistics(
                data_provider_id=1,
                origin_airport_id=1,
                destination_id=1,
                product_type="FLIGHT",
                departure_month=offer.depart_at.strftime("%Y-%m"),
                trip_duration_days=bucket_duration,
                sample_count=10,
                min_price_pln=price,
                p25_price_pln=price,
                median_price_pln=price,
                p75_price_pln=price,
                max_price_pln=price,
                confidence=Decimal("0.3333"),
            )
        )
    db.commit()
    deal = generate_flight_deal(db, offer)
    assert deal.historical_baseline_pln == Decimal(200 if duration is None else 300)
    component = db.scalar(select(DealComponent))
    component.metadata_json = {"outbound_url": "https://partner.example/approved"}
    offer.price_pln = Decimal(150)
    db.commit()
    updated = generate_flight_deal(db, offer)
    assert updated.id == deal.id
    assert updated.flight_price_pln == Decimal(150)
    assert db.scalars(select(DealComponent)).all() == [component]
    assert component.price_pln == Decimal(150)
    assert component.metadata_json["outbound_url"] == "https://partner.example/approved"


def test_missing_duration_baseline_is_not_borrowed_from_another_trip(db):
    offer = make_offer(db, 3)
    db.add(
        RouteStatistics(
            data_provider_id=1,
            origin_airport_id=1,
            destination_id=1,
            product_type="FLIGHT",
            departure_month=offer.depart_at.strftime("%Y-%m"),
            trip_duration_days=7,
            sample_count=30,
            min_price_pln=900,
            p25_price_pln=900,
            median_price_pln=900,
            p75_price_pln=900,
            max_price_pln=900,
            confidence=1,
        )
    )
    db.commit()
    deal = generate_flight_deal(db, offer)
    assert deal.historical_baseline_pln is None
    assert deal.discount_percent == 0


def test_duplicate_external_offer_in_batch_with_production_autoflush_setting(db):
    raw = RawTravelOffer(
        external_id="same-offer",
        origin="WRO",
        destination="BCN",
        depart_at=datetime(2027, 10, 1, tzinfo=UTC),
        return_at=None,
        price=Decimal(200),
        currency="PLN",
        expires_at=None,
        source="test",
        payload={},
    )
    result = ingest_offers(
        db, provider_code="test", offers=[raw, raw], converter=PlnOnlyConverter()
    )
    assert result.saved_offers == 1
    assert result.updated_offers == 1
    assert len(db.scalars(select(TravelOffer)).all()) == 1
