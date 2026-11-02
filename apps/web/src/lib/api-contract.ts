import type {Airport,Deal,DealResults,Destination} from './api';
import type {EventFlightFit} from './event-flight-fit';
import {validCalendarDate} from './calendar-date.ts';

type Check=(value:unknown)=>boolean;
const text:Check=v=>typeof v==='string';
const bool:Check=v=>typeof v==='boolean';
const number:Check=v=>typeof v==='number'&&Number.isFinite(v);
const integer:Check=v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=0;
const decimal:Check=v=>typeof v==='string'&&/^-?\d+(?:\.\d+)?$/.test(v)&&Number.isFinite(Number(v));
const calendar:Check=v=>typeof v==='string'&&validCalendarDate(v);
const timestamp:Check=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const nullable=(check:Check):Check=>v=>v===null||check(v);
const array=(check:Check):Check=>v=>Array.isArray(v)&&v.every(check);
const oneOf=(...values:unknown[]):Check=>v=>values.includes(v);
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
// Allow additive fields; leave absent optional data unknown. Invalid present
// fields fail the response instead of being replaced with fabricated values.
function shape(v:unknown,required:Record<string,Check>,optional:Record<string,Check>={}):v is Record<string,unknown>{
 return object(v)&&Object.entries(required).every(([key,check])=>check(v[key]))&&
  Object.entries(optional).every(([key,check])=>v[key]===undefined||check(v[key]));
}
const basis=nullable(oneOf('SOURCE','FIRST_SEEN'));
const component:Check=v=>shape(v,{id:integer,component_type:text,price_pln:nullable(decimal),available:bool,reason:text,redirect_path:nullable(text)},{partner_name:nullable(text)});
const leg:Check=v=>shape(v,{origin_airport:text,destination_airport:text,departure:timestamp,arrival:timestamp},
 {origin_timezone:nullable(text),destination_timezone:nullable(text),airline_code:nullable(text),airline_name:nullable(text),flight_number:nullable(text)});
const facts:Check=v=>shape(v,{
 origin_airport:nullable(text),destination_airport:nullable(text),destination_code:nullable(text),airline_code:nullable(text),outbound_stops:nullable(integer),return_stops:nullable(integer),
 outbound_departure:nullable(timestamp),outbound_arrival:nullable(timestamp),return_departure:nullable(timestamp),return_arrival:nullable(timestamp),destination_interval_minutes:nullable(integer),
},{outbound_legs:array(leg),return_legs:array(leg),origin_timezone:nullable(text),destination_timezone:nullable(text),airline_name:nullable(text),outbound_arrival_calculated:bool,return_arrival_calculated:bool,
 return_origin_airport:nullable(text),return_destination_airport:nullable(text),return_origin_timezone:nullable(text),return_destination_timezone:nullable(text)});
const quality:Check=v=>shape(v,{version:oneOf('flight-quality-v1'),status:oneOf('COMPLETE','PARTIAL','CRITICAL_INCOMPLETE'),reasons:array(text),recommendation_eligible:bool});
const freshness:Check=v=>shape(v,{observed_at:nullable(timestamp),observation_basis:basis,fetched_at:nullable(timestamp),availability_checked_at:nullable(timestamp),hidden_after:nullable(timestamp),max_age_hours:integer});
const explanation:Check=v=>shape(v,{
 status:oneOf('CURRENT','PROVISIONAL','LEGACY','UNAVAILABLE'),parts:array(x=>shape(x,{key:text,points:decimal,max_points:integer})),total_before_rounding:nullable(decimal),sample_count:nullable(integer),
 current_price_pln:nullable(decimal),median_price_pln:nullable(decimal),price_difference_percent:nullable(decimal),observed_at:nullable(timestamp),calculated_at:nullable(timestamp),observation_basis:basis,
});
export function isDeal(v:unknown):v is Deal{
 return shape(v,{
  id:integer,slug:text,trip_start:calendar,trip_end:calendar,origin_airport_id:integer,destination_id:integer,origin_code:text,origin_city:text,destination_city:text,destination_slug:text,
  trip_type:oneOf('ONE_WAY','ROUND_TRIP'),price_basis:text,components:array(component),flight_price_pln:nullable(decimal),hotel_price_pln:nullable(decimal),total_estimated_pln:decimal,price_per_person_pln:decimal,
  historical_baseline_pln:nullable(decimal),discount_percent:nullable(decimal),deal_score:number,confidence:decimal,explanation_codes:array(text),score_version:text,score_components:object,last_verified_at:timestamp,expires_at:nullable(timestamp),
 },{destination_country_code:text,events_supported:bool,flight_quality:quality,price_freshness:freshness,flight_facts:facts,score_explanation:explanation});
}
export const isDeals=(v:unknown):v is Deal[]=>array(isDeal)(v);
export function isDealResults(v:unknown):v is DealResults{
 return shape(v,{items:isDeals,total:integer,offset:x=>integer(x)&&Number(x)<=10000,limit:x=>integer(x)&&Number(x)>=1&&Number(x)<=100})&&
  Array.isArray(v.items)&&v.items.length<=Number(v.limit)&&(v.items.length===0||Number(v.offset)+v.items.length<=Number(v.total));
}
export const isAirports=(v:unknown):v is Airport[]=>array(x=>shape(x,{id:integer,iata_code:text,name:text,city:text,country_code:text,is_active:bool},{aliases:array(text)}))(v);
export const isDestinations=(v:unknown):v is Destination[]=>array(x=>shape(x,{id:integer,city:text,country:text,country_code:text,slug:text,is_active:bool},{display_name:text,aliases:array(text),iata_codes:array(text)}))(v);
export const isAlertStatus=(v:unknown):v is {enabled:boolean;delivery_enabled?:boolean}=>shape(v,{enabled:bool},{delivery_enabled:bool})&&(!v.delivery_enabled||v.enabled===true);

export type TicketOption={id:string;name:string;ticket_kind:'STANDARD'|'PREMIUM';url:string;price_from:string|null;currency:string|null;status?:string};
export type EventItem={id:string;name:string;category:'MUSIC'|'SPORTS'|'CULTURE'|'OTHER';venue:string;city:string;start_date:string;end_date:string|null;local_time:string|null;timezone:string;status:string;url:string;price_from:string|null;currency:string|null;ticket_options?:TicketOption[]};
export type EventResults={status:string;events:EventItem[];checked_at?:string|null;partial?:boolean;flight_fit?:Record<string,EventFlightFit>;total?:number;page?:number;page_size?:number;has_more?:boolean};
const currency:Check=v=>v===null||(typeof v==='string'&&/^[A-Z]{3}$/.test(v));
const clock:Check=v=>v===null||(typeof v==='string'&&/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?$/.test(v)&&Number(v.slice(0,2))<24&&Number(v.slice(3,5))<60&&(!v.slice(6)||Number(v.slice(6))<60));
const ticket:Check=v=>shape(v,{id:text,name:text,ticket_kind:oneOf('STANDARD','PREMIUM'),url:text,price_from:nullable(decimal),currency},{status:text});
const event:Check=v=>shape(v,{id:text,name:text,category:oneOf('MUSIC','SPORTS','CULTURE','OTHER'),venue:text,city:text,start_date:calendar,end_date:nullable(calendar),local_time:clock,timezone:text,status:text,url:text,price_from:nullable(decimal),currency},{ticket_options:array(ticket)});
const fit:Check=v=>shape(v,{status:oneOf('CONFLICT','TIGHT','CHECK','NO_KNOWN_CONFLICT'),reasons:array(text)},
 {buffer_minutes:integer,arrival_gap_minutes:nullable(number),return_gap_minutes:nullable(number),return_start_gap_minutes:nullable(number),duration_minutes:nullable(integer),arrival_airport:nullable(text),return_airport:nullable(text),arrival_estimated:bool});
export function isEventResults(v:unknown):v is EventResults{
 if(!shape(v,{status:oneOf('READY','EMPTY','UNAVAILABLE','NEEDS_DATES','DISABLED','UNSUPPORTED'),events:array(event)},
  {checked_at:nullable(text),partial:bool,flight_fit:x=>object(x)&&Object.values(x).every(fit),total:integer,page:x=>integer(x)&&Number(x)>=1&&Number(x)<=84,page_size:x=>integer(x)&&Number(x)>=1,has_more:bool}))return false;
 const count=(v.events as unknown[]).length;
 return (v.page_size===undefined||count<=Number(v.page_size))&&(v.total===undefined||count===0||(Number(v.page??1)-1)*Number(v.page_size??12)+count<=Number(v.total));
}

export type AlertSettings={origin:string;budget:string;duration_min:number;duration_max:number;destination:string|null;departure_from:string|null;departure_to:string|null;weekend:boolean;frequency:'weekly'|'daily'};
export function isAlertReply(path:string,v:unknown):boolean{
 if(path==='/confirm')return shape(v,{token:x=>typeof x==='string'&&x.trim().length>0});
 if(path==='/unsubscribe')return shape(v,{status:oneOf('STOPPED')});
 if(path==='')return shape(v,{message:text});
 return path==='/manage'&&shape(v,{status:oneOf('PENDING','ACTIVE','STOPPED'),filters:x=>shape(x,{
  origin:text,budget:decimal,duration_min:integer,duration_max:integer,destination:nullable(text),departure_from:nullable(calendar),departure_to:nullable(calendar),weekend:bool,frequency:oneOf('weekly','daily'),
 })&&Number(x.duration_min)<=Number(x.duration_max)&&Number(x.duration_max)<=365&&!(typeof x.departure_from==='string'&&typeof x.departure_to==='string'&&x.departure_from>x.departure_to)});
}

