// Read-only public HTTP/browser diagnostic. No deployment or invalidation.
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {chromium} from '@playwright/test';
import {staticUrls} from './check-static.mjs';
import {verifyReleaseCache} from './verify-release-cache.mjs';

const output=path.resolve('../../docs/v5-10/live');
await mkdir(output,{recursive:true});
const base='https://hoptrip.pl';
const hash=value=>createHash('sha256').update(value).digest('hex');
const report={started:new Date().toISOString(),base,expectedReleaseSha:null,mode:'read-only GET; optional consent declined; external browser requests blocked',rows:[],assets:[],browser:[],errors:[]};
const save=()=>writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2));
function summarize(html){
 const plain=html.replaceAll('\\"','"');
 const ids=[...plain.matchAll(/"b":"([^"\s]+)"/g)].map(m=>m[1]);
 return {buildIds:[...new Set(ids)],htmlSha256:hash(html),bytes:Buffer.byteLength(html),lang:html.match(/<html[^>]*lang="([^"]+)"/)?.[1]??null,h1:[...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].map(m=>m[1].replace(/<[^>]+>/g,'')),cards:(html.match(/class="deal-card-link"/g)??[]).length,assets:staticUrls(html),canonical:html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]??null};
}
const get=async(url,headers={})=>{const response=await fetch(url,{headers,signal:AbortSignal.timeout(30000),redirect:'error'});return {response,html:await response.text()};};
const listing=await get(base+'/api/v1/deals?limit=1');
const deals=JSON.parse(listing.html);
const slug=(Array.isArray(deals)?deals:deals.items)?.[0]?.slug;
if(!slug)throw Error('No public detail sample');
report.detailSlug=slug;
const routes=['/','/deals','/tanie-loty-na-weekend','/city-break','/deals/'+encodeURIComponent(slug),'/destinations/milan','/saved'];
// Alerts excluded by owner instruction to leave subscriptions untouched.
report.excluded=['/alerts (subscriptions deferred by owner)'];
for(const locale of ['pl','en','ru','uk'])for(const route of routes){
 const pathname=(locale==='pl'?'':'/'+locale)+(route==='/'?'':route)||'/';
 for(const mode of ['normal','no-cache','cache-bust']){
  const url=base+pathname+(mode==='cache-bust'?'?v5_cache_probe='+encodeURIComponent(report.started):'');
  try{
   const {response,html}=await get(url,mode==='normal'?{}:{'Cache-Control':'no-cache','Pragma':'no-cache'});
   report.rows.push({pathname,locale,mode,status:response.status,headers:Object.fromEntries(response.headers),...summarize(html)});
   if(locale==='pl'&&route==='/city-break')await writeFile(path.join(output,`city-break-${mode}.html`),html);
  }catch(error){report.errors.push({pathname,mode,error:String(error)});}
  await save();
 }
}
const assets=[...new Set(report.rows.flatMap(row=>row.assets))];
for(const url of assets){
 try{
  const response=await fetch(base+url,{signal:AbortSignal.timeout(30000),redirect:'error'}),body=Buffer.from(await response.arrayBuffer());
  report.assets.push({url,status:response.status,headers:Object.fromEntries(response.headers),bytes:body.length,sha256:hash(body)});
 }catch(error){report.errors.push({asset:url,error:String(error)});}
 await save();
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await context.route('**/*',route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!==base||!['GET','HEAD'].includes(request.method()))return route.abort();
  return route.continue();
 });
 const page=await context.newPage(),cdp=await context.newCDPSession(page);
 await cdp.send('Network.enable');
 for(const mode of ['normal','reload','disabled-cache','cache-bust']){
  if(mode==='disabled-cache')await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  const response=mode==='reload'?await page.reload({waitUntil:'networkidle'}):await page.goto(base+'/city-break'+(mode==='cache-bust'?'?v5_cache_probe='+encodeURIComponent(report.started):''),{waitUntil:'networkidle',timeout:45000});
  const html=await response.text();
  report.browser.push({mode,status:response.status(),headers:response.headers(),...summarize(html),visibleH1:await page.locator('h1').allTextContents(),visibleCards:await page.locator('.deal-card-link').count()});
  await page.screenshot({path:path.join(output,`browser-${mode}.png`)});await save();
 }
 await context.close();
}finally{await browser.close();}
report.finished=new Date().toISOString();
report.summary={httpRows:report.rows.length,buildIds:[...new Set(report.rows.flatMap(r=>r.buildIds))],statusFailures:report.rows.filter(r=>r.status!==200).length,htmlWithoutNoStore:report.rows.filter(r=>!r.headers['cache-control']?.includes('no-store')).length,assetFailures:report.assets.filter(r=>r.status!==200||!r.headers['cache-control']?.includes('immutable')).length,errors:report.errors.length};
report.checks=verifyReleaseCache(report);
await save();console.log(JSON.stringify({summary:report.summary,checks:report.checks}));
if(!report.checks.valid)process.exitCode=1;
