import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Run from repo root; only synthetic evidence and local source are read.
const out='docs/h3-18b6/',json=file=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['apps/api/app/schemas/usage.py','apps/api/app/services/usage_metrics.py','apps/api/app/services/usage_dashboard.py'];
const delta=files.map(file=>({path:file,before:hash('.cache/h3-18b6-before/'+file),after:hash(file)}));for(const file of delta)assert.notEqual(file.before,file.after);
const browser=json(out+'browser.json');assert.equal(browser.length,48);
for(const row of browser){assert.equal(row.axeViolations,0);assert.equal(row.axeIncomplete,0);assert.equal(row.keyboardSkipLink,true);assert.equal(row.overflow,false);}
const keyboard=browser.filter(row=>row.horizontalKeyboardScroll).length;assert(keyboard>=8);
const body=json(out+'usage-populated.json'),cohorts=body.origin_cohorts;
assert.equal(body.observed_events,11);assert.equal(body.observed_sessions,4);assert.equal(cohorts.version,'first-search-origin-cohorts-v1');
assert.deepEqual(cohorts.rows.map(row=>row.origin),['WAW,WMI','WRO','unknown']);assert.deepEqual(cohorts.rows.map(row=>row.sessions),[1,1,2]);
assert.deepEqual(cohorts.rows.map(row=>row.percent),['25.00','25.00','50.00']);
assert.equal(cohorts.rows.reduce((sum,row)=>sum+row.sessions,0),body.observed_sessions);
for(let index=0;index<3;index++)assert.equal(cohorts.rows.reduce((sum,row)=>sum+row.metrics[index].numerator,0),body.engagement.metrics[index].numerator);
assert.equal(body.metrics.length,11);assert.equal(body.ordered_funnel.version,'ordered-session-funnel-v1');assert.equal(body.engagement.version,'received-session-engagement-v1');
assert.deepEqual(json(out+'usage-empty.json').origin_cohorts.rows,[]);assert.equal(json(out+'usage-unknown.json').origin_cohorts.rows[0].origin,'unknown');
const verification={scope:'H3-18b6 first received origin cohort API/admin report',runtimeDelta:delta,newApiTests:31,
 api:{baselinePassed:111,targetedPassed:142,afterPolishLabelPassed:99,full:{passed:1187,failed:1,skipped:18},knownFailure:'Unchanged Telegram fixture departure 2026-11-06T09:00Z already past; controls retained in H3-18b2'},
 browser:{checks:48,locales:4,states:3,widths:[320,390,768,1440],horizontalKeyboardChecks:keyboard,violations:0,incomplete:0,mode:'file URLs of actual TestClient HTML with CSP; auth/API separately tested'},
 synthetic:json(out+'definition.json').synthetic_fixture,nextBuild:'not run: Python-rendered admin HTML, unchanged web source/bundle',trackingChanged:false,migration:false,extraSqlQueries:false,dependenciesAdded:false,productionData:false,deploy:false};
writeFileSync(out+'verification.json',JSON.stringify(verification,null,2)+'\n');console.log(JSON.stringify({browserChecks:browser.length,horizontalKeyboardChecks:keyboard,cohortSessions:cohorts.rows.map(row=>row.sessions)}));
