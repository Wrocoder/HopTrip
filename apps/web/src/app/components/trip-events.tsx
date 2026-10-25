"use client";

import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {Deal} from '../../lib/api';
import {publicApi} from '../../lib/session';
import {intlLocales,type Locale} from '../../lib/i18n/config';
import {eventCopy,eventUx} from '../../lib/i18n/event-copy';
import {validEventDates} from '../../lib/event-dates';
import {changeStayDate} from '../../lib/budget-draft';
import {useTripDraft} from './trip-draft';
import {EventFlightNotice} from './event-flight-notice';
import type {EventFlightFit} from '../../lib/event-flight-fit';
import {eventFitCopy} from '../../lib/i18n/event-fit-copy';
import {cityLabel,eventCityLabel} from '../../lib/cities';
import {eventResultsCopy} from '../../lib/i18n/event-results-copy';
import styles from './trip-events.module.css';

type Category='ALL'|'MUSIC'|'SPORTS'|'CULTURE';
type TicketOption={id:string;name:string;ticket_kind:'STANDARD'|'PREMIUM';url:string;price_from:string|null;currency:string|null};
type EventItem={id:string;name:string;category:Exclude<Category,'ALL'>|'OTHER';venue:string;city:string;
 start_date:string;end_date:string|null;local_time:string|null;timezone:string;status:string;
 url:string;price_from:string|null;currency:string|null;ticket_options?:TicketOption[]};
type Results={status:string;events:EventItem[];checked_at:string|null;partial:boolean;flight_fit?:Record<string,EventFlightFit>};
type FetchState={key:string;kind:'ready'|'error'|'invalid';result?:Results};
export function TripEvents({deal,locale='pl',activitiesHref}:{deal:Deal;locale?:Locale;activitiesHref?:string}){
 const t=eventCopy[locale],intl=intlLocales[locale];
 const ux=eventUx[locale];
 const resultsCopy=eventResultsCopy[locale];
 const startInput=useRef<HTMLInputElement>(null);
 const {draft,save,ready}=useTripDraft()!;
 const [mode,setMode]=useState<'stay'|'other'>('stay');
 const [custom,setCustom]=useState({start:'',end:''});
 const {start,end}=mode==='stay'?draft:custom;
 const [category,setCategory]=useState<Category>('ALL');
 const [applied,setApplied]=useState<string|null>(null),[refresh,setRefresh]=useState(0);
 const [state,setState]=useState<FetchState|null>(null);
 const valid=validEventDates(start,end);
 const query=new URLSearchParams({start_date:start,end_date:end,category,date_mode:mode}).toString();
 const url=publicApi(`/api/v1/deals/${encodeURIComponent(deal.slug)}/events?${query}`);
 const requestKey=ready&&deal.events_supported&&valid&&(mode==='stay'||applied===query)?`${url}#${refresh}`:'';
 const current=state?.key===requestKey?state:null;
 const result=current?.result;
 const busy=Boolean(requestKey&&!current);
 const error=(ready&&start&&end&&!valid)||current?.kind==='invalid'?t.dates:current?.kind==='error'?t.unavailable:'';
 useEffect(()=>{
  if(!requestKey)return;
  const controller=new AbortController();
  let active=true;
  let timeout:ReturnType<typeof setTimeout>|undefined;
  // Briefly coalesce edits without allowing the previous response to remain visible.
  const delay=setTimeout(async()=>{
   timeout=setTimeout(()=>controller.abort(),15000);
   try{
    const response=await fetch(url,{signal:controller.signal,cache:'no-store'});
    if(!response.ok){if(active)setState({key:requestKey,kind:response.status===422?'invalid':'error'});return;}
    const data:Results=await response.json();
    if(active)setState({key:requestKey,kind:'ready',result:data});
   }catch{if(active)setState({key:requestKey,kind:'error'});}
   finally{clearTimeout(timeout);}
  },150);
  return()=>{active=false;controller.abort();clearTimeout(delay);clearTimeout(timeout);};
 },[requestKey,url]);
 const labels={ALL:t.all,MUSIC:t.music,SPORTS:t.sports,CULTURE:t.culture,OTHER:t.other};
 function date(value:string){return new Intl.DateTimeFormat(intl,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));}
 function changeDate(key:'start'|'end',value:string){
  if(mode==='stay')save(changeStayDate(draft,key,value));
  else setCustom(previous=>({...previous,[key]:value}));
 }
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!valid)return;
  setApplied(query);setRefresh(value=>value+1);
 }
 function otherDates(){
  setCustom({start:draft.start,end:draft.end});setApplied(null);setMode('other');
 }
 function editDates(){
  if(mode==='stay')otherDates();else setApplied(null);
  startInput.current?.focus();
 }
 function clearCategory(){
  setCategory('ALL');
  if(mode==='other')setApplied(new URLSearchParams({start_date:start,end_date:end,category:'ALL',date_mode:mode}).toString());
 }
 function price(amount:string|null,currency:string|null){
  return amount!==null&&currency?`${t.price} ${new Intl.NumberFormat(intl,{style:'currency',currency}).format(Number(amount))}`:t.unknownPrice;
 }
 if(!deal.events_supported)return null;
 const unavailable=error===t.unavailable||!!(result&&['DISABLED','UNAVAILABLE','UNSUPPORTED'].includes(result.status));
 return <section id="trip-events" tabIndex={-1} className={styles.section} aria-labelledby="trip-events-title">
  <header className={styles.header}><div><h2 id="trip-events-title">{t.title}</h2><p>{t.intro}</p></div>
   <span className={styles.source}>Ticketmaster</span></header>
  <p className={styles.stay} aria-live="polite"><span>{ux.stay} · {cityLabel(deal.destination_city,deal.destination_slug,locale)}</span><strong>{draft.start?date(draft.start):ux.noDates} – {draft.end?date(draft.end):ux.noDates}</strong></p>
  <div className={styles.dateMode}><strong>{mode==='stay'?ux.tripDates:ux.otherDates}</strong>
   <button type="button" className={styles.retry} disabled={!ready} onClick={mode==='stay'?otherDates:()=>setMode('stay')}>{mode==='stay'?ux.otherDates:ux.useTripDates}</button></div>
  <p className={styles.modeHint}>{mode==='stay'?ux.sharedHint:ux.otherHint}</p>
  <form className={styles.form} onSubmit={submit}>
   <label>{t.from}<input ref={startInput} type="date" required disabled={!ready} value={start} aria-invalid={Boolean(start&&end&&!valid)} onChange={e=>changeDate('start',e.target.value)}/></label>
   <label>{t.to}<input type="date" required disabled={!ready} value={end} min={start||undefined} aria-invalid={Boolean(start&&end&&!valid)} onChange={e=>changeDate('end',e.target.value)}/></label>
   <label>{t.category}<select value={category} disabled={!ready} onChange={e=>setCategory(e.target.value as Category)}>
    {(['ALL','MUSIC','SPORTS','CULTURE'] as const).map(c=><option key={c} value={c}>{labels[c]}</option>)}
   </select></label><button className="button" disabled={!ready||busy} type="submit">{busy?t.loading:t.search}</button>
  </form>
  <div role="status" aria-live="polite" className={styles.feedback}>
   {busy&&<p>{t.loading}</p>}
   {error&&<p>{error}</p>}
   {!error&&unavailable&&<p>{t.unavailable}</p>}
   {!busy&&result?.status==='EMPTY'&&<p>{t.empty}</p>}
   {result?.status==='NEEDS_DATES'&&<p>{t.dates}</p>}
   {!ready&&<p>{ux.restoring}</p>}
   {ready&&!busy&&!result&&!error&&<p>{start&&end?ux.edit:deal.trip_type==='ONE_WAY'?t.oneWay:ux.noDates}</p>}
   {!!result?.events.length&&<p>{ux.results}: <strong>{result.events.length}</strong> · {ux.local}</p>}
  </div>
  {!busy&&!error&&result?.status==='EMPTY'&&<div className={styles.empty}>
   <h3>{resultsCopy.emptyTitle}</h3><p>{resultsCopy.coverage}</p>
   {result.partial&&<p>{resultsCopy.partialEmpty}</p>}
   <div className={styles.emptyActions}>
    {category!=='ALL'&&<button type="button" className={styles.retry} onClick={clearCategory}>{resultsCopy.clearCategory}</button>}
    <button type="button" className={styles.retry} onClick={editDates}>{resultsCopy.changeDates}</button>
    {activitiesHref&&<a className="button button-secondary" href={activitiesHref}>{resultsCopy.attractions}{locale!=='pl'?' (PL)':''}</a>}
   </div>
  </div>}
  {unavailable&&<button type="button" className={styles.retry} onClick={()=>setRefresh(value=>value+1)}>{ux.retry} <span aria-hidden="true">↻</span></button>}
  {busy&&<div className={styles.skeletons} aria-hidden="true">{[0,1,2].map(i=><div key={i} className={styles.skeleton}><span/><span/><span/></div>)}</div>}
  {result?.partial&&result.status==='READY'&&<p className={styles.hint}>{t.partial}</p>}
  {!!result?.events.length&&<p className={styles.hint}>{eventFitCopy[locale].policy}</p>}
  {!!result?.events.length&&<ul className={styles.grid}>{result.events.map(item=><li className={styles.card} key={item.id}>
   <div className={styles.cardTop}><span className={styles.category}>{labels[item.category]}</span>
    <span className={styles.day} aria-hidden="true">{new Intl.DateTimeFormat(intl,{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${item.start_date}T12:00:00Z`))}</span></div>
   <h3>{item.name}</h3><p className={styles.venue}>{item.venue} · {eventCityLabel(item.city,locale)}</p>
   <p><time dateTime={item.start_date}>{date(item.start_date)}</time>
    {item.end_date&&item.end_date!==item.start_date&&<> – {date(item.end_date)}</>}
    {' · '}{item.local_time?.slice(0,5)||t.unknownTime}</p>
   {item.status==='rescheduled'&&<p>{t.rescheduled}</p>}
   {!!item.ticket_options?.length&&<p className={styles.variantHint}>{resultsCopy.variantHint}</p>}
   <EventFlightNotice id={`event-fit-${encodeURIComponent(item.id)}`} fit={result.flight_fit?.[item.id]} locale={locale}/>
   {item.ticket_options?.length?<div className={styles.variants}>
    <h4>{resultsCopy.variants}</h4><ul>{item.ticket_options.map(option=><li key={option.id}>
     <p><strong>{option.ticket_kind==='PREMIUM'?resultsCopy.premium:resultsCopy.standard}</strong></p>
     <p className={styles.optionName}>{option.name}</p><p className={styles.price}>{price(option.price_from,option.currency)}</p>
     <a className="button button-secondary" href={option.url} target="_blank" rel="sponsored noopener noreferrer" aria-describedby={`event-fit-${encodeURIComponent(item.id)}`} aria-label={`${t.buy}: ${option.name} (${option.ticket_kind==='PREMIUM'?resultsCopy.premium:resultsCopy.standard}). ${ux.newTab}`}>{t.buy} <span aria-hidden="true">↗</span></a>
    </li>)}</ul>
   </div>:<><p className={styles.price}>{price(item.price_from,item.currency)}</p>
    <a className="button button-secondary" href={item.url} target="_blank" rel="sponsored noopener noreferrer" aria-describedby={`event-fit-${encodeURIComponent(item.id)}`} aria-label={`${t.buy}: ${item.name}. ${ux.newTab}`}>{t.buy} <span aria-hidden="true">↗</span></a></>}
  </li>)}</ul>}
  {result?.checked_at&&<p className="muted">{t.source} · {t.checked}: {new Intl.DateTimeFormat(intl,{dateStyle:'short',timeStyle:'short'}).format(new Date(result.checked_at))}</p>}
  <details className={styles.details}><summary>{ux.before}</summary><p>{t.warning}</p></details>
  <p className={styles.disclosure}>{t.disclosure}</p>
 </section>;
}
