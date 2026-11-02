import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendationEligible,qualityNotice} from '../src/lib/flight-quality.ts';
import {qualityReasons,qualityReasonText,qualityText} from '../src/lib/i18n/quality-copy.ts';

test('automatic recommendations require known quality and exclude critical or legacy data',()=>{
 for(const status of ['COMPLETE','PARTIAL','CRITICAL_INCOMPLETE']){
  const deal={flight_quality:{version:'flight-quality-v1',status,reasons:[],recommendation_eligible:true}};
  assert.equal(recommendationEligible(deal),status!=='CRITICAL_INCOMPLETE');
  assert.equal(recommendationEligible({flight_quality:{...deal.flight_quality,recommendation_eligible:false}}),false);
 }
 assert.equal(recommendationEligible({}),false);
 assert.equal(recommendationEligible({flight_quality:{version:'future',status:'COMPLETE',recommendation_eligible:true}}),false);
});

test('complete data need no warning; partial, critical and unknown data remain explicit',()=>{
 assert.equal(qualityNotice({flight_quality:{version:'flight-quality-v1',status:'COMPLETE'}}),null);
 const partial={flight_quality:{version:'flight-quality-v1',status:'PARTIAL',reasons:['ESTIMATED_TIMES']}};
 const snapshot=JSON.stringify(partial);
 assert.equal(qualityNotice(partial).status,'PARTIAL');
 assert.deepEqual(qualityNotice(partial).reasons,['ESTIMATED_TIMES']);
 assert.equal(JSON.stringify(partial),snapshot);
 assert.equal(qualityNotice({}).status,'CRITICAL_INCOMPLETE');
});

test('all source-quality reasons are translated without exposing technical codes',()=>{
 for(const locale of ['pl','en','ru','uk']){
  for(const reason of Object.keys(qualityReasons)){
   const text=qualityReasonText(locale,reason);
   assert.ok(text.trim());assert.notEqual(text,reason);
  }
  assert.ok(qualityText(locale,'selection').trim());
  assert.equal(qualityReasonText(locale,'FUTURE_REASON'),qualityReasonText(locale,'UNVERIFIED_SOURCE'));
 }
});
