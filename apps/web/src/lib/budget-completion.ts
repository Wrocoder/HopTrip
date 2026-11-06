import type {BudgetDraft} from './budget-draft.ts';
import {budgetDateCounts} from './budget-draft.ts';
import {calculateBudget} from './trip-budget.ts';

// Fully specified user inputs, not a guarantee of actual supplier prices.
export function budgetCompletionReady(draft:BudgetDraft):boolean {
 if(draft.review || ((draft.start || draft.end) && !budgetDateCounts(draft.start,draft.end)))return false;
 const result=calculateBudget(draft.input,draft.events);
 return result.valid&&result.missing.length===0;
}
