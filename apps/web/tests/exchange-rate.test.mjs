import {test} from "node:test";
import assert from "node:assert/strict";
import {approximateEuro, createEurRateLoader, parseEurRate} from "../src/lib/exchange-rate.ts";

const now = Date.parse("2026-09-26T12:00:00Z");
const payload = {table:"A", code:"EUR", rates:[{mid:4.25, effectiveDate:"2026-09-25"}]};
const quote = {plnPerEuro:4.25, date:"2026-09-25"};

test("PLN is divided by PLN per EUR, rounded to whole euros", () => {
  assert.equal(approximateEuro("425.00", quote), "100\u00a0€");
  assert.equal(approximateEuro("428", quote), "101\u00a0€");
  for (const value of [null, "NaN", "-10", "", "Infinity"]) assert.equal(approximateEuro(value, quote), null);
  assert.equal(approximateEuro("425", null), null);
});

test("NBP validation accepts Friday on Saturday but rejects invalid or stale rates", () => {
  assert.deepEqual(parseEurRate(payload, now), quote);
  for (const change of [{mid:0}, {mid:-1}, {mid:"4.25"}, {mid:Infinity},
    {effectiveDate:"2026-09-27"}, {effectiveDate:"2026-09-18"}, {effectiveDate:"2026-02-30"}]) {
    assert.equal(parseEurRate({...payload, rates:[{...payload.rates[0], ...change}]}, now), null);
  }
  assert.equal(parseEurRate({...payload, code:"USD"}, now), null);
  assert.equal(parseEurRate(null, now), null);
});

test("concurrent cards share a request and refresh after an hour", async () => {
  let time = now, calls = 0;
  const load = createEurRateLoader(async () => {calls++; return Response.json(payload);}, () => time);
  assert.deepEqual(await Promise.all([load(), load(), load()]), [quote, quote, quote]);
  await load();
  assert.equal(calls, 1);
  time += 3_600_001;
  await load();
  assert.equal(calls, 2);
});

test("outage retains a recent quote but never one over seven days old", async () => {
  let time = now, failed = false;
  const load = createEurRateLoader(async () => {
    if (failed) throw new Error("offline");
    return Response.json(payload);
  }, () => time);
  await load();
  failed = true;
  time += 3_600_001;
  assert.deepEqual(await load(), quote);
  time += 7 * 86_400_000;
  assert.equal(await load(), null);
});

test("initial failure hides EUR and backs off before retry", async () => {
  let calls = 0, time = now;
  const load = createEurRateLoader(async () => {calls++; return new Response(null, {status:503});}, () => time);
  assert.equal(await load(), null);
  assert.equal(await load(), null);
  assert.equal(calls, 1);
  time += 60_001;
  assert.equal(await load(), null);
  assert.equal(calls, 2);
});
