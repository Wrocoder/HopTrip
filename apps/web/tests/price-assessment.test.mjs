import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {priceAssessment,priceObservation} from "../src/lib/price-assessment.ts";
import {scoreText} from "../src/lib/i18n/score-copy.ts";

const reference=JSON.parse(readFileSync(new URL('../../api/tests/fixtures/h3-price-comparisons.json',import.meta.url),'utf8'));
test('API reference comparisons agree with the visible assessment in every locale',()=>{
 for(const item of reference)for(const locale of ['pl','en','ru','uk']){
  const result=priceAssessment({flight_price_pln:item.price,price_per_person_pln:item.price,
   score_explanation:{status:item.status,sample_count:item.count,current_price_pln:item.price,
    median_price_pln:item.median,price_difference_percent:item.difference}},locale);
  assert.equal(result.comparable,item.comparable,`${item.name}/${locale}`);
  assert.equal(result.median,item.comparable ? item.median : null);
  if(!item.comparable)assert.equal(result.summary,scoreText(locale,'insufficient'));
 }
});

test("every locale discloses UTC cohort dates and the currency",()=>{
 for(const locale of ["pl","en","ru","uk"]){
  const text=scoreText(locale,"grouping");
  assert.match(text,/UTC/);assert.match(text,/PLN/);
 }
});

const deal={flight_price_pln:"200.25",price_per_person_pln:"200.25",last_verified_at:"2026-10-11T10:00:00Z",
  score_explanation:{status:"CURRENT",sample_count:24,current_price_pln:"200.25",median_price_pln:"250",
    price_difference_percent:"19.90",observed_at:"2026-10-10T10:00:00Z",observation_basis:"FIRST_SEEN"}};

test('visible sample context uses the validated comparison count in all locales',()=>{
 for(const locale of ['pl','en','ru','uk'])for(const count of [5,24,30,107]){
  const result=priceAssessment({...deal,score_explanation:{...deal.score_explanation,sample_count:count}},locale);
  assert.equal(result.scope,scoreText(locale,'sampleScope',{count}));
  assert.ok(result.scope.includes(String(count)));
 }
});

test('untrusted and non-current comparisons do not gain a current sample label',()=>{
 for(const patch of [{status:'PROVISIONAL'},{status:'LEGACY'},{status:'UNAVAILABLE'},{sample_count:4},{sample_count:null},{sample_count:5.5},{price_difference_percent:'99'}]){
  assert.equal(priceAssessment({...deal,score_explanation:{...deal.score_explanation,...patch}}).scope,null);
 }
 assert.equal(priceAssessment({...deal,flight_price_pln:'201'}).scope,null);
});

test('comparison entry and collapsed methodology do not expose a numerical rating',()=>{
 for(const locale of ['pl','en','ru','uk']){
  assert.doesNotMatch(scoreText(locale,'calculation',{score:76}),/76|100/);
  assert.doesNotMatch(scoreText(locale,'triggerLabel',{destination:'Barcelona'}),/\d/);
  assert.ok(scoreText(locale,'triggerLabel',{destination:'Barcelona'}).includes('Barcelona'));
 }
});

test("saved below, equal and above-median comparisons retain their direction",()=>{
  const original=JSON.stringify(deal);
  assert.match(priceAssessment(deal).summary,/49,75 zł poniżej/);
  assert.match(priceAssessment(deal).sufficiency,/Liczba obserwacji: 24/);
  for(const [median,difference,pattern] of [["200.25","0",/na poziomie/],["178","-12.5",/22,25 zł powyżej/]]) {
    assert.match(priceAssessment({...deal,score_explanation:{...deal.score_explanation,median_price_pln:median,price_difference_percent:difference}}).summary,pattern);
  }
  assert.equal(JSON.stringify(deal),original);
});

test("sub-zloty differences are neutral; display boundaries use rounded grosz",()=>{
  for(const [median,pattern] of [["260.50",/Blisko mediany/],["260.99",/Blisko mediany/],
    ["259.01",/Blisko mediany/],["261",/1,00 zł poniżej/],["259",/1,00 zł powyżej/],
    ["260",/na poziomie/],["260.004",/na poziomie/],["260.999",/1,00 zł poniżej/]]) {
    const result=priceAssessment({flight_price_pln:"260",price_per_person_pln:"260",score_explanation:{
      ...deal.score_explanation,current_price_pln:"260",median_price_pln:median,
      price_difference_percent:((Number(median)-260)/Number(median)*100).toFixed(2)}});
    assert.equal(result.comparable,true);
    assert.match(result.summary,pattern);
    assert.doesNotMatch(result.summary,/%|oszczęd/);
  }
});

test("incomplete, legacy and provisional history cannot advertise a discount",()=>{
  for(const patch of [{status:"PROVISIONAL"},{status:"LEGACY"},{status:"UNAVAILABLE"},
    {sample_count:4},{sample_count:null},{sample_count:2.5},{median_price_pln:null},{median_price_pln:"0"},
    {median_price_pln:"NaN"},{median_price_pln:"-1"},{current_price_pln:"0"},
    {price_difference_percent:"-19.90"},{price_difference_percent:"19.89"},
    {price_difference_percent:null},{price_difference_percent:""},{price_difference_percent:"Infinity"}]) {
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
