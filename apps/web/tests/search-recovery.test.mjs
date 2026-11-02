import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchRecovery} from '../src/lib/search-recovery.ts';

test('recovery changes only the selected criterion and pagination, without mutating the applied search',()=>{
 const filters={origin:'WRO',destination:'milan',budget:'200',departure_from:'2030-05-01',departure_to:'2030-05-05',duration_min:'2',duration_max:'3',weekend:'true',sort:'price',offset:'12'};
 const original=structuredClone(filters),options=searchRecovery(filters);
 const removed=[['budget'],['departure_from','departure_to'],['destination'],['weekend'],['duration_min','duration_max'],['origin']];
 assert.equal(options.length,removed.length);
 options.forEach((option,index)=>{
  const expected={...filters};delete expected.offset;for(const key of removed[index])delete expected[key];
  const url=new URL(option.href,'https://local.test');
  assert.equal(url.pathname,'/deals');assert.deepEqual(Object.fromEntries(url.searchParams),expected);
 });
 assert.deepEqual(filters,original);
});
test('a zero budget is restrictive and can be removed',()=>assert.equal(searchRecovery({budget:'0'})[0].href,'/deals'));
test('a single date bound can be relaxed while retaining airport and sort',()=>assert.equal(searchRecovery({departure_to:'2030-05-05',origin:'WRO',sort:'departure'})[0].href,'/deals?origin=WRO&sort=departure'));
test('sort, pagination and a false weekend flag do not invent recovery criteria',()=>assert.deepEqual(searchRecovery({sort:'price',offset:'12',weekend:'false'}),[]));
for(const value of ['true','1','on','yes'])test(`active weekend ${value} has an explicit recovery option`,()=>assert.equal(searchRecovery({weekend:value})[0].label,'Pokaż też inne dni tygodnia'));
