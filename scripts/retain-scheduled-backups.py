"""Retain newest copies for 14 dates and 4 ISO weeks, only in scheduled backup dir."""

import re
from datetime import UTC, datetime
from pathlib import Path


def obsolete(directory: Path) -> list[Path]:
    files = []
    for path in directory.iterdir():
        match = re.fullmatch(r"hoptrip-(\d{8}T\d{6}Z)-\d+\.dump", path.name)
        if not match or path.is_symlink() or not path.is_file() or path.stat().st_size == 0:
            continue
        stamp = datetime.strptime(match[1], "%Y%m%dT%H%M%SZ").replace(tzinfo=UTC)
        if stamp > datetime.now(UTC):
            raise ValueError("Future backup timestamp: retention aborted")
        files.append((stamp, path))
    files.sort(reverse=True)
    days: set = set()
    weeks: set = set()
    remove = []
    for stamp, path in files:
        day, week = stamp.date(), stamp.isocalendar()[:2]
        daily = day not in days and len(days) < 14
        weekly = week not in weeks and len(weeks) < 4
        if daily:
            days.add(day)
        if weekly:
            weeks.add(week)
        if not daily and not weekly:
            remove.append(path)
    return remove


if __name__ == "__main__":
    directory = Path("/opt/hoptrip/backups/scheduled")
    if directory.is_symlink() or directory.resolve() != directory:
        raise SystemExit("Refuse unexpected backup path")
    for path in obsolete(directory):
        path.unlink()
        print("Pruned " + path.name)
