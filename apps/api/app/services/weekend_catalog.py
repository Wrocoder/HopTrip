"""Exact itinerary filtering/ranking with one bounded metadata snapshot."""
from dataclasses import dataclass, field

from app.config import get_settings
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination, DestinationAlias
from app.models.offer import TravelOffer
from app.schemas.deal import FlightFacts
from app.schemas.destination_time import DestinationTime
from app.schemas.trip_quality import TripQualityAssessment
from app.schemas.weekend import WeekendAssessment, WeekendMode, WorkHours
from app.services.airport_context import airport_context
from app.services.connections import assess_connections
from app.services.destination_time import destination_time
from app.services.flight_facts import flight_facts
from app.services.flight_quality import classify_flight_quality
from app.services.trip_quality import trip_quality
from app.services.weekend import assess_weekend
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, aliased

# Exact totals must never silently become totals of a truncated candidate scan.
MAX_WEEKEND_CANDIDATES = 500


class WeekendQueryTooBroad(Exception):
    pass


@dataclass
class Context:
    deal: Deal
    origin: Airport | None
    destination: Destination | None
    components: dict[int, DealComponent] = field(default_factory=dict)
    offers: dict[int, TravelOffer] = field(default_factory=dict)
    aliases: set[tuple[str, str]] = field(default_factory=set)


def weekend_matches(db: Session, query: Select[tuple[Deal]], mode: WeekendMode,
                    hours: WorkHours) -> list[tuple[Deal, WeekendAssessment]]:
    return [(deal, assessment) for deal, assessment, _ in itinerary_matches(db, query, mode, hours)]


def itinerary_matches(db: Session, query: Select[tuple[Deal]], mode: WeekendMode | None,
                      hours: WorkHours) -> list[tuple[Deal, WeekendAssessment, DestinationTime]]:
    return [(deal, assessment, interval) for deal, assessment, interval, _ in
            ranked_itinerary_matches(db, query, mode, hours)]


def ranked_itinerary_matches(db: Session, query: Select[tuple[Deal]], mode: WeekendMode | None,
                            hours: WorkHours) -> list[tuple[Deal, WeekendAssessment, DestinationTime, TripQualityAssessment]]:
    # The caller supplies deterministic ordering. LIMIT applies to deals, not to
    # the component/alias join, so fan-out cannot truncate an itinerary.
    candidates = aliased(Deal, query.limit(MAX_WEEKEND_CANDIDATES + 1).cte("weekend_candidates"))
    rows = db.execute(select(candidates, DealComponent, TravelOffer, Airport, Destination, DestinationAlias)
        .select_from(candidates)
        .outerjoin(DealComponent, DealComponent.deal_id == candidates.id)
        .outerjoin(TravelOffer, TravelOffer.id == DealComponent.travel_offer_id)
        .outerjoin(Airport, Airport.id == candidates.origin_airport_id)
        .outerjoin(Destination, Destination.id == candidates.destination_id)
        .outerjoin(DestinationAlias, DestinationAlias.destination_id == candidates.destination_id)
        .order_by(candidates.id, DealComponent.id))
    contexts: dict[int, Context] = {}
    for deal, component, offer, origin, destination, alias in rows:
        context = contexts.setdefault(deal.id, Context(deal, origin, destination))
        if len(contexts) > MAX_WEEKEND_CANDIDATES:
            raise WeekendQueryTooBroad
        if component is not None:
            context.components[component.id] = component
        if offer is not None:
            context.offers[offer.id] = offer
        if alias is not None:
            context.aliases.add((alias.provider_code, alias.code))
    matches = []
    key = {"calendar-v1": "calendar", "flexible-v1": "flexible", "no-leave-v1": "no_leave"}.get(mode or "")
    for context in contexts.values():
        flights = [c for c in context.components.values() if c.component_type == "FLIGHT"]
        # Multiple flight components are a conflicting context, just as in the
        # public serializer. Never choose the most convenient of several offers.
        offer = next((context.offers[c.travel_offer_id] for c in reversed(flights)
                      if c.travel_offer_id in context.offers), None)
        facts = flight_facts(offer) if offer else FlightFacts()
        codes = {code for provider, code in context.aliases
                 if provider in (offer.source if offer else "", "*")}
        if context.destination and context.destination.iata_code:
            codes.add(context.destination.iata_code)
        conflicting = len(flights) > 1 or bool(offer and (
            offer.origin_airport_id is not None and offer.origin_airport_id != context.deal.origin_airport_id
            or offer.destination_id is not None and offer.destination_id != context.deal.destination_id))
        quality = classify_flight_quality(offer, facts,
            origin_code=context.origin.iata_code if context.origin else None,
            destination_codes=codes,
            conflicting_context=conflicting)
        assessment = assess_weekend(facts, work_hours=hours,
            itinerary_eligible=quality.recommendation_eligible,
            stay_policy=get_settings().weekend_stay_policy)
        if key is None or getattr(assessment, key) == "ELIGIBLE":
            interval = destination_time(facts, itinerary_eligible=quality.recommendation_eligible)
            settings = get_settings()
            connections = assess_connections(offer, policy=settings.connection_policy,
                itinerary_context_valid=not conflicting and "AIRPORT_MISMATCH" not in quality.reasons)
            airport = airport_context(facts,
                destination_slug=context.destination.slug if context.destination else "",
                round_trip=bool(offer and offer.return_at),
                itinerary_eligible=quality.recommendation_eligible)
            ranking = trip_quality(facts, quality, assessment, connections,
                policy=settings.trip_quality_policy, airport=airport)
            matches.append((context.deal, assessment, interval, ranking))
    return matches
