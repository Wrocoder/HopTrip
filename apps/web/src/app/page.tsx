import {airportLabel} from "../lib/airports";
import {destinationLabel} from "../lib/destinations";
import Link from "next/link";
import {cookies} from "next/headers";
import {selectedOrigin,originPreferenceCookie} from "../lib/origin-preference";
import {getDeals,getAirports,getDestinations,Deal,Airport,Destination} from "../lib/api";
import type {Metadata} from "next";
import {locales,openGraphLocales,type Locale} from "../lib/i18n/config";
import {getMessages} from "../lib/i18n/messages";
import {homeText,type HomeKey} from "../lib/i18n/home-copy";
import {localizedHref,languageAlternates,pageLocales} from "../lib/i18n/routing";
import {HomeOrigin} from './components/home-origin';
import {DealGrid} from './components/catalog';
import {shortTripSelection} from '../lib/short-trip-selection';
import {searchFilters,type SearchRaw} from '../lib/search-policy';
import {destinationImage} from '../lib/destination-imagery';
import {DestinationCard} from './components/destination-card';
import destinationStyles from './components/destination-card.module.css';
export const dynamic="force-dynamic";
type Props={searchParams:Promise<SearchRaw>;locale?:Locale};
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
  const stored=(await cookies()).get(originPreferenceCookie)?.value;
  const [origins,places]=await Promise.allSettled([getAirports(),getDestinations()]);
  const airports:Airport[]=origins.status==="fulfilled" ? origins.value : [];
  const destinations:Destination[]=places.status==="fulfilled" ? places.value : [];
  const pictured=destinations.filter(d=>destinationImage(d.slug)).slice(0,3);
  const picturedIds=new Set(pictured.map(d=>d.id));
  const destinationHref=(d:Destination)=>pageLocales(`/destinations/${d.slug}`).includes(locale)?localizedHref(`/destinations/${d.slug}`,locale):localizedHref(`/deals?destination=${encodeURIComponent(d.slug)}`,locale);
  const origin=selectedOrigin(raw.origin,stored,origins.status==="fulfilled" ? airports.map(a=>a.iata_code) : null);
  const heroFilters={...searchFilters(raw),origin};
  const filters={origin,duration_min:"2",duration_max:"4"};
  let deals:Deal[]=[], failed=false;
  const [offers]=await Promise.allSettled([getDeals({...filters,limit:"100"})]);
  if(offers.status==="fulfilled")deals=shortTripSelection(offers.value,origin);else failed=true;
  return <main className="page-shell home-page">
    <HomeOrigin airports={airports} destinations={destinations} initialOrigin={origin} initialFilters={heroFilters} count={deals.length} initialFailed={failed} locale={locale}><DealGrid deals={deals} locale={locale}/></HomeOrigin>
    <section className="home-section" aria-labelledby="home-collections">
      <h2 id="home-collections">{t('Kolekcje na krótki wyjazd')}</h2>
      <nav className="route-link-grid" aria-label={t("Pomysły na krótki wyjazd")}>{([['/city-break','City break na 2–4 noce'],['/tanie-loty-na-weekend','Tanie loty na weekend'],['/from/warszawa','Warszawa — oba lotniska']] as const).map(([href,label])=><Link prefetch={false} key={href} href={localizedHref(href,locale)} hrefLang={locale}>{t(label)}</Link>)}</nav>
      <p><Link prefetch={false} href={localizedHref("/deals",locale)}>{t("Zobacz loty ze wszystkich lotnisk →")}</Link></p>
    </section>
    <section className="home-section destination-links" aria-labelledby="home-destinations">
      <h2 id="home-destinations">{pl.destinations}</h2>
      {pictured.length>0&&<ul className={destinationStyles.grid}>{pictured.map(d=><DestinationCard key={d.id} slug={d.slug} label={destinationLabel(d,locale)} href={destinationHref(d)} locale={locale}/>)}</ul>}
      <div className="route-link-grid">{destinations.filter(d=>!picturedIds.has(d.id)).map(d=><Link prefetch={false} key={d.id} href={destinationHref(d)}>{destinationLabel(d,locale)}</Link>)}</div>
    </section>
    <section className="home-section" aria-labelledby="home-planning">
      <h2 id="home-planning">{t('Zaplanuj podróż')}</h2>
      <p>{t("Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy.")}</p>
      <div className="route-link-grid"><Link prefetch={false} href={localizedHref("/info/trip-budget#calculator",locale)}>{t("Policz budżet podróży")}</Link><Link prefetch={false} href={localizedHref('/saved',locale)}>{t('Zapisane wyjazdy')}</Link></div>
    </section>
    <section className="home-section" aria-labelledby="home-how">
      <h2 id="home-how">{t('Jak działa HopTrip')}</h2>
      <ol className="home-steps"><li>{t('Wyszukaj lot według lotniska, dat i budżetu.')}</li><li>{t('Porównaj oferty i sprawdź szczegóły wybranego lotu.')}</li><li>{t('Zaplanuj koszty podróży. Dostępność i warunki rezerwacji potwierdź u partnera.')}</li></ol>
    </section>
    <section className="home-section" aria-labelledby="home-guides">
      <h2 id="home-guides">{t('Poradniki i pomoc')}</h2>
      <div className="route-link-grid"><Link prefetch={false} href={localizedHref('/info/price-comparison',locale)}>{pl.why}</Link><Link prefetch={false} href={localizedHref('/info/price-freshness',locale)}>{t('Świeżość ofert')}</Link><Link prefetch={false} href={localizedHref('/info/partners',locale)}>{pl.partners}</Link><Link prefetch={false} href={localizedHref('/info',locale)}>{t('Wszystkie poradniki')}</Link></div>
    </section>
    <details className="home-section home-airports"><summary>{pl.airports}</summary><div className="route-link-grid">{airports.map(a=><Link prefetch={false} key={a.id} href={pageLocales(`/from/${a.iata_code}`).includes(locale)?localizedHref(`/from/${a.iata_code}`,locale):localizedHref(`/deals?origin=${a.iata_code}`,locale)}>{airportLabel(a,locale)}</Link>)}</div></details>
  </main>;
}
