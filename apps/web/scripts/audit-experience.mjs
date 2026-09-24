import {chromium} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {mkdir,writeFile} from "node:fs/promises";

const base=new URL(process.argv[2] ?? "http://127.0.0.1:58080").origin;
const browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
const report={base,checkedAt:new Date().toISOString(),accessibility:[],mobile:[],failures:[]};
const check=(ok,message)=>{if(!ok) report.failures.push(message);};
try {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
 const page=await context.newPage();
 const xml=await (await context.request.get(`${base}/sitemap.xml`)).text();
 const paths=await page.evaluate(xml=>[...new DOMParser().parseFromString(xml,"application/xml").querySelectorAll("loc")].map(n=>new URL(n.textContent).pathname),xml);
 for(const path of [...paths,"/deals"]) {
  await page.goto(`${base}${path}`);
  const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  const violations=result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
  report.accessibility.push({path,violations,needsReview:result.incomplete.map(v=>v.id)});
  check(violations.length===0,`${path}: ${violations.map(v=>v.id).join(", ")}`);
 }
 // A real keyboard path: bypass repeated navigation, then reach the article breadcrumbs.
 await page.goto(`${base}/info/wro-airport`);
 await page.keyboard.press("Tab");
 check(await page.locator('a[href="#content"]').evaluate(n=>n===document.activeElement),"keyboard: skip link is not first");
 await page.keyboard.press("Enter");
 check(await page.locator("#content").evaluate(n=>n===document.activeElement),"keyboard: skip link does not focus content");
 await page.keyboard.press("Tab");
 check(await page.locator('.breadcrumbs a[href="/"]').evaluate(n=>n===document.activeElement),"keyboard: breadcrumb is not reachable");
 check(await page.locator('.breadcrumbs a[href="/"]').evaluate(n=>getComputedStyle(n).outlineStyle!=="none"),"keyboard: no visible focus outline");
 await page.setViewportSize({width:320,height:740});
 await page.addStyleTag({content:"html { font-size: 200% !important; }"});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"article: overflow at 320px with enlarged text");
 await page.goto(`${base}/deals`);
 let foundSummary=false;
 for(let tab=0;tab<30;tab++) {
  await page.keyboard.press("Tab");
  foundSummary=await page.locator(".advanced-filters summary").evaluate(n=>n===document.activeElement);
  if(foundSummary) break;
 }
 check(foundSummary,"keyboard: advanced filters are not reachable");
 if(foundSummary) {
  await page.keyboard.press("Space");
  check(await page.locator(".advanced-filters").evaluate(n=>n.open),"keyboard: advanced filters do not expand");
  await page.keyboard.press("Tab");
  check(await page.locator('input[name="departure_from"]').evaluate(n=>n===document.activeElement),"keyboard: date field is not reachable");
 }
 await context.close();

 // Cold browser cache, mobile viewport, 1.6 Mbps down / 750 Kbps up, 150ms RTT, 4x CPU.
 for(const path of process.argv.includes("--accessibility-only") ? [] : ["/","/info","/info/wro-airport"]) {
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
  const tab=await mobile.newPage();
  const cdp=await mobile.newCDPSession(tab);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
  await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});
  await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
  let bytes=0;
  cdp.on("Network.loadingFinished",e=>{bytes+=e.encodedDataLength;});
  await tab.addInitScript(()=>{
   window.__measure={lcp:0,cls:0,longTasks:0};
   new PerformanceObserver(list=>{for(const e of list.getEntries()) window.__measure.lcp=e.startTime;}).observe({type:"largest-contentful-paint",buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries()) if(!e.hadRecentInput) window.__measure.cls+=e.value;}).observe({type:"layout-shift",buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries()) window.__measure.longTasks+=Math.max(0,e.duration-50);}).observe({type:"longtask",buffered:true});
  });
  await tab.goto(`${base}${path}`);
  await tab.waitForTimeout(2000);
  const metrics=await tab.evaluate(()=>({...window.__measure,ttfb:performance.getEntriesByType("navigation")[0].responseStart}));
  report.mobile.push({path,...metrics,bytes});
  check(metrics.lcp>0 && metrics.lcp<4000,`${path}: mobile lab LCP exceeds 4s`);
  check(metrics.cls<0.1,`${path}: mobile lab layout shift exceeds 0.1`);
  check(bytes<1500000,`${path}: initial transfer exceeds 1.5MB`);
  await mobile.close();
 }
} finally {
 await browser.close();
 await mkdir("test-results",{recursive:true});
 await writeFile("test-results/experience-audit.json",JSON.stringify(report,null,2));
 console.log(JSON.stringify({pages:report.accessibility.length,mobile:report.mobile,failures:report.failures},null,2));
}
process.exitCode=report.failures.length ? 1 : 0;
