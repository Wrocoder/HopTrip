import pytest
from app.config import Settings
from app.services import alert_mail
from pydantic import SecretStr, ValidationError


@pytest.mark.parametrize("security", ["ssl", "starttls"])
def test_smtp_transport_uses_verified_tls_and_single_message(monkeypatch, security):
    calls = []

    class Client:
        def __init__(self, host, port, **kwargs):
            calls.append(("connect", host, port, kwargs))

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def starttls(self, *, context):
            calls.append(("tls", context))

        def login(self, user, password):
            calls.append(("login", user, password))

        def send_message(self, message):
            calls.append(("send", message))

    monkeypatch.setattr(alert_mail.smtplib, "SMTP_SSL", Client)
    monkeypatch.setattr(alert_mail.smtplib, "SMTP", Client)
    settings = Settings(_env_file=None).model_copy(update={
        "smtp_host": "smtp.example.test", "smtp_port": 465 if security == "ssl" else 587,
        "smtp_security": security, "smtp_user": "sender", "smtp_password": SecretStr("test"),
        "smtp_sender": "alerts@example.test",
    })
    alert_mail.send_alert_mail(settings, "recipient@example.test", "Potwierdź alert", "Treść")
    context = calls[0][3]["context"] if security == "ssl" else calls[1][1]
    assert context.check_hostname
    assert calls[-2] == ("login", "sender", "test")
    assert calls[-1][1]["To"] == "recipient@example.test"
    assert "Treść" in calls[-1][1].get_content()
    assert sum(call[0] == "send" for call in calls) == 1


def test_enabled_alerts_require_credentials_and_trusted_site_origin(monkeypatch):
    for key in ("ALERTS_ENABLED", "SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_SENDER", "ALERTS_SIGNING_KEY"):
        monkeypatch.delenv(key, raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, alerts_enabled=True)
    values = dict(alerts_enabled=True, alerts_signing_key=SecretStr("test" * 10),
                  smtp_host="smtp.example.test", smtp_user="test", smtp_password=SecretStr("test"),
                  smtp_sender="alerts@example.test")
    for origin in ("http://example.test", "https://user@example.test", "https://example.test/?token=secret"):
        with pytest.raises(ValidationError):
            Settings(_env_file=None, alerts_site_url=origin, **values)
    assert Settings(_env_file=None, alerts_site_url="https://example.test", **values).alerts_enabled


@pytest.mark.parametrize("stage,error,expected", [
    ("connect", TimeoutError(), 2),
    ("login", alert_mail.smtplib.SMTPAuthenticationError(454, b"temporary"), 2),
    ("login", alert_mail.smtplib.SMTPAuthenticationError(535, b"denied"), 1),
    ("connect", alert_mail.ssl.SSLCertVerificationError(), 1),
    ("send", TimeoutError(), 1),
    ("quit", TimeoutError(), 1),
])
def test_bounded_retry_only_before_message_submission(monkeypatch, stage, error, expected):
    calls = []
    sends = []
    sleeps = []

    class Client:
        def __init__(self, *args, **kwargs):
            calls.append(True)
            if stage == "connect":
                raise error

        def __enter__(self):
            return self

        def __exit__(self, *args):
            if stage == "quit":
                raise error

        def login(self, *args):
            if stage == "login":
                raise error

        def send_message(self, message):
            sends.append(message)
            if stage == "send":
                raise error

    monkeypatch.setattr(alert_mail.smtplib, "SMTP_SSL", Client)
    monkeypatch.setattr(alert_mail.time, "sleep", sleeps.append)
    with pytest.raises(type(error)):
        alert_mail.send_alert_mail(Settings(_env_file=None), "recipient@example.test", "Test", "Test")
    assert len(calls) == expected
    assert sleeps == ([1] if expected == 2 else [])
    assert len(sends) == (1 if stage in {"send", "quit"} else 0)


def test_temporary_connect_failure_recovers_with_one_message(monkeypatch):
    messages = []
    attempts = []

    class Client:
        def __init__(self, *args, **kwargs):
            attempts.append(True)
            if len(attempts) == 1:
                raise ConnectionRefusedError()

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def login(self, *args):
            pass

        def send_message(self, message):
            messages.append(message)

    monkeypatch.setattr(alert_mail.smtplib, "SMTP_SSL", Client)
    monkeypatch.setattr(alert_mail.time, "sleep", lambda _: None)
    alert_mail.send_alert_mail(Settings(_env_file=None), "recipient@example.test", "Test", "Test")
    assert len(attempts) == 2
    assert len(messages) == 1
