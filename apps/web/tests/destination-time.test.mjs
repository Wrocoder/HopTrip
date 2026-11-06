import test from 'node:test';
import assert from 'node:assert/strict';
import {destinationTimeView,destinationTimeCopy} from '../src/lib/destination-time.ts';
import {searchFilters,searchSeo,searchUrl} from '../src/lib/search-policy.ts';
const known={version:'destination-time-v1',scope:'AIRPORT_ARRIVAL_TO_RETURN_DEPARTURE',status:'KNOWN',airport_interval_minutes:1200,arrival_airport:'BCN',departure_airport:'GRO',airport_change:true,reason:null,usable_city_minutes:null,city_time_status:'UNKNOWN',buffers_applied:false,sort_eligible:true};
for(const locale of ['pl','en','ru','uk'])test(`${locale}: airport interval, estimates, zero and old API keep city time unknown`,()=>{
 const c=destinationTimeCopy[locale];
 const rendered=destinationTimeView({destination_time:known},locale);
 assert.ok(rendered.includes('20')&&rendered.includes('BCN → GRO')&&rendered.includes(c.city));
 assert.ok(destinationTimeView({destination_time:{...known,status:'ESTIMATED',sort_eligible:false}},locale).includes(c.estimated));
 assert.ok(destinationTimeView({destination_time:{...known,airport_interval_minutes:0}},locale).includes('0'));
 assert.ok(destinationTimeView({},locale).includes(c.unknown));
 assert.ok(destinationTimeView({destination_time:{...known,status:'UNKNOWN',airport_interval_minutes:null}},locale).includes(c.unknown));
});
test('destination sort and pagination survive URLs and keep filtered canonical noindex',()=>{
 const f={sort:'destination_time',offset:'12',origin:'WRO',weekend_mode:'calendar-v1'};
 assert.deepEqual(searchFilters(Object.fromEntries(new URL(searchUrl('/deals',f),'http://test').searchParams)),f);
 assert.equal(searchSeo(f).index,false);
 assert.match(searchSeo(f).canonical,/sort=destination_time/);
});
