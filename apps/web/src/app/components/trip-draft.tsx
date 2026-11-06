"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {emptyBudget,type BudgetInput} from "../../lib/trip-budget";
import {budgetDraftKey,readLocalBudgetDraft,type BudgetDraft} from "../../lib/budget-draft";
import type {PlannedEvent} from '../../lib/planned-events';
import {cleanBudgetProvenance,type BudgetProvenance} from '../../lib/budget-provenance';
import type {BudgetEstimates} from '../../lib/budget-estimates';
import {bindPlanDraft,planDraftContext,planDraftKey,readPlanBase,type PlanBase} from '../../lib/plan-editor';
import {decodeTrip} from '../../lib/shared-trip';
import type {SavedPlan} from '../../lib/saved-plans';
import {planEditorCopy} from '../../lib/i18n/plan-editor-copy';
import {useLocale} from './locale-provider';
import {budgetText} from '../../lib/i18n/budget-copy';
export type TripDraftProps={initialInput?:Partial<BudgetInput>;initialEvents?:PlannedEvent[];initialProvenance?:BudgetProvenance;initialEstimates?:BudgetEstimates;tripId?:string;start?:string;end?:string;forceReview?:boolean;adultsOnly?:boolean;localPlan?:PlanBase;legacyCopyToken?:string};
type State={draft:BudgetDraft;save:(next:BudgetDraft,action?:'reset')=>void;saveIfCurrent:(expected:BudgetDraft,next:BudgetDraft)=>boolean;ready:boolean;context:string;storageMessage:string;localPlan?:PlanBase;acknowledgePlan:(expected:PlanBase,revision:number)=>void;replaceFromPlan:(plan:SavedPlan)=>boolean;getCurrentDraft:()=>BudgetDraft|null};
const TripDraftContext=createContext<State|null>(null);
export const useTripDraft=()=>useContext(TripDraftContext);
// The existing budget draft owns stay dates and travellers, scoped to one trip page.
export function TripDraftProvider({children,initialInput={},initialEvents,initialProvenance,initialEstimates,tripId,start="",end="",forceReview=false,adultsOnly=false,localPlan,legacyCopyToken}:TripDraftProps & {children:ReactNode}) {
 const {locale}=useLocale(),copy=planEditorCopy[locale];
 const context=planDraftContext({input:{...emptyBudget,...initialInput},start,end},localPlan);
 const storageKey=localPlan?planDraftKey(localPlan.id):budgetDraftKey(tripId);
 const localId=localPlan?.id;
 const eventsJson=JSON.stringify(initialEvents??[]);
 const provenanceJson=JSON.stringify(cleanBudgetProvenance(initialProvenance,{...emptyBudget,...initialInput})??null);
 const estimatesJson=JSON.stringify(initialEstimates??null);
 const [draft,setDraft]=useState<BudgetDraft>(()=>({version:1,input:{...emptyBudget,...initialInput},start,end,context,review:false,adultsOnly,...(initialEvents?.length?{events:initialEvents}:{}),...(JSON.parse(provenanceJson)?{provenance:JSON.parse(provenanceJson)}:{}),...(initialEstimates?{estimates:initialEstimates}:{})}));
 const liveDraft=useRef<BudgetDraft|null>(null);
 const [ready,setReady]=useState(false);
 const [storageMessage,setStorageMessage]=useState(()=>budgetText(locale,"Wczytywanie szkicu…"));
 useEffect(()=>{
  const defaults=JSON.parse(context);
  let restored:BudgetDraft={version:1,input:defaults.input,start:defaults.start,end:defaults.end,context,review:forceReview,adultsOnly,...(JSON.parse(eventsJson).length?{events:JSON.parse(eventsJson)}:{}),...(JSON.parse(provenanceJson)?{provenance:JSON.parse(provenanceJson)}:{}),...(JSON.parse(estimatesJson)?{estimates:JSON.parse(estimatesJson)}:{})};
  let message=localId?copy.sessionHint:budgetText(locale,"Zmiany zapisujemy automatycznie w tej przeglądarce, osobno dla każdej oferty.");
  try {
   const raw=(localId?sessionStorage:localStorage).getItem(storageKey);
   let saved=readLocalBudgetDraft(raw);
   if(raw===null&&localId&&legacyCopyToken){
    try{const old=readLocalBudgetDraft(localStorage.getItem(budgetDraftKey('copy:'+legacyCopyToken)));if(old)saved={...old,draft:bindPlanDraft(old.draft,JSON.parse(context).plan)};}catch{}
   }
   if(saved) {
    restored={...saved.draft,review:saved.draft.review || saved.draft.context!==context || forceReview};
    message=saved.datesNeedReview
     ? budgetText(locale,"Przywrócono kwoty, podróżnych i wydarzenia. Popraw daty pobytu, aby wznowić obliczenia i wyszukiwanie.")
     : localId?copy.sessionRestored:budgetText(locale,"Przywrócono zapisany szkic. Kolejne zmiany zapisujemy automatycznie.");
   } else if(raw) message=budgetText(locale,"Nie udało się odczytać szkicu. Wpisz kwoty ponownie; następna zmiana zapisze nowy szkic.");
  } catch {message=localId?copy.sessionError:budgetText(locale,"Zapisywanie jest niedostępne. Po odświeżeniu utracisz zmiany.");}
  // Read browser storage after hydration; keep controls disabled until restoration finishes.
  liveDraft.current=restored;
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setDraft(restored);
  setStorageMessage(message);
  setReady(true);
  return ()=>{liveDraft.current=null;};
 },[context,storageKey,forceReview,adultsOnly,eventsJson,provenanceJson,estimatesJson,localId,legacyCopyToken,copy.sessionHint,copy.sessionRestored,copy.sessionError,locale]);
 const save=(next:BudgetDraft,action?:'reset')=>{
  liveDraft.current=next;
  setDraft(next);
  try {(localId?sessionStorage:localStorage).setItem(storageKey,JSON.stringify(next));setStorageMessage(action==='reset'
   ? budgetText(locale,"Wyczyszczono kalkulator. Zapisane wyjazdy i udostępnione linki pozostają bez zmian.")
   : localId?copy.sessionSaved:budgetText(locale,"Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa."));}
  catch {setStorageMessage(localId?copy.sessionError:budgetText(locale,"Nie udało się zapisać zmian. Po odświeżeniu najnowsze kwoty mogą zostać utracone."));}
 };
 const saveIfCurrent=(expected:BudgetDraft,next:BudgetDraft)=>{
  // Late exchange-rate responses must not overwrite edits, resets or another trip.
  if(liveDraft.current!==expected)return false;
  save(next);return true;
 };

 const acknowledgePlan=(expected:PlanBase,revision:number)=>{
  const current=liveDraft.current,base=current&&readPlanBase(current.context);
  if(!current||!base||localId!==expected.id||base.id!==expected.id||base.revision!==expected.revision)return;
  // Preserve edits/reset made while the captured snapshot was being committed.
  save(bindPlanDraft(current,{id:base.id,revision}));
 };
 const replaceFromPlan=(plan:SavedPlan)=>{
  const trip=decodeTrip(plan.token);if(!trip||plan.id!==localId)return false;
  const next=bindPlanDraft(trip.draft,{id:plan.id,revision:plan.revision});
  try{sessionStorage.setItem(storageKey,JSON.stringify(next));}catch{setStorageMessage(copy.sessionError);return false;}
  liveDraft.current=next;setDraft(next);return true;
 };
 const exposedContext=localId?planDraftContext({input:{...emptyBudget,...initialInput},start,end},readPlanBase(draft.context)??localPlan):context;
 return <TripDraftContext.Provider value={{draft,save,saveIfCurrent,ready,context:exposedContext,storageMessage,localPlan,acknowledgePlan,replaceFromPlan,getCurrentDraft:()=>liveDraft.current}}>{children}</TripDraftContext.Provider>;
}
