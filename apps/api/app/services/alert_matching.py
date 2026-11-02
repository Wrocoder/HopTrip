"""Shared recommendation rules for opt-in notification channels."""

from datetime import datetime

from app.models.deal import Deal
from app.models.location import Destination
from app.schemas.alert import AlertFilters
from app.services.airports import matching_airports
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from sqlalchemy.orm import Session


def candidate_deals(
    db: Session, filters: AlertFilters, now: datetime, *, excluded: set[int],
    included: list[int] | None = None, max_connections: int | None = None,
) -> list[Deal]:
    airports = matching_airports(db, filters.origin)
    if len(airports) != 1:
        return []
    query = available_deals_query(now).join(Destination).where(
        Destination.is_active.is_(True), Deal.origin_airport_id == airports[0].id,
        Deal.price_per_person_pln <= filters.budget,
        Deal.nights >= filters.duration_min, Deal.nights <= filters.duration_max,
    )
    if filters.destination:
        query = query.where(Destination.slug == filters.destination)
    if filters.departure_from:
        query = query.where(Deal.trip_start >= filters.departure_from)
    if filters.departure_to:
        query = query.where(Deal.trip_start <= filters.departure_to)
    if excluded:
        query = query.where(Deal.id.not_in(excluded))
    if included is not None:
        query = query.where(Deal.id.in_(included))
    selected = []
    for deal in db.scalars(query.order_by(Deal.price_per_person_pln, Deal.id)):
        view = serialize_deal(db, deal)
        if view.trip_type != 'ROUND_TRIP' or not view.flight_quality.recommendation_eligible:
            continue
        if filters.weekend and not (
            deal.trip_start.weekday() in (4, 5) and deal.trip_end.weekday() == 6
            and (deal.trip_end - deal.trip_start).days in (1, 2)
        ):
            continue
        if max_connections is not None and any(
            stops is None or stops > max_connections
            for stops in (view.flight_facts.outbound_stops, view.flight_facts.return_stops)
        ):
            continue
        selected.append(deal)
        if len(selected) == 5:
            break
    return selected
