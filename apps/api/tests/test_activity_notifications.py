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


def test_group_pairing_requires_exact_command_and_unique_group_topic():
    setup = module("setup-notifications")
    command = "/hoptrip_nonce@bot"

    def update(chat, kind, text=command, topic=None):
        message = {"chat": {"id": chat, "type": kind}, "text": text}
        if topic is not None:
            message["message_thread_id"] = topic
        return {"message": message}

    matching = update(-100123, "supergroup", topic=42)
    assert setup.group_target(
        [
            update(123, "private"),
            update(-5, "group", "old"),
            matching,
            matching,
        ],
        command,
    ) == ("-100123", "42")
    with pytest.raises(ValueError):
        setup.group_target([matching, update(-9, "group")], command)
    with pytest.raises(ValueError):
        setup.group_target([update(123, "private")], command)


def test_group_switch_saves_only_after_success_and_keeps_mail_settings(tmp_path, monkeypatch):
    setup = module("setup-notifications")
    env = tmp_path / "monitor.env"
    original = 'TELEGRAM_BOT_TOKEN="123:abc"\nTELEGRAM_CHAT_ID="12"\nIMAP_PASSWORD="keep"\n'
    env.write_text(original)
    monkeypatch.setattr(setup, "ENV", env)
    assert setup.saved_bot_token() == "123:abc"

    def fail(*args):
        raise RuntimeError

    monkeypatch.setattr(setup, "telegram", fail)
    with pytest.raises(RuntimeError):
        setup.connect_group("123:abc", "-100123", "42")
    assert env.read_text() == original
    sent = []
    monkeypatch.setattr(setup, "telegram", lambda *args: sent.append(args))
    setup.connect_group("123:abc", "-100123", "42")
    assert sent[0][2]["message_thread_id"] == 42
    assert 'TELEGRAM_CHAT_ID="-100123"' in env.read_text()
    assert 'IMAP_PASSWORD="keep"' in env.read_text()


def test_monitor_routes_all_notifications_to_selected_topic(monkeypatch):
    monitor = module("monitor")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123:test")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "-100123")
    monkeypatch.setenv("TELEGRAM_MESSAGE_THREAD_ID", "42")
    sent = []

    class Reply:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def read(self, limit):
            return b'{"ok": true}'

    def send(request, **kwargs):
        sent.append(monitor.json.loads(request.data))
        return Reply()

    monkeypatch.setattr(monitor.urllib.request, "urlopen", send)
    assert monitor.deliver("summary")
    assert sent == [{"chat_id": "-100123", "text": "summary", "message_thread_id": 42}]
