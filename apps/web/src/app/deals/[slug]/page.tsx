import {timelineView,timelineCopy} from "../../../lib/trip-timeline";
import {locales,openGraphLocales,type Locale} from "../../../lib/i18n/config";
import {localizedHref,languageAlternates} from "../../../lib/i18n/routing";
import {tripText,type TripKey} from "../../../lib/i18n/trip-copy";
import {TripNavigation} from "../../components/trip-navigation";
import {TripDraftProvider} from "../../components/trip-draft";
import {TripDetails} from "../../components/trip-details";
import {FlightSchedule} from "../../components/flight-schedule";
import {PriceSummary} from "../../components/price-assessment";
import {CountryFlag} from "../../components/country-flag";
import {flightPriceBasis} from "../../../lib/flight-facts";
import {cityLabel,originLabel} from "../../../lib/cities";
import {notFound} from "next/navigation";
import Link from "next/link";
import {getDeal} from "../../../lib/api";
import {date} from "../../../lib/i18n/format";
import {getMessages} from "../../../lib/i18n/messages";
import {Price} from "../../components/price";
import {PriceFreshness} from "../../components/price-freshness";
import {offerDeadline} from "../../../lib/offer-expiry";
import {DealViewTracker} from "../../components/deal-view-tracker";
import {Outbound} from "../../components/outbound";
import {ScoreDetails} from "../../components/score-details";
import {DestinationGuides} from "../../components/destination-guides";
import {DestinationActivities} from "../../components/destination-activities";
import {TripEvents} from "../../components/trip-events";
import {activitiesForDestination} from "../../../lib/destination-activities";
import {TripAccommodation} from "../../components/trip-accommodation";
import {TripBudgetCalculator} from "../../components/trip-budget-calculator";
import {budgetForTrip} from "../../../lib/trip-budget";
import {offerBudgetProvenance} from '../../../lib/budget-provenance';
import {socialMetadata} from "../../../lib/catalog-pages";
import {searchReturnPath} from "../../../lib/search-context";
import {cache} from 'react';
import {OfferState} from '../../components/offer-state';
import {stateText} from '../../../lib/i18n/state-copy';
import {tripSectionCopy} from '../../../lib/i18n/trip-section-copy';
export const dynamic="force-dynamic";
// Metadata and body share one outcome within a request, never across requests.
const loadDeal=cache(async(slug:string)=>{
  try{return {deal:await getDeal(slug),failed:false};}
  catch{return {deal:null,failed:true};}
});
type Props={params:Promise<{slug:string}>;locale?:Locale;searchParams?:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({params,locale="pl"}:Props) {
  const pl=getMessages(locale),t=(source:TripKey)=>tripText(locale,source);
  const {slug}=await params;
  const {deal,failed}=await loadDeal(slug);
  if(failed)return {title:stateText(locale,'Nie możemy teraz wczytać tej oferty.'),robots:{index:false,follow:true},alternates:{canonical:localizedHref(`/deals/${encodeURIComponent(slug)}`,locale)},openGraph:null,twitter:null};
  if(!deal)notFound();
  const metadata=socialMetadata({title:deal ? `${originLabel(deal.origin_city,deal.origin_code,locale)} → ${cityLabel(deal.destination_city,deal.destination_slug,locale)} | HopTrip` : pl.notFound,
    description:deal ? `${originLabel(deal.origin_city,deal.origin_code,locale)} → ${cityLabel(deal.destination_city,deal.destination_slug,locale)}. ${date(deal.trip_start,locale)}${deal.trip_type==="ROUND_TRIP" ? ` – ${date(deal.trip_end,locale)}` : ""}. ${deal.trip_type==="ROUND_TRIP" ? pl.roundTrip : pl.oneWay}. ${t("Sprawdź cenę lotu i zaplanuj budżet podróży.")}` : pl.notFound,
    path:`/deals/${encodeURIComponent(slug)}`,image:`/preview/deal/${encodeURIComponent(slug)}`});
  const path=`/deals/${encodeURIComponent(slug)}`;
  return {...metadata,alternates:{canonical:localizedHref(path,locale),languages:languageAlternates(path,locales)},
    openGraph:{...metadata.openGraph,url:localizedHref(path,locale),locale:openGraphLocales[locale],...(locale!=="pl" ? {images:[]} : {})},
    twitter:{...metadata.twitter,...(locale!=="pl" ? {card:"summary" as const,images:[]} : {})}};
}
export default async function DealPage({params,searchParams,locale="pl"}:Props) {
  const pl=getMessages(locale),t=(source:TripKey)=>tripText(locale,source);
  const {slug}=await params;
  const {deal,failed}=await loadDeal(slug);
  const back=searchReturnPath((await searchParams)?.returnTo);
  if(failed)return <main className="page-shell"><OfferState kind="error" heading="h1" title={stateText(locale,'Nie możemy teraz wczytać tej oferty.')} actions={<><a href={localizedHref(`/deals/${encodeURIComponent(slug)}${back==='/deals'?'':`?returnTo=${encodeURIComponent(back)}`}`,locale)}>{pl.retry}</a><Link prefetch={false} href={localizedHref(back,locale)}>{stateText(locale,'Wróć do katalogu lotów')}</Link></>}><p>{stateText(locale,'Oferty są chwilowo niedostępne. Spróbuj ponownie z tymi samymi warunkami.')}</p></OfferState></main>;
  if (!deal) notFound();
  return <main className="page-shell"><Link className="back-link" href={localizedHref(back,locale)}>← {pl.deals}</Link><TripDraftProvider key={deal.slug} tripId={deal.slug} initialInput={budgetForTrip(deal)} initialProvenance={offerBudgetProvenance(deal)} start={deal.trip_start} end={deal.trip_type==="ROUND_TRIP" ? deal.trip_end : ""} adultsOnly><article className="offer-detail">
    <DealViewTracker dealSlug={deal.slug}/>
    <header className="page-heading"><p className="eyebrow">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</p><h1>{originLabel(deal.origin_city,deal.origin_code,locale)} ({deal.origin_code}) → {cityLabel(deal.destination_city,deal.destination_slug,locale)}<CountryFlag code={deal.destination_country_code} locale={locale}/></h1>
    <p className="lead">{timelineCopy[locale].departures+":"} {date(deal.trip_start,locale)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end,locale)}`}</p>{timelineView(deal,locale).nights && <p>{timelineView(deal,locale).nights} {t("planowanego pobytu — daty noclegu sprawdź osobno.")}</p>}</header>
    <TripNavigation locale={locale}/>
    <section id="trip-flight" tabIndex={-1} aria-label={tripSectionCopy[locale].flight}>
    <div className="detail-layout"><section className="detail-panel detail-summary" aria-label={t("Cena lotu")}><p className="eyebrow">{pl.perPerson} · PLN</p>
    <p className="deal-price"><Price value={deal.price_per_person_pln} locale={locale}/> <span>{flightPriceBasis(deal,locale)}</span></p>
    <PriceFreshness deal={deal} locale={locale} id="flight-price-freshness"/>
    <PriceSummary deal={deal} locale={locale}/>
    <h2>{t('Szczegóły lotu')}</h2>
    <FlightSchedule deal={deal} compact detail locale={locale}/>
    <p className="detail-cost-scope"><span className="flight-cost-scope">{t('Cena dotyczy lotu. Nocleg nie jest wliczony.')}</span> <span className="flight-baggage-scope">{t('Bagaż do sprawdzenia')}</span></p>
    <TripDetails deal={deal} locale={locale} includePrice={false}/>

    </section><section id="trip-booking" tabIndex={-1} className="booking-card" aria-labelledby="trip-booking-title"><h2 id="trip-booking-title">{t("Przejście do partnera")}</h2><span className="badge">{pl.partners}</span>
    {deal.components.length ? deal.components.map(c=><section className="booking-component" key={c.id}><p className="booking-price"><Price value={c.price_pln} locale={locale}/>{c.component_type==="FLIGHT" && <span className="flight-price-basis">{flightPriceBasis(deal,locale)}</span>}</p><Outbound component={c} dealSlug={deal.slug} hiddenAfter={offerDeadline(deal)}/></section>) : <p>{pl.noLink}</p>}
    <p className="muted">{pl.disclosure}</p></section></div>
    <section className="rationale" id="score" tabIndex={-1}><h2>{t("Cena na tle historii")}</h2>
    <ScoreDetails deal={deal} locale={locale}/></section>
    </section>
    <section id="trip-stay" tabIndex={-1} aria-labelledby="trip-stay-heading">
    <h2 id="trip-stay-heading">{tripSectionCopy[locale].stay}</h2>
    <TripAccommodation key={deal.slug} deal={deal}/>
    <DestinationActivities slug={deal.destination_slug} inTrip locale={locale}/>
    <TripEvents key={`events-${deal.slug}`} deal={deal} locale={locale} activitiesHref={activitiesForDestination(deal.destination_slug)?'#destination-activities':undefined}/>
    <DestinationGuides slug={deal.destination_slug} locale={locale}/>
    </section>
    <TripBudgetCalculator separateActions key={deal.slug} tripId={deal.slug} shareOffer={{slug:deal.slug,origin:originLabel(deal.origin_city,deal.origin_code),destination:cityLabel(deal.destination_city,deal.destination_slug),start:deal.trip_start,end:deal.trip_type==="ROUND_TRIP" ? deal.trip_end : "",price:deal.flight_price_pln ?? "",observedAt:deal.last_verified_at ?? ""}} start={deal.trip_start} end={deal.trip_type==="ROUND_TRIP" ? deal.trip_end : ""} destinationSlug={deal.destination_slug} initialInput={budgetForTrip(deal)} note={deal.trip_type==="ONE_WAY"
      ? t("To lot w jedną stronę. Uzupełnij koszt powrotu, jeśli go planujesz. Liczba nocy i dni to wartości przykładowe — dopasuj je do swojego pobytu.")
      : t("Cena lotu pochodzi z tej oferty, a liczba nocy i dni z dat podróży. Sprawdź ceny u sprzedawcy i dopasuj liczbę osób oraz pozostałe koszty.")}/>
  </article></TripDraftProvider></main>;
}
