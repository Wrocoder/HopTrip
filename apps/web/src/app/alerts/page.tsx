import {alertStatus,getAirports,getDestinations,type Filters} from "../../lib/api";
import Link from "next/link";
import {matchingAirports} from "../../lib/airports";
import {AlertForm} from "../components/alert-form";
import type {Locale} from "../../lib/i18n/config";
import {localizedHref} from "../../lib/i18n/routing";
import {alertText} from "../../lib/i18n/alert-copy";
export const dynamic="force-dynamic";
export function generateMetadata({locale="pl"}:{locale?:Locale}={}) {
 return {title:`${alertText(locale,"Alerty lotnicze")} | HopTrip`,robots:{index:false,follow:false},referrer:"no-referrer" as const,alternates:{canonical:localizedHref("/alerts",locale)}};
}

export default async function AlertsPage({searchParams,locale="pl"}:{searchParams:Promise<Record<string,string|string[]|undefined>>;locale?:Locale}) {
  const availability=await alertStatus();
  const enabled=availability.enabled;
  const raw=await searchParams,initial:Filters={};
  for(const key of ["origin","budget","destination","duration_min","duration_max","departure_from","departure_to","weekend"] as const)
    if(typeof raw[key]==="string")initial[key]=raw[key];
  const [airports,destinations]=enabled?await Promise.all([getAirports().catch(()=>[]),getDestinations().catch(()=>[])]):[[],[]];
  const origins=matchingAirports(airports,initial.origin??"");
  initial.origin=origins.length===1?origins[0].iata_code:"";
  return <main className="page-shell"><h1>{alertText(locale,"Loty dopasowane do Ciebie")}</h1>
    {enabled && airports.length>0 ? <><p>{alertText(locale,"Zapisz preferencje krótkich wyjazdów: lotnisko, cenę, daty i częstotliwość. Najpierw potwierdzisz email.")}</p>
      <AlertForm deliveryEnabled={availability.delivery_enabled===true} mode="signup" airports={airports} destinations={destinations} initial={initial}/></>:
      <p>{alertText(locale,"Zapisy na alerty są obecnie niedostępne. Sprawdź aktualne loty w")} <Link href={localizedHref("/deals",locale)}>{alertText(locale,"katalogu ofert")}</Link>.</p>}
    <p><Link href={localizedHref("/saved",locale)}>{alertText(locale,"Zapisane wyjazdy")}</Link></p>
  </main>;
}
