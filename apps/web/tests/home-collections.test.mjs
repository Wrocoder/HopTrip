import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {planningQuality} from './fixtures/planning-quality.mjs';
import {searchFilters,searchSeo,searchUrl} from '../src/lib/search-policy.ts';
const require=createRequire(import.meta.url),modules=new Map();
function load(file){
 if(modules.has(file))return modules.get(file).exports;
 const loaded={exports:{}};modules.set(file,loaded);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name.endsWith('.ts')?name:name+'.ts')):require(name),loaded,loaded.exports);
 return loaded.exports;
}
const {loadHomeCollections,homeCollectionDefinitions,collectionsMatchOrigin}=load(path.resolve('src/lib/home-collections.ts'));
const now=Date.parse('2030-04-01T00:00:00Z');
function deal(id=1,patch={}){
 patch={trip_quality:planningQuality(),...patch};
 return {id,slug:`synthetic-${id}`,trip_start:'2030-05-03',trip_end:'2030-05-05',origin_airport_id:1,destination_id:1,origin_code:'WRO',origin_city:'Wrocław',destination_city:'London',destination_slug:'london',trip_type:'ROUND_TRIP',price_basis:'FLIGHT_PER_PERSON',components:[],flight_price_pln:'200.25',hotel_price_pln:null,total_estimated_pln:'200.25',price_per_person_pln:'200.25',historical_baseline_pln:null,discount_percent:null,deal_score:0,confidence:'0',explanation_codes:[],score_version:'synthetic',score_components:{},last_verified_at:'2030-04-01T00:00:00Z',expires_at:'2030-04-01T02:00:00Z',flight_quality:{version:'flight-quality-v1',status:'PARTIAL',reasons:['UNKNOWN_CARRIER'],recommendation_eligible:true},weekend_assessment:{version:'weekend-v1',work_hours:{start:'09:00:00',end:'17:00:00'},work_timezone:'Europe/Warsaw',actual_return_local_date:'2030-05-05',airport_arrival_day_offset:0,confidence:'KNOWN',calendar:'ELIGIBLE',flexible:'ELIGIBLE',stay:{version:'weekend-stay-v1',eligibility:'ELIGIBLE',airport_interval_minutes:2820,usable_minutes:1380,night_arrival:false,early_return:false,policy:{min_airport_minutes:1440,min_usable_minutes:720,arrival_buffer_minutes:120,departure_buffer_minutes:120},reasons:[]},no_leave:'ELIGIBLE',might_require_leave:false,airport_times_only:true,reasons:[]},...patch};
}
async function withFetch(fetcher,run){const original=globalThis.fetch;globalThis.fetch=fetcher;try{await run();}finally{globalThis.fetch=original;}}
test('three definitions use supported exact filters and round-trip catalog links',()=>{
 const definitions=homeCollectionDefinitions(' wro ');
 assert.deepEqual(definitions.map(x=>x.id),['calendar-weekend','under-300','upcoming-short']);
 for(const d of definitions){assert.equal(d.origin,'WRO');assert.equal(d.filters.round_trip,'true');assert.deepEqual(searchFilters(Object.fromEntries(new URL(d.href,'http://test').searchParams)),d.filters);assert.equal(d.filters.limit,undefined);}
 assert.equal(definitions[0].filters.weekend_mode,'calendar-v1');
 assert.equal(definitions[1].filters.budget,'300');assert.equal(definitions[2].filters.sort,'departure');
 assert.equal(homeCollectionDefinitions('')[0].filters.origin,'');
 for(const value of ['WAW,WMI','not-an-airport'])assert.throws(()=>homeCollectionDefinitions(value),RangeError);
 definitions[0].filters.budget='1';assert.equal(homeCollectionDefinitions('WRO')[0].filters.budget,undefined);
});
test('three concurrent API reads produce independent previews, preserving upstream order and no-store',async()=>{
 const queries=[];
 await withFetch(async(url,options)=>{queries.push(new URL(url).searchParams);assert.equal(options.cache,'no-store');return Response.json([deal(2),deal(1),deal(3),deal(4)]);},async()=>{
  const collections=await loadHomeCollections('WRO',now);
  assert.equal(queries.length,3);
  for(const q of queries){assert.equal(q.get('origin'),'WRO');assert.equal(q.get('limit'),'100');assert.equal(q.get('round_trip'),'true');}
  for(const c of collections){assert.equal(c.status,'READY');assert.deepEqual(c.offers.map(d=>d.id),[2,1,3]);assert.equal(c.more_in_preview,true);assert.equal(c.error,null);}
  assert.equal(collectionsMatchOrigin(collections,'wro'),true);assert.equal(collectionsMatchOrigin(collections,'KTW'),false);assert.equal(collectionsMatchOrigin(collections.slice(0,2),'WRO'),false);
 });
});
test('zero and one offer never fabricate content or total market counts',async()=>{
 for(const rows of [[],[deal()]])await withFetch(async()=>Response.json(rows),async()=>{
  const collections=await loadHomeCollections('WRO',now);
  for(const c of collections){assert.equal(c.status,rows.length?'READY':'EMPTY');assert.equal(c.offers.length,rows.length);assert.equal(c.more_in_preview,false);assert.equal('total' in c,false);}
 });
});
test('every home collection excludes overnight/long connections, insufficient and legacy decisions without backfill',()=>withFetch(async()=>Response.json([
 deal(1,{trip_quality:planningQuality({planning_eligible:false,warnings_severity:'CRITICAL',reasons:['OVERNIGHT_CONNECTION','LONG_CONNECTION']})}),
 deal(2,{trip_quality:planningQuality({planning_eligible:false,data_confidence:'INSUFFICIENT'})}),
 deal(3,{trip_quality:undefined}),deal(4),
]),async()=>{
 for(const c of await loadHomeCollections('WRO',now))assert.deepEqual(c.offers.map(d=>d.id),[4]);
}));
test('only unsafe candidates yield honest EMPTY previews, preserving general-catalog links',()=>withFetch(async()=>Response.json([
 deal(1,{trip_quality:planningQuality({planning_eligible:false,warnings_severity:'CRITICAL'})}),
]),async()=>{
 for(const c of await loadHomeCollections('WRO',now)){
  assert.equal(c.status,'EMPTY');assert.equal(c.offers.length,0);
  assert.match(c.href,/^\/deals\?/);assert.equal(c.more_in_preview,false);
 }
}));
test('budget is inclusive to the grosz and concerns flight per person, not a whole trip',()=>withFetch(async()=>Response.json([deal(1,{price_per_person_pln:'299.99'}),deal(2,{price_per_person_pln:'300.00'}),deal(3,{price_per_person_pln:'300.01'})]),async()=>{
 const collections=await loadHomeCollections('WRO',now);
 assert.deepEqual(collections.find(c=>c.id==='under-300').offers.map(d=>d.id),[1,2]);
 assert.equal(collections.find(c=>c.id==='upcoming-short').offers.length,3);
}));
test('quality, origin, return type, expiry and bounded nights are safety guards, not a second ranking',()=>withFetch(async()=>Response.json([
 deal(1,{origin_code:'KTW'}),deal(2,{trip_type:'ONE_WAY'}),deal(3,{flight_quality:undefined}),deal(4,{flight_quality:{version:'flight-quality-v1',status:'CRITICAL_INCOMPLETE',recommendation_eligible:false,reasons:['UNVERIFIED_SOURCE']}}),deal(5,{expires_at:'2030-04-01T00:00:00Z'}),deal(6,{trip_start:'2030-03-28',trip_end:'2030-03-30'}),deal(7,{trip_end:'2030-05-10'}),deal(8),deal(8),
]),async()=>{
 const collections=await loadHomeCollections('WRO',now);
 assert.deepEqual(collections.find(c=>c.id==='under-300').offers.map(d=>d.id),[8]);
 assert.deepEqual(collections.find(c=>c.id==='calendar-weekend').offers.map(d=>d.id),[7,8]);
}));
test('all-airport request remains explicit and permits several origins',()=>withFetch(async()=>Response.json([deal(1),deal(2,{origin_code:'KTW'})]),async()=>{
 const collections=await loadHomeCollections('',now);assert.equal(collections[0].offers.length,2);assert.equal(collectionsMatchOrigin(collections,''),true);
}));
test('one failed exact weekend request does not erase successful or empty collections',()=>withFetch(async url=>{
 const q=new URL(url).searchParams;
 return q.has('weekend_mode')?Response.json({detail:{code:'WEEKEND_QUERY_TOO_BROAD'}},{status:422}):Response.json(q.has('budget')?[deal()]:[]);
},async()=>{
 const [weekend,budget,upcoming]=await loadHomeCollections('WRO',now);
 assert.equal(weekend.status,'ERROR');assert.equal(weekend.error,'QUERY_TOO_BROAD');assert.equal(budget.status,'READY');assert.equal(upcoming.status,'EMPTY');
}));
test('unsupported weekend semantics, malformed responses and failures are errors, never empty inventory',()=>withFetch(async url=>{
 const q=new URL(url).searchParams;
 if(q.has('weekend_mode'))return Response.json([deal(1,{weekend_assessment:undefined})]);
 if(q.has('budget'))return Response.json({items:[]});
 throw new Error('private upstream diagnostics');
},async()=>{
 const collections=await loadHomeCollections('WRO',now);
 assert.ok(collections.every(c=>c.status==='ERROR'&&c.error==='UNAVAILABLE'&&c.offers.length===0));assert.ok(!JSON.stringify(collections).includes('private'));
}));
test('the first 100 rows are only a bounded preview; a later eligible row is not silently scanned',()=>withFetch(async()=>Response.json([...Array.from({length:100},(_,i)=>deal(i,{origin_code:'KTW'})),deal(101)]),async()=>{
 const collections=await loadHomeCollections('WRO',now);assert.ok(collections.every(c=>c.status==='EMPTY'&&c.candidate_limit===100));
}));
test('concurrent airport switches cannot relabel an older snapshot',async()=>{
 let release;const gate=new Promise(resolve=>{release=resolve;});
 await withFetch(async url=>{const origin=new URL(url).searchParams.get('origin');if(origin==='WRO')await gate;return Response.json([deal(1,{origin_code:origin})]);},async()=>{
  const old=loadHomeCollections('WRO',now),current=await loadHomeCollections('KTW',now);
  assert.equal(collectionsMatchOrigin(current,'KTW'),true);release();const previous=await old;
  assert.equal(collectionsMatchOrigin(previous,'KTW'),false);assert.ok(previous.every(c=>c.offers[0].origin_code==='WRO'));
 });
});
test('round-trip search normalization, removal and canonical semantics preserve explicit intent',()=>{
 assert.equal(searchFilters({round_trip:'yes'}).round_trip,'true');
 assert.equal(searchFilters(Object.fromEntries(new URL(searchUrl('/deals',{round_trip:'true',budget:'300'}),'http://test').searchParams)).round_trip,'true');
 assert.equal(searchSeo({round_trip:'false'}).canonical,'/deals');assert.equal(searchSeo({round_trip:'true'}).index,false);
});

test('recommendations exclude unsuitable, unknown and legacy stays; weekend additionally excludes leave and Monday arrival',()=>{
 const assessment=deal().weekend_assessment;
 return withFetch(async()=>Response.json([
  deal(1,{weekend_assessment:{...assessment,stay:{...assessment.stay,eligibility:'INELIGIBLE',night_arrival:true,reasons:['NIGHT_ARRIVAL']}}}),
  deal(2,{weekend_assessment:{...assessment,stay:{...assessment.stay,eligibility:'UNKNOWN'}}}),
  deal(3,{weekend_assessment:{...assessment,stay:undefined}}),
  deal(4,{weekend_assessment:{...assessment,no_leave:'INELIGIBLE',might_require_leave:true}}),
  deal(5,{weekend_assessment:{...assessment,no_leave:'INELIGIBLE',actual_return_local_date:'2030-05-06'}}),
  deal(6),
 ]),async()=>{
  const [weekend,budget,upcoming]=await loadHomeCollections('WRO',now);
  assert.deepEqual(weekend.offers.map(d=>d.id),[6]);
  for(const collection of [budget,upcoming])assert.deepEqual(collection.offers.map(d=>d.id),[4,5,6]);
 });
});
