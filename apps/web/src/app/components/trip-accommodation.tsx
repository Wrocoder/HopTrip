"use client";

import {cityLabel} from "../../lib/cities";
import {track} from "../../lib/session";
import {useTripDraft} from "./trip-draft";
import {changeStayDate} from "../../lib/budget-draft";
import type {Deal} from "../../lib/api";
import {stay22Link} from "../../lib/accommodation-links";
import {date,tripNights} from "../../lib/pl";
import {flightTime} from "../../lib/flight-facts";
import styles from "./trip-accommodation.module.css";

export function TripAccommodation({deal}:{deal:Deal}) {
 const {draft,save,ready}=useTripDraft()!;
 const checkin=draft.start,checkout=draft.end,adults=draft.input.people;
 const setCheckin=(value:string)=>save(changeStayDate(draft,"start",value));
 const setCheckout=(value:string)=>save(changeStayDate(draft,"end",value));
 const setAdults=(value:string)=>save({...draft,input:{...draft.input,people:value},adultsOnly:true,review:true});
 const record=()=>track("PARTNER_CLICK",deal.slug,undefined,{partner:{category:"stay",provider:"stay22"}});
 const href=ready && draft.adultsOnly && Number(adults)<=50 ? stay22Link({city:deal.destination_city,checkin,checkout,adults}) : null;
 const datesValid=Boolean(stay22Link({city:deal.destination_city,checkin,checkout,adults:"1"}));
 const adultsValid=/^[1-9]\d*$/.test(adults) && Number.isSafeInteger(Number(adults)) && Number(adults)<=50;
 const arrival=flightTime(deal.flight_facts?.outbound_arrival,deal.flight_facts?.destination_timezone);
 const departure=deal.trip_type==="ROUND_TRIP" ? flightTime(deal.flight_facts?.return_departure,deal.flight_facts?.destination_timezone) : null;
 const city=cityLabel(deal.destination_city,deal.destination_slug);
 return <section id="accommodation" tabIndex={-1} className={styles.section} aria-labelledby="accommodation-title">
   <h2 id="accommodation-title">Znajdź nocleg — {city}</h2>
   <p>Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.</p>
   <details id="stay-schedule"><summary>Jak dobrać daty noclegu do lotu?</summary>
    {arrival ? <p>Zapisany przylot: {arrival}{deal.flight_facts?.outbound_arrival_calculated && " · obliczony z czasu lotu"}.</p> : <p>Brak danych o godzinie przylotu. Sprawdź lokalną datę przyjazdu przed wyborem noclegu.</p>}
    {departure && <p>Zapisany wylot powrotny: {departure}.</p>}
    {(arrival || departure) && <p>Godziny lokalne lotniska przy znanej strefie; inaczej oznaczone UTC. Sprawdź dojazd i możliwość późnego zameldowania. Przylot do domu po północy nie dodaje nocy w hotelu.</p>}
    <p>Wstępne daty pochodzą z oferty lotu. Możesz je zmienić poniżej, także przy przylocie następnego dnia. Daty i liczba dorosłych są wspólne z kalkulatorem; zmiana dat przelicza noce i dni wydatków, zachowując wpisane kwoty. Daty lotu pozostają datami oferty.</p>
   </details>
   {deal.trip_type==="ONE_WAY" && <p>To lot w jedną stronę — uzupełnij datę wymeldowania.</p>}
   <fieldset className={styles.controls} disabled={!ready}><legend>Daty pobytu i dorośli</legend>
   <div className={styles.grid}>
   <div className={styles.field}><label htmlFor="stay-checkin">Zameldowanie</label>
    <input id="stay-checkin" type="date" value={checkin} aria-invalid={!datesValid} aria-describedby={!datesValid ? "stay-dates-error" : undefined} onChange={event=>setCheckin(event.target.value)}/></div>
   <div className={styles.field}><label htmlFor="stay-checkout">Wymeldowanie</label>
    <input id="stay-checkout" type="date" min={checkin} value={checkout} aria-invalid={!datesValid} aria-describedby={!datesValid ? "stay-dates-error" : undefined} onChange={event=>setCheckout(event.target.value)}/>
   {!datesValid && <span className={styles.error} id="stay-dates-error" role="status">Wybierz datę wymeldowania późniejszą niż zameldowanie.</span>}</div>
   <div className={styles.field}><label htmlFor="stay-adults">Dorośli</label>
    <input id="stay-adults" type="number" min="1" max="50" step="1" value={draft.adultsOnly ? adults : ""} aria-invalid={!adultsValid} aria-describedby={!adultsValid ? "stay-adults-error" : undefined} onChange={event=>setAdults(event.target.value)}/>
   {!adultsValid && <span className={styles.error} id="stay-adults-error" role="status">Wpisz liczbę całkowitą: od 1 do 50 dorosłych.</span>}</div>
   </div>
   </fieldset>
   {!draft.adultsOnly && <p>Potwierdź w kalkulatorze, że wszyscy podróżni są dorośli, lub wpisz tutaj liczbę dorosłych dla całej grupy. Zaktualizuje ona także budżet. Dzieci nie są automatycznie zamieniane na dorosłych.</p>}
   {draft.review && <p>Sprawdź ponownie ceny noclegu i lotu dla zmienionego planu. Wpisane kwoty pozostają w budżecie.</p>}
   <div className={styles.search}>
   {href && <p id="stay-summary" aria-live="polite"><strong>{city}</strong>: {date(checkin)} – {date(checkout)} · {tripNights({trip_type:"ROUND_TRIP",trip_start:checkin,trip_end:checkout})} · dorośli: {adults}.</p>}
   {href && <a className="button button-secondary" href={href} target="_blank" aria-describedby="stay-summary" onClick={record} onAuxClick={event=>{if(event.button===1)record();}}
    rel="sponsored noopener noreferrer">Znajdź nocleg przez Stay22 (nowa karta)</a>}
   </div>
   <p className="muted">Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.</p>
   <details><summary>Jak dodać cenę noclegu do planu?</summary>
   <p>Wpisz cenę w PLN za noc albo za cały pobyt, dla wszystkich gości i pokoi, z podatkami i opłatami. Ceny nie pobieramy automatycznie od partnera.</p></details>
   <a href="#budget-hotel-basis" onClick={()=>document.getElementById("budget-hotel-basis")?.focus()}>Dodaj koszt noclegu do budżetu podróży</a>
 </section>;
}
