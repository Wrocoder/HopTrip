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
import {BudgetProjection} from './budget-projection';
import {planStorageCopy} from '../../lib/i18n/plan-storage-copy';
import type {SavedPlan} from '../../lib/saved-plans';
import {localPlanPath} from '../../lib/plan-editor';
import {tripSectionCopy} from '../../lib/i18n/trip-section-copy';
export function SavedTrips(){
 const {locale}=useLocale();
 const t=(source:TripKey)=>tripText(locale,source);
 const copy=savedTripCopy[locale],storage=planStorageCopy[locale],store=useSavedTrips();
 const [message,setMessage]=useState<{trip:TripKey}|{saved:keyof typeof copy}|{storage:keyof typeof storage}|null>(null);
 const [undo,setUndo]=useState<SavedPlan|null>(null);
 const undoButton=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null);
 async function remove(plan:{id:string|null;revision:number;token:string}){
  if(!plan.id)return;
  const result=await store.mutate({type:'remove',id:plan.id,expectedRevision:plan.revision});
  if(result.status==='removed'&&result.plan){
   track("TRIP_REMOVE");
   setUndo(result.plan);setMessage({saved:'removed'});requestAnimationFrame(()=>undoButton.current?.focus());
  }else if(result.status==='absent')setMessage({saved:'absent'});
  else if(result.status==='conflict')setMessage({storage:'conflict'});
  else if(result.status==='corrupt')setMessage({saved:'corrupt'});
  else setMessage({trip:"Nie udało się usunąć planu. Spróbuj ponownie."});
 }
 async function restore(){
  if(!undo)return;
  const result=await store.mutate({type:'restore',plan:undo});
  if(result.status==='restored'){
   setUndo(null);setMessage({saved:'restored'});requestAnimationFrame(()=>heading.current?.focus());
  }else setMessage(result.status==='conflict'?{storage:'conflict'}:{saved:result.status==='corrupt'?'corrupt':'undoError'});
 }
 async function migrate(){
  const result=await store.mutate({type:store.requiresMigration?'migrate':'import',expectedLegacyRaw:store.legacyRaw});
  if(result.status==='migrated'||result.status==='imported'||result.status==='already')setMessage({storage:result.status==='migrated'?'migrated':'imported'});
  else if(result.status==='conflict')setMessage({storage:'conflict'});
  else if(result.status==='corrupt')setMessage({saved:'corrupt'});
  else if(result.status==='full')setMessage({trip:'Masz już 20 zapisanych planów. Usuń jeden na liście przed zapisaniem kolejnego.'});
  else setMessage({trip:'Nie udało się zapisać wyjazdu w przeglądarce. Nadal możesz udostępnić link.'});
 }
 return <><p className={styles.note}>{copy.localOnly}</p><p className={styles.note}>{copy.snapshotHint}</p>
  <h2 ref={heading} tabIndex={-1}>{copy.listTitle}{store.ready&&` (${store.tokens.length}/20)`}</h2>
  {!store.ready&&<p>{t("Wczytywanie zapisanych planów…")}</p>}
  {store.readError&&<p className={styles.warning}>{t("Pamięć przeglądarki jest niedostępna. Otrzymane linki nadal działają.")}</p>}
  {store.corrupt&&<p className={styles.warning}>{copy.corrupt}</p>}
  {store.ready&&!store.lockingAvailable&&<p className={styles.warning}>{storage.unsupported}</p>}
  {store.requiresMigration&&<p>{storage.migration}</p>}
  {store.format==='v2'&&store.legacyChanged&&<p className={styles.warning}>{store.legacyCorrupt?storage.legacyCorrupt:storage.legacyChanged}</p>}
  {(store.requiresMigration||store.format==='v2'&&store.legacyChanged&&!store.legacyCorrupt)&&<div className={styles.actions}><button type="button" className="button" disabled={store.busy||store.corrupt||!store.lockingAvailable} aria-busy={store.busy} onClick={migrate}>{store.requiresMigration?storage.migrate:storage.import}</button></div>}
  <p role="status">{store.busy?storage.busy:message?('trip' in message?t(message.trip):'storage' in message?storage[message.storage]:copy[message.saved]):''}</p>
  {undo&&<div className={styles.actions}><button ref={undoButton} type="button" disabled={store.busy||store.corrupt||!store.lockingAvailable} onClick={restore}>{copy.undo}</button></div>}
  {store.ready&&!store.readError&&!store.corrupt&&!store.tokens.length&&<p>{t("Nie masz jeszcze zapisanych wyjazdów. Otwórz ofertę i wybierz „Zapisz wyjazd” w sekcji „{section}”.").replace('{section}',tripSectionCopy[locale].save)}</p>}
  <ul className={styles.list}>{store.items.map(plan=>{
   const {token}=plan;
   const trip=decodeTrip(token)!;
   const budget=calculateBudget(trip.draft.input,trip.draft.events);
   const start=trip.draft.start?date(trip.draft.start,locale):t("daty nieustalone");
   const end=trip.draft.end?` – ${date(trip.draft.end,locale)}`:'';
   const origin=cityLabel(trip.offer.origin,undefined,locale),destination=cityLabel(trip.offer.destination,undefined,locale);
   return <li key={plan.id??token} data-plan-id={plan.id??undefined} data-plan-revision={plan.revision} className={styles.card}>
    <Link href={localizedHref(plan.id?localPlanPath(plan.id):tripPath(token),locale)}>{origin} → {destination} · {t("plan pobytu:")} {start}{end}</Link>
    <p>{copy.people}: {trip.draft.input.people}</p>
    <p>{budgetText(locale,budget.missing.length?'Suma znanych kosztów':'Budżet według wpisanych kosztów')} (PLN): <strong>{money(String(budget.total!/100),locale)}</strong></p>
    <BudgetProjection draft={trip.draft} locale={locale} compact/>
    {budget.missing.length>0&&<p className={styles.note}>{budgetText(locale,'Budżet niepełny. Do uzupełnienia:')} {budget.missing.map(label=>label==='Wydarzenia w planie'?t('Wydarzenia'):budgetText(locale,label)).join(', ')}.</p>}
    {trip.offer.start&&trip.offer.start<new Date().toISOString().slice(0,10)&&<p className={styles.warning}>{copy.past}</p>}
    <p className={styles.note}>{copy.verify}</p>
    <div className={styles.actions}><button type="button" disabled={store.busy||store.corrupt||!store.lockingAvailable||!plan.id} onClick={()=>remove(plan)} aria-label={`${t("Usuń plan:")} ${origin} → ${destination} · ${start}${end}`}>{t("Usuń")}</button></div>
   </li>;
  })}</ul><Link href={localizedHref("/deals",locale)}>{t("Znajdź wyjazd")}</Link></>;
}
