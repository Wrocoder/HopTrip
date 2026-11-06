"""Explicit local-only browser fixture app, never imported by production entrypoint."""

import asyncio
import json
import os
import tempfile
from copy import deepcopy
from typing import Literal

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
from app.schemas.event import EventResults
from app.services import alert_digests, alerts
from app.services.catalog import serialize_deal
from app.services.events import event_service
from app.services.flight_facts import flight_facts
from app.services.flight_quality import classify_flight_quality
from app.services.scoring import SCORE_VERSION, score_flight_deal
from fastapi import Query
from helpers import approved_program, catalog_fixture
from pydantic import SecretStr
from sqlalchemy import create_engine, delete, select
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse, JSONResponse

fixture_dir = tempfile.TemporaryDirectory(prefix="hoptrip-browser-")


@app.get("/__test__/grow03-external", response_class=HTMLResponse)
def synthetic_partner_destination(kind: Literal["synthetic", "stay", "stay22", "ticket"] = "synthetic"):
    """Loopback destination for native popups, including requests bypassing routing."""
    heading = {"stay": "Local Stay22 destination", "stay22": "Stay22 test destination",
               "ticket": "Local ticket fixture"}.get(kind, "Synthetic external destination")
    return HTMLResponse(f"<title>{heading}</title><h1>{heading}</h1>", headers={"Cache-Control": "no-store"})


if os.getenv("HOPTRIP_E2E_LOCAL_PARTNERS") == "1":
    @app.middleware("http")
    async def keep_partner_redirects_local(request, call_next):
        """Exercise the real /go policy and journal, then contain browser navigation."""
        response = await call_next(request)
        if (request.url.path.startswith("/go/") and response.status_code == 307
                and request.headers.get("x-hoptrip-fixture-original-redirect") != "1"):
            response.headers["Location"] = "/__test__/grow03-external"
            response.headers["X-HopTrip-Fixture"] = "loopback-partner"
        return response


# Browser tests intercept event responses. Never call the real provider from this app.
get_settings().events_enabled = True
get_settings().ticketmaster_api_key = SecretStr('local-browser-fixture')
event_service.search = lambda *args, **kwargs: EventResults(status='EMPTY')
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
    deal.last_verified_at = score_now - timedelta(hours=3)
    score = score_flight_deal(
        current_price=deal.flight_price_pln, baseline_price=Decimal("250"), sample_count=24,
        observed_at=score_now - timedelta(hours=3), expires_at=None, now=score_now,
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
    # A normal schedule must not turn into a midnight-return case as the clock advances.
    scheduled_departure = scheduled_deal.depart_at.replace(tzinfo=UTC, hour=10, minute=0, second=0, microsecond=0)
    scheduled_offer = TravelOffer(
        data_provider_id=provider.id, external_id="schedule", source="travelpayouts_data",
        product_type="FLIGHT", departure_precision="TIME",
        depart_at=scheduled_departure,
        return_at=scheduled_departure + timedelta(days=3),
        original_price=213, original_currency="PLN",
        raw_payload={
            "origin_airport": "WRO", "destination": "BCN", "destination_airport": "BCN",
            "return_origin_airport": "BCN", "return_destination_airport": "WRO",
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

quality_original = None


@app.post("/__test__/quality")
def quality_fixture(scenario: Literal["complete", "partial", "critical", "reset"]):
    """Synthetic itinerary quality; this module is guarded by HOPTRIP_E2E=1."""
    global quality_original
    from app.services.flight_routes import ticket_key
    from app.services.time import utc

    with Session(engine) as db:
        deal = db.scalar(select(Deal).where(Deal.slug == "browser-13"))
        component = db.scalar(select(DealComponent).where(DealComponent.deal_id == deal.id))
        offer = db.get(TravelOffer, component.travel_offer_id)
        if quality_original is None:
            quality_original = deepcopy((offer.raw_payload, offer.route_details))
        if scenario == "reset":
            offer.raw_payload, offer.route_details = deepcopy(quality_original)
        else:
            start, back = utc(offer.depart_at), utc(offer.return_at)
            arrival, home = start + timedelta(hours=2), back + timedelta(hours=2)
            payload = dict(origin="WRO", origin_airport="WRO", destination="BCN",
                destination_airport="BCN", return_origin_airport="BCN", return_destination_airport="WRO",
                airline="FR", transfers=0, return_transfers=0, duration_to=120, duration_back=120,
                departure_at=start.isoformat(), return_at=back.isoformat(),
                link="/search/quality-fixture?t=synthetic-selected-ticket")
            details = dict(source="travelpayouts_graphql", ticket_key=ticket_key(payload["link"]),
                origin_airport_iata="WRO", destination_airport_iata="BCN", currency="pln", value=213,
                departure_at=start.isoformat(), return_at=home.isoformat(), segments=[
                    dict(departure_at=start.isoformat(), arrival_at=arrival.isoformat(), flight_legs=[
                        dict(origin="WRO", destination="BCN", departure_at=start.isoformat(),
                             arrival_at=arrival.isoformat(), operating_carrier="FR", flight_number="123")]),
                    dict(departure_at=back.isoformat(), arrival_at=home.isoformat(), flight_legs=[
                        dict(origin="BCN", destination="WRO", departure_at=back.isoformat(),
                             arrival_at=home.isoformat(), operating_carrier="FR", flight_number="124")])])
            if scenario != "complete":
                details = None
            if scenario == "critical":
                payload.pop("return_origin_airport")
            offer.raw_payload, offer.route_details = payload, details
        db.commit()
        return {"slug": deal.slug, "quality": serialize_deal(db, deal).flight_quality.model_dump()}


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
                                             "return_origin_airport": "CIA", "return_destination_airport": code,
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
        payload.update(origin_airport="WRO", destination_airport="BCN",
                       return_origin_airport="BCN", return_destination_airport="WRO",
                       return_transfers=0 if scenario == "midnight" else 1, duration_back=180)
        if scenario == "open-jaw":
            payload.update(destination_airport="STN", return_origin_airport="LTN")
        elif scenario == "unknown-airports":
            for key in ("origin_airport", "destination_airport", "return_origin_airport", "return_destination_airport"):
                payload.pop(key, None)
        elif scenario == "unknown-return":
            payload.pop("return_origin_airport", None)
            payload.pop("return_destination_airport", None)
        payload["return_at"] = departure.isoformat()
        offer.raw_payload = payload
        offer.return_at = departure
        offer.route_details = None
        if scenario == "structured-return":
            from app.services.flight_routes import ticket_key

            outbound_arrival = scheduled_departure + timedelta(minutes=120)
            arrival = departure + timedelta(minutes=180)
            payload.update(destination_airport="STN", return_at=departure.isoformat(), duration_back=150,
                           link="/search/fixture?t=structured-route")
            for key in ("return_origin_airport", "return_destination_airport", "return_departure_at"):
                payload.pop(key, None)
            offer.return_at = departure
            offer.route_details = dict(
                source="travelpayouts_graphql", ticket_key=ticket_key(payload["link"]),
                departure_at=scheduled_departure.isoformat(), return_at=arrival.isoformat(),
                origin_airport_iata="WRO", destination_airport_iata="STN", value=213, currency="pln",
                segments=[dict(departure_at=scheduled_departure.isoformat(), arrival_at=outbound_arrival.isoformat(),
                               flight_legs=[dict(origin="WRO", destination="STN", departure_at=scheduled_departure.isoformat(),
                                                 arrival_at=outbound_arrival.isoformat(), operating_carrier="FR", flight_number="8406")]),
                          dict(departure_at=departure.isoformat(), arrival_at=arrival.isoformat(), flight_legs=[
                              dict(origin="LTN", destination="BER", departure_at=departure.isoformat(),
                                   arrival_at=(departure + timedelta(minutes=60)).isoformat(), operating_carrier="W6", flight_number="1234"),
                              dict(origin="BER", destination="WRO", departure_at=(departure + timedelta(minutes=90)).isoformat(),
                                   arrival_at=arrival.isoformat(), operating_carrier="LO", flight_number="999")])])
            offer.raw_payload = payload
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
            "transfers": 0, "return_transfers": 0,
            "return_origin_airport": "BCN", "return_destination_airport": "WRO",
            "departure_at": "2026-10-17T10:00:00+02:00", "duration_to": 120,
            "return_at": "2026-10-24T22:00:00+02:00", "duration_back": 160,
        },
    ))
    return view


# This exact local fixture must precede the existing /deals/{slug} route.
app.router.routes.insert(0, app.router.routes.pop())


@app.get('/api/v1/deals/stay-context-{scenario}')
def stay_context_fixture(scenario: Literal['overnight', 'unknown-zone', 'one-way', 'same-day']):
    """Read-only synthetic stay calendar examples; never changes fixture rows."""
    with Session(engine) as db:
        view = serialize_deal(db, db.scalar(select(Deal).where(Deal.slug == 'browser-13')))
    departure = datetime(2030, 5, 1, 21, 30, tzinfo=UTC)
    return_at = None if scenario == 'one-way' else datetime(
        2030, 5, 2 if scenario == 'same-day' else 4, 12 if scenario == 'same-day' else 21, 30, tzinfo=UTC,
    )
    payload = dict(origin_airport='WRO', destination='BCN', destination_airport='BCN',
        departure_at=departure.isoformat(), duration_to=180, airline='FR', transfers=0)
    if return_at:
        payload.update(return_at=return_at.isoformat(), duration_back=180, return_transfers=0,
                       return_origin_airport='BCN', return_destination_airport='WRO')
    offer = TravelOffer(source='travelpayouts_data', product_type='FLIGHT', departure_precision='TIME',
                        depart_at=departure, return_at=return_at, raw_payload=payload)
    facts = flight_facts(offer)
    if scenario == 'unknown-zone':
        facts.destination_timezone = None
        facts.return_origin_timezone = None
    view.slug = f'stay-context-{scenario}'
    view.trip_type = 'ONE_WAY' if return_at is None else 'ROUND_TRIP'
    view.trip_start = departure.date()
    view.trip_end = return_at.date() if return_at else departure.date()
    view.nights = (view.trip_end - view.trip_start).days if return_at else None
    view.flight_facts = facts
    view.flight_quality = classify_flight_quality(offer, facts, origin_code='WRO', destination_codes={'BCN'})
    view.events_supported = False
    return view


app.router.routes.insert(0, app.router.routes.pop())


@app.get("/api/v1/deals/hydration-fixture")
def hydration_fixture():
    """London in winter exposes GMT/GMT+0 differences between Node and WebKit."""
    with Session(engine) as db:
        view = serialize_deal(db, db.scalar(select(Deal).where(Deal.slug == "browser-13")))
    view.slug = "hydration-fixture"
    view.trip_start = date(2027, 1, 8)
    view.trip_end = date(2027, 1, 11)
    view.destination_city = "London"
    view.destination_slug = "london"
    view.destination_country_code = "GB"
    view.flight_facts = flight_facts(TravelOffer(
        source="travelpayouts_data", product_type="FLIGHT", departure_precision="TIME",
        return_at=datetime(2027, 1, 11, 5, 55, tzinfo=UTC),
        raw_payload={
            "origin_airport": "WRO", "destination_airport": "STN", "airline": "FR",
            "transfers": 0, "return_transfers": 0,
            "return_origin_airport": "LTN", "return_destination_airport": "WRO",
            "departure_at": "2027-01-08T12:45:00Z", "duration_to": 140,
            "return_at": "2027-01-11T05:55:00Z", "duration_back": 125,
        },
    ))
    return view


app.router.routes.insert(0, app.router.routes.pop())


@app.get("/api/v1/deals/hydration-fixture/events")
def hydration_events():
    return EventResults(status="EMPTY")


app.router.routes.insert(0, app.router.routes.pop())


@app.get('/api/v1/deals/freshness-fixture')
def freshness_fixture():
    with Session(engine) as db:
        view = serialize_deal(db, db.scalar(select(Deal).where(Deal.slug == 'browser-deal')))
    now = datetime.now(UTC)
    view.price_freshness.observed_at = now-timedelta(hours=3)
    view.price_freshness.observation_basis = 'SOURCE'
    view.price_freshness.fetched_at = now
    view.price_freshness.hidden_after = now+timedelta(seconds=60)
    view.price_freshness.max_age_hours = 6
    return view


app.router.routes.insert(0, app.router.routes.pop())


@app.get('/api/v1/deals/partner-unavailable-fixture')
def partner_unavailable_fixture():
    """Read-only synthetic presentation of a blocked partner program."""
    with Session(engine) as db:
        view = serialize_deal(db, db.scalar(select(Deal).where(Deal.slug == 'browser-deal')))
    view.slug = 'partner-unavailable-fixture'
    for component in view.components:
        component.available = False
        component.redirect_path = None
        component.reason = 'PROGRAM_UNAVAILABLE'
    return view


app.router.routes.insert(0, app.router.routes.pop())

# Explicit E2E mode above is mandatory. No external mail is sent.
get_settings().alerts_enabled = True
get_settings().alerts_signing_key = SecretStr("local-browser-fixture-key-not-for-production")
get_settings().alerts_site_url = "http://127.0.0.1:3100"
alert_messages = []


def fixture_mail(settings, recipient, subject, body):
    alert_messages.append({"email": recipient, "body": body})


alerts.send_alert_mail = fixture_mail
alert_digests.send_alert_mail = fixture_mail


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


catalog_unavailable = False
home_collection_scenario = 'normal'
home_collection_deadline = None
directory_fixture_state = 'normal'
flight_link_snapshot = None


@app.post('/__test__/flight-link-binding')
def flight_link_binding(scenario: Literal['valid', 'stale', 'reset']):
    from urllib.parse import urlencode

    from app.models.affiliate import AffiliateProgram, AffiliateProvider
    from app.services.partner_links import PLACEMENT_SUB_ID, source_url

    global flight_link_snapshot
    with Session(engine) as db:
        deal = db.scalar(select(Deal).where(Deal.slug == 'browser-13'))
        component = db.scalar(select(DealComponent).where(DealComponent.deal_id == deal.id,
                                                          DealComponent.component_type == 'FLIGHT'))
        offer = db.get(TravelOffer, component.travel_offer_id)
        if scenario == 'reset':
            if flight_link_snapshot:
                component.affiliate_program_id, component.metadata_json, offer.raw_payload = deepcopy(flight_link_snapshot)
                flight_link_snapshot = None
            db.commit()
            return {'scenario': scenario}
        if flight_link_snapshot is None:
            flight_link_snapshot = deepcopy((component.affiliate_program_id, component.metadata_json, offer.raw_payload))
        provider = db.scalar(select(AffiliateProvider).where(AffiliateProvider.code == 'travelpayouts'))
        program = db.scalar(select(AffiliateProgram).where(AffiliateProgram.provider_id == provider.id,
                                                          AffiliateProgram.code == 'aviasales'))
        if not program:
            program = AffiliateProgram(provider_id=provider.id, code='aviasales', name='Synthetic Aviasales',
                onboarding_status='APPROVED', is_active=True, capabilities_json=['AFFILIATE_LINK'],
                allowed_hosts=['tp.media'], tracking_param=None)
            db.add(program)
            db.flush()
        component.affiliate_program_id = program.id
        original = '/search/WRO0101BCN04011?t=synthetic-current-ticket'
        component.metadata_json = {'outbound_url': 'https://tp.media/r?' + urlencode({
            'marker': 123, 'trs': 456, 'sub_id': PLACEMENT_SUB_ID, 'u': source_url(original)})}
        offer.raw_payload = {**offer.raw_payload, 'link': original if scenario == 'valid'
                             else '/search/KRK0202ROM05021?t=synthetic-new-ticket'}
        db.commit()
    return {'scenario': scenario}


@app.post('/__test__/weekend-fixtures')
def set_weekend_fixtures(enabled: bool, nights: int | None = Query(None, ge=0, le=3)):
    from weekend_browser_fixtures import weekend_fixtures

    with Session(engine) as db:
        weekend_fixtures(db, enabled, nights=nights)
    return {'enabled': enabled}


@app.post('/__test__/airport-context-fixtures')
def set_airport_context_fixtures(enabled: bool):
    from airport_context_browser_fixtures import airport_context_fixtures

    with Session(engine) as db:
        airport_context_fixtures(db, enabled)
    return {'enabled': enabled}


@app.post('/__test__/catalog-state')
def set_catalog_state(unavailable: bool):
    global catalog_unavailable
    catalog_unavailable = unavailable
    return {'unavailable': catalog_unavailable}


@app.post('/__test__/home-collections')
def set_home_collection_scenario(scenario: Literal['normal', 'one', 'weekend-error', 'weekend-broad', 'expiring', 'delay']):
    global home_collection_scenario, home_collection_deadline
    home_collection_scenario = scenario
    home_collection_deadline = (datetime.now(UTC) + timedelta(seconds=15)).isoformat()
    return {'scenario': scenario, 'deadline': home_collection_deadline}


@app.post('/__test__/directory')
def set_directory_fixture(state: Literal['normal', 'large', 'empty', 'unavailable']):
    global directory_fixture_state
    directory_fixture_state = state
    with Session(engine) as db:
        db.execute(delete(Destination).where(Destination.slug.like('directory-fixture-%')))
        if state == 'large':
            for index in range(21):
                db.add(Destination(slug=f'directory-fixture-{index}',
                    city=f'Synthetic directory city {index:02}', country='Synthetic fixture',
                    country_code=['PL', 'ES', 'FR'][index % 3], is_active=index != 20))
        db.commit()
    return {'state': state}


@app.middleware("http")
async def catalog_state_fixture(request, call_next):
    # Isolated E2E app only: deterministic transport delay/failure for SSR fetches.
    if request.url.path == '/api/v1/destinations':
        if directory_fixture_state == 'empty':
            return JSONResponse([])
        if directory_fixture_state == 'unavailable':
            return JSONResponse({'detail': 'Synthetic directory unavailable'}, status_code=503)
    if request.url.path == "/api/v1/deals/invalid-contract-fixture":
        return JSONResponse({"slug": "invalid-contract-fixture", "components": None})
    if request.url.path == "/api/v1/deals/unavailable-fixture":
        return JSONResponse({"detail": "Fixture unavailable"}, status_code=503)
    if request.url.path == "/api/v1/deals":
        collection_preview = request.query_params.get('limit') == '100' and request.query_params.get('round_trip') == 'true'
        if collection_preview and request.query_params.get('weekend_mode'):
            if home_collection_scenario == 'weekend-error':
                return JSONResponse({'detail': 'Synthetic collection failure'}, status_code=503)
            if home_collection_scenario == 'weekend-broad':
                return JSONResponse({'detail': {'code': 'WEEKEND_QUERY_TOO_BROAD'}}, status_code=422)
        if home_collection_scenario == 'delay' and request.query_params.get('origin') == 'GDN':
            await asyncio.sleep(2)
        if request.query_params.get('sort') == 'destination_time' and request.query_params.get('budget') == '987650':
            return JSONResponse({'detail': {'code': 'DESTINATION_TIME_QUERY_TOO_BROAD'}}, status_code=422)
        if request.query_params.get('sort') == 'destination_time' and request.query_params.get('budget') == '987649':
            return JSONResponse({'detail': [{'loc': ['query', 'sort'], 'type': 'literal_error'}]}, status_code=422)
        if request.query_params.get('budget') == '987651' and request.query_params.get('weekend_mode'):
            return JSONResponse({'detail': {'code': 'WEEKEND_QUERY_TOO_BROAD'}}, status_code=422)
        if request.query_params.get("budget") == "987652":
            return JSONResponse({"items": None, "total": 0, "offset": 0, "limit": 12})
        if catalog_unavailable:
            return JSONResponse({"detail": "Fixture unavailable"}, status_code=503)
        if request.query_params.get("budget") == "987654":
            await asyncio.sleep(2)
        if request.query_params.get("budget") == "987653":
            return JSONResponse({"detail": "Fixture unavailable"}, status_code=503)
        if collection_preview and home_collection_scenario in ('one', 'expiring'):
            response = await call_next(request)
            if response.status_code != 200:
                return response
            rows = json.loads(b''.join([part async for part in response.body_iterator]))
            if home_collection_scenario == 'one':
                rows = rows[:1]
            else:
                for row in rows:
                    row['price_freshness']['hidden_after'] = home_collection_deadline
            return JSONResponse(rows)
    return await call_next(request)


@app.post("/__test__/short-trips")
def short_trip_fixtures(enabled: bool):
    with Session(engine) as db:
        ids = select(Deal.id).where(Deal.slug.like("short-%"))
        db.execute(delete(DealComponent).where(DealComponent.deal_id.in_(ids)))
        db.execute(delete(Deal).where(Deal.slug.like("short-%")))
        db.execute(delete(TravelOffer).where(TravelOffer.external_id.like("short-%")))
        # WAW belongs to the baseline registry. Removing it leaked fixture state
        # into later airport/growth scenarios in the full suite.
        db.execute(delete(Airport).where(Airport.iata_code.in_(["KTW", "GDN"])))
        if not enabled:
            db.commit()
            return {"enabled": False}
        deal = db.scalar(select(Deal).where(Deal.slug == "browser-deal"))
        provider = db.scalar(select(DataProvider).where(DataProvider.code == "flight-facts-fixture"))
        # HTR-05: isolated airport selections with six, two and zero short trips.
        for code, city, lengths in [("WAW", "Warszawa", [2, 3, 4, 2, 3, 4, 8]),
                                    ("KTW", "Katowice", [2, 4, 7]), ("GDN", "Gdańsk", [9])]:
            airport = db.scalar(select(Airport).where(Airport.iata_code == code))
            if airport is None:
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
                                       source="travelpayouts_data", product_type="FLIGHT", departure_precision="TIME",
                                     depart_at=start, return_at=end, original_price=180 + index,
                                       original_currency="PLN", raw_payload={
                                           # Synthetic, explicit route facts for the quality-gated selection.
                                           "origin_airport": code, "destination_airport": "BCN",
                                           "return_origin_airport": "BCN", "return_destination_airport": code,
                                           "departure_at": start.isoformat(), "return_at": end.isoformat(),
                                           "duration_to": 120, "duration_back": 120,
                                           "airline": "FR", "transfers": 0, "return_transfers": 0})
                db.add_all([trip, flight])
                db.flush()
                db.add(DealComponent(deal_id=trip.id, component_type="FLIGHT",
                                     travel_offer_id=flight.id, price_pln=180 + index))
        db.commit()
    return {"enabled": True}


from destination_browser_fixtures import install_destination_recovery_fixture  # noqa: E402

install_destination_recovery_fixture(app, engine)
