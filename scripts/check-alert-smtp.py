"""Explicit one-message HT-12 acceptance check in an isolated API container.

Mount current app at /check/app, SMTP dotenv at /run/smtp.env (read-only),
and a private evidence directory at /evidence. Never use the production DB.
The persistent marker prevents accidental repeat sends after a timeout.
"""

import argparse
import email
import imaplib
import logging
import re
import secrets
import ssl
import sys
import time
from email import policy
from pathlib import Path

from app.api.alerts import router
from app.config import Settings, get_settings
from app.db.base import Base
from app.db.session import get_db
from app.models.alert import DealAlert
from app.models.location import Airport
from app.services import alerts
from app.services.alert_mail import send_alert_mail
from dotenv import dotenv_values
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--send-one', action='store_true', required=True)
    parser.parse_args()
    logging.disable(logging.CRITICAL)
    env = dotenv_values('/run/smtp.env')
    mailbox = 'kontakt@hoptrip.pl'
    assert env['SMTP_USER'] == env['SMTP_SENDER'] == mailbox
    settings = Settings(
        _env_file=None, database_url='sqlite://', alerts_enabled=True,
        alerts_signing_key=secrets.token_hex(32), alerts_site_url='http://localhost:3000',
        smtp_host=env['SMTP_HOST'], smtp_port=int(env['SMTP_PORT']),
        smtp_security=env['SMTP_SECURITY'], smtp_user=mailbox,
        smtp_sender=mailbox, smtp_password=env['SMTP_PASSWORD'],
    )
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    marker = Path('/evidence/ht12-one-message-attempted')
    subject = 'TEST HopTrip HT-12 ' + secrets.token_hex(12)
    sent = []

    def transport(config, recipient, original_subject, body):
        assert recipient == mailbox and not sent
        # Claim before SMTP: even ambiguous SMTP failures must not auto-resend.
        with marker.open('x') as handle:
            handle.write(subject + '\n')
        sent.append(True)
        send_alert_mail(config, recipient, subject,
                        'TEST techniczny za zgodą właściciela. Nie klikaj linków: '
                        'dotyczą tymczasowej bazy testowej i zostaną sprawdzone automatycznie.\n\n' + body)
        print('One confirmation message accepted by SMTP', flush=True)

    alerts.send_alert_mail = transport
    with imaplib.IMAP4_SSL('imap.mail.ovh.net', 993, ssl_context=ssl.create_default_context()) as inbox:
        inbox.login(mailbox, env['SMTP_PASSWORD'])
        assert inbox.select('INBOX', readonly=True)[0] == 'OK'
        with Session(engine) as db:
            db.add(Airport(iata_code='WRO', name='Wrocław', city='Wrocław', country_code='PL'))
            db.commit()
            app = FastAPI()
            app.include_router(router)

            def database():
                yield db

            app.dependency_overrides[get_db] = database
            app.dependency_overrides[get_settings] = lambda: settings
            with TestClient(app) as client:
                filters = {'origin': 'WRO', 'budget': '250', 'duration_min': 2,
                           'duration_max': 4, 'frequency': 'weekly', 'weekend': True}
                response = client.post('/api/v1/alerts', json={
                    'email': mailbox, 'consent': True, 'filters': filters})
                assert response.status_code == 202, 'Signup failed'
                assert db.scalar(select(DealAlert)).status == 'PENDING'
                received = None
                deadline = time.monotonic() + 120
                while time.monotonic() < deadline:
                    inbox.noop()
                    status, matches = inbox.uid('search', None, 'HEADER', 'Subject', '"' + subject + '"')
                    assert status == 'OK'
                    if matches[0]:
                        status, parts = inbox.uid('fetch', matches[0].split()[-1], '(BODY.PEEK[])')
                        assert status == 'OK'
                        raw = next(part[1] for part in parts if isinstance(part, tuple))
                        received = email.message_from_bytes(raw, policy=policy.default)
                        break
                    time.sleep(5)
                assert received is not None, 'Message not found in INBOX within 120 seconds; do not resend'
                assert str(received['Subject']) == subject
                body = received.get_body(preferencelist=('plain',)).get_content()
                match = re.search(r'/confirm#token=([^\s]+)', body)
                assert match is not None
                print('Confirmation received in INBOX; body fetched without marking read', flush=True)
                response = client.post('/api/v1/alerts/confirm', json={'token': match.group(1)})
                assert response.status_code == 200
                token = response.json()['token']
                assert client.post('/api/v1/alerts/manage', json={'token': token}).json()['status'] == 'ACTIVE'
                changed = {**filters, 'budget': '220', 'frequency': 'daily', 'weekend': False}
                assert client.patch('/api/v1/alerts/manage', json={'token': token, 'filters': changed}).status_code == 200
                saved = client.post('/api/v1/alerts/manage', json={'token': token}).json()['filters']
                assert saved['budget'] == '220' and saved['frequency'] == 'daily' and saved['weekend'] is False
                for _ in range(2):
                    assert client.post('/api/v1/alerts/unsubscribe', json={'token': token}).json()['status'] == 'STOPPED'
                assert client.post('/api/v1/alerts/confirm', json={'token': match.group(1)}).status_code == 410
                assert len(sent) == 1
                print('PASS: PENDING -> received token -> ACTIVE -> preferences saved -> STOPPED', flush=True)
                print('Exactly one email sent; isolated in-memory DB only; public registration unchanged', flush=True)
                Path('/evidence/ht12-result.txt').write_text('PASS: one SMTP email received in INBOX; confirm/update/unsubscribe verified in isolated SQLite\n')
    engine.dispose()


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'HT-12 check failed ({type(error).__name__}); secret details suppressed', file=sys.stderr)
        sys.exit(1)
