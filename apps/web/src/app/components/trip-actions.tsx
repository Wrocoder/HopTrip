"use client";
import {track} from "../../lib/session";
import {useState} from "react";
import Link from "next/link";
import type {BudgetDraft} from "../../lib/budget-draft";
import {encodeTrip,readSavedTrips,savedTripsKey,tripPath,type TripOffer} from "../../lib/shared-trip";

export function TripActions({offer,draft,ready}:{offer:TripOffer;draft:BudgetDraft;ready:boolean}) {
 const [message,setMessage]=useState("");
 const [link,setLink]=useState("");
 const token=encodeTrip({version:1,offer,draft});
 function save() {
  if(!token)return;
  try {
   const existing=readSavedTrips(localStorage.getItem(savedTripsKey));
   if(!existing.includes(token) && existing.length>=20){setMessage("Masz już 20 zapisanych planów. Usuń jeden na liście przed zapisaniem kolejnego.");return;}
   localStorage.setItem(savedTripsKey,JSON.stringify([token,...existing.filter(t=>t!==token)]));
   if(!existing.includes(token))track("TRIP_SAVE");
   setMessage("Zapisano wyjazd w tej przeglądarce. Znajdziesz go na liście zapisanych wyjazdów.");
  }catch{setMessage("Nie udało się zapisać wyjazdu w przeglądarce. Nadal możesz udostępnić link.");}
 }
 async function share() {
  if(!token)return;
  const url=window.location.origin+tripPath(token);
  setLink(url);
  try {await navigator.clipboard.writeText(url);setMessage("Link skopiowany. Odbiorca otrzyma niezależną kopię planu.");}
  catch {setMessage("Skopiuj link z pola poniżej. Odbiorca otrzyma niezależną kopię planu.");}
 }
 return <section id="trip-save" tabIndex={-1} aria-label="Zapisz i udostępnij wyjazd">
  <h3>Zachowaj plan podróży</h3>
  <p>Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.</p>
  <div className="trip-actions"><button type="button" className="button" disabled={!ready || !token} onClick={save}>Zapisz wyjazd</button>
   <button type="button" className="button button-secondary" disabled={!ready || !token} onClick={share}>Udostępnij</button>
   <Link href="/saved">Zapisane wyjazdy</Link></div>
  {!token && <p>Popraw pola i daty przed zapisaniem lub udostępnieniem. Nieznane wydatki mogą pozostać puste.</p>}
  <p aria-live="polite">{message}</p>
  {link && <p><label htmlFor="trip-share-link">Link do kopii planu</label><input id="trip-share-link" className="trip-share-link" readOnly value={link} onFocus={event=>event.target.select()}/>
   <span>Link przedstawia plan z chwili kliknięcia „Udostępnij”. Po zmianach utwórz go ponownie.</span></p>}
 </section>;
}
