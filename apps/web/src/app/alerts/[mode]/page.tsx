import {notFound} from "next/navigation";
import {getAirports,getDestinations} from "../../../lib/api";
import {AlertForm} from "../../components/alert-form";
export const dynamic="force-dynamic";
export const metadata={title:"Twój alert | HopTrip",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default async function ManageAlert({params}:{params:Promise<{mode:string}>}) {
  const {mode}=await params;
  if(mode!=="confirm" && mode!=="manage")notFound();
  const [airports,destinations]=mode==="manage"?await Promise.all([getAirports().catch(()=>[]),getDestinations().catch(()=>[])]):[[],[]];
  return <main className="page-shell"><h1>{mode==="confirm"?"Potwierdź swój alert":"Ustawienia alertu"}</h1>
    <AlertForm mode={mode} airports={airports} destinations={destinations}/></main>;
}
