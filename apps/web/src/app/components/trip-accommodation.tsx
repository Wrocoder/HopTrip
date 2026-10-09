import type {Deal} from "../../lib/api";
import {date} from "../../lib/pl";
import {accommodationForDestination} from "../../lib/accommodation-links";
import styles from "./destination-activities.module.css";

export function TripAccommodation({deal}:{deal:Deal}) {
 const link=accommodationForDestination(deal.destination_slug);
 if(!link) return null;
 const overnight=deal.trip_type==="ROUND_TRIP" && deal.trip_end>deal.trip_start;
 return <section className={styles.section} aria-labelledby="accommodation-title">
  <div className={styles.card}>
   <h2 id="accommodation-title">Znajdź nocleg — {deal.destination_city}</h2>
   {overnight ? <p>Daty lotów: {date(deal.trip_start)} – {date(deal.trip_end)}. Dopasuj zameldowanie
    i wymeldowanie do godzin przylotu oraz powrotu.</p> :
    <p>{deal.trip_type==="ONE_WAY" ? "To lot w jedną stronę — wybierz datę wymeldowania u partnera." :
     "Loty są tego samego dnia. Sprawdź, czy potrzebujesz noclegu."}</p>}
   <p>Po przejściu wybierz daty pobytu, liczbę gości i pokoi. Porównaj cenę za cały pobyt,
    opłaty dodatkowe oraz zasady anulowania.</p>
   <a className="button button-secondary" href={link.affiliateHref} target="_blank"
    rel="sponsored noopener noreferrer">Znajdź nocleg w {link.provider} (nowa karta)</a>
   <p className="muted">Link afiliacyjny — możemy otrzymać prowizję za rezerwację.
    Nocleg nie jest wliczony w cenę lotu; cenę i dostępność potwierdza partner.</p>
   <a href="#calculator">Dodaj koszt noclegu do budżetu podróży</a>
  </div>
 </section>;
}
