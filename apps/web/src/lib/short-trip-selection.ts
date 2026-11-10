import type {Deal} from './api.ts';
import {tripSelectionEligible} from './trip-selection.ts';
import {stayRecommendationEligible} from './weekend-stay.ts';

export function shortTripSelection(deals:Deal[],origin:string):Deal[] {
 return deals.filter(deal=>{
  const nights=(Date.parse(deal.trip_end)-Date.parse(deal.trip_start))/86400000;
  return tripSelectionEligible(deal) && stayRecommendationEligible(deal) && (!origin || deal.origin_code===origin) &&
   deal.trip_type==='ROUND_TRIP' && Number.isInteger(nights) && nights>=2 && nights<=4;
 }).slice(0,6);
}
