import assert from 'node:assert/strict';
import test from 'node:test';
import {track,clearSession,sessionContext} from '../src/lib/session.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';

async function browser(run){
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const realNow=Date.now,storage=new Map(),events=[];
 let now=Date.parse('2030-01-01T00:00:00Z');Date.now=()=>now;
 globalThis.window={};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 globalThis.location={pathname:'/deals',search:'?utm_source=newsletter&utm_campaign=test'};
 globalThis.fetch=async(url,options)=>{events.push(JSON.parse(options.body));return {};};
 const consent=(patch={})=>storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:true,marketing:false,at:now,...patch}));
 try{clearSession();await run({storage,events,consent,advance:ms=>{now+=ms;}});}
 finally{clearSession();Date.now=realNow;Object.assign(globalThis,saved);}
}

test('consent expiry, future timestamps and malformed flags fail closed at the transport boundary',()=>browser(({storage,events,consent})=>{
 for(const patch of [{at:Date.now()-180*86400000},{at:Date.now()+1},{analytics:'true'},{version:2},{analytics:false,marketing:true}]){
  consent(patch);track('SEARCH');
  assert.equal(sessionContext().id,'anonymous');assert.equal(storage.has('hoptrip.session.v2'),false);
 }
 storage.set(CONSENT_KEY,'broken-json');track('SEARCH');
 assert.equal(events.length,0);
 consent();track('SEARCH');assert.equal(events.length,1);
}));

test('session expires after thirty idle minutes and a renewed session can record the same page',()=>browser(({events,consent,advance})=>{
 consent();track('PAGE_VIEW');const first=events[0].anonymous_session_id;
 advance(29*60000);assert.equal(sessionContext().id,first);
 advance(30*60000);track('PAGE_VIEW');
 assert.equal(events.length,2);assert.notEqual(events[1].anonymous_session_id,first);
 assert.equal(events[1].source,'newsletter');assert.equal(events[1].metadata.campaign,'test');
 track('PAGE_VIEW');assert.equal(events.length,2);
}));

test('blocked analytics fetch stays best effort without retries or blocking later visits',()=>browser(async({events,consent})=>{
 consent();let attempts=0;
 globalThis.fetch=async()=>{attempts++;throw new Error('Synthetic ad blocker');};
 assert.doesNotThrow(()=>track('PAGE_VIEW'));await new Promise(resolve=>setImmediate(resolve));
 track('PAGE_VIEW');assert.equal(attempts,1); // Failed view remains deduplicated in this visit.
 globalThis.fetch=async(url,options)=>{events.push(JSON.parse(options.body));return {};};
 globalThis.location.pathname='/saved';track('PAGE_VIEW');
 globalThis.location.pathname='/deals';track('PAGE_VIEW');assert.equal(events.length,2);
}));
