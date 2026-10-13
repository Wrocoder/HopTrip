"use client";

import {cityLabel} from "../../lib/cities";
import {track} from "../../lib/session";
import {useState} from "react";
import type {Deal} from "../../lib/api";
import {stay22Link} from "../../lib/accommodation-links";
import {date,tripNights} from "../../lib/pl";
import {flightTime} from "../../lib/flight-facts";
import styles from "./destination-activities.module.css";

export function TripAccommodation({deal}:{deal:Deal}) {
 const [checkin,setCheckin]=useState(deal.trip_start);
 const [checkout,setCheckout]=useState(deal.trip_type==="ROUND_TRIP" && deal.trip_end>deal.trip_start ? deal.trip_end : "");
 const [adults,setAdults]=useState("1");
 const record=()=>track("PARTNER_CLICK",deal.slug,undefined,{partner:{category:"stay",provider:"stay22"}});
 const href=stay22Link({city:deal.destination_city,checkin,checkout,adults});
 const datesValid=Boolean(stay22Link({city:deal.destination_city,checkin,checkout,adults:"1"}));
 const adultsValid=/^[1-9]\d*$/.test(adults) && Number.isSafeInteger(Number(adults));
 const arrival=flightTime(deal.flight_facts?.outbound_arrival);
 const departure=deal.trip_type==="ROUND_TRIP" ? flightTime(deal.flight_facts?.return_departure) : null;
 const city=cityLabel(deal.destination_city,deal.destination_slug);
 return <section className={styles.section} aria-labelledby="accommodation-title">
  <div className={styles.card}>
   <h2 id="accommodation-title">Znajdź nocleg — {city}</h2>
   <p>Wyszukaj nocleg na wybrane daty. Rezerwujesz go osobno od lotu, na stronie partnera. Wybierz liczbę dorosłych;
    dzieci i pokoje możesz dodać u partnera.</p>
   <div id="stay-schedule" className={styles.note}>
    {arrival ? <p>Zapisany przylot: {arrival}.</p> : <p>Nie znamy godziny przylotu. Sprawdź lokalną datę przyjazdu przed wyborem noclegu.</p>}
    {departure && <p>Zapisany wylot powrotny: {departure}.</p>}
    {(arrival || departure) && <p>Godziny podajemy w UTC, nie w czasie lokalnym hotelu. Sprawdź lokalną datę, dojazd z lotniska i możliwość późnego zameldowania.</p>}
    <p>Wstępne daty pochodzą z oferty lotu. Możesz je zmienić poniżej, także przy przylocie następnego dnia. Zmiana dotyczy tylko wyszukiwania noclegu.</p>
   </div>
   {deal.trip_type==="ONE_WAY" && <p>To lot w jedną stronę — uzupełnij datę wymeldowania.</p>}
   <p><label htmlFor="stay-checkin">Zameldowanie</label>{" "}
    <input id="stay-checkin" type="date" value={checkin} aria-invalid={!datesValid} aria-describedby={`stay-schedule${!datesValid ? " stay-dates-error" : ""}`} onChange={event=>setCheckin(event.target.value)}/></p>
   <p><label htmlFor="stay-checkout">Wymeldowanie</label>{" "}
    <input id="stay-checkout" type="date" min={checkin} value={checkout} aria-invalid={!datesValid} aria-describedby={!datesValid ? "stay-dates-error" : undefined} onChange={event=>setCheckout(event.target.value)}/></p>
   {!datesValid && <p id="stay-dates-error" role="status">Wybierz datę wymeldowania późniejszą niż zameldowanie.</p>}
   <p><label htmlFor="stay-adults">Dorośli</label>{" "}
    <input id="stay-adults" type="number" min="1" step="1" value={adults} aria-invalid={!adultsValid} aria-describedby={!adultsValid ? "stay-adults-error" : undefined} onChange={event=>setAdults(event.target.value)}/></p>
   {!adultsValid && <p id="stay-adults-error" role="status">Wpisz liczbę całkowitą: co najmniej 1 osoba dorosła.</p>}
   {href && <p id="stay-summary" aria-live="polite"><strong>{city}</strong>: {date(checkin)} – {date(checkout)} · {tripNights({trip_type:"ROUND_TRIP",trip_start:checkin,trip_end:checkout})} · dorośli: {adults}.</p>}
   {href && <a className="button button-secondary" href={href} target="_blank" aria-describedby="stay-summary" onClick={record} onAuxClick={event=>{if(event.button===1)record();}}
    rel="sponsored noopener noreferrer">Znajdź nocleg przez Stay22 (nowa karta)</a>}
   <p className="muted">Link afiliacyjny — możemy otrzymać prowizję za rezerwację.
    Nocleg nie jest wliczony w cenę lotu. Sprawdź miejsce, daty, gości, całkowitą cenę
    i warunki anulowania na stronie partnera.</p>
   <h3>Wybrany nocleg w twoim budżecie</h3>
   <p>Po sprawdzeniu oferty wpisz w kalkulatorze cenę w PLN za noc albo za cały pobyt, dla wszystkich gości i pokoi, z podatkami i opłatami. Sprawdź też daty i liczbę osób w planie budżetu — formularze są niezależne. Ceny nie pobieramy automatycznie od partnera.</p>
   <a href="#budget-hotel-basis" onClick={()=>document.getElementById("budget-hotel-basis")?.focus()}>Dodaj koszt noclegu do budżetu podróży</a>
  </div>
 </section>;
}
