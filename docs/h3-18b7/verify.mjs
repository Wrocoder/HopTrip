import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
const out='docs/h3-18b7/';
const read=file=>JSON.parse(readFileSync(out+file,'utf8'));
const cases=report=>{
 const result=[];
 function walk(s){for(const spec of s.specs||[])for(const t of spec.tests||[])result.push({title:spec.title,project:t.projectName,status:t.status});for(const child of s.suites||[])walk(child);}
 walk(report);return result;
};
const initial=cases(read('browser.json')),final=cases(read('browser-final.json'));
assert.equal(initial.length,30);assert.equal(initial.filter(t=>t.status==='expected').length,20);
assert.equal(final.length,10);assert(final.every(t=>t.status==='expected'));
const latest=new Map(initial.map(t=>[t.project+' '+t.title,t]));
for(const t of final)latest.set(t.project+' '+t.title,t);
assert.equal(latest.size,30);assert([...latest.values()].every(t=>t.status==='expected'));
const traces=readdirSync(out+'traces').filter(name=>name.endsWith('.json')).map(name=>({name,...read('traces/'+name)}));
const auto=traces.filter(t=>t.name.endsWith('auto-open.json'));
assert.equal(auto.length,8);
for(const t of auto){assert.equal(t.manualReturnPerformed,false);assert.equal(t.sameAnonymousSessionAcrossAutoOpen,false);assert(t.sessionRemovals.some(r=>r.storedAnalyticsConsent&&r.consentAgeMs>=0&&r.consentAgeMs<60000&&r.sessionAgeMs>=0&&r.sessionAgeMs<60000));}
const ambiguity=traces.filter(t=>t.name.endsWith('indistinguishable.json'));
assert.equal(ambiguity.length,2);assert(ambiguity.every(t=>t.semanticShapesEqual&&t.hashOnlyLocalTransitionGeneratedNewView===false));
assert.equal(traces.filter(t=>t.name.endsWith('denied.json')).length,2);
assert.equal(traces.filter(t=>t.name.endsWith('session-expiry.json')).length,2);
assert.match(readFileSync(out+'api.txt','utf8'),/104 passed/);
assert.match(readFileSync(out+'node.txt','utf8'),/pass 331/);
assert.match(readFileSync(out+'ruff.txt','utf8'),/All checks passed/);
for(const file of ['lint-final.txt','types-final.txt'])assert.equal(readFileSync(out+file,'utf8').trim(),'');
const test='apps/web/tests/saved-revisit-observability.spec.ts';
assert.equal(readFileSync(test,'utf8'),readFileSync('.cache/aud05-h3-18b7-20261106/'+test,'utf8'));
const parity=read('parity-summary.json');assert.equal(parity.runtimeDeltaSinceB6,0);
const result={task:'H3-18b7',scope:'observability audit; tests and documentation only',...parity,apiPassed:104,nodePassed:331,browser:{initialPassed:20,initialFailed:10,finalAffectedPassed:10,uniqueLatestPassed:30,newAuditCases:14,existingUpdateRegressionCases:16,autoOpenCasesWithFreshSessionClearedDespiteConsent:8,semanticAmbiguityCases:2},ruff:'PASS',eslint:'PASS',typescript:'PASS',fullApiRerun:false,realKpiMeasured:false,next:'H3-18b8: consent hydration and anonymous-session lifecycle'};
writeFileSync(out+'verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
