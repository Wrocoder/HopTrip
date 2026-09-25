from pathlib import Path

import pytest
from tests.test_operations_schedule import module


@pytest.fixture
def activity(monkeypatch, tmp_path):
    monkeypatch.syspath_prepend(str(Path(__file__).resolve().parents[3] / "scripts"))
    result = module("notify-activity")
    monkeypatch.setattr(result, "STATE", tmp_path / "activity.json")
    monkeypatch.setenv("IMAP_USER", "kontakt@hoptrip.pl")
    monkeypatch.setenv("IMAP_PASSWORD", "private-password")
    return result


class Inbox:
    validity = b"11"
    next_uid = b"101"
    ids = b"99 100"

    def __init__(self, *args, **kwargs):
        assert kwargs["port"] == 993
        assert kwargs["ssl_context"].check_hostname

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def login(self, user, password):
        assert password == "private-password"

    def select(self, folder, readonly):
        assert folder == "INBOX" and readonly
        return "OK", []

    def response(self, name):
        return name, [self.validity if name == "UIDVALIDITY" else self.next_uid]

    def uid(self, command, *args):
        assert command == "search"  # Never fetch bodies or mark as read.
        return "OK", [self.ids]


def test_mail_baseline_and_uid_filter(activity):
    cursor, count, first = activity.inbox_snapshot(None, factory=Inbox)
    assert cursor == {"validity": 11, "uid": 100} and count == 0 and first
    cursor, count, first = activity.inbox_snapshot({"validity": 11, "uid": 99}, factory=Inbox)
    assert count == 1 and not first and cursor["uid"] == 100
    assert activity.inbox_snapshot(cursor, factory=Inbox)[1] == 0
    assert activity.inbox_snapshot({"validity": 10, "uid": 9000}, factory=Inbox)[2]


def test_failed_mail_delivery_is_retried_without_exposing_contents(activity, monkeypatch):
    old = {"validity": 11, "uid": 99}
    state = {"mail": old, "mailbox": "kontakt@hoptrip.pl"}
    monkeypatch.setattr(
        activity, "inbox_snapshot", lambda cursor: ({"validity": 11, "uid": 101}, 2, False)
    )
    monkeypatch.setattr(activity, "deliver", lambda text: False)
    with pytest.raises(RuntimeError):
        activity.notify_mail(state)
    assert state["mail"] == old
    messages = []
    monkeypatch.setattr(activity, "deliver", lambda text: messages.append(text) or True)
    assert activity.notify_mail(state) == "OK"
    assert state["mail"]["uid"] == 101
    assert "Новых писем: 2" in messages[0]
    assert "private-password" not in messages[0]


def test_summary_checkpoint_only_after_delivery(activity, monkeypatch):
    rows = [
        {
            "id": 7,
            "added": 3,
            "updated": 20,
            "observations": 4,
            "skipped": 1,
            "finished": "2026-09-25",
        }
    ]
    monkeypatch.setattr(activity, "completed_jobs", lambda cursor: rows if cursor is None else [])
    state = {}
    monkeypatch.setattr(activity, "deliver", lambda text: False)
    with pytest.raises(RuntimeError):
        activity.notify_jobs(state)
    assert "job_id" not in state
    messages = []
    monkeypatch.setattr(activity, "deliver", lambda text: messages.append(text) or True)
    activity.notify_jobs(state)
    activity.notify_jobs(state)
    assert state["job_id"] == 7 and len(messages) == 1
    assert "Добавлено: 3" in messages[0] and "Обновлено записей: 20" in messages[0]


def test_setup_preserves_other_settings_and_hides_secrets(tmp_path, monkeypatch):
    setup = module("setup-notifications")
    env = tmp_path / "monitor.env"
    env.write_text("SMTP_HOST=example.test\nTELEGRAM_BOT_TOKEN=old\n")
    monkeypatch.setattr(setup, "ENV", env)
    setup.store({"TELEGRAM_BOT_TOKEN": "123:abc", "IMAP_PASSWORD": 'a"b\\c$123'})
    data = env.read_text()
    assert "SMTP_HOST=example.test" in data
    assert data.count("TELEGRAM_BOT_TOKEN=") == 1
    assert 'IMAP_PASSWORD="a\\"b\\\\c$123"' in data
    with pytest.raises(ValueError):
        setup.quote("password\nINJECT=value")
