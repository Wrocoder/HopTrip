// Read-only public baseline. No consent acceptance, forms or outbound booking clicks.
const {createRequire}=require('node:module');
const fs=require('node:fs/promises'),path=require('node:path'),zlib=require('node:zlib'),os=require('node:os');
const deps=createRequire(path.resolve('apps/web/package.json'));
const {chromium}=deps('@playwright/test');
const base='https://hoptrip.pl',output=__dirname;
const percentile=(items,p)=>[...items].sort((a,b)=>a-b)[Math.ceil(items.length*p)-1];
(async()=>{
 const report={at:new Date().toISOString(),base,environment:{os:os.type(),release:os.release(),arch:os.arch(),cpu:os.cpus()[0].model,logicalCPUs:os.cpus().length,node:process.version},api:[],pages:[],network:[],errors:[]};
 const browser=await chromium.launch({channel:'chrome'});report.environment.browser=browser.version();
 try{
  const ctx=await browser.newContext(),page=await ctx.newPage();page.setDefaultTimeout(20000);
  report.robots={status:0};const robots=await ctx.request.get(base+'/robots.txt');report.robots={status:robots.status(),body:await robots.text()};
  const sitemap=await ctx.request.get(base+'/sitemap.xml');const xml=await sitemap.text();
  const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).href);
  report.sitemap={status:sitemap.status(),urls,count:urls.length,unique:new Set(urls).size};
  const catalog=await ctx.request.get(base+'/api/v1/deals?limit=1');
  const data=await catalog.json();const deal=(Array.isArray(data)?data:data.items)?.[0];
  const detail=deal?.slug?'/deals/'+encodeURIComponent(deal.slug):null;
  for(const endpoint of ['/health/ready','/api/v1/deals?include_total=true&limit=12',...(detail?['/api/v1'+detail]:[])]){
   const samples=[];
   for(let index=0;index<5;index++){
    const start=performance.now();const response=await ctx.request.get(base+endpoint);const body=await response.body();
    samples.push({ms:performance.now()-start,status:response.status(),bodyBytes:body.length});
   }
   report.api.push({endpoint,samples,medianMs:percentile(samples.map(s=>s.ms),.5),p95Ms:percentile(samples.map(s=>s.ms),.95)});
  }
  const paths=['/','/deals','/deals?origin=WRO','/en/deals','/ru/deals','/uk/deals','/info/price-comparison','/from/WRO','/destinations/milan','/saved','/trip','/alerts','/info/privacy',...(detail?[detail]:[])];
  for(const route of paths){
   const response=await page.goto(base+route,{waitUntil:'networkidle'});
   const rendered=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,h1:[...document.querySelectorAll('h1')].map(n=>n.textContent),
    description:document.querySelector('meta[name=description]')?.content,robots:[...document.querySelectorAll('meta[name=robots]')].map(n=>n.content),
    canonical:[...document.querySelectorAll('link[rel=canonical]')].map(n=>n.href),alternates:[...document.querySelectorAll('link[hreflang]')].map(n=>({lang:n.hreflang,href:n.href})),
    schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(n=>{try{return {type:JSON.parse(n.textContent)['@type'],validJSON:true}}catch{return {validJSON:false}}}),cards:document.querySelectorAll('.deal-card').length}));
   report.pages.push({route,status:response.status(),url:page.url(),headerRobots:response.headers()['x-robots-tag']??null,inSitemap:urls.includes(base+route),...rendered});
  }
  const noJS=await browser.newContext({javaScriptEnabled:false}),plain=await noJS.newPage();
  report.noJavaScript=[];
  for(const route of ['/','/deals','/info/price-comparison',...(detail?[detail]:[])]){
    const response=await plain.goto(base+route);report.noJavaScript.push({route,status:response.status(),title:await plain.title(),h1:await plain.locator('h1').allTextContents(),cards:await plain.locator('.deal-card').count(),mainRegions:await plain.locator('main').evaluateAll(nodes=>nodes.map(n=>({textLength:n.textContent.length,visible:!!(n.getBoundingClientRect().width&&n.getBoundingClientRect().height),containsLoading:/Ładowanie ofert/.test(n.textContent)})))});
  }await noJS.close();
  for(const width of [390,1440])for(const route of ['/','/deals','/info/price-comparison',...(detail?[detail]:[])]){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1}),tab=await context.newPage();
   const session=await context.newCDPSession(tab);await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});
   const resources=new Map();
   session.on('Network.responseReceived',({requestId,type,response})=>{const url=new URL(response.url);resources.set(requestId,{type,url:url.origin+url.pathname,status:response.status,mime:response.mimeType,fromDiskCache:response.fromDiskCache??false})});
   session.on('Network.loadingFinished',({requestId,encodedDataLength})=>{if(resources.has(requestId))resources.get(requestId).encodedBytes=encodedDataLength});
   session.on('Network.loadingFailed',({requestId,errorText})=>{if(resources.has(requestId))resources.get(requestId).error=errorText});
   await tab.goto(base+route,{waitUntil:'networkidle'});
   const timing=await tab.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {ttfbMs:n.responseStart,domContentLoadedMs:n.domContentLoadedEventEnd,loadMs:n.loadEventEnd}});
   const entries=[...resources.values()];
   const total=type=>entries.filter(e=>!type||e.type===type).reduce((sum,e)=>sum+(e.encodedBytes??0),0);
   report.network.push({width,route,timing,responses:entries.length,encodedBytes:total(),scriptEncodedBytes:total('Script'),imageEncodedBytes:total('Image'),resources:entries});
   await context.close();
  }
  await ctx.close();
  const root='apps/web/.next/static/chunks',files=[];
  async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(file.endsWith('.js')){const bytes=await fs.readFile(file);files.push({file:path.relative(root,file).replaceAll('\\','/'),rawBytes:bytes.length,gzipBytes:zlib.gzipSync(bytes).length})}}}
  await walk(root);report.localBuildJS={note:'Local build only; not the deployed revision or per-route download',files,count:files.length,rawBytes:files.reduce((s,f)=>s+f.rawBytes,0),gzipBytes:files.reduce((s,f)=>s+f.gzipBytes,0),buildId:(await fs.readFile('apps/web/.next/BUILD_ID','utf8')).trim()};
 }catch(error){report.errors.push(String(error));process.exitCode=1}
 finally{await fs.writeFile(path.join(output,'baseline.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
 console.log(JSON.stringify({pages:report.pages.length,network:report.network.length,api:report.api.map(a=>({endpoint:a.endpoint,medianMs:a.medianMs})),errors:report.errors},null,2));
})();
