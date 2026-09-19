from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.deal import Deal
from app.models.location import Airport, Destination
from app.schemas.deal import DealRead
from app.schemas.location import AirportRead, DestinationRead

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/deals", response_model=list[DealRead])
def list_deals(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    origin: str | None = Query(None, min_length=3, max_length=3, description="Departure airport IATA code"),
    destination: str | None = Query(None, description="Destination slug"),
    departure_from: date | None = Query(None),
    departure_to: date | None = Query(None),
    db: Session = Depends(get_db),
) -> list[Deal]:
    query = _filtered_deals_query(
        db,
        origin=origin,
        destination=destination,
        departure_from=departure_from,
        departure_to=departure_to,
    ).offset(offset).limit(limit)
    return list(db.scalars(query).all())


@router.get("/deals/{slug}", response_model=DealRead)
def get_deal(slug: str, db: Session = Depends(get_db)) -> Deal:
    deal = db.scalar(select(Deal).where(Deal.slug == slug, Deal.is_visible.is_(True)))
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.get("/departures/{iata_code}/deals", response_model=list[DealRead])
def list_departure_deals(
    iata_code: str,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Deal]:
    airport = db.scalar(select(Airport).where(Airport.iata_code == iata_code.upper()))
    if airport is None:
        raise HTTPException(status_code=404, detail="Airport not found")
    query = (
        select(Deal)
        .where(
            Deal.origin_airport_id == airport.id,
            Deal.is_visible.is_(True),
            Deal.status == "ACTIVE",
        )
        .order_by(Deal.deal_score.desc(), Deal.trip_start)
        .limit(limit)
    )
    return list(db.scalars(query).all())


@router.get("/destinations/{slug}/deals", response_model=list[DealRead])
def list_destination_deals(
    slug: str,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Deal]:
    destination = db.scalar(select(Destination).where(Destination.slug == slug))
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    query = (
        select(Deal)
        .where(
            Deal.destination_id == destination.id,
            Deal.is_visible.is_(True),
            Deal.status == "ACTIVE",
        )
        .order_by(Deal.deal_score.desc(), Deal.trip_start)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def _filtered_deals_query(
    db: Session,
    *,
    origin: str | None,
    destination: str | None,
    departure_from: date | None,
    departure_to: date | None,
):
    query = select(Deal).where(Deal.is_visible.is_(True), Deal.status == "ACTIVE")
    if origin:
        airport = db.scalar(select(Airport).where(Airport.iata_code == origin.upper()))
        if airport is None:
            raise HTTPException(status_code=404, detail="Airport not found")
        query = query.where(Deal.origin_airport_id == airport.id)
    if destination:
        destination_record = db.scalar(select(Destination).where(Destination.slug == destination))
        if destination_record is None:
            raise HTTPException(status_code=404, detail="Destination not found")
        query = query.where(Deal.destination_id == destination_record.id)
    if departure_from:
        query = query.where(Deal.trip_start >= departure_from)
    if departure_to:
        query = query.where(Deal.trip_start <= departure_to)
    if departure_from and departure_to and departure_from > departure_to:
        raise HTTPException(status_code=422, detail="departure_from must be before departure_to")
    return query.order_by(Deal.deal_score.desc(), Deal.trip_start)


@router.get("/airports", response_model=list[AirportRead])
def list_airports(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
) -> list[Airport]:
    query = select(Airport).order_by(Airport.city, Airport.iata_code)
    if active_only:
        query = query.where(Airport.is_active.is_(True))
    return list(db.scalars(query).all())


@router.get("/destinations", response_model=list[DestinationRead])
def list_destinations(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
) -> list[Destination]:
    query = select(Destination).order_by(Destination.city)
    if active_only:
        query = query.where(Destination.is_active.is_(True))
    return list(db.scalars(query).all())
