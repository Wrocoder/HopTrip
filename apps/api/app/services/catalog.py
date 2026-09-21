from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.schemas.deal import ComponentRead, DealRead
from app.services.affiliate import component_policy
from sqlalchemy import select
from sqlalchemy.orm import Session


def serialize_deal(db: Session, deal: Deal) -> DealRead:
    result = DealRead.model_validate(deal)
    origin = db.get(Airport, deal.origin_airport_id)
    destination = db.get(Destination, deal.destination_id)
    result.origin_code = origin.iata_code if origin else ""
    result.origin_city = origin.city if origin else ""
    result.destination_city = destination.city if destination else ""
    result.destination_slug = destination.slug if destination else ""
    for component in db.scalars(select(DealComponent).where(DealComponent.deal_id == deal.id)):
        policy = component_policy(db, component)
        result.components.append(
            ComponentRead(
                id=component.id,
                component_type=component.component_type,
                price_pln=component.price_pln,
                available=policy.available,
                reason=policy.reason,
                redirect_path=f"/go/{deal.slug}/{component.component_type.lower()}"
                if policy.available
                else None,
            )
        )
        if component.travel_offer_id:
            offer = db.get(TravelOffer, component.travel_offer_id)
            if offer and offer.return_at:
                result.trip_type = "ROUND_TRIP"
    return result
