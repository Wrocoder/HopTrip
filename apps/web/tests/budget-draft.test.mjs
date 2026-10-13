import {test} from "node:test";
import assert from "node:assert/strict";
import {budgetDateCounts,budgetDraftKey,readBudgetDraft} from "../src/lib/budget-draft.ts";
import {emptyBudget,calculateBudget} from "../src/lib/trip-budget.ts";

test("draft roundtrip preserves unknown, zero, decimal and both lodging modes",()=>{
 const draft={version:1,input:{...emptyBudget,flight:"0",hotel:"80,50",hotel_total:"500,01",hotel_basis:"stay"},start:"2027-01-15",end:"2027-01-17",context:"offer",review:true};
 const restored=readBudgetDraft(JSON.stringify(draft));
 assert.deepEqual(restored,draft);
 assert.equal(calculateBudget(restored.input).total,50001);
 assert.ok(calculateBudget(restored.input).missing.includes("Jedzenie i wydatki dzienne"));
 assert.notEqual(budgetDraftKey(),budgetDraftKey("standalone"));
 assert.notEqual(budgetDraftKey("a"),budgetDraftKey("b"));
});
test("malformed or incompatible drafts cannot replace valid defaults",()=>{
 for(const raw of [null,"{","null","{}",JSON.stringify({version:2}),JSON.stringify({version:1,input:{...emptyBudget,hotel_basis:"person"},start:"",end:"",context:"",review:false})])
  assert.equal(readBudgetDraft(raw),null);
});
test("date counts respect calendar days, same-day stays and invalid ranges",()=>{
 assert.deepEqual(budgetDateCounts("2027-03-27","2027-03-29"),{nights:"2",days:"3"});
 assert.deepEqual(budgetDateCounts("2027-01-15","2027-01-15"),{nights:"0",days:"1"});
 for(const [start,end] of [["","2027-01-15"],["2027-01-16","2027-01-15"],["2027-02-30","2027-03-03"],["2027-01-01","2028-01-01"]])
  assert.equal(budgetDateCounts(start,end),null);
});
