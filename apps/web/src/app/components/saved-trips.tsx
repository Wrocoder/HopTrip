"use client";
import {useLocale} from "./locale-provider";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {useEffect,useState} from "react";
import Link from "next/link";
import {decodeTrip,readSavedTrips,savedTripsKey,tripPath} from "../../lib/shared-trip";
import {cityLabel} from "../../lib/cities";
import {date} from "../../lib/pl";
export function SavedTrips(){
 const {locale}=useLocale();
 const t=(source:TripKey)=>tripText(locale,source);
 const [tokens,setTokens]=useState<string[]>([]);
 const [message,setMessage]=useState<TripKey|null>("Wczytywanie zapisanych planów…");
 useEffect(()=>{
  try {
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setTokens(readSavedTrips(localStorage.getItem(savedTripsKey)));setMessage(null);
  }catch{setMessage("Pamięć przeglądarki jest niedostępna. Otrzymane linki nadal działają.");}
 },[]);
 function remove(token:string){try{const next=readSavedTrips(localStorage.getItem(savedTripsKey)).filter(t=>t!==token);localStorage.setItem(savedTripsKey,JSON.stringify(next));setTokens(next);}catch{setMessage("Nie udało się usunąć planu. Spróbuj ponownie.");}}
 return <><p aria-live="polite">{message ? t(message) : ""}</p>{!message && !tokens.length && <p>{t("Nie masz jeszcze zapisanych wyjazdów. Otwórz ofertę i wybierz „Zapisz wyjazd” przy kalkulatorze.")}</p>}
  <ul>{tokens.map(token=>{const trip=decodeTrip(token)!;return <li key={token}><Link href={localizedHref(tripPath(token),locale)}>{cityLabel(trip.offer.origin,undefined,locale)} → {cityLabel(trip.offer.destination,undefined,locale)} · {t("plan pobytu:")} {trip.draft.start ? date(trip.draft.start,locale) : t("daty nieustalone")}{trip.draft.end && ` – ${date(trip.draft.end,locale)}`}</Link>{" "}<button type="button" onClick={()=>remove(token)} aria-label={`${t("Usuń plan:")} ${cityLabel(trip.offer.destination,undefined,locale)}`}>{t("Usuń")}</button></li>;})}</ul><Link href={localizedHref("/deals",locale)}>{t("Znajdź wyjazd")}</Link></>;
}
