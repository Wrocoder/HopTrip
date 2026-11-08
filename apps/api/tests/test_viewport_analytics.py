"""Synthetic, bounded viewport cohorts; no device inference or real KPI data."""

import json
import os
from pathlib import Path
from uuid import uuid4

import pytest
from app.main import app
from app.models.analytics import AnalyticsEvent
from app.schemas.usage import UsageReport
from app.services.usage_dashboard import render_usage
from fastapi.testclient import TestClient
from sqlalchemy import select
from test_usage_dashboard import HEADERS, PARAMS, add, get


@pytest.mark.parametrize('value', ['small', 'medium', 'large', None, '', 'mobile',
                                   'private@example.test', 390, [], {}])
def test_viewport_metadata_is_optional_allowlisted_and_idempotent(api_client, isolated_db, value):
    event_id = str(uuid4())
    payload = {'event_id': event_id, 'event_name': 'PAGE_VIEW',
               'anonymous_session_id': str(uuid4()), 'metadata': {
                   'viewport': value, 'width': 390, 'userAgent': 'private-browser',
                   'screen': 'private-screen', 'email': 'private@example.test',
               }}
    # A separate synthetic socket peer isolates this case from the suite-wide
    # middleware bucket. Production limits and the deduplication path stay intact.
    with TestClient(app, client=(str(uuid4()), 50000)) as client:
        for _ in range(2):
            assert client.post('/api/v1/analytics/events', json=payload).status_code == 202
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 1
    assert rows[0].metadata_json == ({'viewport': value} if value in ('small', 'medium', 'large')
                                     else {})


def viewport_seed(db):
    from helpers import catalog_fixture

    deal, _ = catalog_fixture(db)
    prefix = ['PAGE_VIEW', 'SEARCH', 'SEARCH_RESULT', 'DEAL_VIEW', 'PARTNER_CLICK']
    for second, name in enumerate(prefix):
        metadata = {'viewport': 'small' if second == 0 else 'large'}
        if name == 'SEARCH_RESULT':
            metadata['search'] = {'result_count': 2}
        add(db, name, 'private-small', second, deal=deal, metadata=metadata)
    for name in ['FILTER_USE', 'TRIP_SAVE', 'BUDGET_CALCULATED', 'ALERT_STARTED', 'ALERT_CONFIRMED']:
        for _ in range(2):
            add(db, name, 'private-small', 9, metadata={'viewport': 'large'})
    add(db, 'PAGE_VIEW', 'private-small-other', metadata={'viewport': 'small'})
    add(db, 'ALERT_CONFIRMED', 'private-medium', metadata={'viewport': 'medium'})  # orphan action
    add(db, 'PAGE_VIEW', 'private-large', metadata={'viewport': 'large'})
    add(db, 'PAGE_VIEW', 'private-unknown', metadata={'viewport': ['private-injection']})
    add(db, 'SEARCH', 'private-unknown', 2, metadata={'viewport': 'small'})
    add(db, 'PAGE_VIEW', 'anonymous', metadata={'viewport': 'medium'})
    add(db, 'UNKNOWN', 'private-no-product', metadata={'viewport': 'medium'})
    db.commit()


def test_first_received_cohorts_partition_sessions_and_preserve_the_ordered_funnel(api_client, isolated_db):
    viewport_seed(isolated_db)
    body = get(api_client).json()
    rows = {row['viewport']: row for row in body['viewport_cohorts']['rows']}
    assert body['viewport_cohorts']['version'] == 'first-received-viewport-cohorts-v1'
    assert body['observed_sessions'] == 5 and body['excluded_events'] == 2
    assert {key: (row['sessions'], row['percent']) for key, row in rows.items()} == {
        'small': (2, '40.00'), 'medium': (1, '20.00'),
        'large': (1, '20.00'), 'unknown': (1, '20.00'),
    }
    assert [step['sessions'] for step in rows['small']['ordered_funnel']['steps']] == [2, 1, 1, 1, 1]
    assert [step['percent'] for step in rows['small']['ordered_funnel']['steps']] == [
        None, '50.00', '100.00', '100.00', '100.00',
    ]
    assert all(step['sessions'] == 0 and step['percent'] is None
               for step in rows['medium']['ordered_funnel']['steps'])
    assert all(item['numerator'] == 1 and item['denominator'] == 2 and item['percent'] == '50.00'
               for item in rows['small']['metrics'])
    medium = {item['key']: item for item in rows['medium']['metrics']}
    assert medium['alert_started']['numerator'] == 0
    assert medium['alert_confirmed']['percent'] == '100.00'  # session share, not signup conversion
    for index, step in enumerate(body['ordered_funnel']['steps']):
        assert sum(row['ordered_funnel']['steps'][index]['sessions'] for row in rows.values()) == step['sessions']
    assert 'private' not in json.dumps(body)
    assert len(body['metrics']) == 11  # existing metrics unchanged, hardware still unavailable


def test_window_and_same_timestamp_record_order_freeze_unknown_without_backfill(api_client, isolated_db):
    add(isolated_db, 'PAGE_VIEW', 'private-boundary', -1, metadata={'viewport': 'large'})
    add(isolated_db, 'PAGE_VIEW', 'private-boundary', 0)
    add(isolated_db, 'SEARCH', 'private-boundary', 0, metadata={'viewport': 'small'})
    add(isolated_db, 'PAGE_VIEW', 'private-outside', 86400, metadata={'viewport': 'medium'})
    isolated_db.commit()
    rows = get(api_client).json()['viewport_cohorts']['rows']
    assert len(rows) == 1 and rows[0]['viewport'] == 'unknown' and rows[0]['sessions'] == 1
    assert [step['sessions'] for step in rows[0]['ordered_funnel']['steps']] == [1, 1, 0, 0, 0]


def test_empty_and_legacy_reports_do_not_invent_a_viewport_baseline(api_client):
    body = get(api_client).json()
    assert body['viewport_cohorts']['rows'] == []
    body.pop('viewport_cohorts')
    legacy = UsageReport.model_validate(body)
    assert legacy.viewport_cohorts is None
    assert 'data-viewport-cohorts' not in render_usage(legacy)


@pytest.mark.parametrize('locale', ['pl', 'en', 'ru', 'uk'])
def test_dashboard_cohorts_are_localized_authenticated_and_private(api_client, isolated_db, locale):
    viewport_seed(isolated_db)
    response = get(api_client, 'dashboard', locale=locale)
    assert 'data-viewport-cohorts="first-received-viewport-cohorts-v1"' in response.text
    assert response.text.count('data-viewport="small"') == 2
    assert f'lang="{locale}"' in response.text
    assert 'private' not in response.text and HEADERS['X-Admin-Token'] not in response.text
    assert '<script' not in response.text
    assert 'noindex' in response.headers['x-robots-tag']
    assert "default-src 'none'" in response.headers['content-security-policy']
    assert api_client.get('/api/v1/admin/analytics/dashboard', params=PARAMS).status_code == 401
    if directory := os.getenv('HOPTRIP_V4_12_EVIDENCE'):
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / f'dashboard-{locale}.html').write_text(response.text, encoding='utf-8')
        (target / 'synthetic-usage.json').write_text(json.dumps(get(api_client).json(), indent=2), encoding='utf-8')
