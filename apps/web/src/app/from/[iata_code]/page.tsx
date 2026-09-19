import type { Metadata } from "next";
import Link from "next/link";
import { getAirports, getDepartureDeals } from "../../../lib/api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ iata_code: string }> };

async function loadAirport(iataCode: string) {
  const airports = await getAirports();
  return airports.find((airport) => airport.iata_code === iataCode.toUpperCase()) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iata_code } = await params;
  try {
    const airport = await loadAirport(iata_code);
    if (airport) {
      return {
        title: `Tanie loty z ${airport.city} (${airport.iata_code}) | HopTrip`,
        description: `Aktualne okazje podróżnicze z lotniska ${airport.city}.`,
      };
    }
  } catch {
    // Runtime page still returns a useful fallback when the API is unavailable.
  }
  return { title: `Tanie loty z ${iata_code.toUpperCase()} | HopTrip` };
}

export default async function DeparturePage({ params }: Props) {
  const { iata_code } = await params;
  const code = iata_code.toUpperCase();
  let airport = null;
  let deals: Awaited<ReturnType<typeof getDepartureDeals>> = [];
  let unavailable = false;
  try {
    airport = await loadAirport(code);
    if (!airport) return <NotFoundAirport code={code} />;
    deals = await getDepartureDeals(code);
  } catch {
    unavailable = true;
  }

  return (
    <main className="page-shell catalog-page">
      <Link className="back-link" href="/">← Strona główna</Link>
      <section className="seo-intro">
        <p className="eyebrow">Wylot z Polski</p>
        <h1>Tanie loty z {airport?.city ?? code}</h1>
        <p className="lead">Sprawdzaj okazje z lotniska {code}, ocenione na podstawie ceny, historii trasy i świeżości danych.</p>
      </section>
      {unavailable ? <EmptyState title="Źródło okazji chwilowo niedostępne" /> : <DealResults deals={deals} />}
    </main>
  );
}

function DealResults({ deals }: { deals: Awaited<ReturnType<typeof getDepartureDeals>> }) {
  if (deals.length === 0) return <EmptyState title="Brak aktywnych okazji z tego lotniska" />;
  return <p className="muted">Znaleziono {deals.length} aktywnych okazji.</p>;
}

function EmptyState({ title }: { title: string }) {
  return <section className="empty-state"><h2>{title}</h2><p>Nie pokazujemy zmyślonych cen. Wróć później, gdy pojawią się świeże dane.</p></section>;
}

function NotFoundAirport({ code }: { code: string }) {
  return <section className="empty-state"><h1>Nie znaleziono lotniska {code}</h1><p>Sprawdź kod IATA i wybierz jedno z obsługiwanych lotnisk.</p></section>;
}
