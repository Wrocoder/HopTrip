import Link from "next/link";
import { getDeals } from "../../lib/api";

export const dynamic = "force-dynamic";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string; destination?: string }>;
}) {
  const filters = await searchParams;
  let deals: Awaited<ReturnType<typeof getDeals>> = [];
  let apiUnavailable = false;
  try {
    deals = await getDeals(filters);
  } catch {
    apiUnavailable = true;
  }

  return (
    <main className="page-shell">
      <Link className="back-link" href="/">← Strona główna</Link>
      <section className="page-heading">
        <p className="eyebrow">HopTrip</p>
        <h1>Najlepsze okazje teraz</h1>
        <p className="lead">Loty ocenione na podstawie aktualnej ceny, historii trasy i świeżości danych.</p>
      </section>
      <form className="filters" method="get">
        <label>Skąd <input name="origin" placeholder="WRO" defaultValue={filters.origin ?? ""} maxLength={3} /></label>
        <label>Dokąd <input name="destination" placeholder="barcelona" defaultValue={filters.destination ?? ""} /></label>
        <button type="submit">Filtruj</button>
      </form>
      {apiUnavailable ? (
        <section className="empty-state"><h2>Źródło okazji chwilowo niedostępne</h2><p>Spróbuj ponownie za chwilę.</p></section>
      ) : deals.length === 0 ? (
        <section className="empty-state"><h2>Jeszcze nie ma opublikowanych okazji</h2><p>Nie pokazujemy zmyślonych cen. Lista pojawi się po załadowaniu pierwszych ofert.</p></section>
      ) : (
        <section className="deal-grid" aria-label="Lista okazji">
          {deals.map((deal) => (
            <Link className="deal-card" href={`/deals/${deal.slug}`} key={deal.slug}>
              <div className="deal-card-top"><span>{deal.trip_start}</span><strong>{deal.deal_score}/100</strong></div>
              <h2>Lot z Polski</h2>
              <p className="deal-price">{formatPrice(deal.price_per_person_pln)} <span>za osobę</span></p>
              <p className="deal-meta">{deal.discount_percent ? `${deal.discount_percent}% taniej niż zwykle` : "Nowa obserwacja ceny"}</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
