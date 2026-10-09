"""Explicit local-only browser fixture app, never imported by production entrypoint."""

import os
import tempfile

if os.getenv("HOPTRIP_E2E") != "1":
    raise RuntimeError("Fixture server requires HOPTRIP_E2E=1")
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.config import get_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.deal import Deal, DealComponent
from app.models.location import Destination
from app.services import alerts
from app.services.scoring import SCORE_VERSION, score_flight_deal
from helpers import approved_program, catalog_fixture
from pydantic import SecretStr
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse

fixture_dir = tempfile.TemporaryDirectory(prefix="hoptrip-browser-")
engine = create_engine(
    "sqlite:///" + fixture_dir.name.replace("\\", "/") + "/fixture.db",
    connect_args={"check_same_thread": False, "timeout": 30},
)
Base.metadata.create_all(engine)
with Session(engine) as db:
    program = approved_program(db)
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
    db.commit()


def override():
    with Session(engine) as db:
        yield db


app.dependency_overrides[get_db] = override

# Fixture mailbox: no SMTP connection and no external emails.
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
