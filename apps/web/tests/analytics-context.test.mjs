import assert from "node:assert/strict";
import test from "node:test";
import {analyticsFilters,campaignLabel,sourceLabel} from "../src/lib/analytics-context.ts";
import {track,clearSession} from "../src/lib/session.ts";
import {CONSENT_KEY} from "../src/lib/consent.ts";

test("filters and campaign labels never copy arbitrary URL fields",()=>{
 assert.deepEqual(analyticsFilters({origin:"WRO",destination:"private-token",budget:"300",departure_from:"2030-02-30",email:"x@example.com"},[{iata_code:"WRO"}],[]),{origin:"WRO",budget:"300"});
 assert.equal(campaignLabel("x@example.com"),undefined);
 assert.equal(sourceLabel("subscription-secret"),undefined);
 assert.equal(campaignLabel("wro-weekend"),"wro-weekend");
});
test("consent, rerenders, navigation and different partner categories",()=>{
 const saved={window:globalThis.window,localStorage:globalThis.localStorage,location:globalThis.location,fetch:globalThis.fetch};
 const storage=new Map(),events=[];
 globalThis.window={};
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 globalThis.location={pathname:"/deals",search:"?utm_source=secret&utm_campaign=private-token&email=x@example.com"};
 globalThis.fetch=async(url,options)=>{events.push(JSON.parse(options.body));assert.equal(options.referrerPolicy,"no-referrer");return {};};
 const realNow=Date.now;let now=realNow();Date.now=()=>now;
 try {
  clearSession();track("SEARCH");assert.equal(events.length,0);
  storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:true,marketing:false,at:now}));
  const result={search:{filters:{origin:"WRO"},result_count:2}};
  track("SEARCH_RESULT",undefined,undefined,result);
  now+=2000;track("SEARCH_RESULT",undefined,undefined,result);
  assert.equal(events.length,1);
  track("PARTNER_CLICK",undefined,undefined,{partner:{category:"stay",provider:"stay22"}});
  track("PARTNER_CLICK",undefined,undefined,{partner:{category:"activity",provider:"tiqets"}});
  assert.equal(events.length,3);
  assert.ok(!JSON.stringify(events).includes("secret"));assert.ok(!JSON.stringify(events).includes("email"));
  globalThis.location.pathname="/deals/example";track("DEAL_VIEW");
  now+=2000;track("DEAL_VIEW");assert.equal(events.length,4);
  globalThis.location.pathname="/deals";track("SEARCH_RESULT",undefined,undefined,result);assert.equal(events.length,5);
  storage.set(CONSENT_KEY,JSON.stringify({version:1,analytics:false,marketing:false,at:now}));
  clearSession();track("PARTNER_CLICK");assert.equal(events.length,5);
  assert.equal(storage.has("hoptrip.session.v2"),false);
 } finally {Date.now=realNow;Object.assign(globalThis,saved);}
});
