import {departureHeading} from "../../../lib/cities";
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
  if(!record)notFound();
  const path=`/from/${encodeURIComponent(value)}`,page=catalogPage(path);
  return socialMetadata({title:record ? page?.title ?? `${departureHeading(record.city,value)} | HopTrip` : pl.notFound,
    description:page?.description ?? pl.routeIntro,path,image:`/preview/airport/${encodeURIComponent(value)}`,index:Boolean(record && page)});
}
export default async function RoutePage({params}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({origin:value});
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{pl.airports}</p><h1>{departureHeading(record.city,record.iata_code)}</h1>
    <p className="lead">{catalogPage(`/from/${value}`)?.description ?? pl.routeIntro}</p></header>
    {catalogPage(`/from/${value}`) && <CatalogIntro page={catalogPage(`/from/${value}`)!} linksFirst/>}
    {value==="WRO" && <section aria-labelledby="wro-offers"><h2 id="wro-offers">Oferty lotów z Wrocławia</h2><p>Ceny pochodzą z zapisanych obserwacji. Sprawdź datę odświeżenia i zakres lotu; dostępność oraz końcową cenę potwierdzisz u sprzedawcy.</p></section>}
    <DealGrid deals={deals}/>
    </main>;
}
