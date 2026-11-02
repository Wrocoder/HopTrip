import {test} from 'node:test';
import assert from 'node:assert/strict';
import {airportSuggestions,airportLabel,normalizeAirport} from '../src/lib/airports.ts';
import {destinationSuggestions,destinationLabel,normalizeDestination} from '../src/lib/destinations.ts';
import {originLabel,cityLabel} from '../src/lib/cities.ts';
import {locales} from '../src/lib/i18n/config.ts';

test('bounded airport suggestions retain the former full-scan results, order and object identity',()=>{
 const rows=Array.from({length:35},(_,id)=>Object.freeze({id,iata_code:'WRO',city:'Wrocław',name:'Test-only airport',aliases:['Łódź alias'],is_active:id%5!==0}));
 for(const query of ['', ' ', 'wro', 'test', 'lodz', 'missing', 'Вроц']){
  const normalized=normalizeAirport(query);
  const expected=rows.filter(a=>a.is_active&&[a.iata_code,a.city,a.name,...locales.flatMap(locale=>[airportLabel(a,locale),originLabel(a.city,a.iata_code,locale),cityLabel(a.city,undefined,locale)]),...a.aliases].map(normalizeAirport).some(t=>t.includes(normalized))).slice(0,12);
  const actual=airportSuggestions(rows,query);assert.deepEqual(actual,expected);actual.forEach((a,i)=>assert.equal(a,expected[i]));
 }
});
test('bounded destination suggestions preserve multilingual aliases and inactive exclusions',()=>{
 const rows=Array.from({length:35},(_,id)=>Object.freeze({id,slug:'milan',city:'Milan',display_name:'Mediolan',aliases:['Łódź alias'],iata_codes:['MXP'],is_active:id%5!==0}));
 for(const query of ['', ' ', 'mil', 'MXP', 'lodz', 'missing', 'Милан']){
  const normalized=normalizeDestination(query);
  const expected=rows.filter(d=>d.is_active&&[d.slug,d.city,...locales.map(locale=>destinationLabel(d,locale)),...d.aliases,...d.iata_codes].map(normalizeDestination).some(t=>t.includes(normalized))).slice(0,12);
  const actual=destinationSuggestions(rows,query);assert.deepEqual(actual,expected);actual.forEach((d,i)=>assert.equal(d,expected[i]));
 }
});
