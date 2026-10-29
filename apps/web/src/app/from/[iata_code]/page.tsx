import Link from "next/link";
import {departureHeading} from "../../../lib/cities";
import {notFound} from "next/navigation";
import {getAirports,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
import {catalogPage,socialMetadata} from "../../../lib/catalog-pages";
import {CatalogIntro} from "../../components/catalog-intro";
import {getMessages} from "../../../lib/i18n/messages";
import type {Locale} from "../../../lib/i18n/config";
import {landingPage,landingMetadata,landingText} from "../../../lib/i18n/landing-copy";
export const dynamic="force-dynamic";
type Props={params:Promise<{iata_code:string}>;locale?:Locale};
async function load(params:Props["params"]) {
  const value=(await params).iata_code.toUpperCase();
  const record=(await getAirports()).find(r=>r.iata_code === value);
  return {value,record};
}
export async function generateMetadata({params,locale="pl"}:Props) {
  const {value,record}=await load(params);
  if(!record)notFound();
  const path=`/from/${encodeURIComponent(value)}`,page=catalogPage(path);
  return landingMetadata(socialMetadata({title:record ? page?.title ?? `${departureHeading(record.city,value)} | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/airport/${encodeURIComponent(value)}`,index:Boolean(record && page)}),path,locale);
}
export default async function RoutePage({params,locale="pl"}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({origin:value});
  const page=landingPage(`/from/${value}`,locale),messages=getMessages(locale);
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{messages.airports}</p><h1>{locale==="pl" ? departureHeading(record.city,record.iata_code) : page?.heading}</h1>
    <p className="lead">{page?.description ?? pl.routeIntro}</p></header>
    {page && <CatalogIntro page={page} linksFirst locale={locale}/>}
    {value==="WRO" && <section aria-labelledby="wro-offers"><h2 id="wro-offers">{landingText(locale,"Oferty lotów z Wrocławia")}</h2><p>{landingText(locale,"Ceny pochodzą z zapisanych obserwacji. Sprawdź datę odświeżenia i zakres lotu; dostępność oraz końcową cenę potwierdzisz u sprzedawcy.")}</p></section>}
    {["WAW","WMI"].includes(value) && <p><Link href="/from/warszawa">Porównaj loty z Chopina i Modlina</Link></p>}
    <DealGrid deals={deals} locale={locale}/>
    </main>;
}
