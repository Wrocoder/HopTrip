"use client";
import {useLocale} from "./locale-provider";
import {alertText,type AlertKey} from "../../lib/i18n/alert-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {useState,useSyncExternalStore,type FormEvent} from "react";
import type {Airport,Destination,Filters} from "../../lib/api";
import {publicApi,track} from "../../lib/session";
import {cityLabel,originLabel} from "../../lib/cities";

type AlertSettings={origin:string;budget:string;duration_min:number;duration_max:number;destination:string|null;departure_from:string|null;departure_to:string|null;weekend:boolean;frequency:"weekly"|"daily"};
class AlertError extends Error { constructor(readonly key:AlertKey){super(key);} }
async function action(path:string,body:unknown,method="POST") {
  const response=await fetch(publicApi(`/api/v1/alerts${path}`),{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new AlertError(response.status===410 ? "Link wygasł. Zapisz się ponownie, aby otrzymać nowy." :
    response.status===404 ? "Link jest nieprawidłowy lub wygasł." : response.status===422 ? "Sprawdź lotnisko, email i zakres dat oraz długości pobytu." :
    response.status===429 ? "Limit prób został osiągnięty. Spróbuj później." : "Nie udało się wykonać operacji. Spróbuj ponownie później.");
  return response.json();
}
const subscribeHydration=()=>()=>{};
const clientHydrated=()=>true;
const serverHydrated=()=>false;
const linkToken=()=>new URLSearchParams(location.hash.slice(1)).get("token")??"";

export function AlertForm({mode,airports,destinations,initial={},deliveryEnabled=false}:{deliveryEnabled?:boolean;mode:"signup"|"confirm"|"manage";airports:Airport[];destinations:Destination[];initial?:Filters}) {
  const {locale}=useLocale();
  const t=(key:AlertKey)=>alertText(locale,key);
  const hydrated=useSyncExternalStore(subscribeHydration,clientHydrated,serverHydrated);
  const [values,setValues]=useState({...initial,origin:initial.origin??"",budget:initial.budget??"200",duration_min:initial.duration_min??"0",duration_max:initial.duration_max??"14",frequency:"weekly",weekend:initial.weekend??"false"});
  const [message,setMessage]=useState<AlertKey|"">("");
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState(mode==="signup"?"NEW":"UNLOADED");
  const [manageToken,setManageToken]=useState("");
  function field(key:keyof Filters|"frequency",value:string) {setValues(previous=>({...previous,[key]:value}));}
  async function perform(operation:()=>Promise<void>) {
    setBusy(true);setMessage("");
    try {await operation();} catch(error) {setMessage(error instanceof AlertError ? error.key : "Nie udało się wykonać operacji. Spróbuj ponownie później.");}
    finally {setBusy(false);}
  }
  function loadSettings(result:{status:string;filters:AlertSettings}) {
    setStatus(result.status);
    const filters=result.filters;
    setValues({origin:filters.origin,budget:String(filters.budget),duration_min:String(filters.duration_min),duration_max:String(filters.duration_max),
      destination:filters.destination??"",departure_from:filters.departure_from??"",departure_to:filters.departure_to??"",weekend:String(filters.weekend??false),frequency:filters.frequency??"weekly"});
  }
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const filters:AlertSettings={origin:values.origin,budget:values.budget,duration_min:Number(values.duration_min),duration_max:Number(values.duration_max),
      destination:values.destination||null,departure_from:values.departure_from||null,departure_to:values.departure_to||null,weekend:values.weekend==="true",frequency:values.frequency==="daily"?"daily":"weekly"};
    await perform(async()=>{
      if(mode==="signup") {
        await action("",{email:data.get("email"),consent:data.get("consent")==="on",filters});
        setStatus("REQUESTED");setMessage("Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Prośba o zapis nie oznacza potwierdzonej subskrypcji. Link wysyłamy najwyżej raz na dobę.");
      } else {
        loadSettings(await action("/manage",{token:linkToken(),filters},"PATCH"));setMessage("Zapisano ustawienia.");
      }
    });
  }
  return <section className="alert-panel" aria-label={t("Alerty lotnicze")}>
    {locale!=="pl" && <p>{t("Wiadomości email są obecnie dostępne po polsku. Język strony nie zmienia języka wiadomości.")}</p>}
    <p data-testid="alert-delivery-status">{deliveryEnabled ? t("Wysyłka jest włączona. Po potwierdzeniu emaila wysyłamy tylko nowe dopasowania, według wybranej częstotliwości. Gdy brak pasujących lotów, nie wysyłamy wiadomości.") : t("Wysyłka podsumowań jest obecnie wstrzymana. Możesz zapisać i potwierdzić preferencje; oferty otrzymasz dopiero po wznowieniu wysyłki.")}</p>
    {mode==="confirm" && <>
      <p>{t("Potwierdź, że ten adres email należy do Ciebie. Dopiero po potwierdzeniu subskrypcja staje się aktywna. Wypisanie jest dostępne w ustawieniach.")}</p>
      {!manageToken ? <button className="button" disabled={busy || !hydrated} onClick={()=>perform(async()=>{const result=await action("/confirm",{token:linkToken()});setManageToken(result.token);track("ALERT_CONFIRMED");setMessage("Alert został potwierdzony.");})}>{t("Potwierdzam zapis")}</button> :
        <a className="button" href={localizedHref(`/alerts/manage#token=${encodeURIComponent(manageToken)}`,locale)}>{t("Zarządzaj alertem")}</a>}
    </>}
    {mode==="manage" && <div className="consent-actions">
      {status==="UNLOADED" && <button disabled={busy || !hydrated} onClick={()=>perform(async()=>loadSettings(await action("/manage",{token:linkToken()})))}>{t("Pokaż ustawienia")}</button>}
      {status!=="STOPPED" && <button disabled={busy || !hydrated} onClick={()=>perform(async()=>{await action("/unsubscribe",{token:linkToken()});setStatus("STOPPED");setMessage("Alert wyłączony. Nie wyślemy kolejnych ofert.");})}>{t("Wyłącz alert")}</button>}
    </div>}
    {(status==="NEW"||status==="ACTIVE") && <form className="alert-fields" onSubmit={submit}>
      {mode==="signup" && <label>{t("Email")}<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}
      <label>{t("Lotnisko wylotu")}<select required value={values.origin} onChange={e=>field("origin",e.target.value)}><option value="">{t("Wybierz lotnisko")}</option>
        {airports.map(a=><option key={a.id} value={a.iata_code}>{originLabel(a.city,a.iata_code,locale)} — {a.iata_code}</option>)}</select></label>
      <label>{t("Kierunek")}<select value={values.destination??""} onChange={e=>field("destination",e.target.value)}><option value="">{t("Dowolny")}</option>
        {destinations.map(d=><option key={d.id} value={d.slug}>{cityLabel(d.city,d.slug,locale)}</option>)}</select></label>
      <label>{t("Budżet na lot na osobę (PLN)")}<input required type="number" min="0.01" max="1000000" step="0.01" value={values.budget} onChange={e=>field("budget",e.target.value)}/></label>
      <label>{t("Minimum nocy")}<input required type="number" min="0" max="365" value={values.duration_min} onChange={e=>field("duration_min",e.target.value)}/></label>
      <label>{t("Maksimum nocy")}<input required type="number" min={values.duration_min||0} max="365" value={values.duration_max} onChange={e=>field("duration_max",e.target.value)}/></label>
      <label>{t("Wylot od (opcjonalnie)")}<input type="date" value={values.departure_from??""} onChange={e=>field("departure_from",e.target.value)}/></label>
      <label>{t("Wylot do (opcjonalnie)")}<input type="date" min={values.departure_from} value={values.departure_to??""} onChange={e=>field("departure_to",e.target.value)}/></label>
      <label className="alert-consent"><input type="checkbox" checked={values.weekend==="true"} onChange={e=>field("weekend",String(e.target.checked))}/>{t("Tylko weekendy: wylot w piątek lub sobotę, powrót w najbliższą niedzielę")}</label>
      <label>{t("Częstotliwość")}<select value={values.frequency} onChange={e=>field("frequency",e.target.value)}><option value="weekly">{t("Raz w tygodniu")}</option><option value="daily">{t("Najwyżej raz dziennie")}</option></select></label>
      {mode==="signup" && <label className="alert-consent"><input name="consent" type="checkbox" required/>{t("Chcę otrzymywać od HopTrip email z pasującymi lotami według wybranej częstotliwości gdy wysyłka jest włączona. Mogę wyłączyć alert w każdej chwili.")}</label>}
      <button className="button" disabled={busy || !hydrated} type="submit">{busy?t("Zapisywanie…"):mode==="signup"?t("Wyślij link potwierdzający"):t("Zapisz ustawienia")}</button>
    </form>}
    {status==="PENDING" && <p>{t("Najpierw potwierdź zapis linkiem z emaila.")}</p>}
    {status==="STOPPED" && <p>{t("Ten alert jest wyłączony.")}</p>}
    <p role="status" aria-live="polite">{message ? t(message) : ""}</p>
    <p>{t("Email i ustawienia służą obsłudze alertu. Nie przekazujemy adresu email partnerom ofert.")} <a href={localizedHref("/info/privacy",locale)}>{t("Prywatność")}</a></p>
  </section>;
}
