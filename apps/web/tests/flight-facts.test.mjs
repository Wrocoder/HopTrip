import assert from "node:assert/strict";
import test from "node:test";
import {compactFlightTime,flightPriceBasis,flightTime,flightDayShift,stopsLabel,destinationInterval,flightLegs} from "../src/lib/flight-facts.ts";
import {budgetForTrip} from "../src/lib/trip-budget.ts";

test("compact clocks retain local rollover and explicit UTC for unknown zones",()=>{
 const local=compactFlightTime("2026-10-24T22:40:00Z","Europe/Warsaw");
 assert.equal(local.time,"00:40");
 assert.match(local.day,/25 paź/);
 assert.equal(local.local,true);
 for(const zone of [undefined,"Invalid/Zone"]){
  const utc=compactFlightTime("2026-10-24T22:40:00Z",zone);
  assert.equal(utc.time,"22:40 UTC");
  assert.equal(utc.local,false);
 }
 for(const value of [null,"2026-10-24","2026-10-24T22:40:00","invalid"])
  assert.equal(compactFlightTime(value,"Europe/Warsaw"),null);
});

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

test("HTR-01: local home arrival crosses midnight without adding a hotel night",()=>{
 const arrival="2026-10-24T22:40:00Z";
 assert.match(flightTime(arrival,"Europe/Warsaw"),/25\.10\.2026.*00:40.*GMT\+2/);
 assert.equal(flightDayShift("2026-10-24T19:00:00Z",arrival,"Europe/Madrid","Europe/Warsaw"),"+1 dzień");
 const budget=budgetForTrip({trip_type:"ROUND_TRIP",trip_start:"2026-10-17",trip_end:"2026-10-24",flight_price_pln:"260"});
 assert.equal(budget.nights,"7");assert.equal(budget.days,"8");
});

test("IANA rules handle spring and autumn DST and different airport zones",()=>{
 assert.match(flightTime("2026-03-29T00:30:00Z","Europe/Warsaw"),/01:30.*GMT\+1/);
 assert.match(flightTime("2026-03-29T01:30:00Z","Europe/Warsaw"),/03:30.*GMT\+2/);
 assert.match(flightTime("2026-10-25T00:30:00Z","Europe/Warsaw"),/02:30.*GMT\+2/);
 assert.match(flightTime("2026-10-25T01:30:00Z","Europe/Warsaw"),/02:30.*GMT\+1/);
 assert.match(flightTime("2026-10-24T22:40:00Z","America/New_York"),/24\.10\.2026.*18:40.*GMT-4/);
 assert.match(flightTime("2026-10-24T22:40:00Z","Europe/London"),/24\.10\.2026.*23:40/);
 assert.equal(flightDayShift("2026-10-24T01:00:00Z","2026-10-24T02:00:00Z","Asia/Tokyo","America/Los_Angeles"),"-1 dzień");
 assert.equal(flightDayShift("2026-10-24T01:00:00Z","2026-10-26T02:00:00Z","UTC","UTC"),"+2 dni");
});

test("offset-aware values are converted once; unknown clocks and zones stay explicit",()=>{
 const localized=flightTime("2026-10-25T00:40:00+02:00","Europe/Warsaw");
 assert.equal(localized,flightTime("2026-10-24T22:40:00Z","Europe/Warsaw"));
 for(const value of [null,"2026-10-24","2026-10-24T22:40:00",localized,"bad"])
  assert.equal(flightTime(value,"Europe/Warsaw"),null);
 assert.match(flightTime("2026-10-24T22:40:00Z","Unknown/Zone"),/22:40 UTC.*brak strefy/);
 assert.equal(flightDayShift("2026-10-24T22:00:00Z","2026-10-25T02:00:00Z",null,"Europe/Warsaw"),null);
});

test("unknown or invalid destination intervals never become zero",()=>{
 for(const value of [null,undefined,-1,NaN,Infinity])assert.equal(destinationInterval(value),null);
 assert.equal(destinationInterval(0),"0 godz. 0 min");
});

test("outbound and return airports and timezones are independent",()=>{
 const f={origin_airport:"WRO",destination_airport:"STN",origin_timezone:"Europe/Warsaw",destination_timezone:"Europe/London",
  return_origin_airport:"LTN",return_destination_airport:"WRO",return_origin_timezone:"Europe/London",return_destination_timezone:"Europe/Warsaw",
  outbound_stops:0,return_stops:1};
 const {outbound,inbound}=flightLegs(f);
 assert.deepEqual([outbound.origin,outbound.destination,inbound.origin,inbound.destination],["WRO","STN","LTN","WRO"]);
 assert.equal(inbound.originZone,"Europe/London");assert.equal(inbound.destinationZone,"Europe/Warsaw");
 assert.equal(outbound.stops,0);assert.equal(inbound.stops,1);
 const unknown=flightLegs({origin_airport:"WRO",destination_airport:"STN",origin_timezone:"Europe/Warsaw",destination_timezone:"Europe/London"});
 assert.equal(unknown.inbound.origin,undefined);assert.equal(unknown.inbound.destination,undefined);
 assert.equal(unknown.inbound.originZone,undefined);assert.equal(unknown.inbound.destinationZone,undefined);
 assert.equal(flightLegs(undefined).outbound.origin,undefined);
});
