import Link from "next/link";
import {destinationLabel} from "../../../lib/destinations";
import {notFound} from "next/navigation";
import {getDestinations,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
import {DestinationGuides} from "../../components/destination-guides";
import {catalogPage,socialMetadata} from "../../../lib/catalog-pages";
import {CatalogIntro} from "../../components/catalog-intro";
import {getMessages} from "../../../lib/i18n/messages";
import type {Locale} from "../../../lib/i18n/config";
import {localizedHref} from "../../../lib/i18n/routing";
import {landingPage,landingMetadata,landingText} from "../../../lib/i18n/landing-copy";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>;locale?:Locale};
async function load(params:Props["params"]) {
  const value=(await params).slug;
  const record=(await getDestinations()).find(r=>r.slug === value);
  return {value,record};
}
export async function generateMetadata({params,locale="pl"}:Props) {
  const {value,record}=await load(params);
  if(!record)notFound();
  const path=`/destinations/${encodeURIComponent(value)}`,page=catalogPage(path);
  return landingMetadata(socialMetadata({title:record ? page?.title ?? `${destinationLabel(record)} — loty z Polski | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/destination/${encodeURIComponent(value)}`,index:Boolean(record && page)}),path,locale);
}
export default async function RoutePage({params,locale="pl"}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({destination:value});
  const page=landingPage(`/destinations/${value}`,locale),messages=getMessages(locale);
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{messages.destinations}</p><h1>{destinationLabel(record,locale)}</h1>
    <p className="lead">{page?.description ?? pl.routeIntro}</p></header><DestinationGuides slug={value} locale={locale}/><nav className="route-link-grid" aria-label={landingText(locale,"Wybierz długość pobytu")}><Link href={localizedHref(`/city-break?destination=${encodeURIComponent(value)}`,locale)}>{landingText(locale,"Loty na 2–4 noce")}</Link><Link href={localizedHref(`/tanie-loty-na-weekend?destination=${encodeURIComponent(value)}`,locale)}>{landingText(locale,"Loty na weekend")}</Link>{value==="rome" && <Link href="/routes/krakow-rome">Loty Kraków — Rzym</Link>}</nav><DealGrid deals={deals} locale={locale}/>
    {page && <CatalogIntro page={page} locale={locale}/>}
    </main>;
}
