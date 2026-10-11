import test from "node:test";
import assert from "node:assert/strict";
import {matchingDestinations,destinationSuggestions,destinationLabel} from "../src/lib/destinations.ts";
const milan={id:1,slug:"milan",city:"Milan",display_name:"Mediolan",aliases:["Milan","Mediolan"],iata_codes:["MIL","MXP","BGY"],is_active:true};
test("canonical destination, English, Polish and IATA resolve identically",()=>{
 for(const value of ["milan","Milan"," MILAN ","Mediolan","MIL","mxp","BGY"])
  assert.deepEqual(matchingDestinations([milan],value),[milan]);
 assert.equal(destinationLabel(milan),"Mediolan");
});
test("suggestions do not silently resolve partial, unknown or ambiguous input",()=>{
 assert.deepEqual(destinationSuggestions([milan],"medi"),[milan]);
 for(const value of ["medi","", " ","ZZZ"])assert.deepEqual(matchingDestinations([milan],value),[]);
 const other={...milan,id:2,slug:"other-city"};
 assert.equal(matchingDestinations([milan,other],"MXP").length,2);
 assert.deepEqual(matchingDestinations([milan,other],"milan"),[milan]);
 assert.deepEqual(matchingDestinations([{...milan,is_active:false}],"milan"),[]);
});
test("diacritics and repeated whitespace normalize without changing display labels",()=>{
 const city={id:3,slug:"test-city",city:"Test City",display_name:"Łódź  Nowa",is_active:true};
 assert.deepEqual(matchingDestinations([city],"  LODZ   NOWA "),[city]);
 assert.equal(destinationLabel(city),"Łódź  Nowa");
});
