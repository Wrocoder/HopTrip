import type { Metadata } from "next";
import Link from "next/link";
import { getDestinationDeals, getDestinations } from "../../../lib/api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function loadDestination(slug: string) {
  const destinations = await getDestinations();
  return destinations.find((destination) => destination.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const destination = await loadDestination(slug);
    if (destination) {
      return {
        title: `Tanie loty do ${destination.city} | HopTrip`,
        description: `Aktualne okazje podróżnicze do ${destination.city} z polskich lotnisk.`,
      };
    }
  } catch {
    // Runtime page still returns a useful fallback when the API is unavailable.
  }
  return { title: `Tanie loty do ${slug} | HopTrip` };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  let destination = null;
  let deals: Awaited<ReturnType<typeof getDestinationDeals>> = [];
  let unavailable = false;
  try {
    destination = await loadDestination(slug);
    if (!destination) return <NotFoundDestination slug={slug} />;
    deals = await getDestinationDeals(slug);
  } catch {
    unavailable = true;
  }

  return (
    <main className="page-shell catalog-page">
      <Link className="back-link" href="/">← Strona główna</Link>
      <section className="seo-intro">
        <p className="eyebrow">Kierunek podróży</p>
        <h1>Tanie loty do {destination?.city ?? slug}</h1>
        <p className="lead">Porównuj aktualne okazje do {destination?.city ?? slug} z polskich lotnisk.</p>
      </section>
      {unavailable ? <EmptyState title="Źródło okazji chwilowo niedostępne" /> : <DealResults count={deals.length} />}
    </main>
  );
}

function DealResults({ count }: { count: number }) {
  if (count === 0) return <EmptyState title="Brak aktywnych okazji do tego kierunku" />;
  return <p className="muted">Znaleziono {count} aktywnych okazji.</p>;
}

function EmptyState({ title }: { title: string }) {
  return <section className="empty-state"><h2>{title}</h2><p>Nie pokazujemy zmyślonych cen. Wróć później, gdy pojawią się świeże dane.</p></section>;
}

function NotFoundDestination({ slug }: { slug: string }) {
  return <section className="empty-state"><h1>Nie znaleziono kierunku {slug}</h1><p>Wybierz kierunek z katalogu HopTrip.</p></section>;
}
