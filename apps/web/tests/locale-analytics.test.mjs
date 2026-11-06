import assert from 'node:assert/strict';
import test from 'node:test';
import {track,clearSession} from '../src/lib/session.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';

test('page language follows resolved routes within one consented session, without browser or private context',async()=>{
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch},storage=new Map(),events=[];
 globalThis.window={};globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 globalThis.fetch=async(url,options)=>{assert.equal(options.referrerPolicy,'no-referrer');events.push(JSON.parse(options.body));return {};};
 globalThis.location={pathname:'/saved',search:'?email=private@example.test',hash:'#plan=private-token'};
 try{
  clearSession();track('PAGE_VIEW');assert.equal(events.length,0);
  storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()}));
  for(const [pathname,locale] of [['/saved','pl'],['/en/saved','en'],['/ru/saved','ru'],['/uk/saved','uk'],['/en/info/untranslated-fixture','pl']]){
   globalThis.location.pathname=pathname;track('PAGE_VIEW');track('PAGE_VIEW');assert.equal(events.at(-1).metadata.locale,locale);
  }
  assert.equal(events.length,5);assert.equal(new Set(events.map(e=>e.anonymous_session_id)).size,1);
  assert(events.every(e=>Object.keys(e.metadata).sort().join(',')==='locale,page_type'));
  assert.doesNotMatch(JSON.stringify(events),/private|email|token|navigator|userAgent/);
  storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));clearSession();globalThis.location.pathname='/saved';track('PAGE_VIEW');assert.equal(events.length,5);
 }finally{clearSession();Object.assign(globalThis,saved);}
});
