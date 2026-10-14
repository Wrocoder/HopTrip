import test from "node:test";
import assert from "node:assert/strict";
import {matchingAirports,airportSuggestions} from "../src/lib/airports.ts";

const airports=[
  {id:1,iata_code:"WRO",city:"Wrocław",name:"Wrocław Airport",is_active:true},
  {id:2,iata_code:"WAW",city:"Warszawa",name:"Chopin",is_active:true,aliases:["Warsaw"]},
  {id:3,iata_code:"WMI",city:"Modlin",name:"Modlin Airport",is_active:true,aliases:["Warszawa","Warsaw"]},
  {id:4,iata_code:"LCJ",city:"Łódź",name:"Łódź Airport",is_active:false},
];

test("city spelling, code and display label resolve to the same active airport",()=>{
  for(const text of ["WRO","wro","Wrocław","  WROCLAW  ","Wrocław — WRO"])
    assert.deepEqual(matchingAirports(airports,text).map(a=>a.iata_code),["WRO"]);
  assert.deepEqual(matchingAirports(airports,"Lodz"),[]);
  assert.deepEqual(matchingAirports(airports,""),[]);
});

test("ambiguous cities expose all airports and codes select just one",()=>{
  assert.deepEqual(matchingAirports(airports,"warsaw").map(a=>a.iata_code),["WAW","WMI"]);
  assert.deepEqual(matchingAirports(airports,"WMI").map(a=>a.iata_code),["WMI"]);
  assert.deepEqual(airportSuggestions(airports,"warsz").map(a=>a.iata_code),["WAW","WMI"]);
});

test("partial matches are suggestions, never an implicit airport choice",()=>{
  assert.deepEqual(airportSuggestions(airports,"wrocl").map(a=>a.iata_code),["WRO"]);
  assert.deepEqual(matchingAirports(airports,"wrocl"),[]);
  assert.deepEqual(airportSuggestions(airports,"").map(a=>a.iata_code),["WRO","WAW","WMI"]);
});
