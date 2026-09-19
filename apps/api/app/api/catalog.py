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
    db: Session = Depends(get_db),
) -> list[Deal]:
    query = (
        select(Deal)
        .where(Deal.is_visible.is_(True), Deal.status == "ACTIVE")
        .order_by(Deal.deal_score.desc(), Deal.trip_start)
        .offset(offset)
        .limit(limit)
    )
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
