import {searchFilters,searchSeo,searchUrl} from "../../lib/search-policy";
import {Suspense} from "react";
import LoadingDeals from "../components/loading-deals";
import {analyticsFilters} from "../../lib/analytics-context";
import {SearchResultTracker} from "../components/search-result-tracker";
import Link from "next/link";
import {alertsEnabled,getAirports,getDestinations,getDealResults,Filters,Deal,Airport,Destination,ApiError} from "../../lib/api";
import {getMessages} from "../../lib/i18n/messages";
import {intlLocales,locales,openGraphLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref,languageAlternates} from "../../lib/i18n/routing";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import {filterText} from "../../lib/i18n/filter-copy";
import {DealGrid} from "../components/catalog";
import {FilterForm} from "../components/filters";
import {catalogPage,socialMetadata} from "../../lib/catalog-pages";
import {CatalogIntro} from "../components/catalog-intro";
import {landingPage,landingMetadata} from "../../lib/i18n/landing-copy";
export const dynamic="force-dynamic";
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>;path?:string;locale?:Locale};
export async function generateMetadata({searchParams,path="/deals",locale="pl"}:Props) {
  const raw=await searchParams,page=catalogPage(path)!;
  const seo=searchSeo(raw,path);
  const metadata=socialMetadata({title:seo.index ? page.title : `Wyniki wyszukiwania lotów | HopTrip`,
    description:page.description,path:seo.canonical,image:"/preview/catalog/deals",index:seo.index});
  if(path!=="/deals")return landingMetadata(metadata,path,locale);
  const messages=getMessages(locale),title=locale==="pl" ? String(metadata.title) : seo.index ? messages.title : catalogText(locale,"Wyniki wyszukiwania lotów | HopTrip"),description=locale==="pl" ? page.description : messages.description;
  const canonical=localizedHref(seo.canonical,locale);
  return {...metadata,title,description,alternates:{canonical,languages:languageAlternates(seo.canonical,locales)},
    openGraph:{...metadata.openGraph,title,description,url:canonical,locale:openGraphLocales[locale],...(locale!=="pl" ? {images:[]} : {})},
    twitter:{...metadata.twitter,title,description,...(locale!=="pl" ? {card:"summary" as const,images:[]} : {})}};
}
async function DealResultsPage({searchParams,path="/deals",locale="pl"}:Props) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  const catalogPath=localizedHref(path,locale);
  const raw=await searchParams;
  const filters=searchFilters(raw,path);
  const landing=path!=="/deals" ? landingPage(path,locale) : undefined;
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
    error=e instanceof ApiError && e.code==="UNKNOWN_DESTINATION" ? filterText(locale,"Nie znaleziono kierunku. Wybierz miasto z podpowiedzi lub zostaw pole puste.") :
      e instanceof ApiError && e.code==="AMBIGUOUS_DESTINATION" ? filterText(locale,"Ta nazwa wskazuje kilka kierunków. Wybierz miasto z listy.") :
      e instanceof ApiError && e.code==="UNKNOWN_ORIGIN" ? filterText(locale,"Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA.") :
      e instanceof ApiError && e.code==="AMBIGUOUS_ORIGIN" ? filterText(locale,"To miasto ma kilka lotnisk. Wybierz konkretne lotnisko z listy.") :
      e instanceof ApiError && [404,422].includes(e.status) ? pl.invalid : pl.error;
  }
  const searchError=offers.status==="rejected" && offers.reason instanceof ApiError && [404,422].includes(offers.reason.status) ? "invalid_filters" as const : "unavailable" as const;
  const offset=Number(filters.offset ?? 0);
  function pageLink(next:number) {
    const query=new URLSearchParams({...filters,offset:String(next)});
    return localizedHref(searchUrl(path,Object.fromEntries(query)),locale);
  }
  return <main className="page-shell catalog-page"><header className="page-heading"><p className="eyebrow">{t("Loty z Polski")}</p><h1>{landing?.heading ?? pl.deals}</h1><p className="lead">{landing?.intro ?? pl.flightOnly}</p></header>

    <SearchResultTracker context={{filters:analyticsFilters(filters,airports,destinations),...(error ? {error:searchError} : {result_count:deals.length})}}/>
    <FilterForm key={new URLSearchParams(filters).toString()} filters={filters} airports={airports} destinations={destinations} path={catalogPath}/>
    {error ? <section className="notice" role="alert"><h2>{searchError==="invalid_filters" ? t("Sprawdź parametry wyszukiwania") : t("Nie udało się pobrać ofert")}</h2><p>{error}</p>
      {searchError==="unavailable" ? <a href={pageLink(Number.isFinite(offset) ? offset : 0)}>{t("Spróbuj ponownie")}</a> : <Link href={localizedHref("/deals",locale)}>{t("Wyczyść parametry wyszukiwania")}</Link>}
    </section> : <>
      <p className="result-count" role="status">{t("Liczba ofert:")} <strong>{total.toLocaleString(intlLocales[locale])}</strong>{deals.length>0 && ` · ${t("Wyświetlane:")} ${offset+1}–${offset+deals.length}`}</p>
      {deals.length ? <DealGrid deals={deals} locale={locale}/> : <section className="empty-state">
        <h2>{total>0 ? t("Na tej stronie nie ma ofert") : t("Brak aktualnych ofert")}</h2>
        {total>0 ? <Link href={pageLink(0)}>{t("Wróć do pierwszej strony wyników")}</Link> : <>
          <p>{t("Zmień wybrany warunek, aby rozszerzyć wyszukiwanie. Filtry pozostają bez zmian, dopóki nie wybierzesz opcji.")}</p>
          {relaxation(filters,locale)}
        </>}
      </section>}
      <nav className="pagination" aria-label={t("Strony ofert")}>
        {offset>0 && <Link href={pageLink(Math.max(0,offset-12))}>{pl.previous}</Link>}
        {offset+deals.length<total && deals.length>0 && offset+12<=10000 && <Link href={pageLink(offset+12)}>{pl.next}</Link>}
      </nav>
      {offset+12>10000 && offset+deals.length<total && <p>{t("Zawęź filtry, aby przejrzeć dalsze oferty.")}</p>}
    </>}
    <p>{alerts.status==="fulfilled" && alerts.value && <><Link href={localizedHref(`/alerts?${alertQuery}`,locale)}>{filters.origin==="WAW,WMI" ? t("Wybierz lotnisko dla powiadomień") : t("Powiadom mnie o pasujących lotach")}</Link>{" · "}</>}<Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link></p>
    {landing && <CatalogIntro page={landing} showIntro={false} locale={locale}/> }
    {locale==="pl" && !Object.values(filters).some(Boolean) && <CatalogIntro page={catalogPage("/deals")!}/>}
  </main>;
}

function relaxation(filters:Filters,locale:Locale) {
  const t=(source:CatalogKey)=>catalogText(locale,source);
  const choices=[
    {keys:["budget"],label:"Usuń limit ceny"},
    {keys:["weekend"],label:"Pokaż też inne dni tygodnia"},
    {keys:["duration_min","duration_max"],label:"Usuń ograniczenie liczby nocy"},
    {keys:["departure_from","departure_to"],label:"Poszerz wyszukiwanie na inne daty"},
    {keys:["destination"],label:"Pokaż inne kierunki"},
    {keys:["origin"],label:"Pokaż inne lotniska wylotu"},
  ] as const;
  const choice=choices.find(c=>c.keys.some(k=>k==="weekend" ? ["true","1","on","yes"].includes((filters.weekend??"").toLowerCase()) : Boolean(filters[k as keyof Filters])));
  if(!choice)return <Link href={localizedHref("/info/price-freshness",locale)}>{t("Sprawdź, jak aktualizujemy oferty")}</Link>;
  const query=new URLSearchParams(filters);
  for(const key of [...choice.keys,"offset"])query.delete(key);
  return <Link href={localizedHref(query.size ? `/deals?${query}` : "/deals",locale)}>{t(choice.label)}</Link>;
}

export default async function DealsPage({searchParams,path="/deals",locale="pl"}:Props) {
  const raw=await searchParams;
  return <Suspense key={JSON.stringify(raw)} fallback={<LoadingDeals locale={locale}/>}>
    <DealResultsPage searchParams={Promise.resolve(raw)} path={path} locale={locale}/>
  </Suspense>;
}
