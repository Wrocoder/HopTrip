import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectedOrigin} from '../src/lib/origin-preference.ts';
import {shortTripSelection} from '../src/lib/short-trip-selection.ts';
import {planningQuality} from './fixtures/planning-quality.mjs';

for(const [name,query,saved,codes,expected] of [
 ['first visit',undefined,undefined,['WRO'],''],
 ['saved valid code',undefined,'wro',['WRO'],'WRO'],
 ['explicit code wins','ktw','WRO',['WRO','KTW'],'KTW'],
 ['explicit clear wins','','WRO',['WRO'],''],
 ['stale cookie ignored',undefined,'ZZZ',['WRO'],''],
 ['unknown registry preserves saved code',undefined,'WRO',null,'WRO'],
 ['available empty registry',undefined,'WRO',[],''],
 ['explicit unknown goes to normal validation','ZZZ','WRO',['WRO'],'ZZZ'],
 ['duplicate query is not a saved preference',['WRO','KTW'],'WRO',['WRO'],''],
])test(`origin policy: ${name}`,()=>assert.equal(selectedOrigin(query,saved,codes),expected));

test('shared short-trip selection keeps origin, quality, round-trip and 2–4-night gates',()=>{
 const offer={slug:'good',origin_code:'KTW',trip_start:'2030-01-01',trip_end:'2030-01-03',trip_type:'ROUND_TRIP',
  trip_quality:planningQuality(),
  weekend_assessment:{stay:{version:'weekend-stay-v1',eligibility:'ELIGIBLE'}},
  flight_quality:{version:'flight-quality-v1',status:'PARTIAL',recommendation_eligible:true}};
 const input=[offer,{...offer,slug:'wrong-origin',origin_code:'WRO'},{...offer,slug:'long',trip_end:'2030-01-09'},
  {...offer,slug:'one-way',trip_type:'ONE_WAY'},{...offer,slug:'critical',flight_quality:{...offer.flight_quality,status:'CRITICAL_INCOMPLETE',recommendation_eligible:false}},
  {...offer,slug:'unknown-stay',weekend_assessment:undefined},
  {...offer,slug:'short-stay',weekend_assessment:{stay:{version:'weekend-stay-v1',eligibility:'INELIGIBLE'}}}];
 const before=structuredClone(input);
 assert.deepEqual(shortTripSelection(input,'KTW').map(d=>d.slug),['good']);
 assert.equal(shortTripSelection(Array(10).fill(offer),'').length,6);
 assert.deepEqual(input,before);
});
