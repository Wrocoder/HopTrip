import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateBudget,emptyBudget} from '../src/lib/trip-budget.ts';
import {readBudgetDraft,readLocalBudgetDraft,changeStayDate} from '../src/lib/budget-draft.ts';
import {decodeTrip,encodeTrip,readSavedTrips} from '../src/lib/shared-trip.ts';
import {budgetText} from '../src/lib/i18n/budget-copy.ts';

const draft={version:1,input:{...emptyBudget,flight:'200.25',people:'2',other:'123.45'},start:'2030-05-01',end:'2030-05-03',context:'old',review:false};
const offer={slug:'browser-deal',origin:'Warsaw',destination:'Barcelona',start:draft.start,end:draft.end,price:'200.25',observedAt:''};
const legacy=()=>{const value=structuredClone(draft);delete value.input.taxes;delete value.input.buffer;return value;};
const rawToken=value=>Buffer.from(JSON.stringify(value)).toString('base64url');

test('old local drafts and raw shared/saved tokens retain every legacy amount and unknown new costs',()=>{
 const old=legacy();
 const restored=readBudgetDraft(JSON.stringify(old));
 assert.deepEqual(restored.input,draft.input);
 assert.equal(readLocalBudgetDraft(JSON.stringify(old)).draft.input.other,'123.45');
 const token=rawToken({version:1,offer,draft:old});
 const shared=decodeTrip(token);
 assert.deepEqual(shared.draft.input,draft.input);
 assert.deepEqual(readSavedTrips(JSON.stringify([token])),[token]);
 const result=calculateBudget(shared.draft.input);
 assert.equal(result.total,52395);
 for(const key of ['taxes','buffer'])assert.equal(result.lines.find(line=>line.key===key).total,null);
});

test('new fields preserve strict validation while legacy required fields remain required',()=>{
 for(const key of ['taxes','buffer'])for(const value of [null,123,{},'x'.repeat(33)]){
  assert.equal(readBudgetDraft(JSON.stringify({...draft,input:{...draft.input,[key]:value}})),null);
 }
 const missing=legacy();delete missing.input.flight;
 assert.equal(readBudgetDraft(JSON.stringify(missing)),null);
 for(const key of ['taxes','buffer']){
  assert.equal(calculateBudget({...emptyBudget,[key]:'-1'}).total,null);
  assert.equal(encodeTrip({version:1,offer,draft:{...draft,input:{...draft.input,[key]:'1e3'}}}),null);
 }
});

test('taxes and emergency buffer are group totals, retain grosz and do not multiply by nights or people',()=>{
 const input={...draft.input,hotel_basis:'stay',hotel_total:'900',transfers:'100',food:'40',baggage:'20',local_transport:'10',activities:'30',other:'50',taxes:'12.34',buffer:'100'};
 const result=calculateBudget(input);
 assert.equal(result.total,192284);assert.equal(result.perPerson,96142);assert.deepEqual(result.missing,[]);
 for(const people of ['1','3','50'])for(const nights of ['0','7','365']){
  const value=calculateBudget({...emptyBudget,people,nights,taxes:'12,34',buffer:'100'});
  assert.equal(value.total,11234);
 }
 const next=changeStayDate({...draft,input},'end','2030-05-06');
 assert.equal(next.input.taxes,'12.34');assert.equal(next.input.buffer,'100');
 assert.equal(decodeTrip(encodeTrip({version:1,offer,draft:{...draft,input}})).draft.input.taxes,'12.34');
});

test('empty and explicit zero remain distinct for both added categories',()=>{
 const unknown=calculateBudget(emptyBudget);
 for(const key of ['taxes','buffer'])assert.equal(unknown.lines.find(line=>line.key===key).total,null);
 const zero=calculateBudget({...emptyBudget,taxes:'0',buffer:'0'});
 assert.equal(zero.missing.length,unknown.missing.length-2);
 for(const key of ['taxes','buffer'])assert.equal(zero.lines.find(line=>line.key===key).total,0);
});

test('budget modes, new categories, confidence and correction copy exist in all locales',()=>{
 for(const locale of ['en','ru','uk'])for(const source of ['Szybki budżet','Szczegółowy budżet','Podatki i opłaty','Rezerwa awaryjna','Wpisana kwota — do weryfikacji','Błąd w dodatkowych kosztach.']){
  assert.notEqual(budgetText(locale,source),source);assert.ok(budgetText(locale,source));
 }
});
