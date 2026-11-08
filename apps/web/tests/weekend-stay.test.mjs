import test from 'node:test';
import assert from 'node:assert/strict';
import {stayWarnings,stayRecommendationEligible} from '../src/lib/weekend-stay.ts';

for(const locale of ['pl','en','ru','uk'])test(`${locale}: stay warnings explain model, night and early return without exposing reason codes`,()=>{
 const deal={weekend_assessment:{calendar:'ELIGIBLE',no_leave:'ELIGIBLE',stay:{version:'weekend-stay-v1',eligibility:'INELIGIBLE',night_arrival:true,early_return:true,reasons:['INSUFFICIENT_STAY']}}};
 const warnings=stayWarnings(deal,locale);
 assert.equal(warnings.length,4);assert.ok(warnings.every(text=>text.length>15));
 assert.match(warnings[3],/08:00–22:00/);assert.ok(!warnings.join(' ').includes('INSUFFICIENT_STAY'));
 assert.equal(stayRecommendationEligible(deal,true),false);
 assert.deepEqual(stayWarnings({},locale),[]);
});

test('legacy and future assessment versions cannot certify recommendations',()=>{
 for(const stay of [undefined,{version:'weekend-stay-v2',eligibility:'ELIGIBLE'},{version:'weekend-stay-v1',eligibility:'UNKNOWN'}]){
  assert.equal(stayRecommendationEligible({weekend_assessment:{stay}}),false);
 }
});
