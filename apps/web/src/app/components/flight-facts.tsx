import type {Deal} from "../../lib/api";
import {destinationInterval,flightTime,stopsLabel} from "../../lib/flight-facts";

export function FlightFacts({deal}:{deal:Deal}) {
  const facts=deal.flight_facts;
  const roundTrip=deal.trip_type==="ROUND_TRIP";
  const interval=destinationInterval(facts?.destination_interval_minutes);
  const outbound=flightTime(facts?.outbound_departure);
  const inbound=flightTime(facts?.return_departure);
  return <div className="flight-facts">
    <p className="deal-note">Lotnisko wylotu: {facts?.origin_airport ?? "do sprawdzenia u partnera"} · Lotnisko docelowe: {facts?.destination_airport ?? "do sprawdzenia u partnera"}
      {!facts?.destination_airport && facts?.destination_code && ` (kod kierunku: ${facts.destination_code}; nie potwierdza lotniska)`}</p>
    <p className="deal-note">{facts?.airline_code ? `Przewoźnik podany przez źródło (IATA): ${facts.airline_code}` : "Przewoźnik do sprawdzenia u partnera"}</p>
    <p className="deal-note">Wylot: {stopsLabel(facts?.outbound_stops)}{roundTrip && ` · Powrót: ${stopsLabel(facts?.return_stops)}`}</p>
    {outbound || inbound ? <>
      <p className="deal-note">Wylot — odlot: {outbound ?? "do sprawdzenia u partnera"}; przylot: {flightTime(facts?.outbound_arrival) ?? "do sprawdzenia u partnera"}</p>
      {roundTrip && <p className="deal-note">Powrót — odlot: {inbound ?? "do sprawdzenia u partnera"}; przylot: {flightTime(facts?.return_arrival) ?? "do sprawdzenia u partnera"}</p>}
      <p className="deal-note">Godziny w UTC, nie w czasie lokalnym. Przyloty obliczone z czasu lotu podanego przez źródło. Potwierdź rozkład u partnera.</p>
    </> : <p className="deal-note">Godziny do sprawdzenia u partnera</p>}
    {roundTrip && interval && <p className="deal-note">Między przylotem a odlotem powrotnym: {interval}. Ten okres obejmuje też transfery, odprawę i noclegi.</p>}
    <p className="deal-note">Bagaż do sprawdzenia u partnera</p>
  </div>;
}
