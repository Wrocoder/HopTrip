import test from 'node:test';
import assert from 'node:assert/strict';
import {tripDecisionRisks} from '../src/lib/trip-decision.ts';
import {returnAirportNotice} from '../src/lib/flight-facts.ts';
import {stayWarningEntries} from '../src/lib/weekend-stay.ts';
import {planningQuality} from './fixtures/planning-quality.mjs';

const facts={origin_airport:'WRO',destination_airport:'STN',return_origin_airport:'LTN',return_destination_airport:'WRO'};
const base={trip_type:'ROUND_TRIP',flight_facts:facts,components:[]};
const connection={direction:'RETURN',after_leg:1,arrival_airport:'LPL',departure_airport:'LPL',duration_minutes:920,
 overnight:true,airport_change:false,long_layover:true,risky_transfer:false,protection:'UNKNOWN'};
const assessment={version:'connections-v1',connections:[connection],unknown_directions:[]};
const stay={version:'weekend-stay-v1',night_arrival:true,early_return:true,reasons:['INSUFFICIENT_STAY']};

for(const locale of ['pl','en','ru','uk']){
 test(`${locale}: night arrival home remains an explicit risk alongside the actual return clock`,()=>{
  const quality=planningQuality({reasons:['NIGHT_HOME_ARRIVAL','TRANSFER_TIME_UNKNOWN']});
  const message={pl:'Powrót do domu w nocy.',en:'Night arrival home.',ru:'Возвращение домой ночью.',uk:'Повернення додому вночі.'}[locale];
  assert.ok(tripDecisionRisks({...base,trip_quality:quality},locale).includes(message));
 });
 test(`${locale}: decision retains the 920-minute night and every additional significant connection`,()=>{
  const risks=tripDecisionRisks({...base,connection_assessment:{...assessment,connections:[connection,{...connection,arrival_airport:'LHR',departure_airport:'LGW',airport_change:true,risky_transfer:true,duration_minutes:65}]}},locale);
  assert.match(risks[0],/LPL: 920/);
  assert.match(risks[1],/LHR → LGW: 65/);
  assert.ok(risks[0].includes(',')); // Both the long and night flags survive.
  assert.ok(risks[1].split(',').length>=4);
 });
 test(`${locale}: open-jaw notice is delegated only to an available airport checkpoint`,()=>{
  const notice=returnAirportNotice(facts,locale);
  assert.ok(tripDecisionRisks(base,locale).includes(notice));
  const flight={component_type:'FLIGHT',available:true,redirect_path:'/go/flight'};
  assert.ok(!tripDecisionRisks({...base,components:[flight]},locale).includes(notice));
  for(const change of [{available:false},{redirect_path:null},{component_type:'HOTEL'}])
   assert.ok(tripDecisionRisks({...base,components:[{...flight,...change}]},locale).includes(notice));
  const incomplete={...facts,origin_airport:null};
  assert.ok(tripDecisionRisks({...base,flight_facts:incomplete,components:[flight]},locale).includes(returnAirportNotice(incomplete,locale)));
 });
 test(`${locale}: concise airport clocks replace only duplicate stay warnings`,()=>{
  const deal={...base,weekend_assessment:{stay},airport_context:{itinerary_verified:true,warnings:['EARLY_ARRIVAL','EARLY_RETURN_DEPARTURE'],
   arrival_local_time:'01:00',return_departure_local_time:'05:55',arrival:{airport:'STN',status:'UNKNOWN'},return_departure:{airport:'LTN',status:'UNKNOWN'}}};
  const messages=stayWarningEntries(deal,locale);
  const risks=tripDecisionRisks(deal,locale);
  assert.ok(!risks.includes(messages[0].text));assert.ok(!risks.includes(messages[1].text));assert.ok(risks.includes(messages[2].text));
  assert.ok(risks.some(text=>text.includes('01:00')));assert.ok(risks.some(text=>text.includes('05:55')));
  for(const context of [{...deal.airport_context,itinerary_verified:false},{...deal.airport_context,arrival_local_time:null,return_departure_local_time:null}]){
   const fallback=tripDecisionRisks({...deal,airport_context:context},locale);
   assert.ok(messages.every(message=>fallback.includes(message.text)));
  }
 });
 test(`${locale}: one-way decisions do not invent a return or a stay`,()=>{
  const risks=tripDecisionRisks({...base,trip_type:'ONE_WAY',weekend_assessment:{stay}},locale);
  assert.equal(risks.length,1); // Explicitly unknown city-transfer logistics only.
  assert.ok(!risks[0].includes('LTN'));
 });
}
