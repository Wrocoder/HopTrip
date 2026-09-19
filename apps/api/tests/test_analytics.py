from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.analytics import AnalyticsEvent
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


def test_analytics_event_is_recorded_without_personal_identity() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/analytics/events",
            json={
                "event_name": "DEAL_VIEW",
                "anonymous_session_id": "session-1234",
                "source": "homepage",
            },
        )
        assert response.status_code == 202
        assert response.json() == {"accepted": True}

        with Session(engine) as db:
            event = db.scalar(select(AnalyticsEvent))
            assert event is not None
            assert event.event_name == "DEAL_VIEW"
            assert event.anonymous_session_id == "session-1234"
    finally:
        app.dependency_overrides.clear()


def test_analytics_rejects_unknown_event_name() -> None:
    response = TestClient(app).post(
        "/api/v1/analytics/events",
        json={"event_name": "USER_EMAIL", "anonymous_session_id": "session-1234"},
    )
    assert response.status_code == 422
