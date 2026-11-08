from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.offer import TravelOffer
from app.services.flight_routes import ticket_key


def connection_offer(*, gap=360, airport="BER", next_airport=None,
                     arrival="2030-11-01T10:00:00Z", direction="OUTBOUND"):
    land = datetime.fromisoformat(arrival)
    takeoff = land.astimezone(UTC) + timedelta(minutes=gap)
    start, finish = land.astimezone(UTC) - timedelta(hours=2), takeoff + timedelta(hours=2)
    legs = [dict(origin="WRO", destination=airport, departure_at=start.isoformat(), arrival_at=arrival),
            dict(origin=next_airport or airport, destination="STN", departure_at=takeoff.isoformat(), arrival_at=finish.isoformat())]
    back = finish + timedelta(days=2)
    segments = [dict(departure_at=start.isoformat(), arrival_at=finish.isoformat(), flight_legs=legs),
                dict(departure_at=back.isoformat(), arrival_at=(back + timedelta(hours=2)).isoformat(), flight_legs=[
                    dict(origin="STN", destination="WRO", departure_at=back.isoformat(), arrival_at=(back + timedelta(hours=2)).isoformat())])]
    if direction == "RETURN":
        for leg in legs:
            leg["origin"], leg["destination"] = leg["destination"], leg["origin"]
        legs.reverse()
        # Retain chronological order, while reversing only the endpoint route.
        legs[0]["departure_at"], legs[0]["arrival_at"] = start.isoformat(), arrival
        legs[1]["departure_at"], legs[1]["arrival_at"] = takeoff.isoformat(), finish.isoformat()
        out = start - timedelta(days=2)
        segments = [dict(departure_at=out.isoformat(), arrival_at=(out + timedelta(hours=2)).isoformat(), flight_legs=[
            dict(origin="WRO", destination="STN", departure_at=out.isoformat(), arrival_at=(out + timedelta(hours=2)).isoformat())]),
            dict(departure_at=start.isoformat(), arrival_at=finish.isoformat(), flight_legs=legs)]
    departure = segments[0]["departure_at"]
    returning = segments[1]["departure_at"]
    link = "/search/fixture?t=connections-private-ticket"
    payload = dict(origin="WRO", destination="LON", origin_airport="WRO", destination_airport="STN",
        return_origin_airport="STN", return_destination_airport="WRO", departure_at=departure,
        return_at=returning, transfers=1 if direction == "OUTBOUND" else 0,
        return_transfers=1 if direction == "RETURN" else 0, link=link, airline="LO")
    offer = TravelOffer(source="travelpayouts_data", product_type="FLIGHT", departure_precision="TIME",
        depart_at=datetime.fromisoformat(departure), return_at=datetime.fromisoformat(returning),
        original_price=Decimal(200), original_currency="PLN", raw_payload=payload)
    offer.route_details = dict(source="travelpayouts_graphql", ticket_key=ticket_key(link),
        departure_at=departure, return_at=segments[1]["arrival_at"], value="200", currency="PLN",
        origin_airport_iata="WRO", destination_airport_iata="STN", segments=segments)
    return offer
