import type {BudgetDraft} from '../../lib/budget-draft';
import {projectBudget} from '../../lib/budget-estimates';
import {budgetProfileCopy} from '../../lib/i18n/budget-profile-copy';
import {budgetText} from '../../lib/i18n/budget-copy';
import {plannedEventsCopy} from '../../lib/i18n/planned-events-copy';
import {budgetOriginKind,type BudgetMoneyKey} from '../../lib/budget-provenance';
import {budgetOriginCopy} from '../../lib/i18n/budget-origin-copy';
import {budgetDateCounts} from '../../lib/budget-draft';
import {money} from '../../lib/i18n/format';
import type {Locale} from '../../lib/i18n/config';
import styles from './trip-budget-calculator.module.css';

export function BudgetProjection({draft,locale,compact=false}:{draft:BudgetDraft;locale:Locale;compact?:boolean}){
 const result=projectBudget(draft.input,draft.events,draft.estimates),copy=budgetProfileCopy[locale];
 if(!result)return null;
 const format=(value:number)=>money((value/100).toFixed(2),locale),band=(low:number,high:number)=>format(low)+' – '+format(high);
 const label=(value:string)=>value==='Wydarzenia w planie'?plannedEventsCopy[locale].budgetLine:budgetText(locale,value);
 const datesInvalid=!!(draft.start||draft.end)&&!budgetDateCounts(draft.start,draft.end);
 return <section data-testid="budget-projection" className={styles.result} aria-label={copy.projection}>
  <h3>{copy.projection} · {copy.names[result.profile]}</h3>
  {!result.valid||datesInvalid||draft.estimatesRecovery?<p>{copy.invalid}</p>:!result.modeled?<p>{result.overridden?copy.overridden:copy.noRanges}</p>:<>
   <p role={compact?undefined:'status'} aria-live={compact?undefined:'polite'} aria-atomic={compact?undefined:true}><span className="sr-only">{copy.projection}: </span><strong data-testid="projection-total">{band(result.min!,result.max!)}</strong></p>
   {!compact&&<p>{copy.person}: <strong data-testid="projection-person">{band(result.personMin!,result.personMax!)}</strong></p>}
   <p>{result.missing.length?copy.partial+' '+result.missing.map(label).join(', '):copy.complete}</p>
   {!compact&&<details><summary>{copy.breakdown}</summary><dl className={styles.breakdown}>{result.lines.map(line=>{
    const key=(line.key==='hotel'&&draft.input.hotel_basis==='stay'?'hotel_total':line.key) as BudgetMoneyKey;
    const origin=line.modeled?copy.modeled:line.key==='events'?copy.known:budgetOriginCopy[locale][budgetOriginKind(draft.input,key,draft.provenance)];
    return <div key={line.key}><dt>{label(line.label)} · {line.min===null?copy.unknown:origin}</dt><dd>{line.min===null?copy.unknown:band(line.min,line.max!)+(line.unknown?' + '+copy.unknown:'')}</dd></div>;
   })}</dl></details>}
  </>}
 </section>;
}
