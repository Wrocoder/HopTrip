import argparse
import json
import os
from pathlib import Path

import httpx
import pytest
from app.jobs.check_operations import check_backup, check_http, main, origin, positive_number


@pytest.mark.parametrize(
    ("status", "body", "expected"),
    [(200, b'{"status":"ready"}', "OK"), (503, b"secret", "HTTP_ERROR"),
     (302, b"", "HTTP_ERROR"), (200, b'<html>login</html>', "INVALID_RESPONSE"),
     (200, b'{"status":"ok"}', "INVALID_RESPONSE"),
     (200, b" " * 4097, "INVALID_RESPONSE"), (200, b"\xff", "INVALID_RESPONSE")],
)
def test_readiness_requires_exact_contract(status, body, expected):
    with httpx.Client(transport=httpx.MockTransport(
        lambda request: httpx.Response(status, content=body)
    )) as client:
        assert check_http(client, "https://example.test/health/ready", readiness=True) == expected


def test_website_and_transport_failures():
    def handler(request):
        if request.url.path == "/timeout":
            raise httpx.ReadTimeout("sensitive failure details")
        return httpx.Response(200, headers={"content-type": "text/html; charset=utf-8"})

    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        assert check_http(client, "https://example.test/") == "OK"
        assert check_http(client, "https://example.test/timeout") == "UNREACHABLE"
    with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200))) as client:
        assert check_http(client, "https://example.test/") == "INVALID_RESPONSE"


def test_backup_ignores_partial_empty_and_unrelated_files(tmp_path):
    for name in ["hoptrip-20260923T030000Z-1.dump.partial", "other.dump"]:
        (tmp_path / name).write_bytes(b"partial")
    dump = tmp_path / "hoptrip-20260923T030000Z-1.dump"
    dump.touch()
    assert check_backup(tmp_path, 30, now=200000) == "MISSING"
    dump.write_bytes(b"sample")
    os.utime(dump, (92000, 92000))
    assert check_backup(tmp_path, 30, now=200000) == "OK"
    assert check_backup(tmp_path, 30, now=200001) == "STALE"
    assert check_backup(tmp_path, 30, now=91999) == "FUTURE_TIMESTAMP"
    assert check_backup(tmp_path / "missing", 30) == "MISSING"


def test_backup_permission_failure(monkeypatch, tmp_path):
    def denied(self):
        raise PermissionError("private path")
    monkeypatch.setattr(Path, "iterdir", denied)
    assert check_backup(tmp_path, 30) == "UNREADABLE"


@pytest.mark.parametrize("value", ["https://u:secret@host", "ftp://host", "https://host/path",
                                   "https://host?token=secret", "https://host/#fragment", "bad"])
def test_origin_rejects_secrets_and_non_origins(value):
    with pytest.raises(argparse.ArgumentTypeError):
        origin(value)


@pytest.mark.parametrize("value", ["0", "-1", "nan", "inf", "bad"])
def test_invalid_thresholds(value):
    with pytest.raises(argparse.ArgumentTypeError):
        positive_number(value)


def test_cli_reports_skipped_backup_and_failure_exit(monkeypatch, capsys, tmp_path):
    monkeypatch.setattr("app.jobs.check_operations.check_http", lambda *a, **kw: "OK")
    args = ["--site-url", "http://localhost:3000/", "--api-url", "http://localhost:8000"]
    assert main(args) == 0
    assert json.loads(capsys.readouterr().out)["checks"]["backup_freshness"] == "SKIPPED"
    assert main([*args, "--backup-dir", str(tmp_path)]) == 1
    report = json.loads(capsys.readouterr().out)
    assert report["ok"] is False
    assert str(tmp_path) not in json.dumps(report)
    monkeypatch.setattr("app.jobs.check_operations.check_http", lambda *a, **kw: "UNREACHABLE")
    assert main(args) == 1
