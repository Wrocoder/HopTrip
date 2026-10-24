"use client";

import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {Deal} from '../../lib/api';
import {publicApi} from '../../lib/session';
import {intlLocales,type Locale} from '../../lib/i18n/config';
import {eventCopy,eventUx} from '../../lib/i18n/event-copy';
import styles from './trip-events.module.css';

type Category='ALL'|'MUSIC'|'SPORTS'|'CULTURE';
type EventItem={id:string;name:string;category:Exclude<Category,'ALL'>|'OTHER';venue:string;city:string;
 start_date:string;end_date:string|null;local_time:string|null;timezone:string;status:string;
 url:string;price_from:string|null;currency:string|null};
type Results={status:string;events:EventItem[];checked_at:string|null;partial:boolean};
function addDays(value:string,days:number){const d=new Date(`${value}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function destinationDate(value:string|undefined|null,zone:string|undefined|null,fallback:string){
 if(!value||!zone)return fallback;
 try{return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
 catch{return fallback;}
}
export function TripEvents({deal,locale='pl'}:{deal:Deal;locale?:Locale}){
 const t=eventCopy[locale],intl=intlLocales[locale],roundTrip=deal.trip_type==='ROUND_TRIP';
 const ux=eventUx[locale];
 const zone=deal.flight_facts?.destination_timezone;
 const first=destinationDate(deal.flight_facts?.outbound_arrival,zone,deal.trip_start);
 const last=roundTrip?destinationDate(deal.flight_facts?.return_departure,zone,deal.trip_end):addDays(first,90);
 const [start,setStart]=useState(first),[end,setEnd]=useState(roundTrip?[last,addDays(first,30)].sort()[0]:'');
 const [category,setCategory]=useState<Category>('ALL'),[result,setResult]=useState<Results|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef<AbortController|null>(null);
 const form=useRef<HTMLFormElement|null>(null);
 useEffect(()=>{
  if(deal.events_supported&&roundTrip)form.current?.requestSubmit();
 },[deal.slug,deal.events_supported,roundTrip]);
 useEffect(()=>()=>pending.current?.abort(),[]);
 const labels={ALL:t.all,MUSIC:t.music,SPORTS:t.sports,CULTURE:t.culture,OTHER:t.other};
 function reset(){pending.current?.abort();pending.current=null;setBusy(false);setResult(null);setError('');}
 function date(value:string){return new Intl.DateTimeFormat(intl,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();reset();
  if(!start||!end||start<first||end<start||end>last||end>addDays(start,30)){setError(t.dates);return;}
  const controller=new AbortController();pending.current=controller;setBusy(true);
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const params=new URLSearchParams({start_date:start,end_date:end,category});
   const response=await fetch(publicApi(`/api/v1/deals/${encodeURIComponent(deal.slug)}/events?${params}`),{signal:controller.signal,cache:'no-store'});
   if(!response.ok)throw new Error('Events unavailable');
   const data:Results=await response.json();
   if(pending.current===controller)setResult(data);
  }catch{if(pending.current===controller)setError(t.unavailable);}
  finally{clearTimeout(timeout);if(pending.current===controller){pending.current=null;setBusy(false);}}
 }
 if(!deal.events_supported)return null;
 const unavailable=error===t.unavailable||!!(result&&['DISABLED','UNAVAILABLE','UNSUPPORTED'].includes(result.status));
 return <section className={styles.section} aria-labelledby="trip-events-title">
  <header className={styles.header}><div><h2 id="trip-events-title">{t.title}</h2><p>{t.intro}</p></div>
   <span className={styles.source}>Ticketmaster</span></header>
  <p className={styles.stay}><span>{ux.stay} · {deal.destination_city}</span><strong>{date(first)}{roundTrip&&<> – {date(last)}</>}</strong></p>
  <form ref={form} className={styles.form} onSubmit={submit}>
   <label>{t.from}<input type="date" required value={start} min={first} max={last} onChange={e=>{reset();setStart(e.target.value);}}/></label>
   <label>{t.to}<input type="date" required value={end} min={start||first} max={[last,addDays(start||first,30)].sort()[0]} onChange={e=>{reset();setEnd(e.target.value);}}/></label>
   <label>{t.category}<select value={category} onChange={e=>{reset();setCategory(e.target.value as Category);}}>
    {(['ALL','MUSIC','SPORTS','CULTURE'] as const).map(c=><option key={c} value={c}>{labels[c]}</option>)}
   </select></label><button className="button" disabled={busy} type="submit">{busy?t.loading:t.search}</button>
  </form>
  <div role="status" aria-live="polite" className={styles.feedback}>
   {busy&&<p>{t.loading}</p>}
   {error&&<p>{error}</p>}
   {!error&&unavailable&&<p>{t.unavailable}</p>}
   {!busy&&result?.status==='EMPTY'&&<p>{t.empty}</p>}
   {result?.status==='NEEDS_DATES'&&<p>{t.dates}</p>}
   {!busy&&!result&&!error&&<p>{end?ux.edit:t.oneWay}</p>}
   {!!result?.events.length&&<p>{ux.results}: <strong>{result.events.length}</strong> · {ux.local}</p>}
  </div>
  {unavailable&&<button type="button" className={styles.retry} onClick={()=>form.current?.requestSubmit()}>{ux.retry} <span aria-hidden="true">↻</span></button>}
  {busy&&<div className={styles.skeletons} aria-hidden="true">{[0,1,2].map(i=><div key={i} className={styles.skeleton}><span/><span/><span/></div>)}</div>}
  {result?.partial&&result.status!=='UNAVAILABLE'&&<p className={styles.hint}>{t.partial}</p>}
  {!!result?.events.length&&<ul className={styles.grid}>{result.events.map(item=><li className={styles.card} key={item.id}>
   <div className={styles.cardTop}><span className={styles.category}>{labels[item.category]}</span>
    <span className={styles.day} aria-hidden="true">{new Intl.DateTimeFormat(intl,{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${item.start_date}T12:00:00Z`))}</span></div>
   <h3>{item.name}</h3><p className={styles.venue}>{item.venue} · {item.city}</p>
   <p><time dateTime={item.start_date}>{date(item.start_date)}</time>
    {item.end_date&&item.end_date!==item.start_date&&<> – {date(item.end_date)}</>}
    {' · '}{item.local_time?.slice(0,5)||t.unknownTime}</p>
   {item.status==='rescheduled'&&<p>{t.rescheduled}</p>}
   <p className={styles.price}>{item.price_from!==null&&item.currency?`${t.price} ${new Intl.NumberFormat(intl,{style:'currency',currency:item.currency}).format(Number(item.price_from))}`:t.unknownPrice}</p>
   <a className="button button-secondary" href={item.url} target="_blank" rel="sponsored noopener noreferrer" aria-label={`${t.buy}: ${item.name}. ${ux.newTab}`}>{t.buy} <span aria-hidden="true">↗</span></a>
  </li>)}</ul>}
  {result?.checked_at&&<p className="muted">{t.source} · {t.checked}: {new Intl.DateTimeFormat(intl,{dateStyle:'short',timeStyle:'short'}).format(new Date(result.checked_at))}</p>}
  <details className={styles.details}><summary>{ux.before}</summary><p>{t.warning}</p></details>
  <p className={styles.disclosure}>{t.disclosure}</p>
 </section>;
}
