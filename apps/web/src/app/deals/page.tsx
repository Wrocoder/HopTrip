import Link from "next/link";
import {getDeals,Filters,Deal,ApiError} from "../../lib/api";
import {pl} from "../../lib/pl";
import {DealGrid} from "../components/catalog";
import {FilterForm} from "../components/filters";
export const dynamic="force-dynamic";
export const metadata={title:pl.deals,alternates:{canonical:"/deals"},robots:{index:false,follow:true}};
export default async function DealsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const raw=await searchParams;
  const filters:Filters={};
  for (const key of ["origin","destination","departure_from","departure_to","budget","duration_min","duration_max","offset"] as const) {
    if (typeof raw[key] === "string") filters[key]=raw[key];
  }
  let deals:Deal[]=[],error="";
  try {deals=await getDeals({...filters,limit:"12"});}
  catch(e) {error=e instanceof ApiError && [404,422].includes(e.status) ? pl.invalid : pl.error;}
  const offset=Number(filters.offset ?? 0);
  function pageLink(next:number) {
    const query=new URLSearchParams({...filters,offset:String(next)});
    return "/deals?"+query;
  }
  return <main className="page-shell catalog-page"><header className="page-heading"><p className="eyebrow">Loty z Polski</p><h1>{pl.deals}</h1><p className="lead">{pl.flightOnly}</p></header>
    <FilterForm key={new URLSearchParams(filters).toString()} filters={filters}/>
    {error ? <p className="notice" role="alert">{error}</p> : <><DealGrid deals={deals}/><nav className="pagination" aria-label="Strony ofert">
      {offset > 0 && <Link href={pageLink(Math.max(0,offset-12))}>{pl.previous}</Link>}
      {deals.length === 12 && offset < 9996 && <Link href={pageLink(offset+12)}>{pl.next}</Link>}
    </nav></>}
  </main>;
}
