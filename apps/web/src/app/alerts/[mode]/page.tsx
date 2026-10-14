import {notFound} from "next/navigation";
import {getAirports,getDestinations,alertStatus} from "../../../lib/api";
import {AlertForm} from "../../components/alert-form";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{mode:string}>}) {
  const {mode}=await params;
  if(mode!=="confirm" && mode!=="manage")notFound();
  return {title:"Twój alert | HopTrip",robots:{index:false,follow:false},referrer:"no-referrer" as const,
    alternates:{canonical:`/alerts/${mode}`}};
}
export default async function ManageAlert({params}:{params:Promise<{mode:string}>}) {
  const {mode}=await params;
  if(mode!=="confirm" && mode!=="manage")notFound();
  const availability=await alertStatus();
  const [airports,destinations]=mode==="manage"?await Promise.all([getAirports().catch(()=>[]),getDestinations().catch(()=>[])]):[[],[]];
  return <main className="page-shell"><h1>{mode==="confirm"?"Potwierdź swój alert":"Ustawienia alertu"}</h1>
    <AlertForm deliveryEnabled={availability.delivery_enabled===true} mode={mode} airports={airports} destinations={destinations}/></main>;
}
