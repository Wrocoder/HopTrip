import importlib.util
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from sqlalchemy import select
from tests.helpers import approved_program, catalog_fixture


def module(name):
    path = Path(__file__).resolve().parents[3] / "scripts" / (name + ".py")
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def test_redirect_without_session_does_not_create_analytics(api_client, isolated_db):
    catalog_fixture(isolated_db, program=approved_program(isolated_db))
    response = api_client.get("/go/fixture-deal/flight?source=ignored&campaign=ignored")
    assert response.status_code == 307
    assert isolated_db.scalar(select(AnalyticsEvent)) is None
    click = isolated_db.scalar(select(AffiliateClick))
    assert click.anonymous_session_id == "not-provided"
    assert click.source is click.campaign is None


def test_retention_preserves_daily_and_weekly_and_ignores_other_files(tmp_path):
    retention = module("retain-scheduled-backups")
    now = datetime.now(UTC) - timedelta(hours=1)
    copies = []
    for day in range(45):
        stamp = now - timedelta(days=day)
        path = tmp_path / f"hoptrip-{stamp:%Y%m%dT%H%M%SZ}-123.dump"
        path.write_bytes(b"fixture")
        copies.append(path)
    unrelated = tmp_path / "manual.dump"
    unrelated.write_bytes(b"keep")
    partial = tmp_path / "hoptrip-20260101T000000Z-123.dump.partial"
    partial.write_bytes(b"partial")
    removed = retention.obsolete(tmp_path)
    assert not set(copies[:14]).intersection(removed)
    assert copies[-1] in removed
    assert unrelated not in removed and partial not in removed
    assert len(set(copies) - set(removed)) >= 15


def test_monitor_retries_delivery_and_sends_recovery(tmp_path, monkeypatch):
    monitor = module("monitor")
    monkeypatch.setattr(monitor, "STATE", tmp_path / "state.json")
    monkeypatch.setattr(monitor, "ROOT", tmp_path)
    monkeypatch.setattr(monitor.shutil, "disk_usage", lambda p: SimpleNamespace(total=10**11, free=5*10**10))
    monkeypatch.setattr(monitor, "http_check", lambda *a: True)
    monkeypatch.setattr(monitor, "newest_backup_ok", lambda *a: True)
    monkeypatch.setattr(monitor, "pipeline_ok", lambda: False)
    monkeypatch.setattr(monitor, "command_equals", lambda *a: True)
    monkeypatch.setattr("sys.argv", ["monitor"])
    monkeypatch.setattr(monitor, "deliver", lambda message: False)
    assert monitor.main() == 1
    assert "delivered_incident" not in json.loads(monitor.STATE.read_text())
    messages = []
    monkeypatch.setattr(monitor, "deliver", lambda message: messages.append(message) or True)
    assert monitor.main() == 1
    assert len(messages) == 1
    monitor.main()
    assert len(messages) == 1  # Same failure is not sent every five minutes.
    monkeypatch.setattr(monitor, "pipeline_ok", lambda: True)
    assert monitor.main() == 0
    assert "RECOVERED" in messages[-1]
    monitor.main()
    assert len(messages) == 2


def test_monitor_age_and_invalid_backup(tmp_path):
    monitor = module("monitor")
    assert not monitor.newest_backup_ok(tmp_path, 100)
    path = tmp_path / "hoptrip-20260925T000000Z-12.dump"
    path.write_bytes(b"backup")
    now = path.stat().st_mtime
    assert monitor.newest_backup_ok(tmp_path, now)
    assert not monitor.newest_backup_ok(tmp_path, now - 1)
    assert not monitor.newest_backup_ok(tmp_path, now + 31 * 3600)
