import re
from datetime import UTC, datetime, timedelta

import pytest
from app.config import get_settings
from app.models.alert import DealAlert
from app.services import alerts
from helpers import catalog_fixture
from pydantic import SecretStr
from sqlalchemy import func, select


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
            "filters": {"origin": "Wrocław", "budget": "250", "duration_min": 1, "duration_max": 4,
                        "weekend": True, "frequency": "weekly", **filters}}


def test_confirmation_preferences_duplicates_and_unsubscribe(api_client, isolated_db, mail):
    catalog_fixture(isolated_db)
    settings, messages = mail
    assert api_client.post("/api/v1/alerts", json=payload()).status_code == 202
    alert = isolated_db.scalar(select(DealAlert))
    assert alert.status == "PENDING"
    assert alert.filters["origin"] == "WRO"
    assert alert.filters["frequency"] == "weekly"
    assert alert.filters["weekend"] is True
    assert "Częstotliwość: raz w tygodniu" in messages[0][3]
    assert api_client.post("/api/v1/alerts", json={**payload(budget="1"), "email": " TRAVELER@example.test "}).status_code == 202
    assert isolated_db.scalar(select(func.count()).select_from(DealAlert)) == 1
    assert len(messages) == 1
    token = re.search(r"/confirm#token=([^\s]+)", messages[0][3]).group(1)
    manage = alerts.capability(settings, alert, "manage")
    changed = payload(budget="220", frequency="daily", weekend=False)["filters"]
    assert api_client.patch("/api/v1/alerts/manage", json={"token": manage, "filters": changed}).status_code == 409
    assert api_client.get("/api/v1/alerts/confirm", params={"token": token}).status_code == 405
    response = api_client.post("/api/v1/alerts/confirm", json={"token": token})
    assert response.status_code == 200
    assert response.json()["token"] == manage
    assert api_client.post("/api/v1/alerts/confirm", json={"token": manage}).status_code == 404
    assert api_client.post("/api/v1/alerts/manage", json={"token": token}).status_code == 404
    assert api_client.patch("/api/v1/alerts/manage", json={"token": manage, "filters": changed}).status_code == 200
    result = api_client.post("/api/v1/alerts/manage", json={"token": manage}).json()
    assert result["status"] == "ACTIVE"
    assert result["filters"]["frequency"] == "daily"
    assert result["filters"]["weekend"] is False
    assert result["filters"]["budget"] == "220"
    for _ in range(2):
        assert api_client.post("/api/v1/alerts/unsubscribe", json={"token": manage}).json()["status"] == "STOPPED"
    assert api_client.patch("/api/v1/alerts/manage", json={"token": manage, "filters": changed}).status_code == 409
    assert api_client.post("/api/v1/alerts/confirm", json={"token": token}).status_code == 410


@pytest.mark.parametrize("change", [{"consent": False}, {"email": "bad\r\nBcc:x@y.test"},
    {"filters": {"origin": "WRO", "budget": -1}},
    {"filters": {"origin": "WRO", "budget": 200, "duration_min": 5, "duration_max": 2}},
    {"filters": {"origin": "WRO", "budget": 200, "frequency": "hourly"}},
    {"filters": {"origin": "WRO", "budget": 200, "departure_from": "2030-01-02", "departure_to": "2030-01-01"}}])
def test_rejects_invalid_signups(api_client, mail, change):
    assert api_client.post("/api/v1/alerts", json={**payload(), **change}).status_code == 422
    assert not mail[1]


def test_disabled_expiry_and_active_preferences_are_protected(api_client, isolated_db, mail, monkeypatch):
    catalog_fixture(isolated_db)
    settings, messages = mail
    api_client.post("/api/v1/alerts", json=payload())
    alert = isolated_db.scalar(select(DealAlert))
    alert.requested_at = datetime.now(UTC) - timedelta(hours=49)
    isolated_db.commit()
    token = alerts.capability(settings, alert, "confirm")
    assert api_client.post("/api/v1/alerts/confirm", json={"token": token}).status_code == 410
    tampered = token[:-1] + ("a" if token[-1] != "a" else "b")
    assert api_client.post("/api/v1/alerts/confirm", json={"token": tampered}).status_code == 404
    alert.status = "ACTIVE"
    isolated_db.commit()
    assert api_client.post("/api/v1/alerts", json=payload(budget="1")).status_code == 202
    isolated_db.refresh(alert)
    assert alert.filters["budget"] == "250"
    assert "/manage#token=" in messages[-1][3]
    monkeypatch.setattr(settings, "alerts_enabled", False)
    assert api_client.get("/api/v1/alerts/status").json() == {"enabled": False}
    assert api_client.post("/api/v1/alerts", json=payload()).status_code == 503
    manage = alerts.capability(settings, alert, "manage")
    assert api_client.post("/api/v1/alerts/unsubscribe", json={"token": manage}).status_code == 200


def test_mail_failure_does_not_confirm_subscription(api_client, isolated_db, mail, monkeypatch):
    catalog_fixture(isolated_db)
    monkeypatch.setattr(alerts, "send_alert_mail", lambda *args: (_ for _ in ()).throw(TimeoutError()))
    assert api_client.post("/api/v1/alerts", json=payload()).status_code == 503
    assert isolated_db.scalar(select(DealAlert)).status == "PENDING"
