import re
from datetime import UTC, datetime, timedelta

import pytest
from app.config import get_settings
from app.models.alert import AlertDelivery, DealAlert
from app.schemas.alert import AlertSignup
from app.services import alerts
from helpers import catalog_fixture
from pydantic import SecretStr
from sqlalchemy import select


@pytest.fixture
def mail(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "alerts_enabled", True)
    monkeypatch.setattr(settings, "alerts_signing_key", SecretStr("test-only-key-" * 4))
    monkeypatch.setattr(settings, "alerts_site_url", "http://localhost:3000")
    messages = []
    monkeypatch.setattr(alerts, "send_alert_mail", lambda *args: messages.append(args))
    return settings, messages


def payload(**filters):
    return {"email": "traveler@example.test", "consent": True,
            "filters": {"origin": "Wrocław", "budget": "250", "duration_min": 2, "duration_max": 4, **filters}}


def subscribe(db, mail):
    settings, messages = mail
    alerts.signup(db, settings, AlertSignup.model_validate(payload()))
    alert = db.scalar(select(DealAlert))
    token = alerts.capability(settings, alert, "confirm")
    return alert, token


def test_double_opt_in_and_unsubscribe(api_client, isolated_db, mail):
    catalog_fixture(isolated_db)
    settings, messages = mail
    assert api_client.post("/api/v1/alerts", json=payload()).status_code == 202
    alert = isolated_db.scalar(select(DealAlert))
    assert alert.status == "PENDING"
    assert alert.filters["origin"] == "WRO"
    assert alerts.deliver_digests(isolated_db, settings)["sent"] == 0
    token = re.search(r"/confirm#token=([^\s]+)", messages[0][3]).group(1)
    assert api_client.get("/api/v1/alerts/confirm", params={"token": token}).status_code == 405
    response = api_client.post("/api/v1/alerts/confirm", json={"token": token})
    assert response.status_code == 200
    manage = response.json()["token"]
    assert api_client.post("/api/v1/alerts/confirm", json={"token": manage}).status_code == 404
    assert api_client.post("/api/v1/alerts/manage", json={"token": token}).status_code == 404
    assert api_client.post("/api/v1/alerts/manage", json={"token": manage}).json()["status"] == "ACTIVE"
    changed = payload(budget="230")["filters"]
    assert api_client.patch("/api/v1/alerts/manage", json={"token": manage, "filters": changed}).status_code == 200
    assert alerts.deliver_digests(isolated_db, settings)["sent"] == 1
    for _ in range(2):
        assert api_client.post("/api/v1/alerts/unsubscribe", json={"token": manage}).json()["status"] == "STOPPED"
    assert api_client.patch("/api/v1/alerts/manage", json={"token": manage, "filters": changed}).status_code == 409
    assert api_client.post("/api/v1/alerts/confirm", json={"token": token}).status_code == 410
    assert alerts.deliver_digests(isolated_db, settings)["sent"] == 0


@pytest.mark.parametrize("change", [{"consent": False}, {"email": "bad\r\nBcc:x@y.test"},
                                    {"filters": {"origin": "WRO", "budget": -1}},
                                    {"filters": {"origin": "WRO", "budget": 200, "duration_min": 5, "duration_max": 2}}])
def test_rejects_invalid_signups(api_client, mail, change):
    assert api_client.post("/api/v1/alerts", json={**payload(), **change}).status_code == 422
    assert not mail[1]


def test_disabled_and_anonymous_requests_cannot_edit(api_client, isolated_db, mail, monkeypatch):
    catalog_fixture(isolated_db)
    settings, messages = mail
    alert, token = subscribe(isolated_db, mail)
    alerts.confirm(isolated_db, settings, token)
    assert api_client.post("/api/v1/alerts", json=payload(budget="1")).status_code == 202
    assert alert.filters["budget"] == "250"
    assert len(messages) == 1
    monkeypatch.setattr(settings, "alerts_enabled", False)
    assert api_client.get("/api/v1/alerts/status").json() == {"enabled": False}
    assert api_client.post("/api/v1/alerts", json=payload()).status_code == 503
    manage = alerts.capability(settings, alert, "manage")
    assert api_client.post("/api/v1/alerts/unsubscribe", json={"token": manage}).status_code == 200


def test_expiry_and_forgery(api_client, isolated_db, mail):
    catalog_fixture(isolated_db)
    settings, _ = mail
    alert, _ = subscribe(isolated_db, mail)
    alert.requested_at = datetime.now(UTC) - timedelta(hours=49)
    isolated_db.commit()
    token = alerts.capability(settings, alert, "confirm")
    assert api_client.post("/api/v1/alerts/confirm", json={"token": token}).status_code == 410
    tampered = token[:-1] + ("a" if token[-1] != "a" else "b")
    assert api_client.post("/api/v1/alerts/confirm", json={"token": tampered}).status_code == 404


def test_digest_filters_dedup_and_uncertain_delivery(isolated_db, mail, monkeypatch):
    deal, _ = catalog_fixture(isolated_db)
    settings, messages = mail
    alert, token = subscribe(isolated_db, mail)
    alerts.confirm(isolated_db, settings, token)
    for filters in [payload(budget="1")["filters"], payload(duration_min=50, duration_max=60)["filters"],
                    payload(departure_from=str(deal.trip_start + timedelta(days=1)))["filters"]]:
        alert.filters = alerts.normalized_filters(isolated_db, alerts.AlertFilters.model_validate(filters))
        isolated_db.commit()
        assert alerts.deliver_digests(isolated_db, settings)["sent"] == 0
    alert.filters = alerts.normalized_filters(isolated_db, AlertSignup.model_validate(payload()).filters)
    isolated_db.commit()
    monkeypatch.setattr(alerts, "send_alert_mail", lambda *args: (_ for _ in ()).throw(TimeoutError()))
    assert alerts.deliver_digests(isolated_db, settings)["uncertain"] == 1
    assert isolated_db.scalar(select(AlertDelivery)).status == "UNCERTAIN"
    monkeypatch.setattr(alerts, "send_alert_mail", lambda *args: messages.append(args))
    assert alerts.deliver_digests(isolated_db, settings)["sent"] == 0
    alert.last_digest_at = datetime.now(UTC) - timedelta(days=2)
    isolated_db.commit()
    assert alerts.deliver_digests(isolated_db, settings)["sent"] == 0
    assert len(messages) == 1  # The uncertain digest is never automatically repeated.


def test_retention_and_expired_deals(isolated_db, mail):
    deal, _ = catalog_fixture(isolated_db)
    settings, _ = mail
    alert, token = subscribe(isolated_db, mail)
    alerts.confirm(isolated_db, settings, token)
    deal.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    isolated_db.commit()
    assert alerts.deliver_digests(isolated_db, settings)["sent"] == 0
    alert.status = "STOPPED"
    alert.stopped_at = datetime.now(UTC) - timedelta(days=31)
    isolated_db.commit()
    alerts.cleanup(isolated_db, datetime.now(UTC))
    assert isolated_db.scalar(select(DealAlert)) is None
