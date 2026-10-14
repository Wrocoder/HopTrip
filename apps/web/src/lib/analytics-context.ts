import type {Airport,Destination,Filters} from "./api";
export const sources=["homepage","google","facebook","instagram","newsletter","direct","test"];
export const campaigns=["hoptrip-launch","wro-weekend","test"];
export const campaignLabel=(value:string|null|undefined)=>campaigns.includes(value??"") ? value! : undefined;
export const sourceLabel=(value:string|null|undefined)=>sources.includes(value??"") ? value! : undefined;
export type SearchContext={filters:Filters;result_count?:number;error?:"invalid_filters"|"unavailable"};
export type PartnerContext={category:"flight"|"stay"|"activity";provider:"catalog"|"stay22"|"tiqets"};
export type EventContext={search?:SearchContext;partner?:PartnerContext};
export function analyticsFilters(filters:Filters,airports:Airport[],destinations:Destination[]):Filters {
 const result:Filters={};
 if(airports.some(a=>a.iata_code===filters.origin))result.origin=filters.origin;
 if(destinations.some(d=>d.slug===filters.destination))result.destination=filters.destination;
 for(const key of ["departure_from","departure_to"] as const) {
  const value=filters[key];
  if(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value)result[key]=value;
 }
 for(const [key,max] of [["budget",1000000],["duration_min",365],["duration_max",365],["offset",10000]] as const) {
  const value=filters[key];
  if(value && /^\d+(\.\d{1,2})?$/.test(value) && Number(value)<=max && (key==="budget"||Number.isInteger(Number(value))))result[key]=value;
 }
 if(filters.weekend==="true")result.weekend="true";
 return result;
}
