import {isPlanId,readSavedPlan,type SavedPlan} from './saved-plans.ts';
import {decodeTrip,encodeTrip,type SharedTrip} from './shared-trip.ts';
import type {BudgetDraft} from './budget-draft.ts';
import {moneyInGrosz} from './trip-budget.ts';
import type {Deal} from './api';
export type PlanBase={id:string;revision:number};
export const localPlanPath=(id:string)=>'/trip#local='+id;
export const planDraftKey=(id:string)=>'hoptrip.plan-draft.v1:'+id;
export const planSeedKey=(id:string)=>planDraftKey(id)+':seed';
export function readPlanSeed(raw:string|null,id:string):SavedPlan|null{
 if(!raw||raw.length>7000)return null;
 try{const plan=readSavedPlan(JSON.parse(raw));return plan?.id===id?plan:null;}catch{return null;}
}
export function readPlanBase(context:string):PlanBase|null{
 try{const value=JSON.parse(context)?.plan;if(!isPlanId(value?.id)||!Number.isSafeInteger(value.revision)||value.revision<1)return null;return {id:value.id,revision:value.revision};}catch{return null;}
}
export function planDraftContext(draft:Pick<BudgetDraft,'input'|'start'|'end'>,base?:PlanBase):string{
 return JSON.stringify({input:draft.input,start:draft.start,end:draft.end,...(base?{plan:base}:{})});
}
export const bindPlanDraft=(draft:BudgetDraft,base:PlanBase):BudgetDraft=>({...draft,context:planDraftContext(draft,base)});
// The old editor supplies adultsOnly=false for legacy snapshots without it.
// Compare those equivalent values without rewriting the original saved token.
export function samePlanContents(token:string,trip:SharedTrip):boolean{
 const saved=decodeTrip(token);if(!saved)return false;
 const canonical=(value:SharedTrip)=>encodeTrip({...value,draft:{...value.draft,adultsOnly:value.draft.adultsOnly??false}});
 const current=canonical(trip);return current!==null&&canonical(saved)===current;
}
export function planEditState(plan:SavedPlan|undefined,base:PlanBase|null,trip:SharedTrip):'removed'|'conflict'|'saved'|'dirty'{
 if(!plan)return 'removed';
 if(!base||base.id!==plan.id||base.revision!==plan.revision)return 'conflict';
 return samePlanContents(plan.token,trip)?'saved':'dirty';
}
export function savedOfferChanged(offer:SharedTrip['offer'],current:Deal|null):boolean{
 if(!current)return false;
 const oldPrice=moneyInGrosz(offer.price),newPrice=moneyInGrosz(current.flight_price_pln??'');
 return oldPrice!=null&&newPrice!=null&&oldPrice!==newPrice||!!offer.start&&offer.start!==current.trip_start||!!offer.end&&offer.end!==current.trip_end;
}
