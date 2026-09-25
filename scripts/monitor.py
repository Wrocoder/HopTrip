"""Host-side monitoring: survives an API container failure; emits no secrets."""

import json
import os
import re
import shutil
import smtplib
import ssl
import subprocess
import time
import urllib.request
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(os.environ.get("HOPTRIP_ROOT", "/opt/hoptrip"))
STATE = Path(os.environ.get("HOPTRIP_MONITOR_STATE", "/var/lib/hoptrip/monitor.json"))
COMPOSE = [
    "docker",
    "compose",
    "--env-file",
    ".env.production",
    "-f",
    "docker-compose.yml",
    "-f",
    "docker-compose.production.yml",
    "-f",
    "docker-compose.domain.yml",
]


def http_check(url: str, readiness: bool = False) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=15) as response:
            if response.status != 200 or response.url != url:
                return False
            if readiness:
                return json.loads(response.read(4097)) == {"status": "ready"}
            return response.headers.get_content_type() == "text/html"
    except Exception:
        return False


def newest_backup_ok(directory: Path, now: float) -> bool:
    try:
        times = [
            p.stat().st_mtime
            for p in directory.iterdir()
            if re.fullmatch(r"hoptrip-\d{8}T\d{6}Z-\d+\.dump", p.name)
            and not p.is_symlink()
            and p.is_file()
            and p.stat().st_size > 0
        ]
        return bool(times) and 0 <= now - max(times) <= 30 * 3600
    except OSError:
        return False


def pipeline_ok() -> bool:
    # Only statuses and age, never database credentials or provider payloads.
    sql = """SELECT CASE WHEN
      (SELECT max(finished_at) FROM job_runs WHERE job_type='TRAVELPAYOUTS_PIPELINE'
        AND status='SUCCEEDED') > now() - interval '2 hours 15 minutes'
      AND (SELECT status FROM job_runs WHERE job_type='TRAVELPAYOUTS_PIPELINE'
        AND status <> 'SKIPPED' ORDER BY id DESC LIMIT 1)
        IN ('SUCCEEDED','RUNNING','RETRYING') THEN 'OK' ELSE 'FAILED' END;"""
    try:
        result = subprocess.run(
            COMPOSE
            + [
                "exec",
                "-T",
                "db",
                "sh",
                "-c",
                'exec psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -v ON_ERROR_STOP=1',
            ],
            input=sql,
            text=True,
            capture_output=True,
            timeout=25,
            cwd=ROOT,
        )
        return result.returncode == 0 and result.stdout.strip() == "OK"
    except (OSError, subprocess.TimeoutExpired):
        return False


def command_equals(command: list[str], expected: str) -> bool:
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=15)
        return result.returncode == 0 and result.stdout.strip() == expected
    except (OSError, subprocess.TimeoutExpired):
        return False


def deliver(message: str) -> bool:
    try:
        if os.environ.get("TELEGRAM_BOT_TOKEN") and os.environ.get("TELEGRAM_CHAT_ID"):
            request = urllib.request.Request(
                "https://api.telegram.org/bot" + os.environ["TELEGRAM_BOT_TOKEN"] + "/sendMessage",
                data=json.dumps(
                    {"chat_id": os.environ["TELEGRAM_CHAT_ID"], "text": message}
                ).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=15) as response:
                return json.loads(response.read(65536)).get("ok") is True
        if all(os.environ.get(k) for k in ("SMTP_HOST", "SMTP_FROM", "ALERT_TO")):
            email = EmailMessage()
            email["From"], email["To"] = os.environ["SMTP_FROM"], os.environ["ALERT_TO"]
            email["Subject"] = "HopTrip monitoring"
            email.set_content(message)
            port = int(os.environ.get("SMTP_PORT", "587"))
            context = ssl.create_default_context()
            if port == 465:
                smtp = smtplib.SMTP_SSL(os.environ["SMTP_HOST"], port, timeout=15, context=context)
            else:
                smtp = smtplib.SMTP(os.environ["SMTP_HOST"], port, timeout=15)
            with smtp:
                if port != 465:
                    smtp.starttls(context=context)
                if os.environ.get("SMTP_USER"):
                    smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
                return not smtp.send_message(email)
    except Exception:
        # Exception strings can contain secret URLs or server messages.
        return False
    return False


def notification_due(state: dict, incident: str, now: float) -> bool:
    if incident:
        return (
            state.get("delivered_incident") != incident
            or now - state.get("delivered_at", 0) >= 21600
        )
    return bool(state.get("delivered_incident"))


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--test-alert", action="store_true")
    args = parser.parse_args()
    if args.test_alert:
        success = deliver("HopTrip: test notification. No outage has been simulated.")
        print(json.dumps({"test_notification_delivered": success}))
        return 0 if success else 1
    now = time.time()
    site = os.environ.get("HOPTRIP_SITE_URL", "https://hoptrip.pl").rstrip("/")
    checks = {
        "website": http_check(site + "/"),
        "api": http_check(site + "/health/ready", True),
        "scheduled_backup": newest_backup_ok(ROOT / "backups" / "scheduled", now),
        "pipeline": pipeline_ok(),
        "backup_service": command_equals(
            ["systemctl", "show", "hoptrip-backup.service", "-p", "Result", "--value"], "success"
        ),
        "worker": command_equals(
            ["docker", "inspect", "--format", "{{.State.Running}}", "hoptrip-worker-1"], "true"
        ),
    }
    try:
        disk = shutil.disk_usage(ROOT)
        checks["disk_space"] = disk.free >= max(1024**3, disk.total * 0.1)
    except OSError:
        checks["disk_space"] = False
    try:
        state = json.loads(STATE.read_text())
        if not isinstance(state, dict):
            state = {}
    except (OSError, ValueError):
        state = {}
    incident = ",".join(sorted(k for k, ok in checks.items() if not ok))
    delivered = None
    if notification_due(state, incident, now):
        delivered = deliver(
            "HopTrip: " + ("FAILED: " + incident if incident else "RECOVERED: all checks OK")
        )
        if delivered:
            state.update(delivered_incident=incident, delivered_at=now)
    state.update(checked_at=now, checks=checks)
    STATE.parent.mkdir(parents=True, exist_ok=True)
    temporary = STATE.with_suffix(".tmp")
    temporary.write_text(json.dumps(state))
    temporary.chmod(0o600)
    temporary.replace(STATE)
    print(json.dumps({"checks": checks, "notification_delivered": delivered}))
    return 1 if incident or delivered is False else 0


if __name__ == "__main__":
    raise SystemExit(main())
