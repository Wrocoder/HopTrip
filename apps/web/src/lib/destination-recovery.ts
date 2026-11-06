import {getDeals,alertStatus,type Deal,type Destination} from './api';
import {recommendationEligible} from './flight-quality.ts';
import {offerDeadline} from './offer-expiry.ts';
import {moneyInGrosz} from './trip-budget.ts';

export const destinationRecoveryThreshold=1;
export const destinationCandidateLimit=100,destinationAlternativeLimit=3;
export type DestinationRecoveryData={status:'READY'|'EMPTY'|'ERROR';offers:Deal[];alertsActive:boolean};
export function destinationAlternatives(target:Destination,destinations:readonly Destination[],items:readonly Deal[],now:number):Deal[]{
 const registry=new Map(destinations.filter(item=>item.is_active).map(item=>[item.slug,item]));
 const valid=items.slice(0,destinationCandidateLimit).filter(deal=>{
  const destination=registry.get(deal.destination_slug),deadline=offerDeadline(deal);
  const departure=Date.parse(deal.flight_facts?.outbound_departure??`${deal.trip_start}T00:00:00Z`);
  return destination&&destination.id===deal.destination_id&&destination.slug!==target.slug&&
   recommendationEligible(deal)&&deal.trip_type==='ROUND_TRIP'&&moneyInGrosz(deal.price_per_person_pln)!=null&&
   deadline&&Date.parse(deadline)>now&&Number.isFinite(departure)&&departure>now;
 });
 const sameCountry=(deal:Deal)=>registry.get(deal.destination_slug)?.country_code===target.country_code&&/^[A-Z]{2}$/.test(target.country_code)&&target.country_code!=='ZZ';
 valid.sort((a,b)=>Number(sameCountry(b))-Number(sameCountry(a))||moneyInGrosz(a.price_per_person_pln)!-moneyInGrosz(b.price_per_person_pln)!||a.trip_start.localeCompare(b.trip_start)||a.id-b.id);
 const selected:Deal[]=[],cities=new Set<string>(),ids=new Set<number>(),slugs=new Set<string>();
 for(const deal of valid){
  if(cities.has(deal.destination_slug)||ids.has(deal.id)||slugs.has(deal.slug))continue;
  cities.add(deal.destination_slug);ids.add(deal.id);slugs.add(deal.slug);selected.push(deal);
  if(selected.length===destinationAlternativeLimit)break;
 }
 return selected;
}
export async function loadDestinationRecovery(target:Destination,destinations:readonly Destination[],now=Date.now()):Promise<DestinationRecoveryData>{
 const [catalog,alerts]=await Promise.allSettled([getDeals({round_trip:'true',sort:'price',limit:String(destinationCandidateLimit)}),alertStatus()]);
 const alertsActive=alerts.status==='fulfilled'&&alerts.value.enabled&&alerts.value.delivery_enabled===true;
 if(catalog.status==='rejected')return {status:'ERROR',offers:[],alertsActive};
 const offers=destinationAlternatives(target,destinations,catalog.value,now);
 return {status:offers.length?'READY':'EMPTY',offers,alertsActive};
}
