"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import {emptyBudget,type BudgetInput} from "../../lib/trip-budget";
import {budgetDraftKey,readBudgetDraft,type BudgetDraft} from "../../lib/budget-draft";
export type TripDraftProps={initialInput?:Partial<BudgetInput>;tripId?:string;start?:string;end?:string;forceReview?:boolean;adultsOnly?:boolean};
type State={draft:BudgetDraft;save:(next:BudgetDraft)=>void;ready:boolean;context:string;storageMessage:string};
const TripDraftContext=createContext<State|null>(null);
export const useTripDraft=()=>useContext(TripDraftContext);
// The existing budget draft owns stay dates and travellers, scoped to one trip page.
export function TripDraftProvider({children,initialInput={},tripId,start="",end="",forceReview=false,adultsOnly=false}:TripDraftProps & {children:ReactNode}) {
 const context=JSON.stringify({input:{...emptyBudget,...initialInput},start,end});
 const storageKey=budgetDraftKey(tripId);
 const [draft,setDraft]=useState<BudgetDraft>(()=>({version:1,input:{...emptyBudget,...initialInput},start,end,context,review:false,adultsOnly}));
 const [ready,setReady]=useState(false);
 const [storageMessage,setStorageMessage]=useState("Wczytywanie szkicu…");
 useEffect(()=>{
  const defaults=JSON.parse(context);
  let restored:BudgetDraft={version:1,...defaults,context,review:forceReview,adultsOnly};
  let message="Zmiany zapisujemy automatycznie w tej przeglądarce, osobno dla każdej oferty.";
  try {
   const raw=localStorage.getItem(storageKey);
   const saved=readBudgetDraft(raw);
   if(saved) {
    restored={...saved,review:saved.review || saved.context!==context};
    message="Przywrócono zapisany szkic. Kolejne zmiany zapisujemy automatycznie.";
   } else if(raw) message="Nie udało się odczytać szkicu. Wpisz kwoty ponownie; następna zmiana zapisze nowy szkic.";
  } catch {message="Zapisywanie jest niedostępne. Po odświeżeniu utracisz zmiany.";}
  // Read browser storage after hydration; keep controls disabled until restoration finishes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setDraft(restored);
  setStorageMessage(message);
  setReady(true);
 },[context,storageKey,forceReview,adultsOnly]);
 const save=(next:BudgetDraft)=>{
  setDraft(next);
  try {localStorage.setItem(storageKey,JSON.stringify(next));setStorageMessage("Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.");}
  catch {setStorageMessage("Nie udało się zapisać zmian. Po odświeżeniu najnowsze kwoty mogą zostać utracone.");}
 };

 return <TripDraftContext.Provider value={{draft,save,ready,context,storageMessage}}>{children}</TripDraftContext.Provider>;
}
