import Link from "next/link";
import {getAirports,getDeals,Filters,Deal,Airport,ApiError} from "../../lib/api";
import {pl} from "../../lib/pl";
import {DealGrid} from "../components/catalog";
import {FilterForm} from "../components/filters";
import {catalogPage,socialMetadata} from "../../lib/catalog-pages";
import {CatalogIntro} from "../components/catalog-intro";
export const dynamic="force-dynamic";
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:Props) {
  const raw=await searchParams,page=catalogPage("/deals")!;
  const query=new URLSearchParams();
  for(const key of ["origin","destination","departure_from","departure_to","budget","duration_min","duration_max","offset"]) {
    if(typeof raw[key]==="string" && raw[key])query.set(key,raw[key]);
  }
  return socialMetadata({title:query.size ? `Wyniki wyszukiwania lotów | HopTrip` : page.title,
    description:page.description,path:query.size ? `/deals?${query}` : "/deals",image:"/preview/catalog/deals",index:!query.size});
}
export default async function DealsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const raw=await searchParams;
  const filters:Filters={};
  for (const key of ["origin","destination","departure_from","departure_to","budget","duration_min","duration_max","offset"] as const) {
    if (typeof raw[key] === "string") filters[key]=raw[key];
  }
  let deals:Deal[]=[],airports:Airport[]=[],error="";
  const [offers,origins]=await Promise.allSettled([getDeals({...filters,limit:"12"}),getAirports()]);
  if(origins.status==="fulfilled")airports=origins.value;
  if(offers.status==="fulfilled")deals=offers.value;
  else {
    const e=offers.reason;
    error=e instanceof ApiError && e.code==="UNKNOWN_ORIGIN" ? "Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA." :
      e instanceof ApiError && e.code==="AMBIGUOUS_ORIGIN" ? "To miasto ma kilka lotnisk. Wybierz konkretne lotnisko z listy." :
      e instanceof ApiError && [404,422].includes(e.status) ? pl.invalid : pl.error;
  }
  const offset=Number(filters.offset ?? 0);
  function pageLink(next:number) {
    const query=new URLSearchParams({...filters,offset:String(next)});
    return "/deals?"+query;
  }
  return <main className="page-shell catalog-page"><header className="page-heading"><p className="eyebrow">Loty z Polski</p><h1>{pl.deals}</h1><p className="lead">{pl.flightOnly}</p></header>
    <FilterForm key={new URLSearchParams(filters).toString()} filters={filters} airports={airports}/>
    {error ? <p className="notice" role="alert">{error}</p> : <><DealGrid deals={deals}/><nav className="pagination" aria-label="Strony ofert">
      {offset > 0 && <Link href={pageLink(Math.max(0,offset-12))}>{pl.previous}</Link>}
      {deals.length === 12 && offset < 9996 && <Link href={pageLink(offset+12)}>{pl.next}</Link>}
    </nav></>}
    {!Object.values(filters).some(Boolean) && <CatalogIntro page={catalogPage("/deals")!}/>}
  </main>;
}
