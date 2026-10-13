"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {decodeTrip,readSavedTrips,savedTripsKey,tripPath} from "../../lib/shared-trip";
import {date} from "../../lib/pl";
export function SavedTrips(){
 const [tokens,setTokens]=useState<string[]>([]);
 const [message,setMessage]=useState("Wczytywanie zapisanych planów…");
 useEffect(()=>{
  try {
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setTokens(readSavedTrips(localStorage.getItem(savedTripsKey)));setMessage("");
  }catch{setMessage("Pamięć przeglądarki jest niedostępna. Otrzymane linki nadal działają.");}
 },[]);
 function remove(token:string){try{const next=readSavedTrips(localStorage.getItem(savedTripsKey)).filter(t=>t!==token);localStorage.setItem(savedTripsKey,JSON.stringify(next));setTokens(next);}catch{setMessage("Nie udało się usunąć planu. Spróbuj ponownie.");}}
 return <><p aria-live="polite">{message}</p>{!message && !tokens.length && <p>Nie masz jeszcze zapisanych wyjazdów. Otwórz ofertę i wybierz „Zapisz wyjazd” przy kalkulatorze.</p>}
  <ul>{tokens.map(token=>{const trip=decodeTrip(token)!;return <li key={token}><Link href={tripPath(token)}>{trip.offer.origin} → {trip.offer.destination} · {trip.draft.start ? date(trip.draft.start) : "daty nieustalone"}{trip.draft.end && ` – ${date(trip.draft.end)}`}</Link>{" "}<button type="button" onClick={()=>remove(token)} aria-label={`Usuń plan: ${trip.offer.destination}`}>Usuń</button></li>;})}</ul><Link href="/deals">Znajdź wyjazd</Link></>;
}
