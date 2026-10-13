import {test} from "node:test";
import assert from "node:assert/strict";
import {encodeTrip,decodeTrip,readSavedTrips} from "../src/lib/shared-trip.ts";
import {emptyBudget} from "../src/lib/trip-budget.ts";
const trip={version:1,offer:{slug:"example",origin:"Wrocław",destination:"Mediolan",start:"2027-01-15",end:"2027-01-17",price:"123.45",observedAt:"2026-10-11T12:00:00Z"},draft:{version:1,input:{...emptyBudget,flight:"123.45",hotel:"",food:"0"},start:"2027-01-15",end:"2027-01-17",context:"private-context",review:false}};
test("shared snapshot preserves Polish labels, unknowns and zero while stripping private fields",()=>{
 const token=encodeTrip({...trip,email:"private@example.com",draft:{...trip.draft,note:"private"}});
 const decoded=decodeTrip(token);
 assert.equal(decoded.offer.origin,"Wrocław");
 assert.equal(decoded.draft.input.food,"0");
 assert.equal(decoded.draft.input.hotel,"");
 assert.equal(decoded.draft.context,"");
 assert.equal(decoded.draft.review,true);
 assert.equal(decoded.email,undefined);
 assert.equal(decoded.draft.note,undefined);
 assert.equal(decodeTrip(token).draft.input.people,"2");
 assert.ok(encodeTrip({...trip,draft:{...trip.draft,end:""}}));
 decoded.draft.input.people="5";
 assert.equal(decodeTrip(token).draft.input.people,"2");
});
test("rejects broken, oversized, unsafe and invalid snapshots including inactive money fields",()=>{
 for(const token of [null,"bad%token","a".repeat(6001),"bm90LWpzb24"] )assert.equal(decodeTrip(token),null);
 assert.equal(encodeTrip({...trip,offer:{...trip.offer,slug:"../../admin"}}),null);
 assert.equal(encodeTrip({...trip,draft:{...trip.draft,input:{...emptyBudget,hotel_total:"contact@example.com"}}}),null);
 assert.equal(encodeTrip({...trip,draft:{...trip.draft,end:"2027-01-01"}}),null);
 assert.equal(encodeTrip({...trip,draft:{...trip.draft,input:{...emptyBudget,people:"0"}}}),null);
 assert.deepEqual(readSavedTrips('{broken'),[]);
 assert.deepEqual(readSavedTrips(JSON.stringify(["bad",encodeTrip(trip)])),[encodeTrip(trip)]);
});
