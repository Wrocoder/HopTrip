"""Complete email flow through API + scheduler + SMTP boundary, without network."""

import re
from datetime import datetime, timedelta

from app.config import get_settings
from app.main import app
from app.models.alert import DealAlert
from app.services import alert_digests, alert_mail, alerts
from sqlalchemy import select
from test_alert_digests import NOW, offer, settings


def test_signup_confirm_match_deliver_and_unsubscribe(api_client, isolated_db, monkeypatch):
    config = settings()
    app.dependency_overrides[get_settings] = lambda: config
    messages = []

    class Clock(datetime):
        @classmethod
        def now(cls, tz=None):
            return NOW

    class SMTP:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def login(self, *args):
            pass

        def send_message(self, message):
            messages.append(message)

    monkeypatch.setattr(alerts, "datetime", Clock)
    monkeypatch.setattr(alert_mail.smtplib, "SMTP_SSL", SMTP)
    matched = offer(isolated_db)
    rejected = offer(isolated_db, price="300")
    response = api_client.post("/api/v1/alerts", json={
        "email": "journey@example.test", "consent": True,
        "filters": {"origin": "WRO", "budget": "250", "duration_min": 1, "duration_max": 3},
    })
    assert response.status_code == 202
    assert isolated_db.scalar(select(DealAlert)).status == "PENDING"
    assert len(messages) == 1
    body = messages[0].get_content()
    assert "Po potwierdzeniu" in body
    assert "wstrzymana" not in body
    assert alert_digests.deliver_digests(isolated_db, config, NOW)["sent"] == 0
    token = re.search(r"/confirm#token=([^\s]+)", body).group(1)
    confirmed = api_client.post("/api/v1/alerts/confirm", json={"token": token})
    assert confirmed.status_code == 200
    assert alert_digests.deliver_digests(isolated_db, config, NOW)["sent"] == 1
    assert len(messages) == 2
    digest = messages[1].get_content()
    assert matched.slug in digest
    assert rejected.slug not in digest
    assert str(messages[1]["To"]) == "journey@example.test"
    assert alert_digests.deliver_digests(isolated_db, config, NOW)["sent"] == 0
    manage = confirmed.json()["token"]
    assert f"/manage#token={manage}" in digest
    assert api_client.post("/api/v1/alerts/unsubscribe", json={"token": manage}).status_code == 200
    new = offer(isolated_db)
    new.expires_at = NOW + timedelta(days=8)
    new.last_verified_at = NOW + timedelta(days=7)
    isolated_db.commit()
    assert alert_digests.deliver_digests(isolated_db, config, NOW + timedelta(days=7))["sent"] == 0
    assert len(messages) == 2


def test_public_status_distinguishes_signup_and_delivery(api_client):
    config = settings()
    app.dependency_overrides[get_settings] = lambda: config
    for signup, digest in [(True, True), (True, False), (False, False)]:
        config.alerts_enabled, config.alerts_digest_enabled = signup, digest
        assert api_client.get("/api/v1/alerts/status").json() == {
            "enabled": signup, "delivery_enabled": signup and digest,
        }
