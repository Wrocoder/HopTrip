"use client";

import {tripText,type TripKey} from "../../lib/i18n/trip-copy";

import {cityLabel} from "../../lib/cities";
import {track} from "../../lib/session";
import {useTripDraft} from "./trip-draft";
import {changeStayDate} from "../../lib/budget-draft";
import type {Deal} from "../../lib/api";
import {stay22Link} from "../../lib/accommodation-links";
import {date,tripNights} from "../../lib/i18n/format";
import {flightLegs,flightTime} from "../../lib/flight-facts";
import styles from "./trip-accommodation.module.css";

export function TripAccommodation({deal}:{deal:Deal}) {
 const locale="pl" as const;
 const t=(source:TripKey)=>tripText(locale,source);
 const {draft,save,ready}=useTripDraft()!;
 const checkin=draft.start,checkout=draft.end,adults=draft.input.people;
 const setCheckin=(value:string)=>save(changeStayDate(draft,"start",value));
 const setCheckout=(value:string)=>save(changeStayDate(draft,"end",value));
 const setAdults=(value:string)=>save({...draft,input:{...draft.input,people:value},adultsOnly:true,review:true});
 const record=()=>track("PARTNER_CLICK",deal.slug,undefined,{partner:{category:"stay",provider:"stay22"}});
 const href=ready && draft.adultsOnly && Number(adults)<=50 ? stay22Link({city:deal.destination_city,checkin,checkout,adults}) : null;
 const datesValid=Boolean(stay22Link({city:deal.destination_city,checkin,checkout,adults:"1"}));
 const adultsValid=/^[1-9]\d*$/.test(adults) && Number.isSafeInteger(Number(adults)) && Number(adults)<=50;
 const {outbound,inbound}=flightLegs(deal.flight_facts);
 const arrival=flightTime(outbound.arrival,outbound.destinationZone,locale);
 const departure=deal.trip_type==="ROUND_TRIP" ? flightTime(inbound.departure,inbound.originZone,locale) : null;
 const city=cityLabel(deal.destination_city,deal.destination_slug,locale);
 return <section id="accommodation" tabIndex={-1} className={styles.section} aria-labelledby="accommodation-title">
   <h2 id="accommodation-title">{t("Znajdź nocleg —")} {city}</h2>
   <p>{t("Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.")}</p>
   <details id="stay-schedule"><summary>{t("Jak dobrać daty noclegu do lotu?")}</summary>
    {arrival ? <p>{t("Zapisany przylot:")} {arrival}{deal.flight_facts?.outbound_arrival_calculated && ` · ${t("obliczony z czasu lotu")}`}.</p> : <p>{t("Brak danych o godzinie przylotu. Sprawdź lokalną datę przyjazdu przed wyborem noclegu.")}</p>}
    {departure && <p>{t("Zapisany wylot powrotny:")} {departure}.</p>}
    {(arrival || departure) && <p>{t("Godziny lokalne lotniska przy znanej strefie; inaczej oznaczone UTC. Sprawdź dojazd i możliwość późnego zameldowania. Przylot do domu po północy nie dodaje nocy w hotelu.")}</p>}
    <p>{t("Wstępne daty pochodzą z oferty lotu. Możesz je zmienić poniżej, także przy przylocie następnego dnia. Daty i liczba dorosłych są wspólne z kalkulatorem; zmiana dat przelicza noce i dni wydatków, zachowując wpisane kwoty. Daty lotu pozostają datami oferty.")}</p>
   </details>
   {deal.trip_type==="ONE_WAY" && <p>{t("To lot w jedną stronę — uzupełnij datę wymeldowania.")}</p>}
   <fieldset className={styles.controls} disabled={!ready}><legend>{t("Daty pobytu i dorośli")}</legend>
   <div className={styles.grid}>
   <div className={styles.field}><label htmlFor="stay-checkin">{t("Zameldowanie")}</label>
    <input id="stay-checkin" type="date" value={checkin} aria-invalid={!datesValid} aria-describedby={!datesValid ? "stay-dates-error" : undefined} onChange={event=>setCheckin(event.target.value)}/></div>
   <div className={styles.field}><label htmlFor="stay-checkout">{t("Wymeldowanie")}</label>
    <input id="stay-checkout" type="date" min={checkin} value={checkout} aria-invalid={!datesValid} aria-describedby={!datesValid ? "stay-dates-error" : undefined} onChange={event=>setCheckout(event.target.value)}/>
   {!datesValid && <span className={styles.error} id="stay-dates-error" role="status">{t("Wybierz datę wymeldowania późniejszą niż zameldowanie.")}</span>}</div>
   <div className={styles.field}><label htmlFor="stay-adults">{t("Dorośli")}</label>
    <input id="stay-adults" type="number" min="1" max="50" step="1" value={draft.adultsOnly ? adults : ""} aria-invalid={!adultsValid} aria-describedby={!adultsValid ? "stay-adults-error" : undefined} onChange={event=>setAdults(event.target.value)}/>
   {!adultsValid && <span className={styles.error} id="stay-adults-error" role="status">{t("Wpisz liczbę całkowitą: od 1 do 50 dorosłych.")}</span>}</div>
   </div>
   </fieldset>
   {!draft.adultsOnly && <p>{t("Potwierdź w kalkulatorze, że wszyscy podróżni są dorośli, lub wpisz tutaj liczbę dorosłych dla całej grupy. Zaktualizuje ona także budżet. Dzieci nie są automatycznie zamieniane na dorosłych.")}</p>}
   {draft.review && <p>{t("Sprawdź ponownie ceny noclegu i lotu dla zmienionego planu. Wpisane kwoty pozostają w budżecie.")}</p>}
   <div className={styles.search}>
   {href && <p id="stay-summary" aria-live="polite"><strong>{city}</strong>: {date(checkin,locale)} – {date(checkout,locale)} · {tripNights({trip_type:"ROUND_TRIP",trip_start:checkin,trip_end:checkout},locale)} · {t("dorośli:")} {adults}.</p>}
   {href && <a className="button button-secondary" href={href} target="_blank" aria-describedby="stay-summary" onClick={record} onAuxClick={event=>{if(event.button===1)record();}}
    rel="sponsored noopener noreferrer">{t("Znajdź nocleg przez Stay22 (nowa karta)")}</a>}
   </div>
   <p className="muted">{t("Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.")}</p>
   <details><summary>{t("Jak dodać cenę noclegu do planu?")}</summary>
   <p>{t("Wpisz cenę w PLN za noc albo za cały pobyt, dla wszystkich gości i pokoi, z podatkami i opłatami. Ceny nie pobieramy automatycznie od partnera.")}</p></details>
   <a href="#budget-hotel-basis" onClick={()=>document.getElementById("budget-hotel-basis")?.focus()}>{t("Dodaj koszt noclegu do budżetu podróży")}</a>
 </section>;
}
