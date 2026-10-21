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
import {date,tripNights} from "../../../lib/i18n/format";
import {getMessages} from "../../../lib/i18n/messages";
import {Price} from "../../components/price";
import {DealViewTracker} from "../../components/deal-view-tracker";
import {Outbound} from "../../components/outbound";
import {ScoreDetails} from "../../components/score-details";
import {DestinationGuides} from "../../components/destination-guides";
import {DestinationActivities} from "../../components/destination-activities";
import {TripAccommodation} from "../../components/trip-accommodation";
import {TripBudgetCalculator} from "../../components/trip-budget-calculator";
import {budgetForTrip} from "../../../lib/trip-budget";
import {socialMetadata} from "../../../lib/catalog-pages";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>;locale?:Locale};
export async function generateMetadata({params,locale="pl"}:Props) {
  const pl=getMessages(locale),t=(source:TripKey)=>tripText(locale,source);
  const {slug}=await params;
  const deal=await getDeal(slug);
  if(!deal)notFound();
  const metadata=socialMetadata({title:deal ? `${originLabel(deal.origin_city,deal.origin_code,locale)} → ${cityLabel(deal.destination_city,deal.destination_slug,locale)} | HopTrip` : pl.notFound,
    description:deal ? `${originLabel(deal.origin_city,deal.origin_code,locale)} → ${cityLabel(deal.destination_city,deal.destination_slug,locale)}. ${date(deal.trip_start,locale)}${deal.trip_type==="ROUND_TRIP" ? ` – ${date(deal.trip_end,locale)}` : ""}. ${deal.trip_type==="ROUND_TRIP" ? pl.roundTrip : pl.oneWay}. ${t("Sprawdź cenę lotu i zaplanuj budżet podróży.")}` : pl.notFound,
    path:`/deals/${encodeURIComponent(slug)}`,image:`/preview/deal/${encodeURIComponent(slug)}`});
  const path=`/deals/${encodeURIComponent(slug)}`;
  return {...metadata,alternates:{canonical:localizedHref(path,locale),languages:languageAlternates(path,locales)},
    openGraph:{...metadata.openGraph,url:localizedHref(path,locale),locale:openGraphLocales[locale],...(locale!=="pl" ? {images:[]} : {})},
    twitter:{...metadata.twitter,...(locale!=="pl" ? {card:"summary" as const,images:[]} : {})}};
}
export default async function DealPage({params,locale="pl"}:Props) {
  const pl=getMessages(locale),t=(source:TripKey)=>tripText(locale,source);
  const deal=await getDeal((await params).slug);
  if (!deal) notFound();
  return <main className="page-shell"><Link className="back-link" href={localizedHref("/deals",locale)}>← {pl.deals}</Link><TripDraftProvider key={deal.slug} tripId={deal.slug} initialInput={budgetForTrip(deal)} start={deal.trip_start} end={deal.trip_type==="ROUND_TRIP" ? deal.trip_end : ""} adultsOnly><article className="offer-detail">
    <DealViewTracker dealSlug={deal.slug}/>
    <header className="page-heading"><p className="eyebrow">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</p><h1>{originLabel(deal.origin_city,deal.origin_code,locale)} ({deal.origin_code}) → {cityLabel(deal.destination_city,deal.destination_slug,locale)}<CountryFlag code={deal.destination_country_code} locale={locale}/></h1>
    <p className="lead">{t("Daty oferty:")} {date(deal.trip_start,locale)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end,locale)}`}</p>{tripNights(deal,locale) && <p>{tripNights(deal,locale)} {t("planowanego pobytu — daty noclegu sprawdź osobno.")}</p>}</header>
    <TripNavigation locale={locale}/>
    <div id="trip-flight" tabIndex={-1} className="detail-layout"><section className="featured-card detail-summary" aria-label={t("Cena lotu")}><p className="eyebrow">{pl.perPerson} · PLN</p>
    <p className="deal-price"><Price value={deal.price_per_person_pln} locale={locale}/> <span>{flightPriceBasis(deal,locale)}</span></p>
    <PriceSummary deal={deal} locale={locale}/><FlightSchedule deal={deal} compact locale={locale}/><TripDetails deal={deal} locale={locale}/>
    <p><a className="button button-secondary" href="#calculator">{t("Policz budżet całej podróży")}</a></p>

    </section><section className="booking-card" aria-label={t("Przejście do partnera")}><span className="badge">{pl.partners}</span>
    {deal.components.length ? deal.components.map(c=><section className="booking-component" key={c.id}><p className="booking-price"><Price value={c.price_pln} locale={locale}/>{c.component_type==="FLIGHT" && <span className="flight-price-basis">{flightPriceBasis(deal,locale)}</span>}</p><Outbound component={c} dealSlug={deal.slug}/></section>) : <p>{pl.noLink}</p>}
    <p className="muted">{pl.disclosure}</p></section></div>
    <TripAccommodation key={deal.slug} deal={deal}/>
    <TripBudgetCalculator key={deal.slug} tripId={deal.slug} shareOffer={{slug:deal.slug,origin:originLabel(deal.origin_city,deal.origin_code),destination:cityLabel(deal.destination_city,deal.destination_slug),start:deal.trip_start,end:deal.trip_type==="ROUND_TRIP" ? deal.trip_end : "",price:deal.flight_price_pln ?? "",observedAt:deal.last_verified_at ?? ""}} start={deal.trip_start} end={deal.trip_type==="ROUND_TRIP" ? deal.trip_end : ""} destinationSlug={deal.destination_slug} initialInput={budgetForTrip(deal)} note={deal.trip_type==="ONE_WAY"
      ? t("To lot w jedną stronę. Uzupełnij koszt powrotu, jeśli go planujesz. Liczba nocy i dni to wartości przykładowe — dopasuj je do swojego pobytu.")
      : t("Cena lotu pochodzi z tej oferty, a liczba nocy i dni z dat podróży. Sprawdź ceny u sprzedawcy i dopasuj liczbę osób oraz pozostałe koszty.")}/>
    <section className="rationale" id="score"><div className="section-heading"><h2>{t("Cena na tle historii")}</h2></div>
    <ScoreDetails deal={deal} locale={locale}/></section>
    <DestinationActivities slug={deal.destination_slug} inTrip locale={locale}/>
    <DestinationGuides slug={deal.destination_slug} locale={locale}/>
  </article></TripDraftProvider></main>;
}
