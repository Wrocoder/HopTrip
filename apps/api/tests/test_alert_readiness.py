"""Consent gates at selection and SMTP boundary; synthetic recipients and no network."""

import pytest
from app.models.alert import AlertDelivery
from app.services import alert_digests
from app.services.alerts import CONSENT_VERSION
from sqlalchemy import select
from test_alert_digests import NOW, offer, settings, subscription


@pytest.mark.parametrize('version', ['', 'unrecognized-consent'])
def test_email_requires_recognized_consent_before_reservation(isolated_db, monkeypatch, version):
    alert = subscription(isolated_db)
    alert.consent_version = version
    isolated_db.commit()
    offer(isolated_db)
    messages = []
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: messages.append(args))
    assert alert_digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert messages == []
    assert alert.last_digest_at is None
    assert isolated_db.scalar(select(AlertDelivery)) is None


@pytest.mark.parametrize('mutation', ['confirmation-revoked', 'consent-revoked'])
def test_email_rechecks_opt_in_after_reservation(isolated_db, monkeypatch, mutation):
    alert = subscription(isolated_db)
    alert.consent_version = CONSENT_VERSION
    isolated_db.commit()
    offer(isolated_db)
    commit = isolated_db.commit

    def change_after_reservation():
        reserved = any(isinstance(item, AlertDelivery) for item in isolated_db.new)
        commit()
        if reserved:
            if mutation == 'confirmation-revoked':
                alert.confirmed_at = None
            else:
                alert.consent_version = 'unrecognized-consent'
            commit()

    messages = []
    monkeypatch.setattr(isolated_db, 'commit', change_after_reservation)
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: messages.append(args))
    result = alert_digests.deliver_digests(isolated_db, settings(), NOW)
    assert result['cancelled'] == 1
    assert result['sent'] == 0
    assert messages == []
    assert isolated_db.scalar(select(AlertDelivery)).status == 'CANCELLED'
    assert alert_digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
