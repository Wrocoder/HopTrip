import Link from "next/link";
import {getDeals,getAirports,getDestinations,Deal,Airport,Destination} from "../lib/api";
import {pl} from "../lib/pl";
import {DealGrid} from "./components/catalog";
import {FilterForm} from "./components/filters";
export const dynamic="force-dynamic";
export default async function HomePage() {
  let deals:Deal[]=[], airports:Airport[]=[], destinations:Destination[]=[], failed=false;
  const [offers,origins,places]=await Promise.allSettled([getDeals({limit:"6"}),getAirports(),getDestinations()]);
  if(offers.status==="fulfilled")deals=offers.value;else failed=true;
  if(origins.status==="fulfilled")airports=origins.value;
  if(places.status==="fulfilled")destinations=places.value;
  return <main className="page-shell">
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/>Loty z Polski · HopTrip</p><h1>{pl.heading}</h1></div>
      <FilterForm filters={{}} airports={airports} hero/></section>
    <p className="search-explanation">{pl.description} <Link href="/info/price-comparison">{pl.why} →</Link></p>
    <aside className="travel-note" aria-label="Budżet podróży"><p>Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy.</p><Link className="button button-secondary" href="/info/trip-budget#calculator">Policz budżet podróży</Link></aside>
    <section className="catalog-section" aria-labelledby="current-deals"><div className="section-heading"><div><p className="eyebrow">01 / Odkrywaj</p><h2 id="current-deals">{pl.deals}</h2></div><span className="badge">{pl.perPerson} · PLN</span></div>
      {failed ? <p className="notice" role="status">{pl.error}</p> : <DealGrid deals={deals}/>}</section>
    <div className="browse-layout"><section className="route-links"><p className="eyebrow">02 / Skąd wyruszasz</p><h2>{pl.airports}</h2><div className="route-link-grid">{airports.map(a=><Link key={a.id} href={`/from/${a.iata_code}`}>{a.city} ({a.iata_code})</Link>)}</div></section>
    <section className="route-links destination-links"><p className="eyebrow">03 / Dokąd chcesz polecieć</p><h2>{pl.destinations}</h2><div className="route-link-grid">{destinations.map(d=><Link key={d.id} href={`/destinations/${d.slug}`}>{d.city}</Link>)}</div></section></div>
    <aside className="travel-note"><span className="note-mark" aria-hidden="true">↗</span><p>{pl.flightOnly}</p><Link href="/info/partners">{pl.partners} →</Link></aside>
  </main>;
}
