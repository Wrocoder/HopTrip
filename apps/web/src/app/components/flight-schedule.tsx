import type {Deal} from "../../lib/api";
import {compactFlightTime,flightDayShift,flightTime} from "../../lib/flight-facts";

export function FlightSchedule({deal,compact=false}:{deal:Deal;compact?:boolean}) {
 const f=deal.flight_facts;
 const origin=f?.origin_airport ?? deal.origin_code ?? "?",destination=f?.destination_airport ?? "lotnisko do sprawdzenia";
 const clock=(value?:string|null,zone?:string|null)=>flightTime(value,zone) ?? "Brak danych o godzinie";
 const outboundShift=flightDayShift(f?.outbound_departure,f?.outbound_arrival,f?.origin_timezone,f?.destination_timezone);
 const returnShift=flightDayShift(f?.return_departure,f?.return_arrival,f?.destination_timezone,f?.origin_timezone);
 if(compact) {
  const out=compactFlightTime(f?.outbound_departure,f?.origin_timezone),arr=compactFlightTime(f?.outbound_arrival,f?.destination_timezone);
  const back=compactFlightTime(f?.return_departure,f?.destination_timezone),home=compactFlightTime(f?.return_arrival,f?.origin_timezone);
  const clocks=deal.trip_type==="ROUND_TRIP" ? [out,arr,back,home] : [out,arr];
  const local=clocks.some(c=>c?.local),utc=clocks.some(c=>c && !c.local);
  const segment=(start:typeof out,end:typeof out,from:string,to:string,shift:string|null,estimated?:boolean)=>
   !start && !end ? <>{from} → {to} · brak godziny</> :
   <>{start?.day ?? "Data wylotu do sprawdzenia"}: {from} {start?.time ?? "brak godziny"} → {to} {end?.time ?? "brak godziny"}
    {end && (shift || !start || !start.local || !end.local) && <> ({end.day}{shift ? `, ${shift}` : ""})</>}
    {end && estimated && " · szac."}</>;
  return <div className="flight-schedule flight-schedule-compact">
   <p><strong>Wylot</strong> · {segment(out,arr,origin,destination,outboundShift,f?.outbound_arrival_calculated)}</p>
   {deal.trip_type==="ROUND_TRIP" && <p><strong>Powrót</strong> · {segment(back,home,destination,origin,returnShift,f?.return_arrival_calculated)}</p>}
   {deal.trip_type==="ROUND_TRIP" && returnShift && home && <p className="home-arrival"><strong>Powrót do {origin}: {home.day} ({returnShift})</strong></p>}
   {(local || utc) && <p className="schedule-basis">{local && "Godziny lokalne"}{local && utc && " · "}{utc && "UTC: strefa nieznana"}
    {(arr && f?.outbound_arrival_calculated || deal.trip_type==="ROUND_TRIP" && home && f?.return_arrival_calculated) && " · Przylot szacowany"}</p>}
   <p className="schedule-airline">{f?.airline_name ? `${f.airline_name}${f.airline_code ? ` (${f.airline_code})` : ""}` : f?.airline_code ? `Przewoźnik: ${f.airline_code}` : "Przewoźnik do sprawdzenia"}</p>
  </div>;
 }
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
