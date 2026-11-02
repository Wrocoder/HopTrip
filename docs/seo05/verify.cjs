// Documentation/data acceptance only; no servers, network, DB or application writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..');
process.chdir(root);
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const dir='docs/seo05';
const preflight=process.argv.includes('--preflight');
fs.writeFileSync(dir+'/verification.json',JSON.stringify({task:'SEO-05',status:'running',preflight},null,2)+'\n');
const data=json(dir+'/opportunities.json'),registry=json(dir+'/sources.json');
const rows=data.opportunities,sources=new Map(registry.sources.map(s=>[s.id,s]));
const results=[];
function check(name,fn){fn();results.push({name,status:'passed'});}
check('12 unique ranked opportunities; all required strategic fields; PL/pl; five focus areas',()=>{
 assert.equal(rows.length,12);assert.equal(new Set(rows.map(r=>r.id)).size,12);
 assert.equal(new Set(rows.map(r=>r.query)).size,12);
 assert.deepEqual([...new Set(rows.map(r=>r.focusArea))].sort(),['budget','event','origin','seasonal','weekend']);
 for(const [i,r] of rows.entries()){
  assert.equal(r.rank,i+1);assert.equal(r.country,'PL');assert.equal(r.language,'pl');
  for(const f of ['query','intent','seasonality','existingCoverage','targetUrl','recommendation','businessRelevance','priorityRationale','implementationGate'])assert.ok(typeof r[f]==='string'&&r[f].trim(),r.id+': '+f);
  assert.ok(['C1','C2','C3'].includes(r.priority));assert.ok(r.demandIndicators.summary);assert.ok(r.competitionIndicators.summary);
 }
});
check('all unavailable metrics are null; no fake zero volumes or SEO difficulty',()=>{
 const names=['monthlySearchVolume','gscClicks','gscImpressions','gscCtr','gscPosition','trendsIndex','cpc','keywordDifficulty'];
 for(const r of rows){assert.deepEqual(Object.keys(r.demandIndicators.metrics).sort(),names.sort());for(const n of names)assert.equal(r.demandIndicators.metrics[n],null);assert.equal(r.competitionIndicators.serpRank,null);assert.equal(r.competitionIndicators.plannerCompetition,null);}
});
check('source IDs resolve; historical proxy separated from competitor-page evidence',()=>{
 assert.equal(sources.size,registry.sources.length);
 for(const s of sources.values()){assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.checkedAt<=data.asOf);assert.ok(s.limits);}
 for(const r of rows){
  for(const id of r.evidenceSourceIds)assert.ok(sources.has(id));
  for(const id of r.demandIndicators.sourceIds)assert.equal(sources.get(id)?.kind,'historical-demand-proxy');
  for(const id of r.competitionIndicators.sourceIds)assert.equal(sources.get(id)?.kind,'competitor-page');
  if(r.priority==='C1')assert.ok(r.demandIndicators.sourceIds.includes('G26'));
  if(r.demandIndicators.granularity==='unmeasured-query')assert.equal(r.demandIndicators.sourceIds.length,0);
 }
 assert.equal(sources.get('G26').publishedAt,'2026-07-07');assert.equal(sources.get('G26').geography,'PL');
 assert.ok(registry.availability.drive.includes('isError'));assert.equal(registry.availability.trendsExplore.indices,null);
});
const ts=require(path.join(root,'apps/web/node_modules/typescript'));
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {catalogPages}=require(path.join(root,'apps/web/src/lib/catalog-pages.ts'));
const {content}=require(path.join(root,'apps/web/src/lib/content.ts'));
const {pageLocales}=require(path.join(root,'apps/web/src/lib/i18n/routing.ts'));
const {searchSeo,searchFilters}=require(path.join(root,'apps/web/src/lib/search-policy.ts'));
const publishedPaths=json('apps/web/scripts/seo-pages.json').translatedPaths;
const coverage=[];
check('every target/support URL exists in current published source and SEO inventory; no new URL',()=>{
 const urls=[...new Set(rows.flatMap(r=>[r.targetUrl,...r.supportingUrls]))].sort();
 for(const url of urls){
  assert.ok(url.startsWith('/')&&!url.includes('?')&&!url.includes('#'));
  const c=catalogPages.find(p=>p.path===url),info=url.startsWith('/info/')?content[url.slice(6)]:null;
  assert.ok(c||info,url+' missing in source');if(info){assert.ok(!info.draft&&!info.noindex,url+' not published');}
  assert.ok(publishedPaths.includes(url),url+' missing in SEO inventory');
  const locales=pageLocales(url);for(const locale of ['pl','en','ru','uk'])assert.ok(locales.includes(locale),url+': '+locale);
  coverage.push({url,exists:true,indexation:'reviewed/published in local source',title:c?.title??info.title,locales,routes:c?.links??info.routes??[]});
 }
 for(const r of rows){assert.equal(r.targetExists,true);assert.equal(r.targetIndexation,'existing-indexable');}
});
fs.writeFileSync(dir+'/coverage.json',JSON.stringify({asOf:data.asOf,method:'Current local TypeScript modules + SEO inventory; not a live production crawl',pages:coverage},null,2)+'\n');
check('recommendations preserve current filter/indexation and scenario contracts',()=>{
 assert.equal(searchSeo({budget:'300'},'/deals').index,false);
 assert.equal(searchSeo({origin:'WRO',budget:'300'},'/deals').index,false);
 assert.deepEqual(searchFilters({},'/city-break'),{duration_min:'2',duration_max:'4'});
 assert.equal(searchFilters({},'/tanie-loty-na-weekend').weekend,'true');
 assert.equal(searchFilters({},'/from/warszawa').origin,'WAW,WMI');
 assert.deepEqual(searchFilters({},'/routes/krakow-rome'),{origin:'KRK',destination:'rome'});
 for(const r of rows.filter(r=>!r.targetUrl.startsWith('/info/')))assert.equal(searchSeo({},r.targetUrl).index,true);
});
const allowed=['docs/HOPTRIP_PROGRESS.md','docs/HOPTRIP_AUDIT.md','docs/HOPTRIP_DECISIONS.md','docs/HOPTRIP_TEST_PLAN.md'];
const beforeFile='.cache/seo05-before/manifest.json';
let scope=null;
check('before manifest preserves master plan and all pre-existing files outside four roadmap docs',()=>{
 assert.ok(fs.existsSync(beforeFile),'Before manifest required for task-scope audit');
 const before=json(beforeFile),unexpected=[],changed=[];
 for(const [file,digest] of Object.entries(before)){
  if(!fs.existsSync(file)||hash(file)!==digest){changed.push(file);if(!allowed.includes(file))unexpected.push(file);}
 }
 assert.deepEqual(unexpected,[],'Unexpected modifications: '+unexpected.join(', '));
 const current=[...new Set(cp.execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:20*1024*1024}).split('\0').filter(Boolean))];
 const added=current.filter(f=>!(f in before));
 assert.deepEqual(added.filter(f=>!f.startsWith(dir+'/')),[],'New files outside docs/seo05');
 assert.equal(hash('docs/HOPTRIP_MASTER_PLAN.md'),before['docs/HOPTRIP_MASTER_PLAN.md']);
 scope={baselineFiles:Object.keys(before).length,baselineOutsideRoadmapUnchanged:Object.keys(before).length-allowed.length,masterPlanUnchanged:true,modifiedExisting:changed.sort(),newFiles:added.sort()};
});
const mdFiles=[dir+'/README.md',dir+'/OPPORTUNITIES.md',...allowed];
let checkedLinks=0;
check('local Markdown links in task docs/additions resolve; added text has no trailing whitespace',()=>{
 for(const file of mdFiles){
  let text=read(file);
  if(allowed.includes(file)){
   const old=read('.cache/seo05-before/'+path.basename(file));
   if(file.endsWith('HOPTRIP_PROGRESS.md'))text=text.split('\n').filter(line=>line.startsWith('| SEO-05 |')).join('\n')+'\n'+text.slice(text.indexOf('## Журнал SEO-05'));
   else {assert.ok(text.startsWith(old),file+' pre-existing content modified');text=text.slice(old.length);}
  }
  assert.ok(!/[^\S\r\n]+\r?$/m.test(text),file+' trailing whitespace');
  for(const match of text.matchAll(/\[[^\]]*\]\(([^\n)]+)\)/g)){
   const target=match[1].replace(/^<|>$/g,'').split('#')[0];
   if(!target||/^https?:\/\//.test(target))continue;
   const absolute=/^[A-Za-z]:[\\/]/.test(target)?target:path.resolve(path.dirname(file),target);
   assert.ok(fs.existsSync(absolute),file+' -> '+target);checkedLinks++;
  }
 }
 const table=read(dir+'/OPPORTUNITIES.md').split('\n').filter(l=>/^\| \d+ \/ C[123]\./.test(l));
 assert.equal(table.length,12);for(const row of table)assert.equal(row.split('|').length,11);
 for(const r of rows)assert.ok(table.some(l=>l.includes(r.query)&&l.includes('`'+r.targetUrl+'`')));
});
check('dependencies DONE; SEO-05 DONE once; no later task started',()=>{
 const p=read('docs/HOPTRIP_PROGRESS.md');
 for(const task of ['SEO-02','SEO-03','SEO-04'])assert.ok(new RegExp('\\| '+task+' \\|[^\\n]*\\| DONE \\|').test(p),task+' not DONE');
 assert.ok(new RegExp('\\| SEO-05 \\|[^\\n]*\\| '+(preflight?'IN_PROGRESS':'DONE')+' \\|').test(p),'SEO-05 status mismatch');
 assert.equal((p.match(/^\| SEO-05 \|/gm)||[]).length,1);
 assert.ok(/^\| SEO-04 \|[^\r\n]*\r?\n\| SEO-05 \|/m.test(p),'SEO-05 must be a contiguous progress-table row');
 assert.ok(!/^\| GROW-01 \|/m.test(p),'GROW-01 unexpectedly added');
});
const sourceFiles=['apps/web/src/lib/catalog-pages.ts','apps/web/src/lib/growth-pages.ts','apps/web/src/lib/search-policy.ts','apps/web/src/lib/guide-destinations.ts','apps/web/src/lib/content.ts','apps/web/src/lib/weekend-pilot-guides.ts','apps/web/src/lib/city-break-guides.ts','apps/web/src/lib/short-trip-guides.ts','apps/web/scripts/seo-pages.json','apps/api/app/api/events.py'];
fs.writeFileSync(dir+'/coverage.json',JSON.stringify({asOf:data.asOf,method:'Current local TypeScript modules + SEO inventory; not a live production crawl',sourceHashes:Object.fromEntries(sourceFiles.map(f=>[f,hash(f)])),pages:coverage},null,2)+'\n');
fs.writeFileSync(dir+'/verification.json',JSON.stringify({asOf:data.asOf,task:'SEO-05',checks:results,opportunities:rows.length,sourceCount:sources.size,coverageUrls:coverage.length,localMarkdownLinksChecked:checkedLinks,scope,runtimeTestsRun:false,limitations:['No GSC/Keyword Planner data','No Trends query series','No production crawl or deployment','Source documents reviewed separately; verifier makes no external requests']},null,2)+'\n');
console.log(JSON.stringify({checks:results.length,passed:results.length,opportunities:rows.length,coverageUrls:coverage.length,localMarkdownLinksChecked:checkedLinks,masterPlanUnchanged:scope.masterPlanUnchanged}));
