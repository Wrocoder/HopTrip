"""Check editorial source links, never affiliate URLs; keep a bounded local report."""

import argparse
import ipaddress
import json
import re
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKING_HOSTS = {"tp.media", "tpx.gr", "emrld.ltd"}


def safe_url(url):
    parsed = urllib.parse.urlsplit(url)
    host = parsed.hostname or ""
    if (parsed.scheme != "https" or not host or parsed.username or parsed.password
            or parsed.port not in (None, 443)
            or any(host == h or host.endswith("." + h) for h in TRACKING_HOSTS)):
        raise ValueError("Unsafe or tracking URL")
    query = dict(urllib.parse.parse_qsl(parsed.query))
    if {"marker", "trs", "tq_click_id", "partner"} & query.keys():
        raise ValueError("Tracking parameters")
    return host


def public_address(url):
    host = safe_url(url)
    addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(row[4][0]).is_global for row in addresses):
        raise ValueError("Non-public destination")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(url):
    public_address(url)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    request = urllib.request.Request(url, headers={
        "User-Agent": "HopTrip-LinkCheck/1.0 (+https://hoptrip.pl/info/contact)",
        "Accept": "text/html,application/xhtml+xml",
    })
    try:
        response = opener.open(request, timeout=12)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        # No body is downloaded or retained; this is an HTTP check, not inventory validation.
        return response.code, response.headers.get("Location")


def classify(code):
    if 200 <= code < 300:
        return "OK"
    if code in (404, 410):
        return "BROKEN"
    if code in (401, 403, 429):
        return "BLOCKED"
    return "TEMPORARY"


def normalized(url):
    parsed = urllib.parse.urlsplit(url)
    return parsed.netloc.removeprefix("www."), parsed.path.rstrip("/"), parsed.query


def check_link(item, request=fetch):
    result = {**item, "status": "TEMPORARY", "http_status": None}
    current = item["url"]
    seen = set()
    try:
        for _ in range(5):
            safe_url(current)
            if current in seen:
                return {**result, "status": "REVIEW", "reason": "REDIRECT_LOOP"}
            seen.add(current)
            code, location = request(current)
            result["http_status"] = code
            if code in (301, 302, 303, 307, 308) and location:
                current = urllib.parse.urljoin(current, location)
                continue
            status = classify(code)
            if status == "OK" and normalized(current) != normalized(item["url"]):
                status = "REVIEW"
                # A Tiqets canonical slug change is fine only for the same product ID.
                old = re.search(r"-p(\d+)/?$", urllib.parse.urlsplit(item["url"]).path)
                new = re.search(r"-p(\d+)/?$", urllib.parse.urlsplit(current).path)
                if (old and new and old[1] == new[1]
                        and safe_url(current) in {"www.tiqets.com", "tiqets.com"}):
                    status = "OK"
            return {**result, "status": status, "final_url": current}
        return {**result, "status": "REVIEW", "reason": "TOO_MANY_REDIRECTS"}
    except ValueError:
        return {**result, "status": "REVIEW", "reason": "UNSAFE_REDIRECT"}
    except (OSError, urllib.error.URLError):
        return {**result, "reason": "NETWORK_OR_TLS"}


def load_catalog(path):
    catalog = json.loads(path.read_text(encoding="utf-8"))
    items = []
    for city, selection in catalog.items():
        for item in selection["items"]:
            safe_url(item["href"])
            items.append({"city": city, "id": item["id"], "url": item["href"]})
    keys = {(i["city"], i["id"]) for i in items}
    if not items or len(keys) != len(items):
        raise ValueError("Empty catalog or duplicate IDs")
    return items


def summarize(rows, previous, now):
    state = {}
    for row in rows:
        key = row["city"] + ":" + row["id"]
        old = previous.get(key, {})
        same = old.get("url") == row["url"] and old.get("status") == row["status"]
        count = old.get("consecutive", 0) if same else 0
        counted = old.get("counted_at", 0) if same else 0
        if row["status"] == "OK":
            count = 0
        elif not same or now - counted >= 20 * 3600:
            count += 1
            counted = now
        threshold = 2 if row["status"] == "BROKEN" else 3
        row.update(consecutive=count, confirmed=count >= threshold)
        state[key] = {"url": row["url"], "status": row["status"],
                      "consecutive": count, "counted_at": counted}
    return state


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.chmod(0o600)
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path,
                        default=ROOT / "apps/web/src/lib/activity-expansion.json")
    parser.add_argument("--output", type=Path, default=Path("/var/lib/hoptrip/link-check"))
    args = parser.parse_args()
    try:
        items = load_catalog(args.catalog)
        state_path = args.output / "state.json"
        previous = json.loads(state_path.read_text()) if state_path.exists() else {}
        if not isinstance(previous, dict):
            raise ValueError("Invalid state")
        started = time.time()
        with ThreadPoolExecutor(max_workers=2) as pool:
            rows = list(pool.map(check_link, items))
        now = time.time()
        state = summarize(rows, previous, now)
        counts = dict(Counter(row["status"] for row in rows))
        report = {"checked_at": now, "duration_seconds": round(now-started, 1),
                  "total": len(rows), "counts": counts,
                  "confirmed": sum(row["confirmed"] for row in rows), "links": rows}
        save(args.output / "latest.json", report)
        save(state_path, state)
        print(json.dumps({k: v for k, v in report.items() if k != "links"}))
        # Individual provider errors are report data, not a failed execution of the checker.
        return 0
    except (OSError, ValueError, KeyError, TypeError):
        print('{"link_check":"FAILED","reason":"CATALOG_STATE_OR_REPORT_ERROR"}')
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
