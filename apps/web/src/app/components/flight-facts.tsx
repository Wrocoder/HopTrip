import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import type {Deal} from "../../lib/api";
import {destinationInterval,flightTime,stopsLabel} from "../../lib/flight-facts";

export function FlightFacts({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
  const t=(source:CatalogKey)=>catalogText(locale,source);
  const facts=deal.flight_facts;
  const roundTrip=deal.trip_type==="ROUND_TRIP";
  const interval=destinationInterval(facts?.destination_interval_minutes,locale);
  const outbound=flightTime(facts?.outbound_departure,facts?.origin_timezone,locale);
  const inbound=flightTime(facts?.return_departure,facts?.destination_timezone,locale);
  return <div className="flight-facts">
    <p className="deal-note">{t("Lotnisko wylotu:")} {facts?.origin_airport ?? t("do sprawdzenia u partnera")} · {t("Lotnisko docelowe:")} {facts?.destination_airport ?? t("do sprawdzenia u partnera")}
      {!facts?.destination_airport && facts?.destination_code && (locale==="pl" ? ` (kod kierunku: ${facts.destination_code}; nie potwierdza lotniska)` : ` (${t("Kod kierunku nie potwierdza lotniska:")} ${facts.destination_code})`)}</p>
    <p className="deal-note">{facts?.airline_name ? `${t("Przewoźnik:")} ${facts.airline_name} (${facts.airline_code})` : facts?.airline_code ? (locale==="pl" ? `Przewoźnik podany przez źródło (IATA): ${facts.airline_code} — nazwa nieznana` : `${t("Przewoźnik:")} IATA ${facts.airline_code} — ${t("nazwa nieznana")}`) : (locale==="pl" ? "Przewoźnik do sprawdzenia u partnera" : `${t("Przewoźnik:")} ${t("do sprawdzenia u partnera")}`)}</p>
    <p className="deal-note">{t("Wylot")}: {stopsLabel(facts?.outbound_stops,locale)}{roundTrip && ` · ${t("Powrót")}: ${stopsLabel(facts?.return_stops,locale)}`}</p>
    {outbound || inbound ? <>
      <p className="deal-note">{locale==="pl" ? "Wylot — odlot" : t("Wylot")}: {outbound ?? t("Brak danych o godzinie")}; {locale==="pl" ? "przylot" : t("Przylot")}: {flightTime(facts?.outbound_arrival,facts?.destination_timezone,locale) ?? t("Brak danych o godzinie")}{facts?.outbound_arrival_calculated && ` · ${t("obliczony z czasu lotu")}`}</p>
      {roundTrip && <p className="deal-note">{locale==="pl" ? "Powrót — odlot" : t("Wylot powrotny")}: {inbound ?? t("Brak danych o godzinie")}; {locale==="pl" ? "przylot" : t("Przylot")}: {flightTime(facts?.return_arrival,facts?.origin_timezone,locale) ?? t("Brak danych o godzinie")}{facts?.return_arrival_calculated && ` · ${t("obliczony z czasu lotu")}`}</p>}
      <p className="deal-note">{locale==="pl" ? "Godziny lokalne przy znanej strefie lotniska; pozostałe oznaczono UTC. Potwierdź rozkład u partnera." : `${t("Godziny lokalne przy znanej strefie lotniska; w pozostałych przypadkach oznaczone UTC.")} ${t("Potwierdź rozkład u partnera.")}`}</p>
    </> : <p className="deal-note">{t("Brak danych o godzinie")}</p>}
    {roundTrip && interval && <p className="deal-note">{locale==="pl" ? "Między przylotem a odlotem powrotnym:" : t("Między przylotem a odlotem:")} {interval}. {t("Ten okres obejmuje też transfery, odprawę i noclegi.")}</p>}
    <p className="deal-note">{t("Bagaż do sprawdzenia u partnera")}</p>
  </div>;
}
