import type {BudgetDraft} from '../../lib/budget-draft';
import {budgetDateCounts} from '../../lib/budget-draft';
import {compareBudgetProfiles} from '../../lib/budget-estimates';
import {budgetProfileCopy} from '../../lib/i18n/budget-profile-copy';
import {budgetQuickCopy} from '../../lib/i18n/budget-quick-copy';
import {money} from '../../lib/i18n/format';
import type {Locale} from '../../lib/i18n/config';
import styles from './trip-budget-calculator.module.css';

export function BudgetProfileComparison({draft,locale}:{draft:BudgetDraft;locale:Locale}){
 const copy=budgetQuickCopy[locale],profiles=budgetProfileCopy[locale];
 const datesInvalid=!!(draft.start||draft.end)&&!budgetDateCounts(draft.start,draft.end);
 const format=(amount:number)=>money((amount/100).toFixed(2),locale);
 return <div className={styles.comparison} data-testid="budget-profile-comparison">
  <table role="table"><caption>{copy.compare}</caption>
   <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">{profiles.title}</th><th role="columnheader" scope="col">{copy.group}</th><th role="columnheader" scope="col">{copy.coverage}</th></tr></thead>
   <tbody role="rowgroup">{compareBudgetProfiles(draft.input,draft.events,draft.estimates).map(({id,result})=>{
    const invalid=datesInvalid||draft.estimatesRecovery||result&&!result.valid;
    const hasRange=result&&result.modeled>0&&!invalid;
    return <tr role="row" key={id} data-profile={id}><th role="rowheader" scope="row">{profiles.names[id]}</th>
     <td role="cell"><span className={styles.mobileLabel} aria-hidden="true">{copy.group}</span>{invalid?profiles.invalid:hasRange?`${format(result.min!)} – ${format(result.max!)}`:result?.overridden?profiles.overridden:copy.empty}</td>
     <td role="cell"><span className={styles.mobileLabel} aria-hidden="true">{copy.coverage}</span>{hasRange?(result.missing.length?copy.partial:copy.complete):result?.overridden?profiles.known:copy.empty}</td>
    </tr>;
   })}</tbody>
  </table><p className={styles.hint}>{copy.note}</p>
 </div>;
}
