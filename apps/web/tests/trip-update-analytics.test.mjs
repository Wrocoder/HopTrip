import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {analyticsEvents} from '../src/lib/analytics-context.ts';
import {track,clearSession} from '../src/lib/session.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';

test('current frontend and API event names agree; baseline v1 remains historical',()=>{
 const schema=readFileSync(new URL('../../api/app/schemas/analytics.py',import.meta.url),'utf8');
 const wire=JSON.parse(schema.match(/EventName = Literal\[(.*?)\]/)[0].replace('EventName = Literal',''));
 assert.deepEqual(analyticsEvents,wire);
 assert.equal(analyticsEvents.length,17);
 assert.equal(analyticsEvents.filter(name=>name==='TRIP_UPDATE').length,1);
});

test('trip updates use existing consent, action dedup and private transport without backfill',async()=>{
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const realNow=Date.now,storage=new Map(),events=[];
 let now=Date.parse('2030-01-01T00:00:00Z');Date.now=()=>now;
 globalThis.window={};
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 globalThis.location={pathname:'/uk/trip',search:'?plan=private-token',hash:'#local=private-plan'};
 globalThis.fetch=async(url,options)=>{assert.equal(options.referrerPolicy,'no-referrer');events.push(JSON.parse(options.body));return {};};
 const consent=analytics=>storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics,marketing:true,at:now}));
 try{
  clearSession();track('TRIP_UPDATE');consent(false);track('TRIP_UPDATE');
  assert.equal(events.length,0);assert.equal(storage.has('hoptrip.session.v2'),false);
  consent(true);assert.equal(events.length,0); // Accepting consent does not replay prior commits.
  track('TRIP_UPDATE');track('TRIP_UPDATE');assert.equal(events.length,1);
  assert.equal(events[0].event_name,'TRIP_UPDATE');assert.deepEqual(events[0].metadata,{page_type:'saved_trip',locale:'uk'});
  assert.deepEqual(Object.keys(events[0]).sort(),['anonymous_session_id','event_id','event_name','metadata']);
  now+=1001;track('TRIP_UPDATE');assert.equal(events.length,2);
  assert.notEqual(events[0].event_id,events[1].event_id);
  assert.equal(events[0].anonymous_session_id,events[1].anonymous_session_id);
  consent(false);clearSession();now+=1001;track('TRIP_UPDATE');assert.equal(events.length,2);
  assert.equal(storage.has('hoptrip.session.v2'),false);
  assert.doesNotMatch(JSON.stringify(events),/private|plan_id|revision|budget|token/);
  consent(true);globalThis.fetch=async()=>{throw Error('Synthetic blocked analytics');};
  assert.doesNotThrow(()=>track('TRIP_UPDATE'));await new Promise(resolve=>setImmediate(resolve));
 }finally{clearSession();Date.now=realNow;Object.assign(globalThis,saved);}
});
