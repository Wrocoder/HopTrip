import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDeal,isDealResults,isAirports,isDestinations,isEventResults,isAlertReply} from '../src/lib/api-contract.ts';

// Synthetic contract fixtures, never published prices or inventory.
const deal={id:1,slug:'test-only',trip_start:'2030-05-01',trip_end:'2030-05-03',origin_airport_id:1,destination_id:1,
 origin_code:'WRO',origin_city:'Test origin',destination_city:'Test destination',destination_slug:'test-only',trip_type:'ROUND_TRIP',price_basis:'FLIGHT_PER_PERSON',
 components:[],flight_price_pln:'200.00',hotel_price_pln:null,total_estimated_pln:'200.00',price_per_person_pln:'200.00',historical_baseline_pln:null,discount_percent:null,
 deal_score:0,confidence:'0',explanation_codes:[],score_version:'legacy',score_components:{},last_verified_at:'2026-11-01T00:00:00Z',expires_at:null};
const event={id:'test-only',name:'Test-only event',category:'OTHER',venue:'',city:'',start_date:'2030-05-01',end_date:null,local_time:null,timezone:'',status:'unknown',url:'https://example.test',price_from:null,currency:null};

test('trip quality contract enforces separate score, missing parts and reproducible totals',()=>{
 const weights={completeness:15,travel:20,usable_time:30,connections:15,airports:10,leave:10};
 const policy={weights,good_travel_minutes:240,bad_travel_minutes:1440,target_usable_minutes:1680,
  inconvenient_stay_percent:50,night_home_travel_percent:50,connection_penalty_percent:20,long_connection_penalty_percent:40,night_connection_penalty_percent:25,risky_connection_penalty_percent:50,airport_change_penalty_percent:50};
 const q={version:'trip-quality-v1',status:'KNOWN',score:100,policy,reasons:[],components:Object.entries(weights).map(([key,max])=>({key,points:max,max_points:max,known:true}))};
 assert.equal(isDeal({...deal,trip_quality:q,trip_quality_score:100}),true);
 assert.equal(isDeal({...deal,trip_quality:{...q,status:'UNKNOWN',score:null,components:[]},trip_quality_score:null}),true);
 for(const patch of [{trip_quality_score:99},{trip_quality_score:101},{trip_quality:{...q,score:99}},
  {trip_quality:{...q,components:q.components.slice(1)}},
  {trip_quality:{...q,components:q.components.map(c=>({...c,known:false}))}},
  {trip_quality:{...q,policy:{...policy,target_usable_minutes:0}}}])assert.equal(isDeal({...deal,trip_quality:q,trip_quality_score:100,...patch}),false);
 assert.equal(isDeal(deal),true);
});

test('connection assessment is additive and malformed facts/protection claims fail closed',()=>{
 const connection={direction:'OUTBOUND',after_leg:1,arrival_airport:'BER',departure_airport:'BER',duration_minutes:360,
  overnight:false,airport_change:false,long_layover:true,risky_transfer:false,protection:'UNKNOWN'};
 const assessment={version:'connections-v1',status:'KNOWN',policy:{long_layover_minutes:360,short_transfer_minutes:90},connections:[connection],unknown_directions:[]};
 assert.equal(isDeal({...deal,connection_assessment:assessment}),true);
 for(const patch of [{duration_minutes:-1},{duration_minutes:'360'},{overnight:'false'},{arrival_airport:'Bad'},{after_leg:0},{protection:'PROTECTED'},{direction:'OTHER'}]){
  assert.equal(isDeal({...deal,connection_assessment:{...assessment,connections:[{...connection,...patch}]}}),false);
 }
 assert.equal(isDeal({...deal,connection_assessment:{...assessment,policy:{...assessment.policy,long_layover_minutes:0}}}),false);
 assert.equal(isDeal({...deal,connection_assessment:{...assessment,unknown_directions:['OTHER']}}),false);
 assert.equal(isDeal(deal),true);
});

test('additive stay policy accepts legacy absence and rejects malformed present recommendation facts',()=>{
 const assessment={version:'weekend-v1',work_hours:{start:'09:00:00',end:'17:00:00'},work_timezone:'Europe/Warsaw',actual_return_local_date:'2030-05-05',airport_arrival_day_offset:0,confidence:'KNOWN',calendar:'ELIGIBLE',flexible:'ELIGIBLE',no_leave:'ELIGIBLE',might_require_leave:false,airport_times_only:true,reasons:[]};
 const stay={version:'weekend-stay-v1',eligibility:'ELIGIBLE',airport_interval_minutes:2820,usable_minutes:1380,night_arrival:false,early_return:false,reasons:[],policy:{min_airport_minutes:1440,min_usable_minutes:720,arrival_buffer_minutes:120,departure_buffer_minutes:120}};
 assert.equal(isDeal({...deal,weekend_assessment:assessment}),true);
 assert.equal(isDeal({...deal,weekend_assessment:{...assessment,stay}}),true);
 for(const patch of [{usable_minutes:-1},{usable_minutes:'1380'},{night_arrival:'false'},{policy:null},{reasons:null},{version:'unsupported'}]){
  assert.equal(isDeal({...deal,weekend_assessment:{...assessment,stay:{...stay,...patch}}}),false);
 }
});
test('legacy deal omits optional facts honestly; additive fields are retained',()=>{
 const value={...deal,new_server_field:{value:true}};assert.equal(isDeal(value),true);assert.equal('flight_facts' in value,false);
 for(const patch of [{components:null},{price_per_person_pln:200},{events_supported:'false'},{trip_start:'2030-02-30'},{score_components:[]},{flight_facts:{outbound_legs:'bad'}},{flight_quality:{status:'COMPLETE'}},{score_explanation:{status:'CURRENT',parts:null}}])assert.equal(isDeal({...deal,...patch}),false,JSON.stringify(patch));
});
test('page consistency never infers a total or inserts a missing item',()=>{
 assert.equal(isDealResults({items:[deal],total:25,offset:24,limit:12}),true);
 for(const patch of [{total:24},{limit:0},{items:[null]},{items:[] ,total:'25'}])assert.equal(isDealResults({items:[deal],total:25,offset:24,limit:12,...patch}),false);
});
test('optional registry aliases may be absent but cannot replace arrays with strings',()=>{
 const airport={id:1,iata_code:'WRO',name:'Test',city:'Test',country_code:'PL',is_active:true};
 const destination={id:1,slug:'test-only',city:'Test',country:'Test',country_code:'PL',is_active:true};
 assert.equal(isAirports([airport]),true);assert.equal(isDestinations([destination]),true);
 assert.equal(isAirports([{...airport,aliases:'WRO'}]),false);assert.equal(isDestinations([{...destination,iata_codes:null}]),false);
});
test('minimal event response tolerates absent optional metadata without making it up',()=>{
 const value={status:'READY',events:[event]};assert.equal(isEventResults(value),true);assert.equal('total' in value,false);assert.equal('checked_at' in value,false);
 assert.equal(isEventResults({status:'EMPTY',events:[]}),true);
});
test('malformed event rows, fit and currency cannot escape into render',()=>{
 for(const patch of [{events:null},{events:[null]},{events:[{...event,currency:'NOT-ISO',price_from:'12'}]},
  {events:[{...event,ticket_options:{length:2}}]},{events:[{...event,local_time:'25:90'}]},
  {events:[{...event,price_from:'not a price'}]},{flight_fit:{'test-only':{status:'CHECK',reasons:null}}},{total:'1'},{page_size:0},{page:0},{has_more:'false'}])assert.equal(isEventResults({status:'READY',events:[event],...patch}),false,JSON.stringify(patch));
});
test('event page bounds retain empty pages beyond total and reject contradictory nonempty pages',()=>{
 assert.equal(isEventResults({status:'EMPTY',events:[],total:1,page:2,page_size:12}),true);
 assert.equal(isEventResults({status:'READY',events:[event],total:1,page:2,page_size:12}),false);
});
test('alert mutations require their actual success shape before UI status changes',()=>{
 const filters={origin:'WRO',budget:'200.00',duration_min:0,duration_max:14,destination:null,departure_from:null,departure_to:null,weekend:false,frequency:'weekly'};
 assert.equal(isAlertReply('/confirm',{token:'test-only'}),true);assert.equal(isAlertReply('/confirm',{token:null}),false);
 assert.equal(isAlertReply('/manage',{status:'ACTIVE',filters}),true);
 for(const value of [{status:'ACTIVE',filters:null},{status:'ACTIVE',filters:{...filters,weekend:'false'}},{status:'ACTIVE',filters:{...filters,duration_max:-1}}])assert.equal(isAlertReply('/manage',value),false);
 assert.equal(isAlertReply('/unsubscribe',{status:'ACTIVE'}),false);assert.equal(isAlertReply('/unsubscribe',{status:'STOPPED'}),true);
 assert.equal(isAlertReply('',{message:'Test-only acknowledgement'}),true);assert.equal(isAlertReply('',{}),false);
});
