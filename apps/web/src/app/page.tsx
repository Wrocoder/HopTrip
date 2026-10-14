import {airportLabel} from "../lib/airports";
import {destinationLabel} from "../lib/destinations";
import Link from "next/link";
import Form from "next/form";
import {getDeals,getAirports,getDestinations,Deal,Airport,Destination} from "../lib/api";
import {pl} from "../lib/pl";
import {DealGrid} from "./components/catalog";
import {FilterForm} from "./components/filters";
export const dynamic="force-dynamic";
export const metadata={alternates:{canonical:"/"}};
export default async function HomePage({searchParams}:{searchParams:Promise<{origin?:string|string[]}>}) {
  const raw=await searchParams;
  const origin=typeof raw.origin==="string" ? raw.origin.trim().toUpperCase() : "WRO";
  const filters={origin,duration_min:"2",duration_max:"4"};
  const catalogHref="/deals?"+new URLSearchParams(filters);
  let deals:Deal[]=[], airports:Airport[]=[], destinations:Destination[]=[], failed=false;
  const [offers,origins,places]=await Promise.allSettled([getDeals({...filters,limit:"100"}),getAirports(),getDestinations()]);
  if(offers.status==="fulfilled")deals=offers.value.filter(deal=>{
    const nights=(Date.parse(deal.trip_end)-Date.parse(deal.trip_start))/86400000;
    return deal.origin_code===origin && deal.trip_type==="ROUND_TRIP" && Number.isInteger(nights) && nights>=2 && nights<=4;
  }).slice(0,6);else failed=true;
  if(origins.status==="fulfilled")airports=origins.value;
  if(places.status==="fulfilled")destinations=places.value;
  return <main className="page-shell home-page">
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/>Loty z Polski · HopTrip</p><h1>Znajdź lot. Zaplanuj krótki wyjazd.</h1><p className="lead">Porównaj loty i zaplanuj budżet wyjazdu.</p></div>
      <FilterForm key={origin} filters={{origin}} airports={airports} destinations={destinations} hero/></section>

    <section className="catalog-section" aria-labelledby="current-deals"><div className="section-heading"><div><p className="eyebrow">Wylot: {origin}</p><h2 id="current-deals">Krótkie wyjazdy · 2–4 noce</h2></div><span className="badge">{pl.perPerson} · PLN</span></div>
      <details className="short-trip-airport"><summary>Zmień lotnisko krótkiego wyjazdu</summary>
      <Form key={origin} action="/"><label htmlFor="short-trip-origin">Lotnisko dla krótkich wyjazdów</label>{" "}
        <select id="short-trip-origin" name="origin" defaultValue={origin} required>
          {!airports.some(a=>a.iata_code===origin) && <option value="">Wybierz lotnisko</option>}
          {airports.map(a=><option key={a.id} value={a.iata_code}>{airportLabel(a)}</option>)}
        </select>{" "}<button type="submit" className="button button-secondary" disabled={!airports.length}>Pokaż krótkie wyjazdy</button>
      </Form></details>
      {failed ? <p className="notice" role="status">{pl.error}</p> : <>
        {deals.length>0 && <DealGrid deals={deals}/>}
        <p role="status">{deals.length ? `Liczba propozycji na 2–4 noce: ${deals.length}.` : "Brak aktualnych lotów na 2–4 noce z tego lotniska. Wybierz inne lotnisko lub sprawdź katalog z inną długością pobytu."}</p>
        {deals.length>0 && deals.length<6 && <p>Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.</p>}
      </>}
      <p>{pl.flightOnly} Sprawdź godziny lotów i potrzebne dni urlopu.</p>
      <p><Link href={catalogHref}>Zobacz wszystkie loty na 2–4 noce →</Link></p>
    </section>
    <p className="search-explanation"><Link href="/deals">Zobacz loty ze wszystkich lotnisk →</Link> · <Link href="/info/price-comparison">{pl.why} →</Link></p>
    <aside className="travel-note" aria-label="Budżet podróży"><p>Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy.</p><Link className="button button-secondary" href="/info/trip-budget#calculator">Policz budżet podróży</Link></aside>
    <div className="browse-layout"><section className="route-links"><p className="eyebrow">02 / Skąd wyruszasz</p><h2>{pl.airports}</h2><div className="route-link-grid">{airports.map(a=><Link key={a.id} href={`/from/${a.iata_code}`}>{airportLabel(a)}</Link>)}</div></section>
    <section className="route-links destination-links"><p className="eyebrow">03 / Dokąd chcesz polecieć</p><h2>{pl.destinations}</h2><div className="route-link-grid">{destinations.map(d=><Link key={d.id} href={`/destinations/${d.slug}`}>{destinationLabel(d)}</Link>)}</div></section></div>
    <aside className="travel-note"><span className="note-mark" aria-hidden="true">↗</span><p>{pl.flightOnly}</p><Link href="/info/partners">{pl.partners} →</Link></aside>
  </main>;
}
