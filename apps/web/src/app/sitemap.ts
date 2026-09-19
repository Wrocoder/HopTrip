import type { MetadataRoute } from "next";
import { getAirports, getDestinations } from "../lib/api";

export const dynamic = "force-dynamic";

const fallbackAirports = ["WRO", "WAW", "KRK", "GDN"];

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/deals`, changeFrequency: "hourly", priority: 0.9 },
  ];

  try {
    const airports = await getAirports();
    for (const airport of airports) {
      entries.push({
        url: `${baseUrl}/from/${airport.iata_code}`,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch {
    for (const iataCode of fallbackAirports) {
      entries.push({ url: `${baseUrl}/from/${iataCode}`, changeFrequency: "daily", priority: 0.8 });
    }
  }

  try {
    const destinations = await getDestinations();
    for (const destination of destinations) {
      entries.push({
        url: `${baseUrl}/destinations/${destination.slug}`,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch {
    // Destination pages are added as soon as the catalog becomes available.
  }

  return entries;
}
