import {readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
async function files(dir){
 const result=[];
 for(const item of await readdir(dir,{withFileTypes:true})){
  if(item.name==='attachments')continue;
  const name=path.join(dir,item.name);
  if(item.isDirectory())result.push(...await files(name));else result.push(name);
 }
 return result;
}
const all=await files(root),matrix=[],lighthouse=[];
for(const name of all){
 if(/^baseline-(pl|en|ru|uk)\.json$/.test(path.basename(name))){
  const b=JSON.parse(await readFile(name,'utf8'));
  matrix.push({locale:b.locale,pages:b.records.length,widthChecks:b.records.reduce((n,r)=>n+(r.viewports?.length??0),0),
   violations:b.records.flatMap(r=>r.violations??[]),overflows:b.records.flatMap(r=>(r.viewports??[]).filter(v=>v.overflow)),
   pageFailures:b.records.filter(r=>r.error||r.status!==200),errors:b.errors,external:b.external,
   needsReview:[...new Set(b.records.flatMap(r=>r.needsReview??[]))]});
 }
 if(path.basename(name)==='lighthouse.json'){
  const r=JSON.parse(await readFile(name,'utf8'));
  lighthouse.push({path:new URL(r.finalDisplayedUrl).pathname,device:r.configSettings.formFactor,
   version:r.lighthouseVersion,fetchTime:r.fetchTime,browser:r.environment.hostUserAgent,
   performance:r.categories.performance.score,accessibility:r.categories.accessibility.score,
   lcpMs:r.audits['largest-contentful-paint'].numericValue,cls:r.audits['cumulative-layout-shift'].numericValue,
   tbtMs:r.audits['total-blocking-time'].numericValue,warnings:r.runWarnings,
   report:path.relative(root,name).replaceAll('\\','/')});
 }
}
const runs={};
for(const name of ['selected','matrix-run','lighthouse-run'])runs[name]=JSON.parse(await readFile(path.join(root,name+'.json'),'utf8')).stats;
await writeFile(path.join(root,'summary.json'),JSON.stringify({matrix,lighthouse,runs,screenshots:all.filter(n=>n.endsWith('.png')).length},null,2)+'\n');
console.log(JSON.stringify({matrix:matrix.map(m=>({locale:m.locale,pages:m.pages,widthChecks:m.widthChecks})),lighthouse,runs},null,2));
