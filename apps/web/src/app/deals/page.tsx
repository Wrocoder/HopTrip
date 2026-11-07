import {searchFilters,searchSeo,searchUrl} from "../../lib/search-policy";
import {analyticsFilters} from "../../lib/analytics-context";
import {SearchResultTracker} from "../components/search-result-tracker";
import Link from "next/link";
import {alertsEnabled,getAirports,getDestinations,getDealResults,Deal,Airport,Destination,ApiError} from "../../lib/api";
import {getMessages} from "../../lib/i18n/messages";
import {intlLocales,locales,openGraphLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref,languageAlternates} from "../../lib/i18n/routing";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import {filterText} from "../../lib/i18n/filter-copy";
import {DealGrid} from "../components/catalog";
import {FilterForm} from "../components/filters";
import {catalogPage,socialMetadata} from "../../lib/catalog-pages";
import {CatalogIntro,CatalogLinks} from "../components/catalog-intro";
import {landingPage,landingMetadata} from "../../lib/i18n/landing-copy";
import {OfferState} from '../components/offer-state';
import {searchRecovery} from '../../lib/search-recovery';
import {stateText} from '../../lib/i18n/state-copy';
import {AirportContext} from '../components/airport-context';
import {weekendCopy} from '../../lib/weekend';
import {destinationTimeCopy} from '../../lib/destination-time';
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
    error=e instanceof ApiError && e.code==='DESTINATION_TIME_QUERY_TOO_BROAD' ? destinationTimeCopy[locale].broad :
      e instanceof ApiError && e.code==='DESTINATION_TIME_UNSUPPORTED' ? destinationTimeCopy[locale].unsupported :
      e instanceof ApiError && e.code==='WEEKEND_QUERY_TOO_BROAD' ? weekendCopy[locale].broad :
      e instanceof ApiError && ['CONFLICTING_WEEKEND_FILTERS','WORK_HOURS_REQUIRE_NO_LEAVE','INVALID_WORK_HOURS'].includes(e.code??'') ? weekendCopy[locale].invalid :
      e instanceof ApiError && e.code==="UNKNOWN_DESTINATION" ? filterText(locale,"Nie znaleziono kierunku. Wybierz miasto z podpowiedzi lub zostaw pole puste.") :
      e instanceof ApiError && e.code==="AMBIGUOUS_DESTINATION" ? filterText(locale,"Ta nazwa wskazuje kilka kierunków. Wybierz miasto z listy.") :
      e instanceof ApiError && e.code==="UNKNOWN_ORIGIN" ? filterText(locale,"Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA.") :
      e instanceof ApiError && e.code==="AMBIGUOUS_ORIGIN" ? filterText(locale,"To miasto ma kilka lotnisk. Wybierz konkretne lotnisko z listy.") :
      e instanceof ApiError && [404,422].includes(e.status) ? pl.invalid : pl.error;
  }
  const searchError=offers.status==="rejected" && offers.reason instanceof ApiError && [404,422].includes(offers.reason.status) ? "invalid_filters" as const : "unavailable" as const;
  const temporary=offers.status==='rejected' && offers.reason instanceof ApiError && [502,503,504].includes(offers.reason.status)&&offers.reason.code!=='DESTINATION_TIME_UNSUPPORTED';
  const recovery=searchRecovery(filters).slice(0,3);
  const offset=Number(filters.offset ?? 0);
  function pageLink(next:number) {
    const query=new URLSearchParams({...filters,offset:String(next)});
    return localizedHref(searchUrl(path,Object.fromEntries(query)),locale);
  }
  return <main className="page-shell catalog-page"><header className="page-heading"><p className="eyebrow">{t("Loty z Polski")}</p><h1>{landing?.heading ?? pl.deals}</h1><p className="lead">{landing?.intro ?? pl.flightOnly}</p></header>

    <SearchResultTracker context={{filters:analyticsFilters(filters,airports,destinations),...(error ? {error:searchError} : {result_count:deals.length})}}/>
    {path==='/tanie-loty-na-weekend'&&landing&&<CatalogLinks page={landing} locale={locale} filters={filters}/>}
    <FilterForm key={new URLSearchParams(filters).toString()} filters={filters} airports={airports} destinations={destinations} path={catalogPath}/>
    {error ? <OfferState kind="error" title={searchError==="invalid_filters" ? t("Sprawdź parametry wyszukiwania") : t("Nie udało się pobrać ofert")} actions={<>
      {searchError==="unavailable" ? <a href={localizedHref(searchUrl(path,filters),locale)}>{t("Spróbuj ponownie")}</a> : <a href="#search-filters">{stateText(locale,'Popraw wybrane filtry')}</a>}
      <Link prefetch={false} href={localizedHref('/deals',locale)}>{t('Wyczyść parametry wyszukiwania')}</Link>
    </>}><p>{temporary ? stateText(locale,'Oferty są chwilowo niedostępne. Spróbuj ponownie z tymi samymi warunkami.') : error}</p></OfferState> : <>
      <p className="result-count" role="status">{t("Liczba ofert:")} <strong>{total.toLocaleString(intlLocales[locale])}</strong>{deals.length>0 && ` · ${t("Wyświetlane:")} ${offset+1}–${offset+deals.length}`}</p>
      {deals.length ? <DealGrid deals={deals} locale={locale} returnTo={Object.keys(filters).length ? searchUrl("/deals",filters) : undefined}/> : <OfferState kind="empty" title={total>0 ? t("Na tej stronie nie ma ofert") : t("Brak aktualnych ofert")} actions={total>0 ? <Link prefetch={false} href={pageLink(0)}>{t("Wróć do pierwszej strony wyników")}</Link> : <>
        {recovery.map(option=><Link key={option.label} prefetch={false} href={localizedHref(option.href,locale)}>{t(option.label)}</Link>)}
        {recovery.length===0 && <Link prefetch={false} href={localizedHref('/info/price-freshness',locale)}>{t('Sprawdź, jak aktualizujemy oferty')}</Link>}
      </>}><p>{t("Zmień wybrany warunek, aby rozszerzyć wyszukiwanie. Filtry pozostają bez zmian, dopóki nie wybierzesz opcji.")}</p></OfferState>}
      <nav className="pagination" aria-label={t("Strony ofert")}>
        {offset>0 && <Link href={pageLink(Math.max(0,offset-12))}>{pl.previous}</Link>}
        {offset+deals.length<total && deals.length>0 && offset+12<=10000 && <Link href={pageLink(offset+12)}>{pl.next}</Link>}
      </nav>
      {offset+12>10000 && offset+deals.length<total && <p>{t("Zawęź filtry, aby przejrzeć dalsze oferty.")}</p>}
    </>}
    {!error && path==='/from/warszawa' && <AirportContext airports={airports} deals={deals} filters={filters} locale={locale}/>}
    <p>{filters.weekend_mode ? <>{weekendCopy[locale].alert}{' '}<Link href={localizedHref('/alerts',locale)}>{t('Powiadom mnie o pasujących lotach')}</Link>{' · '}</> : alerts.status==="fulfilled" && alerts.value && <><Link href={localizedHref(`/alerts?${alertQuery}`,locale)}>{filters.origin==="WAW,WMI" ? t("Wybierz lotnisko dla powiadomień") : t("Powiadom mnie o pasujących lotach")}</Link>{" · "}</>}<Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link></p>
    {landing && <CatalogIntro page={landing} showIntro={false} showLinks={path!=='/tanie-loty-na-weekend'} locale={locale}/> }
    {locale==="pl" && !Object.values(filters).some(Boolean) && <CatalogIntro page={catalogPage("/deals")!}/>}
  </main>;
}

export default async function DealsPage({searchParams,path="/deals",locale="pl"}:Props) {
  const raw=await searchParams;
  // Keep the initial results usable without script. Interactive filter updates
  // retain their existing transition/pending feedback in FilterForm.
  return <DealResultsPage key={JSON.stringify(raw)} searchParams={Promise.resolve(raw)} path={path} locale={locale}/>;
}
