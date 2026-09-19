export type Deal = {
  slug: string;
  trip_start: string;
  trip_end: string;
  origin_airport_id: number;
  destination_id: number;
  flight_price_pln: number;
  total_estimated_pln: number;
  price_per_person_pln: number;
  historical_baseline_pln: number | null;
  discount_percent: number | null;
  deal_score: number;
  confidence: number;
  explanation: string[];
  status: string;
  last_verified_at: string;
  expires_at: string | null;
};

export type Airport = {
  id: number;
  iata_code: string;
  name: string;
  city: string;
  country_code: string;
  is_active: boolean;
};

export type Destination = {
  id: number;
  city: string;
  country: string;
  country_code: string;
  slug: string;
  is_active: boolean;
};

function apiUrl(path: string): string {
  const baseUrl = process.env.HOPTRIP_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export async function getDeals(filters: { origin?: string; destination?: string } = {}): Promise<Deal[]> {
  const params = new URLSearchParams();
  if (filters.origin) params.set("origin", filters.origin.toUpperCase());
  if (filters.destination) params.set("destination", filters.destination);
  const query = params.toString();
  const response = await fetch(apiUrl(`/api/v1/deals${query ? `?${query}` : ""}`), { cache: "no-store" });
  if (!response.ok) throw new Error(`HopTrip API returned ${response.status}`);
  return response.json() as Promise<Deal[]>;
}

export async function getDeal(slug: string): Promise<Deal | null> {
  const response = await fetch(apiUrl(`/api/v1/deals/${encodeURIComponent(slug)}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HopTrip API returned ${response.status}`);
  return response.json() as Promise<Deal>;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), { cache: "no-store" });
  if (!response.ok) throw new Error(`HopTrip API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getAirports(): Promise<Airport[]> {
  return getJson<Airport[]>("/api/v1/airports");
}

export async function getDestinations(): Promise<Destination[]> {
  return getJson<Destination[]>("/api/v1/destinations");
}

export async function getDepartureDeals(iataCode: string): Promise<Deal[]> {
  return getJson<Deal[]>(`/api/v1/departures/${encodeURIComponent(iataCode)}/deals`);
}

export async function getDestinationDeals(slug: string): Promise<Deal[]> {
  return getJson<Deal[]>(`/api/v1/destinations/${encodeURIComponent(slug)}/deals`);
}
