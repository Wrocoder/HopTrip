"""Exercise shared browser-fixture cleanup in a separate, network-free process."""
import os
import subprocess
import sys
from pathlib import Path


def test_short_trips_cleanup_preserves_baseline_airports_and_growth_setup():
    root = Path(__file__).resolve().parents[3]
    env = {**os.environ, 'HOPTRIP_E2E': '1', 'APP_ENV': 'test', 'DATABASE_URL': 'sqlite://',
           'ALERTS_ENABLED': 'false', 'ALERTS_DIGEST_ENABLED': 'false',
           'TELEGRAM_ENABLED': 'false', 'TELEGRAM_DELIVERY_ENABLED': 'false',
           'EVENTS_SYNC_ENABLED': 'false', 'EDITOR_ENABLED': 'false', 'SMTP_HOST': '',
           'SMTP_USER': '', 'SMTP_PASSWORD': '', 'TRAVELPAYOUTS_API_TOKEN': '',
           'PYTHONPATH': os.pathsep.join([str(root / 'apps/api'), str(root / 'apps/api/tests')])}
    result = subprocess.run([sys.executable, '-c', '''
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from e2e_app import app, engine, Airport

def registry():
    with Session(engine) as db:
        return dict(db.execute(select(Airport.iata_code, Airport.id)).all())

with TestClient(app) as client:
    before = registry()
    assert "WAW" in before
    for _ in range(2):
        assert client.post("/__test__/short-trips?enabled=true").status_code == 200
        assert registry()["WAW"] == before["WAW"]
        assert client.post("/__test__/short-trips?enabled=false").status_code == 200
        assert registry() == before
    assert client.post("/__test__/growth").status_code == 200
    assert client.get("/api/v1/deals/growth-15").status_code == 200
    assert client.delete("/__test__/growth").status_code == 200
    assert registry() == before
'''], cwd=root, env=env, capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, result.stdout + result.stderr
