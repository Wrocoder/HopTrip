"use client";

import {useState} from "react";
import type {Deal} from "../../lib/api";
import {stay22Link} from "../../lib/accommodation-links";
import styles from "./destination-activities.module.css";

export function TripAccommodation({deal}:{deal:Deal}) {
 const [checkin,setCheckin]=useState(deal.trip_start);
 const [checkout,setCheckout]=useState(deal.trip_type==="ROUND_TRIP" && deal.trip_end>deal.trip_start ? deal.trip_end : "");
 const [adults,setAdults]=useState("1");
 const href=stay22Link({city:deal.destination_city,checkin,checkout,adults});
 return <section className={styles.section} aria-labelledby="accommodation-title">
  <div className={styles.card}>
   <h2 id="accommodation-title">Znajdź nocleg — {deal.destination_city}</h2>
   <p>Dopasuj daty pobytu do godzin przylotu i powrotu. Wybierz liczbę dorosłych;
    dzieci i pokoje możesz dodać u partnera.</p>
   {deal.trip_type==="ONE_WAY" && <p>To lot w jedną stronę — uzupełnij datę wymeldowania.</p>}
   <p><label htmlFor="stay-checkin">Zameldowanie</label>{" "}
    <input id="stay-checkin" type="date" value={checkin} onChange={event=>setCheckin(event.target.value)}/></p>
   <p><label htmlFor="stay-checkout">Wymeldowanie</label>{" "}
    <input id="stay-checkout" type="date" min={checkin} value={checkout} onChange={event=>setCheckout(event.target.value)}/></p>
   <p><label htmlFor="stay-adults">Dorośli</label>{" "}
    <input id="stay-adults" type="number" min="1" step="1" value={adults} onChange={event=>setAdults(event.target.value)}/></p>
   {href ? <a className="button button-secondary" href={href} target="_blank"
    rel="sponsored noopener noreferrer">Znajdź nocleg przez Stay22 (nowa karta)</a> :
    <p role="status">Wybierz datę wymeldowania późniejszą niż zameldowanie i co najmniej jedną osobę dorosłą.</p>}
   <p className="muted">Link afiliacyjny — możemy otrzymać prowizję za rezerwację.
    Nocleg nie jest wliczony w cenę lotu. Sprawdź miejsce, daty, gości, całkowitą cenę
    i warunki anulowania na stronie partnera.</p>
   <a href="#calculator">Dodaj koszt noclegu do budżetu podróży</a>
  </div>
 </section>;
}
