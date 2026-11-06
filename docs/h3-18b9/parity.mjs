import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='docs/h3-18b9/',copy='.cache/aud05-h3-18b9-20261106/';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const before=JSON.parse(readFileSync(out+'before-source.json','utf8'));
const rows=before.map(row=>{const after=hash(row.path);assert.equal(after,hash(copy+row.path),row.path);return {...row,after};});
const delta=rows.filter(row=>row.sha256!==row.after);
assert.deepEqual(delta.map(r=>r.path).sort(),['apps/api/app/api/analytics.py','apps/api/app/schemas/analytics.py','apps/api/app/schemas/usage.py','apps/api/app/services/usage_dashboard.py','apps/api/app/services/usage_metrics.py','apps/web/src/lib/session.ts'].sort());
const tests=['locale-analytics.spec.ts','consent-session-navigation.spec.ts','trip-update-analytics.spec.ts','details-open-analytics.spec.ts','budget-calculated-analytics.spec.ts','locale-analytics.test.mjs','trip-update-analytics.test.mjs','details-open-analytics.test.mjs','budget-completion.test.mjs'];
for(const name of tests){const p='apps/web/tests/'+name;assert.equal(readFileSync(p,'utf8').replaceAll(':8100',':8125').replaceAll(':3100',':3125'),readFileSync(copy+p,'utf8'),p);}
writeFileSync(out+'source-parity.json',JSON.stringify(rows,null,2)+'\n');
const result={matchingRuntimeFiles:rows.length,matchingWebTests:tests.length,runtimeDelta:delta.map(row=>({path:row.path,before:row.sha256,after:row.after})),build:readFileSync(copy+'apps/web/.next/BUILD_ID','utf8').trim(),copy};
writeFileSync(out+'parity-summary.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
