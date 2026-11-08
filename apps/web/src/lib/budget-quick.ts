import {calculateBudget,type BudgetInput} from './trip-budget.ts';
import type {PlannedEvent} from './planned-events.ts';

export const quickCostKeys=['flight','hotel','food','transfers'] as const;
// Readiness is about entered inputs, not confirmed supplier prices or a complete trip.
export function quickBudgetCosts(input:BudgetInput,events:PlannedEvent[]=[]){
 const result=calculateBudget(input,events);
 return quickCostKeys.map(key=>{
  const line=result.lines.find(line=>line.key===key)!;
  const field=key==='hotel'&&input.hotel_basis==='stay'?'hotel_total':key;
  const countsValid=!result.errors.people&&!result.errors.nights&&!result.errors.days;
  const known=line.total!==null&&!result.errors[field];
  return {key,field,label:line.label,known,total:known&&countsValid?line.total:null};
 });
}
