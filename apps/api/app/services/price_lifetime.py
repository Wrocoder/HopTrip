"""Display lifetime of a cached price; this does not verify live inventory."""
from datetime import date, datetime, timedelta

from app.services.time import utc
from sqlalchemy import SQLColumnExpression, and_, or_
from sqlalchemy.sql.elements import ColumnElement

MAX_PRICE_AGE = timedelta(hours=48)


def max_price_age_hours(departure: datetime, now: datetime) -> int:
    remaining = utc(departure) - utc(now)
    return 6 if remaining <= timedelta(days=7) else 24 if remaining <= timedelta(days=30) else 48


def price_deadline(observed: datetime, departure: datetime) -> datetime:
    observed, departure = utc(observed), utc(departure)
    # A still-open page must expire at a policy boundary too, even with no worker.
    return min(observed + MAX_PRICE_AGE,
               max(observed + timedelta(hours=24), departure - timedelta(days=30)),
               max(observed + timedelta(hours=6), departure - timedelta(days=7)), departure)


def fresh_price_clause(
    observed: SQLColumnExpression[datetime],
    departure: SQLColumnExpression[datetime | None],
    now: datetime,
    departure_date: SQLColumnExpression[date] | None = None,
) -> ColumnElement[bool]:
    def within(days: int) -> ColumnElement[bool]:
        edge = now + timedelta(days=days)
        timed = and_(departure.is_not(None), departure <= edge)
        return timed if departure_date is None else or_(
            timed, and_(departure.is_(None), departure_date <= edge.date()))

    return and_(observed <= now, observed > now - MAX_PRICE_AGE,
                or_(~within(30), observed > now - timedelta(hours=24)),
                or_(~within(7), observed > now - timedelta(hours=6)))
