import {budgetDateCounts} from "./budget-draft.ts";

// The event catalogue supports an inclusive window of at most 31 calendar days.
// A longer saved stay remains intact; it never silently becomes a shorter trip.
export function validEventDates(start:string,end:string):boolean {
 const counts=budgetDateCounts(start,end);
 return counts!==null && Number(counts.nights)<=30;
}
