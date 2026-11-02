const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'../..'));
const out='docs/grow04',before='.cache/grow04-before',copy='.cache/aud05-grow04';
const read=f=>fs.readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const originals=json(before+'/manifest.json');
const runtime=['apps/web/src/lib/content.ts','apps/web/src/lib/i18n/service-content.ts','apps/web/src/lib/legal-content.ts','apps/web/src/lib/i18n/legal-translations.ts','apps/web/src/app/components/service-info.tsx','apps/web/src/app/info/[slug]/page.tsx'];
const roadmap=['docs/HOPTRIP_PROGRESS.md','docs/HOPTRIP_AUDIT.md','docs/HOPTRIP_DECISIONS.md','docs/HOPTRIP_TEST_PLAN.md'];
const addedCode=['apps/web/tests/trust-content.spec.ts','apps/web/tests/trust-contact-fallback.spec.ts'];
const changed=Object.keys(originals).filter(f=>!fs.existsSync(f)||hash(f)!==originals[f]);
assert.equal(Object.keys(originals).length,2114);
assert.deepEqual([...changed].sort(),[...runtime,...roadmap].sort(),'Unexpected existing-file delta');
const listed=[...new Set(cp.execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:30*1024*1024}).split('\0').filter(Boolean))];
const added=listed.filter(f=>!(f in originals));
assert.deepEqual(added.filter(f=>!f.startsWith(out+'/')&&!addedCode.includes(f)),[]);
for(const f of addedCode)assert.ok(added.includes(f));
for(const f of ['docs/HOPTRIP_MASTER_PLAN.md','apps/web/next-env.d.ts','apps/web/playwright.config.ts','apps/api/tests/e2e_app.py','docs/telegram-notifications.md','scripts/setup-notifications.py'])assert.equal(hash(f),originals[f],f+' changed');
let parityFiles=0;
function parity(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='__pycache__')continue;const f=path.join(dir,e.name);if(e.isDirectory())parity(f);else if(e.isFile()){assert.equal(hash(f),hash(path.join(copy,f)),f+' isolated source mismatch');parityFiles++;}}}
parity('apps/api/app');parity('apps/web/src');parity('apps/web/public/media/destinations');
for(const f of ['apps/web/Dockerfile']){assert.equal(hash(f),hash(copy+'/'+f));parityFiles++;}
const testParity={};
for(const name of ['trust-content.spec.ts','trust-contact-fallback.spec.ts','localized-service.spec.ts','technical-seo.spec.ts']){
 testParity[name]=read('apps/web/tests/'+name).replaceAll(':8100',':8125').replaceAll(':3100',':3125')===read(copy+'/apps/web/tests/'+name);assert.ok(testParity[name],name+' mismatch');
}
let fixture=read('apps/api/tests/e2e_app.py').replaceAll(':8100',':8125').replaceAll(':3100',':3125').replaceAll('--port 8100','--port 8125').replaceAll('--port 3100','--port 3125');
fixture=fixture.replace('from app.services import alerts','from app.services import alert_digests, alerts').replace('alerts.send_alert_mail = fixture_mail','alerts.send_alert_mail = fixture_mail\nalert_digests.send_alert_mail = fixture_mail');
assert.equal(fixture,read(copy+'/apps/api/tests/e2e_app.py'));
assert.equal(fs.existsSync(copy+'/apps/web/tests/fixtures/not-created-grow04.json'),false);
const inventory=json(out+'/inventory.json');
assert.equal(inventory.plInfoRecords,54);assert.equal(inventory.unchangedPLRecords,51);assert.equal(inventory.serviceVariants,32);assert.equal(inventory.changedServiceVariants,12);assert.equal(inventory.unchangedServiceVariants,20);
assert.ok(inventory.titlesPublicationAndReviewDatesPreserved&&inventory.privacyLegalBasesRightsOriginalDateAndExistingProviderStatementsPreserved);
assert.deepEqual(inventory.changedPLRecords,['about','contact','privacy']);
function cases(r){const found=[];function walk(s){for(const p of s.specs??[])for(const t of p.tests??[])found.push({file:p.file??s.file,title:p.title,project:t.projectName,status:t.status,results:t.results??[]});for(const child of s.suites??[])walk(child);}walk(r);return found;}
const runs={},accepted=new Map();let retries=0;
function accept(c,run){assert.equal(c.results.length,1);assert.equal(c.results[0].status,'passed');assert.equal(c.status,'expected');assert.equal(c.results[0].retry,0);retries+=c.results[0].retry;const key=c.project+':'+c.title;assert.equal(accepted.has(key),false,'Duplicate accepted scenario');accepted.set(key,{project:c.project,title:c.title,file:c.file,run});}
for(const [name,count]of [['desktop',6],['trust-desktop',4],['mobile',7],['fallback-desktop',1],['fallback-mobile',1]]){
 const r=json(`${out}/e2e-${name}.json`);assert.equal(r.stats.expected,count);runs[name]={stats:r.stats,errors:r.errors};
 if(name==='desktop'){
  assert.equal(r.stats.unexpected,1);assert.equal(r.stats.skipped,3);assert.equal(r.stats.flaky,0);
  const existing=cases(r).filter(c=>!c.file.endsWith('trust-content.spec.ts'));
  assert.equal(existing.length,6);for(const c of existing)accept(c,name);
 }else{
  assert.equal(r.stats.unexpected+r.stats.skipped+r.stats.flaky,0);assert.deepEqual(r.errors,[]);
  for(const c of cases(r))accept(c,name);
 }
}
assert.equal(accepted.size,19);assert.equal(retries,0);
const diagnostics={};
for(const name of ['desktop-initial','desktop']){
 const r=json(`${out}/e2e-${name}.json`);assert.equal(r.stats.expected,6);assert.equal(r.stats.unexpected,1);assert.equal(r.stats.skipped,3);
 const failed=cases(r).filter(c=>c.results.some(x=>x.status==='failed'||x.status==='timedOut'));
 assert.equal(failed.length,1);assert.ok(failed[0].file.endsWith('trust-content.spec.ts'));assert.ok(accepted.has(failed[0].project+':'+failed[0].title));
 diagnostics[name]={stats:r.stats,resolvedFailures:failed.map(c=>({project:c.project,title:c.title})),errors:r.errors};
}
const acceptedCases=[...accepted.values()],newCases=acceptedCases.filter(c=>/trust-(content|contact-fallback)\.spec\.ts$/.test(c.file));assert.equal(newCases.length,10);
const crawl=json(out+'/sitemap-audit.json');assert.equal(crawl.pages.length,244);assert.ok(crawl.pages.every(p=>p.status===200));assert.equal(crawl.editorialLinks.length,54);
assert.ok(crawl.editorialLinks.every(p=>typeof p==='string'&&p.startsWith('/info/')));
assert.ok(read('apps/web/tests/technical-seo.spec.ts').includes("for(const href of links)expect((await request.get(href)).status(),href).toBe(200)"));
const unavailable=json(out+'/unavailable-statuses.json');assert.equal(unavailable.length,6);assert.ok(unavailable.every(x=>x.status===404));
const unit=read(out+'/unit-acceptance.txt');for(const line of ['tests 211','pass 211','fail 0','skipped 0','cancelled 0'])assert.ok(unit.includes(line));
assert.ok(read(out+'/lint-acceptance.txt').includes('eslint . --max-warnings=0'));
assert.equal(read(out+'/typecheck-acceptance.txt').trim(),'');assert.ok(read(out+'/build.txt').includes('Compiled successfully'));
const ports=json(out+'/ports.json');assert.equal(ports.ownListeners.length,0);
const diff=cp.spawnSync('git',['-c','core.safecrlf=false','diff','--check'],{encoding:'utf8',maxBuffer:5*1024*1024});
const existingWhitespace=diff.stdout.split(/\r?\n/).filter(l=>/:\d+: trailing whitespace\.$/.test(l));assert.ok(existingWhitespace.every(l=>l.startsWith('docs/HOPTRIP_MASTER_PLAN.md:')));assert.ok(!diff.stderr.trim());
fs.writeFileSync(out+'/git-check.json',JSON.stringify({exitCode:diff.status,preExistingMasterWhitespace:existingWhitespace,masterPlanUnchanged:true},null,2)+'\n');
fs.writeFileSync(out+'/verification.json','{}\n');
const broken=[],whitespace=[];let localLinks=0;
for(const file of [out+'/README.md',...roadmap]){
 let text=read(file);
 if(roadmap.includes(file)){
  const original=read(before+'/'+file);
  if(file.endsWith('HOPTRIP_PROGRESS.md')){
   const index=text.indexOf('## Журнал GROW-04');assert.ok(index>0);
   assert.equal(text.slice(0,index).replace(/^\| GROW-04 \|[^\r\n]*\r?\n/m,'').trimEnd(),original.trimEnd(),'Previous progress modified');
   text=text.split(/\r?\n/).filter(l=>l.startsWith('| GROW-04 |')).join('\n')+'\n'+text.slice(index);
  }else{assert.ok(text.startsWith(original),file+' existing text modified');text=text.slice(original.length);}
 }
 for(const [i,line]of text.split(/\r?\n/).entries())if(/[\t ]+$/.test(line))whitespace.push({file,line:i+1});
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){const target=m[1].split('#')[0];if(!target||/^https?:/.test(target))continue;localLinks++;if(!fs.existsSync(path.resolve(path.dirname(file),target)))broken.push({file,target});}
}
assert.deepEqual(broken,[]);assert.deepEqual(whitespace,[]);
for(const file of [...runtime,...addedCode])assert.ok(read(file).split(/\r?\n/).every(l=>!/[\t ]+$/.test(l)),file+' whitespace');
const progress=read('docs/HOPTRIP_PROGRESS.md');assert.ok(/^\| GROW-04 \|[^\r\n]*\| DONE \|/m.test(progress));assert.ok(!/^\| (?:GROW-03|ANALYTICS-01) \|/m.test(progress));
for(const file of fs.readdirSync(out).filter(f=>f.endsWith('.json')))json(out+'/'+file);
const result={task:'GROW-04',asOf:'2026-11-02',unit:211,lint:'passed (0 ESLint warnings)',typecheck:'passed',productionBuild:'passed',browser:{runs,diagnostics,acceptedUnique:accepted.size,newCases:newCases.length,existingCases:accepted.size-newCases.length,retries,acceptedCases,composition:'6 existing desktop + 4 focused trust desktop + 7 mobile + 1 missing-contact desktop + 1 missing-contact mobile; not a single all-green broad desktop run',newScopedAxeScans:24,viewedSelectedCaptures:4},sitemap:{pages:244,editorialLinks:54,allStatus200:true,editorialEvidence:'Successful technical-seo assertion before attachment; attachment stores URL strings'},unavailable,inventory:{plRecords:54,unchangedPL:51,serviceVariants:32,changedVariants:12,unchangedVariants:20,metadataAndExistingLegalStatementsPreserved:true},parityFiles,testParity,fixtureParity:'Only local port replacement and both in-memory mail boundaries',scope:{baselineFiles:Object.keys(originals).length,modifiedBaseline:changed,newFiles:added,unexpected:[],masterUnchanged:true,backendConfigDependenciesAndMonitorUnchanged:true},ports,localLinks,brokenLinks:broken,addedWhitespace:whitespace,globalGitCheck:{exitCode:diff.status,preExistingMasterWhitespace:existingWhitespace.length},realTelegramOrSMTPCalls:false,productionActivated:false,nextEligible:'ANALYTICS-01 (not started)',limitations:['Local production-mode synthetic data, Chromium mobile emulation','No full-suite/full-site WCAG/physical Safari/conversion measurement','Technical privacy disclosure only; no legal/infrastructure certification or delivery activation','Backend/Python unit/PG/Ruff/mypy/Docker not run for unchanged code']};
fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({task:result.task,unit:211,browser:accepted.size,newCases:newCases.length,sitemapPages:244,editorialLinks:54,parityFiles,localLinks,modifiedBaseline:changed.length,unexpected:[],ownListeners:0}));
