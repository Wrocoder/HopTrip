from decimal import Decimal

from app.config import get_settings
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination, DestinationAlias
from app.models.offer import TravelOffer
from app.schemas.deal import ComponentRead, DealRead
from app.services.affiliate import component_policy
from app.services.airport_context import airport_context
from app.services.destination_time import destination_time
from app.services.event_destinations import event_city
from app.services.flight_facts import flight_facts
from app.services.flight_quality import classify_flight_quality
from app.services.price_freshness import price_freshness
from app.services.score_explanation import explain_score
from app.services.weekend import assess_weekend
from sqlalchemy import select
from sqlalchemy.orm import Session


def serialize_deal(db: Session, deal: Deal) -> DealRead:
    result = DealRead.model_validate(deal)
    result.score_explanation = explain_score(deal)
    comparison = result.score_explanation
    # Compatibility field must agree with the validated saved comparison, never
    # an independently stored (possibly stale) discount. No DB write or rescoring.
    result.discount_percent = (
        max(Decimal("0.00"), comparison.price_difference_percent)
        if comparison.status == "CURRENT" and comparison.price_difference_percent is not None
        else None
    )
    result.price_freshness = price_freshness(deal)
    origin = db.get(Airport, deal.origin_airport_id)
    destination = db.get(Destination, deal.destination_id)
    result.origin_code = origin.iata_code if origin else ""
    result.origin_city = origin.city if origin else ""
    result.destination_city = destination.city if destination else ""
    result.destination_slug = destination.slug if destination else ""
    result.destination_country_code = destination.country_code if destination else ""
    settings = get_settings()
    result.events_supported = bool(
        origin and origin.country_code == "PL"
        and settings.events_enabled
        and destination and event_city(result.destination_slug, result.destination_country_code,
                                       settings.events_countries, destination.city, destination.timezone)
    )
    components = list(db.scalars(select(DealComponent).where(DealComponent.deal_id == deal.id)))
    source_offer = None
    for component in components:
        policy = component_policy(db, component)
        result.components.append(
            ComponentRead(
                id=component.id,
                component_type=component.component_type,
                price_pln=component.price_pln,
                available=policy.available,
                reason=policy.reason,
                partner_name=policy.program.name if policy.program else None,
                redirect_path=f"/go/{deal.slug}/{component.component_type.lower()}"
                if policy.available
                else None,
            )
        )
        if component.component_type == "FLIGHT" and component.travel_offer_id:
            offer = db.get(TravelOffer, component.travel_offer_id)
            if offer:
                source_offer = offer
                result.flight_facts = flight_facts(offer)
                result.price_freshness = price_freshness(deal, offer)
            if offer and offer.return_at:
                result.trip_type = "ROUND_TRIP"
    codes = set(db.scalars(select(DestinationAlias.code).where(
        DestinationAlias.destination_id == deal.destination_id,
        DestinationAlias.provider_code.in_([source_offer.source if source_offer else "", "*"]),
    )))
    if destination and destination.iata_code:
        codes.add(destination.iata_code)
    result.flight_quality = classify_flight_quality(
        source_offer, result.flight_facts, origin_code=origin.iata_code if origin else None,
        destination_codes=codes,
        conflicting_context=(len([c for c in components if c.component_type == "FLIGHT"]) > 1
            or bool(source_offer and (
                source_offer.origin_airport_id is not None and source_offer.origin_airport_id != deal.origin_airport_id
                or source_offer.destination_id is not None and source_offer.destination_id != deal.destination_id))),
    )
    result.weekend_assessment = assess_weekend(
        result.flight_facts, itinerary_eligible=result.flight_quality.recommendation_eligible,
    )
    result.destination_time = destination_time(
        result.flight_facts, itinerary_eligible=result.flight_quality.recommendation_eligible,
    )
    result.is_featured = deal.is_featured and result.flight_quality.recommendation_eligible
    result.airport_context = airport_context(
        result.flight_facts, destination_slug=result.destination_slug, round_trip=result.trip_type == "ROUND_TRIP",
        itinerary_eligible=result.flight_quality.recommendation_eligible,
    )
    return result
