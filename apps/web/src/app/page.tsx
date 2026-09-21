import Link from "next/link";
import {getDeals,getAirports,getDestinations,Deal,Airport,Destination} from "../lib/api";
import {pl} from "../lib/pl";
import {DealGrid} from "./components/catalog";
export const dynamic="force-dynamic";
export default async function HomePage() {
  let deals:Deal[]=[], airports:Airport[]=[], destinations:Destination[]=[], failed=false;
  try {[deals,airports,destinations]=await Promise.all([getDeals({limit:"6"}),getAirports(),getDestinations()]);}
  catch {failed=true;}
  return <main className="page-shell">
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/>Loty z Polski · HopTrip</p><h1>{pl.heading}</h1><p className="lead">{pl.description}</p>
      <Link className="text-link" href="/info/price-comparison">{pl.why} <span aria-hidden="true">↗</span></Link></div>
      <div className="featured-card hero-action"><span className="eyebrow">Twój następny kierunek</span><span className="journey-line" aria-hidden="true"><span>PL</span><span>↗</span></span>
      <h2>{pl.deals}</h2><p>{pl.cached}</p><Link className="button button-yellow" href="/deals">{pl.deals}<span aria-hidden="true">→</span></Link></div></section>
    <section className="catalog-section" aria-labelledby="current-deals"><div className="section-heading"><div><p className="eyebrow">01 / Odkrywaj</p><h2 id="current-deals">{pl.deals}</h2></div><span className="badge">{pl.perPerson} · PLN</span></div>
      {failed ? <p className="notice" role="status">{pl.error}</p> : <DealGrid deals={deals}/>}</section>
    <div className="browse-layout"><section className="route-links"><p className="eyebrow">02 / Skąd wyruszasz</p><h2>{pl.airports}</h2><div className="route-link-grid">{airports.map(a=><Link key={a.id} href={`/from/${a.iata_code}`}>{a.city} ({a.iata_code})</Link>)}</div></section>
    <section className="route-links destination-links"><p className="eyebrow">03 / Dokąd chcesz polecieć</p><h2>{pl.destinations}</h2><div className="route-link-grid">{destinations.map(d=><Link key={d.id} href={`/destinations/${d.slug}`}>{d.city}</Link>)}</div></section></div>
    <aside className="travel-note"><span className="note-mark" aria-hidden="true">↗</span><p>{pl.flightOnly}</p><Link href="/info/partners">{pl.partners} →</Link></aside>
  </main>;
}
