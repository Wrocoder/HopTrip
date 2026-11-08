import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsViewport} from '../src/lib/analytics-context.ts';
import {track,clearSession} from '../src/lib/session.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';

test('viewport classes use CSS width boundaries and leave missing or invalid measurements unknown',()=>{
 for(const [width,expected] of [[320,'small'],[375,'small'],[390,'small'],[767,'small'],[768,'medium'],[1023,'medium'],[1024,'large'],[1440,'large']])assert.equal(analyticsViewport(width),expected);
 for(const value of [undefined,null,'390',0,-1,NaN,Infinity,{},[]])assert.equal(analyticsViewport(value),undefined);
});
test('only the bounded viewport label is sent with consent, without changing identity or dedup on resize',()=>{
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const storage=new Map(),events=[];globalThis.window={innerWidth:390};
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 globalThis.location={pathname:'/deals',search:'?email=private@example.test',hash:'#token=private-token'};
 globalThis.fetch=async(url,options)=>{assert.equal(options.referrerPolicy,'no-referrer');events.push(JSON.parse(options.body));return {};};
 try{
  clearSession();track('PAGE_VIEW');assert.equal(events.length,0);
  storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()}));
  track('PAGE_VIEW');track('PAGE_VIEW');assert.equal(events.length,1);assert.equal(events[0].metadata.viewport,'small');
  globalThis.window.innerWidth=1440;track('PAGE_VIEW');assert.equal(events.length,1);
  globalThis.location.pathname='/saved';track('PAGE_VIEW');assert.equal(events[1].metadata.viewport,'large');
  assert.equal(events[1].anonymous_session_id,events[0].anonymous_session_id);
  assert.deepEqual(Object.keys(events[1].metadata).sort(),['locale','page_type','viewport']);
  assert.doesNotMatch(JSON.stringify(events),/private|email|token|1440|innerWidth|userAgent|screen/);
  storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));clearSession();track('TRIP_SAVE');assert.equal(events.length,2);
 }finally{clearSession();Object.assign(globalThis,saved);}
});
