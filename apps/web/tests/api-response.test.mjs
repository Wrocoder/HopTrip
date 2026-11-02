import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDeal,isDealResults,isAirports,isDestinations,isEventResults,isAlertReply} from '../src/lib/api-contract.ts';

// Synthetic contract fixtures, never published prices or inventory.
const deal={id:1,slug:'test-only',trip_start:'2030-05-01',trip_end:'2030-05-03',origin_airport_id:1,destination_id:1,
 origin_code:'WRO',origin_city:'Test origin',destination_city:'Test destination',destination_slug:'test-only',trip_type:'ROUND_TRIP',price_basis:'FLIGHT_PER_PERSON',
 components:[],flight_price_pln:'200.00',hotel_price_pln:null,total_estimated_pln:'200.00',price_per_person_pln:'200.00',historical_baseline_pln:null,discount_percent:null,
 deal_score:0,confidence:'0',explanation_codes:[],score_version:'legacy',score_components:{},last_verified_at:'2026-11-01T00:00:00Z',expires_at:null};
const event={id:'test-only',name:'Test-only event',category:'OTHER',venue:'',city:'',start_date:'2030-05-01',end_date:null,local_time:null,timezone:'',status:'unknown',url:'https://example.test',price_from:null,currency:null};
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
