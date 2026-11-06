import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),modules=new Map();
function load(file){
 if(modules.has(file))return modules.get(file).exports;
 const loaded={exports:{}};modules.set(file,loaded);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name.endsWith('.ts')?name:name+'.ts')):require(name),loaded,loaded.exports);return loaded.exports;
}
const {destinationAlternatives,loadDestinationRecovery}=load(path.resolve('src/lib/destination-recovery.ts'));
const now=Date.parse('2030-04-01T00:00:00Z');
const target={id:1,slug:'milan',city:'Milan',country:'Italy',country_code:'IT',is_active:true};
const destinations=[target,{...target,id:2,slug:'rome'},{...target,id:3,slug:'barcelona',country_code:'ES'},{...target,id:4,slug:'athens',country_code:'GR'},{...target,id:5,slug:'prague',country_code:'CZ'}];
function offer(id=1,destination=destinations[1],patch={}){
 return {id,slug:'synthetic-'+id,trip_start:'2030-05-03',trip_end:'2030-05-05',origin_airport_id:1,destination_id:destination.id,origin_code:'WRO',origin_city:'Wrocław',destination_city:destination.city,destination_slug:destination.slug,destination_country_code:destination.country_code,trip_type:'ROUND_TRIP',price_basis:'FLIGHT_PER_PERSON',components:[],flight_price_pln:'200',hotel_price_pln:null,total_estimated_pln:'200',price_per_person_pln:'200',historical_baseline_pln:null,discount_percent:null,deal_score:0,confidence:'0',explanation_codes:[],score_version:'synthetic',score_components:{},last_verified_at:'2030-04-01T00:00:00Z',expires_at:'2030-04-01T02:00:00Z',flight_quality:{version:'flight-quality-v1',status:'PARTIAL',reasons:['UNKNOWN_CARRIER'],recommendation_eligible:true},...patch};
}
async function withFetch(fetcher,run){const original=globalThis.fetch;globalThis.fetch=fetcher;try{await run();}finally{globalThis.fetch=original;}}
test('same-country cities precede other countries, with integer-grosz order and one offer per destination',()=>{
 const rows=[offer(2,destinations[2],{price_per_person_pln:'99.99'}),offer(1),offer(3,undefined,{price_per_person_pln:'199.99'}),offer(4,destinations[3]),offer(5,destinations[4])];
 const before=JSON.stringify(rows);assert.deepEqual(destinationAlternatives(target,destinations,rows,now).map(row=>row.id),[3,2,4]);assert.equal(JSON.stringify(rows),before);
});
test('alternatives exclude the target, unknown/inactive registry cities, stale, one-way and unverified observations',()=>{
 const rows=[offer(1,target),offer(2,undefined,{destination_id:999}),offer(3,undefined,{destination_slug:'missing'}),offer(4,undefined,{expires_at:new Date(now).toISOString()}),offer(5,undefined,{trip_type:'ONE_WAY'}),offer(6,undefined,{flight_quality:undefined}),offer(7,undefined,{price_per_person_pln:'unknown'}),offer(8,undefined,{trip_start:'2030-03-01'}),offer(9)];
 assert.deepEqual(destinationAlternatives(target,destinations,rows,now).map(row=>row.id),[9]);
 assert.deepEqual(destinationAlternatives(target,destinations.map(d=>({...d,is_active:false})),[offer()],now),[]);
 assert.deepEqual(destinationAlternatives(target,destinations,[offer(1,undefined,{price_freshness:{hidden_after:new Date(now-1).toISOString()}})],now),[]);
});
test('the candidate/display bounds do not invent replacements or global availability counts',()=>{
 assert.deepEqual(destinationAlternatives(target,destinations,[],now),[]);
 const rows=Array.from({length:100},(_,i)=>offer(i,target)).concat(offer(101));assert.deepEqual(destinationAlternatives(target,destinations,rows,now),[]);
 const selected=destinationAlternatives(target,destinations,destinations.slice(1).map((d,i)=>offer(i,d)),now);assert.equal(selected.length,3);
});
test('related catalogue failure is isolated; alert opt-in requires both registration and delivery to be active',async()=>{
 for(const flags of [{enabled:false,delivery_enabled:false},{enabled:true,delivery_enabled:false},{enabled:true},{enabled:true,delivery_enabled:true}]){
  const queries=[];await withFetch(async(url,options)=>{assert.equal(options.cache,'no-store');const parsed=new URL(url);queries.push(parsed);return parsed.pathname.endsWith('/alerts/status')?Response.json(flags):Response.json({detail:'Synthetic outage'},{status:503});},async()=>{
   const result=await loadDestinationRecovery(target,destinations,now);assert.equal(result.status,'ERROR');assert.deepEqual(result.offers,[]);assert.equal(result.alertsActive,flags.delivery_enabled===true);
   const query=queries.find(url=>url.pathname.endsWith('/deals')).searchParams;assert.equal(query.get('limit'),'100');assert.equal(query.get('round_trip'),'true');assert.equal(query.get('sort'),'price');assert.equal(query.has('destination'),false);
  });
 }
});
test('missing alerts cannot hide real alternatives; valid empty is distinct from unavailable',async()=>{
 for(const rows of [[],[offer()]])await withFetch(async url=>new URL(url).pathname.endsWith('/alerts/status')?Response.json({detail:'Unavailable'},{status:503}):Response.json(rows),async()=>{
  const result=await loadDestinationRecovery(target,destinations,now);assert.equal(result.status,rows.length?'READY':'EMPTY');assert.equal(result.alertsActive,false);assert.equal(result.offers.length,rows.length);assert.equal('total' in result,false);
 });
});
