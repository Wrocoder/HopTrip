import {localizedHref} from '../../../lib/i18n/routing';
import {cache} from 'react';
import {ApiUnavailable} from '../../components/api-unavailable';
import {stateText} from '../../../lib/i18n/state-copy';
import Link from "next/link";
import {departureHeading} from "../../../lib/cities";
import {notFound} from "next/navigation";
import {getAirports,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
import {catalogPage,socialMetadata} from "../../../lib/catalog-pages";
import {CatalogIntro} from "../../components/catalog-intro";
import {AirportContext} from '../../components/airport-context';
import {OfferState} from '../../components/offer-state';
import {airportCopy} from '../../../lib/i18n/airport-copy';
import {catalogText} from '../../../lib/i18n/catalog-copy';
import {getMessages} from "../../../lib/i18n/messages";
import type {Locale} from "../../../lib/i18n/config";
import {landingPage,landingMetadata,landingText} from "../../../lib/i18n/landing-copy";
export const dynamic="force-dynamic";
type Props={params:Promise<{iata_code:string}>;locale?:Locale};
const load=cache(async(value:string)=>{
  try{
    const record=(await getAirports()).find(r=>r.iata_code === value);
    const deals=record?await getDeals({origin:value}):[];
    return {record,deals,failed:false};
  }catch{return {record:undefined,deals:[],failed:true};}
});
export async function generateMetadata({params,locale="pl"}:Props) {
  const value=(await params).iata_code.toUpperCase();
  const {record,failed}=await load(value);
  if(failed)return {title:stateText(locale,'Nie udało się wczytać strony'),robots:{index:false,follow:true},alternates:{canonical:localizedHref(`/from/${encodeURIComponent(value)}`,locale)}};
  if(!record)notFound();
  const path=`/from/${encodeURIComponent(value)}`,page=catalogPage(path);
  return landingMetadata(socialMetadata({title:record ? page?.title ?? `${departureHeading(record.city,value)} | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/airport/${encodeURIComponent(value)}`,index:Boolean(record && page)}),path,locale);
}
export default async function RoutePage({params,locale="pl"}:Props) {
  const value=(await params).iata_code.toUpperCase();
  const path=`/from/${encodeURIComponent(value)}`;
  const {record,deals,failed}=await load(value);
  if(failed)return <ApiUnavailable locale={locale} path={path}/>;
  if (!record) notFound();
  const page=landingPage(`/from/${value}`,locale),messages=getMessages(locale);
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{messages.airports}</p><h1>{locale==="pl" ? departureHeading(record.city,record.iata_code) : page?.heading}</h1>
    <p className="lead">{page?.description ?? pl.routeIntro}</p></header>
    {page && <CatalogIntro page={page} linksFirst locale={locale}/>}
    {["WAW","WMI"].includes(value) && <p><Link href="/from/warszawa">Porównaj loty z Chopina i Modlina</Link></p>}
    <section aria-labelledby="airport-offers"><h2 id="airport-offers">{messages.deals}</h2>
      <p>{landingText(locale,"Ceny pochodzą z zapisanych obserwacji. Sprawdź datę odświeżenia i zakres lotu; dostępność oraz końcową cenę potwierdzisz u sprzedawcy.")}</p>
      {deals.length ? <DealGrid deals={deals} locale={locale}/> : <OfferState kind="empty" title={catalogText(locale,'Brak aktualnych ofert')} actions={<>
        <Link href={localizedHref(`/deals?origin=${encodeURIComponent(value)}`,locale)}>{airportCopy[locale].search}</Link>
        <Link href={localizedHref('/deals',locale)}>{stateText(locale,'Wybierz inne lotnisko')}</Link>
      </>}><p>{airportCopy[locale].empty}</p></OfferState>}
    </section>
    <AirportContext airports={[record]} deals={deals} filters={{origin:value}} locale={locale}/>
    </main>;
}
