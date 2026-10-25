import {emptyBudget,type BudgetInput} from "./trip-budget.ts";
import {readPlannedEvents,type PlannedEvent} from "./planned-events.ts";

export type BudgetDraft={version:1;input:BudgetInput;start:string;end:string;context:string;review:boolean;adultsOnly?:boolean;events?:PlannedEvent[]};
export const budgetDraftKey=(tripId?:string)=>`hoptrip.budget.v1:${tripId ? `deal:${tripId}` : "standalone"}`;

export function readBudgetDraft(raw:string|null):BudgetDraft|null {
 if(!raw || raw.length>50000) return null;
 try {
  const draft=JSON.parse(raw);
  if(draft?.version!==1 || !draft.input || typeof draft.review!=="boolean" ||
   typeof draft.context!=="string" || draft.context.length>2000 ||
   typeof draft.start!=="string" || typeof draft.end!=="string" ||
   ![draft.start,draft.end].every(value=>value==="" || validDate(value))) return null;
  const input={...emptyBudget};
  for(const key of Object.keys(input) as (keyof BudgetInput)[]) {
   const value=draft.input[key];
   if(typeof value!=="string" || value.length>32) return null;
   if(key==="hotel_basis") {
    if(value!=="night" && value!=="stay") return null;
    input[key]=value;
   } else input[key]=value;
  }
  if(draft.adultsOnly!==undefined && typeof draft.adultsOnly!=="boolean")return null;
  const events=draft.events===undefined?undefined:readPlannedEvents(draft.events);
  if(events===null)return null;
  return {version:1,input,start:draft.start,end:draft.end,context:draft.context,review:draft.review,
   ...(draft.adultsOnly===undefined ? {} : {adultsOnly:draft.adultsOnly}),...(events===undefined?{}:{events})};
 } catch {return null;}
}

export function changeStayDate(draft:BudgetDraft,key:"start"|"end",value:string):BudgetDraft {
 const next={...draft,[key]:value,review:true};
 const counts=budgetDateCounts(next.start,next.end);
 return {...next,input:{...draft.input,nights:counts?.nights ?? "",days:counts?.days ?? ""}};
}

function validDate(value:string) {
 return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0,10)===value;
}

export function budgetDateCounts(start:string,end:string) {
 if(!validDate(start) || !validDate(end)) return null;
 const nights=(Date.parse(end)-Date.parse(start))/86400000;
 return nights>=0 && nights<365 ? {nights:String(nights),days:String(nights+1)} : null;
}
