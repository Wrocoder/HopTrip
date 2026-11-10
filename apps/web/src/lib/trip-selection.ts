import type {Deal} from './api.ts';
import {recommendationEligible} from './flight-quality.ts';

// Decisions come from the API policy. A legacy response never proves suitability.
export function tripSelectionEligible(deal:Pick<Deal,'flight_quality'|'trip_quality'>,
 promise:'planning'|'convenient'='planning'):boolean {
 const r=deal.trip_quality?.recommendation;
 if(!recommendationEligible(deal)||deal.trip_quality?.version!=='trip-quality-v1'||r?.version!=='trip-recommendation-v1')return false;
 if(r.warnings_severity==='CRITICAL')return false;
 return promise==='convenient' ? r.recommendation_eligible===true&&r.label==='CONVENIENT'&&r.data_confidence==='COMPLETE'
  : r.planning_eligible===true;
}
