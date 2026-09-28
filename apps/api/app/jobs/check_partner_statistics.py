"""Read-only Aviasales account totals; never claim click-level attribution."""

import argparse
import json
import os
from datetime import UTC, date, datetime

import httpx

ENDPOINT = "https://api.travelpayouts.com/statistics/v1/execute_query"
FIELDS = (
    "clicks_count", "redirects_count", "searches_count", "actions_count",
    "paid_actions_count", "processing_actions_count", "cancelled_actions_count",
)


def check_statistics(
    token: str, start: date, end: date, *, transport: httpx.BaseTransport | None = None,
) -> dict:
    result = {
        "scope": "AVIASALES_ACCOUNT", "campaign_id": 100,
        "date_from": start.isoformat(), "date_to": end.isoformat(),
        "click_attribution_verified": False, "conversion_attribution_verified": False,
    }
    if not token.strip():
        return {**result, "status": "NOT_CONFIGURED"}
    if end < start or (end - start).days >= 31 or end > datetime.now(UTC).date():
        return {**result, "status": "INVALID_PERIOD"}
    payload = {
        "fields": list(FIELDS),
        "filters": [
            {"field": "campaign_id", "op": "eq", "value": 100},
            {"field": "date", "op": "ge", "value": start.isoformat()},
            {"field": "date", "op": "le", "value": end.isoformat()},
        ],
        "limit": 1, "offset": 0,
    }
    try:
        # Fixed host, no redirects/proxy env; credentials cannot follow a redirect.
        with httpx.Client(
            transport=transport, timeout=20, follow_redirects=False, trust_env=False,
        ) as client:
            with client.stream(
                "POST", ENDPOINT, json=payload, headers={"X-Access-Token": token},
            ) as response:
                if response.status_code != 200:
                    status = (
                        "ACCESS_DENIED" if response.status_code in {401, 403}
                        else "RATE_LIMITED" if response.status_code == 429 else "HTTP_ERROR"
                    )
                    return {**result, "status": status, "http_status": response.status_code}
                body = bytearray()
                for chunk in response.iter_bytes(chunk_size=4096):
                    body.extend(chunk)
                    if len(body) > 65536:
                        return {**result, "status": "INVALID_RESPONSE"}
        data = json.loads(body)
        if not isinstance(data, dict):
            raise ValueError
        rows, total = data.get("results"), data.get("total_rows")
        if type(total) is not int or total not in {0, 1} or not isinstance(rows, list):
            raise ValueError
        if len(rows) != total:
            raise ValueError
        if not rows:
            return {**result, "status": "NO_DATA", "counts": None}
        row = rows[0]
        if not isinstance(row, dict):
            raise ValueError
        counts = {}
        for field in FIELDS:
            value = row.get(field)
            # Accept decimal integer strings, but not bool/float/null or negative counts.
            if isinstance(value, str) and value.isascii() and value.isdecimal():
                value = int(value)
            if type(value) is not int or value < 0:
                raise ValueError
            counts[field] = value
        return {**result, "status": "OK", "counts": counts}
    except httpx.HTTPError:
        return {**result, "status": "UNREACHABLE"}
    except (ValueError, UnicodeError):
        return {**result, "status": "INVALID_RESPONSE"}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date-from", required=True, type=date.fromisoformat)
    parser.add_argument("--date-to", required=True, type=date.fromisoformat)
    args = parser.parse_args(argv)
    result = check_statistics(
        os.environ.get("TRAVELPAYOUTS_API_TOKEN", ""), args.date_from, args.date_to,
    )
    print(json.dumps(result))
    return 0 if result["status"] in {"OK", "NO_DATA"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
