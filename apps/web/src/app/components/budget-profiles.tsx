'use client';
import {budgetProfileIds,estimateFields,emptyEstimates,emptyProfile,invalidProfiles,profileErrors,seedProfile,type BudgetEstimates,type BudgetProfileId,type BudgetProfile} from '../../lib/budget-estimates';
import {budgetProfileCopy} from '../../lib/i18n/budget-profile-copy';
import {useLocale} from './locale-provider';
import {useTripDraft} from './trip-draft';
import {track} from '../../lib/session';
import styles from './trip-budget-calculator.module.css';
import {BudgetProfileComparison} from './budget-profile-comparison';

export function BudgetProfiles(){
 const {draft,save}=useTripDraft()!,{locale}=useLocale(),copy=budgetProfileCopy[locale];
 const state=draft.estimates??emptyEstimates(),id=state.selected;
 const profile=id?(state.profiles[id]??emptyProfile(draft.input.hotel_basis)):null;
 const errors=profile?profileErrors(profile):{},invalid=invalidProfiles(state);
 const persist=(estimates:BudgetEstimates|undefined)=>{save({...draft,estimates,estimatesRecovery:undefined});track('BUDGET_USE');};
 const select=(selected:BudgetProfileId|null)=>{if(selected!==state.selected)persist({...state,selected,profiles:{...state.profiles,...(selected?{[selected]:state.profiles[selected]??emptyProfile(draft.input.hotel_basis)}:{})}});};
 const update=(next:BudgetProfile)=>{if(id)persist({...state,profiles:{...state.profiles,[id]:next}});};
 return <section id="budget-profiles" aria-labelledby="budget-profiles-title" className={styles.profiles}>
  <h3 id="budget-profiles-title">{copy.title}</h3><p className={styles.hint}>{copy.intro}</p>
  {draft.estimatesRecovery&&<p role="alert">{copy.recovery}</p>}
  <div role="group" aria-label={copy.title} className={styles.modes}>
   {budgetProfileIds.map(key=><button type="button" key={key} className="button button-secondary" disabled={!!draft.estimatesRecovery} aria-pressed={id===key} onClick={()=>select(key)}>{copy.names[key]}</button>)}
   <button type="button" className="button button-secondary" disabled={!!draft.estimatesRecovery} aria-pressed={!id} onClick={()=>select(null)}>{copy.none}</button>
  </div>
  {invalid.length>0&&<p role="alert" className={styles.error}>{copy.fix} {invalid.map(key=>copy.names[key]).join(', ')}.</p>}
  {draft.estimates&&<BudgetProfileComparison draft={draft} locale={locale}/>}
  {profile&&id&&<details key={id} open><summary>{copy.edit}: {copy.names[id]}</summary>
   <div className={styles.field}><label htmlFor="profile-hotel-basis">{copy.basis}</label><select id="profile-hotel-basis" value={profile.hotel_basis} onChange={event=>update({...profile,hotel_basis:event.target.value==='stay'?'stay':'night'})}>
    <option value="night">{copy.night}</option><option value="stay">{copy.stay}</option>
   </select></div>
   <div className={styles.grid}>{estimateFields.map(key=><fieldset key={key} className={styles.range}>
    <legend>{copy[key]} · PLN</legend>
    <p className={styles.hint} id={'profile-'+key+'-hint'}>{key==='hotel'?(profile.hotel_basis==='night'?copy.night:copy.stay):key==='food'?copy.foodHint:copy.transferHint}</p>
    {(['min','max'] as const).map(bound=><div className={styles.field} key={bound}>
     <label htmlFor={'profile-'+key+'-'+bound}>{copy[bound]}</label>
     <input id={'profile-'+key+'-'+bound} type="text" inputMode="decimal" maxLength={11} value={profile[key][bound]} placeholder={copy.unknown}
      aria-invalid={!!errors[key]} aria-describedby={'profile-'+key+'-hint'+(errors[key]?' profile-'+key+'-error':'')}
      onChange={event=>update({...profile,[key]:{...profile[key],[bound]:event.target.value}})}/>
    </div>)}
    {errors[key]&&<p id={'profile-'+key+'-error'} className={styles.error}>{copy[errors[key]!]}</p>}
   </fieldset>)}</div>
   <div className={styles.modes}><button type="button" className="button button-secondary" onClick={()=>update(seedProfile(profile,draft.input))}>{copy.seed}</button>
    <button type="button" className="button button-secondary" onClick={()=>update(emptyProfile(profile.hotel_basis))}>{copy.clear}</button></div>
  </details>}
  {(draft.estimates||draft.estimatesRecovery)&&<button type="button" className="button button-secondary" onClick={()=>persist(undefined)}>{copy.clearAll}</button>}
 </section>;
}
