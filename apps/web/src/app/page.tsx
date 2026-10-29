import {airportLabel} from "../lib/airports";
import {destinationLabel} from "../lib/destinations";
import Link from "next/link";
import {cookies} from "next/headers";
import {chooseHomeOrigin} from "./actions/origin-preference";
import {normalizedOrigin,originPreferenceCookie} from "../lib/origin-preference";
import {getDeals,getAirports,getDestinations,Deal,Airport,Destination} from "../lib/api";
import type {Metadata} from "next";
import {locales,openGraphLocales,type Locale} from "../lib/i18n/config";
import {getMessages} from "../lib/i18n/messages";
import {homeText,type HomeKey} from "../lib/i18n/home-copy";
import {localizedHref,languageAlternates,pageLocales} from "../lib/i18n/routing";
import {DealGrid} from "./components/catalog";
import {FilterForm} from "./components/filters";
export const dynamic="force-dynamic";
type Props={searchParams:Promise<{origin?:string|string[]}>;locale?:Locale};
export function generateMetadata({locale="pl"}:{locale?:Locale}={}):Metadata {
 const messages=getMessages(locale),canonical=localizedHref("/",locale);
 const title=locale==='pl'?messages.title:homeText(locale,'Loty z Polski i planowanie krótkich wyjazdów | HopTrip');
 const description=locale==='pl'?messages.description:homeText(locale,'Znajdź lot z Polski, sprawdź wydarzenia na miejscu i zaplanuj krótki wyjazd. Wybierz lotnisko, porównaj daty i policz budżet podróży.');
 return {title,description,alternates:{canonical,languages:languageAlternates("/",locales)},
  robots:{index:true,follow:true},openGraph:{title,description,url:canonical,locale:openGraphLocales[locale],type:"website",
   images:locale==="pl"?[{url:"/preview/site/home",width:1200,height:630,alt:title}]:[]},
  twitter:{card:locale==="pl"?"summary_large_image":"summary",title,description,images:locale==="pl"?["/preview/site/home"]:[]}};
}
export default async function HomePage({searchParams,locale="pl"}:Props) {
  const pl=getMessages(locale),t=(key:HomeKey,values?:Record<string,string|number>)=>homeText(locale,key,values);
  const raw=await searchParams;
  const stored=normalizedOrigin((await cookies()).get(originPreferenceCookie)?.value);
  const [origins,places]=await Promise.allSettled([getAirports(),getDestinations()]);
  const airports:Airport[]=origins.status==="fulfilled" ? origins.value : [];
  const destinations:Destination[]=places.status==="fulfilled" ? places.value : [];
  const origin=raw.origin!==undefined ? normalizedOrigin(raw.origin)
    : airports.some(a=>a.iata_code===stored) ? stored : "";
  const filters={origin,duration_min:"2",duration_max:"4"};
  const catalogHref=localizedHref("/deals?"+new URLSearchParams(filters),locale);
  let deals:Deal[]=[], failed=false;
  const [offers]=await Promise.allSettled([getDeals({...filters,limit:"100"})]);
  if(offers.status==="fulfilled")deals=offers.value.filter(deal=>{
    const nights=(Date.parse(deal.trip_end)-Date.parse(deal.trip_start))/86400000;
    return (!origin || deal.origin_code===origin) && deal.trip_type==="ROUND_TRIP" && Number.isInteger(nights) && nights>=2 && nights<=4;
  }).slice(0,6);else failed=true;
  return <main className="page-shell home-page">
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/>{t("Loty z Polski · HopTrip")}</p><h1>{t("Znajdź lot. Zaplanuj krótki wyjazd.")}</h1><p className="lead">{t("Porównaj loty, sprawdź koncerty i mecze na miejscu, zaplanuj budżet.")}</p><p className="hero-events">{t("Wydarzenia znajdziesz w ofercie lotu — według miasta i dat pobytu.")}</p></div>
      <FilterForm key={origin} filters={{origin}} airports={airports} destinations={destinations} hero/></section>

    <section className="catalog-section" aria-labelledby="current-deals"><div className="section-heading"><div><p className="eyebrow">{t("Wylot:")} {origin || t("dowolne lotnisko")}</p><h2 id="current-deals">{t("Krótkie wyjazdy · 2–4 noce")}</h2></div><span className="badge">{pl.perPerson} · PLN</span></div>
      <details className="short-trip-airport"><summary>{t("Zmień lotnisko krótkiego wyjazdu")}</summary>
      <form key={origin} action={chooseHomeOrigin}><input type="hidden" name="locale" value={locale}/><label htmlFor="short-trip-origin">{t("Lotnisko dla krótkich wyjazdów")}</label>{" "}
        <select id="short-trip-origin" name="origin" defaultValue={origin}>
          <option value="">{t("Dowolne lotnisko")}</option>
          {origin && !airports.some(a=>a.iata_code===origin) && <option value={origin}>{origin}</option>}
          {airports.map(a=><option key={a.id} value={a.iata_code}>{airportLabel(a,locale)}</option>)}
        </select>{" "}<button type="submit" className="button button-secondary" disabled={!airports.length}>{t("Pokaż krótkie wyjazdy")}</button>
      <p className="field-hint">{t("Zapamiętamy wybór na tym urządzeniu. Wybierz „Dowolne lotnisko”, aby go usunąć.")}</p>
      </form></details>
      {failed ? <p className="notice" role="status">{pl.error}</p> : <>
        {deals.length>0 && <DealGrid deals={deals} locale={locale}/>}
        <p role="status">{deals.length ? t("Liczba propozycji na 2–4 noce: {count}.",{count:deals.length}) : origin ? t("Brak aktualnych lotów na 2–4 noce z tego lotniska. Wybierz inne lotnisko lub sprawdź katalog z inną długością pobytu.") : t("Brak aktualnych lotów na 2–4 noce. Sprawdź katalog z inną długością pobytu.")}</p>
        {deals.length>0 && deals.length<6 && <p>{t("Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.")}</p>}
      </>}
      <p>{pl.flightOnly} {t("Sprawdź godziny lotów i potrzebne dni urlopu.")}</p>
      <p><Link href={catalogHref}>{t("Zobacz wszystkie loty na 2–4 noce →")}</Link></p>
    </section>
    <nav className="route-link-grid" aria-label={t("Pomysły na krótki wyjazd")}>{([['/city-break','City break na 2–4 noce'],['/tanie-loty-na-weekend','Tanie loty na weekend'],['/from/warszawa','Warszawa — oba lotniska']] as const).map(([href,label])=><a key={href} href={localizedHref(href,locale)} hrefLang={locale}>{t(label)}</a>)}</nav>
    <p className="search-explanation"><Link href={localizedHref("/deals",locale)}>{t("Zobacz loty ze wszystkich lotnisk →")}</Link> · <Link href={localizedHref("/info/price-comparison",locale)}>{pl.why} →</Link></p>
    <aside className="travel-note" aria-label={t("Budżet podróży")}><p>{t("Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy.")}</p><Link className="button button-secondary" href={localizedHref("/info/trip-budget#calculator",locale)}>{t("Policz budżet podróży")}</Link></aside>
    <div className="browse-layout"><section className="route-links"><p className="eyebrow">{t("02 / Skąd wyruszasz")}</p><h2>{pl.airports}</h2><div className="route-link-grid">{airports.map(a=><Link key={a.id} href={pageLocales(`/from/${a.iata_code}`).includes(locale)?localizedHref(`/from/${a.iata_code}`,locale):localizedHref(`/deals?origin=${a.iata_code}`,locale)}>{airportLabel(a,locale)}</Link>)}</div></section>
    <section className="route-links destination-links"><p className="eyebrow">{t("03 / Dokąd chcesz polecieć")}</p><h2>{pl.destinations}</h2><div className="route-link-grid">{destinations.map(d=><Link key={d.id} href={pageLocales(`/destinations/${d.slug}`).includes(locale)?localizedHref(`/destinations/${d.slug}`,locale):localizedHref(`/deals?destination=${encodeURIComponent(d.slug)}`,locale)}>{destinationLabel(d,locale)}</Link>)}</div></section></div>
    <aside className="travel-note"><span className="note-mark" aria-hidden="true">↗</span><p>{pl.flightOnly}</p><Link href={localizedHref("/info/partners",locale)}>{pl.partners} →</Link></aside>
  </main>;
}
