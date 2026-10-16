import {TripDetails} from "./trip-details";
import {FlightSchedule} from "./flight-schedule";
import {CountryFlag} from "./country-flag";
import {destinationInterval,flightPriceBasis} from "../../lib/flight-facts";
import {cityLabel,originLabel} from "../../lib/cities";
import Link from "next/link";
import {Deal} from "../../lib/api";
import {pl,date,tripNights} from "../../lib/pl";
import {Price} from "./price";
import {Impression} from "./deal-view-tracker";
import {ScoreDetails} from "./score-details";
import {ScoreTrigger} from "./score-trigger";
export function DealCard({deal}:{deal:Deal}) {
  return <article className="deal-card">
    <Impression slug={deal.slug}/>
    <div className="deal-card-top"><span className="badge">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</span>
    </div>
    <Link className="deal-card-link" href={`/deals/${deal.slug}`}>
    <p className="deal-origin">{originLabel(deal.origin_city,deal.origin_code)} ({deal.origin_code}) <span aria-hidden="true">→</span></p>
    <h2>{cityLabel(deal.destination_city,deal.destination_slug)}<CountryFlag code={deal.destination_country_code}/></h2>
    <p className="deal-dates">Daty oferty: {date(deal.trip_start)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end)}`}</p>
    {tripNights(deal) && <p className="deal-note">{tripNights(deal)}</p>}
    <div className="deal-card-bottom">
    <p className="deal-price"><Price value={deal.price_per_person_pln}/> <span>{flightPriceBasis(deal)}</span></p>
    <span className="card-arrow" aria-hidden="true">↗</span></div>
    </Link>
    <FlightSchedule deal={deal} compact/>
    {deal.trip_type==="ROUND_TRIP" && <p className="deal-note">{destinationInterval(deal.flight_facts?.destination_interval_minutes) ? `Między przylotem a odlotem: ${destinationInterval(deal.flight_facts?.destination_interval_minutes)}${deal.flight_facts?.outbound_arrival_calculated ? " (szac.)" : ""}.` : "Czas na miejscu: brak pełnych danych o godzinach."}</p>}
    <TripDetails deal={deal}/>
    <ScoreTrigger score={deal.deal_score} slug={deal.slug} destination={cityLabel(deal.destination_city,deal.destination_slug)} provisional={deal.score_explanation?.status === "PROVISIONAL"}><ScoreDetails deal={deal}/></ScoreTrigger>
  </article>;
}
export function DealGrid({deals}:{deals:Deal[]}) {
  return deals.length ? <><section className="deal-grid">{deals.map(d=><DealCard key={d.slug} deal={d}/>)}</section><p className="catalog-note">Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.</p></>
    : <div className="empty-state"><span className="empty-mark" aria-hidden="true">↗</span><p>{pl.empty}</p><Link className="text-link" href="/info/price-freshness">Co oznacza świeżość oferty <span aria-hidden="true">→</span></Link></div>;
}
