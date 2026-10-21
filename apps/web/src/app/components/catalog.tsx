import {TripDetails} from "./trip-details";
import {FlightSchedule} from "./flight-schedule";
import {CountryFlag} from "./country-flag";
import {destinationInterval,flightPriceBasis} from "../../lib/flight-facts";
import {cityLabel,originLabel} from "../../lib/cities";
import Link from "next/link";
import {Deal} from "../../lib/api";
import {date,tripNights} from "../../lib/i18n/format";
import {getMessages} from "../../lib/i18n/messages";
import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {PriceSummary} from "./price-assessment";
import {Price} from "./price";
import {Impression} from "./deal-view-tracker";
import {ScoreDetails} from "./score-details";
import {ScoreTrigger} from "./score-trigger";
export function DealCard({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  return <article className="deal-card">
    <Impression slug={deal.slug}/>
    <div className="deal-card-top"><span className="badge">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</span>
    </div>
    <Link className="deal-card-link" href={localizedHref(`/deals/${deal.slug}`,locale)}>
    <p className="deal-origin">{originLabel(deal.origin_city,deal.origin_code,locale)} ({deal.origin_code}) <span aria-hidden="true">→</span></p>
    <h2>{cityLabel(deal.destination_city,deal.destination_slug,locale)}<CountryFlag code={deal.destination_country_code} locale={locale}/></h2>
    <p className="deal-dates">{t("Daty oferty:")} {date(deal.trip_start,locale)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end,locale)}`}</p>
    {tripNights(deal,locale) && <p className="deal-note">{tripNights(deal,locale)}</p>}
    <div className="deal-card-bottom">
    <p className="deal-price"><Price value={deal.price_per_person_pln} locale={locale}/> <span>{flightPriceBasis(deal,locale)}</span></p>
    <span className="card-arrow" aria-hidden="true">↗</span></div>
    </Link>
    <FlightSchedule deal={deal} compact locale={locale}/>
    {deal.trip_type==="ROUND_TRIP" && <p className="deal-note">{destinationInterval(deal.flight_facts?.destination_interval_minutes,locale) ? `${t("Między przylotem a odlotem:")} ${destinationInterval(deal.flight_facts?.destination_interval_minutes,locale)}${deal.flight_facts?.outbound_arrival_calculated ? ` (${t("szac.")})` : ""}.` : t("Czas na miejscu: brak pełnych danych o godzinach.")}</p>}
    <TripDetails deal={deal} locale={locale}/>
    {locale==="pl" ? <ScoreTrigger score={deal.deal_score} slug={deal.slug} destination={cityLabel(deal.destination_city,deal.destination_slug,locale)} provisional={deal.score_explanation?.status === "PROVISIONAL"}><ScoreDetails deal={deal}/></ScoreTrigger> : <><PriceSummary deal={deal} locale={locale}/><Link className="text-link" href={localizedHref(`/deals/${deal.slug}#score`,locale)}>{t("Cena na tle historii")} →</Link></>}
  </article>;
}
export function DealGrid({deals,locale="pl"}:{deals:Deal[];locale?:Locale}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  return deals.length ? <><section className="deal-grid">{deals.map(d=><DealCard key={d.slug} deal={d} locale={locale}/>)}</section><p className="catalog-note">{t("Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.")}</p></>
    : <div className="empty-state"><span className="empty-mark" aria-hidden="true">↗</span><p>{pl.empty}</p><Link className="text-link" href={localizedHref("/info/price-freshness",locale)}>{t("Co oznacza świeżość oferty")} <span aria-hidden="true">→</span></Link></div>;
}
