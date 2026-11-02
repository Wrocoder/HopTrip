// From repository root, after Playwright exits and ports.json is recorded.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root='docs/tech01',workspace='.cache/aud05-tech01';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.name==='__pycache__'?[]:e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name).replaceAll('\\','/')]);
const report=read(`${root}/e2e-acceptance.json`),cases=[];
function visit(suite){
 for(const spec of suite.specs??[])for(const test of spec.tests)cases.push({title:spec.title,file:spec.file,project:test.projectName,status:test.status,results:test.results.map(r=>({status:r.status,retry:r.retry,errors:r.errors}))});
 for(const child of suite.suites??[])visit(child);
}
visit(report);
const failures=cases.filter(t=>t.status!=='expected'||t.results.some(r=>r.status!=='passed'||r.retry||r.errors?.length));
const testFiles={};for(const t of cases){const key=path.basename(t.file);testFiles[key]=(testFiles[key]??0)+1;}
const scope=['apps/api/app','apps/web/src','apps/web/public/media/destinations','apps/web/Dockerfile'];
const files=scope.flatMap(p=>fs.statSync(p).isDirectory()?walk(p):[p]);
const differences=files.filter(p=>!fs.existsSync(`${workspace}/${p}`)||hash(p)!==hash(`${workspace}/${p}`));
const parity={files:files.length,scope,workspace,differences};
fs.writeFileSync(`${root}/source-parity.json`,JSON.stringify(parity,null,2)+'\n');
const screenshots=[],contracts=[],beforeContracts=[],comparisonContracts=[];
for(const stage of ['before','complete','comparison'])for(const file of walk(`${workspace}/apps/web/test-results-tech01-${stage}`)){
 const name=path.basename(file),project=file.includes('-mobile/')?'mobile':'desktop';
 if(name==='catalog-picker.png'){
  const target=`picker-${stage==='before'?'before':stage==='complete'?'main':'after'}-${project}.png`;
  fs.copyFileSync(file,`${root}/${target}`);screenshots.push(target);
 }
 if(/^contract-\w+\.json$/.test(name)){
  const entry={project,locale:name.slice(9,-5),...read(file)};
  (stage==='before'?beforeContracts:stage==='complete'?contracts:comparisonContracts).push(entry);
 }
}
const normalize=entry=>entry.states.map(({id,...state})=>state);
const beforeAfter=beforeContracts.map(before=>{
 const after=comparisonContracts.find(c=>c.project===before.project&&c.locale===before.locale);
 return {project:before.project,locale:before.locale,matched:!!after&&JSON.stringify(normalize(before))===JSON.stringify(normalize(after))};
});
fs.writeFileSync(`${root}/contracts.json`,JSON.stringify({before:beforeContracts,main:contracts,freshComparison:comparisonContracts,beforeAfter},null,2)+'\n');
const documents=['docs/HOPTRIP_PROGRESS.md','docs/HOPTRIP_AUDIT.md','docs/HOPTRIP_DECISIONS.md','docs/HOPTRIP_TEST_PLAN.md',`${root}/README.md`],brokenLinks=[],whitespace=[];
for(const file of documents)for(const match of fs.readFileSync(file,'utf8').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
 const target=match[1].split('#')[0];if(!target||/^\w+:/.test(target)||target.includes(' '))continue;
 if(!fs.existsSync(path.resolve(path.dirname(file),target)))brokenLinks.push({file,target});
}
for(const file of [...documents,...files.filter(p=>fs.existsSync('.cache/tech01-before/'+p)),'apps/web/src/app/components/combobox.tsx','apps/web/tests/combobox-contract.spec.ts',`${root}/verify.cjs`]){
 const oldPath='.cache/tech01-before/'+file,old=fs.existsSync(oldPath)?new Set(fs.readFileSync(oldPath,'utf8').split(/\r?\n/)):new Set();
 fs.readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{if(/\s+$/.test(line)&&!old.has(line))whitespace.push({file,line:i+1});});
}
for(const file of walk(root).filter(p=>p.endsWith('.json')))read(file);
const testFile='apps/web/tests/combobox-contract.spec.ts',activeHook='apps/web/src/app/components/use-active-option.ts';
const comparison=read(`${root}/e2e-comparison.json`);
const snapshotParity=['desktop','mobile'].map(project=>({project,identical:hash(`${root}/picker-before-${project}.png`)===hash(`${root}/picker-after-${project}.png`)}));
const verification={parity,browserTestParity:hash(testFile)===hash(`${workspace}/${testFile}`),masterPlanUnchanged:hash('docs/HOPTRIP_MASTER_PLAN.md')===hash('.cache/tech01-before/docs/HOPTRIP_MASTER_PLAN.md'),nextEnvUnchanged:hash('apps/web/next-env.d.ts')===hash('.cache/tech01-before/apps/web/next-env.d.ts'),activeOptionHookUnchanged:hash(activeHook)===hash('.cache/tech01-before/'+activeHook),brokenLinks,whitespace,screenshots:screenshots.sort(),beforeAfter,contractProfiles:contracts.length,newAxeScans:contracts.flatMap(c=>c.axe).length,ports:read(`${root}/ports.json`),e2e:{stats:report.stats,errors:report.errors,failures,testFiles,cases:cases.length},comparison:{stats:comparison.stats,errors:comparison.errors}};
verification.snapshotParity=snapshotParity;
fs.writeFileSync(`${root}/verification.json`,JSON.stringify(verification,null,2)+'\n');
process.stdout.write(JSON.stringify(verification,null,2)+'\n');
if(differences.length||!verification.browserTestParity||!verification.masterPlanUnchanged||!verification.nextEnvUnchanged||!verification.activeOptionHookUnchanged||brokenLinks.length||whitespace.length||screenshots.length!==6||snapshotParity.some(p=>!p.identical)||beforeAfter.length!==2||beforeAfter.some(r=>!r.matched)||contracts.length!==8||[...contracts,...comparisonContracts].some(c=>c.axe.some(a=>a.violations.length))||verification.ports.ownListeners.length||verification.ports.otherPortsTouched||failures.length||report.errors?.length||report.stats.unexpected||report.stats.skipped||report.stats.flaky||comparison.stats.expected!==2||comparison.stats.unexpected||comparison.stats.skipped||comparison.stats.flaky||comparison.errors?.length)process.exitCode=1;
