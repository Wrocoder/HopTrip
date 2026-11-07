import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalCopy} from '../src/lib/airport-arrival.ts';

const numbers=text=>[...text.matchAll(/\d+(?:[.,]\d+)?/g)].map(match=>match[0].replace(',','.'));
test('all airport answer translations preserve the same fares, zones, durations and terminal hours',()=>{
 for(const translations of Object.values(arrivalCopy)){
  for(const locale of ['en','ru','uk'])for(const field of ['answer','ticket','detail']){
   assert.deepEqual(numbers(translations[locale][field]),numbers(translations.pl[field]),`${locale}/${field}`);
  }
 }
});

test('reviewed fares retain their product scope rather than becoming generic airport transfer prices',()=>{
 for(const locale of ['pl','en','ru','uk']){
  const malaga=arrivalCopy['malaga-airport'][locale],lisbon=arrivalCopy['lisbon-airport'][locale];
  assert.deepEqual(numbers(malaga.ticket),['1','2','1.80']);assert.match(malaga.ticket,/Cronos/);
  assert.deepEqual(numbers(lisbon.ticket),['1.92']);assert.match(lisbon.ticket,/contactless/);
  assert.deepEqual(numbers(lisbon.detail),['1','2','3','2','00','30','03','30']);
 }
});
