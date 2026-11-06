import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='docs/h3-18b8/',copy='.cache/aud05-h3-18b8-20261106/';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const before=JSON.parse(readFileSync(out+'before-source.json','utf8'));
const rows=before.map(row=>{const after=hash(row.path);assert.equal(after,hash(copy+row.path),row.path);if(row.path.startsWith('apps/web/'))assert.equal(row.sha256,hash('.cache/aud05-h3-18b7-20261106/'+row.path),'before build source '+row.path);return {...row,after};});
const runtimeDelta=rows.filter(row=>row.sha256!==row.after);
assert.deepEqual(runtimeDelta.map(row=>row.path),['apps/web/src/app/components/consent-controls.tsx']);
const tests=['consent-session-navigation.spec.ts','saved-revisit-observability.spec.ts','trip-update-analytics.spec.ts','consent.spec.ts'];
for(const name of tests){const p='apps/web/tests/'+name;assert.equal(readFileSync(p,'utf8').replaceAll(':8100',':8125').replaceAll(':3100',':3125'),readFileSync(copy+p,'utf8'),p);}
writeFileSync(out+'source-parity.json',JSON.stringify(rows,null,2)+'\n');
const result={matchingRuntimeFiles:rows.length,matchingBrowserSpecs:tests.length,runtimeDelta:runtimeDelta.map(row=>({path:row.path,before:row.sha256,after:row.after})),build:readFileSync(copy+'apps/web/.next/BUILD_ID','utf8').trim(),previousBuild:readFileSync('.cache/aud05-h3-18b7-20261106/apps/web/.next/BUILD_ID','utf8').trim(),copy};
assert.notEqual(result.build,result.previousBuild);writeFileSync(out+'parity-summary.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
