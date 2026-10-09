"use client";

import {useEffect, useRef, useState, type FormEvent} from "react";
import type {Deal} from "../../lib/api";
import {publicApi} from "../../lib/session";

type Category = "ALL" | "MUSIC" | "SPORTS" | "CULTURE";
type Event = {
  id:string; name:string; category:Exclude<Category,"ALL">|"OTHER";
  venue:string; city:string; start_date:string; end_date:string|null;
  local_time:string|null; timezone:string; status:"onsale"|"offsale"|"rescheduled";
  url:string; price_from:string|null; currency:string|null;
  genre?:string|null;
  sessions?:Omit<Event,"sessions"|"name"|"category"|"venue"|"city"|"genre">[];
};
type Results = {
  status:"READY"|"EMPTY"|"UNAVAILABLE"|"NEEDS_DATES"|"DISABLED"|"UNSUPPORTED";
  events:Event[]; start_date:string|null; end_date:string|null;
  checked_at:string|null; partial:boolean;
};
const labels = {ALL:"Wszystkie", MUSIC:"Muzyka", SPORTS:"Sport", CULTURE:"Kultura i wystawy", OTHER:"Inne"};

function localDate(value:string):string {
  // Date-only values must not move to the previous day in the browser's timezone.
  const [year,month,day]=value.split("-");
  return `${day}.${month}.${year}`;
}

function addDays(value:string, days:number):string {
  const date=new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate()+days);
  return date.toISOString().slice(0,10);
}

export function TripEvents({deal}:{deal:Deal}) {
  const roundTrip=deal.trip_type==="ROUND_TRIP";
  const maxDate=roundTrip ? deal.trip_end : addDays(deal.trip_start,90);
  const initialEnd=roundTrip ? [deal.trip_end,addDays(deal.trip_start,30)].sort()[0] : "";
  const [start,setStart]=useState(deal.trip_start);
  const [end,setEnd]=useState(initialEnd);
  const [category,setCategory]=useState<Category>("ALL");
  const [result,setResult]=useState<Results|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const pending=useRef<AbortController|null>(null);
  useEffect(()=>()=>pending.current?.abort(),[]);

  function reset() {
    pending.current?.abort();
    pending.current=null;
    setBusy(false); setResult(null); setError("");
  }
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset();
    if(!start || !end || end<start || end>addDays(start,30) || start<deal.trip_start || end>maxDate) {
      setError("Wybierz okres pobytu obejmujący maksymalnie 31 dni, w granicach podróży.");
      return;
    }
    const controller=new AbortController();
    pending.current=controller;
    setBusy(true);
    const timer=setTimeout(()=>controller.abort(),15000);
    try {
      const params=new URLSearchParams({start_date:start,end_date:end,category});
      const response=await fetch(publicApi(`/api/v1/deals/${encodeURIComponent(deal.slug)}/events?${params}`),
        {signal:controller.signal,cache:"no-store"});
      if(!response.ok) throw new Error("Events unavailable");
      const data:Results=await response.json();
      if(pending.current===controller) setResult(data);
    } catch {
      if(pending.current===controller) setError("Nie udało się pobrać wydarzeń. Spróbuj ponownie za chwilę.");
    } finally {
      clearTimeout(timer);
      if(pending.current===controller) {pending.current=null;setBusy(false);}
    }
  }

  return <section className="trip-events" aria-labelledby="trip-events-title">
    <div className="section-heading"><div><p className="eyebrow">Odkryj {deal.destination_city}</p>
      <h2 id="trip-events-title">Wydarzenia w terminie podróży</h2></div></div>
    <p>Sprawdź koncerty, sport i kulturę w mieście docelowym. Bilety na wydarzenia kupujesz osobno.</p>
    {!roundTrip && <p className="muted">Lot w jedną stronę — podaj koniec pobytu, aby dobrać wydarzenia.</p>}
    <form className="events-form" onSubmit={submit}>
      <label>Od<input type="date" required value={start} min={deal.trip_start} max={maxDate}
        onChange={event=>{reset();setStart(event.target.value);}}/></label>
      <label>Do<input type="date" required value={end} min={start || deal.trip_start} max={maxDate}
        onChange={event=>{reset();setEnd(event.target.value);}}/></label>
      <label>Kategoria<select value={category} onChange={event=>{reset();setCategory(event.target.value as Category);}}>
        {(["ALL","MUSIC","SPORTS","CULTURE"] as const).map(key=><option key={key} value={key}>{labels[key]}</option>)}
      </select></label>
      <button className="button" type="submit" disabled={busy}>{busy ? "Szukamy wydarzeń…" : "Pokaż wydarzenia"}</button>
    </form>
    <p className="muted">Daty i godziny są lokalne. W dniu przylotu i wylotu uwzględnij czas lotu i dojazdu.
      Kategorie pochodzą od dostawcy; oferta „Sport” może obejmować także pokazy i spotkania.</p>
    <div role="status" aria-live="polite" aria-atomic="true">
      {busy && <p>Wyszukujemy wydarzenia dla wybranego okresu.</p>}
      {error && <p>{error}</p>}
      {result?.status==="EMPTY" && <p>Nie znaleźliśmy wydarzeń w tym źródle dla wybranych dat i kategorii.</p>}
      {result && ["UNAVAILABLE","DISABLED","UNSUPPORTED"].includes(result.status) &&
        <p>Wydarzenia są chwilowo niedostępne. Oferta lotu pozostaje dostępna.</p>}
      {result?.status==="NEEDS_DATES" && <p>Wybierz daty pobytu.</p>}
      {result?.status==="READY" && <p>Znaleziono propozycje na {localDate(result.start_date!)} – {localDate(result.end_date!)}.</p>}
    </div>
    {result?.partial && <p className="muted">Pokazujemy wybrane wydarzenia. Zawęź daty lub kategorię, aby zobaczyć inne propozycje.</p>}
    {result?.events.length ? <ul className="events-grid">
      {result.events.map(item=><li key={item.id} className="event-card">
        <span className="badge">{labels[item.category]}</span>
        <h3>{item.name}</h3>
        <p className="muted">{item.venue} · {item.city}<br/>{item.timezone}</p>
        {item.genre && <p className="muted">Rodzaj według dostawcy: {item.genre}</p>}
        {(item.sessions?.length ?? 0)>1 && <p>Terminy w wybranym okresie: {item.sessions!.length}</p>}
        {(item.sessions?.length ? item.sessions : [item]).map(session=><div key={session.id}>
        <p><time dateTime={session.start_date}>{localDate(session.start_date)}</time>
          {session.end_date && session.end_date!==session.start_date && <> – <time dateTime={session.end_date}>{localDate(session.end_date)}</time></>}
          {session.local_time ? ` · ${session.local_time.slice(0,5)}` : " · Godzina do potwierdzenia"}</p>
        {session.start_date<=deal.trip_start && (session.end_date || session.start_date)>=deal.trip_start &&
          <p className="muted">Obejmuje dzień lotu do celu — sprawdź godzinę przylotu i czas dojazdu.</p>}
        {roundTrip && session.start_date<=deal.trip_end && (session.end_date || session.start_date)>=deal.trip_end &&
          <p className="muted">Obejmuje dzień lotu powrotnego — uwzględnij dojazd i odprawę.</p>}
        {session.status==="rescheduled" && <p className="muted">Termin zmieniony — potwierdź szczegóły u organizatora.</p>}
        {session.status==="offsale" && <p className="muted">Sprzedaż obecnie niedostępna.</p>}
        <p>{session.price_from!==null && session.currency ?
          `Od ${new Intl.NumberFormat("pl-PL",{style:"currency",currency:session.currency}).format(Number(session.price_from))}` :
          "Cena do sprawdzenia u sprzedawcy"}</p>
        <a className="button button-secondary" href={session.url} target="_blank" rel="noopener noreferrer">
          {session.status==="offsale" ? "Sprawdź szczegóły" : "Sprawdź daty i cenę"}<span className="sr-only">: {item.name}, {localDate(session.start_date)}{session.local_time ? ` ${session.local_time.slice(0,5)}` : ""} (nowa karta)</span>
        </a>
        </div>)}
      </li>)}
    </ul> : null}
    {result?.checked_at && <p className="muted">Źródło: Ticketmaster Discovery · Sprawdzono: {new Intl.DateTimeFormat("pl-PL",
      {dateStyle:"short",timeStyle:"short"}).format(new Date(result.checked_at))}.
      Dostępność biletów i zasady wstępu potwierdza sprzedawca. Każdy termin ma osobny link; bilet nie musi obejmować wszystkich terminów.</p>}
  </section>;
}
