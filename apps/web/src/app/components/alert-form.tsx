"use client";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import type {Airport,Destination,Filters} from "../../lib/api";
import {publicApi} from "../../lib/session";

type AlertSettings={origin:string;budget:string;duration_min:number;duration_max:number;destination:string|null;departure_from:string|null;departure_to:string|null};
async function action(path:string,body:unknown,method="POST") {
  const response=await fetch(publicApi(`/api/v1/alerts${path}`),{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(response.status===410 ? "Link wygasł. Zapisz się ponownie, aby otrzymać nowy." :
    response.status===404 ? "Link jest nieprawidłowy lub wygasł." : response.status===422 ? "Sprawdź lotnisko, email i zakres dat oraz długości pobytu." :
    response.status===429 ? "Limit prób został osiągnięty. Spróbuj później." : "Nie udało się wykonać operacji. Spróbuj ponownie później.");
  return response.json();
}
const linkToken=()=>new URLSearchParams(location.hash.slice(1)).get("token")??"";

export function AlertForm({mode,airports,destinations,initial={}}:{mode:"signup"|"confirm"|"manage";airports:Airport[];destinations:Destination[];initial?:Filters}) {
  const [values,setValues]=useState({...initial,origin:initial.origin??"",budget:initial.budget??"200",duration_min:initial.duration_min??"0",duration_max:initial.duration_max??"14"});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState(mode==="signup"?"NEW":"UNLOADED");
  const [manageToken,setManageToken]=useState("");
  function field(key:keyof Filters,value:string) {setValues(previous=>({...previous,[key]:value}));}
  async function perform(operation:()=>Promise<void>) {
    setBusy(true);setMessage("");
    try {await operation();} catch(error) {setMessage(error instanceof Error?error.message:"Nie udało się wykonać operacji.");}
    finally {setBusy(false);}
  }
  function loadSettings(result:{status:string;filters:AlertSettings}) {
    setStatus(result.status);
    const filters=result.filters;
    setValues({origin:filters.origin,budget:String(filters.budget),duration_min:String(filters.duration_min),duration_max:String(filters.duration_max),
      destination:filters.destination??"",departure_from:filters.departure_from??"",departure_to:filters.departure_to??""});
  }
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const filters:AlertSettings={origin:values.origin,budget:values.budget,duration_min:Number(values.duration_min),duration_max:Number(values.duration_max),
      destination:values.destination||null,departure_from:values.departure_from||null,departure_to:values.departure_to||null};
    await perform(async()=>{
      if(mode==="signup") {
        await action("",{email:data.get("email"),consent:data.get("consent")==="on",filters});
        setStatus("REQUESTED");setMessage("Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Wiadomość wysyłamy najwyżej raz na dobę.");
      } else {
        loadSettings(await action("/manage",{token:linkToken(),filters},"PATCH"));setMessage("Zapisano ustawienia.");
      }
    });
  }
  return <section className="alert-panel" aria-label="Alerty lotnicze">
    {mode==="confirm" && <>
      <p>Potwierdź zapis, aby otrzymywać nowe loty pasujące do wybranych ustawień. Najwyżej jedna wiadomość na 24 godziny; wypisanie jest dostępne w każdym emailu.</p>
      {!manageToken ? <button className="button" disabled={busy} onClick={()=>perform(async()=>{const result=await action("/confirm",{token:linkToken()});setManageToken(result.token);setMessage("Alert został potwierdzony.");})}>Potwierdzam zapis</button> :
        <a className="button" href={`/alerts/manage#token=${manageToken}`}>Zarządzaj alertem</a>}
    </>}
    {mode==="manage" && <div className="consent-actions">
      {status==="UNLOADED" && <button disabled={busy} onClick={()=>perform(async()=>loadSettings(await action("/manage",{token:linkToken()})))}>Pokaż ustawienia</button>}
      {status!=="STOPPED" && <button disabled={busy} onClick={()=>perform(async()=>{await action("/unsubscribe",{token:linkToken()});setStatus("STOPPED");setMessage("Alert wyłączony. Nie wyślemy kolejnych ofert.");})}>Wyłącz alert</button>}
    </div>}
    {(status==="NEW"||status==="ACTIVE") && <form className="alert-fields" onSubmit={submit}>
      {mode==="signup" && <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}
      <label>Lotnisko wylotu<select required value={values.origin} onChange={e=>field("origin",e.target.value)}><option value="">Wybierz lotnisko</option>
        {airports.map(a=><option key={a.id} value={a.iata_code}>{a.city} — {a.iata_code}</option>)}</select></label>
      <label>Kierunek<select value={values.destination??""} onChange={e=>field("destination",e.target.value)}><option value="">Dowolny</option>
        {destinations.map(d=><option key={d.id} value={d.slug}>{d.city}</option>)}</select></label>
      <label>Budżet na lot na osobę (PLN)<input required type="number" min="0.01" max="1000000" step="0.01" value={values.budget} onChange={e=>field("budget",e.target.value)}/></label>
      <label>Minimum nocy<input required type="number" min="0" max="365" value={values.duration_min} onChange={e=>field("duration_min",e.target.value)}/></label>
      <label>Maksimum nocy<input required type="number" min={values.duration_min||0} max="365" value={values.duration_max} onChange={e=>field("duration_max",e.target.value)}/></label>
      <label>Wylot od (opcjonalnie)<input type="date" value={values.departure_from??""} onChange={e=>field("departure_from",e.target.value)}/></label>
      <label>Wylot do (opcjonalnie)<input type="date" min={values.departure_from} value={values.departure_to??""} onChange={e=>field("departure_to",e.target.value)}/></label>
      {mode==="signup" && <label className="alert-consent"><input name="consent" type="checkbox" required/>Chcę otrzymywać od HopTrip email z nowymi pasującymi lotami, najwyżej raz na dobę. Mogę wyłączyć alert w każdej chwili.</label>}
      <button className="button" disabled={busy} type="submit">{busy?"Zapisywanie…":mode==="signup"?"Wyślij link potwierdzający":"Zapisz ustawienia"}</button>
    </form>}
    {status==="PENDING" && <p>Najpierw potwierdź zapis linkiem z emaila.</p>}
    {status==="STOPPED" && <p>Ten alert jest wyłączony.</p>}
    <p role="status" aria-live="polite">{message}</p>
    <p>Email i ustawienia służą obsłudze alertu. Nie przekazujemy adresu email partnerom ofert. <Link href="/info/privacy">Prywatność</Link></p>
  </section>;
}
