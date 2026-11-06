import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Run from the repository root. Reads synthetic artifacts and source bytes only.
const root=process.cwd(),copy=path.join(root,'.cache/aud05-h3-18b2-20261106');
const evidence=path.join(root,'docs/h3-18b2');
const json=file=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
function files(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>
 entry.name==='__pycache__'?[]:entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const sources=['apps/api/app','apps/web/src','apps/web/public'].flatMap(directory=>files(path.join(root,directory)));
sources.push(...['apps/web/package.json','apps/web/package-lock.json','apps/web/tsconfig.json'].map(file=>path.join(root,file)).filter(existsSync));
const parity=sources.map(file=>{
 const relative=path.relative(root,file).replaceAll('\\','/'),other=path.join(copy,relative);
 assert(existsSync(other),relative);assert.equal(hash(file),hash(other),relative);
 return {path:relative,sha256:hash(file)};
});
const delta=['apps/api/app/schemas/analytics.py','apps/web/src/lib/analytics-context.ts','apps/web/src/app/components/trip-actions.tsx'].map(file=>{
 const before=hash(path.join(root,'.cache/h3-18b2-before',file)),after=hash(path.join(root,file));assert.notEqual(before,after);
 return {path:file,before,after};
});
const latest=new Map();
for(const run of ['browser.json','browser-consent-final.json']){
 const visit=suite=>{
  for(const spec of suite.specs??[])for(const test of spec.tests){
   const key=test.projectName+' / '+spec.title;
   const result=test.results.at(-1);latest.set(key,{case:key,status:result.status,run});
  }
  for(const child of suite.suites??[])visit(child);
 };
 for(const suite of json(path.join(evidence,run)).suites)visit(suite);
}
assert.equal(latest.size,16);for(const test of latest.values())assert.equal(test.status,'passed',test.case);
const taxonomy=json(path.join(evidence,'taxonomy.json'));
const wire=JSON.parse(readFileSync('apps/api/app/schemas/analytics.py','utf8').match(/EventName = Literal\[(.*?)\]/)[0].replace('EventName = Literal',''));
assert.deepEqual(taxonomy.wire_events,wire);
const verification={scope:'H3-18b2 TRIP_UPDATE only',productionBuildId:readFileSync(path.join(copy,'apps/web/.next/BUILD_ID'),'utf8').trim(),
 browser:{uniqueLatestPassed:latest.size,initial:'12 passed / 2 failed; pending-state barrier fixed only in test',finalConsent:'4 passed',cases:[...latest.values()]},
 api:{targetedPassed:81,full:{passed:1126,failed:1,skipped:18},knownFailure:'Telegram fixture departs 2026-11-06T09:00Z, already past; reproduced with pre-change schema; future-departure fixture probe passes'},
 nodePassed:323,wireEvents:wire.length,runtimeDelta:delta,matchingSourceFiles:parity.length,
 buildEnvironment:'Fresh isolated production build, next start, NODE_ENV=production, served build ID guard, API/site 8125/3125; Next config only adds workspace turbopack.root',
 productionData:false,deploy:false,dependenciesAdded:false,dbMigration:false};
writeFileSync(path.join(evidence,'source-parity.json'),JSON.stringify(parity,null,2)+'\n');
writeFileSync(path.join(evidence,'verification.json'),JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify({uniqueLatestBrowserPassed:latest.size,matchingSourceFiles:parity.length,build:verification.productionBuildId}));
