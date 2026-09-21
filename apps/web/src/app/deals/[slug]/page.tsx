import {notFound} from "next/navigation";
import Link from "next/link";
import {getDeal} from "../../../lib/api";
import {pl,money,date} from "../../../lib/pl";
import {DealViewTracker} from "../../components/deal-view-tracker";
import {Outbound} from "../../components/outbound";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props) {
  const {slug}=await params;
  const deal=await getDeal(slug);
  return {title:deal ? `${deal.origin_city} → ${deal.destination_city} | HopTrip` : pl.notFound,
    alternates:{canonical:`/deals/${encodeURIComponent(slug)}`},
    robots:{index:false,follow:true}};
}
export default async function DealPage({params}:Props) {
  const deal=await getDeal((await params).slug);
  if (!deal) notFound();
  return <main className="page-shell"><Link className="back-link" href="/deals">← {pl.deals}</Link><article className="offer-detail">
    <DealViewTracker dealSlug={deal.slug}/>
    <header className="page-heading"><p className="eyebrow">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</p><h1>{deal.origin_city} ({deal.origin_code}) → {deal.destination_city}</h1>
    <p className="lead">{date(deal.trip_start)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end)}`}</p></header>
    <div className="detail-layout"><section className="featured-card detail-summary" aria-label="Cena lotu"><p className="eyebrow">{pl.perPerson} · PLN</p>
    <p className="deal-price">{money(deal.price_per_person_pln)} <span>{pl.perPerson}</span></p>
    <p>{pl.flightOnly}</p><p>{pl.cached}</p>
    <p>{pl.checked}: <time dateTime={deal.last_verified_at}>{date(deal.last_verified_at)}</time></p>
    </section><section className="booking-card" aria-label="Przejście do partnera"><span className="badge">{pl.partners}</span>
    {deal.components.length ? deal.components.map(c=><section className="booking-component" key={c.id}><p className="booking-price">{money(c.price_pln)}</p><Outbound component={c}/></section>) : <p>{pl.noLink}</p>}
    <p className="muted">{pl.disclosure}</p></section></div>
    <section className="rationale"><div className="section-heading"><h2>{pl.why}</h2><span className="score-badge">{pl.score}: {deal.deal_score}/100</span></div>
    <ul>{deal.explanation_codes.map(code=><li key={code}>{pl.explanations[code] ?? pl.explanations.LIMITED_HISTORY}</li>)}</ul>
    <Link className="text-link" href="/info/price-comparison">Jak porównujemy ceny lotów →</Link></section>
  </article></main>;
}
