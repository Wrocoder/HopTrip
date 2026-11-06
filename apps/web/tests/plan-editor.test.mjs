import test from 'node:test';
import assert from 'node:assert/strict';
import {bindPlanDraft,readPlanBase,planEditState,samePlanContents,localPlanPath,planDraftKey,readPlanSeed,savedOfferChanged} from '../src/lib/plan-editor.ts';
import {readLocalPlanFragment,readTripFragment} from '../src/lib/trip-fragment.ts';
import {encodeTrip,decodeTrip} from '../src/lib/shared-trip.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
const id='00000000-0000-4000-8000-000000000001',offer={slug:'synthetic-editor',origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''};
const draft={version:1,input:{...emptyBudget,flight:'100',food:'0'},start:offer.start,end:offer.end,context:'',review:true};
const trip={version:1,offer,draft},token=encodeTrip(trip),plan={id,revision:1,token};
test('local ID URLs are strictly separate from portable snapshots, including sections and malformed inputs',()=>{
 assert.deepEqual(readLocalPlanFragment(new URL(localPlanPath(id),'https://example.test').hash),{id,section:null});assert.deepEqual(readLocalPlanFragment('#local='+id+'&section=calculator'),{id,section:'calculator'});
 for(const hash of ['#local=bad','#local='+id+'&local='+id,'#local='+id+'&plan='+token,'#local='+id+'&section=../bad','#local='+id+'&note=private','#local='+id+'&section=a&section=b'])assert.equal(readLocalPlanFragment(hash),null);
 assert.equal(readTripFragment('#local='+id),null);assert.equal(readLocalPlanFragment('#plan='+token),null);assert.ok(planDraftKey(id).endsWith(id));
});
test('local base revisions stay in opaque context and are stripped from shared payloads',()=>{
 const bound=bindPlanDraft(draft,{id,revision:2});assert.deepEqual(readPlanBase(bound.context),{id,revision:2});assert.deepEqual(bound.input,draft.input);
 const encoded=encodeTrip({...trip,draft:bound});assert.equal(encoded,token);assert.equal(JSON.stringify(decodeTrip(encoded)).includes(id),false);
 for(const context of ['bad','{}',JSON.stringify({plan:{id,revision:0}}),JSON.stringify({plan:{id:'bad',revision:1}})])assert.equal(readPlanBase(context),null);
});
test('legacy missing adultsOnly equals false for dirty checking without rewriting saved bytes',()=>{
 assert.equal(samePlanContents(token,{...trip,draft:{...draft,adultsOnly:false}}),true);assert.equal(samePlanContents(token,{...trip,draft:{...draft,adultsOnly:true}}),false);assert.equal(plan.token,token);
});
test('editor states distinguish committed, uncommitted, conflicting and deleted plans',()=>{
 assert.equal(planEditState(plan,{id,revision:1},trip),'saved');assert.equal(planEditState(plan,{id,revision:1},{...trip,draft:{...draft,input:{...draft.input,food:'20'}}}),'dirty');
 assert.equal(planEditState({...plan,revision:2},{id,revision:1},trip),'conflict');assert.equal(planEditState(plan,null,trip),'conflict');assert.equal(planEditState(undefined,{id,revision:1},trip),'removed');
});
test('rebinding preserves the latest local edits and intentional zeros, including pending-save or reset contents',()=>{
 const current={...draft,input:{...draft.input,food:'37.42',hotel:'0'},events:[],review:true};const bound=bindPlanDraft(current,{id,revision:3});assert.equal(bound.input.food,'37.42');assert.equal(bound.input.hotel,'0');assert.deepEqual(bound.events,[]);assert.deepEqual(readPlanBase(bound.context),{id,revision:3});
});
test('bounded editor recovery snapshots cannot resolve another ID or malformed token',()=>{
 assert.deepEqual(readPlanSeed(JSON.stringify(plan),id),plan);assert.equal(readPlanSeed(JSON.stringify({...plan,id:id.replace(/1$/,'2')}),id),null);assert.equal(readPlanSeed('{broken',id),null);assert.equal(readPlanSeed(JSON.stringify({...plan,token:'bad'}),id),null);assert.equal(readPlanSeed('x'.repeat(7001),id),null);
});
test('changed source notice compares known flight amounts and dates, never replaces manual budget values',()=>{
 const current={flight_price_pln:'100.00',trip_start:offer.start,trip_end:offer.end};assert.equal(savedOfferChanged(offer,current),false);assert.equal(savedOfferChanged(offer,{...current,flight_price_pln:'101'}),true);assert.equal(savedOfferChanged(offer,{...current,trip_start:'2030-05-02'}),true);assert.equal(savedOfferChanged(offer,{...current,flight_price_pln:null}),false);assert.equal(savedOfferChanged(offer,null),false);assert.equal(draft.input.flight,'100');
});
