import {test} from "node:test";
import assert from "node:assert/strict";
import {priceAssessment,priceObservation} from "../src/lib/price-assessment.ts";

const deal={flight_price_pln:"200.25",price_per_person_pln:"200.25",last_verified_at:"2026-10-11T10:00:00Z",
  score_explanation:{status:"CURRENT",sample_count:24,current_price_pln:"200.25",median_price_pln:"250",
    price_difference_percent:"19.90",observed_at:"2026-10-10T10:00:00Z",observation_basis:"FIRST_SEEN"}};

test("saved below, equal and above-median comparisons retain their direction",()=>{
  const original=JSON.stringify(deal);
  assert.match(priceAssessment(deal).summary,/19,9% poniżej/);
  assert.match(priceAssessment(deal).sufficiency,/Liczba obserwacji: 24/);
  for(const [difference,pattern] of [["0",/na poziomie/],["-12.5",/12,5% powyżej/]]) {
    assert.match(priceAssessment({...deal,score_explanation:{...deal.score_explanation,price_difference_percent:difference}}).summary,pattern);
  }
  assert.equal(JSON.stringify(deal),original);
});

test("incomplete, legacy and provisional history cannot advertise a discount",()=>{
  for(const patch of [{status:"PROVISIONAL"},{status:"LEGACY"},{status:"UNAVAILABLE"},
    {sample_count:4},{sample_count:null},{sample_count:2.5},{median_price_pln:null},{median_price_pln:"0"},
    {median_price_pln:"NaN"},{price_difference_percent:null},{price_difference_percent:""},{price_difference_percent:"Infinity"}]) {
    const result=priceAssessment({...deal,discount_percent:"99",score_explanation:{...deal.score_explanation,...patch}});
    assert.equal(result.comparable,false);
    assert.equal(result.median,null);
    assert.doesNotMatch(result.summary,/%|poniżej/);
  }
  assert.equal(priceAssessment({...deal,score_explanation:undefined}).comparable,false);
});

test("a score for a different price is not attached to the current offer",()=>{
  assert.equal(priceAssessment({...deal,flight_price_pln:"201"}).comparable,false);
  assert.equal(priceAssessment({...deal,price_per_person_pln:"400.50"}).comparable,false);
  assert.equal(priceAssessment({...deal,score_explanation:{...deal.score_explanation,sample_count:5}}).comparable,true);
});

test("source time and first-seen time are explicit and never replaced with retrieval time",()=>{
  assert.deepEqual(priceObservation(deal),{timestamp:"2026-10-10T10:00:00Z",basis:"FIRST_SEEN",label:"Pierwszy zapis tej ceny w HopTrip"});
  const result=priceObservation({...deal,score_explanation:{...deal.score_explanation,observation_basis:"SOURCE"}});
  assert.equal(result.label,"Obserwacja ceny u źródła");
  assert.equal(result.timestamp,deal.score_explanation.observed_at);
});

test("missing and legacy timestamps do not gain invented provenance",()=>{
  for(const patch of [{status:"LEGACY"},{status:"UNAVAILABLE"},{observed_at:null},{observed_at:"invalid"}]) {
    assert.deepEqual(priceObservation({...deal,score_explanation:{...deal.score_explanation,...patch}}),
      {timestamp:deal.last_verified_at,basis:null,label:"Czas zapisanej obserwacji"});
  }
  assert.equal(priceObservation({last_verified_at:"invalid"}).timestamp,null);
});
