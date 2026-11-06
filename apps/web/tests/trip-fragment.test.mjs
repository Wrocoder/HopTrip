import test from 'node:test';
import assert from 'node:assert/strict';
import {readTripFragment,tripSectionHash} from '../src/lib/trip-fragment.ts';
import {encodeTrip,decodeTrip,tripPath} from '../src/lib/shared-trip.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
import {localizedHref} from '../src/lib/i18n/routing.ts';
import {sharePrivacyCopy} from '../src/lib/i18n/share-privacy-copy.ts';
const trip={version:1,offer:{slug:'synthetic',origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},draft:{version:1,input:{...emptyBudget,food:'37.42'},start:'2030-05-01',end:'2030-05-03',context:'',review:true}};
const token=encodeTrip(trip);
test('new links put the unchanged v1 token in the fragment on all four locales',()=>{
 for(const locale of ['pl','en','ru','uk']){
  const url=new URL(localizedHref(tripPath(token),locale),'https://example.test');
  assert.equal(url.search,'');assert.equal(url.hash,'#plan='+token);
  assert.deepEqual(readTripFragment(url.hash).trip,decodeTrip(token));assert.equal(readTripFragment(url.hash).token,token);
  assert.equal(url.origin+url.pathname,'https://example.test'+(locale==='pl'?'':'/'+locale)+'/trip');
 }
});
test('section navigation retains the token and validates section identifiers',()=>{
 const hash=tripSectionHash(token,'budget-hotel-basis');assert.equal(readTripFragment(hash).section,'budget-hotel-basis');assert.equal(readTripFragment(hash).token,token);
 assert.equal(tripSectionHash(token,'../private'),tripPath(token).slice(5));
});
test('malformed, duplicate, oversized, unsupported and ambiguous fragments fail closed',()=>{
 for(const hash of ['', '#calculator','?plan='+token,'#plan=broken','#plan=','#plan='+token+'&plan='+token,'#plan='+token+'&section=a&section=b','#plan='+token+'&email=private@example.test','#plan='+token+'&section=',' #plan='+token,'#plan='+token+'&section=../private','#plan='+'a'.repeat(6200)])assert.equal(readTripFragment(hash),null,hash.slice(0,70));
});
test('privacy copy and metadata describe a copy without embedding plan values',()=>{
 for(const copy of Object.values(sharePrivacyCopy)){
  assert.ok(copy.privacy.includes('#'));assert.ok(!JSON.stringify(copy).includes(token));assert.ok(!copy.description.includes('2030'));
  for(const value of Object.values(copy))assert.ok(value.length>0);
 }
});
