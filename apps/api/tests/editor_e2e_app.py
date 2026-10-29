"""Isolated editorial browser fixture; explicitly opt in, never used by production."""
import os
import tempfile
from datetime import UTC, datetime, timedelta

if os.getenv("HOPTRIP_EDITOR_E2E") != "1":
    raise RuntimeError("Requires HOPTRIP_EDITOR_E2E=1")

from app.config import get_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.event import LocalEvent
from app.services.editor_auth import password_hash
from pydantic import SecretStr
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from tests.helpers import approved_program, catalog_fixture

fixture_dir = tempfile.TemporaryDirectory(prefix="hoptrip-editor-browser-")
engine = create_engine("sqlite:///" + fixture_dir.name.replace("\\", "/") + "/editor.db",
                       connect_args={"check_same_thread": False})
Base.metadata.create_all(engine)
settings = get_settings()
settings.editor_enabled = True
settings.editor_origin = "http://127.0.0.1:8111"
settings.editor_password_hash = SecretStr(password_hash("editor-browser-fixture"))
with Session(engine) as db:
    deal, _ = catalog_fixture(db, program=approved_program(db))
    day = deal.trip_start + timedelta(days=1)
    db.add(LocalEvent(source="ticketmaster", external_id="browser", destination_id=deal.destination_id,
        start_date=day, end_date=day, category="MUSIC", active=True, checked_at=datetime.now(UTC),
        payload={"id":"browser", "name":"Barcelona Jazz Night", "start_date":str(day),
            "timezone":"Europe/Madrid", "local_time":"20:00:00", "status":"onsale",
            "url":"https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2F1",
            "category":"MUSIC", "city":"Barcelona", "venue":"Sala Barcelona",
            "price_from":"30.00", "currency":"EUR"}))
    db.commit()


def fixture_db():
    with Session(engine, autoflush=False) as db:
        yield db


app.dependency_overrides[get_db] = fixture_db
