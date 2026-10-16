import {searchFilters,searchSeo,searchUrl} from "../../lib/search-policy";
import {Suspense} from "react";
import LoadingDeals from "../components/loading-deals";
import {analyticsFilters} from "../../lib/analytics-context";
import {SearchResultTracker} from "../components/search-result-tracker";
import Link from "next/link";
import {alertsEnabled,getAirports,getDestinations,getDealResults,Filters,Deal,Airport,Destination,ApiError} from "../../lib/api";
import {pl} from "../../lib/pl";
import {DealGrid} from "../components/catalog";
import {FilterForm} from "../components/filters";
import {catalogPage,socialMetadata} from "../../lib/catalog-pages";
import {CatalogIntro} from "../components/catalog-intro";
export const dynamic="force-dynamic";
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>;path?:string};
export async function generateMetadata({searchParams,path="/deals"}:Props) {
  const raw=await searchParams,page=catalogPage(path)!;
  const seo=searchSeo(raw,path);
  return socialMetadata({title:seo.index ? page.title : `Wyniki wyszukiwania lotów | HopTrip`,
    description:page.description,path:seo.canonical,image:"/preview/catalog/deals",index:seo.index});
}
async function DealResultsPage({searchParams,path="/deals"}:Props) {
  const raw=await searchParams;
  const filters=searchFilters(raw,path);
  const landing=path!=="/deals" ? catalogPage(path) : undefined;
  let total=0;
  let deals:Deal[]=[],airports:Airport[]=[],destinations:Destination[]=[],error="";
  const [offers,origins,places,alerts]=await Promise.allSettled([getDealResults({...filters,limit:"12",...(path==="/city-break" ? {round_trip:"true"} : {})}),getAirports(),getDestinations(),alertsEnabled()]);
  const alertQuery=new URLSearchParams(filters);
  if(filters.origin==="WAW,WMI")alertQuery.delete("origin");
  for(const key of ["offset","sort"])alertQuery.delete(key);
  if(origins.status==="fulfilled")airports=origins.value;
  if(places.status==="fulfilled")destinations=places.value;
  if(offers.status==="fulfilled"){deals=offers.value.items;total=offers.value.total;}
  else {
    const e=offers.reason;
    error=e instanceof ApiError && e.code==="UNKNOWN_DESTINATION" ? "Nie znaleziono kierunku. Wybierz miasto z podpowiedzi lub zostaw pole puste." :
      e instanceof ApiError && e.code==="AMBIGUOUS_DESTINATION" ? "Ta nazwa wskazuje kilka kierunków. Wybierz miasto z listy." :
      e instanceof ApiError && e.code==="UNKNOWN_ORIGIN" ? "Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA." :
      e instanceof ApiError && e.code==="AMBIGUOUS_ORIGIN" ? "To miasto ma kilka lotnisk. Wybierz konkretne lotnisko z listy." :
      e instanceof ApiError && [404,422].includes(e.status) ? pl.invalid : pl.error;
  }
  const searchError=offers.status==="rejected" && offers.reason instanceof ApiError && [404,422].includes(offers.reason.status) ? "invalid_filters" as const : "unavailable" as const;
  const offset=Number(filters.offset ?? 0);
  function pageLink(next:number) {
    const query=new URLSearchParams({...filters,offset:String(next)});
    return searchUrl(path,Object.fromEntries(query));
  }
  return <main className="page-shell catalog-page"><header className="page-heading"><p className="eyebrow">Loty z Polski</p><h1>{landing?.heading ?? pl.deals}</h1><p className="lead">{landing?.intro ?? pl.flightOnly}</p></header>

    <SearchResultTracker context={{filters:analyticsFilters(filters,airports,destinations),...(error ? {error:searchError} : {result_count:deals.length})}}/>
    <FilterForm key={new URLSearchParams(filters).toString()} filters={filters} airports={airports} destinations={destinations} path={path}/>
    {error ? <section className="notice" role="alert"><h2>{searchError==="invalid_filters" ? "Sprawdź parametry wyszukiwania" : "Nie udało się pobrać ofert"}</h2><p>{error}</p>
      {searchError==="unavailable" ? <a href={pageLink(Number.isFinite(offset) ? offset : 0)}>Spróbuj ponownie</a> : <Link href="/deals">Wyczyść parametry wyszukiwania</Link>}
    </section> : <>
      <p className="result-count" role="status">Liczba ofert: <strong>{total}</strong>{deals.length>0 && ` · Wyświetlane: ${offset+1}–${offset+deals.length}`}</p>
      {deals.length ? <DealGrid deals={deals}/> : <section className="empty-state">
        <h2>{total>0 ? "Na tej stronie nie ma ofert" : "Brak aktualnych ofert"}</h2>
        {total>0 ? <Link href={pageLink(0)}>Wróć do pierwszej strony wyników</Link> : <>
          <p>Zmień wybrany warunek, aby rozszerzyć wyszukiwanie. Filtry pozostają bez zmian, dopóki nie wybierzesz opcji.</p>
          {relaxation(filters)}
        </>}
      </section>}
      <nav className="pagination" aria-label="Strony ofert">
        {offset>0 && <Link href={pageLink(Math.max(0,offset-12))}>{pl.previous}</Link>}
        {offset+deals.length<total && deals.length>0 && offset+12<=10000 && <Link href={pageLink(offset+12)}>{pl.next}</Link>}
      </nav>
      {offset+12>10000 && offset+deals.length<total && <p>Zawęź filtry, aby przejrzeć dalsze oferty.</p>}
    </>}
    <p>{alerts.status==="fulfilled" && alerts.value && <><Link href={`/alerts?${alertQuery}`}>{filters.origin==="WAW,WMI" ? "Wybierz lotnisko dla powiadomień" : "Powiadom mnie o pasujących lotach"}</Link>{" · "}</>}<Link href="/saved">Zapisane wyjazdy</Link></p>
    {landing && <CatalogIntro page={landing} showIntro={false}/> }
    {!Object.values(filters).some(Boolean) && <CatalogIntro page={catalogPage("/deals")!}/>}
  </main>;
}

function relaxation(filters:Filters) {
  const choices=[
    {keys:["budget"],label:"Usuń limit ceny"},
    {keys:["weekend"],label:"Pokaż też inne dni tygodnia"},
    {keys:["duration_min","duration_max"],label:"Usuń ograniczenie liczby nocy"},
    {keys:["departure_from","departure_to"],label:"Poszerz wyszukiwanie na inne daty"},
    {keys:["destination"],label:"Pokaż inne kierunki"},
    {keys:["origin"],label:"Pokaż inne lotniska wylotu"},
  ];
  const choice=choices.find(c=>c.keys.some(k=>k==="weekend" ? ["true","1","on","yes"].includes((filters.weekend??"").toLowerCase()) : Boolean(filters[k as keyof Filters])));
  if(!choice)return <Link href="/info/price-freshness">Sprawdź, jak aktualizujemy oferty</Link>;
  const query=new URLSearchParams(filters);
  for(const key of [...choice.keys,"offset"])query.delete(key);
  return <Link href={query.size ? `/deals?${query}` : "/deals"}>{choice.label}</Link>;
}

export default async function DealsPage({searchParams,path="/deals"}:Props) {
  const raw=await searchParams;
  return <Suspense key={JSON.stringify(raw)} fallback={<LoadingDeals/>}>
    <DealResultsPage searchParams={Promise.resolve(raw)} path={path}/>
  </Suspense>;
}
