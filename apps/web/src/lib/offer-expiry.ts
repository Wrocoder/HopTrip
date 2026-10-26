import type {Deal} from './api.ts';

const valid=(value:string|null|undefined)=>!!value&&Number.isFinite(Date.parse(value));
export function offerDeadline(deal:Pick<Deal,'price_freshness'|'last_verified_at'|'expires_at'|'trip_start'|'flight_facts'>):string|null {
 if(valid(deal.price_freshness?.hidden_after))return deal.price_freshness!.hidden_after;
 const candidates=[deal.expires_at,deal.flight_facts?.outbound_departure,
  !deal.flight_facts?.outbound_departure ? `${deal.trip_start}T00:00:00Z` : null];
 if(valid(deal.last_verified_at)){
  const observed=Date.parse(deal.last_verified_at),hour=3600000;
  const departure=Date.parse(deal.flight_facts?.outbound_departure||`${deal.trip_start}T00:00:00Z`);
  candidates.push(new Date(observed+48*hour).toISOString());
  if(Number.isFinite(departure))candidates.push(
   new Date(Math.max(observed+24*hour,departure-30*24*hour)).toISOString(),
   new Date(Math.max(observed+6*hour,departure-7*24*hour)).toISOString());
 }
 const known=candidates.filter((value):value is string=>valid(value));
 return known.length ? new Date(Math.min(...known.map(value=>Date.parse(value)))).toISOString() : null;
}
