import assert from 'node:assert/strict';
import test from 'node:test';
import {budgetCompletionReady} from '../src/lib/budget-completion.ts';
import {costFields,emptyBudget} from '../src/lib/trip-budget.ts';
import {projectBudget} from '../src/lib/budget-estimates.ts';
import {track,clearSession} from '../src/lib/session.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';

const complete=()=>({version:1,input:{...emptyBudget,...Object.fromEntries(costFields.map(field=>[field.key,'0']))},start:'',end:'',context:'',review:false});

test('partial subtotals and projected profiles are not completed budgets',()=>{
 const draft=complete();draft.input.food='';
 assert.equal(budgetCompletionReady(draft),false);
 draft.estimates={version:'budget-estimates-v1',currency:'PLN',selected:'standard',profiles:{standard:{hotel_basis:'night',hotel:{min:'10',max:'20'},food:{min:'10',max:'20'},transfers:{min:'10',max:'20'}}}};
 assert.equal(projectBudget(draft.input,draft.events,draft.estimates).valid,true);
 assert.deepEqual(projectBudget(draft.input,draft.events,draft.estimates).missing,[]);
 assert.equal(budgetCompletionReady(draft),false);
 draft.input.food='0';assert.equal(budgetCompletionReady(draft),true);
});

test('explicit zero costs qualify; inactive lodging input is ignored by the existing calculator',()=>{
 const draft=complete();assert.equal(budgetCompletionReady(draft),true);
 draft.input.hotel_basis='stay';draft.input.hotel_total='0';draft.input.hotel='bad';
 assert.equal(budgetCompletionReady(draft),true);
 draft.input.hotel_basis='night';assert.equal(budgetCompletionReady(draft),false);
 draft.input.hotel='';draft.input.nights='0';assert.equal(budgetCompletionReady(draft),false);
});

test('invalid amounts/counts and unreviewed plans never qualify',()=>{
 for(const patch of [{food:'-1'},{food:'1.234'},{people:'0'},{days:'366'},{nights:'-1'},{buffer:'bad'}]){
  const draft=complete();Object.assign(draft.input,patch);assert.equal(budgetCompletionReady(draft),false);
 }
 const draft=complete();draft.review=true;assert.equal(budgetCompletionReady(draft),false);
 draft.review=false;assert.equal(budgetCompletionReady(draft),true);
});

test('optional manual dates or valid ranges qualify, malformed/partial/reversed/long ranges do not',()=>{
 for(const [start,end] of [['','2030-01-01'],['2030-01-01',''],['2030-02-30','2030-03-01'],['2030-05-03','2030-05-01'],['2030-01-01','2031-01-01']]){
  assert.equal(budgetCompletionReady({...complete(),start,end}),false);
 }
 assert.equal(budgetCompletionReady({...complete(),start:'2030-05-01',end:'2030-05-01'}),true);
});

test('unknown/invalid planned ticket costs keep an otherwise complete budget incomplete',()=>{
 const draft=complete(),event={id:'synthetic-event',name:'Synthetic event',venue:'Synthetic venue',date:'2030-05-01',time:null,timezone:'Europe/Warsaw',url:'https://ticketmaster.evyy.net/c/1/2/3?u=https%3A%2F%2Fwww.ticketmaster.pl',quantity:'2',unitPricePln:''};
 draft.events=[event];assert.equal(budgetCompletionReady(draft),false);
 event.unitPricePln='-1';assert.equal(budgetCompletionReady(draft),false);
 event.unitPricePln='0';assert.equal(budgetCompletionReady(draft),true);
 event.quantity='0';assert.equal(budgetCompletionReady(draft),false);
});

test('completion events use existing consent, visit dedup, private payload and best-effort transport',async()=>{
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const realNow=Date.now,storage=new Map(),events=[];let now=Date.parse('2030-01-01T00:00:00Z');Date.now=()=>now;
 globalThis.window={};globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 globalThis.location={pathname:'/ru/trip',search:'?email=private@example.test',hash:'#plan=private-token'};
 globalThis.fetch=async(url,options)=>{assert.equal(options.referrerPolicy,'no-referrer');events.push(JSON.parse(options.body));return {};};
 const consent=analytics=>storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics,marketing:true,at:now}));
 try{
  clearSession();track('BUDGET_CALCULATED');consent(false);track('BUDGET_CALCULATED');assert.equal(events.length,0);
  consent(true);assert.equal(events.length,0);track('BUDGET_CALCULATED');now+=2001;track('BUDGET_CALCULATED');assert.equal(events.length,1);
  assert.deepEqual(Object.keys(events[0]).sort(),['anonymous_session_id','event_id','event_name','metadata']);assert.deepEqual(events[0].metadata,{page_type:'saved_trip',locale:'ru'});
  assert.doesNotMatch(JSON.stringify(events),/private|token|plan_id|budget|total|complete/);
  globalThis.location.pathname='/saved';track('PAGE_VIEW');globalThis.location.pathname='/ru/trip';track('BUDGET_CALCULATED');assert.equal(events.length,3);
  consent(false);clearSession();track('BUDGET_CALCULATED');assert.equal(events.length,3);assert.equal(storage.has('hoptrip.session.v2'),false);
  consent(true);let attempts=0;globalThis.fetch=async()=>{attempts++;throw Error('Synthetic blocked analytics');};
  assert.doesNotThrow(()=>track('BUDGET_CALCULATED'));await new Promise(resolve=>setImmediate(resolve));track('BUDGET_CALCULATED');assert.equal(attempts,1);
 }finally{clearSession();Date.now=realNow;Object.assign(globalThis,saved);}
});
