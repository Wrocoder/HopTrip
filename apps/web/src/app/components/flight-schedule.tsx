import type {Deal} from "../../lib/api";
import {flightDayShift,flightTime} from "../../lib/flight-facts";

export function FlightSchedule({deal}:{deal:Deal}) {
 const f=deal.flight_facts;
 const origin=f?.origin_airport ?? deal.origin_code ?? "?",destination=f?.destination_airport ?? "lotnisko do sprawdzenia";
 const clock=(value?:string|null,zone?:string|null)=>flightTime(value,zone) ?? "Brak danych o godzinie";
 const outboundShift=flightDayShift(f?.outbound_departure,f?.outbound_arrival,f?.origin_timezone,f?.destination_timezone);
 const returnShift=flightDayShift(f?.return_departure,f?.return_arrival,f?.destination_timezone,f?.origin_timezone);
 return <div className="flight-schedule">
  <p className="deal-note">Godziny lokalne przy znanej strefie lotniska; w pozostałych przypadkach oznaczone UTC.</p>
  <p><strong>Wylot · {origin}:</strong> {clock(f?.outbound_departure,f?.origin_timezone)}<br/>
   <strong>Przylot · {destination}:</strong> {clock(f?.outbound_arrival,f?.destination_timezone)}{outboundShift && ` · ${outboundShift}`}{f?.outbound_arrival_calculated && " · obliczony z czasu lotu"}</p>
  {deal.trip_type==="ROUND_TRIP" && <>
   <p><strong>Wylot powrotny · {destination}:</strong> {clock(f?.return_departure,f?.destination_timezone)}</p>
   <p className="home-arrival"><strong>Powrót do domu · {origin}:</strong> {clock(f?.return_arrival,f?.origin_timezone)}{returnShift && ` · ${returnShift}`}{f?.return_arrival_calculated && " · obliczony z czasu lotu"}</p>
  </>}
  <p className="deal-note">{f?.airline_name ? `Przewoźnik: ${f.airline_name} (${f.airline_code})` : f?.airline_code ? `Przewoźnik: kod IATA ${f.airline_code} — nazwa nieznana` : "Przewoźnik do sprawdzenia u partnera"}. Potwierdź rozkład u partnera.</p>
 </div>;
}
