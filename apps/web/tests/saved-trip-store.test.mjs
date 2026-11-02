import test from 'node:test';
import assert from 'node:assert/strict';
import {changeSavedTrips,decodeTrip,encodeTrip,readSavedTrips,readSavedTripsState} from '../src/lib/shared-trip.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
import {savedTripCopy} from '../src/lib/i18n/saved-trip-copy.ts';

const token=encodeTrip({version:1,offer:{slug:'saved-example',origin:'Warsaw',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},
 draft:{version:1,input:{...emptyBudget,flight:'100',food:'0',taxes:'12,34',buffer:'100'},start:'2030-05-01',end:'2030-05-03',context:'',review:true,adultsOnly:true}});

test('duplicate snapshots are retrieved once without losing a distinct plan',()=>{
 const second=encodeTrip({...decodeTrip(token),offer:{...decodeTrip(token).offer,slug:'another'}});
 assert.deepEqual(readSavedTrips(JSON.stringify([token,token,second])),[token,second]);
});

test('missing storage is empty, corrupted or unsupported storage is reported and never rewritten',()=>{
 assert.deepEqual(readSavedTripsState(null),{tokens:[],corrupt:false});
 assert.deepEqual(readSavedTripsState('[]'),{tokens:[],corrupt:false});
 for(const raw of ['{broken','null','{}','[1]',JSON.stringify(['bad',token]),'x'.repeat(140001),JSON.stringify(Array(21).fill(token))]){
  assert.equal(readSavedTripsState(raw).corrupt,true);
  for(const action of ['save','remove'])assert.equal(changeSavedTrips(raw,token,action).status,'corrupt');
 }
 assert.deepEqual(readSavedTripsState(JSON.stringify(['bad',token])).tokens,[token]);
});

test('save, duplicate save, capacity and removal preserve all independent snapshots',()=>{
 const tokens=Array.from({length:21},(_,i)=>encodeTrip({...decodeTrip(token),offer:{...decodeTrip(token).offer,slug:`plan-${i}`}}));
 const raw=JSON.stringify(tokens.slice(0,20));
 assert.equal(changeSavedTrips(raw,tokens[0],'save').status,'already');
 const full=changeSavedTrips(raw,tokens[20],'save');
 assert.equal(full.status,'full');assert.deepEqual(full.tokens,tokens.slice(0,20));
 const removed=changeSavedTrips(raw,tokens[4],'remove');
 assert.equal(removed.status,'removed');assert.deepEqual(removed.tokens,tokens.slice(0,20).filter(t=>t!==tokens[4]));
 const restored=changeSavedTrips(JSON.stringify(removed.tokens),tokens[4],'save');
 assert.equal(restored.status,'saved');assert.deepEqual(new Set(restored.tokens),new Set(tokens.slice(0,20)));
 assert.equal(changeSavedTrips(raw,tokens[20],'remove').status,'absent');
 for(const action of ['save','remove'])assert.equal(changeSavedTrips(raw,'broken',action).status,'invalid');
});

test('a fresh mutation after another tab removed a snapshot cannot resurrect it or overwrite new plans',()=>{
 const a=token,b=encodeTrip({...decodeTrip(token),offer:{...decodeTrip(token).offer,slug:'b'}}),c=encodeTrip({...decodeTrip(token),offer:{...decodeTrip(token).offer,slug:'c'}});
 const original=JSON.stringify([a,b]);
 const otherTab=changeSavedTrips(original,a,'remove');
 const added=changeSavedTrips(JSON.stringify(otherTab.tokens),c,'save');
 const staleTab=changeSavedTrips(JSON.stringify(added.tokens),b,'remove');
 assert.deepEqual(staleTab.tokens,[c]);
 assert.equal(staleTab.status,'removed');
});

test('saved mutations retain exact v1 snapshot, manual values, unknown and zero fields',()=>{
 const saved=changeSavedTrips(null,token,'save');
 const value=decodeTrip(saved.tokens[0]);
 assert.equal(value.draft.input.food,'0');assert.equal(value.draft.input.hotel,'');
 assert.equal(value.draft.input.taxes,'12,34');assert.equal(value.draft.input.buffer,'100');
 assert.equal(value.draft.adultsOnly,true);assert.equal(saved.tokens[0],token);
 const old=decodeTrip(token);delete old.draft.input.taxes;delete old.draft.input.buffer;
 const legacy=Buffer.from(JSON.stringify(old)).toString('base64url');
 assert.equal(readSavedTripsState(JSON.stringify([legacy])).corrupt,false);
 assert.equal(changeSavedTrips(null,legacy,'save').tokens[0],legacy);
});

test('local storage, snapshot, undo and stale-link messages exist in four locales',()=>{
 for(const locale of ['pl','en','ru','uk'])for(const value of Object.values(savedTripCopy[locale]))assert.ok(value.trim());
});
