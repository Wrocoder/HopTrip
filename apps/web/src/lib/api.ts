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

function apiUrl(path: string): string {
  const baseUrl = process.env.HOPTRIP_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export async function getDeals(): Promise<Deal[]> {
  const response = await fetch(apiUrl("/api/v1/deals"), { cache: "no-store" });
  if (!response.ok) throw new Error(`HopTrip API returned ${response.status}`);
  return response.json() as Promise<Deal[]>;
}

export async function getDeal(slug: string): Promise<Deal | null> {
  const response = await fetch(apiUrl(`/api/v1/deals/${encodeURIComponent(slug)}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HopTrip API returned ${response.status}`);
  return response.json() as Promise<Deal>;
}
