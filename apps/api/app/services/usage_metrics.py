"""Read-only product usage aggregates. No raw identifiers leave this service."""

from collections import Counter, defaultdict
from datetime import UTC, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import get_args

from app.models.analytics import AnalyticsEvent
from app.schemas.analytics import EventName
from app.schemas.usage import PageCohort, UsageMetric, UsageReport
from sqlalchemy import select
from sqlalchemy.orm import Session

MAX_USAGE_EVENTS = 20000
PAGE_TYPES = frozenset({
    "home", "catalog", "city_break", "weekend", "origin", "destination", "route",
    "deal", "budget", "saved_trip", "saved", "alerts", "guide",
})
PRODUCT_EVENTS = frozenset(get_args(EventName))


class UsageLimitExceeded(ValueError):
    pass


def usage_window(start: datetime | None, end: datetime | None) -> tuple[datetime, datetime]:
    if any(value is not None and value.tzinfo is None for value in (start, end)):
        raise ValueError("Use timezone-aware period bounds")
    try:
        end = (end or datetime.now(UTC)).astimezone(UTC)
        start = (start or end - timedelta(days=7)).astimezone(UTC)
    except (OverflowError, ValueError):
        raise ValueError("Period bounds must fit the UTC calendar") from None
    if not timedelta(0) < end - start <= timedelta(days=31):
        raise ValueError("Use an increasing period of at most 31 days")
    return start, end


def percent(numerator: int, denominator: int) -> Decimal | None:
    if not denominator:
        return None
    return (Decimal(numerator) * 100 / denominator).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP,
    )


def metric(key: str, numerator: int, denominator: int) -> UsageMetric:
    return UsageMetric(
        key=key, numerator=numerator, denominator=denominator,
        percent=percent(numerator, denominator), status="available" if denominator else "no_data",
    )


def usage_report(db: Session, start: datetime, end: datetime) -> UsageReport:
    """Window is [start,end); stable DB order disambiguates equal timestamps."""
    start, end = usage_window(start, end)
    records = list(db.scalars(select(AnalyticsEvent).where(
        AnalyticsEvent.created_at >= start, AnalyticsEvent.created_at < end,
    ).order_by(AnalyticsEvent.created_at, AnalyticsEvent.id).limit(MAX_USAGE_EVENTS + 1)
        .execution_options(autoflush=False)))
    if len(records) > MAX_USAGE_EVENTS:
        raise UsageLimitExceeded("Too many events; choose a shorter period")
    events = [row for row in records if row.event_name in PRODUCT_EVENTS
              and row.anonymous_session_id not in {"", "anonymous", "not-provided"}]
    sessions = {row.anonymous_session_id for row in events}
    by_name: dict[str, set[str]] = defaultdict(set)
    viewed: set[tuple[str, int]] = set()
    converted: set[tuple[str, int]] = set()
    entry: dict[str, str] = {}
    entry_partners: set[str] = set()
    positive = empty = errors = invalid = unlinked = 0
    for row in events:
        session = row.anonymous_session_id
        by_name[row.event_name].add(session)
        metadata = row.metadata_json if isinstance(row.metadata_json, dict) else {}
        if row.event_name == "PAGE_VIEW" and session not in entry:
            page = metadata.get("page_type")
            entry[session] = page if isinstance(page, str) and page in PAGE_TYPES else "unclassified"
        if row.event_name == "DEAL_VIEW":
            if row.deal_id is None:
                unlinked += 1
            else:
                viewed.add((session, row.deal_id))
        if row.event_name == "PARTNER_CLICK":
            if session in entry:
                entry_partners.add(session)
            if row.deal_id is not None and (session, row.deal_id) in viewed:
                converted.add((session, row.deal_id))
        if row.event_name == "SEARCH_RESULT":
            search = metadata.get("search")
            search = search if isinstance(search, dict) else {}
            count, error = search.get("result_count"), search.get("error")
            if type(count) is int and 0 <= count <= 100 and error is None:
                positive += count > 0
                empty += count == 0
            elif count is None and isinstance(error, str) and error in {"invalid_filters", "unavailable"}:
                errors += 1
            else:
                invalid += 1
    n = len(sessions)
    metrics = [
        metric("search_initiation", len(by_name["SEARCH"]), n),
        metric("search_success", positive, positive + empty + errors),
        metric("empty_results", empty, positive + empty),
        metric("result_errors", errors, positive + empty + errors),
        metric("detail_opening", len(by_name["DEAL_VIEW"]), n),
        metric("affiliate_ctr", len(converted), len(viewed)),
        metric("trip_save", len(by_name["TRIP_SAVE"]), n),
        metric("budget_usage", len(by_name["BUDGET_USE"]), n),
        metric("event_engagement", len(by_name["EVENT_CLICK"] | by_name["ACTIVITY_CLICK"]), n),
        UsageMetric(key="returning_visitors", status="unavailable"),
        UsageMetric(key="device_funnel", status="unavailable"),
    ]
    cohorts = Counter(entry.get(session, "not_observed") for session in sessions)
    cohort_partners = Counter(entry[session] for session in entry_partners)
    pages = [PageCohort(
        page_type=key, sessions=count,
        partner_sessions=cohort_partners[key] if key != "not_observed" else None,
        percent=percent(cohort_partners[key], count) if key != "not_observed" else None,
    ) for key, count in sorted(cohorts.items())]
    return UsageReport(
        start=start, end=end, observed_events=len(events), observed_sessions=n,
        excluded_events=len(records) - len(events), invalid_results=invalid,
        unlinked_detail_views=unlinked, metrics=metrics, page_cohorts=pages,
    )
