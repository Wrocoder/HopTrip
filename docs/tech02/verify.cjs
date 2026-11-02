const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.name==='__pycache__'?[]:e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name).replaceAll('\\','/')]);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=['apps/api/app','apps/web/src','apps/web/public/media/destinations'].flatMap(walk).concat('apps/web/Dockerfile');
const differences=files.filter(p=>hash(p)!==hash('.cache/aud05-tech02/'+p));
const report=JSON.parse(fs.readFileSync('docs/tech02/e2e-acceptance.json','utf8'));const failures=[];function scan(s){for(const p of s.specs??[])for(const t of p.tests)for(const r of t.results)if(r.status!=='passed'||r.retry)failures.push({title:p.title,status:r.status});for(const c of s.suites??[])scan(c);}scan(report);
const screenshots=[];for(const p of walk('.cache/aud05-tech02/apps/web/test-results-tech02-verified'))if(p.endsWith('/recovered-alert.png')){const name=p.includes('-mobile/')?'recovered-mobile.png':'recovered-desktop.png';fs.copyFileSync(p,'docs/tech02/'+name);screenshots.push(name);}
const same=p=>hash(p)===hash('.cache/tech02-before/'+p);
const result={runtimeFiles:files.length,differences,stats:report.stats,errors:report.errors,failures,screenshots,masterUnchanged:same('docs/HOPTRIP_MASTER_PLAN.md'),nextEnvUnchanged:same('apps/web/next-env.d.ts'),foreignControlRequests:JSON.parse(fs.readFileSync('docs/tech02/port-setup-requests.json','utf8').replace(/^\uFEFF/,''))};
fs.writeFileSync('docs/tech02/verification.json',JSON.stringify(result,null,2));process.stdout.write(JSON.stringify(result));if(differences.length||failures.length||report.stats.unexpected||report.stats.skipped||report.errors.length||!result.masterUnchanged||!result.nextEnvUnchanged)process.exitCode=1;
