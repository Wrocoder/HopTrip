import Link from "next/link";
import {Deal} from "../../lib/api";
import {pl,money,date} from "../../lib/pl";
import {Impression} from "./deal-view-tracker";
export function DealCard({deal}:{deal:Deal}) {
  return <Link className="deal-card" href={`/deals/${deal.slug}`}>
    <Impression slug={deal.slug}/>
    <div className="deal-card-top"><span className="badge">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</span><span className="score-badge">{pl.score}: {deal.deal_score}/100</span></div>
    <p className="deal-origin">{deal.origin_city} ({deal.origin_code}) <span aria-hidden="true">→</span></p>
    <h2>{deal.destination_city}</h2>
    <p className="deal-dates">{date(deal.trip_start)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end)}`}</p>
    <div className="deal-card-bottom">
    <p className="deal-price">{money(deal.price_per_person_pln)} <span>{pl.perPerson}</span></p>
    <span className="card-arrow" aria-hidden="true">↗</span></div>
    <p className="deal-note">{pl.flightOnly}</p>
  </Link>;
}
export function DealGrid({deals}:{deals:Deal[]}) {
  return deals.length ? <section className="deal-grid">{deals.map(d=><DealCard key={d.slug} deal={d}/>)}</section>
    : <div className="empty-state"><span className="empty-mark" aria-hidden="true">↗</span><p>{pl.empty}</p><Link className="text-link" href="/info/price-freshness">Co oznacza świeżość oferty <span aria-hidden="true">→</span></Link></div>;
}
