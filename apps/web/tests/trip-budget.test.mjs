import test from "node:test";
import assert from "node:assert/strict";
import {calculateBudget,emptyBudget,moneyInGrosz} from "../src/lib/trip-budget.ts";

test("shared hotel and transport are not multiplied by people",()=>{
 const result=calculateBudget({...emptyBudget,flight:"300",baggage:"50",hotel:"200",transfers:"100",food:"40",activities:"30",other:"100"});
 assert.equal(result.total,160000);
 assert.equal(result.perPerson,80000);
 assert.deepEqual(result.missing,[]);
});
test("unknown expenses remain incomplete while explicit zero is known",()=>{
 const result=calculateBudget({...emptyBudget,flight:"0"});
 assert.equal(result.total,0);
 assert.equal(result.missing.length,6);
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
