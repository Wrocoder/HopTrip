import assert from "node:assert/strict";
import test from "node:test";
import {flightPriceBasis,flightTime,stopsLabel,destinationInterval} from "../src/lib/flight-facts.ts";

test("price scope and known zero differ from unknown facts",()=>{
  assert.equal(flightPriceBasis({trip_type:"ROUND_TRIP"}),"za osobę · w obie strony");
  assert.equal(flightPriceBasis({trip_type:"ONE_WAY"}),"za osobę · w jedną stronę");
  assert.equal(stopsLabel(0),"Bez przesiadek");
  assert.match(stopsLabel(null),/do sprawdzenia/);
  assert.equal(stopsLabel(2),"Liczba przesiadek: 2");
  assert.equal(destinationInterval(1501),"25 godz. 1 min");
  assert.equal(destinationInterval(null),null);
});

test("schedule explicitly uses UTC across day and DST boundary",()=>{
  assert.match(flightTime("2030-03-31T00:30:00+02:00"),/30\.03\.2030.*22:30 UTC/);
  assert.equal(flightTime(null),null);
  assert.equal(flightTime("invalid"),null);
});
