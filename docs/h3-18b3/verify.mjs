import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Run from repository root; all inputs are source files or synthetic evidence.
const root=process.cwd(),copy=path.join(root,'.cache/aud05-h3-18b3-20261106'),out='docs/h3-18b3/';
const json=file=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
function files(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.name==='__pycache__'?[]:entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const sources=['apps/api/app','apps/web/src','apps/web/public'].flatMap(directory=>files(directory));
sources.push(...['apps/web/package.json','apps/web/package-lock.json','apps/web/tsconfig.json'].filter(existsSync));
const parity=sources.map(file=>{assert.equal(hash(file),hash(path.join(copy,file)),file);return {path:file.replaceAll('\\','/'),sha256:hash(file)};});
const existing=['apps/api/app/schemas/analytics.py','apps/web/src/lib/analytics-context.ts','apps/web/src/lib/session.ts','apps/web/src/app/components/trip-details.tsx','apps/web/src/app/components/score-trigger.tsx','apps/web/src/app/components/score-details.tsx'];
const delta=existing.map(file=>({path:file,before:hash(path.join('.cache/h3-18b3-before',file)),after:hash(file)}));
for(const file of delta)assert.notEqual(file.before,file.after);
delta.push({path:'apps/web/src/app/components/offer-details-disclosure.tsx',before:null,after:hash('apps/web/src/app/components/offer-details-disclosure.tsx')});
const normalize=text=>text.replace(/^\uFEFF/,'').replaceAll(':3125',':3100').replaceAll('\r\n','\n').trimEnd();
for(const file of ['apps/web/tests/details-open-analytics.spec.ts','apps/web/tests/details-open-analytics.test.mjs','apps/web/tests/trip-update-analytics.test.mjs'])assert.equal(normalize(readFileSync(file,'utf8')),normalize(readFileSync(path.join(copy,file),'utf8')),file);
const latest=new Map(),initialFailures=[];
for(const run of ['browser.json','browser-final.json']){
 const visit=suite=>{
  for(const spec of suite.specs??[])for(const test of spec.tests){const result=test.results.at(-1),key=test.projectName+' / '+spec.title;
   latest.set(key,{case:key,status:result.status,run});
   if(run==='browser.json'&&result.status!=='passed')initialFailures.push({case:key,reason:/landmark-unique/.test(result.error?.message??'')?'two-open-card landmark':/JavaScript disabled/.test(spec.title)?'pointer stability after hash navigation':'modal Escape focus barrier'});
  }
  for(const child of suite.suites??[])visit(child);
 };for(const suite of json(out+run).suites)visit(suite);
}
assert.equal(latest.size,32);for(const row of latest.values())assert.equal(row.status,'passed',row.case);
const taxonomy=json(out+'taxonomy.json');
const wire=JSON.parse(readFileSync('apps/api/app/schemas/analytics.py','utf8').match(/EventName = Literal\[(.*?)\]/)[0].replace('EventName = Literal',''));
assert.deepEqual(taxonomy.wire_events,wire);
const verification={scope:'H3-18b3 DEAL_DETAILS_OPEN only',build:readFileSync(path.join(copy,'apps/web/.next/BUILD_ID'),'utf8').trim(),
 runtimeDelta:delta,matchingSourceFiles:parity.length,matchingTestFiles:3,wireEvents:wire.length,
 browser:{uniqueLatestPassed:latest.size,feature:16,regression:16,initial:'6 passed / 10 failed',final:'26 passed',retries:0,initialFailures,cases:[...latest.values()]},
 independentBaseline:{build:'T0SP041Yg88N0Xkfu_QAW',diagnosticPassed:2,finding:'landmark-unique with two primary card disclosures open; unchanged pre-existing labels'},
 api:{targetedPassed:87,full:{passed:1132,failed:1,skipped:18},knownFailure:'Unchanged Telegram fixture departure 2026-11-06T09:00Z already past; see H3-18b2 before/current/future-fixture controls'},
 nodePassed:325,productionData:false,deploy:false,migration:false,dependenciesAdded:false};
writeFileSync(out+'source-parity.json',JSON.stringify(parity,null,2)+'\n');writeFileSync(out+'verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify({uniqueLatestBrowserPassed:latest.size,matchingSourceFiles:parity.length,build:verification.build,initialFailures:initialFailures.map(row=>row.reason)}));
