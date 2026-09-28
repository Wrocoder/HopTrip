import json
from datetime import date

import httpx
import pytest
from app.jobs.check_partner_statistics import FIELDS, check_statistics, main

START, END = date(2026, 9, 24), date(2026, 9, 28)


def run(handler):
    return check_statistics("secret-test-token", START, END, transport=httpx.MockTransport(handler))


def test_only_account_counts_are_returned_and_query_is_bounded():
    def handler(request):
        assert str(request.url) == "https://api.travelpayouts.com/statistics/v1/execute_query"
        assert request.headers["X-Access-Token"] == "secret-test-token"
        payload = json.loads(request.content)
        assert payload["limit"] == 1 and payload["offset"] == 0
        assert payload["fields"] == list(FIELDS)
        assert payload["filters"] == [
            {"field": "campaign_id", "op": "eq", "value": 100},
            {"field": "date", "op": "ge", "value": "2026-09-24"},
            {"field": "date", "op": "le", "value": "2026-09-28"},
        ]
        return httpx.Response(200, json={"total_rows": 1, "results": [
            {**dict.fromkeys(FIELDS, "7"), "sub_id": "private", "action_id": "private"},
        ]})
    result = run(handler)
    assert result["status"] == "OK" and result["counts"] == dict.fromkeys(FIELDS, 7)
    assert result["scope"] == "AVIASALES_ACCOUNT"
    assert result["click_attribution_verified"] is False
    assert result["conversion_attribution_verified"] is False
    assert "private" not in json.dumps(result) and "secret-test-token" not in json.dumps(result)


@pytest.mark.parametrize("code,status", [
    (401, "ACCESS_DENIED"), (403, "ACCESS_DENIED"), (429, "RATE_LIMITED"),
    (500, "HTTP_ERROR"), (302, "HTTP_ERROR"),
])
def test_errors_are_redacted_and_redirects_not_followed(code, status):
    requests = []
    def handler(request):
        requests.append(request)
        return httpx.Response(code, text="secret-test-token", headers={"Location": "https://evil.test"})
    result = run(handler)
    assert result["status"] == status and len(requests) == 1
    assert "secret-test-token" not in json.dumps(result)


@pytest.mark.parametrize("value", [None, True, -1, 1.5, "NaN", "-2", "1.0"])
def test_invalid_counts_do_not_become_zero(value):
    result = run(lambda _: httpx.Response(200, json={
        "total_rows": 1, "results": [{**dict.fromkeys(FIELDS, 0), "clicks_count": value}],
    }))
    assert result["status"] == "INVALID_RESPONSE"


@pytest.mark.parametrize("payload", [[], {}, {"total_rows": 2, "results": []},
                                       {"total_rows": 1, "results": []}])
def test_invalid_envelopes(payload):
    assert run(lambda _: httpx.Response(200, json=payload))["status"] == "INVALID_RESPONSE"


def test_no_data_is_not_a_fabricated_zero_report():
    result = run(lambda _: httpx.Response(200, json={"total_rows": 0, "results": []}))
    assert result["status"] == "NO_DATA" and result["counts"] is None


def test_network_and_oversized_response():
    def timeout(request):
        raise httpx.ReadTimeout("secret-test-token", request=request)
    assert run(timeout)["status"] == "UNREACHABLE"
    assert run(lambda _: httpx.Response(200, content=b"x" * 65537))["status"] == "INVALID_RESPONSE"


def test_configuration_and_period_fail_without_network(monkeypatch, capsys):
    def unexpected(_):
        pytest.fail("No network request expected")
    transport = httpx.MockTransport(unexpected)
    assert check_statistics("", START, END, transport=transport)["status"] == "NOT_CONFIGURED"
    for start, end in [(END, START), (date(2026, 8, 1), END), (START, date(2099, 1, 1))]:
        assert check_statistics("token", start, end, transport=transport)["status"] == "INVALID_PERIOD"
    monkeypatch.delenv("TRAVELPAYOUTS_API_TOKEN", raising=False)
    assert main(["--date-from", START.isoformat(), "--date-to", END.isoformat()]) == 1
    assert json.loads(capsys.readouterr().out)["status"] == "NOT_CONFIGURED"
