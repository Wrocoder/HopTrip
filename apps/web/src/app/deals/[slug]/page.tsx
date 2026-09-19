import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeal } from "../../../lib/api";

export const dynamic = "force-dynamic";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
}

export default async function DealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await getDeal(slug);
  if (!deal) notFound();

  return (
    <main className="page-shell">
      <Link className="back-link" href="/deals">← Wszystkie okazje</Link>
      <article className="deal-detail">
        <p className="eyebrow">Lotnicza okazja</p>
        <h1>Wyjazd {deal.trip_start}</h1>
        <p className="deal-price large">{formatPrice(deal.price_per_person_pln)} <span>za osobę</span></p>
        <div className="deal-facts"><span>Deal Score <strong>{deal.deal_score}/100</strong></span><span>Aktualność <strong>{new Date(deal.last_verified_at).toLocaleDateString("pl-PL")}</strong></span></div>
        <h2>Dlaczego warto</h2>
        <ul>{deal.explanation.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="muted">Cena dotyczy lotu. Koszt noclegu nie jest dodawany bez potwierdzonej oferty.</p>
      </article>
    </main>
  );
}
