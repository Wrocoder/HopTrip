import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionWarnings} from '../src/lib/connections.ts';

const connection={direction:'RETURN',after_leg:1,arrival_airport:'LHR',departure_airport:'LGW',duration_minutes:360,
 overnight:true,airport_change:true,long_layover:true,risky_transfer:true,protection:'UNKNOWN'};
const assessment={version:'connections-v1',status:'PARTIAL',policy:{long_layover_minutes:360,short_transfer_minutes:90},connections:[connection],unknown_directions:[]};

for(const locale of ['pl','en','ru','uk'])test(`${locale}: connection warning exposes duration, night, airport change, risk and unknown protection`,()=>{
 const warnings=connectionWarnings({connection_assessment:assessment},locale);
 assert.equal(warnings.length,1);assert.match(warnings[0].title,/LHR → LGW · 360/);
 assert.equal(warnings[0].details.length,5);assert.match(warnings[0].details[1],/00:00–06:00/);
 assert.ok(warnings[0].details.every(text=>text.length>10));
 assert.ok(!warnings[0].details.join(' ').includes('UNKNOWN'));
 const unknown=connectionWarnings({connection_assessment:{...assessment,connections:[],unknown_directions:['OUTBOUND']}},locale);
 assert.equal(unknown.length,1);assert.equal(unknown[0].details.length,1);
});

test('legacy, direct and future assessment versions never invent connection or protection facts',()=>{
 for(const value of [{},{connection_assessment:{...assessment,connections:[]}},{connection_assessment:{...assessment,version:'connections-v2'}}])assert.deepEqual(connectionWarnings(value,'en'),[]);
 const warning=connectionWarnings({connection_assessment:{...assessment,connections:[{...connection,arrival_airport:'BER',departure_airport:'BER',overnight:null,airport_change:false,long_layover:false,risky_transfer:false}]}},'en')[0];
 assert.match(warning.title,/BER · 360/);assert.equal(warning.details.length,2);
 assert.match(warning.details[0],/time zone missing/);assert.match(warning.details[1],/confirm with the partner/);
});
