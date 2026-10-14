import {test} from "node:test";
import assert from "node:assert/strict";
import {referenceCosts,referenceGrosz} from "../src/lib/reference-costs.ts";

const now=Date.parse("2026-10-08T12:00:00Z"),rate={date:"2026-10-07",plnPerEuro:4.1234};
test("reference fares convert each person's tickets to integer grosz",()=>{
 assert.equal(referenceGrosz(referenceCosts[0],2,rate,now),6268);
 assert.equal(referenceGrosz(referenceCosts[1],1,rate,now),6391);
});
test("stale, future and invalid references cannot fill the calculator",()=>{
 for(const quantity of [0,-1,1.5,366,NaN]) assert.equal(referenceGrosz(referenceCosts[0],quantity,rate,now),null);
 for(const date of ["2026-09-30","2026-10-09","invalid"])
  assert.equal(referenceGrosz(referenceCosts[0],1,{...rate,date},now),null);
 assert.equal(referenceGrosz({...referenceCosts[0],checkedAt:"2026-01-01"},1,rate,now),null);
 assert.equal(referenceGrosz(referenceCosts[0],1,{...rate,plnPerEuro:NaN},now),null);
});
