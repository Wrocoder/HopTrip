import {test} from "node:test";
import assert from "node:assert/strict";
import {locales} from "../src/lib/i18n/config.ts";
import {catalogCopy,catalogText,catalogTemplate} from "../src/lib/i18n/catalog-copy.ts";
import {flightTime,compactFlightTime,flightDayShift} from "../src/lib/flight-facts.ts";
import {tripNights} from "../src/lib/i18n/format.ts";
import {priceAssessment} from "../src/lib/price-assessment.ts";
import {cityLabel} from "../src/lib/cities.ts";

test("catalog translations retain placeholders and never contain empty values",()=>{
 for(const [source,translations] of Object.entries(catalogCopy)){
  const placeholders=text=>[...text.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();
  assert.equal(translations.length,3);
  for(const text of translations){
   assert.ok(text.trim());
   assert.deepEqual(placeholders(text),placeholders(source));
  }
 }
 assert.equal(catalogTemplate("en","Cena o {amount} zł {direction} mediany próby.",{amount:"5.00",direction:"below"}),"Price PLN 5.00 below the sample median.");
 assert.equal(cityLabel("Barcelona","barcelona","ru"),"Барселона");
 assert.equal(cityLabel("Barcelona","barcelona","uk"),"Барселона");
 assert.equal(cityLabel("Unknown City","unknown-city","ru"),"Unknown City");
});

test("all catalog languages preserve local midnight, DST, missing clocks and seven nights",()=>{
 const shift={pl:"+1 dzień",en:"+1 day",ru:"+1 день",uk:"+1 день"};
 for(const locale of locales){
  const arrival="2026-10-24T22:40:00Z",zone="Europe/Warsaw";
  assert.match(flightTime(arrival,zone,locale),/00:40/);
  assert.match(compactFlightTime(arrival,zone,locale).day,/25/);
  assert.equal(flightDayShift("2026-10-24T20:40:00Z",arrival,zone,zone,locale),shift[locale]);
  assert.equal(flightTime(arrival,zone,locale),flightTime("2026-10-25T00:40:00+02:00",zone,locale));
  assert.match(flightTime("2026-10-25T00:30:00Z",zone,locale),/02:30.*GMT\+2/);
  assert.match(flightTime("2026-10-25T01:30:00Z",zone,locale),/02:30.*GMT\+1/);
  assert.match(flightTime("2026-03-29T01:30:00Z",zone,locale),/03:30/);
  assert.match(flightTime("2026-10-24T22:40:00Z","America/New_York",locale),/18:40/);
  for(const missing of [null,"2026-10-24","2026-10-24T22:40:00"])assert.equal(flightTime(missing,zone,locale),null);
  assert.equal(compactFlightTime(arrival,"unknown",locale).local,false);
  assert.match(flightTime(arrival,"unknown",locale),/UTC/);
  assert.match(tripNights({trip_type:"ROUND_TRIP",trip_start:"2026-10-17",trip_end:"2026-10-24"},locale),/^7 /);
 }
});

test("translated price conclusions preserve neutrality, comparison boundaries and missing history",()=>{
 const deal={flight_price_pln:"260",price_per_person_pln:"260",score_explanation:{
  status:"CURRENT",sample_count:5,current_price_pln:"260",median_price_pln:"260.50",price_difference_percent:"0.19",
 }};
 const original=JSON.stringify(deal);
 for(const locale of locales){
  assert.equal(priceAssessment(deal,locale).summary,catalogText(locale,"Blisko mediany — różnica mniejsza niż 1 zł."));
  for(const median of ["259","260","260.004","260.99","260.999","261"]){
   const changed={...deal,score_explanation:{...deal.score_explanation,median_price_pln:median,price_difference_percent:((Number(median)-260)/Number(median)*100).toFixed(2)}};
   assert.equal(priceAssessment(changed,locale).comparable,true);
   assert.equal(priceAssessment(changed,locale).median,priceAssessment(changed).median);
  }
  for(const patch of [{median_price_pln:"0"},{median_price_pln:null},{sample_count:4},{price_difference_percent:"50"},{status:"LEGACY"}]){
   assert.equal(priceAssessment({...deal,score_explanation:{...deal.score_explanation,...patch}},locale).comparable,false);
  }
 }
 assert.equal(JSON.stringify(deal),original);
});
