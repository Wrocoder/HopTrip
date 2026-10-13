import test from "node:test";
import assert from "node:assert/strict";
import {driveAllowedOnPage} from "../src/lib/drive-policy.ts";
test("Drive page policy protects managed links independent of consent",()=>{
 for(const path of ["/deals","/deals/flight-1","/info/barcelona-airports","/info/milan-weekend","/alerts/secret","/trip","/saved"])assert.equal(driveAllowedOnPage(path),false);
 assert.equal(driveAllowedOnPage("/"),true);
 assert.equal(driveAllowedOnPage("/from/WRO"),true);
});
