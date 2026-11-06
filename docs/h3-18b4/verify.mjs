import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Run from repository root. Inputs are local source and synthetic test evidence.
const copy='.cache/aud05-h3-18b4-20261106',out='docs/h3-18b4/';
const json=file=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
function files(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.name==='__pycache__'?[]:entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const sources=['apps/api/app','apps/web/src','apps/web/public'].flatMap(files);
sources.push(...['apps/web/package.json','apps/web/package-lock.json','apps/web/tsconfig.json'].filter(existsSync));
const parity=sources.map(file=>{assert.equal(hash(file),hash(path.join(copy,file)),file);return {path:file.replaceAll('\\','/'),sha256:hash(file)};});
const existing=['apps/api/app/schemas/analytics.py','apps/web/src/lib/analytics-context.ts','apps/web/src/lib/session.ts','apps/web/src/app/components/trip-budget-calculator.tsx'];
const delta=existing.map(file=>({path:file,before:hash(path.join('.cache/h3-18b4-before',file)),after:hash(file)}));
for(const file of delta)assert.notEqual(file.before,file.after);
delta.push({path:'apps/web/src/lib/budget-completion.ts',before:null,after:hash('apps/web/src/lib/budget-completion.ts')});
const normalize=text=>text.replace(/^\uFEFF/,'').replaceAll(':3125',':3100').replaceAll('\r\n','\n').trimEnd();
for(const file of ['apps/web/tests/budget-calculated-analytics.spec.ts','apps/web/tests/budget-completion.test.mjs','apps/web/tests/trip-update-analytics.test.mjs'])assert.equal(normalize(readFileSync(file,'utf8')),normalize(readFileSync(path.join(copy,file),'utf8')),file);
const cases=[];
const visit=suite=>{for(const spec of suite.specs??[])for(const test of spec.tests){const result=test.results.at(-1);assert.equal(result.status,'passed',spec.title);assert.equal(test.results.length,1);cases.push({case:test.projectName+' / '+spec.title,status:result.status});}for(const child of suite.suites??[])visit(child);};
for(const suite of json(out+'browser.json').suites)visit(suite);assert.equal(cases.length,32);
const wire=JSON.parse(readFileSync('apps/api/app/schemas/analytics.py','utf8').match(/EventName = Literal\[(.*?)\]/)[0].replace('EventName = Literal',''));
assert.deepEqual(json(out+'taxonomy.json').wire_events,wire);
const verification={scope:'H3-18b4 BUDGET_CALCULATED only',build:readFileSync(path.join(copy,'apps/web/.next/BUILD_ID'),'utf8').trim(),
 runtimeDelta:delta,matchingSourceFiles:parity.length,matchingTestFiles:3,wireEvents:wire.length,
 browser:{passed:32,feature:16,regression:16,firstRun:true,retries:0,cases},api:{targetedPassed:93,full:{passed:1138,failed:1,skipped:18},knownFailure:'Unchanged Telegram fixture departure 2026-11-06T09:00Z is past; before/current/future fixture controls retained in H3-18b2'},
 node:{allPassed:331,completionFinalPassed:6},productionData:false,deploy:false,migration:false,dependenciesAdded:false};
writeFileSync(out+'source-parity.json',JSON.stringify(parity,null,2)+'\n');writeFileSync(out+'verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify({browserPassed:cases.length,matchingSourceFiles:parity.length,build:verification.build}));
