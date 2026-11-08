import test from 'node:test';
import assert from 'node:assert/strict';
import {flightElapsedMinutes} from '../src/lib/flight-facts.ts';
import {stayWarnings,stayModelBasis} from '../src/lib/weekend-stay.ts';

test('journey duration uses elapsed instants across DST and date-line changes',()=>{
 for(const [departure,arrival,minutes] of [
  ['2030-03-31T01:00:00+01:00','2030-03-31T04:00:00+02:00',120],
  ['2030-10-27T01:30:00+02:00','2030-10-27T03:30:00+01:00',180],
  ['2030-01-01T23:30:00-10:00','2030-01-03T04:30:00+14:00',300],
  ['2030-06-01T10:00:00Z','2030-06-01T10:00:30Z',1],
 ])assert.equal(flightElapsedMinutes(departure,arrival),minutes);
});

test('unknown, invalid or reversed journey clocks never become a plausible duration',()=>{
 for(const [departure,arrival] of [
  [null,'2030-01-01T12:00:00Z'],['2030-01-01T10:00:00Z',null],
  ['2030-01-01','2030-01-01T12:00:00Z'],['2030-01-01T10:00:00','2030-01-01T12:00:00Z'],
  ['2030-02-30T10:00:00Z','2030-03-01T12:00:00Z'],
  ['2030-01-01T12:00:00Z','2030-01-01T10:00:00Z'],
  ['2030-01-01T12:00:00Z','2030-01-01T12:00:00Z'],
 ])assert.equal(flightElapsedMinutes(departure,arrival),null);
});

for(const locale of ['pl','en','ru','uk'])test(`${locale}: compact stay warnings keep every material warning while model assumptions remain available`,()=>{
 const deal={weekend_assessment:{stay:{version:'weekend-stay-v1',night_arrival:true,early_return:true,reasons:['INSUFFICIENT_STAY']}}};
 const full=stayWarnings(deal,locale),compact=stayWarnings(deal,locale,false);
 assert.equal(compact.length,3);assert.deepEqual(compact,full.slice(0,-1));
 assert.equal(full.at(-1),stayModelBasis(locale));assert.ok(stayModelBasis(locale).length>80);
 assert.deepEqual(stayWarnings({},locale,false),[]);
});
