from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.deal import Deal
from app.models.location import Airport, Destination
from app.schemas.deal import DealRead
from app.schemas.location import AirportRead, DestinationRead
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/deals", response_model=list[DealRead])
def list_deals(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0, le=10000),
    origin: str | None = Query(
        None, min_length=3, max_length=3, description="Departure airport IATA code"
    ),
    destination: str | None = Query(None, description="Destination slug"),
    departure_from: date | None = Query(None),
    departure_to: date | None = Query(None),
    budget: Decimal | None = Query(None, ge=0, le=1000000),
    duration_min: int | None = Query(None, ge=0, le=365),
    duration_max: int | None = Query(None, ge=0, le=365),
    db: Session = Depends(get_db),
) -> list[DealRead]:
    query = _filtered_deals_query(
        db,
        origin=origin,
        destination=destination,
        departure_from=departure_from,
        departure_to=departure_to,
    )
    if duration_min is not None and duration_max is not None and duration_min > duration_max:
        raise HTTPException(422, "Invalid duration range")
    if budget is not None:
        query = query.where(Deal.price_per_person_pln <= budget)
    if duration_min is not None:
        query = query.where(Deal.nights >= duration_min)
    if duration_max is not None:
        query = query.where(Deal.nights <= duration_max)
    query = query.offset(offset).limit(limit)
    return [serialize_deal(db, d) for d in db.scalars(query)]


@router.get("/deals/{slug}", response_model=DealRead)
def get_deal(slug: str, db: Session = Depends(get_db)) -> DealRead:
    deal = db.scalar(available_deals_query().where(Deal.slug == slug))
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return serialize_deal(db, deal)


@router.get("/departures/{iata_code}/deals", response_model=list[DealRead])
def list_departure_deals(
    iata_code: str,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[DealRead]:
    airport = db.scalar(select(Airport).where(Airport.iata_code == iata_code.upper()))
    if airport is None:
        raise HTTPException(status_code=404, detail="Airport not found")
    query = (
        available_deals_query()
        .where(
            Deal.origin_airport_id == airport.id,
        )
        .order_by(Deal.deal_score.desc(), Deal.trip_start, Deal.id)
        .limit(limit)
    )
    return [serialize_deal(db, d) for d in db.scalars(query)]


@router.get("/destinations/{slug}/deals", response_model=list[DealRead])
def list_destination_deals(
    slug: str,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[DealRead]:
    destination = db.scalar(select(Destination).where(Destination.slug == slug))
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    query = (
        available_deals_query()
        .where(
            Deal.destination_id == destination.id,
        )
        .order_by(Deal.deal_score.desc(), Deal.trip_start, Deal.id)
        .limit(limit)
    )
    return [serialize_deal(db, d) for d in db.scalars(query)]


def _filtered_deals_query(
    db: Session,
    *,
    origin: str | None,
    destination: str | None,
    departure_from: date | None,
    departure_to: date | None,
):
    query = available_deals_query()
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
    return query.order_by(Deal.deal_score.desc(), Deal.trip_start, Deal.id)


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
