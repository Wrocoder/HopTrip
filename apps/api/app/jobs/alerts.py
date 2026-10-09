import logging

from app.config import get_settings
from app.db.session import SessionLocal
from app.services.alerts import deliver_digests


def run_alerts_once() -> dict:
    with SessionLocal() as db:
        return deliver_digests(db, get_settings())


if __name__ == "__main__":
    logging.basicConfig(level=get_settings().log_level)
    logging.getLogger(__name__).info("Alert batch: %s", run_alerts_once())
