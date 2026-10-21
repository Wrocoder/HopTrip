import {test} from "node:test";
import assert from "node:assert/strict";
import {scoreCopy,scoreText} from "../src/lib/i18n/score-copy.ts";
import {priceGuide} from "../src/lib/i18n/price-guide.ts";
test("score translations retain numeric rules and interpolation slots",()=>{
 for(const [key,values] of Object.entries(scoreCopy)){
  const numbers=text=>(text.match(/\d+(?:[.,]\d+)?/g)??[]).map(value=>value.replace(",","."));
  const slots=text=>(text.match(/\{\w+\}/g)??[]).sort();
  for(const text of values){assert.ok(text.trim());assert.deepEqual(numbers(text),numbers(values[0]),key);assert.deepEqual(slots(text),slots(values[0]),key);}
  for(const locale of ["pl","en","ru","uk"])assert.ok(!scoreText(locale,key,{count:24,age:24,price:"200.25 PLN",median:"250 PLN",comparison:"test",score:69}).includes("{"));
 }
});
test("translated methodology retains the complete example and all sections",()=>{
 for(const page of Object.values(priceGuide)){
  assert.equal(page.paragraphs.length,1);
  assert.deepEqual(page.sections.map(section=>section.paragraphs.length),[2,2,6]);
  const text=JSON.stringify(page).replaceAll(",",".");
  for(const value of ["0–100","60","25","15","48","0.6","0.1","330 PLN","400 PLN","40.5","7.5","68/100"])assert.ok(text.includes(value),value);
 }
});
