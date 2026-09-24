"""Read-only probes for cron/monitoring; no provider token or database writes."""

import argparse
import json
import math
import re
import time
from pathlib import Path

import httpx


def origin(value: str) -> str:
    try:
        url = httpx.URL(value)
        valid = (
            url.scheme in {"http", "https"}
            and bool(url.host)
            and not url.userinfo
            and not url.query
            and not url.fragment
            and url.path == "/"
        )
    except (httpx.InvalidURL, ValueError):
        valid = False
    if not valid:
        raise argparse.ArgumentTypeError("expected HTTP(S) origin without credentials or query")
    return value.rstrip("/")


def positive_number(value: str) -> float:
    try:
        result = float(value)
    except ValueError:
        raise argparse.ArgumentTypeError("expected a positive finite number") from None
    if not math.isfinite(result) or result <= 0:
        raise argparse.ArgumentTypeError("expected a positive finite number")
    return result


def check_http(client: httpx.Client, url: str, *, readiness: bool = False) -> str:
    try:
        # Never follow a redirect to a login page or another host and call that healthy.
        with client.stream("GET", url, follow_redirects=False) as response:
            if response.status_code != 200:
                return "HTTP_ERROR"
            if not readiness:
                media_type = response.headers.get("content-type", "").split(";")[0].strip()
                return "OK" if media_type == "text/html" else "INVALID_RESPONSE"
            body = bytearray()
            for chunk in response.iter_bytes():
                body.extend(chunk)
                if len(body) > 4096:
                    return "INVALID_RESPONSE"
            return "OK" if json.loads(body) == {"status": "ready"} else "INVALID_RESPONSE"
    except (ValueError, UnicodeError):
        return "INVALID_RESPONSE"
    except httpx.HTTPError:
        # Exception strings may contain URLs. Emit only a fixed, non-secret reason.
        return "UNREACHABLE"


def check_backup(directory: Path, max_age_hours: float, *, now: float | None = None) -> str:
    now = time.time() if now is None else now
    try:
        if not directory.is_dir():
            return "MISSING"
        timestamps = []
        for path in directory.iterdir():
            if not re.fullmatch(r"hoptrip-\d{8}T\d{6}Z-\d+\.dump", path.name):
                continue
            if path.is_symlink() or not path.is_file():
                continue
            stat = path.stat()
            if stat.st_size > 0:
                timestamps.append(stat.st_mtime)
        if not timestamps:
            return "MISSING"
        newest = max(timestamps)
        if newest > now:
            return "FUTURE_TIMESTAMP"
        return "OK" if now - newest <= max_age_hours * 3600 else "STALE"
    except OSError:
        return "UNREADABLE"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-url", required=True, type=origin)
    parser.add_argument("--api-url", required=True, type=origin)
    parser.add_argument("--backup-dir", type=Path)
    parser.add_argument("--max-backup-age-hours", type=positive_number, default=30.0)
    parser.add_argument("--timeout-seconds", type=positive_number, default=10.0)
    args = parser.parse_args(argv)
    with httpx.Client(timeout=args.timeout_seconds, trust_env=False) as client:
        checks = {
            "website": check_http(client, args.site_url + "/"),
            "api_readiness": check_http(client, args.api_url + "/health/ready", readiness=True),
            "backup_freshness": (
                check_backup(args.backup_dir, args.max_backup_age_hours)
                if args.backup_dir is not None else "SKIPPED"
            ),
        }
    ok = all(status in {"OK", "SKIPPED"} for status in checks.values())
    print(json.dumps({"ok": ok, "checks": checks}, sort_keys=True))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
