import {notFound} from "next/navigation";
import {getAirports,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
export const dynamic="force-dynamic";
type Props={params:Promise<{iata_code:string}>};
async function load(params:Props["params"]) {
  const value=(await params).iata_code.toUpperCase();
  const record=(await getAirports()).find(r=>r.iata_code === value);
  return {value,record};
}
export async function generateMetadata({params}:Props) {
  const {value,record}=await load(params);
  return {title:record ? record.city + " | HopTrip" : pl.notFound,
    alternates:{canonical:`/from/${encodeURIComponent(value)}`},
    robots:{index:false,follow:true}};
}
export default async function RoutePage({params}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({origin:value});
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{pl.airports}</p><h1>{record.city} ({record.iata_code})</h1>
    <p className="lead">{pl.routeIntro}</p></header><DealGrid deals={deals}/></main>;
}
