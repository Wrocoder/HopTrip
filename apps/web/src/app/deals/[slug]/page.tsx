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
import {pl,date,tripNights} from "../../../lib/pl";
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
import {socialMetadata} from "../../../lib/catalog-pages";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props) {
  const {slug}=await params;
  const deal=await getDeal(slug);
  if(!deal)notFound();
  return socialMetadata({title:deal ? `${originLabel(deal.origin_city,deal.origin_code)} → ${cityLabel(deal.destination_city,deal.destination_slug)} | HopTrip` : pl.notFound,
    description:deal ? `${originLabel(deal.origin_city,deal.origin_code)} → ${cityLabel(deal.destination_city,deal.destination_slug)}. ${date(deal.trip_start)}${deal.trip_type==="ROUND_TRIP" ? ` – ${date(deal.trip_end)}` : ""}. ${deal.trip_type==="ROUND_TRIP" ? pl.roundTrip : pl.oneWay}. Sprawdź cenę lotu i zaplanuj budżet podróży.` : pl.notFound,
    path:`/deals/${encodeURIComponent(slug)}`,image:`/preview/deal/${encodeURIComponent(slug)}`});
}
export default async function DealPage({params}:Props) {
  const deal=await getDeal((await params).slug);
  if (!deal) notFound();
  return <main className="page-shell"><Link className="back-link" href="/deals">← {pl.deals}</Link><TripDraftProvider key={deal.slug} tripId={deal.slug} initialInput={budgetForTrip(deal)} start={deal.trip_start} end={deal.trip_type==="ROUND_TRIP" ? deal.trip_end : ""} adultsOnly><article className="offer-detail">
    <DealViewTracker dealSlug={deal.slug}/>
    <header className="page-heading"><p className="eyebrow">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</p><h1>{originLabel(deal.origin_city,deal.origin_code)} ({deal.origin_code}) → {cityLabel(deal.destination_city,deal.destination_slug)}<CountryFlag code={deal.destination_country_code}/></h1>
    <p className="lead">Daty oferty: {date(deal.trip_start)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end)}`}</p>{tripNights(deal) && <p>{tripNights(deal)} planowanego pobytu — daty noclegu sprawdź osobno.</p>}</header>
    <TripNavigation hasEvents={Boolean(deal.events_supported)}/>
    <div id="trip-flight" tabIndex={-1} className="detail-layout"><section className="featured-card detail-summary" aria-label="Cena lotu"><p className="eyebrow">{pl.perPerson} · PLN</p>
    <p className="deal-price"><Price value={deal.price_per_person_pln}/> <span>{flightPriceBasis(deal)}</span></p>
    <PriceFreshness deal={deal} id="flight-price-freshness"/><PriceSummary deal={deal}/><FlightSchedule deal={deal} compact/><TripDetails deal={deal}/>
    <p><a className="button button-secondary" href="#calculator">Policz budżet całej podróży</a></p>

    </section><section className="booking-card" aria-label="Przejście do partnera"><span className="badge">{pl.partners}</span>
    {deal.components.length ? deal.components.map(c=><section className="booking-component" key={c.id}><p className="booking-price"><Price value={c.price_pln}/>{c.component_type==="FLIGHT" && <span className="flight-price-basis">{flightPriceBasis(deal)}</span>}</p><Outbound component={c} dealSlug={deal.slug} hiddenAfter={offerDeadline(deal)}/></section>) : <p>{pl.noLink}</p>}
    <p className="muted">{pl.disclosure}</p></section></div>
    <TripAccommodation key={deal.slug} deal={deal}/>
    <TripBudgetCalculator key={deal.slug} tripId={deal.slug} shareOffer={{slug:deal.slug,origin:originLabel(deal.origin_city,deal.origin_code),destination:cityLabel(deal.destination_city,deal.destination_slug),start:deal.trip_start,end:deal.trip_type==="ROUND_TRIP" ? deal.trip_end : "",price:deal.flight_price_pln ?? "",observedAt:deal.last_verified_at ?? ""}} start={deal.trip_start} end={deal.trip_type==="ROUND_TRIP" ? deal.trip_end : ""} destinationSlug={deal.destination_slug} initialInput={budgetForTrip(deal)} note={deal.trip_type==="ONE_WAY"
      ? "To lot w jedną stronę. Uzupełnij koszt powrotu, jeśli go planujesz. Liczba nocy i dni to wartości przykładowe — dopasuj je do swojego pobytu."
      : "Cena lotu pochodzi z tej oferty, a liczba nocy i dni z dat podróży. Sprawdź ceny u sprzedawcy i dopasuj liczbę osób oraz pozostałe koszty."}/>
    <section className="rationale" id="score"><div className="section-heading"><h2>Cena na tle historii</h2></div>
    <ScoreDetails deal={deal}/></section>
    <DestinationActivities slug={deal.destination_slug} inTrip/>
    <TripEvents key={'events-'+deal.slug} deal={deal} activitiesHref={activitiesForDestination(deal.destination_slug)?"#destination-activities":undefined}/>
    <DestinationGuides slug={deal.destination_slug}/>
  </article></TripDraftProvider></main>;
}
