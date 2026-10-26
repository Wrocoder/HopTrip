import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import type {Deal} from "../../lib/api";
import {compactFlightTime,flightDayShift,flightTime,flightLegs,returnAirportNotice,stopsLabel} from "../../lib/flight-facts";
import {flightRouteCopy} from '../../lib/i18n/flight-route-copy';

export function FlightSchedule({deal,compact=false,locale="pl"}:{deal:Deal;compact?:boolean;locale?:Locale}) {
 const t=(source:CatalogKey)=>catalogText(locale,source);
 const f=deal.flight_facts;
 const {outbound,inbound}=flightLegs(f);
 const airport=(code?:string|null)=>code ?? t("lotnisko do sprawdzenia");
 const origin=airport(outbound.origin),destination=airport(outbound.destination);
 const returnOrigin=airport(inbound.origin),returnDestination=airport(inbound.destination);
 const clock=(value?:string|null,zone?:string|null)=>flightTime(value,zone,locale) ?? t("Brak danych o godzinie");
 const outboundShift=flightDayShift(outbound.departure,outbound.arrival,outbound.originZone,outbound.destinationZone,locale);
 const returnShift=flightDayShift(inbound.departure,inbound.arrival,inbound.originZone,inbound.destinationZone,locale);
 const notice=deal.trip_type==='ROUND_TRIP' ? returnAirportNotice(f,locale) : null;
 const baseCarrier=f?.airline_name ? `${f.airline_name} (${f.airline_code})` : f?.airline_code ?? t('Przewoźnik do sprawdzenia');
 const carriers=(legs:NonNullable<typeof f>['return_legs'])=>legs?.length ? [...new Set(legs.map(leg=>
  `${leg.airline_name??leg.airline_code??t('Przewoźnik do sprawdzenia')}${leg.airline_code&&leg.flight_number ? ` (${leg.airline_code} ${leg.flight_number})` : ''}`))].join(' · ') : null;
 const airlineLine=<>{t('Wylot')}: {carriers(f?.outbound_legs)??baseCarrier}
  {deal.trip_type==='ROUND_TRIP' && <> · {t('Powrót')}: {carriers(f?.return_legs)??flightRouteCopy[locale].returnCarrier}</>}</>;
 if(compact) {
  const out=compactFlightTime(outbound.departure,outbound.originZone,locale),arr=compactFlightTime(outbound.arrival,outbound.destinationZone,locale);
  const back=compactFlightTime(inbound.departure,inbound.originZone,locale),home=compactFlightTime(inbound.arrival,inbound.destinationZone,locale);
  const clocks=deal.trip_type==="ROUND_TRIP" ? [out,arr,back,home] : [out,arr];
  const local=clocks.some(c=>c?.local),utc=clocks.some(c=>c && !c.local);
  const segment=(start:typeof out,end:typeof out,from:string,to:string,shift:string|null,estimated?:boolean)=>
   !start && !end ? <>{from} → {to} · {t("brak godziny")}</> :
   <>{start?.day ?? t("Data wylotu do sprawdzenia")}: {from} {start?.time ?? t("brak godziny")} → {to} {end?.time ?? t("brak godziny")}
    {end && (shift || !start || !start.local || !end.local) && <> ({end.day}{shift ? `, ${shift}` : ""})</>}
    {end && estimated && ` · ${t("szac.")}`}</>;
  return <div className="flight-schedule flight-schedule-compact">
   <p className="outbound-leg"><strong>{t("Wylot")}</strong> · {segment(out,arr,origin,destination,outboundShift,outbound.calculated)}<span className="flight-stops">{stopsLabel(outbound.stops,locale)}</span></p>
   {deal.trip_type==="ROUND_TRIP" && <p className="return-leg"><strong>{t("Powrót")}</strong> · {segment(back,home,returnOrigin,returnDestination,returnShift,inbound.calculated)}<span className="flight-stops">{stopsLabel(inbound.stops,locale)}</span></p>}
   {deal.trip_type==="ROUND_TRIP" && returnShift && home && <p className="home-arrival"><strong>{t("Powrót do")} {returnDestination}: {home.day} ({returnShift})</strong></p>}
   {(local || utc) && <p className="schedule-basis">{local && t("Godziny lokalne")}{local && utc && " · "}{utc && t("UTC: strefa nieznana")}
    {(arr && f?.outbound_arrival_calculated || deal.trip_type==="ROUND_TRIP" && home && f?.return_arrival_calculated) && ` · ${t("Przylot szacowany")}`}</p>}
   {notice&&<p className="flight-route-warning"><strong>{notice}</strong></p>}
   <p className="schedule-airline">{airlineLine}</p>
  </div>;
 }
 return <div className="flight-schedule">
  <p className="deal-note">{t("Godziny lokalne przy znanej strefie lotniska; w pozostałych przypadkach oznaczone UTC.")}</p>
  <p className="outbound-leg"><strong>{t("Wylot")} · {origin}:</strong> {clock(outbound.departure,outbound.originZone)}<br/>
   <strong>{t("Przylot")} · {destination}:</strong> {clock(outbound.arrival,outbound.destinationZone)}{outboundShift && ` · ${outboundShift}`}{outbound.calculated && ` · ${t("obliczony z czasu lotu")}`}<span className="flight-stops">{stopsLabel(outbound.stops,locale)}</span></p>
  {deal.trip_type==="ROUND_TRIP" && <>
   <p className="return-leg"><strong>{t("Wylot powrotny")} · {returnOrigin}:</strong> {clock(inbound.departure,inbound.originZone)}<span className="flight-stops">{stopsLabel(inbound.stops,locale)}</span></p>
   <p className="home-arrival"><strong>{t("Powrót do domu")} · {returnDestination}:</strong> {clock(inbound.arrival,inbound.destinationZone)}{returnShift && ` · ${returnShift}`}{inbound.calculated && ` · ${t("obliczony z czasu lotu")}`}</p>
  </>}
  {notice&&<p className="flight-route-warning"><strong>{notice}</strong></p>}
  <p className="deal-note">{airlineLine}. {t("Potwierdź rozkład u partnera.")}</p>
 </div>;
}
