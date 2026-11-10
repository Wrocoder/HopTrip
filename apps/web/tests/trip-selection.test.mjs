import test from 'node:test';
import assert from 'node:assert/strict';
import {tripSelectionEligible} from '../src/lib/trip-selection.ts';
import {shortTripSelection} from '../src/lib/short-trip-selection.ts';
import {planningQuality} from './fixtures/planning-quality.mjs';

const deal={flight_quality:{version:'flight-quality-v1',status:'COMPLETE',recommendation_eligible:true},
 trip_quality:planningQuality(),origin_code:'WRO',trip_type:'ROUND_TRIP',trip_start:'2030-05-03',trip_end:'2030-05-05',
 weekend_assessment:{stay:{version:'weekend-stay-v1',eligibility:'ELIGIBLE'}}};
test('date/price previews admit explicitly labelled planning; convenience promises need independent confirmation',()=>{
 assert.equal(tripSelectionEligible(deal),true);
 assert.equal(tripSelectionEligible(deal,'convenient'),false);
 const convenient={...deal,trip_quality:planningQuality({recommendation_eligible:true,label:'CONVENIENT',data_confidence:'COMPLETE',warnings_severity:'NONE',reasons:[]})};
 assert.equal(tripSelectionEligible(convenient,'convenient'),true);
});
test('legacy, incomplete and critical routes do not become previews because of a high score',()=>{
 for(const q of [undefined,{...planningQuality(),recommendation:undefined},
  planningQuality({planning_eligible:false,data_confidence:'INSUFFICIENT'}),
  planningQuality({planning_eligible:true,warnings_severity:'CRITICAL',reasons:['OVERNIGHT_CONNECTION','LONG_CONNECTION']})]){
  const candidate={...deal,trip_quality:q};
  assert.equal(tripSelectionEligible(candidate),false);
  assert.deepEqual(shortTripSelection([candidate],'WRO'),[]);
 }
});
