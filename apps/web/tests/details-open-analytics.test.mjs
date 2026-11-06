import assert from 'node:assert/strict';
import test from 'node:test';
import {track,clearSession} from '../src/lib/session.ts';
import {CONSENT_KEY} from '../src/lib/consent.ts';

async function browser(run){
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const realNow=Date.now,storage=new Map(),events=[];
 let now=Date.parse('2030-01-01T00:00:00Z');Date.now=()=>now;
 globalThis.window={};
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 globalThis.location={pathname:'/ru/deals',search:'?email=private@example.test',hash:'#plan=private-token'};
 globalThis.fetch=async(url,options)=>{assert.equal(options.referrerPolicy,'no-referrer');events.push(JSON.parse(options.body));return {};};
 const consent=analytics=>storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics,marketing:true,at:now}));
 try{clearSession();await run({storage,events,consent,advance:ms=>{now+=ms;}});}
 finally{clearSession();Date.now=realNow;Object.assign(globalThis,saved);}
}

test('disclosures share one per-offer visit event without becoming a detail visit',()=>browser(({events,consent,advance})=>{
 consent(true);track('DEAL_DETAILS_OPEN','synthetic-offer');advance(2000);track('DEAL_DETAILS_OPEN','synthetic-offer');
 assert.equal(events.length,1);
 track('DEAL_DETAILS_OPEN','synthetic-other');assert.equal(events.length,2);
 assert.deepEqual(Object.keys(events[0]).sort(),['anonymous_session_id','deal_slug','event_id','event_name','metadata']);
 assert.deepEqual(events[0].metadata,{page_type:'catalog',locale:'ru'});assert.equal(events[0].event_name,'DEAL_DETAILS_OPEN');
 assert.doesNotMatch(JSON.stringify(events),/private|email|plan=|token/);
 globalThis.location.pathname='/saved';track('PAGE_VIEW');
 globalThis.location.pathname='/ru/deals';track('DEAL_DETAILS_OPEN','synthetic-offer');
 assert.equal(events.length,4);assert.equal(events[3].anonymous_session_id,events[0].anonymous_session_id);
 assert.notEqual(events[3].event_id,events[0].event_id);
 assert.equal(events.filter(event=>event.event_name==='DEAL_VIEW').length,0);
}));

test('denial/revocation and blocked disclosure analytics retain existing best-effort rules',()=>browser(async({storage,events,consent})=>{
 track('DEAL_DETAILS_OPEN','synthetic-offer');consent(false);track('DEAL_DETAILS_OPEN','synthetic-offer');
 assert.equal(events.length,0);assert.equal(storage.has('hoptrip.session.v2'),false);
 consent(true);assert.equal(events.length,0);track('DEAL_DETAILS_OPEN','synthetic-offer');assert.equal(events.length,1);
 consent(false);clearSession();track('DEAL_DETAILS_OPEN','synthetic-other');assert.equal(events.length,1);
 consent(true);let attempts=0;globalThis.fetch=async()=>{attempts++;throw Error('Synthetic ad blocker');};
 assert.doesNotThrow(()=>track('DEAL_DETAILS_OPEN','synthetic-other'));await new Promise(resolve=>setImmediate(resolve));
 track('DEAL_DETAILS_OPEN','synthetic-other');assert.equal(attempts,1);assert.equal(events.length,1);
}));
