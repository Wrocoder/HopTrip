import type {BudgetInput} from '../../lib/trip-budget';
import {budgetOriginKind,cleanBudgetProvenance,type BudgetMoneyKey,type BudgetProvenance} from '../../lib/budget-provenance';
import {budgetOriginCopy} from '../../lib/i18n/budget-origin-copy';
import {intlLocales,type Locale} from '../../lib/i18n/config';
import {date,dateTime} from '../../lib/i18n/format';
import {referenceCosts} from '../../lib/reference-costs';
import {referenceTicket} from '../../lib/i18n/reference-copy';
import Link from 'next/link';
import {localizedHref} from '../../lib/i18n/routing';
import styles from './trip-budget-calculator.module.css';

export function BudgetOrigin({input,field,provenance,locale}:{input:BudgetInput;field:BudgetMoneyKey;provenance?:BudgetProvenance;locale:Locale}){
 const copy=budgetOriginCopy[locale],kind=budgetOriginKind(input,field,provenance),entry=cleanBudgetProvenance(provenance,input)?.fields[field];
 const cost=entry?.kind==='REFERENCE'?referenceCosts.find(cost=>cost.id===entry.referenceId):undefined;
 return <div className={styles.hint} data-budget-origin={field} data-source={kind}>
  <span id={'budget-'+field+'-origin'}>{copy[kind]}</span>
  {entry&&<details><summary>{copy.details}</summary>
   {entry.kind==='OFFER'?<p><Link prefetch={false} href={localizedHref('/deals/'+entry.offerSlug,locale)}>{copy.offer}</Link>. {copy.recorded}: {entry.observedAt?dateTime(entry.observedAt,locale):copy.dateUnknown}.</p>:<>
    {cost&&<p><a href={cost.source} target="_blank" rel="noopener noreferrer">{copy.reference}: {referenceTicket(locale,cost).label}</a> · {date(entry.checkedAt,locale)}.</p>}
    <p>{(entry.euroCents/100).toLocaleString(intlLocales[locale],{style:'currency',currency:'EUR'})} · {copy.quantity}: {entry.quantity}.</p>
    <p>{copy.rate}: {entry.rate.plnPerEuro.toLocaleString(intlLocales[locale],{maximumFractionDigits:4})} · {date(entry.rate.date,locale)}.</p>
   </>}
   <p>{copy.note}</p>
  </details>}
 </div>;
}
