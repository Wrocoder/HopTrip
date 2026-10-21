import {test} from "node:test";
import assert from "node:assert/strict";
import {tripCopy,tripText} from "../src/lib/i18n/trip-copy.ts";
import {locales} from "../src/lib/i18n/config.ts";
import {pageLocales,localizedHref,pathLocale,translatedPaths} from "../src/lib/i18n/routing.ts";
import {encodeTrip,decodeTrip,tripPath,readSavedTrips} from "../src/lib/shared-trip.ts";
import {emptyBudget} from "../src/lib/trip-budget.ts";
import {passengerInstruction} from "../src/lib/passenger-label.ts";
import {cityLabel} from "../src/lib/cities.ts";
import {analyticsPageType} from "../src/lib/analytics-context.ts";
import {driveAllowedOnPage} from "../src/lib/drive-policy.ts";

test("trip copy covers all languages and traveller instructions preserve count and children",()=>{
 for(const key of Object.keys(tripCopy)){
  for(const locale of locales)assert.ok(tripText(locale,key).trim());
 }
 for(const locale of locales){
  for(const count of ["1","2","5","21","22","50"]){
   assert.ok(passengerInstruction(count,true,locale).includes(count));
   assert.notEqual(passengerInstruction(count,true,locale),passengerInstruction(count,false,locale));
  }
  for(const invalid of ["0","-1","51","2.5","abc",""])assert.equal(passengerInstruction(invalid,true,locale),tripText(locale,"U partnera ustaw skład grupy."));
 }
 assert.match(passengerInstruction("2",true,"en"),/2 adults/);
 assert.match(passengerInstruction("2",false,"ru"),/2 человека.*детей/);
 assert.match(passengerInstruction("21",true,"uk"),/21 дорослого/);
});

test("offer and private plan locales retain identifiers but never enter sitemap registry",()=>{
 for(const path of ["/deals/browser-deal","/saved","/trip"]){
  for(const locale of locales){
   const localized=localizedHref(path+"?plan=unchanged#calculator",locale);
   assert.deepEqual(pageLocales(localized),locales);
   assert.equal(pathLocale(localized),locale);
   assert.equal(localizedHref(localized,"pl"),path+"?plan=unchanged#calculator");
   assert.equal(driveAllowedOnPage(localized.split("?")[0]),false);
   assert.equal(analyticsPageType(localized.split("?")[0]),analyticsPageType(path));
  }
  assert.ok(!translatedPaths.includes(path));
 }
 assert.deepEqual(pageLocales("/deals/extra/path"),["pl"]);
});

test("old snapshot format and storage tokens are unchanged across display languages",()=>{
 const plan={version:1,offer:{slug:"browser-deal",origin:"Wrocław",destination:"Mediolan",start:"2090-01-15",end:"2090-01-18",price:"260",observedAt:""},draft:{version:1,input:{...emptyBudget,people:"3",hotel_basis:"stay",hotel_total:"900"},start:"2090-01-15",end:"2090-01-18",context:"old",review:false}};
 const token=encodeTrip(plan),decoded=decodeTrip(token);
 const original=JSON.stringify(decoded);
 for(const locale of locales){
  const url=new URL(localizedHref(tripPath(token),locale),"https://example.test");
  assert.equal(url.searchParams.get("plan"),token);
  assert.deepEqual(decodeTrip(url.searchParams.get("plan")),decoded);
  assert.deepEqual(readSavedTrips(JSON.stringify([token])),[token]);
  assert.equal(decoded.draft.adultsOnly,undefined);
 }
 assert.equal(cityLabel(decoded.offer.destination,undefined,"en"),"Milan");
 assert.equal(cityLabel(decoded.offer.destination,undefined,"uk"),"Мілан");
 assert.equal(cityLabel("Name from old snapshot",undefined,"ru"),"Name from old snapshot");
 assert.equal(JSON.stringify(decoded),original);
});
