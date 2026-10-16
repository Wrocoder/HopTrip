"""Daily host storage report using the existing Telegram destination."""

import argparse
import json
import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from monitor import ROOT, deliver

STATE = Path("/var/lib/hoptrip/storage-report-date")


def command(args):
    return subprocess.run(
        args, check=True, capture_output=True, text=True, timeout=90,
    ).stdout.strip()


def allocated(paths):
    if not paths:
        return 0
    output = command(["du", "-x", "-s", "-B1", "--", *map(str, paths)])
    return sum(int(line.split()[0]) for line in output.splitlines())


def size(value):
    return f"{value / 1024**3:.2f} GiB"


def report(now):
    disk = shutil.disk_usage(ROOT)
    files = allocated([ROOT])
    names = command([
        "docker", "volume", "ls", "--filter", "label=com.docker.compose.project=hoptrip",
        "--format", "{{.Name}}",
    ]).splitlines()
    volumes = json.loads(command(["docker", "volume", "inspect", *names])) if names else []
    volume_bytes = allocated(list({v["Mountpoint"] for v in volumes}))
    docker = command(["docker", "system", "df", "--format", "{{.Type}}: {{.Size}}"])
    return (
        f"HopTrip — место на сервере\n{now:%d.%m.%Y %H:%M} Europe/Warsaw\n\n"
        f"Файлы HopTrip (код, выпуски, бэкапы): {size(files)}\n"
        f"Тома HopTrip (включая БД): {size(volume_bytes)}\n\n"
        f"Docker на всём сервере:\n{docker}\n"
        "Тома выше уже входят в Docker. Образы и кэш могут иметь общие слои; "
        "эти строки не суммируются.\n\n"
        f"Диск с HopTrip: {size(disk.total)} всего\n"
        f"Занято: {size(disk.used)}\n"
        f"Свободно для записи: {size(disk.free)} ({disk.free / disk.total:.1%})\n"
        "1 GiB = 1024³ байт. Замер без остановки приложения."
    )


def main(dry_run=False):
    now = datetime.now(ZoneInfo("Europe/Warsaw"))
    today = now.date().isoformat()
    if not dry_run and STATE.exists() and STATE.read_text().strip() == today:
        print("Storage report already delivered today")
        return 0
    try:
        message = report(now)
        if dry_run:
            print(message)
            return 0
        # Never silently fall back to email for this Telegram-only report.
        if not os.environ.get("TELEGRAM_BOT_TOKEN") or not os.environ.get("TELEGRAM_CHAT_ID"):
            print("Telegram destination is not configured")
            return 1
        if not deliver(message):
            print("Storage report delivery not confirmed; no automatic retry")
            return 1
        STATE.parent.mkdir(parents=True, exist_ok=True)
        temporary = STATE.with_suffix(".tmp")
        temporary.write_text(today + "\n")
        temporary.chmod(0o600)
        temporary.replace(STATE)
        print("Storage report delivered")
        return 0
    except (OSError, ValueError, KeyError, subprocess.SubprocessError):
        # Do not leak command output, paths from credentials, or Telegram URLs.
        print("Storage report failed; no message or successful state recorded")
        return 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    raise SystemExit(main(parser.parse_args().dry_run))
