from datetime import date, time
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select, true
from sqlalchemy.orm import Session, aliased
from sqlalchemy.orm.util import AliasedClass

from app.db.session import get_db
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.schemas.deal import DealPage, DealRead
from app.schemas.location import AirportRead, DestinationRead
from app.schemas.weekend import WeekendMode, WorkHours
from app.services.airports import matching_airports
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.destination_search import destination_search_fields, matching_destinations
from app.services.weekend_catalog import (
    WeekendQueryTooBroad,
    ranked_itinerary_matches,
)

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/deals", response_model=list[DealRead] | DealPage)
def list_deals(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0, le=10000),
    sort: Literal["score", "price", "departure", "destination_time", "recommended"] = Query(
        "price", description="recommended: modelled convenience descending, unscored last; destination_time: reliable airport interval descending, unknown/estimated last. Both use price/date/id tie-breaks and at most 500 filtered candidates."
    ),
    include_total: bool = Query(False),
    origin: str | None = Query(
        None, min_length=1, max_length=240, description="Departure airport IATA code or city name"
    ),
    destination: str | None = Query(None, max_length=240, description="Destination slug, city name or unambiguous IATA code"),
    departure_from: date | None = Query(None),
    departure_to: date | None = Query(None),
    budget: Decimal | None = Query(None, ge=0, le=1000000),
    duration_min: int | None = Query(None, ge=0, le=365),
    duration_max: int | None = Query(None, ge=0, le=365),
    weekend: bool = Query(False, description="Friday/Saturday departure, return the same Sunday"),
    weekend_mode: WeekendMode | None = Query(None, description="Opt-in exact weekend-v1 mode; mutually exclusive with weekend=true"),
    work_start: time | None = Query(None, description="Origin-local weekday work start; only with no-leave-v1"),
    work_end: time | None = Query(None, description="Origin-local weekday work end; only with no-leave-v1"),
    round_trip: bool = Query(False, description="Only offers with a known return flight"),
    db: Session = Depends(get_db),
) -> list[DealRead] | DealPage:
    if weekend and weekend_mode:
        raise HTTPException(422, detail={"code": "CONFLICTING_WEEKEND_FILTERS"})
    if (work_start is not None or work_end is not None) and weekend_mode != "no-leave-v1":
        raise HTTPException(422, detail={"code": "WORK_HOURS_REQUIRE_NO_LEAVE"})
    try:
        hours = WorkHours(start=work_start if work_start is not None else time(9),
                          end=work_end if work_end is not None else time(17))
    except ValueError:
        raise HTTPException(422, detail={"code": "INVALID_WORK_HOURS"}) from None
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
    if weekend or round_trip:
        query = query.where(
            select(DealComponent.id)
            .join(TravelOffer, TravelOffer.id == DealComponent.travel_offer_id)
            .where(DealComponent.deal_id == Deal.id, DealComponent.component_type == "FLIGHT",
                   TravelOffer.return_at.is_not(None)).exists()
        )
    if weekend:
        # PostgreSQL subtracts DATE values into days; SQLite needs julianday.
        days = (
            func.julianday(Deal.trip_end) - func.julianday(Deal.trip_start)
            if db.get_bind().dialect.name == "sqlite"
            else Deal.trip_end - Deal.trip_start
        )
        query = query.where(
            extract("dow", Deal.trip_start).in_([5, 6]),
            extract("dow", Deal.trip_end) == 0,
            days.between(1, 2),
        )
    query = query.order_by(None)
    if weekend_mode or sort in ("destination_time", "recommended"):
        # Match against source evidence, not cached Deal dates. All ordinary SQL
        # filters above still apply; exact mode runs before offset/limit/total.
        try:
            matches = ranked_itinerary_matches(db, query.order_by(*_deal_order(Deal, "price" if sort in ("destination_time", "recommended") else sort)), weekend_mode, hours)
        except WeekendQueryTooBroad:
            code = "TRIP_QUALITY_QUERY_TOO_BROAD" if sort == "recommended" else "DESTINATION_TIME_QUERY_TOO_BROAD" if sort == "destination_time" else "WEEKEND_QUERY_TOO_BROAD"
            raise HTTPException(422, detail={"code": code}) from None
        # The metadata join groups by ID; restore the public deterministic order.
        if sort == "recommended":
            # Full filtered snapshot before pagination; price/history never enter the model.
            matches.sort(key=lambda row: (row[3].score is None,
                -(row[3].score if row[3].score is not None else 0),
                row[0].price_per_person_pln, row[0].trip_start, row[0].id))
        elif sort == "destination_time":
            # Only reliable airport intervals participate. Unknown/estimated
            # values share the price fallback, even if their estimate is huge.
            matches.sort(key=lambda pair: (
                not pair[2].sort_eligible,
                -pair[2].airport_interval_minutes if pair[2].sort_eligible and pair[2].airport_interval_minutes is not None else 0,
                pair[0].price_per_person_pln, pair[0].trip_start, pair[0].id,
            ))
        elif sort == "price":
            matches.sort(key=lambda pair: (pair[0].price_per_person_pln, pair[0].trip_start, pair[0].id))
        elif sort == "departure":
            matches.sort(key=lambda pair: (pair[0].trip_start, pair[0].price_per_person_pln, pair[0].id))
        else:
            matches.sort(key=lambda pair: (-pair[0].deal_score, pair[0].trip_start, pair[0].id))
        items = []
        for deal, assessment, interval, ranking in matches[offset:offset + limit]:
            serialized = serialize_deal(db, deal)
            serialized.weekend_assessment = assessment
            serialized.destination_time = interval
            serialized.trip_quality, serialized.trip_quality_score = ranking, ranking.score
            items.append(serialized)
        return DealPage(items=items, total=len(matches), offset=offset, limit=limit) if include_total else items
    if not include_total:
        page_query = query.order_by(*_deal_order(Deal, sort)).offset(offset).limit(limit)
        return [serialize_deal(db, d) for d in db.scalars(page_query)]
    # One SQL snapshot, even when the requested page is empty.
    filtered = query.cte("filtered_deals")
    matched = aliased(Deal, filtered)
    page = (
        select(matched).order_by(*_deal_order(matched, sort))
        .offset(offset).limit(limit).subquery()
    )
    item = aliased(Deal, page)
    total = select(func.count().label("total")).select_from(filtered).subquery()
    rows = db.execute(
        select(item, total.c.total)
        .select_from(total.outerjoin(page, true()))
        .order_by(*_deal_order(item, sort))
    ).all()
    return DealPage(
        items=[serialize_deal(db, d) for d, _ in rows if d is not None],
        total=rows[0][1], offset=offset, limit=limit,
    )


def _deal_order(model: type[Deal] | AliasedClass[Deal], sort: str):
    if sort == "price":
        return (model.price_per_person_pln.asc(), model.trip_start.asc(), model.id.asc())
    if sort == "departure":
        return (model.trip_start.asc(), model.price_per_person_pln.asc(), model.id.asc())
    return (model.deal_score.desc(), model.trip_start.asc(), model.id.asc())

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
    sort: Literal["score", "price", "departure"] = Query("price"),
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
        .order_by(*_deal_order(Deal, sort))
        .limit(limit)
    )
    return [serialize_deal(db, d) for d in db.scalars(query)]


@router.get("/destinations/{slug}/deals", response_model=list[DealRead])
def list_destination_deals(
    slug: str,
    limit: int = Query(50, ge=1, le=100),
    sort: Literal["score", "price", "departure"] = Query("price"),
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
        .order_by(*_deal_order(Deal, sort))
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
        warsaw = origin.upper() in {"WAW,WMI", "WMI,WAW"}
        airports = (list(db.scalars(select(Airport).where(Airport.iata_code.in_(["WAW", "WMI"]))))
                    if warsaw else matching_airports(db, origin))
        if not airports:
            raise HTTPException(status_code=404, detail={"code": "UNKNOWN_ORIGIN"})
        if len(airports) > 1 and not warsaw:
            raise HTTPException(status_code=422, detail={"code": "AMBIGUOUS_ORIGIN"})
        query = query.where(Deal.origin_airport_id.in_([airport.id for airport in airports]))
    if destination and destination.strip():
        matches = matching_destinations(db, destination)
        if not matches:
            raise HTTPException(status_code=404, detail={"code": "UNKNOWN_DESTINATION"})
        if len(matches) > 1:
            raise HTTPException(status_code=422, detail={"code": "AMBIGUOUS_DESTINATION"})
        query = query.where(Deal.destination_id == matches[0].id)
    if departure_from:
        query = query.where(Deal.trip_start >= departure_from)
    if departure_to:
        query = query.where(Deal.trip_start <= departure_to)
    if departure_from and departure_to and departure_from > departure_to:
        raise HTTPException(status_code=422, detail="departure_from must be before departure_to")
    return query


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
) -> list[DestinationRead]:
    query = select(Destination).order_by(Destination.city)
    if active_only:
        query = query.where(Destination.is_active.is_(True))
    destinations = list(db.scalars(query).all())
    fields = destination_search_fields(db, destinations)
    return [
        DestinationRead.model_validate(d).model_copy(update=fields[d.id])
        for d in destinations
    ]
