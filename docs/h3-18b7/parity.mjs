import assert from 'node:assert/strict';
import {readFileSync,readdirSync,realpathSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const copy='.cache/aud05-h3-18b7-20261106',previous='.cache/aud05-h3-18b4-20261106',out='docs/h3-18b7/';
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
function files(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.name==='__pycache__'?[]:entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const sources=['apps/api/app','apps/web/src','apps/web/public'].flatMap(files);
sources.push(...['apps/web/package.json','apps/web/package-lock.json','apps/web/tsconfig.json'].filter(existsSync));
const parity=sources.map(file=>{
 assert.equal(hash(file),hash(path.join(copy,file)),file);
 if(file.replaceAll('\\','/').startsWith('apps/web/'))assert.equal(hash(file),hash(path.join(previous,file)),'reused build source '+file);
 return {path:file.replaceAll('\\','/'),sha256:hash(file)};
});
const b6=JSON.parse(readFileSync('docs/h3-18b6/verification.json','utf8'));
for(const file of b6.runtimeDelta)assert.equal(hash(file.path),file.after,'runtime drift since B6');
assert.equal(realpathSync(path.join(copy,'apps/web/.next')),realpathSync(path.join(previous,'apps/web/.next')));
const summary={matchingRuntimeFiles:parity.length,runtimeDeltaSinceB6:0,webSourceMatchesReusedBuild:true,build:readFileSync(path.join(copy,'apps/web/.next/BUILD_ID'),'utf8').trim(),copy,previousBuild:previous};
writeFileSync(out+'source-parity.json',JSON.stringify(parity,null,2)+'\n');writeFileSync(out+'parity-summary.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
