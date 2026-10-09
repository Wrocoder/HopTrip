import {notFound} from "next/navigation";
import {getDestinations,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
import {DestinationGuides} from "../../components/destination-guides";
import {catalogPage,socialMetadata} from "../../../lib/catalog-pages";
import {CatalogIntro} from "../../components/catalog-intro";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};
async function load(params:Props["params"]) {
  const value=(await params).slug;
  const record=(await getDestinations()).find(r=>r.slug === value);
  return {value,record};
}
export async function generateMetadata({params}:Props) {
  const {value,record}=await load(params);
  const path=`/destinations/${encodeURIComponent(value)}`,page=catalogPage(path);
  return socialMetadata({title:record ? page?.title ?? `${record.city} — loty z Polski | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/destination/${encodeURIComponent(value)}`,index:Boolean(record && page)});
}
export default async function RoutePage({params}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({destination:value});
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{pl.destinations}</p><h1>{record.city}</h1>
    <p className="lead">{catalogPage(`/destinations/${value}`)?.description ?? pl.routeIntro}</p></header><DestinationGuides slug={value}/><DealGrid deals={deals}/>
    {catalogPage(`/destinations/${value}`) && <CatalogIntro page={catalogPage(`/destinations/${value}`)!}/>}
    </main>;
}
