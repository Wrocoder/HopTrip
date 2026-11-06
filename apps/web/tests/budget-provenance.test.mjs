import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetOriginKind,cleanBudgetProvenance,offerBudgetProvenance,referenceBudgetOrigin,withoutBudgetOrigin} from '../src/lib/budget-provenance.ts';
import {emptyBudget,calculateBudget} from '../src/lib/trip-budget.ts';
import {readBudgetDraft,readLocalBudgetDraft,changeStayDate} from '../src/lib/budget-draft.ts';
import {encodeTrip,decodeTrip,readSavedTrips} from '../src/lib/shared-trip.ts';
import {referenceCosts} from '../src/lib/reference-costs.ts';
const offer={slug:'synthetic-offer',flight_price_pln:'200.25',last_verified_at:'2026-11-04T12:00:00Z'};
const source=offerBudgetProvenance(offer);
const input={...emptyBudget,people:'3',flight:'200.25',hotel:'0',local_transport:'30.40'};
const reference=referenceBudgetOrigin(referenceCosts[0],1,{plnPerEuro:4,date:'2026-11-04'},'30.40');
const provenance={version:'budget-provenance-v1',fields:{...source.fields,local_transport:reference}};
const draft={version:1,input,start:'2030-05-01',end:'2030-05-03',context:'private',review:false,provenance};
const snapshot={version:1,offer:{slug:offer.slug,origin:'WRO',destination:'Milan',start:draft.start,end:draft.end,price:'200.25',observedAt:offer.last_verified_at},draft};
test('observed, assumed, manual, unknown, invalid and intentional zero remain distinct without changing totals',()=>{
 assert.equal(budgetOriginKind(input,'flight',provenance),'OFFER');assert.equal(budgetOriginKind(input,'local_transport',provenance),'REFERENCE');
 assert.equal(budgetOriginKind(input,'hotel',provenance),'MANUAL');assert.equal(budgetOriginKind(input,'food',provenance),'UNKNOWN');
 assert.equal(budgetOriginKind({...input,food:'-1'},'food',provenance),'INVALID');
 assert.equal(budgetOriginKind({...input,flight:'200,25'},'flight',provenance),'OFFER');
 assert.equal(budgetOriginKind({...input,flight:'200.26'},'flight',provenance),'MANUAL');
 assert.equal(calculateBudget(draft.input).total,69195);assert.equal(calculateBudget(draft.input).perPerson,23065);
 for(const value of [null,'','-1','NaN'])assert.equal(offerBudgetProvenance({...offer,flight_price_pln:value}),undefined);
 assert.equal(budgetOriginKind({...input,flight:'0'},'flight',offerBudgetProvenance({...offer,flight_price_pln:'0'})),'OFFER');
});
test('legacy drafts are never relabelled observed merely because their flight matches a current offer',()=>{
 const old={...draft};delete old.provenance;
 const restored=readBudgetDraft(JSON.stringify(old));assert.deepEqual(restored,old);
 assert.equal(budgetOriginKind(restored.input,'flight',restored.provenance),'MANUAL');
 assert.equal(readLocalBudgetDraft(JSON.stringify(old)).draft.input.hotel,'0');
});
test('manual edits remove only their annotation; date/party/basis changes keep unit amounts with existing review semantics',()=>{
 const next=withoutBudgetOrigin(provenance,'flight');assert.equal(next.fields.flight,undefined);assert.deepEqual(next.fields.local_transport,reference);
 assert.equal(withoutBudgetOrigin(source,'flight'),undefined);assert.deepEqual(withoutBudgetOrigin(provenance,'people'),provenance);
 const changed=changeStayDate(draft,'end','2030-05-05');assert.deepEqual(changed.provenance,provenance);assert.equal(changed.review,true);
 assert.equal(changed.input.hotel,'0');assert.equal(changed.input.flight,'200.25');
 assert.deepEqual(readBudgetDraft(JSON.stringify(changed)).provenance,provenance);
});
test('reference binding checks dated allowlisted tariff, quantity, rate and rounding without accepting arbitrary URLs',()=>{
 for(const patch of [{amount:'31'},{referenceId:'unknown'},{euroCents:1},{checkedAt:'2030-01-01'},{quantity:0},{quantity:1.5},{quantity:366},
  {rate:{plnPerEuro:Infinity,date:'2026-11-04'}},{rate:{plnPerEuro:0,date:'2026-11-04'}},{rate:{plnPerEuro:4,date:'2026-02-30'}}]){
  const raw={...provenance,fields:{local_transport:{...reference,...patch}}};assert.equal(cleanBudgetProvenance(raw,input),undefined);
 }
 const quantity=referenceBudgetOrigin(referenceCosts[0],3,{plnPerEuro:4.123456,date:'2026-11-04'},'94.02');
 const expected=Math.round(760*3*Math.round(4.123456*10000)/10000);
 quantity.amount=(expected/100).toFixed(2);
 assert.equal(cleanBudgetProvenance({version:'budget-provenance-v1',fields:{local_transport:quantity}},{...input,local_transport:quantity.amount}).fields.local_transport.amount,quantity.amount);
});
test('corrupt annotations fail closed per field without losing any valid budget, including recoverable local dates',()=>{
 for(const bad of [null,[],{},'bad',{version:'future',fields:{}},{version:'budget-provenance-v1',fields:[]}]){
  const restored=readBudgetDraft(JSON.stringify({...draft,provenance:bad}));assert.deepEqual(restored.input,input);assert.equal(restored.provenance,undefined);
 }
 const mixed={...provenance,fields:{flight:{...source.fields.flight,amount:'999'},local_transport:reference,hotel:source.fields.flight}};
 const restored=readBudgetDraft(JSON.stringify({...draft,provenance:mixed}));assert.deepEqual(restored.provenance.fields,{local_transport:reference});
 const local=readLocalBudgetDraft(JSON.stringify({...draft,start:'invalid'}));assert.equal(local.datesNeedReview,true);assert.deepEqual(local.draft.provenance,provenance);
});
test('v1 sharing and old saved lists preserve safe metadata and amounts, stripping notes, URLs and arbitrary nested fields',()=>{
 const unsafe={...draft,provenance:{...provenance,email:'private@example.com',fields:{flight:{...source.fields.flight,note:'private@example.com'},local_transport:{...reference,url:'https://private.example',rate:{...reference.rate,token:'secret'}}}}};
 const token=encodeTrip({...snapshot,draft:unsafe}),restored=decodeTrip(token);
 assert.ok(token);assert.deepEqual(restored.draft.provenance,provenance);assert.equal(restored.draft.context,'');assert.equal(restored.draft.review,true);
 assert.equal(JSON.stringify(restored).includes('private@example.com'),false);assert.equal(JSON.stringify(restored).includes('secret'),false);
 assert.deepEqual(readSavedTrips(JSON.stringify([token])),[token]);assert.equal(calculateBudget(restored.draft.input).total,69195);
 const old={...draft};delete old.provenance;assert.ok(decodeTrip(encodeTrip({...snapshot,draft:old})));
});
