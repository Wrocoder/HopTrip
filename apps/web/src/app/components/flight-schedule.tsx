import {timelineView} from "../../lib/trip-timeline";
import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import type {Deal} from "../../lib/api";
import {compactFlightTime,flightDayShift,flightTime,flightLegs,returnAirportNotice,stopsLabel,flightElapsedMinutes,destinationInterval} from "../../lib/flight-facts";
import {cardCopy} from '../../lib/i18n/card-copy';
import {flightRouteCopy} from '../../lib/i18n/flight-route-copy';
import {FlightQualityNotice} from './flight-quality';
import {weekendCopy} from '../../lib/weekend';
import {stayWarnings} from '../../lib/weekend-stay';
import {DestinationTimeSummary} from './destination-time';
import {AirportContextNotice} from './airport-warnings';
import {ConnectionWarnings} from './connection-warnings';
import {tripQualityCopy,tripQualityModelSummary,tripQualitySummary,tripRecommendationReasons} from '../../lib/trip-quality';

export function FlightSchedule({deal,compact=false,card=false,detail=false,locale="pl"}:{deal:Deal;compact?:boolean;card?:boolean;detail?:boolean;locale?:Locale}) {
 const t=(source:CatalogKey)=>catalogText(locale,source);
 const f=deal.flight_facts;
 const timeline=timelineView(deal,locale);
 const ranking=tripQualitySummary(deal,locale);
 const rankingReasons=tripRecommendationReasons(deal,locale);
 const rankingSummary=ranking?<>
  <p className="trip-quality-summary"><strong>{ranking}</strong></p>
  {rankingReasons.length>0&&<ul className="trip-recommendation-reasons">{rankingReasons.map(reason=><li key={reason}>{reason}</li>)}</ul>}
  <details className="trip-quality-model"><summary>{tripQualityCopy[locale].label}</summary>
   <p>{tripQualityModelSummary(deal,locale)}</p>
  </details>
 </>:null;
 const assessment=deal.weekend_assessment,wc=weekendCopy[locale];
 const stayNotice=deal.trip_type==='ROUND_TRIP'?stayWarnings(deal,locale,!card).map(message=><p className="flight-route-warning stay-warning" key={message}>{message}</p>):null;
 const leaveNotice=deal.trip_type==='ROUND_TRIP'?<p className="weekend-assessment">{assessment?.might_require_leave===true?wc.leave:assessment?.might_require_leave===false?wc.compatible:wc.unknown}{!card&&assessment?.might_require_leave!==null&&assessment?.might_require_leave!==undefined&&` · ${assessment.work_hours.start}–${assessment.work_hours.end} · ${assessment.work_timezone??''}`}</p>:null;
 const {outbound,inbound}=flightLegs(f);
 const duration=(leg:typeof outbound)=>{
  if(!card||deal.flight_quality?.status==='CRITICAL_INCOMPLETE')return null;
  const minutes=flightElapsedMinutes(leg.departure,leg.arrival);
  return minutes===null?null:<span className="flight-duration" data-estimated={Boolean(leg.calculated)}>
   {cardCopy[locale].duration}: {destinationInterval(minutes,locale)}{leg.calculated&&` · ${t('szac.')}`}
  </span>;
 };
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
  const estimated=Boolean(arr && f?.outbound_arrival_calculated || deal.trip_type==='ROUND_TRIP' && home && f?.return_arrival_calculated);
  const offerDay=(value:string)=>compactFlightTime(`${value}T12:00:00Z`,'UTC',locale)?.day;
  const segment=(start:typeof out,end:typeof out,from:string,to:string,shift:string|null,estimated?:boolean)=>
   !start && !end ? <>{from} → {to} · {t("brak godziny")}</> :
   <>{start?.day ?? t("Data wylotu do sprawdzenia")}: {from} {start?.time ?? t("brak godziny")} → {to} {end?.time ?? t("brak godziny")}
    {end && (shift || !start || !start.local || !end.local) && <> ({end.day}{shift ? `, ${shift}` : ""})</>}
    {end && estimated && ` · ${t("szac.")}`}</>;
  return <div className="flight-schedule flight-schedule-compact">
   <FlightQualityNotice deal={deal} compact={card} expandedCritical={detail} locale={locale}/>
   <p className="outbound-leg"><strong>{t("Wylot")}</strong> · {card ? `${origin} → ${destination}` : segment(out,arr,origin,destination,outboundShift,outbound.calculated)}<span className="flight-stops">{stopsLabel(outbound.stops,locale)}</span>{duration(outbound)}</p>
   {deal.trip_type==="ROUND_TRIP" && <p className="return-leg"><strong>{t("Powrót")}</strong> · {card ? `${returnOrigin} → ${returnDestination}` : segment(back,home,returnOrigin,returnDestination,returnShift,inbound.calculated)}<span className="flight-stops">{stopsLabel(inbound.stops,locale)}</span>{duration(inbound)}</p>}
   {card && clocks.some(clock=>!clock) && <p>{t('brak godziny')}</p>}
   {card && out && out.day!==offerDay(deal.trip_start) && <p>{t('Wylot')}: {out.day} · {out.time} ({out.local ? t('Godziny lokalne') : t('UTC: strefa nieznana')})</p>}
   {card && deal.trip_type==='ROUND_TRIP' && back && back.day!==offerDay(deal.trip_end) && <p>{t('Wylot powrotny')}: {back.day} · {back.time} ({back.local ? t('Godziny lokalne') : t('UTC: strefa nieznana')})</p>}
   {card && outboundShift && <p>{t('Przylot')}: {destination} · {arr?.day} ({outboundShift})</p>}
   {timeline.arrival && <p className="home-arrival"><strong>{timeline.arrival}</strong></p>}
   {leaveNotice}
   {stayNotice}
   {rankingSummary}
   <ConnectionWarnings deal={deal} locale={locale}/>
   {!card&&<DestinationTimeSummary deal={deal} locale={locale}/>}
   {!card&&!detail&&timeline.nights&&<p className="timeline-nights">{timeline.nights}</p>}
   {(card ? utc || estimated : local || utc) && <p className="schedule-basis">{!card && local && t("Godziny lokalne")}{!card && local && utc && " · "}{utc && t("UTC: strefa nieznana")}
    {estimated && `${!card && local || utc ? ' · ' : ''}${t("Przylot szacowany")}`}</p>}
   {notice&&<p className="flight-route-warning"><strong>{notice}</strong></p>}
   <AirportContextNotice deal={deal} locale={locale}/>
   {!card && <p className="schedule-airline">{airlineLine}</p>}
  </div>;
 }
 return <div className="flight-schedule">
  <p className="deal-note">{t("Godziny lokalne przy znanej strefie lotniska; w pozostałych przypadkach oznaczone UTC.")}</p>
  <p className="outbound-leg"><strong>{t("Wylot")} · {origin}:</strong> {clock(outbound.departure,outbound.originZone)}<br/>
   <strong>{t("Przylot")} · {destination}:</strong> {clock(outbound.arrival,outbound.destinationZone)}{outboundShift && ` · ${outboundShift}`}{outbound.calculated && ` · ${t("obliczony z czasu lotu")}`}<span className="flight-stops">{stopsLabel(outbound.stops,locale)}</span></p>
  {deal.trip_type==="ROUND_TRIP" && <>
   <p className="return-leg"><strong>{t("Wylot powrotny")} · {returnOrigin}:</strong> {clock(inbound.departure,inbound.originZone)}<span className="flight-stops">{stopsLabel(inbound.stops,locale)}</span></p>
   <p className="home-arrival"><strong>{timeline.arrival}</strong><br/>{clock(inbound.arrival,inbound.destinationZone)}</p>
  </>}
  {notice&&<p className="flight-route-warning"><strong>{notice}</strong></p>}
  <AirportContextNotice deal={deal} locale={locale}/>
  {leaveNotice}
  {stayNotice}
  {rankingSummary}
  <ConnectionWarnings deal={deal} locale={locale}/>
  <DestinationTimeSummary deal={deal} locale={locale}/>
  <p className="deal-note">{airlineLine}. {t("Potwierdź rozkład u partnera.")}</p>
 </div>;
}
