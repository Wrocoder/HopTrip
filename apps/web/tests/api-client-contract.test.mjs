import {test} from 'node:test';
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
 vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name.endsWith('.ts')?name:name+'.ts')):require(name),loaded,loaded.exports);
 return loaded.exports;
}
const api=load(path.resolve('src/lib/api.ts'));
async function withFetch(request,run){const original=globalThis.fetch;globalThis.fetch=request;try{await run();}finally{globalThis.fetch=original;}}
const failure=(status,code)=>error=>error instanceof api.ApiError&&error.status===status&&error.code===code;

test('malformed 200 catalog page is an unavailable response, never an empty result',()=>withFetch(async()=>Response.json({items:null,total:0,offset:0,limit:12}),async()=>{
 await assert.rejects(api.getDealResults(),failure(502,'INVALID_RESPONSE'));
}));
test('weekend mode and hours reach API without silently dropping exact conditions',()=>withFetch(async input=>{
 const q=new URL(String(input)).searchParams;
 assert.equal(q.get('weekend_mode'),'no-leave-v1');assert.equal(q.get('work_start'),'07:00');assert.equal(q.get('work_end'),'15:00');
 return Response.json({items:[],total:0,offset:0,limit:12});
},async()=>{await api.getDealResults({weekend_mode:'no-leave-v1',work_start:'07:00',work_end:'15:00',limit:'12'});}));
test('too broad weekend error keeps a stable distinct API code',()=>withFetch(async()=>Response.json({detail:{code:'WEEKEND_QUERY_TOO_BROAD'}},{status:422}),async()=>{
 await assert.rejects(api.getDealResults({weekend_mode:'no-leave-v1'}),failure(422,'WEEKEND_QUERY_TOO_BROAD'));
}));
test('an older or inconsistent API cannot silently ignore an exact weekend mode',async()=>{
 const deal={id:1,slug:'synthetic',trip_start:'2030-11-01',trip_end:'2030-11-03',origin_airport_id:1,destination_id:1,
  origin_code:'WRO',origin_city:'Wrocław',destination_city:'London',destination_slug:'london',trip_type:'ROUND_TRIP',
  price_basis:'FLIGHT_PER_PERSON',components:[],flight_price_pln:'200',hotel_price_pln:null,total_estimated_pln:'200',price_per_person_pln:'200',
  historical_baseline_pln:null,discount_percent:null,deal_score:0,confidence:'0',explanation_codes:[],score_version:'synthetic',score_components:{},last_verified_at:'2030-10-01T00:00:00Z',expires_at:null};
 const assessment={version:'weekend-v1',work_hours:{start:'09:00:00',end:'17:00:00'},work_timezone:'Europe/Warsaw',actual_return_local_date:'2030-11-03',airport_arrival_day_offset:0,confidence:'KNOWN',calendar:'ELIGIBLE',flexible:'ELIGIBLE',no_leave:'ELIGIBLE',might_require_leave:false,airport_times_only:true,reasons:[]};
 const interval={version:'destination-time-v1',scope:'AIRPORT_ARRIVAL_TO_RETURN_DEPARTURE',status:'KNOWN',airport_interval_minutes:1200,arrival_airport:'BCN',departure_airport:'BCN',airport_change:false,reason:null,usable_city_minutes:null,city_time_status:'UNKNOWN',buffers_applied:false,sort_eligible:true};
 const relation={airport:'BGY',destination_slug:'london',target_city:'London',status:'KNOWN',distance_km:45,distance_basis:'PUBLISHER_UNSPECIFIED',source:'https://example.com/source',last_verified_at:'2026-11-03',remote:true,travel_minutes:null,travel_estimate_status:'UNKNOWN'};
 const airportContext={version:'airport-context-v1',itinerary_verified:true,arrival:relation,return_departure:null,different_destination_airports:null,different_home_airports:null,arrival_local_time:null,return_departure_local_time:null,arrival_time_estimated:false,warnings:['TRANSFER_TIME_UNKNOWN'],remote_from_km:40,metadata_max_age_days:180,late_arrival_from:'22:00',early_arrival_before:'06:00',early_return_departure_before:'08:00',limitations:[]};
 await withFetch(async()=>Response.json([{...deal,airport_context:airportContext}]),async()=>assert.equal((await api.getDeals()).length,1));
 for(const patch of [{version:'unsupported'},{arrival:{...relation,source:'javascript:alert(1)'}},{arrival:{...relation,destination_slug:'wrong-city'}},{arrival:{...relation,travel_minutes:0}}]){
  await withFetch(async()=>Response.json([{...deal,airport_context:{...airportContext,...patch}}]),async()=>{
   await assert.rejects(api.getDeals(),failure(502,'INVALID_RESPONSE'));
  });
 }
 await withFetch(async()=>Response.json([deal]),async()=>{
  await assert.rejects(api.getDeals({sort:'destination_time'}),failure(502,'DESTINATION_TIME_UNSUPPORTED'));
 });
 for(const patch of [{airport_interval_minutes:-1},{sort_eligible:false},{status:'ESTIMATED'},{usable_city_minutes:100},{airport_change:true},{status:'UNKNOWN'},{version:'unsupported'}]){
  await withFetch(async()=>Response.json([{...deal,destination_time:{...interval,...patch}}]),async()=>{
   await assert.rejects(api.getDeals(),failure(502,'INVALID_RESPONSE'));
  });
 }
 for(const intervalCase of [interval,{...interval,status:'ESTIMATED',sort_eligible:false},{...interval,status:'UNKNOWN',airport_interval_minutes:null,arrival_airport:null,departure_airport:null,airport_change:null,reason:'UNKNOWN_TIMEZONE',sort_eligible:false}]){
  await withFetch(async()=>Response.json([{...deal,destination_time:intervalCase}]),async()=>{
   assert.equal((await api.getDeals({sort:'destination_time'})).length,1);
  });
 }
 await withFetch(async()=>Response.json([deal]),async()=>{
  assert.equal((await api.getDeals()).length,1);
  await assert.rejects(api.getDeals({weekend_mode:'no-leave-v1'}),failure(502,'INVALID_RESPONSE'));
 });
 for(const patch of [{no_leave:'UNKNOWN'},{work_hours:{start:'07:00:00',end:'15:00:00'}},{airport_times_only:false}]){
  await withFetch(async()=>Response.json([{...deal,weekend_assessment:{...assessment,...patch}}]),async()=>{
   await assert.rejects(api.getDeals({weekend_mode:'no-leave-v1'}),failure(502,'INVALID_RESPONSE'));
  });
 }
 await withFetch(async()=>Response.json([{...deal,weekend_assessment:assessment}]),async()=>{
  assert.equal((await api.getDeals({weekend_mode:'no-leave-v1'})).length,1);
 });
});
test('unsupported sort and too-broad keep actionable codes, unrelated invalid dates do not masquerade as unsupported',async()=>{
 for(const [body,code] of [[{detail:[{loc:['query','sort'],type:'literal_error'}]},'DESTINATION_TIME_UNSUPPORTED'],[{detail:{code:'DESTINATION_TIME_QUERY_TOO_BROAD'}},'DESTINATION_TIME_QUERY_TOO_BROAD'],[{detail:[{loc:['query','departure_from']}]},undefined]]){
  await withFetch(async()=>Response.json(body,{status:422}),async()=>{
   await assert.rejects(api.getDeals({sort:'destination_time'}),failure(422,code));
  });
 }
});
test('200 null detail is not confused with a genuine 404',()=>withFetch(async()=>Response.json(null),async()=>{
 await assert.rejects(api.getDeal('test-only'),failure(502,'INVALID_RESPONSE'));
}));
test('malformed airport registry is rejected before a selector can use it',()=>withFetch(async()=>Response.json({items:[]}),async()=>{
 await assert.rejects(api.getAirports(),failure(502,'INVALID_RESPONSE'));
}));
test('malformed alert status fails closed instead of accepting a truthy string',()=>withFetch(async()=>Response.json({enabled:'false'}),async()=>{
 assert.deepEqual(await api.alertStatus(),{enabled:false,delivery_enabled:false});
}));
test('invalid JSON is classified without leaking its body',()=>withFetch(async()=>new Response('<private upstream diagnostics>',{status:200}),async()=>{
 await assert.rejects(api.getDeals(),error=>failure(502,'INVALID_RESPONSE')(error)&&!String(error).includes('private'));
}));
test('network rejection has a stable API error and is attempted only once',async()=>{
 let calls=0;await withFetch(async()=>{calls++;throw new TypeError('private upstream URL');},async()=>{
  await assert.rejects(api.getDeals(),failure(0,'NETWORK_ERROR'));
 });assert.equal(calls,1);
});
test('timeout rejection has a stable API error and is not retried',()=>withFetch(async()=>{throw new DOMException('Synthetic deadline','TimeoutError');},async()=>{
 await assert.rejects(api.getDeals(),failure(504,'TIMEOUT'));
}));
test('HTTP errors preserve status/code and genuine 404 detail remains null',async()=>{
 await withFetch(async()=>Response.json({detail:{code:'UNKNOWN_ORIGIN',message:'private input'}},{status:422}),async()=>{
  await assert.rejects(api.getDeals(),error=>failure(422,'UNKNOWN_ORIGIN')(error)&&!String(error).includes('private'));
 });
 await withFetch(async()=>new Response('Not JSON',{status:404}),async()=>assert.equal(await api.getDeal('missing'),null));
});
test('valid empty pages beyond total keep offset and do not invent results',()=>withFetch(async()=>Response.json({items:[],total:0,offset:24,limit:12}),async()=>{
 assert.deepEqual(await api.getDealResults({offset:'24',limit:'12'}),{items:[],total:0,offset:24,limit:12});
}));
test('invalid pagination metadata is rejected before rendering',async()=>{
 for(const patch of [{total:-1},{offset:0.5},{limit:0},{offset:10001},{limit:101},{has_more:'yes',items:null}])await withFetch(async()=>Response.json({items:[],total:0,offset:0,limit:12,...patch}),async()=>{
  await assert.rejects(api.getDealResults(),failure(502,'INVALID_RESPONSE'));
 });
});
test('an abort while consuming the body is classified as a timeout',()=>withFetch(async()=>({ok:true,json:async()=>{throw new DOMException('Synthetic body deadline','AbortError');}}),async()=>{
 await assert.rejects(api.getDeals(),failure(504,'TIMEOUT'));
}));
test('query allowlist, original decimals, no-store and encoded slugs are preserved',async()=>{
 await withFetch(async(url,options)=>{
  const parsed=new URL(url);assert.equal(options.cache,'no-store');assert.ok(options.signal instanceof AbortSignal);
  assert.equal(parsed.searchParams.get('origin'),'WRO');assert.equal(parsed.searchParams.get('budget'),'200.01');
  assert.equal(parsed.searchParams.has('private'),false);return Response.json([]);
 },async()=>assert.deepEqual(await api.getDeals({origin:'wro',budget:'200.01',private:'never sent'}),[]));
 await withFetch(async url=>{assert.ok(url.endsWith('/deals/a%2Fb%3Fc'));return new Response('',{status:404});},async()=>assert.equal(await api.getDeal('a/b?c'),null));
});
