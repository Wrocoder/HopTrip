import assert from "node:assert/strict";
import test from "node:test";
import {passengerInstruction} from "../src/lib/passenger-label.ts";
test("partner instruction uses Polish accusative and does not invent group counts",()=>{
 for(const [count,label] of [[1,"osobę"],[2,"osoby"],[4,"osoby"],[5,"osób"],[12,"osób"],[14,"osób"],[22,"osoby"],[50,"osób"]])
  assert.equal(passengerInstruction(String(count),false),`U partnera ustaw ${count} ${label}. Sprawdź dorosłych i dzieci.`);
 assert.equal(passengerInstruction("1",true),"U partnera ustaw 1 dorosłego.");
 assert.equal(passengerInstruction("2",true),"U partnera ustaw 2 dorosłych.");
 for(const count of ["","0","-1","1.5","NaN","51"])
  assert.equal(passengerInstruction(count,true),"U partnera ustaw skład grupy.");
});
