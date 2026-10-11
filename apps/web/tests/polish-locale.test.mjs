import test from "node:test";
import assert from "node:assert/strict";
import {cityLabel,originLabel,departureHeading} from "../src/lib/cities.ts";
import {date,money,tripNights} from "../src/lib/pl.ts";

test("city presentation preserves unknown names and distinguishes Warsaw airports",()=>{
 for(const [source,expected] of Object.entries({Warsaw:"Warszawa",Wroclaw:"Wrocław",Poznan:"Poznań",Milan:"Mediolan",Rome:"Rzym",Gdansk:"Gdańsk"}))assert.equal(cityLabel(source),expected);
 assert.equal(cityLabel("Unknown City"),"Unknown City");
 assert.equal(originLabel("Warsaw","WAW"),"Warszawa-Chopin");
 assert.equal(originLabel("Warsaw","WMI"),"Warszawa-Modlin");
 assert.equal(departureHeading("Wroclaw","WRO"),"Loty z Wrocławia (WRO)");
 assert.equal(departureHeading("Unknown City","XYZ"),"Loty — Unknown City (XYZ)");
});
test("Polish dates include weekdays, timestamps use Warsaw and invalid dates stay unknown",()=>{
 assert.match(date("2030-05-03"),/^pt\.,? 3 maj/);
 assert.match(date("2030-05-03T22:30:00Z"),/^sob\.,? 4 maj/);
 assert.equal(date("2030-02-30"),"—");
 assert.equal(date("invalid"),"—");
 assert.match(money("12345.50"),/12\s345,50\szł/);
 assert.equal(money(null),"—");
});
test("calendar nights handle Polish plurals, DST, unknown one-way and reversed dates",()=>{
 const trip=(trip_start,trip_end,trip_type="ROUND_TRIP")=>({trip_start,trip_end,trip_type});
 for(const [end,label] of [["02","1 noc"],["03","2 noce"],["06","5 nocy"],["13","12 nocy"],["23","22 noce"]])assert.equal(tripNights(trip("2030-05-01",`2030-05-${end}`)),label);
 assert.equal(tripNights(trip("2030-03-29","2030-03-31")),"2 noce");
 assert.equal(tripNights(trip("2030-10-25","2030-10-27")),"2 noce");
 assert.equal(tripNights(trip("2030-05-01","2030-05-01","ONE_WAY")),"");
 assert.equal(tripNights(trip("2030-05-03","2030-05-01")),"");
});
