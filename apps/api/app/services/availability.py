from datetime import UTC, datetime, timedelta

from app.models.deal import Deal
from sqlalchemy import Select, select

DEAL_FRESHNESS = timedelta(hours=48)


def available_deals_query(now: datetime | None = None) -> Select[tuple[Deal]]:
    """Enforce freshness at read time, even when the worker is stopped."""
    checked_at = now or datetime.now(UTC)
    return select(Deal).where(
        Deal.is_visible.is_(True),
        Deal.status == "ACTIVE",
        Deal.last_verified_at >= checked_at - DEAL_FRESHNESS,
        Deal.expires_at.is_(None) | (Deal.expires_at > checked_at),
        (Deal.depart_at > checked_at)
        | (Deal.depart_at.is_(None) & (Deal.trip_start > checked_at.date())),
    )
