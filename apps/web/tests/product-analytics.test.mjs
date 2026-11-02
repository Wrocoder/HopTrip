import assert from 'node:assert/strict';
import test from 'node:test';
import {track,clearSession} from '../src/lib/session.ts';
import {analyticsPageType} from '../src/lib/analytics-context.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';
import {localizedHref} from '../src/lib/i18n/routing.ts';

function browser(run){
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const storage=new Map(),events=[];
 globalThis.window={};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 globalThis.location={pathname:'/deals',search:'?email=private@example.test',hash:'#token=private-token'};
 globalThis.fetch=async(url,options)=>{assert.equal(options.referrerPolicy,'no-referrer');events.push(JSON.parse(options.body));return {};};
 const consent=(analytics,marketing=false)=>storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics,marketing,at:Date.now()}));
 try{clearSession();run({storage,events,consent});}finally{clearSession();Object.assign(globalThis,saved);}
}

test('new actions require analytics consent independently of marketing and stop on withdrawal',()=>browser(({events,storage,consent})=>{
 for(const name of ['TRIP_REMOVE','EVENT_CLICK','ALERT_STARTED'])track(name);
 assert.equal(events.length,0);
 consent(false,true);track('TRIP_REMOVE');assert.equal(events.length,0);
 consent(true);track('TRIP_REMOVE');track('EVENT_CLICK');track('ALERT_STARTED');
 assert.equal(events.length,3);
 consent(false);clearSession();track('TRIP_REMOVE');track('EVENT_CLICK');track('ALERT_STARTED');
 assert.equal(events.length,3);assert.equal(storage.has('hoptrip.session.v2'),false);
 assert.doesNotMatch(JSON.stringify(events),/private|email|token/);
}));

test('filter apply, remove and reset each count once without a second wire event',()=>browser(({events,consent})=>{
 consent(true);
 for(const action of ['apply','remove','reset']){
  const context={filter:{action}};track('FILTER_USE',undefined,undefined,context);track('FILTER_USE',undefined,undefined,context);
 }
 assert.deepEqual(events.map(e=>e.filter.action),['apply','remove','reset']);
 assert.ok(events.every(e=>e.event_name==='FILTER_USE'));
}));

test('localized signup start is explicit, once per visit and suppressed on capability pages',()=>browser(({events,consent})=>{
 consent(true);
 for(const locale of ['pl','en','ru','uk']){
  clearSession();globalThis.location.pathname=localizedHref('/alerts',locale);
  track('PAGE_VIEW');assert.equal(events.filter(e=>e.event_name==='PAGE_VIEW').length,0);
  const before=events.length;track('ALERT_STARTED');track('ALERT_STARTED');assert.equal(events.length,before+1);
  for(const path of ['/alerts/manage','/alerts/confirm']){
   globalThis.location.pathname=localizedHref(path,locale);track('ALERT_STARTED');track('TRIP_REMOVE');track('EVENT_CLICK');
   assert.equal(events.length,before+1);
  }
 }
 assert.ok(events.every(e=>e.event_name==='ALERT_STARTED'&&e.metadata.page_type==='alerts'));
 assert.doesNotMatch(JSON.stringify(events),/private|email|token/);
}));

test('saved list has a bounded locale-independent page type and analytics failure does not block actions',()=>browser(({events,consent})=>{
 consent(true);
 for(const locale of ['pl','en','ru','uk'])assert.equal(analyticsPageType(localizedHref('/saved',locale)),'saved');
 globalThis.location.pathname='/ru/saved';track('TRIP_REMOVE');assert.equal(events[0].metadata.page_type,'saved');
 globalThis.fetch=()=>{throw Error('synthetic offline');};
 assert.doesNotThrow(()=>track('EVENT_CLICK'));
}));
