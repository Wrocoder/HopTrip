import test from "node:test";
import assert from "node:assert/strict";
import {stay22Link} from "../src/lib/accommodation-links.ts";
const stay={city:"Málaga & okolice",checkin:"2026-11-10",checkout:"2026-11-13",adults:"2"};
test("Stay22 preserves destination, edited dates and guests with HopTrip attribution",()=>{
 const url=new URL(stay22Link(stay));
 assert.equal(url.origin,"https://www.stay22.com");
 assert.equal(url.pathname,"/allez/roam");
 assert.equal(url.searchParams.get("address"),stay.city);
 assert.equal(url.searchParams.get("aid"),"hoptrip");
 assert.equal(url.searchParams.get("checkin"),stay.checkin);
 assert.equal(url.searchParams.get("checkout"),stay.checkout);
 assert.equal(url.searchParams.get("adults"),"2");
 assert.equal(url.searchParams.get("campaign"),"hoptrip_accommodation");
});
test("no outbound link for missing checkout, same-day or reversed stay and invalid guests",()=>{
 for(const checkout of ["","2026-11-10","2026-11-09","2026-02-30","invalid"])
  assert.equal(stay22Link({...stay,checkout}),null);
 for(const adults of ["","0","-1","1.5","NaN","1e2"])
  assert.equal(stay22Link({...stay,adults}),null);
 assert.equal(stay22Link({...stay,city:" "}),null);
 assert.equal(stay22Link({...stay,checkin:"2026-02-30"}),null);
});
