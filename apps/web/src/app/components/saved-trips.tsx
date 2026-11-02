"use client";
import {useLocale} from "./locale-provider";
import {track} from "../../lib/session";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {useRef,useState} from "react";
import Link from "next/link";
import {decodeTrip,tripPath} from "../../lib/shared-trip";
import {cityLabel} from "../../lib/cities";
import {date,money} from "../../lib/pl";
import {calculateBudget} from '../../lib/trip-budget';
import {budgetText} from '../../lib/i18n/budget-copy';
import {savedTripCopy} from '../../lib/i18n/saved-trip-copy';
import {useSavedTrips} from './use-saved-trips';
import styles from './saved-trips.module.css';
export function SavedTrips(){
 const {locale}=useLocale();
 const t=(source:TripKey)=>tripText(locale,source);
 const copy=savedTripCopy[locale],store=useSavedTrips();
 const [message,setMessage]=useState<{trip:TripKey}|{saved:keyof typeof copy}|null>(null);
 const [undo,setUndo]=useState<string|null>(null);
 const undoButton=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null);
 function remove(token:string){
  const result=store.mutate(token,'remove');
  if(result==='removed'){
   track("TRIP_REMOVE");
   setUndo(token);setMessage({saved:'removed'});requestAnimationFrame(()=>undoButton.current?.focus());
  }else if(result==='absent')setMessage({saved:'absent'});
  else if(result==='corrupt')setMessage({saved:'corrupt'});
  else setMessage({trip:"Nie udało się usunąć planu. Spróbuj ponownie."});
 }
 function restore(){
  if(!undo)return;
  const result=store.mutate(undo,'save');
  if(result==='saved'||result==='already'){
   setUndo(null);setMessage({saved:'restored'});requestAnimationFrame(()=>heading.current?.focus());
  }else setMessage({saved:result==='corrupt'?'corrupt':'undoError'});
 }
 return <><p className={styles.note}>{copy.localOnly}</p><p className={styles.note}>{copy.snapshotHint}</p>
  <h2 ref={heading} tabIndex={-1}>{copy.listTitle}{store.ready&&` (${store.tokens.length}/20)`}</h2>
  {!store.ready&&<p>{t("Wczytywanie zapisanych planów…")}</p>}
  {store.readError&&<p className={styles.warning}>{t("Pamięć przeglądarki jest niedostępna. Otrzymane linki nadal działają.")}</p>}
  {store.corrupt&&<p className={styles.warning}>{copy.corrupt}</p>}
  <p role="status">{message?('trip' in message?t(message.trip):copy[message.saved]):''}</p>
  {undo&&<div className={styles.actions}><button ref={undoButton} type="button" disabled={store.corrupt} onClick={restore}>{copy.undo}</button></div>}
  {store.ready&&!store.readError&&!store.corrupt&&!store.tokens.length&&<p>{t("Nie masz jeszcze zapisanych wyjazdów. Otwórz ofertę i wybierz „Zapisz wyjazd” przy kalkulatorze.")}</p>}
  <ul className={styles.list}>{store.tokens.map(token=>{
   const trip=decodeTrip(token)!;
   const budget=calculateBudget(trip.draft.input,trip.draft.events);
   const start=trip.draft.start?date(trip.draft.start,locale):t("daty nieustalone");
   const end=trip.draft.end?` – ${date(trip.draft.end,locale)}`:'';
   const origin=cityLabel(trip.offer.origin,undefined,locale),destination=cityLabel(trip.offer.destination,undefined,locale);
   return <li key={token} className={styles.card}>
    <Link href={localizedHref(tripPath(token),locale)}>{origin} → {destination} · {t("plan pobytu:")} {start}{end}</Link>
    <p>{copy.people}: {trip.draft.input.people}</p>
    <p>{budgetText(locale,budget.missing.length?'Suma znanych kosztów':'Budżet według wpisanych kosztów')} (PLN): <strong>{money(String(budget.total!/100),locale)}</strong></p>
    {budget.missing.length>0&&<p className={styles.note}>{budgetText(locale,'Budżet niepełny. Do uzupełnienia:')} {budget.missing.map(label=>label==='Wydarzenia w planie'?t('Wydarzenia'):budgetText(locale,label)).join(', ')}.</p>}
    {trip.offer.start&&trip.offer.start<new Date().toISOString().slice(0,10)&&<p className={styles.warning}>{copy.past}</p>}
    <p className={styles.note}>{copy.verify}</p>
    <div className={styles.actions}><button type="button" disabled={store.corrupt} onClick={()=>remove(token)} aria-label={`${t("Usuń plan:")} ${origin} → ${destination} · ${start}${end}`}>{t("Usuń")}</button></div>
   </li>;
  })}</ul><Link href={localizedHref("/deals",locale)}>{t("Znajdź wyjazd")}</Link></>;
}
