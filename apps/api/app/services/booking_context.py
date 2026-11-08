"""Reject known itinerary contradictions without guessing the cached ticket grammar."""

import re

from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination, DestinationAlias
from app.models.offer import TravelOffer
from app.services.flight_quality import classify_flight_quality
from app.services.time import utc
from app.services.trip_dates import trip_dates
from sqlalchemy import select
from sqlalchemy.orm import Session


def flight_link_context_valid(db: Session, component: DealComponent, offer: TravelOffer) -> bool:
    if offer.product_type != "FLIGHT" or not isinstance(offer.raw_payload, dict):
        return False
    deal = db.get(Deal, component.deal_id)
    if deal is None or (
        offer.origin_airport_id is not None and offer.origin_airport_id != deal.origin_airport_id
        or offer.destination_id is not None and offer.destination_id != deal.destination_id
        or deal.depart_at is not None and utc(deal.depart_at) != utc(offer.depart_at)
    ):
        return False
    payload = offer.raw_payload
    if offer.return_at is None and (payload.get("return_at") or payload.get("return_date")):
        return False
    origin = db.get(Airport, deal.origin_airport_id)
    destination = db.get(Destination, deal.destination_id)
    # The REST source also supplies origin when origin_airport is absent.
    if (origin and not payload.get("origin_airport")
            and isinstance(payload.get("origin"), str)
            and re.fullmatch(r"[A-Za-z]{3}", payload["origin"])
            and payload["origin"].upper() != origin.iata_code):
        return False
    start, end = trip_dates(offer)
    if ((payload.get("departure_at") or payload.get("depart_date")) and start != deal.trip_start
            or (payload.get("return_at") or payload.get("return_date")) and end != deal.trip_end):
        return False
    codes = set(db.scalars(select(DestinationAlias.code).where(
        DestinationAlias.destination_id == deal.destination_id,
        DestinationAlias.provider_code.in_([offer.source, "*"]),
    )))
    if destination and destination.iata_code:
        codes.add(destination.iata_code)
    quality = classify_flight_quality(offer, origin_code=origin.iata_code if origin else None,
                                      destination_codes=codes)
    # Missing legacy evidence is unknown, not a proven mismatch. An open-jaw return
    # need not reverse the outward airports; the provider's opaque ticket stays intact.
    return not {"AIRPORT_MISMATCH", "INVALID_DATES"}.intersection(quality.reasons)
