import {TripDetails} from "./trip-details";
import {FlightSchedule} from "./flight-schedule";
import {CountryFlag} from "./country-flag";
import {flightPriceBasis} from "../../lib/flight-facts";
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
import {PriceFreshness} from "./price-freshness";
import {Impression} from "./deal-view-tracker";
import {ScoreDetails} from "./score-details";
import {ScoreTrigger} from "./score-trigger";
export function DealCard({deal,locale="pl",returnTo}:{deal:Deal;locale?:Locale;returnTo?:string}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  const detailHref=localizedHref(`/deals/${deal.slug}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`,locale);
  return <article className="deal-card flight-offer-card">
    <Impression slug={deal.slug}/>
    <div className="deal-card-top"><span className="badge">{deal.trip_type === "ROUND_TRIP" ? pl.roundTrip : pl.oneWay}</span>
    </div>
    <Link className="deal-card-link" href={detailHref}>
    <p className="deal-origin">{originLabel(deal.origin_city,deal.origin_code,locale)} ({deal.origin_code}) <span aria-hidden="true">→</span></p>
    <h2>{cityLabel(deal.destination_city,deal.destination_slug,locale)}<CountryFlag code={deal.destination_country_code} locale={locale}/></h2>
    <p className="deal-dates">{t("Daty oferty:")} {date(deal.trip_start,locale)}{deal.trip_type === "ROUND_TRIP" && ` – ${date(deal.trip_end,locale)}`}</p>
    {tripNights(deal,locale) && <p className="deal-note">{tripNights(deal,locale)}</p>}
    <div className="deal-card-bottom">
    <p className="deal-price"><Price value={deal.price_per_person_pln} locale={locale}/> <span>{flightPriceBasis(deal,locale)}</span></p>
    <span className="card-cta">{t('Zobacz szczegóły lotu')} <span aria-hidden="true">→</span></span>
    </div>
    </Link>
    <PriceSummary deal={deal} locale={locale}/>
    <PriceFreshness deal={deal} compact locale={locale}/>
    <FlightSchedule deal={deal} compact card locale={locale}/>
    <p className="deal-note card-cost-scope">{t('Bez noclegu · bagaż do sprawdzenia')}</p>
    <TripDetails deal={deal} locale={locale} qualityDetails/>
    <ScoreTrigger slug={deal.slug} href={`${detailHref}#score`} destination={cityLabel(deal.destination_city,deal.destination_slug,locale)} locale={locale}><ScoreDetails deal={deal} locale={locale}/></ScoreTrigger>
  </article>;
}
export function DealGrid({deals,locale="pl",returnTo}:{deals:Deal[];locale?:Locale;returnTo?:string}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  return deals.length ? <><section className="deal-grid">{deals.map(d=><DealCard key={d.slug} deal={d} locale={locale} returnTo={returnTo}/>)}</section><p className="catalog-note">{t("Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.")}</p></>
    : <div className="empty-state"><span className="empty-mark" aria-hidden="true">↗</span><p>{pl.empty}</p><Link className="text-link" href={localizedHref("/info/price-freshness",locale)}>{t("Co oznacza świeżość oferty")} <span aria-hidden="true">→</span></Link></div>;
}
