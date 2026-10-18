import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("local flags cover ISO countries and the reviewed destination catalog",()=>{
  const registry=readFileSync(new URL("../src/lib/country-flags.ts",import.meta.url),"utf8");
  const entries=[...registry.matchAll(/import ([A-Z]{2}) from "\.\.\/assets\/flags\/([a-z]{2})\.svg";/g)];
  const codes=new Set(entries.map(([,code])=>code));
  assert.equal(codes.size,249);
  for(const [,code,file] of entries) {
    assert.equal(code.toLowerCase(),file);
    const svg=readFileSync(new URL(`../src/assets/flags/${file}.svg`,import.meta.url),"utf8");
    assert.match(svg,/<svg\s/);
    assert.doesNotMatch(svg,/<script\b|<foreignObject\b|https?:\/\/(?!www\.w3\.org)/i);
  }
  const catalog=JSON.parse(readFileSync(new URL("../../api/app/data/destinations.json",import.meta.url),"utf8"));
  for(const row of catalog.destinations) assert.ok(codes.has(row.country_code),row.slug);
  for(const code of ["IS","TR","US","JP","ZA"]) assert.ok(codes.has(code));
});
