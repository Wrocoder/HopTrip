"use client";
import {useLocale} from "./locale-provider";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {track} from "../../lib/session";
import {useRef,useState} from "react";
import Link from "next/link";
import type {BudgetDraft} from "../../lib/budget-draft";
import {encodeTrip,tripPath,type TripOffer} from "../../lib/shared-trip";
import {plannedEventsCopy} from '../../lib/i18n/planned-events-copy';
import {cleanSharedTrip} from '../../lib/shared-trip';
import {useSavedTrips} from './use-saved-trips';
import {savedTripCopy} from '../../lib/i18n/saved-trip-copy';
import styles from './saved-trips.module.css';

export function TripActions({offer,draft,ready}:{offer:TripOffer;draft:BudgetDraft;ready:boolean}) {
 const {locale}=useLocale();
 const t=(source:TripKey)=>tripText(locale,source);
 const copy=savedTripCopy[locale],store=useSavedTrips();
 const [message,setMessage]=useState<({token:string}&({trip:TripKey}|{saved:keyof typeof copy}))|null>(null);
 const [link,setLink]=useState<{token:string;url:string}|null>(null);
 const [copying,setCopying]=useState<{token:string}|null>(null);
 const operation=useRef(0);
 const token=encodeTrip({version:1,offer,draft});
 function save() {
  if(!token)return;
  operation.current++;
  setCopying(null);
  const result=store.mutate(token,'save');
  if(result==='saved'){
   track("TRIP_SAVE");setMessage({token,trip:"Zapisano wyjazd w tej przeglądarce. Znajdziesz go na liście zapisanych wyjazdów."});
  }else if(result==='already')setMessage({token,saved:'already'});
  else if(result==='corrupt')setMessage({token,saved:'corrupt'});
  else setMessage({token,trip:result==='full'?"Masz już 20 zapisanych planów. Usuń jeden na liście przed zapisaniem kolejnego.":"Nie udało się zapisać wyjazdu w przeglądarce. Nadal możesz udostępnić link."});
 }
 async function share() {
  if(!token)return;
  const request=++operation.current;
  const url=window.location.origin+localizedHref(tripPath(token),locale);
  setCopying({token});
  setMessage(null);
  setLink({token,url});
  try {await navigator.clipboard.writeText(url);if(request===operation.current)setMessage({token,trip:"Link skopiowany. Odbiorca otrzyma niezależną kopię planu."});}
  catch {if(request===operation.current)setMessage({token,trip:"Skopiuj link z pola poniżej. Odbiorca otrzyma niezależną kopię planu."});}
  finally {if(request===operation.current)setCopying(null);}
 }
 const sharing=copying?.token===token;
 return <section id="trip-save" tabIndex={-1} aria-label={t("Zapisz i udostępnij wyjazd")}>
  <h3>{t("Zachowaj plan podróży")}</h3>
  <p className={styles.note}>{copy.localOnly}</p><p className={styles.note}>{copy.snapshotHint}</p>
  <p>{t("Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.")}</p>
  {!!draft.events?.length&&<p>{plannedEventsCopy[locale].shared}</p>}
  {ready&&store.ready&&token&&!store.readError&&!store.corrupt&&<p data-testid="saved-plan-state">{store.tokens.includes(token)?copy.saved:copy.unsaved}</p>}
  {store.corrupt&&<p className={styles.warning}>{copy.corrupt}</p>}
  <div className="trip-actions"><button type="button" className="button" disabled={!ready || !store.ready || !token || store.corrupt} onClick={save}>{t("Zapisz wyjazd")}</button>
   <button type="button" className="button button-secondary" disabled={!ready || !token || sharing} aria-busy={sharing} onClick={share}>{t("Udostępnij")}</button>
   <Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link></div>
  {!token && <p>{t("Popraw pola i daty przed zapisaniem lub udostępnieniem. Nieznane wydatki mogą pozostać puste.")}</p>}
  {!token&&cleanSharedTrip({version:1,offer,draft})&&<p role="status">{plannedEventsCopy[locale].oversized}</p>}
  <p aria-live="polite" aria-atomic="true">{sharing?copy.copying:message?.token===token?('trip' in message?t(message.trip):copy[message.saved]):''}</p>
  {link && <><p className={link.token===token?styles.note:styles.warning} data-testid="share-version">{link.token===token?copy.linkCurrent:copy.linkOld}</p><p><label htmlFor="trip-share-link">{t("Link do kopii planu")}</label><input id="trip-share-link" className="trip-share-link" readOnly value={link.url} onFocus={event=>event.target.select()}/>
   <span>{t("Link przedstawia plan z chwili kliknięcia „Udostępnij”. Po zmianach utwórz go ponownie.")}</span></p></>}
 </section>;
}
