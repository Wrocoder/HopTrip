import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Run from repository root; reads synthetic evidence and local source only.
const out='docs/h3-18b5/',json=file=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['apps/api/app/schemas/usage.py','apps/api/app/services/usage_metrics.py','apps/api/app/services/usage_dashboard.py'];
const delta=files.map(file=>({path:file,before:hash('.cache/h3-18b5-before/'+file),after:hash(file)}));
for(const file of delta)assert.notEqual(file.before,file.after);
const browser=json(out+'browser.json');assert.equal(browser.length,48);
for(const row of browser){assert.equal(row.axeViolations,0);assert.equal(row.axeIncomplete,0);assert.equal(row.keyboardSkipLink,true);assert.equal(row.overflow,false);}
const populated=json(out+'usage-populated.json');assert.equal(populated.observed_sessions,4);assert.equal(populated.observed_events,13);
assert.equal(populated.engagement.version,'received-session-engagement-v1');
assert.deepEqual(populated.engagement.metrics.map(row=>row.numerator),[1,2,2]);
assert.deepEqual(populated.engagement.metrics.map(row=>row.percent),['25.00','50.00','50.00']);
for(const row of populated.engagement.metrics)assert.equal(row.denominator,4);
assert.equal(populated.metrics.length,11);assert.equal(populated.ordered_funnel.version,'ordered-session-funnel-v1');
for(const row of json(out+'usage-empty.json').engagement.metrics){assert.equal(row.status,'no_data');assert.equal(row.percent,null);}
for(const row of json(out+'usage-zero.json').engagement.metrics){assert.equal(row.status,'available');assert.equal(row.percent,'0.00');}
const before=json(out+'empty-before-axe.json');assert.equal(before.emptyTables,1);
assert.equal(before.violations.length,0);assert(before.incomplete.some(row=>row.id==='th-has-data-cells'));
const verification={scope:'H3-18b5 received-session engagement API/admin report only',runtimeDelta:delta,newApiTests:18,
 api:{targetedPassed:111,afterFinalHtmlPassed:68,full:{passed:1156,failed:1,skipped:18},knownFailure:'Unchanged Telegram fixture departure 2026-11-06T09:00Z already past; full API before final HTML-only empty-state/copy fixes'},
 browser:{checks:48,locales:4,states:3,widths:[320,390,768,1440],violations:0,incomplete:0,mode:'file URLs of actual TestClient-rendered HTML with CSP; auth/API separately tested'},
 synthetic:json(out+'metrics.json').synthetic_fixture,
 emptyState:{before:'one empty cohort table, axe incomplete th-has-data-cells; not a confirmed violation',after:'existing localized no_data message replaces empty table'},
 migration:false,dependenciesAdded:false,trackingChanged:false,nextBuild:'not run: Python-rendered admin HTML, unchanged web bundle',productionData:false,deploy:false};
writeFileSync(out+'verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify({browserChecks:browser.length,engagement:populated.engagement}));
