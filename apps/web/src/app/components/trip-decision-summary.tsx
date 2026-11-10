import type {Deal} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {timelineView} from '../../lib/trip-timeline';
import {tripQualitySummary,recommendationCopy} from '../../lib/trip-quality';
import {tripDecisionRisks} from '../../lib/trip-decision';
import {FlightQualityNotice} from './flight-quality';
import {compactFlightTime} from '../../lib/flight-facts';

export function TripDecisionSummary({deal,locale}:{deal:Deal;locale:Locale}){
 const timeline=timelineView(deal,locale),summary=tripQualitySummary(deal,locale),risks=tripDecisionRisks(deal,locale);
 const home=compactFlightTime(deal.flight_facts?.return_arrival,deal.flight_facts?.return_destination_timezone,locale);
 return <div className="trip-decision-summary">
  {timeline.arrival&&<p className="home-arrival"><strong>{timeline.arrival}{home&&` · ${home.time}${home.local?'':' UTC'}`}</strong></p>}
  {summary&&<p className="trip-quality-summary"><strong>{summary}</strong></p>}
  {(summary!==recommendationCopy[locale].INSUFFICIENT_DATA||deal.flight_quality?.status!=='PARTIAL')&&<FlightQualityNotice deal={deal} locale={locale} compact expandedCritical/>}
  {risks.length>0&&<ul className="trip-decision-risks" data-decision-risks>{risks.map(risk=><li key={risk}>{risk}</li>)}</ul>}
 </div>;
}
