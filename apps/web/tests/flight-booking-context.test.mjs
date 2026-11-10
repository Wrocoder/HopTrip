import test from 'node:test';
import assert from 'node:assert/strict';
import {flightBookingContext} from '../src/lib/flight-booking-context.ts';
const facts={origin_airport:'POZ',destination_airport:'PMF',return_origin_airport:'BGY',return_destination_airport:'POZ'};
for(const locale of ['pl','en','ru','uk'])test(`${locale}: booking checkpoint preserves both airports of an open-jaw itinerary`,()=>{
 const text=flightBookingContext(facts,locale);
 assert.ok(text.includes('POZ → PMF; BGY → POZ'));
 assert.ok(!text.includes('undefined'));
});
test('unknown, malformed and ordinary same-airport itineraries do not invent an open-jaw warning',()=>{
 assert.equal(flightBookingContext(undefined,'pl'),null);
 for(const patch of [{return_origin_airport:null},{origin_airport:'<script>'},
  {return_origin_airport:'PMF',return_destination_airport:'POZ'}]){
  assert.equal(flightBookingContext({...facts,...patch},'pl'),null);
 }
 assert.match(flightBookingContext({...facts,return_origin_airport:'PMF',return_destination_airport:'WAW'},'en'),/PMF → WAW/);
});
