export type Component = {id:number; component_type:string; price_pln:string|null; available:boolean; reason:string; redirect_path:string|null};
export type Deal = {
  id:number; slug:string; trip_start:string; trip_end:string; origin_airport_id:number; destination_id:number;
  origin_code:string; origin_city:string; destination_city:string; destination_slug:string;
  trip_type:"ONE_WAY"|"ROUND_TRIP"; price_basis:string; components:Component[];
  flight_price_pln:string|null; hotel_price_pln:string|null; total_estimated_pln:string; price_per_person_pln:string;
  historical_baseline_pln:string|null; discount_percent:string|null; deal_score:number; confidence:string;
  explanation_codes:string[]; score_version:string; score_components:Record<string,number>;
  last_verified_at:string; expires_at:string|null;
};
export type Airport = {id:number; iata_code:string; name:string; city:string; country_code:string; is_active:boolean};
export type Destination = {id:number; city:string; country:string; country_code:string; slug:string; is_active:boolean};
export type Filters = Partial<Record<"origin"|"destination"|"departure_from"|"departure_to"|"budget"|"duration_min"|"duration_max"|"offset"|"limit",string>>;
export class ApiError extends Error { constructor(public status:number) {super("Catalog unavailable");} }
function apiUrl(path:string) {
  return (process.env.HOPTRIP_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/,"") + path;
}
async function getJson<T>(path:string):Promise<T> {
  const response = await fetch(apiUrl(path), {cache:"no-store", signal:AbortSignal.timeout(8000)});
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
export async function getDeals(filters:Filters = {}):Promise<Deal[]> {
  const params = new URLSearchParams();
  for (const key of ["origin","destination","departure_from","departure_to","budget","duration_min","duration_max","offset","limit"] as const) {
    const value=filters[key];
    if (value) params.set(key, key === "origin" ? value.toUpperCase() : value);
  }
  return getJson("/api/v1/deals?" + params);
}
export async function getDeal(slug:string):Promise<Deal|null> {
  try { return await getJson<Deal>("/api/v1/deals/" + encodeURIComponent(slug)); }
  catch(error) {if (error instanceof ApiError && error.status === 404) return null; throw error;}
}
export const getAirports = () => getJson<Airport[]>("/api/v1/airports");
export const getDestinations = () => getJson<Destination[]>("/api/v1/destinations");
export const getDepartureDeals = (code:string) => getDeals({origin:code});
export const getDestinationDeals = (slug:string) => getDeals({destination:slug});
