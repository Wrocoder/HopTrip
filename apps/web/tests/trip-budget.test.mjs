import test from "node:test";
import assert from "node:assert/strict";
import {budgetForTrip,calculateBudget,emptyBudget,moneyInGrosz} from "../src/lib/trip-budget.ts";

test("trip budget uses flight cost and calendar nights, including same-day trips",()=>{
 const trip={trip_type:"ROUND_TRIP",trip_start:"2026-10-24",trip_end:"2026-10-26",flight_price_pln:"123.45"};
 assert.deepEqual(budgetForTrip(trip),{people:"1",flight:"123.45",nights:"2",days:"3"});
 assert.deepEqual(budgetForTrip({...trip,trip_end:trip.trip_start}),{people:"1",flight:"123.45",nights:"0",days:"1"});
});
test("one-way and invalid dates do not claim a known stay, unknown flight stays empty",()=>{
 const trip={trip_type:"ONE_WAY",trip_start:"2026-10-24",trip_end:"2026-10-24",flight_price_pln:null};
 assert.deepEqual(budgetForTrip(trip),{people:"1",flight:""});
 for(const end of ["invalid","2026-10-23","2028-10-24"])
  assert.deepEqual(budgetForTrip({...trip,trip_type:"ROUND_TRIP",trip_end:end}),{people:"1",flight:""});
 assert.equal(budgetForTrip({...trip,flight_price_pln:"-20"}).flight,"");
});

test("shared hotel and transport are not multiplied by people",()=>{
 const result=calculateBudget({...emptyBudget,flight:"300",baggage:"50",hotel:"200",transfers:"100",local_transport:"0",food:"40",activities:"30",other:"100"});
 assert.equal(result.total,160000);
 assert.equal(result.perPerson,80000);
 assert.deepEqual(result.missing,[]);
});
test("unknown expenses remain incomplete while explicit zero is known",()=>{
 const result=calculateBudget({...emptyBudget,flight:"0"});
 assert.equal(result.total,0);
 assert.equal(result.missing.length,7);
 assert.equal(result.lines.find(line=>line.key==="hotel").total,null);
});
test("comma input uses integer grosz and per-person rounding",()=>{
 assert.equal(moneyInGrosz("0,29"),29);
 const result=calculateBudget({...emptyBudget,people:"3",transfers:"1,00"});
 assert.equal(result.total,100);
 assert.equal(result.perPerson,33);
});
test("invalid amounts and counts cannot produce a plausible total",()=>{
 for(const value of ["-10","1e3","NaN","Infinity","12,345","10000000","1.000,50"])
  assert.equal(calculateBudget({...emptyBudget,flight:value}).total,null,value);
 for(const value of ["0","-1","1.5","", "51"])
  assert.equal(calculateBudget({...emptyBudget,people:value}).total,null,value);
 assert.equal(calculateBudget({...emptyBudget,days:"366"}).total,null);
 assert.equal(calculateBudget({...emptyBudget,nights:"0",hotel:"200"}).lines.find(line=>line.key==="hotel").total,0);
});
test("whole-stay lodging keeps every grosz and ignores nightly price and headcount",()=>{
 for(const people of ["1","3","5"]) for(const nights of ["0","3","7"]) {
  const result=calculateBudget({...emptyBudget,hotel_basis:"stay",hotel_total:"1000,01",hotel:"900",people,nights});
  assert.equal(result.total,100001);
  assert.equal(result.lines.find(line=>line.key==="hotel").total,100001);
 }
 assert.equal(calculateBudget({...emptyBudget,hotel_basis:"stay",hotel:"900"}).lines.find(line=>line.key==="hotel").total,null);
 assert.equal(calculateBudget({...emptyBudget,hotel_basis:"stay",hotel_total:"-1"}).valid,false);
 assert.equal(calculateBudget({...emptyBudget,hotel_total:"-1",hotel:"25"}).total,5000);
});
