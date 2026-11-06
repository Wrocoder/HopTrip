import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const base=process.argv[2]||'http://127.0.0.1:58080',out=process.argv[3]||'docs/h3-release-20261106/rehearsal-http.json';
const resources=new Set(),pages=[];
for(const [p,locale] of [['/','pl'],['/deals','pl'],['/saved','pl'],['/trip','pl'],['/en/saved','en'],['/ru/saved','ru'],['/uk/saved','uk']]){
 const response=await fetch(base+p,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,p);const html=await response.text();assert(html.includes(`lang="${locale}"`),p+' language');
 for(const m of html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g))resources.add(new URL(m[1].replaceAll('&amp;','&'),base).pathname);
 pages.push({path:p,status:200,locale});
}
assert(resources.size>0);const staticChecks=[];
for(const p of resources){const response=await fetch(base+p,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,p);assert(!response.headers.get('content-type')?.includes('text/html'),p+' MIME');const bytes=Buffer.from(await response.arrayBuffer());assert(bytes.length>0);staticChecks.push({path:p,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
const health=await fetch(base+'/health/ready',{signal:AbortSignal.timeout(15000)});assert.equal(health.status,200);const ready=await health.json();assert.equal(ready.status,'ready');
const result={base,pages,staticResources:staticChecks.length,staticChecks,health:ready,checkedAt:new Date().toISOString()};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({base,pages:pages.length,staticResources:staticChecks.length,health:ready}));
