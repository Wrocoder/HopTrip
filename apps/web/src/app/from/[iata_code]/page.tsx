import {notFound} from "next/navigation";
import {getAirports,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
import {catalogPage,socialMetadata} from "../../../lib/catalog-pages";
import {CatalogIntro} from "../../components/catalog-intro";
export const dynamic="force-dynamic";
type Props={params:Promise<{iata_code:string}>};
async function load(params:Props["params"]) {
  const value=(await params).iata_code.toUpperCase();
  const record=(await getAirports()).find(r=>r.iata_code === value);
  return {value,record};
}
export async function generateMetadata({params}:Props) {
  const {value,record}=await load(params);
  const path=`/from/${encodeURIComponent(value)}`,page=catalogPage(path);
  return socialMetadata({title:record ? page?.title ?? `${record.city} (${value}) — loty | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/airport/${encodeURIComponent(value)}`,index:Boolean(record && page)});
}
export default async function RoutePage({params}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({origin:value});
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{pl.airports}</p><h1>{record.city} ({record.iata_code})</h1>
    <p className="lead">{catalogPage(`/from/${value}`)?.description ?? pl.routeIntro}</p></header><DealGrid deals={deals}/>
    {catalogPage(`/from/${value}`) && <CatalogIntro page={catalogPage(`/from/${value}`)!}/>}
    </main>;
}
