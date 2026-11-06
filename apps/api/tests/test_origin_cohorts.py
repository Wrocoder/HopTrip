import json
import os
from pathlib import Path
from typing import get_args

import pytest
from app.schemas.usage import UsageReport
from app.services.airports import AIRPORT_ALIASES
from app.services.usage_dashboard import render_usage
from test_usage_dashboard import add, get, seed


def search(origin):
    return {"search": {"filters": {"origin": origin}}}


def cohort_seed(db):
    """Synthetic overlapping origins/actions, not observed production sessions."""
    add(db, "BUDGET_CALCULATED", "private-wro", 0)  # before the session's first search
    add(db, "SEARCH", "private-wro", 1, metadata=search("WRO"))
    add(db, "SEARCH", "private-wro", 2, metadata=search("KRK"))
    add(db, "DEAL_DETAILS_OPEN", "private-wro", 3)
    add(db, "DEAL_DETAILS_OPEN", "private-wro", 4)
    add(db, "SEARCH_RESULT", "private-group", 1, metadata=search("WAW,WMI"))
    add(db, "TRIP_UPDATE", "private-group", 2)
    add(db, "SEARCH", "private-unknown", 1, metadata=search("private@example.test"))
    add(db, "SEARCH", "private-unknown", 2, metadata=search("WRO"))
    add(db, "TRIP_UPDATE", "private-unknown", 3)
    add(db, "PAGE_VIEW", "private-no-search", 1, metadata={"origin": "WRO"})
    db.commit()


def test_first_search_context_partitions_all_sessions_without_claiming_attribution(api_client, isolated_db):
    cohort_seed(isolated_db)
    body = get(api_client).json()
    assert body["observed_events"] == 11 and body["observed_sessions"] == 4
    report = body["origin_cohorts"]
    assert report["version"] == "first-search-origin-cohorts-v1"
    rows = {row["origin"]: row for row in report["rows"]}
    assert list(rows) == ["WAW,WMI", "WRO", "unknown"]
    assert [row["sessions"] for row in rows.values()] == [1, 1, 2]
    assert [row["percent"] for row in rows.values()] == ["25.00", "25.00", "50.00"]
    assert [[m["numerator"] for m in row["metrics"]] for row in rows.values()] == [[0, 0, 1], [1, 1, 0], [0, 0, 1]]
    for row in rows.values():
        assert all(metric["denominator"] == row["sessions"] for metric in row["metrics"])
    for index, metric in enumerate(body["engagement"]["metrics"]):
        assert sum(row["metrics"][index]["numerator"] for row in rows.values()) == metric["numerator"]
    assert len(body["metrics"]) == 11
    assert "private" not in json.dumps(body)


@pytest.mark.parametrize("metadata", [None, [], {"search": None}, {"search": []},
    {"search": {"filters": []}}, search(None), search(True), search(["WRO"]),
    search("wro"), search("WRO "), search("WMI,WAW"), search("ZZZ"), search("BCN"),
    search("private-token")])
def test_missing_or_untrusted_first_context_stays_unknown_without_later_backfill(api_client, isolated_db, metadata):
    row = add(isolated_db, "SEARCH_RESULT", "private-one", metadata=metadata)
    row.metadata_json = metadata
    add(isolated_db, "SEARCH", "private-one", 2, metadata=search("WRO"))
    isolated_db.commit()
    cohorts = get(api_client).json()["origin_cohorts"]["rows"]
    assert len(cohorts) == 1 and cohorts[0]["origin"] == "unknown"


def test_server_order_window_and_placeholder_exclusions_apply(api_client, isolated_db):
    add(isolated_db, "SEARCH", "private-one", -1, metadata=search("KRK"))
    add(isolated_db, "SEARCH_RESULT", "private-one", 1, metadata=search("WAW,WMI"))
    add(isolated_db, "SEARCH", "private-one", 1, metadata=search("WRO"))  # same time, later DB id
    add(isolated_db, "SEARCH", "private-at-end", 86400, metadata=search("WRO"))
    add(isolated_db, "SEARCH", "anonymous", metadata=search("WRO"))
    add(isolated_db, "UNKNOWN", "private-other", metadata=search("WRO"))
    isolated_db.commit()
    body = get(api_client).json()
    assert body["excluded_events"] == 2 and body["observed_sessions"] == 1
    assert [(row["origin"], row["percent"]) for row in body["origin_cohorts"]["rows"]] == [("WAW,WMI", "100.00")]


def test_first_missing_context_is_not_inferred_from_unrelated_events(api_client, isolated_db):
    add(isolated_db, "PAGE_VIEW", "private-one", metadata=search("WRO"))
    add(isolated_db, "DEAL_VIEW", "private-one", metadata=search("WRO"))
    add(isolated_db, "SEARCH", "private-one", 2)
    add(isolated_db, "SEARCH", "private-one", 3, metadata=search("WRO"))
    isolated_db.commit()
    assert get(api_client).json()["origin_cohorts"]["rows"][0]["origin"] == "unknown"


def test_empty_population_and_legacy_constructor_are_supported(api_client):
    body = get(api_client).json()
    assert body["origin_cohorts"]["rows"] == []
    body.pop("origin_cohorts")
    legacy = UsageReport.model_validate(body)
    assert legacy.origin_cohorts is None
    assert "data-origin-cohorts=" not in render_usage(legacy)


def test_origin_contract_is_bounded_by_the_existing_polish_airport_registry():
    from app.schemas.usage import OriginKey

    assert set(get_args(OriginKey)) == set(AIRPORT_ALIASES) | {"WAW,WMI", "unknown"}


@pytest.mark.parametrize("locale", ["pl", "en", "ru", "uk"])
@pytest.mark.parametrize("state", ["populated", "unknown", "empty"])
def test_origin_dashboard_locales_privacy_and_evidence(api_client, isolated_db, locale, state):
    if state == "populated":
        cohort_seed(isolated_db)
    elif state == "unknown":
        seed(isolated_db)
    response = get(api_client, "dashboard", locale=locale)
    assert 'data-origin-cohorts="first-search-origin-cohorts-v1"' in response.text
    assert "private" not in response.text and "<script" not in response.text
    assert "noindex" in response.headers["x-robots-tag"]
    if directory := os.getenv("HOPTRIP_18B6_EVIDENCE"):
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / f"dashboard-{locale}-{state}.html").write_text(response.text, encoding="utf-8")
        if locale == "pl":
            (target / f"usage-{state}.json").write_text(json.dumps(get(api_client).json(), indent=2), encoding="utf-8")
