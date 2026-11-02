// Run from repository root after the guarded Playwright run has completed.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root='docs/ui05',workspace='.cache/aud05-ui05';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.name==='__pycache__'?[]:e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name).replaceAll('\\','/')]);
const report=JSON.parse(fs.readFileSync(`${root}/e2e-acceptance.json`,'utf8'));
const cases=[];
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
const screenshots=[];
for(const file of walk(`${workspace}/apps/web/test-results-ui05-complete`)){
 const name=path.basename(file);if(!['copying.png','reset.png','searching.png'].includes(name))continue;
 const project=file.includes('-mobile/')?'mobile':'desktop',target=`${name.slice(0,-4)}-${project}.png`;
 fs.copyFileSync(file,`${root}/${target}`);screenshots.push(target);
}
const documents=['docs/HOPTRIP_PROGRESS.md','docs/HOPTRIP_AUDIT.md','docs/HOPTRIP_DECISIONS.md','docs/HOPTRIP_TEST_PLAN.md',`${root}/README.md`,`${root}/lint-initial-context.md`];
const brokenLinks=[];
for(const file of documents)for(const match of fs.readFileSync(file,'utf8').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
 const target=match[1].split('#')[0];if(!target||/^\w+:/.test(target)||target.includes(' '))continue;
 if(!fs.existsSync(path.resolve(path.dirname(file),target)))brokenLinks.push({file,target});
}
const whitespace=[];
for(const file of [...documents,...files.filter(p=>fs.existsSync('.cache/ui05-before/'+p)),'apps/web/tests/interaction-feedback.spec.ts',`${root}/verify.cjs`]){
 const oldPath='.cache/ui05-before/'+file,old=fs.existsSync(oldPath)?new Set(fs.readFileSync(oldPath,'utf8').split(/\r?\n/)):new Set();
 fs.readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{if(/\s+$/.test(line)&&!old.has(line))whitespace.push({file,line:i+1});});
}
for(const file of walk(root).filter(p=>p.endsWith('.json')))JSON.parse(fs.readFileSync(file,'utf8'));
const testFile='apps/web/tests/interaction-feedback.spec.ts';
const ports=JSON.parse(fs.readFileSync(`${root}/ports.json`,'utf8').replace(/^\uFEFF/,''));
const verification={parity,browserTestParity:hash(testFile)===hash(`${workspace}/${testFile}`),masterPlanUnchanged:hash('docs/HOPTRIP_MASTER_PLAN.md')===hash('.cache/ui05-before/docs/HOPTRIP_MASTER_PLAN.md'),nextEnvUnchanged:hash('apps/web/next-env.d.ts')===hash('.cache/ui05-before/apps/web/next-env.d.ts'),brokenLinks,whitespace,screenshots:screenshots.sort(),ports,e2e:{stats:report.stats,errors:report.errors,failures,testFiles,cases:cases.length}};
fs.writeFileSync(`${root}/verification.json`,JSON.stringify(verification,null,2)+'\n');
process.stdout.write(JSON.stringify(verification,null,2)+'\n');
if(differences.length||!verification.browserTestParity||!verification.masterPlanUnchanged||!verification.nextEnvUnchanged||brokenLinks.length||whitespace.length||screenshots.length!==6||ports.ownListeners.length||ports.otherPortsTouched||failures.length||report.errors?.length||report.stats.unexpected||report.stats.skipped||report.stats.flaky)process.exitCode=1;
