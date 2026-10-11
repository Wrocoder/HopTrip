import assert from "node:assert/strict";
import {test} from "node:test";
import {presetActive,togglePreset} from "../src/lib/trip-filters.ts";

for(const [preset,values] of Object.entries({weekend:{weekend:"true"},nights:{duration_min:"2",duration_max:"3"},budget:{budget:"300"}})) {
 test(`${preset} toggles, resets pagination and preserves unrelated conditions`,()=>{
  const query=new URLSearchParams({origin:"WRO",destination:"milan",departure_from:"2030-05-01",departure_to:"2030-05-31",offset:"12"});
  const initial=Object.fromEntries(query);delete initial.offset;
  togglePreset(query,preset);
  assert.equal(presetActive(Object.fromEntries(query),preset),true);
  assert.deepEqual(Object.fromEntries(query),{...initial,...values});
  togglePreset(query,preset);
  assert.equal(presetActive(Object.fromEntries(query),preset),false);
  assert.deepEqual(Object.fromEntries(query),initial);
 });
}
test("presets replace only their own bounds and can be combined",()=>{
 const query=new URLSearchParams({budget:"150",duration_min:"4",duration_max:"8"});
 togglePreset(query,"weekend");togglePreset(query,"nights");
 assert.equal(query.get("budget"),"150");
 togglePreset(query,"budget");
 assert.deepEqual(Object.fromEntries(query),{budget:"300",duration_min:"2",duration_max:"3",weekend:"true"});
 togglePreset(query,"nights");
 assert.deepEqual(Object.fromEntries(query),{budget:"300",weekend:"true"});
});
test("false weekend and partial night range are not selected; decimal budget is selected",()=>{
 assert.equal(presetActive({weekend:"false"},"weekend"),false);
 assert.equal(presetActive({duration_min:"2"},"nights"),false);
 assert.equal(presetActive({budget:"300.00"},"budget"),true);
});
