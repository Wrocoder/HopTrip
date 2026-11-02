import type {Deal} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {qualityNotice} from '../../lib/flight-quality';
import {qualityText,qualityReasonText} from '../../lib/i18n/quality-copy';

export function FlightQualityNotice({deal,locale='pl',compact=false,expandedCritical=false}:{deal:Deal;locale?:Locale;compact?:boolean;expandedCritical?:boolean}) {
 const notice=qualityNotice(deal);
 if(!notice)return null;
 if(compact && notice.status==='PARTIAL')return <p className="flight-quality card-quality-label" role="note" data-quality={notice.status}><strong>{qualityText(locale,'partial')}</strong></p>;
 return <div className="flight-quality notice" role="note" data-quality={notice.status}>
  <strong>{qualityText(locale,notice.status==='PARTIAL'?'partial':'critical')}</strong>
  <p>{qualityReasonText(locale,notice.reasons[0])}</p>
  {(compact || expandedCritical) && notice.status==='CRITICAL_INCOMPLETE' ? <ul>{notice.reasons.slice(1).map(reason=><li key={reason}>{qualityReasonText(locale,reason)}</li>)}</ul> : (compact || notice.reasons.length>1)&&<details><summary>{qualityText(locale,'details')}</summary>
   <ul>{notice.reasons.slice(compact ? 0 : 1).map(reason=><li key={reason}>{qualityReasonText(locale,reason)}</li>)}</ul>
  </details>}
  {!compact && <p>{qualityText(locale,'scope')}</p>}
 </div>;
}
