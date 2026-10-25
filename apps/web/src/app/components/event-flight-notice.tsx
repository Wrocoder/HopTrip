import type {Locale} from '../../lib/i18n/config';
import {eventFitCopy} from '../../lib/i18n/event-fit-copy';
import type {EventFlightFit} from '../../lib/event-flight-fit';
import styles from './trip-events.module.css';

export function EventFlightNotice({fit,locale,id}:{fit?:EventFlightFit;locale:Locale;id:string}){
 const t=eventFitCopy[locale];
 const gap=(minutes:number|null|undefined)=>minutes!=null&&Number.isFinite(minutes)&&minutes>=0&&minutes<=1440;
 return <div id={id} className={styles.fit} data-status={fit?.status??'CHECK'} role="note" aria-label={t.title}>
  <p className={styles.fitTitle}><strong>{fit?t.status[fit.status]:t.notChecked}</strong></p>
  {!!fit?.reasons.length&&<ul>{fit.reasons.filter(reason=>reason!=='UNKNOWN_DURATION').map(reason=><li key={reason}>{t.reasons[reason]}</li>)}</ul>}
  {gap(fit?.arrival_gap_minutes)&&<p>{t.afterArrival}{fit?.arrival_airport?` (${fit.arrival_airport})`:''}: <strong>{fit?.arrival_gap_minutes} {t.minutes}</strong>.</p>}
  {gap(fit?.return_gap_minutes)?<p>{t.beforeReturn}{fit?.return_airport?` (${fit.return_airport})`:''}: <strong>{fit?.return_gap_minutes} {t.minutes}</strong>.</p>
   :fit?.return_gap_minutes==null&&gap(fit?.return_start_gap_minutes)&&<p>{t.startBeforeReturn}{fit?.return_airport?` (${fit.return_airport})`:''}: <strong>{fit?.return_start_gap_minutes} {t.minutes}</strong>.</p>}
  <p>{fit?.duration_minutes!=null?`${t.duration}: ${fit.duration_minutes} ${t.minutes}.`:t.durationUnknown}</p>
  {fit?.arrival_estimated&&<p className={styles.fitSmall}>{t.estimated}</p>}
  {fit?.status==='TIGHT'&&<p className={styles.fitSmall}>{t.buffer}: {fit.buffer_minutes} {t.minutes}.</p>}
 </div>;
}
