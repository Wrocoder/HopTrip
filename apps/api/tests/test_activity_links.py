import json
from pathlib import Path

import pytest
from tests.test_operations_schedule import module

links = module("check-activity-links")
ITEM = {"city": "milan", "id": "tiqets-1111408",
        "url": "https://www.tiqets.com/en/test-p1111408/"}


def test_catalog_is_the_same_complete_source_used_by_web():
    path = Path(__file__).resolve().parents[3] / "apps/web/src/lib/activity-expansion.json"
    items = links.load_catalog(path)
    assert len(items) == 71
    assert len({item["city"] for item in items}) == 68
    assert all("tpx.gr" not in item["url"] and "tp.media" not in item["url"] for item in items)


@pytest.mark.parametrize("code,status", [(200, "OK"), (404, "BROKEN"), (410, "BROKEN"),
                                         (403, "BLOCKED"), (429, "BLOCKED"), (503, "TEMPORARY")])
def test_http_classification(code, status):
    assert links.check_link(ITEM, lambda url: (code, None))["status"] == status


def test_network_failures_are_not_called_broken():
    def timeout(url):
        raise TimeoutError("do not include raw exception in report")
    result = links.check_link(ITEM, timeout)
    assert result["status"] == "TEMPORARY"
    assert "raw exception" not in json.dumps(result)


@pytest.mark.parametrize("target", ["https://tp.media/r?u=x", "http://example.com",
                                    "https://tiqets.tpx.gr/test", "https://www.tiqets.com/?partner=x"])
def test_tracking_and_unsafe_redirects_are_never_requested(target):
    seen = []
    def request(url):
        seen.append(url)
        return 302, target
    assert links.check_link(ITEM, request)["status"] == "REVIEW"
    assert seen == [ITEM["url"]]


def test_private_dns_is_rejected(monkeypatch):
    monkeypatch.setattr(links.socket, "getaddrinfo", lambda *a, **kw: [(0, 0, 0, "", ("127.0.0.1", 443))])
    with pytest.raises(ValueError):
        links.public_address(ITEM["url"])


@pytest.mark.parametrize("target,status", [
    ("https://www.tiqets.com/en/renamed-p1111408/", "OK"),
    ("https://www.tiqets.com/en/other-p9999/", "REVIEW"),
    ("https://www.tiqets.com/", "REVIEW"),
])
def test_product_redirects_need_same_product(target, status):
    result = links.check_link(ITEM, lambda url: (302, target) if url == ITEM["url"] else (200, None))
    assert result["status"] == status


def test_confirmation_needs_separate_days_and_resets_on_recovery_or_new_url():
    now = 100000
    def run(previous, at, status="BROKEN", url=ITEM["url"]):
        rows = [{**ITEM, "url": url, "status": status}]
        state = links.summarize(rows, previous, at)
        return state, rows[0]
    state, row = run({}, now)
    assert not row["confirmed"]
    state, row = run(state, now + 60)
    assert row["consecutive"] == 1
    state, row = run(state, now + 86400)
    assert row["confirmed"]
    _, row = run(state, now + 172800, url="https://example.com/new")
    assert not row["confirmed"]
    state, row = run(state, now + 172800, status="OK")
    assert row["consecutive"] == 0
    assert not row["confirmed"]
    state, row = run(state, now + 259200, status="TEMPORARY")
    state, row = run(state, now + 345600, status="TEMPORARY")
    assert not row["confirmed"]
    _, row = run(state, now + 432000, status="TEMPORARY")
    assert row["confirmed"]


def test_notifications_confirm_deduplicate_retry_and_recover(tmp_path):
    path = tmp_path / "notifications.json"
    row = {**ITEM, "status": "BROKEN", "confirmed": False}
    messages = []

    def send(message):
        messages.append(message)
        return True

    assert links.notify([row], path, send)
    assert not messages
    row["confirmed"] = True
    assert not links.notify([row], path, lambda message: False)
    assert not path.exists()
    assert links.notify([row], path, send)
    assert "BROKEN" in messages[0] and ITEM["url"] in messages[0]
    assert links.notify([row], path, send)
    assert len(messages) == 1
    # New unconfirmed errors must not falsely signal recovery.
    assert links.notify([{**row, "status": "TEMPORARY", "confirmed": False}], path, send)
    assert len(messages) == 1
    assert links.notify([{**row, "status": "OK", "confirmed": False}], path, send)
    assert len(messages) == 2
    assert json.loads(path.read_text()) == {}


def test_monitor_detects_missing_stale_and_invalid_link_report(tmp_path):
    monitor = module("monitor")
    path = tmp_path / "latest.json"
    assert not monitor.link_report_fresh(path, 200000)
    path.write_text(json.dumps({"checked_at": 100000}))
    assert monitor.link_report_fresh(path, 200000)
    assert not monitor.link_report_fresh(path, 250000)
    path.write_text("{}")
    assert not monitor.link_report_fresh(path, 200000)
