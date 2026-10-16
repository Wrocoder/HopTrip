from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import pytest
from tests.test_operations_schedule import module


@pytest.fixture
def storage(monkeypatch, tmp_path):
    monkeypatch.syspath_prepend(str(Path(__file__).resolve().parents[3] / "scripts"))
    result = module("notify-storage")
    monkeypatch.setattr(result, "STATE", tmp_path / "delivered")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "test-only")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "test-only")
    return result


def test_success_is_sent_once_and_dry_run_does_not_send(storage, monkeypatch):
    sent = []
    monkeypatch.setattr(storage, "report", lambda now: "storage")
    monkeypatch.setattr(storage, "deliver", lambda text: sent.append(text) or True)
    assert storage.main(dry_run=True) == 0
    assert not storage.STATE.exists()
    assert not sent
    assert storage.main() == 0
    assert storage.main() == 0
    assert sent == ["storage"]


def test_failure_and_missing_telegram_do_not_record_success(storage, monkeypatch):
    monkeypatch.setattr(storage, "report", lambda now: "storage")
    monkeypatch.setattr(storage, "deliver", lambda text: False)
    assert storage.main() == 1
    assert not storage.STATE.exists()
    monkeypatch.delenv("TELEGRAM_CHAT_ID")
    monkeypatch.setattr(storage, "deliver", lambda text: pytest.fail("must not use email"))
    assert storage.main() == 1
    assert not storage.STATE.exists()


def test_measurement_failure_never_reports_zero(storage, monkeypatch):
    def fail(now):
        raise OSError("private details")
    monkeypatch.setattr(storage, "report", fail)
    monkeypatch.setattr(storage, "deliver", lambda text: pytest.fail("must not send"))
    assert storage.main() == 1
    assert not storage.STATE.exists()


def test_report_separates_docker_and_project_volume_usage(storage, monkeypatch):
    gib = 1024**3
    monkeypatch.setattr(storage.shutil, "disk_usage", lambda root:
                        SimpleNamespace(total=40*gib, used=15*gib, free=23*gib))
    monkeypatch.setattr(storage, "allocated", lambda paths: gib if paths == [storage.ROOT] else 2*gib)
    def command(args):
        if args[1:3] == ["volume", "ls"]:
            assert "label=com.docker.compose.project=hoptrip" in args
            return "hoptrip_postgres_data"
        if args[1:3] == ["volume", "inspect"]:
            return '[{"Mountpoint":"/volumes/db"}]'
        return "Images: 5GB\nBuild Cache: 10GB"
    monkeypatch.setattr(storage, "command", command)
    message = storage.report(datetime(2026, 10, 15, 8, tzinfo=ZoneInfo("Europe/Warsaw")))
    assert "1.00 GiB" in message and "2.00 GiB" in message
    assert "23.00 GiB (57.5%)" in message
    assert "не суммируются" in message


def test_timer_keeps_warsaw_morning_across_dst():
    root = Path(__file__).resolve().parents[3]
    timer = (root / "infrastructure/systemd/hoptrip-storage.timer").read_text()
    assert "OnCalendar=*-*-* 08:00:00 Europe/Warsaw" in timer
    assert "Persistent=false" in timer
