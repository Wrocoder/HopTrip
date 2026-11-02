import {test} from 'node:test';
import assert from 'node:assert/strict';
import {flightLocalCalendarDate} from '../src/lib/flight-facts.ts';
import {staySuggestion,applyStaySuggestion} from '../src/lib/stay-context.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
import {stay22Link} from '../src/lib/accommodation-links.ts';
import {stayCopy,stayText} from '../src/lib/i18n/stay-copy.ts';

const deal={trip_type:'ROUND_TRIP',flight_quality:{version:'flight-quality-v1',status:'PARTIAL'},flight_facts:{
 outbound_arrival:'2030-05-02T00:30:00Z',destination_timezone:'Europe/Madrid',outbound_arrival_calculated:true,
 return_departure:'2030-05-04T21:30:00Z',return_origin_timezone:'Europe/Madrid',
 return_arrival:'2030-05-05T00:30:00Z',return_destination_timezone:'Europe/Warsaw',
}};
const draft={version:1,input:{...emptyBudget,people:'2',flight:'213',hotel_basis:'stay',hotel_total:'900',other:'13.50',nights:'3',days:'4'},start:'2030-05-01',end:'2030-05-04',context:'user',review:false,adultsOnly:true,events:[]};

test('overnight arrival starts the stay locally; next-day arrival home does not add a hotel night',()=>{
 assert.deepEqual(staySuggestion(deal),{checkin:'2030-05-02',checkout:'2030-05-04',estimated:true});
});
test('local dates use real zones across DST and the date line, not UTC calendar days',()=>{
 assert.equal(flightLocalCalendarDate('2026-03-28T23:30:00Z','Europe/Warsaw'),'2026-03-29');
 assert.equal(flightLocalCalendarDate('2026-03-29T22:30:00Z','Europe/Warsaw'),'2026-03-30');
 assert.equal(flightLocalCalendarDate('2030-05-01T11:00:00Z','Pacific/Kiritimati'),'2030-05-02');
 assert.equal(flightLocalCalendarDate('2030-05-01T11:00:00Z','Pacific/Pago_Pago'),'2030-05-01');
});
test('unknown zones, naive clocks, invalid dates and out-of-contract years do not invent local dates',()=>{
 for(const value of [null,'2030-05-02','2030-05-02T00:30:00','2030-02-30T00:30:00Z'])assert.equal(flightLocalCalendarDate(value,'Europe/Madrid'),null);
 for(const zone of [null,'','Mars/Phobos'])assert.equal(flightLocalCalendarDate('2030-05-02T00:30:00Z',zone),null);
 assert.equal(flightLocalCalendarDate('0001-01-01T00:30:00Z','America/New_York'),null);
 assert.equal(flightLocalCalendarDate('9999-12-31T23:30:00Z','Pacific/Kiritimati'),null);
 assert.equal(flightLocalCalendarDate('0001-01-02T12:00:00Z','UTC'),'0001-01-02');
});
test('return origin uses its own zone and unknown return zones never copy the outbound zone',()=>{
 assert.equal(staySuggestion({...deal,flight_facts:{...deal.flight_facts,return_departure:'2030-05-04T22:30:00Z',return_origin_timezone:'Europe/London'}}).checkout,'2030-05-04');
 assert.equal(staySuggestion({...deal,flight_facts:{...deal.flight_facts,return_origin_timezone:null}}).checkout,null);
 for(const quality of [undefined,{version:'future',status:'PARTIAL'},{version:'flight-quality-v1',status:'CRITICAL_INCOMPLETE'}])assert.deepEqual(staySuggestion({...deal,flight_quality:quality}),{checkin:null,checkout:null,estimated:false});
});
test('explicit application changes only suggested dates, duration counts and review, preserving entered money and people',()=>{
 const original=JSON.stringify(draft),next=applyStaySuggestion(draft,staySuggestion(deal));
 assert.equal(JSON.stringify(draft),original);
 assert.deepEqual(next,{...draft,start:'2030-05-02',review:true,input:{...draft.input,nights:'2',days:'3'}});
 assert.equal(next.events,draft.events);
});
test('one-way suggestion preserves manual checkout or leaves an unknown checkout empty',()=>{
 const suggestion=staySuggestion({...deal,trip_type:'ONE_WAY'});
 assert.equal(suggestion.checkout,null);
 assert.equal(applyStaySuggestion({...draft,end:'2030-05-06'},suggestion).end,'2030-05-06');
 const unknown=applyStaySuggestion({...draft,end:''},suggestion);
 assert.equal(unknown.end,'');assert.equal(unknown.input.nights,'');assert.equal(unknown.input.days,'');
});
test('same-day schedule does not silently invent a night or a searchable stay',()=>{
 const next=applyStaySuggestion(draft,{checkin:'2030-05-02',checkout:'2030-05-02',estimated:false});
 assert.equal(next.input.nights,'0');assert.equal(next.input.days,'1');
 assert.equal(stay22Link({city:'Barcelona',checkin:next.start,checkout:next.end,adults:next.input.people}),null);
});
test('all stay context copy is localized without changing the provider name',()=>{
 for(const key of Object.keys(stayCopy))for(const locale of ['pl','en','ru','uk']){
  assert.ok(stayText(locale,key).trim());
  if(key.includes('Stay22'))assert.ok(stayText(locale,key).includes('Stay22'));
 }
});
