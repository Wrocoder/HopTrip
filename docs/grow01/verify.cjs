const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');process.chdir(root);
const out='docs/grow01',before='.cache/grow01-before',copy='.cache/aud05-grow01';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>fs.readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const originals=json(before+'/manifest.json');
const runtime=['apps/api/app/api/alerts.py','apps/api/app/services/alerts.py','apps/api/app/services/alert_digests.py','apps/api/app/jobs/alert_scheduler.py'];
const roadmap=['docs/HOPTRIP_PROGRESS.md','docs/HOPTRIP_AUDIT.md','docs/HOPTRIP_DECISIONS.md','docs/HOPTRIP_TEST_PLAN.md'];
const allowed=[...runtime,'apps/api/tests/test_alert_digests.py',...roadmap];
const changed=Object.keys(originals).filter(f=>!fs.existsSync(f)||hash(f)!==originals[f]);
assert.deepEqual(changed.filter(f=>!allowed.includes(f)),[],'Unexpected baseline changes');
assert.equal(changed.length,allowed.length,'Expected change set differs');
const listed=[...new Set(cp.execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:20*1024*1024}).split('\0').filter(Boolean))];
const added=listed.filter(f=>!(f in originals));
assert.deepEqual(added.filter(f=>!f.startsWith(out+'/')&&f!=='apps/api/tests/test_alert_safety.py'),[],'Unexpected new files');
let parityFiles=0;function parity(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='__pycache__')continue;const f=path.join(dir,e.name);if(e.isDirectory())parity(f);else if(e.isFile()){assert.equal(hash(f),hash(path.join(copy,f)),f+' source parity');parityFiles++;}}}
parity('apps/api/app');parity('apps/web/src');parity('apps/web/public/media/destinations');
for(const f of ['apps/web/Dockerfile','apps/web/src/lib/legal-content.ts','apps/web/next-env.d.ts','docs/HOPTRIP_MASTER_PLAN.md','apps/web/playwright.config.ts','apps/api/app/config.py','apps/api/tests/e2e_app.py'])assert.equal(hash(f),originals[f],f+' unexpected edit');
const testParity={};for(const name of ['alerts.spec.ts','localized-alerts.spec.ts']){testParity[name]=read('apps/web/tests/'+name).replaceAll(':8100',':8125').replaceAll(':3100',':3125')===read(copy+'/apps/web/tests/'+name);assert.ok(testParity[name]);}
let expectedFixture=read('apps/api/tests/e2e_app.py').replaceAll(':8100',':8125').replaceAll(':3100',':3125').replaceAll('--port 8100','--port 8125').replaceAll('--port 3100','--port 3125');
expectedFixture=expectedFixture.replace('from app.services import alerts','from app.services import alert_digests, alerts').replace('alerts.send_alert_mail = fixture_mail','alerts.send_alert_mail = fixture_mail\nalert_digests.send_alert_mail = fixture_mail');
assert.equal(read(copy+'/apps/api/tests/e2e_app.py'),expectedFixture,'Unexpected isolated fixture edits');
const screenshots=[
 ['desktop','alerts-subscription-preser-943c7-rms-email-updates-and-stops-desktop/alert-preferences.png','signup-pl320.png'],
 ['desktop','localized-alerts-localized-ab57b-ontracts-and-private-tokens-desktop/alerts-en.png','settings-en-desktop.png'],
 ['mobile','localized-alerts-localized-ab57b-ontracts-and-private-tokens-mobile/alerts-ru.png','settings-ru-mobile.png'],
 ['mobile','localized-alerts-localized-ab57b-ontracts-and-private-tokens-mobile/alerts-uk.png','settings-uk-mobile.png']
];
for(const [project,file,name]of screenshots)fs.copyFileSync(`${copy}/apps/web/test-results-grow01-${project}/${file}`,`${out}/${name}`);
const runs={};let unique=new Set(),retries=0;
for(const project of ['desktop','mobile']){const r=json(`${out}/e2e-${project}.json`);runs[project]={stats:r.stats,errors:r.errors};assert.equal(r.stats.expected,9);assert.equal(r.stats.unexpected+r.stats.flaky+r.stats.skipped,0);assert.deepEqual(r.errors,[]);function walk(s){for(const p of s.specs??[])for(const t of p.tests??[])for(const r of t.results??[]){assert.equal(r.status,'passed');retries+=r.retry;unique.add(t.projectName+':'+p.title);}for(const child of s.suites??[])walk(child);}walk(r);}
assert.equal(unique.size,18);assert.equal(retries,0);
function junit(name,tests,failures){const text=read(`${out}/${name}.xml`);const tag=text.match(/<testsuite\b[^>]*>/)?.[0];assert.ok(tag);assert.equal(Number(tag.match(/ tests="(\d+)"/)[1]),tests);assert.equal(Number(tag.match(/ failures="(\d+)"/)[1]),failures);assert.equal(Number(tag.match(/ errors="(\d+)"/)[1]),0);return {tests,failures};}
const tests={before:junit('before',11,11),focused:junit('focused',72,0),backend:junit('backend',789,0),postgres:junit('postgres',15,0)};
assert.ok(read(out+'/ruff.txt').includes('All checks passed!'));assert.ok(read(out+'/mypy.txt').includes('Success: no issues found'));
assert.ok(read(out+'/build.txt').includes('Compiled successfully'));
assert.ok(json(out+'/postgres-stopped.json').stopped);
const ports=json(out+'/ports.json');assert.equal(ports.ownListeners.length,0);
const current=json(out+'/postgres-instance.json');assert.equal(current.label,'GROW-01');assert.equal(current.database,'hoptrip_test');
const diff=cp.spawnSync('git',['-c','core.safecrlf=false','diff','--check'],{encoding:'utf8'});
const oldWhitespace=diff.stdout.split(/\r?\n/).filter(l=>/:\d+: trailing whitespace\.$/.test(l));
assert.ok(oldWhitespace.every(l=>l.startsWith('docs/HOPTRIP_MASTER_PLAN.md:')));
fs.writeFileSync(out+'/git-check.json',JSON.stringify({exitCode:diff.status,preExistingWhitespaceFindings:oldWhitespace,masterPlanUnchanged:true},null,2)+'\n');
fs.writeFileSync(out+'/verification.json','{}\n');
const broken=[],whitespace=[];let localLinks=0;
for(const file of [out+'/README.md',...roadmap]){let text=read(file);if(roadmap.includes(file)){const original=read(before+'/'+file);if(file.endsWith('HOPTRIP_PROGRESS.md'))text=text.split(/\r?\n/).filter(l=>l.startsWith('| GROW-01 |')).join('\n')+'\n'+text.slice(text.indexOf('## Журнал GROW-01'));else{assert.ok(text.startsWith(original),file+' modified existing text');text=text.slice(original.length);}}
 for(const [i,line]of text.split(/\r?\n/).entries())if(/[\t ]+$/.test(line))whitespace.push({file,line:i+1});
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){const target=m[1].split('#')[0];if(!target||/^https?:/.test(target))continue;localLinks++;if(!fs.existsSync(path.resolve(path.dirname(file),target)))broken.push({file,target});}}
for(const f of [...runtime,'apps/api/tests/test_alert_digests.py','apps/api/tests/test_alert_safety.py']){const lines=read(f).split(/\r?\n/);assert.ok(lines.every(l=>!/[\t ]+$/.test(l)),f+' trailing whitespace');}
assert.deepEqual(broken,[]);assert.deepEqual(whitespace,[]);
const progress=read('docs/HOPTRIP_PROGRESS.md');assert.ok(/^\| GROW-01 \|[^\r\n]*\| DONE \|/m.test(progress));assert.ok(!/^\| GROW-02 \|/m.test(progress));assert.ok(/^\| SEO-05 \|[^\r\n]*\r?\n\| GROW-01 \|/m.test(progress));
for(const f of fs.readdirSync(out).filter(f=>f.endsWith('.json')))json(out+'/'+f);
const result={task:'GROW-01',asOf:'2026-11-02',tests,runs,uniqueBrowserScenarios:unique.size,retries,sourceParityFiles:parityFiles,testParity,isolatedFixture:'Only ports + memory mail interception for both boundaries',scope:{baselineFiles:Object.keys(originals).length,modifiedBaseline:changed,newFiles:added,unexpected:[],masterPlanUnchanged:true,webConfigAndRuntimeUnchanged:true},localLinks,brokenLinks:broken,addedWhitespace:whitespace,globalGitCheck:{exitCode:diff.status,preExistingMasterWhitespace:oldWhitespace.length},ports,screenshotsReviewed:screenshots.map(s=>s[2]),productionDeliveryActivated:false,productionOrRealMailTested:false};
fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({backend:789,postgres:15,browser:unique.size,retries,parityFiles,localLinks,masterUnchanged:true,ownListeners:ports.ownListeners.length}));
