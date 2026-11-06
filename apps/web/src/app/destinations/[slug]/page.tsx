import {cache} from 'react';
import {ApiUnavailable} from '../../components/api-unavailable';
import {stateText} from '../../../lib/i18n/state-copy';
import Link from "next/link";
import {destinationLabel} from "../../../lib/destinations";
import {notFound} from "next/navigation";
import {getDestinations,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
import {DestinationGuides} from "../../components/destination-guides";
import {DestinationPlanning} from '../../components/destination-planning';
import {DestinationRecovery} from '../../components/destination-recovery';
import {destinationRecoveryThreshold,loadDestinationRecovery} from '../../../lib/destination-recovery';
import {OfferState} from '../../components/offer-state';
import {destinationCopy} from '../../../lib/i18n/destination-copy';
import {catalogText} from '../../../lib/i18n/catalog-copy';
import {guideUi} from '../../../lib/i18n/guide-ui';
import {catalogPage,socialMetadata} from "../../../lib/catalog-pages";
import {CatalogIntro} from "../../components/catalog-intro";
import {getMessages} from "../../../lib/i18n/messages";
import type {Locale} from "../../../lib/i18n/config";
import {localizedHref} from "../../../lib/i18n/routing";
import {landingPage,landingMetadata,landingText} from "../../../lib/i18n/landing-copy";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>;locale?:Locale};
const load=cache(async(value:string)=>{
  try{
    const destinations=await getDestinations();
    const record=destinations.find(r=>r.slug === value);
    const deals=record?await getDeals({destination:value}):[];
    return {record,destinations,deals,failed:false};
  }catch{return {record:undefined,destinations:[],deals:[],failed:true};}
});
export async function generateMetadata({params,locale="pl"}:Props) {
  const value=(await params).slug;
  const {record,failed}=await load(value);
  if(failed)return {title:stateText(locale,'Nie udało się wczytać strony'),robots:{index:false,follow:true},alternates:{canonical:localizedHref(`/destinations/${encodeURIComponent(value)}`,locale)}};
  if(!record)notFound();
  const path=`/destinations/${encodeURIComponent(value)}`,page=catalogPage(path);
  return landingMetadata(socialMetadata({title:record ? page?.title ?? `${destinationLabel(record)} — loty z Polski | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/destination/${encodeURIComponent(value)}`,index:Boolean(record && page)}),path,locale);
}
export default async function RoutePage({params,locale="pl"}:Props) {
  const value=(await params).slug;
  const path=`/destinations/${encodeURIComponent(value)}`;
  const {record,destinations,deals,failed}=await load(value);
  if(failed)return <ApiUnavailable locale={locale} path={path}/>;
  if (!record) notFound();
  const recovery=deals.length<=destinationRecoveryThreshold?await loadDestinationRecovery(record,destinations):null;
  const page=landingPage(`/destinations/${value}`,locale),messages=getMessages(locale),copy=destinationCopy[locale];
  const search=localizedHref(`/deals?destination=${encodeURIComponent(value)}`,locale);
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{messages.destinations}</p><h1>{destinationLabel(record,locale)}</h1>
    <p className="lead">{page?.description ?? pl.routeIntro}</p>
    <p><a className="text-link" data-destination-search href={search}>{copy.search}</a></p></header>
    <DestinationGuides slug={value} locale={locale} summaries/>
    <DestinationPlanning destination={record} locale={locale}/>
    <nav className="route-link-grid" aria-label={landingText(locale,"Wybierz długość pobytu")}><Link href={localizedHref(`/city-break?destination=${encodeURIComponent(value)}`,locale)}>{landingText(locale,"Loty na 2–4 noce")}</Link><Link href={localizedHref(`/tanie-loty-na-weekend?destination=${encodeURIComponent(value)}`,locale)}>{landingText(locale,"Loty na weekend")}</Link>{value==="rome" && <Link href="/routes/krakow-rome">Loty Kraków — Rzym</Link>}</nav>
    <section aria-labelledby="destination-flights-heading"><h2 id="destination-flights-heading">{copy.flights}</h2>
      <p>{guideUi(locale,'flightsNote')}</p>
      {deals.length ? <DealGrid deals={deals} locale={locale}/> : <OfferState kind="empty" title={catalogText(locale,'Brak aktualnych ofert')} actions={<>
        <a href={search}>{copy.search}</a><Link href={localizedHref('/deals',locale)}>{copy.other}</Link>
      </>}><p>{copy.empty}</p></OfferState>}
    </section>
    {recovery&&<DestinationRecovery data={recovery} slug={value} locale={locale}>{recovery.status==='READY'&&<DealGrid deals={recovery.offers} locale={locale}/>}</DestinationRecovery>}
    {page && <CatalogIntro page={page} locale={locale}/>}
    </main>;
}
