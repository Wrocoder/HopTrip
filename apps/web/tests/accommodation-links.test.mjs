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
 assert.equal(url.searchParams.get("lang"),"pl");
 assert.equal(url.searchParams.get("currency"),"PLN");
 assert.equal(url.searchParams.has("u"),false);
});
test("no outbound link for missing checkout, same-day or reversed stay and invalid guests",()=>{
 for(const checkout of ["","2026-11-10","2026-11-09","2026-02-30","invalid"])
  assert.equal(stay22Link({...stay,checkout}),null);
 for(const adults of ["","0","-1","1.5","NaN","1e2"])
  assert.equal(stay22Link({...stay,adults}),null);
 assert.equal(stay22Link({...stay,city:" "}),null);
 assert.equal(stay22Link({...stay,checkin:"2026-02-30"}),null);
});
test('month boundary, Unicode and maximum adults preserve a bounded supported query',()=>{
 const url=new URL(stay22Link({...stay,city:'Łódź & Málaga ?u=https://invalid.example',checkin:'2030-05-31',checkout:'2030-06-02',adults:'50'}));
 assert.equal(url.origin,'https://www.stay22.com');assert.equal(url.searchParams.get('address'),'Łódź & Málaga ?u=https://invalid.example');
 assert.equal(url.searchParams.get('checkout'),'2030-06-02');assert.equal(url.searchParams.get('adults'),'50');
 assert.equal(url.searchParams.has('u'),false);
 for(const adults of ['51','9007199254740991','9007199254740992'])assert.equal(stay22Link({...stay,adults}),null);
 const withUnsupported=stay22Link({...stay,children:'2',rooms:'3',return_arrival:'2030-06-03'});
 const params=new URL(withUnsupported).searchParams;
 for(const key of ['children','rooms','return_arrival'])assert.equal(params.has(key),false);
});
