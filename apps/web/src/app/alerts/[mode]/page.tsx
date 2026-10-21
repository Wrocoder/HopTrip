import {notFound} from "next/navigation";
import {getAirports,getDestinations,alertStatus} from "../../../lib/api";
import {AlertForm} from "../../components/alert-form";
import type {Locale} from "../../../lib/i18n/config";
import {localizedHref} from "../../../lib/i18n/routing";
import {alertText} from "../../../lib/i18n/alert-copy";
type Props={params:Promise<{mode:string}>;locale?:Locale};
export const dynamic="force-dynamic";
export async function generateMetadata({params,locale="pl"}:Props) {
  const {mode}=await params;
  if(mode!=="confirm" && mode!=="manage")notFound();
  return {title:`${alertText(locale,"Twój alert")} | HopTrip`,robots:{index:false,follow:false},referrer:"no-referrer" as const,
    alternates:{canonical:localizedHref(`/alerts/${mode}`,locale)}};
}
export default async function ManageAlert({params,locale="pl"}:Props) {
  const {mode}=await params;
  if(mode!=="confirm" && mode!=="manage")notFound();
  const availability=await alertStatus();
  const [airports,destinations]=mode==="manage"?await Promise.all([getAirports().catch(()=>[]),getDestinations().catch(()=>[])]):[[],[]];
  return <main className="page-shell"><h1>{alertText(locale,mode==="confirm"?"Potwierdź swój alert":"Ustawienia alertu")}</h1>
    <AlertForm deliveryEnabled={availability.delivery_enabled===true} mode={mode} airports={airports} destinations={destinations}/></main>;
}
