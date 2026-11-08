import test from 'node:test';
import assert from 'node:assert/strict';
import {quickBudgetCosts} from '../src/lib/budget-quick.ts';
import {compareBudgetProfiles,emptyEstimates,emptyProfile} from '../src/lib/budget-estimates.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
import {referenceCosts,referenceGrosz} from '../src/lib/reference-costs.ts';

test('quick costs distinguish flight-only, unknown, explicit zero and lodging basis without hiding extra errors',()=>{
 const flight={...emptyBudget,flight:'100'};
 assert.deepEqual(quickBudgetCosts(flight).filter(row=>row.known).map(row=>row.key),['flight']);
 const input={...flight,hotel_basis:'stay',hotel_total:'300',hotel:'999',food:'0',transfers:'50',taxes:'bad'};
 const rows=quickBudgetCosts(input);assert.ok(rows.every(row=>row.known));
 assert.equal(rows.find(row=>row.key==='hotel').field,'hotel_total');
 assert.deepEqual(rows.map(row=>row.total),[20000,30000,0,5000]);
 assert.equal(quickBudgetCosts({...input,food:'-1'}).find(row=>row.key==='food').known,false);
 assert.ok(quickBudgetCosts({...input,people:'0'}).every(row=>row.total===null));
});

test('profile comparison is independent of selection and preserves exact, event and unknown amounts',()=>{
 const input={...emptyBudget,flight:'100',people:'2'},economy={...emptyProfile(),hotel:{min:'100',max:'150'}};
 const standard={...emptyProfile('stay'),hotel:{min:'300',max:'400'},food:{min:'10',max:'20'}};
 const state={...emptyEstimates(),selected:'standard',profiles:{economy,standard}},before=structuredClone(state);
 const events=[{id:'one',quantity:'2',unitPricePln:'10'}];
 const rows=compareBudgetProfiles(input,events,state);
 assert.deepEqual(rows.map(row=>row.id),['economy','standard','comfort']);
 assert.equal(rows[0].result.min,42000);assert.equal(rows[0].result.max,52000);
 assert.equal(rows[1].result.min,58000);assert.equal(rows[1].result.max,74000);
 assert.ok(rows[0].result.missing.includes('Jedzenie i wydatki dzienne'));assert.equal(rows[2].result,null);
 assert.deepEqual(state,before);assert.equal(input.hotel,'');
 const overridden=compareBudgetProfiles({...input,hotel:'0'},[],state)[0].result;
 assert.equal(overridden.min,20000);assert.equal(overridden.modeled,0);assert.equal(overridden.overridden,1);
});

test('invalid independent profiles and invalid counts never produce a valid comparison subtotal',()=>{
 const state={...emptyEstimates(),selected:'economy',profiles:{economy:{...emptyProfile(),food:{min:'20',max:'10'}}}};
 assert.equal(compareBudgetProfiles(emptyBudget,[],state)[0].result.valid,false);
 assert.equal(compareBudgetProfiles({...emptyBudget,people:'0'},[],state)[0].result.min,null);
 assert.deepEqual(compareBudgetProfiles(emptyBudget,[]).map(row=>row.result),[null,null,null]);
});

test('reference conversion rejects rolled-over calendar dates, corrupt prices and unsafe totals',()=>{
 const now=Date.parse('2026-03-02T12:00:00Z'),rate={date:'2026-03-01',plnPerEuro:4};
 const cost={...referenceCosts[0],checkedAt:'2026-03-01'};
 for(const checkedAt of ['2026-02-30','2025-02-29'])assert.equal(referenceGrosz({...cost,checkedAt},1,rate,now),null);
 assert.equal(referenceGrosz(cost,1,{...rate,date:'2026-02-30'},now),null);
 for(const euroCents of [NaN,Infinity,-1,0,1.5,Number.MAX_SAFE_INTEGER])assert.equal(referenceGrosz({...cost,euroCents},365,rate,now),null);
 assert.equal(referenceGrosz(cost,1,{...rate,plnPerEuro:1e-9},now),null);
 assert.equal(referenceGrosz(cost,1,rate,now),3040);
});
