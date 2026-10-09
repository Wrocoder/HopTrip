import {alertsEnabled,getAirports,getDestinations,type Filters} from "../../lib/api";
import Link from "next/link";
import {matchingAirports} from "../../lib/airports";
import {AlertForm} from "../components/alert-form";
export const dynamic="force-dynamic";
export const metadata={title:"Alerty lotnicze | HopTrip",robots:{index:false,follow:false},referrer:"no-referrer" as const};

export default async function AlertsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const enabled=await alertsEnabled();
  const raw=await searchParams,initial:Filters={};
  for(const key of ["origin","budget","destination","duration_min","duration_max","departure_from","departure_to"] as const)
    if(typeof raw[key]==="string")initial[key]=raw[key];
  const [airports,destinations]=enabled?await Promise.all([getAirports().catch(()=>[]),getDestinations().catch(()=>[])]):[[],[]];
  const origins=matchingAirports(airports,initial.origin??"");
  initial.origin=origins.length===1?origins[0].iata_code:"";
  return <main className="page-shell"><h1>Loty dopasowane do Ciebie</h1>
    {enabled ? <><p>Wybierz trasę, cenę i długość pobytu. Najpierw potwierdzisz email. Wyślemy nowe pasujące loty, najwyżej raz na dobę.</p>
      <AlertForm mode="signup" airports={airports} destinations={destinations} initial={initial}/></>:
      <p>Zapisy na alerty są obecnie niedostępne. Sprawdź aktualne loty w <Link href="/deals">katalogu ofert</Link>.</p>}
  </main>;
}
