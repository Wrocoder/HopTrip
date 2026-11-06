import test from 'node:test';
import assert from 'node:assert/strict';
import {airportNoticeLines,airportContexts,airportContextCopy,isAirportContext,airportSource} from '../src/lib/airport-context.ts';
export const relation={airport:'BGY',destination_slug:'milan',target_city:'Milan',status:'KNOWN',distance_km:45,distance_basis:'PUBLISHER_UNSPECIFIED',source:'https://www.milanbergamoairport.it/en/airport-infrastructure/',last_verified_at:'2026-11-03',remote:true,travel_minutes:null,travel_estimate_status:'UNKNOWN'};
export const context={version:'airport-context-v1',itinerary_verified:true,arrival:relation,return_departure:relation,different_destination_airports:false,different_home_airports:false,arrival_local_time:'22:30:00',return_departure_local_time:'07:00:00',arrival_time_estimated:true,warnings:['REMOTE_ARRIVAL_AIRPORT','LATE_ARRIVAL','EARLY_RETURN_DEPARTURE','TRANSFER_TIME_UNKNOWN'],remote_from_km:40,metadata_max_age_days:180,late_arrival_from:'22:00',early_arrival_before:'06:00',early_return_departure_before:'08:00',limitations:[]};
for(const locale of ['pl','en','ru','uk'])test(`${locale}: remote/late/early/estimated remain separate from unknown transfer and airport switch`,()=>{
 const c=airportContextCopy[locale],deal={airport_context:context};
 assert.equal(airportContexts(deal).length,1);
 const lines=airportNoticeLines(deal,locale);
 assert.equal(lines.filter(x=>x.includes('≈45 km')).length,1);
 assert.ok(lines.some(x=>x.includes(c.late)&&x.includes('22:30')&&x.includes(c.estimated)));
 assert.ok(lines.some(x=>x.includes(c.earlyReturn)&&x.includes('07:00')));
 assert.equal(lines.at(-1),c.unknown);
 assert.deepEqual(airportNoticeLines({},locale),[c.unknown]);
 assert.deepEqual(airportNoticeLines({airport_context:{...context,itinerary_verified:false}},locale),[c.unknown]);
 const stale={...relation,status:'STALE',distance_km:null,distance_basis:null,remote:null};
 const staleLines=airportNoticeLines({airport_context:{...context,arrival:stale,return_departure:stale,warnings:[]}},locale);
 assert.deepEqual(staleLines,[c.stale,c.unknown]);
 assert.equal(staleLines.some(x=>x.includes('45')),false);
 const near={...relation,target_city:'Bergamo',destination_slug:'bergamo',distance_km:5,remote:false};
 assert.deepEqual(airportNoticeLines({airport_context:{...context,arrival:near,return_departure:near,warnings:[]}},locale),[c.unknown]);
});
test('v1 contract rejects unsafe source, invented transfer, inconsistent distance and unknown policies',()=>{
 assert.equal(isAirportContext(context),true);
 for(const patch of [{source:'javascript:alert(1)'},{source:'https://user:secret@example.com'},{distance_km:-1},{distance_km:NaN},{distance_km:5},{remote:false},{travel_minutes:0},{last_verified_at:'2030-02-30'},{status:'STALE'}])assert.equal(isAirportContext({...context,arrival:{...relation,...patch}}),false,JSON.stringify(patch));
 for(const patch of [{version:'unsupported'},{arrival_local_time:'26:00:00'},{remote_from_km:0},{warnings:['UNREVIEWED_CODE']},{return_departure:undefined}])assert.equal(isAirportContext({...context,...patch}),false);
 assert.equal(airportSource('https://example.com/path'),'https://example.com/path');
 assert.equal(airportSource('http://example.com'),null);
});
