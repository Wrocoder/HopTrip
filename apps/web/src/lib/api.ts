import {isAirports,isAlertStatus,isDeal,isDealResults,isDeals,isDestinations} from './api-contract';

export type Component = {id:number; component_type:string; price_pln:string|null; available:boolean; reason:string; redirect_path:string|null; partner_name?:string|null};
export type ScoreExplanation = {
  status:"CURRENT"|"PROVISIONAL"|"LEGACY"|"UNAVAILABLE";
  parts:{key:string;points:string;max_points:number}[];
  total_before_rounding:string|null; sample_count:number|null;
  current_price_pln:string|null; median_price_pln:string|null; price_difference_percent:string|null;
  observed_at:string|null; calculated_at:string|null; observation_basis:"SOURCE"|"FIRST_SEEN"|null;
};
export type FlightLeg = {
  origin_airport:string; destination_airport:string;
  origin_timezone:string|null; destination_timezone:string|null;
  departure:string; arrival:string;
  airline_code:string|null; airline_name:string|null; flight_number:string|null;
};
export type FlightFacts = {
  outbound_legs?:FlightLeg[]; return_legs?:FlightLeg[];
  origin_timezone?:string|null; destination_timezone?:string|null; airline_name?:string|null;
  outbound_arrival_calculated?:boolean; return_arrival_calculated?:boolean;
  origin_airport:string|null; destination_airport:string|null; destination_code:string|null;
  return_origin_airport?:string|null; return_destination_airport?:string|null;
  return_origin_timezone?:string|null; return_destination_timezone?:string|null;
  airline_code:string|null; outbound_stops:number|null; return_stops:number|null;
  outbound_departure:string|null; outbound_arrival:string|null;
  return_departure:string|null; return_arrival:string|null;
  destination_interval_minutes:number|null;
};
export type FlightQualityReason = "UNVERIFIED_SOURCE"|"MISSING_ORIGIN"|"MISSING_DESTINATION"|"MISSING_RETURN_AIRPORTS"|
  "MISSING_DATES"|"INVALID_DATES"|"AIRPORT_MISMATCH"|"INVALID_DURATION"|"CONFLICTING_METADATA"|
  "MISSING_TIMES"|"ESTIMATED_TIMES"|"UNKNOWN_TIMEZONE"|"UNKNOWN_STOPS"|"UNKNOWN_CARRIER";
export type FlightQuality = {version:"flight-quality-v1";status:"COMPLETE"|"PARTIAL"|"CRITICAL_INCOMPLETE";
  reasons:FlightQualityReason[];recommendation_eligible:boolean};
export type Deal = {
  flight_quality?:FlightQuality;
  price_freshness?:PriceFreshness;
  flight_facts?:FlightFacts;
  id:number; slug:string; trip_start:string; trip_end:string; origin_airport_id:number; destination_id:number;
  origin_code:string; origin_city:string; destination_city:string; destination_slug:string;
  destination_country_code?:string;
  events_supported?:boolean;
  trip_type:"ONE_WAY"|"ROUND_TRIP"; price_basis:string; components:Component[];
  flight_price_pln:string|null; hotel_price_pln:string|null; total_estimated_pln:string; price_per_person_pln:string;
  historical_baseline_pln:string|null; discount_percent:string|null; deal_score:number; confidence:string;
  explanation_codes:string[]; score_version:string; score_components:Record<string,unknown>;
  score_explanation?:ScoreExplanation;
  last_verified_at:string; expires_at:string|null;
};
export type Airport = {id:number; iata_code:string; name:string; city:string; country_code:string; is_active:boolean;aliases?:string[]};
export type PriceFreshness={observed_at:string|null;observation_basis:"SOURCE"|"FIRST_SEEN"|null;
  fetched_at:string|null;availability_checked_at:string|null;hidden_after:string|null;max_age_hours:number};
export type Destination = {display_name?:string;aliases?:string[];iata_codes?:string[];id:number; city:string; country:string; country_code:string; slug:string; is_active:boolean};
export type Filters = Partial<Record<"origin"|"destination"|"departure_from"|"departure_to"|"budget"|"duration_min"|"duration_max"|"weekend"|"offset"|"limit"|"sort"|"round_trip",string>>;
export class ApiError extends Error { constructor(public status:number,public code?:string) {super("Catalog unavailable");} }
function apiUrl(path:string) {
  return (process.env.HOPTRIP_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/,"") + path;
}
async function getJson<T>(path:string,valid:(value:unknown)=>value is T):Promise<T> {
  let response:Response;
  try {response=await fetch(apiUrl(path), {cache:"no-store", signal:AbortSignal.timeout(8000)});}
  catch(error){const timeout=error instanceof Error&&['TimeoutError','AbortError'].includes(error.name);
    throw new ApiError(timeout?504:0,timeout?'TIMEOUT':'NETWORK_ERROR');}
  if (!response.ok) {
    const body=await response.json().catch(()=>null);
    throw new ApiError(response.status,typeof body?.detail?.code === "string" ? body.detail.code : undefined);
  }
  let body:unknown;
  try {body=await response.json();}
  catch(error){const timeout=error instanceof Error&&['TimeoutError','AbortError'].includes(error.name);
    throw new ApiError(timeout?504:502,timeout?'TIMEOUT':'INVALID_RESPONSE');}
  if(!valid(body))throw new ApiError(502,'INVALID_RESPONSE');
  return body;
}
function dealParams(filters:Filters):URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ["origin","destination","departure_from","departure_to","budget","duration_min","duration_max","weekend","offset","limit","sort","round_trip"] as const) {
    const value=filters[key];
    if (value) params.set(key, key === "origin" ? value.toUpperCase() : value);
  }
  return params;
}
export async function getDeals(filters:Filters = {}):Promise<Deal[]> {
  return getJson("/api/v1/deals?" + dealParams(filters),isDeals);
}
export type DealResults = {items:Deal[];total:number;offset:number;limit:number};
export async function getDealResults(filters:Filters = {}):Promise<DealResults> {
  const params=dealParams(filters);
  params.set("include_total","true");
  const result=await getJson("/api/v1/deals?" + params,isDealResults);
  if(result.offset!==Number(filters.offset??0)||(filters.limit&&result.limit!==Number(filters.limit)))throw new ApiError(502,'INVALID_RESPONSE');
  return result;
}
export async function getDeal(slug:string):Promise<Deal|null> {
  try { return await getJson("/api/v1/deals/" + encodeURIComponent(slug),isDeal); }
  catch(error) {if (error instanceof ApiError && error.status === 404) return null; throw error;}
}
export const getAirports = () => getJson("/api/v1/airports",isAirports);
export const alertStatus = async () => {
  try {return await getJson("/api/v1/alerts/status",isAlertStatus);}
  catch {return {enabled:false,delivery_enabled:false};}
};
export const alertsEnabled = async () => (await alertStatus()).enabled;
export const getDestinations = () => getJson("/api/v1/destinations",isDestinations);
export const getDepartureDeals = (code:string) => getDeals({origin:code});
export const getDestinationDeals = (slug:string) => getDeals({destination:slug});
