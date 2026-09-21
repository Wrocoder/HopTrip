import pytest
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


@pytest.fixture
def isolated_db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        yield db
    engine.dispose()


@pytest.fixture
def api_client(isolated_db):
    def override():
        yield isolated_db

    app.dependency_overrides[get_db] = override
    try:
        with TestClient(app, follow_redirects=False) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
