"use client";
import type {Locale} from '../../lib/i18n/config';
import {intlLocales} from '../../lib/i18n/config';
import {plannedEventsCopy} from '../../lib/i18n/planned-events-copy';
import {addPlannedEvent,cleanPlannedEvent,maxPlannedEvents,type PlannedEvent} from '../../lib/planned-events';
import {moneyInGrosz,plannedEventCost} from '../../lib/trip-budget';
import {useTripDraft} from './trip-draft';
import styles from './planned-events.module.css';

export function AddEventToPlan({event,locale='pl'}:{event:PlannedEvent;locale?:Locale}){
 const {draft,save,ready}=useTripDraft()!;
 const t=plannedEventsCopy[locale],events=draft.events??[];
 const selected=events.some(item=>item.id===event.id),full=events.length>=maxPlannedEvents;
 const valid=cleanPlannedEvent(event)!==null;
 return <div className={styles.add}>
  <button type="button" className="button button-secondary" disabled={!ready||selected||full||!valid}
   aria-label={`${selected?t.added:t.add}: ${event.name}`} onClick={()=>save({...draft,events:addPlannedEvent(events,event)})}>{selected?t.added:t.add}</button>
  {selected&&<span role="status"><a href="#planned-events">{t.edit}</a></span>}
  {!valid&&!selected&&<p>{t.unavailable}</p>}
  {!selected&&full&&<p>{t.limit}</p>}
 </div>;
}

export function PlannedEvents({locale='pl'}:{locale?:Locale}){
 const {draft,save,ready}=useTripDraft()!;
 const events=draft.events??[],t=plannedEventsCopy[locale];
 if(!events.length)return null;
 const money=(grosz:number)=>new Intl.NumberFormat(intlLocales[locale],{style:'currency',currency:'PLN'}).format(grosz/100);
 const update=(id:string,key:'quantity'|'unitPricePln',value:string)=>save({...draft,events:events.map(item=>item.id===id?{...item,[key]:value}:item)});
 return <section id="planned-events" tabIndex={-1} className={styles.section} aria-labelledby="planned-events-title">
  <h3 id="planned-events-title">{t.title}</h3><p>{t.intro}</p><p className={styles.hint}>{t.costHint}</p>
  <ul className={styles.list}>{events.map(event=>{
   const cost=plannedEventCost(event),quantityInvalid=!/^\d+$/.test(event.quantity)||Number(event.quantity)<1||Number(event.quantity)>50;
   const priceInvalid=moneyInGrosz(event.unitPricePln)===undefined;
   const id=`planned-${encodeURIComponent(event.id)}`;
   return <li key={event.id}><h4>{event.name}</h4><p>{event.venue}</p>
    <p><time dateTime={event.date}>{new Intl.DateTimeFormat(intlLocales[locale],{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${event.date}T12:00:00Z`))}</time>
     {' · '}{event.time?.slice(0,5)||t.unknownTime}{' · '}{event.timezone}</p>
    {(draft.start&&event.date<draft.start||draft.end&&event.date>draft.end)&&<p className={styles.warning}>{t.outside}</p>}
    <fieldset disabled={!ready} className={styles.fields}><legend className={styles.legend}>{event.name}</legend>
     <div><label htmlFor={`${id}-quantity`}>{t.quantity}</label><input id={`${id}-quantity`} type="text" inputMode="numeric" maxLength={2} value={event.quantity}
      aria-invalid={quantityInvalid} aria-describedby={quantityInvalid?`${id}-quantity-error`:undefined} onChange={e=>update(event.id,'quantity',e.target.value)}/>
      {quantityInvalid&&<span id={`${id}-quantity-error`} className={styles.error}>{t.quantityError}</span>}</div>
     <div><label htmlFor={`${id}-price`}>{t.unitPrice}</label><input id={`${id}-price`} type="text" inputMode="decimal" maxLength={11} value={event.unitPricePln} placeholder={t.unknown}
      aria-invalid={priceInvalid} aria-describedby={priceInvalid?`${id}-price-error`:undefined} onChange={e=>update(event.id,'unitPricePln',e.target.value)}/>
      {priceInvalid&&<span id={`${id}-price-error`} className={styles.error}>{t.priceError}</span>}</div>
    </fieldset>
    <p className={styles.subtotal} role="status">{t.subtotal}: {cost.valid?(cost.total===null?t.unknown:money(cost.total)):t.invalid}</p>
    <div className={styles.actions}><a href={event.url} target="_blank" rel="sponsored noopener noreferrer">{t.ticket} <span aria-hidden="true">↗</span></a>
     <button type="button" disabled={!ready} onClick={()=>save({...draft,events:events.filter(item=>item.id!==event.id)})} aria-label={`${t.remove}: ${event.name}`}>{t.remove}</button></div>
   </li>;
  })}</ul>
 </section>;
}
