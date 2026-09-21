from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from app.config import Settings
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.conversion import AffiliateConversion
from app.security import SecurityMiddleware
from fastapi import FastAPI
from fastapi.testclient import TestClient
from helpers import approved_program, catalog_fixture
from pydantic import ValidationError

HEADERS = {"X-Admin-Token": "change-me-in-development"}


def test_revenue_precision_period_and_client_event_dedup(isolated_db, api_client):
    now = datetime.now(UTC)
    isolated_db.add_all(
        [
            AnalyticsEvent(
                event_name="PAGE_VIEW", anonymous_session_id=f"session-{i}", created_at=now
            )
            for i in range(3000)
        ]
    )
    isolated_db.add_all(
        [
            AffiliateConversion(
                provider_code="test",
                provider_conversion_id="1",
                booking_category="FLIGHT",
                commission=1,
                currency="PLN",
                status="CONFIRMED",
                occurred_at=now,
            ),
            AffiliateConversion(
                provider_code="test",
                provider_conversion_id="2",
                booking_category="FLIGHT",
                commission=100,
                currency="EUR",
                status="CONFIRMED",
                occurred_at=now,
            ),
            AffiliateConversion(
                provider_code="test",
                provider_conversion_id="3",
                booking_category="FLIGHT",
                commission=100,
                currency="PLN",
                status="CANCELLED",
                occurred_at=now,
            ),
        ]
    )
    isolated_db.commit()
    response = api_client.get("/api/v1/admin/analytics/summary", headers=HEADERS).json()
    assert response["revenue_per_1000_sessions_pln"] == "0.33"
    assert response["confirmed_commission_pln"] == "1.00"
    assert (
        api_client.get(
            "/api/v1/admin/analytics/summary",
            params={"end": (now - timedelta(days=1)).isoformat()},
            headers=HEADERS,
        ).json()["total_sessions"]
        == 0
    )
    payload = {
        "event_id": str(uuid4()),
        "event_name": "PAGE_VIEW",
        "anonymous_session_id": "dedup-session",
    }
    for _ in range(2):
        assert api_client.post("/api/v1/analytics/events", json=payload).status_code == 202
    assert (
        isolated_db.query(AnalyticsEvent).filter_by(anonymous_session_id="dedup-session").count()
        == 1
    )
    assert (
        api_client.post(
            "/api/v1/analytics/events", json={**payload, "event_name": "BOOKING_CONFIRMED"}
        ).status_code
        == 422
    )


def test_conversion_status_update_preserves_attribution(isolated_db, api_client):
    program = approved_program(isolated_db)
    deal, _ = catalog_fixture(isolated_db, program=program)
    assert api_client.get("/go/fixture-deal/flight").status_code == 307
    click = isolated_db.query(AffiliateClick).one()
    payload = {
        "provider_code": "travelpayouts",
        "provider_conversion_id": "fixture",
        "booking_category": "FLIGHT",
        "tracking_id": click.tracking_id,
        "commission": "1.00",
        "status": "PENDING",
    }
    assert (
        api_client.post("/api/v1/admin/conversions", json=payload, headers=HEADERS).status_code
        == 201
    )
    payload.pop("tracking_id")
    payload.pop("commission")
    payload["status"] = "CONFIRMED"
    assert (
        api_client.post("/api/v1/admin/conversions", json=payload, headers=HEADERS).json()[
            "created"
        ]
        is False
    )
    conversion = isolated_db.query(AffiliateConversion).one()
    assert conversion.click_id == click.id and conversion.deal_id == deal.id
    assert str(conversion.commission) == "1.00"
    payload["provider_code"] = "wrong"
    payload["tracking_id"] = click.tracking_id
    assert (
        api_client.post("/api/v1/admin/conversions", json=payload, headers=HEADERS).status_code
        == 400
    )


def test_production_bootstrap_requires_internal_secrets_only():
    with pytest.raises(ValidationError):
        Settings(app_env="production", _env_file=None)
    settings = Settings(
        app_env="production",
        admin_token="local-test-secret-" * 3,
        database_url="postgresql+psycopg://app:local-test-unique@localhost/test",
        travelpayouts_api_token=None,
        _env_file=None,
    )
    assert settings.travelpayouts_api_token is None


def test_headers_body_limit_and_rate_limit():
    app = FastAPI()
    app.add_middleware(SecurityMiddleware, rate_limit=2, max_body=32)

    @app.post("/events")
    def events():
        return {"ok": True}

    client = TestClient(app)
    assert client.post("/events", content="x" * 33).status_code == 413
    response = client.post("/events", json={})
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-request-id"]
    assert client.post("/events", json={}).status_code == 429


def test_combined_filters_and_moderation(isolated_db, api_client):
    deal, _ = catalog_fixture(isolated_db)
    assert (
        api_client.get(
            "/api/v1/deals?origin=WRO&destination=barcelona&budget=200.25&duration_min=3&duration_max=3"
        ).json()[0]["price_per_person_pln"]
        == "200.25"
    )
    assert api_client.get("/api/v1/deals?budget=200.24").json() == []
    assert api_client.get("/api/v1/deals?duration_min=4&duration_max=3").status_code == 422
    assert api_client.get("/api/v1/deals?offset=1&limit=1").json() == []
    path = f"/api/v1/admin/deals/{deal.id}"
    assert api_client.patch(path, json={"is_visible": False}).status_code == 401
    assert api_client.patch(path, json={"is_visible": False}, headers=HEADERS).status_code == 200
    assert api_client.get("/api/v1/deals").json() == []
    moderation = api_client.get("/api/v1/admin/deals", headers=HEADERS).json()
    assert moderation[0]["components"][0]["component_type"] == "FLIGHT"
