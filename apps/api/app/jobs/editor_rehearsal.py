"""Manually process due rehearsals. There is no publish flag or external sender."""
import argparse
import json

from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import engine
from app.services.editor_rehearsal import process_due


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=50, choices=range(1, 101), metavar="1..100")
    args = parser.parse_args()
    if not get_settings().editor_enabled:
        raise SystemExit("Editor is disabled")
    with Session(engine) as db:
        rows = process_due(db, limit=args.limit)
    print(json.dumps({"mode": "dry-run", "publishable": False, "processed": len(rows), "jobs": rows}))


if __name__ == "__main__":
    main()
