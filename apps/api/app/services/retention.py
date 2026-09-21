"""Expire raw behavioural events; preserve financial records and click foreign keys."""

from datetime import UTC, datetime, timedelta

from app.config import get_settings
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from sqlalchemy import delete, update
from sqlalchemy.orm import Session


def apply_retention(db: Session, now: datetime | None = None) -> None:
    cutoff = (now or datetime.now(UTC)) - timedelta(days=get_settings().analytics_retention_days)
    db.execute(
        delete(AnalyticsEvent)
        .where(AnalyticsEvent.created_at < cutoff)
        .execution_options(synchronize_session=False)
    )
    # Remove session/source context from old clicks without breaking conversion attribution.
    db.execute(
        update(AffiliateClick)
        .where(AffiliateClick.created_at < cutoff)
        .values(anonymous_session_id="retention-expired", source=None, campaign=None)
        .execution_options(synchronize_session=False)
    )
    db.commit()
