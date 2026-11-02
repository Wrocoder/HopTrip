import type {Deal} from './api.ts';
import {recommendationEligible} from './flight-quality.ts';

export function shortTripSelection(deals:Deal[],origin:string):Deal[] {
 return deals.filter(deal=>{
  const nights=(Date.parse(deal.trip_end)-Date.parse(deal.trip_start))/86400000;
  return recommendationEligible(deal) && (!origin || deal.origin_code===origin) &&
   deal.trip_type==='ROUND_TRIP' && Number.isInteger(nights) && nights>=2 && nights<=4;
 }).slice(0,6);
}
