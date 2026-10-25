import type {Deal} from './api.ts';

const valid=(value:string|null|undefined)=>!!value&&Number.isFinite(Date.parse(value));
export function offerDeadline(deal:Pick<Deal,'price_freshness'|'last_verified_at'|'expires_at'|'trip_start'|'flight_facts'>):string|null {
 if(valid(deal.price_freshness?.hidden_after))return deal.price_freshness!.hidden_after;
 const candidates=[deal.expires_at,deal.flight_facts?.outbound_departure,
  !deal.flight_facts?.outbound_departure ? `${deal.trip_start}T00:00:00Z` : null];
 if(valid(deal.last_verified_at))candidates.push(new Date(Date.parse(deal.last_verified_at)+48*3600000).toISOString());
 const known=candidates.filter((value):value is string=>valid(value));
 return known.length ? new Date(Math.min(...known.map(value=>Date.parse(value)))).toISOString() : null;
}
