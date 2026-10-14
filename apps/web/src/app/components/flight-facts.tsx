import type {Deal} from "../../lib/api";
import {destinationInterval,flightTime,stopsLabel} from "../../lib/flight-facts";

export function FlightFacts({deal}:{deal:Deal}) {
  const facts=deal.flight_facts;
  const roundTrip=deal.trip_type==="ROUND_TRIP";
  const interval=destinationInterval(facts?.destination_interval_minutes);
  const outbound=flightTime(facts?.outbound_departure,facts?.origin_timezone);
  const inbound=flightTime(facts?.return_departure,facts?.destination_timezone);
  return <div className="flight-facts">
    <p className="deal-note">Lotnisko wylotu: {facts?.origin_airport ?? "do sprawdzenia u partnera"} · Lotnisko docelowe: {facts?.destination_airport ?? "do sprawdzenia u partnera"}
      {!facts?.destination_airport && facts?.destination_code && ` (kod kierunku: ${facts.destination_code}; nie potwierdza lotniska)`}</p>
    <p className="deal-note">{facts?.airline_name ? `Przewoźnik: ${facts.airline_name} (${facts.airline_code})` : facts?.airline_code ? `Przewoźnik podany przez źródło (IATA): ${facts.airline_code} — nazwa nieznana` : "Przewoźnik do sprawdzenia u partnera"}</p>
    <p className="deal-note">Wylot: {stopsLabel(facts?.outbound_stops)}{roundTrip && ` · Powrót: ${stopsLabel(facts?.return_stops)}`}</p>
    {outbound || inbound ? <>
      <p className="deal-note">Wylot — odlot: {outbound ?? "Brak danych o godzinie"}; przylot: {flightTime(facts?.outbound_arrival,facts?.destination_timezone) ?? "Brak danych o godzinie"}{facts?.outbound_arrival_calculated && " · obliczony z czasu lotu"}</p>
      {roundTrip && <p className="deal-note">Powrót — odlot: {inbound ?? "Brak danych o godzinie"}; przylot: {flightTime(facts?.return_arrival,facts?.origin_timezone) ?? "Brak danych o godzinie"}{facts?.return_arrival_calculated && " · obliczony z czasu lotu"}</p>}
      <p className="deal-note">Godziny lokalne przy znanej strefie lotniska; pozostałe oznaczono UTC. Potwierdź rozkład u partnera.</p>
    </> : <p className="deal-note">Brak danych o godzinie</p>}
    {roundTrip && interval && <p className="deal-note">Między przylotem a odlotem powrotnym: {interval}. Ten okres obejmuje też transfery, odprawę i noclegi.</p>}
    <p className="deal-note">Bagaż do sprawdzenia u partnera</p>
  </div>;
}
