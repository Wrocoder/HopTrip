"""Read-only diagnostic before migration 0013; no destructive automatic deduplication."""

import json

from sqlalchemy import text

from app.db.session import SessionLocal

QUERIES = {
    "duplicate_offers": "SELECT data_provider_id, external_id, count(*) AS records FROM travel_offers GROUP BY data_provider_id, external_id HAVING count(*) > 1",
    "duplicate_statistics": "SELECT data_provider_id, origin_airport_id, destination_id, product_type, departure_month, trip_duration_days, count(*) AS records FROM route_statistics GROUP BY data_provider_id, origin_airport_id, destination_id, product_type, departure_month, trip_duration_days HAVING count(*) > 1",
}


def main():
    with SessionLocal() as db:
        report = {
            name: [dict(row) for row in db.execute(text(query)).mappings()]
            for name, query in QUERIES.items()
        }
    print(json.dumps(report, default=str))
    return 2 if any(report.values()) else 0


if __name__ == "__main__":
    raise SystemExit(main())
