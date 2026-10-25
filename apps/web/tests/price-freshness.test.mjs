import {test} from 'node:test';
import assert from 'node:assert/strict';
import {priceObservation} from '../src/lib/price-assessment.ts';
import {offerDeadline} from '../src/lib/offer-expiry.ts';
import {freshnessCopy} from '../src/lib/i18n/freshness-copy.ts';

const deal={last_verified_at:'2030-10-24T10:00:00Z',trip_start:'2030-11-01',expires_at:null};
test('expiry fallback uses the earliest TTL, source expiry or departure, never fetch time',()=>{
 assert.equal(offerDeadline(deal),'2030-10-26T10:00:00.000Z');
 assert.equal(offerDeadline({...deal,expires_at:'2030-10-24T11:00:00Z'}),'2030-10-24T11:00:00.000Z');
 assert.equal(offerDeadline({...deal,flight_facts:{outbound_departure:'2030-10-25T12:00:00Z'}}),'2030-10-25T12:00:00.000Z');
 assert.equal(offerDeadline({...deal,trip_start:'2030-10-25'}),'2030-10-25T00:00:00.000Z');
 assert.equal(offerDeadline({last_verified_at:'invalid',expires_at:'invalid',trip_start:'invalid'}),null);
});
test('explicit snapshot provenance wins over score calculation and new delivery',()=>{
 const price_freshness={observed_at:deal.last_verified_at,observation_basis:'FIRST_SEEN',
  fetched_at:'2030-10-25T18:00:00Z',hidden_after:'2030-10-26T09:00:00Z'};
 const result=priceObservation({...deal,price_freshness,score_explanation:{status:'CURRENT',
  observed_at:'2030-10-25T18:00:00Z',observation_basis:'SOURCE'}});
 assert.equal(result.timestamp,deal.last_verified_at);
 assert.equal(result.basis,'FIRST_SEEN');
 assert.equal(offerDeadline({...deal,price_freshness}),price_freshness.hidden_after);
 assert.equal(priceObservation({...deal,price_freshness:{observed_at:null,observation_basis:null}}).timestamp,null);
});
test('freshness explanation, expiry and delivery copy is available in all locales',()=>{
 for(const copy of Object.values(freshnessCopy))for(const text of Object.values(copy))assert.ok(text.trim());
});
