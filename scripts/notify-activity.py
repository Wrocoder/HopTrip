"""Send completed ingestion summaries and inbox counts, never email contents."""

import imaplib
import json
import os
import ssl
import subprocess
from pathlib import Path

from monitor import COMPOSE, ROOT, deliver

STATE = Path("/var/lib/hoptrip/activity.json")


def save(state):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    temporary = STATE.with_suffix(".tmp")
    temporary.write_text(json.dumps(state))
    temporary.chmod(0o600)
    temporary.replace(STATE)


def completed_jobs(cursor):
    # Initial connection sends only the latest completed run, not the entire history.
    where = "" if cursor is None else f"AND id > {int(cursor)}"
    order = "DESC LIMIT 1" if cursor is None else "ASC LIMIT 5"
    sql = """SELECT json_build_object('id', id, 'finished', finished_at,
      'added', result_json->'ingestion'->'saved_offers',
      'updated', result_json->'ingestion'->'updated_offers',
      'observations', result_json->'ingestion'->'saved_observations',
      'skipped', result_json->'ingestion'->'skipped_unresolved_routes')
      FROM job_runs WHERE job_type='TRAVELPAYOUTS_PIPELINE' AND status='SUCCEEDED' """
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
        input=sql + where + " ORDER BY id " + order + ";",
        text=True,
        capture_output=True,
        timeout=25,
        cwd=ROOT,
    )
    if result.returncode:
        raise RuntimeError("Job query failed")
    return [json.loads(line) for line in result.stdout.splitlines() if line.strip()]


def notify_jobs(state):
    for job in completed_jobs(state.get("job_id")):
        text = (
            f"HopTrip: обновление предложений завершено (#{int(job['id'])}).\n"
            f"Добавлено: {int(job.get('added') or 0)}\n"
            f"Обновлено записей: {int(job.get('updated') or 0)}\n"
            f"Новых наблюдений цены: {int(job.get('observations') or 0)}\n"
            f"Неизвестных маршрутов пропущено: {int(job.get('skipped') or 0)}\n"
            f"Время UTC: {job['finished']}"
        )
        if not deliver(text):
            raise RuntimeError("Summary delivery failed")
        state["job_id"] = int(job["id"])
        save(state)


def inbox_snapshot(cursor, *, factory=imaplib.IMAP4_SSL):
    with factory(
        os.environ.get("IMAP_HOST", "imap.mail.ovh.net"),
        port=993,
        ssl_context=ssl.create_default_context(),
        timeout=20,
    ) as client:
        client.login(os.environ["IMAP_USER"], os.environ["IMAP_PASSWORD"])
        status, _ = client.select("INBOX", readonly=True)
        if status != "OK":
            raise RuntimeError("Inbox selection failed")
        validity = int(client.response("UIDVALIDITY")[1][0])
        next_uid = int(client.response("UIDNEXT")[1][0])
        if not cursor or cursor.get("validity") != validity:
            return {"validity": validity, "uid": next_uid - 1}, 0, True
        minimum = int(cursor["uid"]) + 1
        if minimum >= next_uid:
            return cursor, 0, False
        status, values = client.uid("search", None, "UID", f"{minimum}:{next_uid - 1}")
        if status != "OK":
            raise RuntimeError("Inbox search failed")
        ids = {int(v) for v in values[0].split() if minimum <= int(v) < next_uid}
        return {"validity": validity, "uid": next_uid - 1}, len(ids), False


def notify_mail(state):
    if not all(os.environ.get(k) for k in ("IMAP_USER", "IMAP_PASSWORD")):
        return "NOT_CONFIGURED"
    mailbox = os.environ["IMAP_USER"]
    previous = state.get("mail") if state.get("mailbox") == mailbox else None
    cursor, count, baseline = inbox_snapshot(previous)
    if count and not deliver(
        f"HopTrip: поступило новое обращение на {mailbox}.\nНовых писем: {count}. "
        "Откройте Zimbra Webmail, чтобы прочитать и ответить."
    ):
        raise RuntimeError("Mail notification delivery failed")
    if (
        baseline
        and previous
        and not deliver(
            "HopTrip: идентификаторы почтового ящика изменились. Мониторинг возобновлён; "
            "проверьте входящие вручную за время перерыва."
        )
    ):
        raise RuntimeError("Mailbox reset notification failed")
    state.update(mail=cursor, mailbox=mailbox)
    save(state)
    return "INITIALIZED" if baseline else "OK"


def main():
    if not all(os.environ.get(k) for k in ("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID")):
        print('{"activity": "TELEGRAM_NOT_CONFIGURED"}')
        return 0
    try:
        state = json.loads(STATE.read_text())
        if not isinstance(state, dict):
            raise ValueError
    except FileNotFoundError:
        state = {}
    except (ValueError, OSError):
        print('{"activity": "STATE_ERROR"}')
        return 1
    checks = {}
    for name, function in (("pipeline_summaries", notify_jobs), ("inbox", notify_mail)):
        try:
            checks[name] = function(state) or "OK"
        except Exception:
            checks[name] = "FAILED"  # Never log credentials, headers or email bodies.
    print(json.dumps(checks))
    return int("FAILED" in checks.values())


if __name__ == "__main__":
    raise SystemExit(main())
