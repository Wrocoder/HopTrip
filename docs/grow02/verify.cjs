const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');process.chdir(root);
const out='docs/grow02',before='.cache/grow02-before',copy='.cache/aud05-grow02';
const read=f=>fs.readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const originals=json(before+'/manifest.json');
const runtime=['apps/api/app/config.py','apps/api/app/main.py','apps/api/app/models/__init__.py','apps/api/app/services/alert_digests.py'];
const roadmap=['docs/HOPTRIP_PROGRESS.md','docs/HOPTRIP_AUDIT.md','docs/HOPTRIP_DECISIONS.md','docs/HOPTRIP_TEST_PLAN.md'];
const addedCode=['apps/api/app/api/telegram.py','apps/api/app/models/telegram.py','apps/api/app/schemas/telegram.py','apps/api/app/services/alert_matching.py','apps/api/app/services/telegram_delivery.py','apps/api/app/services/telegram_subscriptions.py','apps/api/app/services/telegram_text.py','apps/api/app/services/telegram_transport.py','apps/api/app/jobs/telegram_scheduler.py','apps/api/alembic/versions/0021_telegram_alerts.py','apps/api/tests/test_telegram.py'];
const allowed=[...runtime,'apps/api/tests/test_postgres.py',...roadmap];
const changed=Object.keys(originals).filter(f=>!fs.existsSync(f)||hash(f)!==originals[f]);
assert.deepEqual(changed.filter(f=>!allowed.includes(f)),[],'Unexpected pre-existing edits');assert.equal(changed.length,allowed.length);
const listed=[...new Set(cp.execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:30*1024*1024}).split('\0').filter(Boolean))];
const added=listed.filter(f=>!(f in originals));
assert.deepEqual(added.filter(f=>!f.startsWith(out+'/')&&!addedCode.includes(f)),[],'Unexpected new files');
for(const f of addedCode)assert.ok(added.includes(f),f+' not present');
for(const f of ['docs/HOPTRIP_MASTER_PLAN.md','apps/web/next-env.d.ts','apps/web/playwright.config.ts','apps/api/tests/e2e_app.py','docs/telegram-notifications.md','scripts/setup-notifications.py'])if(f in originals)assert.equal(hash(f),originals[f],f+' changed');
let parityFiles=0;const parityDifferences=[];
function parity(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='__pycache__')continue;const f=path.join(dir,e.name);if(e.isDirectory())parity(f);else if(e.isFile()){if(hash(f)!==hash(path.join(copy,f)))parityDifferences.push(f.replaceAll('\\','/'));parityFiles++;}}}
parity('apps/api/app');parity('apps/web/src');parity('apps/web/public/media/destinations');
assert.deepEqual(parityDifferences,['apps/api/app/services/telegram_subscriptions.py']);
const commandFile='apps/api/app/services/telegram_subscriptions.py';
let normalized=read(commandFile);
const start=normalized.indexOf('    receipt = db.get(TelegramUpdate, update_id)'),end=normalized.indexOf('    sub = db.scalar(',start);
assert.ok(start>0&&end>start);
normalized=normalized.slice(0,start)+'    if db.get(TelegramUpdate, update_id):\n        db.rollback()\n        return\n'+normalized.slice(end);
normalized=normalized.replace("    if (sub and update_id <= sub.last_update_id and previous_at\n            and now - utc(previous_at) < timedelta(days=7)):",'    if sub and update_id <= sub.last_update_id:');
assert.equal(normalized,read(copy+'/'+commandFile),'Unexplained browser/API source difference');
const testParity={};for(const name of ['alerts.spec.ts','localized-alerts.spec.ts']){testParity[name]=read('apps/web/tests/'+name).replaceAll(':8100',':8125').replaceAll(':3100',':3125')===read(copy+'/apps/web/tests/'+name);assert.ok(testParity[name]);}
let fixture=read('apps/api/tests/e2e_app.py').replaceAll(':8100',':8125').replaceAll(':3100',':3125').replaceAll('--port 8100','--port 8125').replaceAll('--port 3100','--port 3125');
fixture=fixture.replace('from app.services import alerts','from app.services import alert_digests, alerts').replace('alerts.send_alert_mail = fixture_mail','alerts.send_alert_mail = fixture_mail\nalert_digests.send_alert_mail = fixture_mail');assert.equal(fixture,read(copy+'/apps/api/tests/e2e_app.py'));
function junit(name,tests,failures){const tag=read(`${out}/${name}.xml`).match(/<testsuite\b[^>]*>/)[0];assert.equal(Number(tag.match(/ tests="(\d+)"/)[1]),tests);assert.equal(Number(tag.match(/ failures="(\d+)"/)[1]),failures);assert.equal(Number(tag.match(/ errors="(\d+)"/)[1]),0);return {tests,failures};}
const tests={initialFocused:junit('focused-initial',114,0),initialBackend:junit('backend',857,1),initialPostgres:junit('postgres',17,3),finalBackend:junit('backend-acceptance',861,0),finalPostgres:junit('postgres-acceptance',18,0)};
const runs={},unique=new Set();let retries=0;
for(const project of ['desktop','mobile']){const r=json(`${out}/e2e-${project}.json`);assert.equal(r.stats.expected,9);assert.equal(r.stats.unexpected+r.stats.flaky+r.stats.skipped,0);assert.deepEqual(r.errors,[]);runs[project]={stats:r.stats,errors:r.errors};function walk(s){for(const p of s.specs??[])for(const t of p.tests??[])for(const r of t.results??[]){assert.equal(r.status,'passed');retries+=r.retry;unique.add(t.projectName+':'+p.title);}for(const child of s.suites??[])walk(child);}walk(r);}
assert.equal(unique.size,18);assert.equal(retries,0);
assert.ok(read(out+'/ruff-acceptance.txt').includes('All checks passed!'));assert.ok(read(out+'/mypy-acceptance.txt').includes('110 source files'));assert.ok(read(out+'/build.txt').includes('Compiled successfully'));
const migration=json(out+'/migration.json');assert.ok(migration.emailPreserved&&migration.rollbackRemovesOnlyTelegramTables);assert.equal(migration.telegramTablesAdditive.length,3);
const ports=json(out+'/ports.json');assert.equal(ports.ownListeners.length,0);
for(const name of ['postgres-stopped','postgres-epoch-stopped'])assert.ok(json(out+'/'+name+'.json').stopped);
const diff=cp.spawnSync('git',['-c','core.safecrlf=false','diff','--check'],{encoding:'utf8'});
const existingWhitespace=diff.stdout.split(/\r?\n/).filter(l=>/:\d+: trailing whitespace\.$/.test(l));assert.ok(existingWhitespace.every(l=>l.startsWith('docs/HOPTRIP_MASTER_PLAN.md:')));
fs.writeFileSync(out+'/git-check.json',JSON.stringify({exitCode:diff.status,preExistingMasterWhitespace:existingWhitespace,masterPlanUnchanged:true},null,2)+'\n');
fs.writeFileSync(out+'/verification.json','{}\n');
const broken=[],whitespace=[];let links=0;
for(const file of [out+'/README.md',...roadmap]){let text=read(file);if(roadmap.includes(file)){const original=read(before+'/'+file);if(file.endsWith('HOPTRIP_PROGRESS.md'))text=text.split(/\r?\n/).filter(l=>l.startsWith('| GROW-02 |')).join('\n')+'\n'+text.slice(text.indexOf('## Журнал GROW-02'));else{assert.ok(text.startsWith(original),file+' modified existing text');text=text.slice(original.length);}}
 for(const [i,line]of text.split(/\r?\n/).entries())if(/[\t ]+$/.test(line))whitespace.push({file,line:i+1});
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){const target=m[1].split('#')[0];if(!target||/^https?:/.test(target))continue;links++;if(!fs.existsSync(path.resolve(path.dirname(file),target)))broken.push({file,target});}}
assert.deepEqual(broken,[]);assert.deepEqual(whitespace,[]);
for(const file of [...runtime,'apps/api/tests/test_postgres.py',...addedCode])assert.ok(read(file).split(/\r?\n/).every(l=>!/[\t ]+$/.test(l)),file+' whitespace');
const progress=read('docs/HOPTRIP_PROGRESS.md');assert.ok(/^\| GROW-02 \|[^\r\n]*\| DONE \|/m.test(progress));assert.ok(/^\| GROW-01 \|[^\r\n]*\r?\n\| GROW-02 \|/m.test(progress));assert.ok(!/^\| GROW-0[34] \|/m.test(progress));
for(const file of fs.readdirSync(out).filter(f=>f.endsWith('.json')))json(out+'/'+file);
const result={task:'GROW-02',asOf:'2026-11-02',tests,backendUnique:879,telegramNewCases:72,postgresNewCases:3,runs,uniqueBrowserScenarios:unique.size,retries,parityFiles,parityDifferences,parityExplanation:'Only Telegram receipt epoch handling added after browser runs; separately covered by final Python/PG acceptance. Shared email/web sources match.',testParity,scope:{baselineFiles:Object.keys(originals).length,modifiedBaseline:changed,newFiles:added,unexpected:[],masterUnchanged:true,webAndMonitorUnchanged:true},migration,ports,localLinks:links,brokenLinks:broken,addedWhitespace:whitespace,globalGitCheck:{exitCode:diff.status,preExistingMasterWhitespace:existingWhitespace.length},realTelegramCalls:false,productionActivated:false,limitations:['Mock Telegram transport; no live bot/webhook/GUI verification','Dedicated bot and privacy/vendor/retention review required before activation','Browser scenarios are existing email regressions, not Telegram UI']};
fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({backend:861,postgres:18,browser:unique.size,retries,parityFiles,explainedDifferences:parityDifferences,localLinks:links,masterUnchanged:true,ownListeners:0}));
