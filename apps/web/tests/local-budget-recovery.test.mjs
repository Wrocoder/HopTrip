import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBudgetDraft,readLocalBudgetDraft,changeStayDate} from '../src/lib/budget-draft.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
import {encodeTrip} from '../src/lib/shared-trip.ts';

const event={id:'concert',name:'Concert',venue:'Venue',date:'2028-02-29',time:'20:00',timezone:'Europe/London',quantity:'2',unitPricePln:'50',
 url:'https://ticketmaster.evyy.net/c/7853869/1958975/23899?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2Fconcert'};
const draft={version:1,input:{...emptyBudget,hotel:'321',hotel_total:'700',people:'3'},start:'2028-02-28',end:'2028-03-01',context:'old',review:false,adultsOnly:true,events:[event]};
const offer={slug:'example',origin:'Warsaw',destination:'London',start:'2028-02-28',end:'2028-03-01',price:'100',observedAt:''};

test('local recovery preserves all editable costs, people and tickets; shared input stays strict',()=>{
 for(const [start,end] of [['10000-01-01',draft.end],[draft.start,'10000-01-01'],['2028-02-30',draft.end],['',draft.end],[draft.end,draft.start]]){
  const invalid={...draft,start,end};
  const restored=readLocalBudgetDraft(JSON.stringify(invalid));
  assert.ok(restored);assert.equal(restored.datesNeedReview,true);assert.equal(restored.draft.review,true);
  assert.deepEqual(restored.draft.input,draft.input);assert.deepEqual(restored.draft.events,draft.events);
  assert.equal(restored.draft.adultsOnly,true);assert.equal(restored.draft.start,start);assert.equal(restored.draft.end,end);
  assert.equal(encodeTrip({version:1,offer,draft:invalid}),null);
 }
 const changed=changeStayDate(draft,'start','10000-01-01');
 assert.equal(readBudgetDraft(JSON.stringify(changed)),null);
 const restored=readLocalBudgetDraft(JSON.stringify(changed));
 const fixed=changeStayDate(restored.draft,'start','2028-02-29');
 assert.equal(fixed.input.hotel,'321');assert.equal(fixed.input.nights,'1');
 assert.ok(readBudgetDraft(JSON.stringify(fixed)));assert.ok(encodeTrip({version:1,offer,draft:fixed}));
});

test('recovery retains schema, version, size and ticket link protections',()=>{
 for(const invalid of [{...draft,version:2},{...draft,start:123},{...draft,start:'x'.repeat(33)},
  {...draft,input:[]},{...draft,input:{...draft.input,hotel_basis:'person'}},{...draft,context:'x'.repeat(2001)},
  {...draft,input:{...draft.input,hotel:'x'.repeat(33)}},{...draft,adultsOnly:'yes'},
  {...draft,events:[{...event,url:'javascript:alert(1)'}]},{...draft,events:null}]){
  assert.equal(readLocalBudgetDraft(JSON.stringify(invalid)),null);
 }
 for(const raw of ['{','null','[]','x'.repeat(50001)])assert.equal(readLocalBudgetDraft(raw),null);
 const legacy={...draft};delete legacy.events;delete legacy.adultsOnly;
 assert.deepEqual(readLocalBudgetDraft(JSON.stringify(legacy)),{draft:legacy,datesNeedReview:false});
 assert.equal(readLocalBudgetDraft(JSON.stringify({...legacy,start:'',end:''})).datesNeedReview,false);
});
