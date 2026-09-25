"""Reviewed destination catalog: dry-run by default, --apply to commit."""

import argparse
import json

from app.db.session import SessionLocal
from app.services.destinations import sync_destinations
from app.services.jobs import PipelineBusy, pipeline_lock


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    with pipeline_lock(SessionLocal) as acquired:
        if not acquired:
            raise PipelineBusy("Stop or wait for the current pipeline before catalog changes")
        with SessionLocal() as db:
            result = sync_destinations(db)
            if args.apply:
                db.commit()
            else:
                db.rollback()
            print(json.dumps({"applied": args.apply, **result}))


if __name__ == "__main__":
    main()
