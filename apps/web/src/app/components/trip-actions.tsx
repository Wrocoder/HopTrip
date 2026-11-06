"use client";
import {useLocale} from "./locale-provider";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {track} from "../../lib/session";
import {useRef,useState} from "react";
import Link from "next/link";
import type {BudgetDraft} from "../../lib/budget-draft";
import {encodeTrip,tripPath,cleanSharedTrip,type TripOffer} from "../../lib/shared-trip";
import {plannedEventsCopy} from '../../lib/i18n/planned-events-copy';
import {useSavedTrips} from './use-saved-trips';
import {savedTripCopy} from '../../lib/i18n/saved-trip-copy';
import styles from './saved-trips.module.css';
import {budgetProfileCopy} from '../../lib/i18n/budget-profile-copy';
import {sharePrivacyCopy} from '../../lib/i18n/share-privacy-copy';
import {planStorageCopy} from '../../lib/i18n/plan-storage-copy';
import {planEditorCopy} from '../../lib/i18n/plan-editor-copy';
import {bindPlanDraft,localPlanPath,planDraftKey,planSeedKey,readPlanBase,planEditState} from '../../lib/plan-editor';
import type {PlanResult,SavedPlan} from '../../lib/saved-plans';
import {useTripDraft} from './trip-draft';

export function TripActions({offer,draft,ready}:{offer:TripOffer;draft:BudgetDraft;ready:boolean}) {
 const {locale}=useLocale(),context=useTripDraft();
 const t=(source:TripKey)=>tripText(locale,source);
 const copy=savedTripCopy[locale],storage=planStorageCopy[locale],editor=planEditorCopy[locale],store=useSavedTrips();
 const local=context?.localPlan,base=readPlanBase(draft.context),current=local?store.plans.find(plan=>plan.id===local.id):undefined;
 const state=local?planEditState(current,base,{version:1,offer,draft}):null;
 const [message,setMessage]=useState<({token:string}&({trip:TripKey}|{saved:keyof typeof copy}|{storage:keyof typeof storage}|{editor:keyof typeof editor}))|null>(null);
 const [link,setLink]=useState<{token:string;url:string}|null>(null);
 const [copying,setCopying]=useState<{token:string}|null>(null);
 const [undo,setUndo]=useState<SavedPlan|null>(null);
 const [created,setCreated]=useState<SavedPlan|null>(null);
 const operation=useRef(0);
 const token=encodeTrip({version:1,offer,draft});
 function failure(result:PlanResult){
  if(!token)return;
  if(result.status==='corrupt')setMessage({token,saved:'corrupt'});
  else if(result.status==='conflict'||result.status==='absent')setMessage({token,editor:'conflict'});
  else if(result.status==='migration')setMessage({token,storage:'migration'});
  else if(result.status==='unsupported')setMessage({token,storage:'unsupported'});
  else setMessage({token,trip:result.status==='full'?"Masz już 20 zapisanych planów. Usuń jeden na liście przed zapisaniem kolejnego.":"Nie udało się zapisać wyjazdu w przeglądarce. Nadal możesz udostępnić link."});
 }
 function open(plan:SavedPlan){
  setCreated(plan);
  const latest=context?.getCurrentDraft()??draft;
  try{
   if(sessionStorage.getItem(planDraftKey(plan.id))===null)sessionStorage.setItem(planDraftKey(plan.id),JSON.stringify(bindPlanDraft(latest,{id:plan.id,revision:plan.revision})));
   sessionStorage.setItem(planSeedKey(plan.id),JSON.stringify(plan));
  }catch{
   if(latest!==draft&&token){setMessage({token,editor:'sessionError'});return;}
  }
  window.location.assign(localizedHref(localPlanPath(plan.id),locale));
 }
 async function save(duplicate=false) {
  if(!token)return;
  operation.current++;setCopying(null);
  const result=await store.mutate({type:duplicate?'duplicate':'save',token});
  if((result.status==='saved'||result.status==='already')&&result.plan){
   if(result.status==='saved')track("TRIP_SAVE");
   open(result.plan);
  }else failure(result);
 }
 async function update(){
  if(!token||!local||!base||state!=='dirty')return;
  operation.current++;setCopying(null);
  const result=await store.mutate({type:'update',id:local.id,expectedRevision:base.revision,token});
  if((result.status==='updated'||result.status==='already')&&result.plan){
   if(result.status==='updated')track("TRIP_UPDATE");
   context?.acknowledgePlan(base,result.plan.revision);setMessage({token,editor:'updated'});
  }else failure(result);
 }
 async function remove(){
  if(!local||!base||!token)return;
  operation.current++;setCopying(null);
  const result=await store.mutate({type:'remove',id:local.id,expectedRevision:base.revision});
  if(result.status==='removed'&&result.plan){track("TRIP_REMOVE");setUndo(result.plan);setMessage({token,saved:'removed'});}else failure(result);
 }
 async function restore(){
  if(!undo||!token)return;
  const result=await store.mutate({type:'restore',plan:undo});
  if(result.status==='restored'&&result.plan){
   context?.acknowledgePlan({id:undo.id,revision:undo.revision},result.plan.revision);setUndo(null);setMessage({token,saved:'restored'});
  }else failure(result);
 }
 function reload(){
  if(!current||!token)return;
  if(context?.replaceFromPlan(current))window.location.reload();else setMessage({token,editor:'loadError'});
 }
 async function share() {
  if(!token)return;
  const request=++operation.current,url=window.location.origin+localizedHref(tripPath(token),locale);
  setCopying({token});setMessage(null);setLink({token,url});
  try {await navigator.clipboard.writeText(url);if(request===operation.current)setMessage({token,trip:"Link skopiowany. Odbiorca otrzyma niezależną kopię planu."});}
  catch {if(request===operation.current)setMessage({token,trip:"Skopiuj link z pola poniżej. Odbiorca otrzyma niezależną kopię planu."});}
  finally {if(request===operation.current)setCopying(null);}
 }
 const sharing=copying?.token===token,disabled=!ready||!store.ready||store.corrupt||store.busy||store.requiresMigration||!store.lockingAvailable;
 return <section id="trip-save" tabIndex={-1} aria-label={t("Zapisz i udostępnij wyjazd")}>
  <h3>{local?editor.title:t("Zachowaj plan podróży")}</h3>
  <p className={styles.note}>{copy.localOnly}</p><p className={styles.note}>{local?editor.sessionHint:copy.snapshotHint}</p>
  <p>{t("Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.")}</p>
  <p>{sharePrivacyCopy[locale].privacy}</p>
  {!!Object.keys(draft.estimates?.profiles??{}).length&&<p>{budgetProfileCopy[locale].share}</p>}
  {!!draft.events?.length&&<p>{plannedEventsCopy[locale].shared}</p>}
  {!local&&ready&&store.ready&&token&&!store.readError&&!store.corrupt&&<p data-testid="saved-plan-state">{store.tokens.includes(token)?copy.saved:copy.unsaved}</p>}
  {local&&ready&&store.ready&&!store.readError&&!store.corrupt&&<p data-testid="saved-plan-state" role={state==='conflict'||state==='removed'?'alert':undefined}><span data-testid="plan-edit-state">{state==='saved'?editor.saved:state==='dirty'?editor.dirty:state==='removed'?editor.removed:editor.conflict}</span></p>}
  {local&&store.readError&&<p role="alert">{editor.loadError}</p>}
  {store.corrupt&&<p className={styles.warning}>{copy.corrupt}</p>}
  {store.requiresMigration&&<p>{storage.migration}</p>}
  {store.ready&&!store.lockingAvailable&&<p className={styles.warning}>{storage.unsupported}</p>}
  <div className="trip-actions">
   {local?<><button type="button" className="button" disabled={disabled||!token||state!=='dirty'} aria-busy={store.busy} onClick={update}>{editor.update}</button>
    <button type="button" className="button button-secondary" disabled={disabled||!token} onClick={()=>save(true)}>{editor.duplicate}</button>
    <button type="button" className="button button-secondary" disabled={disabled||!current||state==='conflict'} onClick={remove}>{editor.remove}</button></>:
    <button type="button" className="button" disabled={disabled||!token} aria-busy={store.busy} onClick={()=>save()}>{t("Zapisz wyjazd")}</button>}
   <button type="button" className="button button-secondary" disabled={!ready||!token||sharing||store.busy} aria-busy={sharing} onClick={share}>{t("Udostępnij")}</button>
   <Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link>
  </div>
  {local&&current&&state!=='saved'&&<button type="button" className="button button-secondary" disabled={!ready||store.busy||store.corrupt} onClick={reload}>{editor.reload}</button>}
  {undo&&<button type="button" className="button button-secondary" disabled={disabled} onClick={restore}>{copy.undo}</button>}
  {created&&<Link href={localizedHref(localPlanPath(created.id),locale)}>{editor.open}</Link>}
  {!token&&<p>{t("Popraw pola i daty przed zapisaniem lub udostępnieniem. Nieznane wydatki mogą pozostać puste.")}</p>}
  {!token&&cleanSharedTrip({version:1,offer,draft})&&<p role="status">{plannedEventsCopy[locale].oversized}</p>}
  <p aria-live="polite" aria-atomic="true">{store.busy?storage.busy:sharing?copy.copying:message?.token===token?('trip' in message?t(message.trip):'storage' in message?storage[message.storage]:'editor' in message?editor[message.editor]:copy[message.saved]):''}</p>
  {link&&<><p className={link.token===token?styles.note:styles.warning} data-testid="share-version">{link.token===token?copy.linkCurrent:copy.linkOld}</p><p><label htmlFor="trip-share-link">{t("Link do kopii planu")}</label><input id="trip-share-link" className="trip-share-link" readOnly value={link.url} onFocus={event=>event.target.select()}/>
   <span>{t("Link przedstawia plan z chwili kliknięcia „Udostępnij”. Po zmianach utwórz go ponownie.")}</span></p></>}
 </section>;
}
