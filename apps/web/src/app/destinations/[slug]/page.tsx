import {notFound} from "next/navigation";
import {getDestinations,getDeals} from "../../../lib/api";
import {pl} from "../../../lib/pl";
import {DealGrid} from "../../components/catalog";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};
async function load(params:Props["params"]) {
  const value=(await params).slug;
  const record=(await getDestinations()).find(r=>r.slug === value);
  return {value,record};
}
export async function generateMetadata({params}:Props) {
  const {value,record}=await load(params);
  return {title:record ? record.city + " | HopTrip" : pl.notFound,
    alternates:{canonical:`/destinations/${encodeURIComponent(value)}`},
    robots:{index:false,follow:true}};
}
export default async function RoutePage({params}:Props) {
  const {value,record}=await load(params);
  if (!record) notFound();
  const deals=await getDeals({destination:value});
  return <main className="page-shell"><header className="page-heading"><p className="eyebrow">{pl.destinations}</p><h1>{record.city}</h1>
    <p className="lead">{pl.routeIntro}</p></header><DealGrid deals={deals}/></main>;
}
