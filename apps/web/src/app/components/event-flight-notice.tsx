import type {Locale} from '../../lib/i18n/config';
import {eventFitCopy} from '../../lib/i18n/event-fit-copy';
import {primaryFitReason,type EventFlightFit} from '../../lib/event-flight-fit';
import styles from './trip-events.module.css';

export function EventFlightNotice({fit,locale,id}:{fit?:EventFlightFit;locale:Locale;id:string}){
 const t=eventFitCopy[locale];
 const gap=(minutes:number|null|undefined)=>minutes!=null&&Number.isFinite(minutes)&&Math.abs(minutes)<=1440;
 const primary=primaryFitReason(fit);
 // The tight-transfer title and visible interval already explain these two reasons.
 const visibleReason=primary==='ARRIVAL_BUFFER'||primary==='RETURN_BUFFER'?undefined:primary;
 const remaining=fit?.reasons.filter(reason=>reason!==visibleReason&&reason!=='UNKNOWN_DURATION')??[];
 return <div id={id} className={styles.fit} data-status={fit?.status??'CHECK'} role="note" aria-label={t.title}>
  <p className={styles.fitTitle}><strong>{fit?t.status[fit.status]:t.notChecked}</strong></p>
  {visibleReason&&<p>{t.reasons[visibleReason]}</p>}
  {gap(fit?.arrival_gap_minutes)&&<p>{t.afterArrival}{fit?.arrival_airport?` (${fit.arrival_airport})`:''}: <strong>{fit?.arrival_gap_minutes} {t.minutes}</strong>.</p>}
  {gap(fit?.return_gap_minutes)?<p>{t.beforeReturn}{fit?.return_airport?` (${fit.return_airport})`:''}: <strong>{fit?.return_gap_minutes} {t.minutes}</strong>.</p>
   :fit?.return_gap_minutes==null&&gap(fit?.return_start_gap_minutes)&&<p>{t.startBeforeReturn}{fit?.return_airport?` (${fit.return_airport})`:''}: <strong>{fit?.return_start_gap_minutes} {t.minutes}</strong>.</p>}
  <p className={styles.fitSmall}>{fit?.duration_minutes!=null?`${t.duration}: ${fit.duration_minutes} ${t.minutes}.`:t.reasons.UNKNOWN_DURATION}</p>
  {fit&&(remaining.length>0||fit.arrival_estimated||fit.status==='TIGHT'||fit.duration_minutes==null)&&<details className={styles.fitDetails}>
   <summary>{t.details}</summary>
   {!!remaining.length&&<ul>{remaining.map(reason=><li key={reason}>{t.reasons[reason]}</li>)}</ul>}
   {fit.duration_minutes==null&&<p>{t.durationUnknown}</p>}
   {fit.arrival_estimated&&<p>{t.estimated}</p>}
   {fit.status==='TIGHT'&&<p>{t.buffer}: {fit.buffer_minutes} {t.minutes}.</p>}
  </details>}
 </div>;
}
