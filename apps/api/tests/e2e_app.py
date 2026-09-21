"""Explicit local-only browser fixture app, never imported by production entrypoint."""

import os
import tempfile

if os.getenv("HOPTRIP_E2E") != "1":
    raise RuntimeError("Fixture server requires HOPTRIP_E2E=1")
from datetime import UTC, datetime, timedelta

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.deal import Deal, DealComponent
from helpers import approved_program, catalog_fixture
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

fixture_dir = tempfile.TemporaryDirectory(prefix="hoptrip-browser-")
engine = create_engine(
    "sqlite:///" + fixture_dir.name.replace("\\", "/") + "/fixture.db",
    connect_args={"check_same_thread": False, "timeout": 30},
)
Base.metadata.create_all(engine)
with Session(engine) as db:
    program = approved_program(db)
    deal, component = catalog_fixture(db, program=program, slug="browser-deal")
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


@app.get("/__test__/tracking")
def tracking():
    with Session(engine) as db:
        return {
            "clicks": [
                {"session": c.anonymous_session_id, "program": c.program_id}
                for c in db.scalars(select(AffiliateClick))
            ],
            "events": [
                {"session": e.anonymous_session_id, "name": e.event_name}
                for e in db.scalars(select(AnalyticsEvent))
            ],
        }
