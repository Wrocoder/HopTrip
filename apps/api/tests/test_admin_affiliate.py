from app.api import admin as admin_api
from app.config import Settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.affiliate import AffiliateProgram, AffiliateProvider, OnboardingStatus
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


def test_admin_can_update_affiliate_onboarding_state() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        provider = AffiliateProvider(
            code="test-provider",
            name="Test Provider",
            onboarding_status=OnboardingStatus.NOT_CONFIGURED,
        )
        db.add(provider)
        db.flush()
        program = AffiliateProgram(
            provider_id=provider.id,
            code="test-program",
            name="Test Program",
            onboarding_status=OnboardingStatus.NOT_CONFIGURED,
        )
        db.add(program)
        db.commit()
        provider_id = provider.id
        program_id = program.id

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    headers = {"X-Admin-Token": "change-me-in-development"}
    try:
        client = TestClient(app)
        assert client.patch(f"/api/v1/admin/providers/{provider_id}", json={}).status_code == 401

        blocked = client.patch(
            f"/api/v1/admin/providers/{provider_id}",
            headers=headers,
            json={"is_active": True},
        )
        assert blocked.status_code == 400

        submitted = client.patch(
            f"/api/v1/admin/providers/{provider_id}",
            headers=headers,
            json={
                "onboarding_status": "APPLICATION_SUBMITTED",
                "notes": "Application sent",
            },
        )
        assert submitted.status_code == 200
        assert submitted.json()["onboarding_status"] == "APPLICATION_SUBMITTED"
        assert submitted.json()["is_active"] is False

        approved = client.patch(
            f"/api/v1/admin/providers/{provider_id}",
            headers=headers,
            json={
                "onboarding_status": "APPROVED",
                "is_active": True,
                "capabilities": ["DEEP_LINK", "CONVERSION_API"],
            },
        )
        assert approved.status_code == 200
        assert approved.json()["onboarding_status"] == "APPROVED"
        assert approved.json()["is_active"] is True
        assert approved.json()["capabilities"] == ["DEEP_LINK", "CONVERSION_API"]

        failed_health = client.post(
            f"/api/v1/admin/providers/{provider_id}/health",
            headers=headers,
            json={"success": False, "error": "Provider timeout"},
        )
        assert failed_health.status_code == 200
        assert failed_health.json()["last_health_check"] is not None
        assert failed_health.json()["last_health_check_error"] == "Provider timeout"

        healthy = client.post(
            f"/api/v1/admin/providers/{provider_id}/health",
            headers=headers,
            json={"success": True},
        )
        assert healthy.status_code == 200
        assert healthy.json()["last_health_check_error"] is None

        program_approved = client.patch(
            f"/api/v1/admin/programs/{program_id}",
            headers=headers,
            json={"onboarding_status": "APPROVED", "is_active": True},
        )
        assert program_approved.status_code == 200
        assert program_approved.json()["approved_at"] is not None
        assert program_approved.json()["is_active"] is True

        suspended = client.patch(
            f"/api/v1/admin/programs/{program_id}",
            headers=headers,
            json={"onboarding_status": "SUSPENDED"},
        )
        assert suspended.status_code == 200
        assert suspended.json()["onboarding_status"] == "SUSPENDED"
        assert suspended.json()["is_active"] is False
    finally:
        app.dependency_overrides.clear()


def test_admin_system_status_reports_external_blockers(monkeypatch) -> None:
    blocked_settings = Settings(
        app_env="development",
        admin_token="change-me-in-development",
        travelpayouts_api_token=None,
        affiliate_allowed_hosts="",
    )
    monkeypatch.setattr(admin_api, "get_settings", lambda: blocked_settings)
    client = TestClient(app)
    blocked = client.get(
        "/api/v1/admin/system/status",
        headers={"X-Admin-Token": "change-me-in-development"},
    )
    assert blocked.status_code == 200
    assert blocked.json()["status"] == "BLOCKED"
    assert "TRAVELPAYOUTS_API_TOKEN is not configured" in blocked.json()["blockers"]
    assert "AFFILIATE_ALLOWED_HOSTS has no approved HTTPS host" in blocked.json()["blockers"]

    ready_settings = Settings(
        app_env="development",
        admin_token="change-me-in-development",
        travelpayouts_api_token="provider-token",
        affiliate_allowed_hosts="partner.example",
        affiliate_tracking_query_param="sub_id",
    )
    monkeypatch.setattr(admin_api, "get_settings", lambda: ready_settings)
    ready = client.get(
        "/api/v1/admin/system/status",
        headers={"X-Admin-Token": "change-me-in-development"},
    )
    assert ready.status_code == 200
    assert ready.json()["status"] == "READY"
    assert ready.json()["blockers"] == []
    assert ready.json()["warnings"] == []
