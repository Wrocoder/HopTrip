import Link from "next/link";
import {getDeals} from "../../lib/api";
import {DealGrid} from "./catalog";

export async function GuideFlights({destination}:{destination:{slug:string;name:string}}) {
 let deals;
 try {
  deals=await getDeals({destination:destination.slug,limit:"3"});
 } catch {
  return <section aria-label="Loty do opisanego miasta"><h2>Loty: {destination.name}</h2>
   <p>Nie udało się teraz pobrać lotów. Poradnik jest dostępny niezależnie od katalogu.</p>
   <Link href={`/destinations/${destination.slug}`}>Sprawdź loty ponownie</Link></section>;
 }
 return <section aria-label="Loty do opisanego miasta"><h2>Loty: {destination.name}</h2>
  <p>Aktualnie dostępne obserwacje cen lotów. Cena i dostępność wymagają potwierdzenia u sprzedawcy; nocleg i atrakcje planujesz osobno.</p>
  <DealGrid deals={deals}/>
  <Link className="text-link" href={`/destinations/${destination.slug}`}>Zobacz wszystkie loty: {destination.name}</Link>
 </section>;
}
