import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineView,timelineCopy} from '../src/lib/trip-timeline.ts';
const f={outbound_arrival:'2030-05-04T01:30:00+02:00',destination_timezone:'Europe/Madrid',
 return_departure:'2030-05-05T23:30:00+02:00',return_origin_timezone:'Europe/Madrid',
 return_arrival:'2030-05-06T01:30:00+02:00',return_destination_timezone:'Europe/Warsaw',return_destination_airport:'KRK'};
for(const locale of ['pl','en','ru','uk'])test(`${locale}: legacy facts and authoritative timeline keep unknowns and actual airport`,()=>{
 const deal={trip_type:'ROUND_TRIP',trip_start:'2030-05-03',trip_end:'2030-05-05',flight_facts:f};
 const legacy=timelineView(deal,locale);
 assert.equal(legacy.nights,`${timelineCopy[locale].nights}: 1`);
 assert.match(legacy.arrival,/KRK/);assert.match(legacy.arrival,/\+1/);
 const timeline={version:'trip-timeline-v1',nights_at_destination:1,local_return_arrival_date:'2030-05-06',return_arrival_day_offset:1,nights_estimated:false,return_arrival_estimated:false};
 assert.deepEqual(timelineView({...deal,flight_facts:{...f,timeline}},locale),legacy);
 const unknown=timelineView({...deal,flight_facts:{...f,timeline:{...timeline,nights_at_destination:null,local_return_arrival_date:null,return_arrival_day_offset:null}}},locale);
 assert.equal(unknown.arrival,timelineCopy[locale].returnUnknown);
 assert.equal(unknown.nights,`${timelineCopy[locale].nights}: ${timelineCopy[locale].unknown}`);
 assert.equal(timelineView({...deal,flight_facts:{...f,return_destination_timezone:null}},locale).arrival,timelineCopy[locale].returnUnknown);
 assert.equal(timelineView({...deal,trip_type:'ONE_WAY'},locale).arrival,'');
});
