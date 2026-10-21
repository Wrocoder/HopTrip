import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import type {Deal} from "../../lib/api";
import {compactFlightTime,flightDayShift,flightTime} from "../../lib/flight-facts";

export function FlightSchedule({deal,compact=false,locale="pl"}:{deal:Deal;compact?:boolean;locale?:Locale}) {
 const t=(source:CatalogKey)=>catalogText(locale,source);
 const f=deal.flight_facts;
 const origin=f?.origin_airport ?? deal.origin_code ?? "?",destination=f?.destination_airport ?? t("lotnisko do sprawdzenia");
 const clock=(value?:string|null,zone?:string|null)=>flightTime(value,zone,locale) ?? t("Brak danych o godzinie");
 const outboundShift=flightDayShift(f?.outbound_departure,f?.outbound_arrival,f?.origin_timezone,f?.destination_timezone,locale);
 const returnShift=flightDayShift(f?.return_departure,f?.return_arrival,f?.destination_timezone,f?.origin_timezone,locale);
 if(compact) {
  const out=compactFlightTime(f?.outbound_departure,f?.origin_timezone,locale),arr=compactFlightTime(f?.outbound_arrival,f?.destination_timezone,locale);
  const back=compactFlightTime(f?.return_departure,f?.destination_timezone,locale),home=compactFlightTime(f?.return_arrival,f?.origin_timezone,locale);
  const clocks=deal.trip_type==="ROUND_TRIP" ? [out,arr,back,home] : [out,arr];
  const local=clocks.some(c=>c?.local),utc=clocks.some(c=>c && !c.local);
  const segment=(start:typeof out,end:typeof out,from:string,to:string,shift:string|null,estimated?:boolean)=>
   !start && !end ? <>{from} → {to} · {t("brak godziny")}</> :
   <>{start?.day ?? t("Data wylotu do sprawdzenia")}: {from} {start?.time ?? t("brak godziny")} → {to} {end?.time ?? t("brak godziny")}
    {end && (shift || !start || !start.local || !end.local) && <> ({end.day}{shift ? `, ${shift}` : ""})</>}
    {end && estimated && ` · ${t("szac.")}`}</>;
  return <div className="flight-schedule flight-schedule-compact">
   <p><strong>{t("Wylot")}</strong> · {segment(out,arr,origin,destination,outboundShift,f?.outbound_arrival_calculated)}</p>
   {deal.trip_type==="ROUND_TRIP" && <p><strong>{t("Powrót")}</strong> · {segment(back,home,destination,origin,returnShift,f?.return_arrival_calculated)}</p>}
   {deal.trip_type==="ROUND_TRIP" && returnShift && home && <p className="home-arrival"><strong>{t("Powrót do")} {origin}: {home.day} ({returnShift})</strong></p>}
   {(local || utc) && <p className="schedule-basis">{local && t("Godziny lokalne")}{local && utc && " · "}{utc && t("UTC: strefa nieznana")}
    {(arr && f?.outbound_arrival_calculated || deal.trip_type==="ROUND_TRIP" && home && f?.return_arrival_calculated) && ` · ${t("Przylot szacowany")}`}</p>}
   <p className="schedule-airline">{f?.airline_name ? `${f.airline_name}${f.airline_code ? ` (${f.airline_code})` : ""}` : f?.airline_code ? `${t("Przewoźnik:")} ${f.airline_code}` : t("Przewoźnik do sprawdzenia")}</p>
  </div>;
 }
 return <div className="flight-schedule">
  <p className="deal-note">{t("Godziny lokalne przy znanej strefie lotniska; w pozostałych przypadkach oznaczone UTC.")}</p>
  <p><strong>{t("Wylot")} · {origin}:</strong> {clock(f?.outbound_departure,f?.origin_timezone)}<br/>
   <strong>{t("Przylot")} · {destination}:</strong> {clock(f?.outbound_arrival,f?.destination_timezone)}{outboundShift && ` · ${outboundShift}`}{f?.outbound_arrival_calculated && ` · ${t("obliczony z czasu lotu")}`}</p>
  {deal.trip_type==="ROUND_TRIP" && <>
   <p><strong>{t("Wylot powrotny")} · {destination}:</strong> {clock(f?.return_departure,f?.destination_timezone)}</p>
   <p className="home-arrival"><strong>{t("Powrót do domu")} · {origin}:</strong> {clock(f?.return_arrival,f?.origin_timezone)}{returnShift && ` · ${returnShift}`}{f?.return_arrival_calculated && ` · ${t("obliczony z czasu lotu")}`}</p>
  </>}
  <p className="deal-note">{f?.airline_name ? `${t("Przewoźnik:")} ${f.airline_name} (${f.airline_code})` : f?.airline_code ? `${t("Przewoźnik:")} IATA ${f.airline_code} — ${t("nazwa nieznana")}` : `${t("Przewoźnik:")} ${t("do sprawdzenia u partnera")}`}. {t("Potwierdź rozkład u partnera.")}</p>
 </div>;
}
