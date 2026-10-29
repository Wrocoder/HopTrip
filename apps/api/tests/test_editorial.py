from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from app.config import get_settings
from app.models.editorial import EditorialApproval, EditorialAudit, EditorialRevision, EditorSession
from app.models.event import LocalEvent
from app.services.editor_auth import password_hash
from app.services.editorial import CHANNELS, media_svg
from pydantic import SecretStr
from sqlalchemy import func, select
from tests.helpers import approved_program, catalog_fixture

BASE = "/api/v1/editor"
PASSWORD = "fixture-editor-password-only"
HASH = password_hash(PASSWORD)


@pytest.fixture
def editor(api_client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "editor_enabled", True)
    monkeypatch.setattr(settings, "editor_password_hash", SecretStr(HASH))
    monkeypatch.setattr(settings, "editor_origin", "http://testserver")
    # Login has a separate 5/minute budget; each test represents a new process.
    from app.main import app
    middleware = app.middleware_stack
    while middleware:
        if hasattr(middleware, "buckets"):
            middleware.buckets.clear()
        middleware = getattr(middleware, "app", None)
    api_client.headers["origin"] = "http://testserver"
    result = api_client.post(BASE + "/login", json={"password": PASSWORD})
    assert result.status_code == 200
    api_client.headers["x-csrf-token"] = result.json()["csrf"]
    return api_client


@pytest.fixture
def source(isolated_db):
    program = approved_program(isolated_db)
    deal, component = catalog_fixture(isolated_db, program=program)
    event_date = deal.trip_start + timedelta(days=1)
    event = LocalEvent(source="ticketmaster", external_id="editor-fixture",
        destination_id=deal.destination_id, start_date=event_date, end_date=event_date,
        category="MUSIC", active=True, checked_at=datetime.now(UTC), payload={
            "id": "editor-fixture", "name": "Koncert w Barcelonie", "start_date": str(event_date),
            "local_time": "20:00:00", "timezone": "Europe/Madrid", "status": "onsale",
            "url": "https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2F1",
            "category": "MUSIC", "venue": "Sala", "city": "Barcelona", "price_from": "30", "currency": "EUR",
        })
    isolated_db.add(event)
    isolated_db.commit()
    return deal, component, event


def create_offer(client, source):
    deal, _, event = source
    result = client.post(BASE + "/items", json={"kind": "offer", "deal_id": deal.id,
        "event_id": event.id, "stay_until": str(deal.trip_end)})
    assert result.status_code == 201, result.text
    return result.json()


def test_editor_deadline_respects_near_departure_price_lifetime(editor, source, isolated_db, monkeypatch):
    from app.services import editorial

    checked = datetime.now(UTC)
    monkeypatch.setattr(editorial, "now", lambda: checked)
    deal, _, event = source
    deal.depart_at = checked + timedelta(days=3)
    deal.trip_start = deal.depart_at.date()
    deal.trip_end = deal.trip_start + timedelta(days=3)
    deal.last_verified_at = checked - timedelta(hours=5, minutes=55)
    deal.expires_at = checked + timedelta(days=1)
    event.start_date = event.end_date = deal.trip_start + timedelta(days=1)
    event.payload = {**event.payload, "start_date": str(event.start_date)}
    isolated_db.commit()

    item = create_offer(editor, source)
    deadline = datetime.fromisoformat(item["snapshot"]["valid_until"])
    assert deadline == checked + timedelta(minutes=5)
    approved = approve(editor, item).json()
    assert datetime.fromisoformat(approved["approval_expires_at"]) == deadline


def approve(client, item, channels=None):
    return client.post(f'{BASE}/items/{item["id"]}/approve', json={"version": item["version"],
        "channels": channels or ["telegram"]})


def test_disabled_and_unauthenticated(api_client, monkeypatch):
    monkeypatch.setattr(get_settings(), "editor_enabled", False)
    assert api_client.get(BASE + "/").status_code == 404
    monkeypatch.setattr(get_settings(), "editor_enabled", True)
    assert api_client.get(BASE + "/items").status_code == 401


def test_session_csrf_origin_logout_and_password_rotation(editor, isolated_db, monkeypatch):
    assert editor.get(BASE + "/session").status_code == 200
    session = isolated_db.scalar(select(EditorSession))
    assert session.token_hash != editor.cookies.get("hoptrip_editor")
    editor.headers["x-csrf-token"] = "wrong"
    assert editor.post(BASE + "/items", json={"kind":"guide"}).status_code == 403
    editor.headers["x-csrf-token"] = session.csrf_token
    editor.headers["origin"] = "https://attacker.example"
    assert editor.post(BASE + "/items", json={"kind":"guide"}).status_code == 403
    editor.headers["origin"] = "http://testserver"
    monkeypatch.setattr(get_settings(), "editor_password_hash", SecretStr(HASH + "changed"))
    assert editor.get(BASE + "/items").status_code == 401
    monkeypatch.setattr(get_settings(), "editor_password_hash", SecretStr(HASH))
    assert editor.post(BASE + "/logout", json={}).status_code == 200
    assert editor.get(BASE + "/session").status_code == 401


def test_login_rate_limit(editor):
    for _ in range(4):
        assert editor.post(BASE + "/login", json={"password":"wrong"}).status_code == 401
    assert editor.post(BASE + "/login", json={"password":"wrong"}).status_code == 429


def test_guide_workflow_revisions_approval_and_dry_run(editor, isolated_db):
    item = editor.post(BASE + "/items", json={"kind":"guide"}).json()
    path = f'{BASE}/items/{item["id"]}'
    assert editor.post(path + "/dry-run", json={"version":1}).status_code == 409
    assert approve(editor, item, ["telegram", "instagram"]).status_code == 200
    assert approve(editor, item, ["instagram", "telegram"]).status_code == 200
    assert isolated_db.scalar(select(func.count()).select_from(EditorialApproval)) == 1
    assert isolated_db.scalar(select(func.count()).select_from(EditorialAudit).where(
        EditorialAudit.action == "APPROVED_DRY_RUN")) == 1
    package = editor.post(path + "/dry-run", json={"version":1}).json()
    assert package["mode"] == "dry-run" and package["publishable"] is False
    assert package["accounts"] == []
    assert set(package["variants"]) == {"telegram", "instagram"}
    assert "<svg" in package["media_svg"]
    variants = item["variants"] | {"telegram": "Poprawiony tekst"}
    revised = editor.post(path + "/revise", json={"version":1,"variants":variants}).json()
    assert revised["version"] == 2 and revised["approved_channels"] == []
    assert editor.post(path + "/dry-run", json={"version":2}).status_code == 409
    assert approve(editor, item).status_code == 409
    assert editor.post(path + "/revise", json={"version":1,"variants":variants}).status_code == 409
    assert isolated_db.scalar(select(EditorialRevision).where(EditorialRevision.version == 1)).variants == item["variants"]
    assert approve(editor, revised).status_code == 200
    assert editor.post(path + "/reject", json={"version":2}).status_code == 200
    assert editor.post(path + "/dry-run", json={"version":2}).status_code == 409
    assert approve(editor, revised).status_code == 409


@pytest.mark.parametrize("change", ["price", "expired", "hidden", "event_date", "event_hidden", "event_stale", "conditions", "currency"])
def test_source_changes_block_approved_export(editor, isolated_db, source, change):
    item = create_offer(editor, source)
    assert approve(editor, item).status_code == 200
    deal, component, event = source
    if change == "price":
        deal.flight_price_pln = Decimal("999")
    elif change == "expired":
        deal.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    elif change == "hidden":
        deal.is_visible = False
    elif change == "event_date":
        event.payload = event.payload | {"start_date": str(deal.trip_end + timedelta(days=1))}
    elif change == "event_hidden":
        event.active = False
    elif change == "event_stale":
        event.checked_at = datetime.now(UTC) - timedelta(hours=31)
    elif change == "conditions":
        component.metadata_json = component.metadata_json | {"baggage": "changed"}
    else:
        event.payload = event.payload | {"currency": "USD"}
    isolated_db.commit()
    result = editor.post(f'{BASE}/items/{item["id"]}/dry-run', json={"version":1})
    assert result.status_code == 409, result.text
    detail = editor.get(f'{BASE}/items/{item["id"]}').json()
    assert detail["status"] == "NEEDS_REVIEW" and detail["approved_channels"] == []


def test_refresh_regenerates_prices_and_requires_approval(editor, isolated_db, source):
    item = create_offer(editor, source)
    deal, component, _ = source
    deal.flight_price_pln = component.price_pln = Decimal("300.00")
    isolated_db.commit()
    assert approve(editor, item).status_code == 409
    path = f'{BASE}/items/{item["id"]}'
    refreshed = editor.post(path + "/revise", json={"version":1,"variants":item["variants"],"refresh_source":True}).json()
    assert "300.00" in refreshed["rendered"]["telegram"]
    assert "200.25" not in refreshed["rendered"]["telegram"]
    assert refreshed["approved_channels"] == []
    assert approve(editor, refreshed).status_code == 200


def test_validation_and_safe_media(editor, isolated_db, source):
    deal, _, event = source
    assert editor.post(BASE + "/items", json={"kind":"offer","deal_id":deal.id,"event_id":event.id}).status_code == 422
    item = create_offer(editor, source)
    assert "Kupowany osobno" in item["rendered"]["telegram"]
    assert "Linki partnerskie" in item["rendered"]["telegram"]
    assert editor.post(f'{BASE}/items/{item["id"]}/approve', json={"version":1,"channels":[]}).status_code == 422
    assert editor.post(f'{BASE}/items/{item["id"]}/revise', json={"version":1,"variants":dict.fromkeys(CHANNELS,"x"*1801)}).status_code == 422
    svg = media_svg({"facts":{"title":"<script>alert(1)</script>"}})
    assert "<script>" not in svg and "&lt;script&gt;" in svg
    assert editor.get(item["media"]["url"]).headers["content-type"].startswith("image/svg+xml")
    assert "default-src 'none'" in editor.get(BASE + "/").headers["content-security-policy"]


def test_approval_expires_even_if_source_refreshed(editor, isolated_db, source):
    item = create_offer(editor, source)
    assert approve(editor, item).status_code == 200
    approval = isolated_db.scalar(select(EditorialApproval))
    approval.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    isolated_db.commit()
    assert editor.get(f'{BASE}/items/{item["id"]}').json()["approved_channels"] == []
    assert editor.post(f'{BASE}/items/{item["id"]}/dry-run', json={"version":1}).status_code == 409


def test_changed_template_requires_new_approval(editor, source, monkeypatch):
    from app.services import editorial
    item = create_offer(editor, source)
    assert approve(editor, item).status_code == 200
    monkeypatch.setattr(editorial, "DISCLOSURE", "Updated disclosure")
    result = editor.post(f'{BASE}/items/{item["id"]}/dry-run', json={"version":1})
    assert result.status_code == 409 and "Шаблон" in result.json()["detail"]
