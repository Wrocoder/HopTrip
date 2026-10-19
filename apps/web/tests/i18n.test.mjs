import {test} from "node:test";
import assert from "node:assert/strict";
import {locales,isLocale,publishedLocales} from "../src/lib/i18n/config.ts";
import {messages,getMessages} from "../src/lib/i18n/messages.ts";
import {localizedHref,languageAlternates,pageLocales,availableHref,pathLocale} from "../src/lib/i18n/routing.ts";
import {budgetCopy,budgetText} from "../src/lib/i18n/budget-copy.ts";
import {analyticsPageType} from "../src/lib/analytics-context.ts";
import {driveAllowedOnPage} from "../src/lib/drive-policy.ts";
import {money,date,dateTime,tripNights} from "../src/lib/i18n/format.ts";

test("only ready pages expose translations and retain analytics and affiliate policy",()=>{
 for(const locale of locales){
  const path=localizedHref("/info/trip-budget",locale);
  assert.deepEqual(pageLocales(path+"?origin=WRO#calculator"),locales);
  assert.equal(pathLocale(path),locale);
  assert.equal(availableHref("/info/trip-budget",locale),path);
  assert.equal(availableHref("/deals?origin=WRO",locale),"/deals?origin=WRO");
  assert.equal(analyticsPageType(path),"budget");
  assert.equal(driveAllowedOnPage(path),false);
 }
 assert.deepEqual(pageLocales("/deals"),["pl"]);
 assert.equal(pathLocale("/en/deals"),"pl");
});

test("budget copy covers every declared message in all languages",()=>{
 for(const source of Object.keys(budgetCopy)){
  for(const locale of locales)assert.ok(budgetText(locale,source).trim());
 }
 for(const locale of ["en","ru","uk"]){
  assert.match(budgetText(locale,"Wpisz liczbę całkowitą od 1 do 50."),/50/);
  assert.throws(()=>budgetText(locale,"missing message"));
 }
});

test("all four dictionaries have every Polish key and explanation, without empty translations",()=>{
 for(const locale of locales){
  assert.deepEqual(Object.keys(messages[locale]).sort(),Object.keys(messages.pl).sort());
  assert.deepEqual(Object.keys(messages[locale].explanations).sort(),Object.keys(messages.pl.explanations).sort());
  for(const value of Object.values(messages[locale])){
   for(const text of typeof value==="string" ? [value] : Object.values(value))assert.ok(text.trim());
  }
 }
 assert.equal(isLocale("uk"),true);
 for(const value of ["ua","EN","constructor",null,""])assert.equal(isLocale(value),false);
 assert.equal(getMessages("ru").to,"Куда");
 assert.equal(getMessages("uk").to,"Куди");
 assert.equal(getMessages("en").to,"To");
 assert.equal(getMessages("pl").to,"Dokąd");
});

test("language URLs preserve filters, pagination, fragments and stable slugs",()=>{
 const query="?origin=WAW%2CWMI&offset=12&weekend=true#results";
 assert.equal(localizedHref("/deals"+query,"ru"),"/ru/deals"+query);
 assert.equal(localizedHref("/ru/deals"+query,"uk"),"/uk/deals"+query);
 assert.equal(localizedHref("/en/deals"+query,"pl"),"/deals"+query);
 assert.equal(localizedHref("/", "en"),"/en");
 assert.equal(localizedHref("/uk", "pl"),"/");
 assert.equal(localizedHref("/destinations/reykjavik", "en"),"/en/destinations/reykjavik");
 for(const path of ["https://example.com","//example.com","/\\example.com","/bad\npath"])assert.throws(()=>localizedHref(path,"en"));
});

test("unpublished translations never appear in default language alternatives",()=>{
 assert.deepEqual(publishedLocales,["pl"]);
 assert.deepEqual(languageAlternates("/deals"),{pl:"/deals","x-default":"/deals"});
 assert.deepEqual(languageAlternates("/deals",["pl","en"]),{pl:"/deals",en:"/en/deals","x-default":"/deals"});
});

test("formatting follows language but keeps PLN, unknowns and the same trip dates",()=>{
 for(const locale of locales){
  assert.equal(money(null,locale),"—");
  assert.equal(money("NaN",locale),"—");
  assert.equal(date("2026-02-30",locale),"—");
  assert.equal(dateTime("invalid",locale),"—");
  assert.ok(money("123.45",locale).includes(locale==="pl" ? "zł" : "PLN"));
  assert.ok(date("2026-10-18",locale).includes("2026"));
 }
 assert.equal(date("2026-10-18"),date("2026-10-18","pl"));
 const trip={trip_type:"ROUND_TRIP",trip_start:"2026-10-01",trip_end:"2026-10-03"};
 assert.equal(tripNights(trip,"pl"),"2 noce");
 assert.equal(tripNights(trip,"en"),"2 nights");
 assert.equal(tripNights(trip,"ru"),"2 ночи");
 assert.equal(tripNights(trip,"uk"),"2 ночі");
 assert.equal(tripNights({...trip,trip_end:"2026-10-02"},"en"),"1 night");
 assert.equal(tripNights({...trip,trip_end:"2026-10-22"},"ru"),"21 ночь");
 assert.equal(tripNights({...trip,trip_type:"ONE_WAY"},"ru"),"");
 assert.equal(tripNights({...trip,trip_end:"2026-09-30"},"uk"),"");
});
