"""Explicit local-only browser fixture app, never imported by production entrypoint."""

import asyncio
import os
import tempfile

if os.getenv("HOPTRIP_E2E") != "1":
    raise RuntimeError("Fixture server requires HOPTRIP_E2E=1")
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from app.config import get_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.services import alerts
from app.services.catalog import serialize_deal
from app.services.flight_facts import flight_facts
from app.services.scoring import SCORE_VERSION, score_flight_deal
from helpers import approved_program, catalog_fixture
from pydantic import SecretStr
from sqlalchemy import create_engine, delete, select
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse, JSONResponse

fixture_dir = tempfile.TemporaryDirectory(prefix="hoptrip-browser-")
engine = create_engine(
    "sqlite:///" + fixture_dir.name.replace("\\", "/") + "/fixture.db",
    connect_args={"check_same_thread": False, "timeout": 30},
)
Base.metadata.create_all(engine)
with Session(engine) as db:
    program = approved_program(db)
    for code, city in [("KRK", "Kraków"), ("WAW", "Warszawa"), ("WMI", "Warszawa")]:
        db.add(Airport(iata_code=code, city=city, name=code, country_code="PL"))
    db.add(Destination(slug="rome", city="Rome", country="Italy", country_code="IT"))
    db.add(Destination(slug="milan", city="Milan", country="Italy", country_code="IT"))
    deal, component = catalog_fixture(db, program=program, slug="browser-deal")
    score_now = datetime.now(UTC)
    score = score_flight_deal(
        current_price=deal.flight_price_pln, baseline_price=Decimal("250"), sample_count=24,
        observed_at=score_now - timedelta(hours=24), expires_at=None, now=score_now,
    )
    deal.score_version = SCORE_VERSION
    deal.score_components = {"breakdown": score.breakdown.model_dump(mode="json")}
    deal.deal_score = score.deal_score
    deal.historical_baseline_pln = Decimal("250")
    for index in range(1, 15):
        now = datetime.now(UTC)
        other = Deal(
            slug=f"browser-{index}",
            origin_airport_id=deal.origin_airport_id,
            destination_id=deal.destination_id,
            trip_start=deal.trip_start,
            trip_end=deal.trip_end,
            depart_at=deal.depart_at,
            nights=3,
            travelers=1,
            flight_price_pln=200 + index,
            total_estimated_pln=200 + index,
            price_per_person_pln=200 + index,
            deal_score=70,
            confidence=0,
            last_verified_at=now,
            expires_at=now - timedelta(hours=1) if index == 14 else now + timedelta(hours=2),
        )
        db.add(other)
        if index == 2:
            provisional = score_flight_deal(
                current_price=Decimal(202), baseline_price=None, sample_count=0,
                observed_at=now, expires_at=None, now=now,
            )
            other.score_version = SCORE_VERSION
            other.score_components = {"breakdown": provisional.breakdown.model_dump(mode="json")}
            other.deal_score = provisional.deal_score
        elif index == 3:
            other.score_version = "flight-v2"
            other.deal_score = 68
            other.score_components = {
                "flight_price": 100, "historical_discount": 40, "convenience": 50,
                "freshness": 50, "confidence": 67, "sample_count": 20,
            }
        db.flush()
        db.add(
            DealComponent(
                deal_id=other.id, component_type="FLIGHT", price_pln=other.price_per_person_pln
            )
        )
    # A complete cached-price flight exercises real API serialization in the browser.
    provider = DataProvider(code="flight-facts-fixture", name="Local schedule fixture")
    db.add(provider)
    db.flush()
    scheduled_deal = db.scalar(select(Deal).where(Deal.slug == "browser-13"))
    scheduled_component = db.scalar(
        select(DealComponent).where(DealComponent.deal_id == scheduled_deal.id)
    )
    scheduled_departure = scheduled_deal.depart_at.replace(tzinfo=UTC)
    scheduled_offer = TravelOffer(
        data_provider_id=provider.id, external_id="schedule", source="travelpayouts_data",
        product_type="FLIGHT", departure_precision="TIME",
        depart_at=scheduled_departure,
        return_at=scheduled_departure + timedelta(days=3),
        original_price=213, original_currency="PLN",
        raw_payload={
            "origin_airport": "WRO", "destination": "BCN", "destination_airport": "BCN",
            "airline": "FR", "transfers": 0, "return_transfers": 1,
            "departure_at": scheduled_departure.isoformat(),
            "return_at": (scheduled_departure + timedelta(days=3)).isoformat(),
            "duration_to": 120, "duration_back": 180,
        },
    )
    db.add(scheduled_offer)
    db.flush()
    scheduled_component.travel_offer_id = scheduled_offer.id
    db.commit()


def override():
    with Session(engine) as db:
        yield db


app.dependency_overrides[get_db] = override


@app.delete("/__test__/growth")
def clear_growth():
    with Session(engine) as db:
        ids = select(Deal.id).where(Deal.slug.like("growth-%"))
        db.execute(delete(DealComponent).where(DealComponent.deal_id.in_(ids)))
        db.execute(delete(Deal).where(Deal.slug.like("growth-%")))
        db.execute(delete(TravelOffer).where(TravelOffer.external_id.like("growth-%")))
        db.commit()
    return {"ok": True}


@app.post("/__test__/growth")
def growth_fixture():
    clear_growth()
    with Session(engine) as db:
        provider = db.scalar(select(DataProvider).limit(1))
        destination = db.scalar(select(Destination).where(Destination.slug == "rome"))
        for index in range(17):
            code = "KRK" if index < 15 else "WAW" if index == 15 else "WMI"
            origin = db.scalar(select(Airport).where(Airport.iata_code == code))
            now = datetime.now(UTC)
            start = datetime(2030, 5, 3, 10, tzinfo=UTC)
            end = datetime(2030, 5, 5, 18, tzinfo=UTC)
            offer = TravelOffer(data_provider_id=provider.id, external_id=f"growth-{index}",
                                source="travelpayouts_data", product_type="FLIGHT", departure_precision="TIME",
                                depart_at=start, return_at=end, original_price=100 + index, original_currency="PLN",
                                raw_payload={"origin_airport": code, "destination_airport": "CIA",
                                             "departure_at": start.isoformat(), "return_at": end.isoformat(),
                                             "duration_to": 120, "duration_back": 120, "transfers": 0, "return_transfers": 0})
            db.add(offer)
            db.flush()
            deal = Deal(slug=f"growth-{index}", origin_airport_id=origin.id, destination_id=destination.id,
                        trip_start=start.date(), trip_end=end.date(), depart_at=start, nights=2, travelers=1,
                        flight_price_pln=100 + index, total_estimated_pln=100 + index, price_per_person_pln=100 + index,
                        deal_score=80, confidence=0, last_verified_at=now, expires_at=now + timedelta(hours=2))
            db.add(deal)
            db.flush()
            db.add(DealComponent(deal_id=deal.id, component_type="FLIGHT", travel_offer_id=offer.id, price_pln=100 + index))
        db.commit()
    return {"ok": True}


@app.post("/__test__/compact-card")
def compact_card(scenario: str = "normal"):
    """Isolated visual regression states; reset after each browser test."""
    with Session(engine) as db:
        offer = db.scalar(select(TravelOffer).where(TravelOffer.external_id == "schedule"))
        payload = dict(offer.raw_payload)
        departure = scheduled_departure + timedelta(days=3)
        if scenario == "midnight":
            departure = departure.replace(hour=21, minute=30)
        payload["return_at"] = departure.isoformat()
        offer.raw_payload = payload
        offer.return_at = departure
        db.commit()
    return {"ok": True}


@app.get("/api/v1/deals/htr01-fixture")
def htr01_fixture():
    """Fixed audit example, isolated from catalog counts and production data."""
    with Session(engine) as db:
        view = serialize_deal(db, db.scalar(select(Deal).where(Deal.slug == "browser-13")))
    view.slug = "htr01-fixture"
    view.trip_start = date(2026, 10, 17)
    view.trip_end = date(2026, 10, 24)
    view.nights = 7
    view.flight_facts = flight_facts(TravelOffer(
        source="travelpayouts_data", product_type="FLIGHT", departure_precision="TIME",
        return_at=datetime(2026, 10, 24, 20, tzinfo=UTC),
        raw_payload={
            "origin_airport": "WRO", "destination_airport": "BCN", "airline": "FR",
            "departure_at": "2026-10-17T10:00:00+02:00", "duration_to": 120,
            "return_at": "2026-10-24T22:00:00+02:00", "duration_back": 160,
        },
    ))
    return view


# This exact local fixture must precede the existing /deals/{slug} route.
app.router.routes.insert(0, app.router.routes.pop())

# Explicit E2E mode above is mandatory. No external mail is sent.
get_settings().alerts_enabled = True
get_settings().alerts_signing_key = SecretStr("local-browser-fixture-key-not-for-production")
get_settings().alerts_site_url = "http://127.0.0.1:3100"
alert_messages = []


def fixture_mail(settings, recipient, subject, body):
    alert_messages.append({"email": recipient, "body": body})


alerts.send_alert_mail = fixture_mail


@app.get("/__test__/mail")
def mailbox(email: str):
    return [message for message in alert_messages if message["email"] == email]


@app.post("/__test__/alerts-enabled")
def alerts_enabled(enabled: bool, digest: bool = False):
    get_settings().alerts_enabled = enabled
    get_settings().alerts_digest_enabled = enabled and digest
    return {"enabled": enabled}

@app.get("/__test__/partner", response_class=HTMLResponse)
def partner():
    return "<h1>Local partner fixture</h1>"


@app.get("/__test__/tracking")
def tracking():
    with Session(engine) as db:
        return {
            "clicks": [
                {
                    "tracking_id": c.tracking_id,
                    "session": c.anonymous_session_id,
                    "program": c.program_id,
                }
                for c in db.scalars(select(AffiliateClick))
            ],
            "events": [
                {"session": e.anonymous_session_id, "name": e.event_name}
                for e in db.scalars(select(AnalyticsEvent))
            ],
        }


@app.middleware("http")
async def catalog_state_fixture(request, call_next):
    # Isolated E2E app only: deterministic transport delay/failure for SSR fetches.
    if request.url.path == "/api/v1/deals":
        if request.query_params.get("budget") == "987654":
            await asyncio.sleep(2)
        if request.query_params.get("budget") == "987653":
            return JSONResponse({"detail": "Fixture unavailable"}, status_code=503)
    return await call_next(request)


@app.post("/__test__/short-trips")
def short_trip_fixtures(enabled: bool):
    with Session(engine) as db:
        ids = select(Deal.id).where(Deal.slug.like("short-%"))
        db.execute(delete(DealComponent).where(DealComponent.deal_id.in_(ids)))
        db.execute(delete(Deal).where(Deal.slug.like("short-%")))
        db.execute(delete(TravelOffer).where(TravelOffer.external_id.like("short-%")))
        db.execute(delete(Airport).where(Airport.iata_code.in_(["WAW", "KTW", "GDN"])))
        if not enabled:
            db.commit()
            return {"enabled": False}
        deal = db.scalar(select(Deal).where(Deal.slug == "browser-deal"))
        provider = db.scalar(select(DataProvider).where(DataProvider.code == "flight-facts-fixture"))
        # HTR-05: isolated airport selections with six, two and zero short trips.
        for code, city, lengths in [("WAW", "Warszawa", [2, 3, 4, 2, 3, 4, 8]),
                                    ("KTW", "Katowice", [2, 4, 7]), ("GDN", "Gdańsk", [9])]:
            airport = Airport(iata_code=code, name=city, city=city, country_code="PL")
            db.add(airport)
            db.flush()
            for index, nights in enumerate(lengths):
                start = datetime.now(UTC) + timedelta(days=30)
                end = start + timedelta(days=nights)
                trip = Deal(slug=f"short-{code}-{index}", origin_airport_id=airport.id,
                            destination_id=deal.destination_id, trip_start=start.date(),
                            trip_end=end.date(), depart_at=start, nights=nights, travelers=1,
                            flight_price_pln=180 + index, total_estimated_pln=180 + index,
                            price_per_person_pln=180 + index, deal_score=70,
                            confidence=0, last_verified_at=datetime.now(UTC),
                            expires_at=datetime.now(UTC) + timedelta(hours=2))
                flight = TravelOffer(data_provider_id=provider.id, external_id=f"short-{code}-{index}",
                                     source="fixture", product_type="FLIGHT", departure_precision="TIME",
                                     depart_at=start, return_at=end, original_price=180 + index,
                                     original_currency="PLN", raw_payload={})
                db.add_all([trip, flight])
                db.flush()
                db.add(DealComponent(deal_id=trip.id, component_type="FLIGHT",
                                     travel_offer_id=flight.id, price_pln=180 + index))
        db.commit()
    return {"enabled": True}
