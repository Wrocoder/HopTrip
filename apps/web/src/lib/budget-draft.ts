import {emptyBudget,type BudgetInput} from "./trip-budget.ts";
import {readPlannedEvents,type PlannedEvent} from "./planned-events.ts";
import {calendarNights,validCalendarDate} from "./calendar-date.ts";

export type BudgetDraft={version:1;input:BudgetInput;start:string;end:string;context:string;review:boolean;adultsOnly?:boolean;events?:PlannedEvent[]};
export const budgetDraftKey=(tripId?:string)=>`hoptrip.budget.v1:${tripId ? `deal:${tripId}` : "standalone"}`;

export function readBudgetDraft(raw:string|null):BudgetDraft|null {
 return parseBudgetDraft(raw,false);
}

// Local editing may temporarily contain invalid dates. Never use this recovery
// reader for shared links: those continue through the strict readBudgetDraft.
export function readLocalBudgetDraft(raw:string|null):{draft:BudgetDraft;datesNeedReview:boolean}|null {
 const draft=parseBudgetDraft(raw,true);
 if(!draft)return null;
 const datesNeedReview=Boolean(draft.start||draft.end)&&budgetDateCounts(draft.start,draft.end)===null;
 return {draft:datesNeedReview?{...draft,review:true}:draft,datesNeedReview};
}

function parseBudgetDraft(raw:string|null,local:boolean):BudgetDraft|null {
 if(!raw || raw.length>50000) return null;
 try {
  const draft=JSON.parse(raw);
  if(draft?.version!==1 || !draft.input || typeof draft.input!=="object" || Array.isArray(draft.input) || typeof draft.review!=="boolean" ||
   typeof draft.context!=="string" || draft.context.length>2000 ||
   typeof draft.start!=="string" || typeof draft.end!=="string" ||
   ![draft.start,draft.end].every(value=>value.length<=32 && (local || value==="" || validCalendarDate(value)))) return null;
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

export function budgetDateCounts(start:string,end:string) {
 const nights=calendarNights(start,end);
 return nights!==null && nights<365 ? {nights:String(nights),days:String(nights+1)} : null;
}
