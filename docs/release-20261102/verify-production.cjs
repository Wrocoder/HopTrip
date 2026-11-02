// Read-only public smoke. Never opens partner links or submits subscription forms.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const requireWeb=createRequire(path.resolve('apps/web/package.json'));
const {chromium,expect}=requireWeb('@playwright/test');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 const violations=[],errors=[],blocked=[],pages=[];
 await context.addInitScript(()=>{
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  window.__releaseCsp=[];addEventListener('securitypolicyviolation',event=>window.__releaseCsp.push(event.effectiveDirective));
 });
 await context.route(/.*/,route=>{
  if(new URL(route.request().url()).origin==='https://hoptrip.pl')return route.continue();
  blocked.push(new URL(route.request().url()).origin);return route.abort('blockedbyclient');
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const pathname of ['/','/en','/ru','/uk','/deals','/saved','/info/privacy']){
   const response=await page.goto('https://hoptrip.pl'+pathname,{waitUntil:'networkidle',timeout:45000});
   expect(response.status()).toBe(200);await expect(page.locator('main h1')).toHaveCount(1);
   expect(response.headers()['strict-transport-security']).toBe('max-age=2592000');
   expect(response.headers()['content-security-policy']).toContain("object-src 'none'");
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   violations.push(...await page.evaluate(()=>window.__releaseCsp));pages.push({path:pathname,status:response.status()});
  }
  await page.goto('https://hoptrip.pl/deals');
  const link=page.locator('a.deal-card-link').first();
  let detail=null;
  if(await link.count()){
   const href=await link.getAttribute('href'),url=new URL(href,'https://hoptrip.pl');
   expect(url.origin).toBe('https://hoptrip.pl');expect(url.pathname).toMatch(/^\/deals\//);
   const response=await page.goto(url.href,{waitUntil:'networkidle',timeout:45000});
   expect(response.status()).toBe(200);await expect(page.locator('#budget-people')).toBeEnabled();
   await page.locator('.trip-navigation a[href="#calculator"]').click();
   await expect(page.locator('#calculator')).toBeFocused();detail={status:response.status(),calculator:true};
   violations.push(...await page.evaluate(()=>window.__releaseCsp));
  }
  await page.setViewportSize({width:320,height:844});await page.goto('https://hoptrip.pl');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'.cache/release-20261102/production-home-320.png'});
  for(const endpoint of ['/api/v1/alerts/status','/api/v1/telegram/status']){
   const response=await context.request.get('https://hoptrip.pl'+endpoint);expect(response.status()).toBe(200);
   const body=await response.json();expect(body.enabled).toBe(false);expect(body.delivery_enabled).toBe(false);
   pages.push({path:endpoint,status:response.status(),...body});
  }
  const admin=await context.request.get('https://hoptrip.pl/api/v1/admin/analytics/usage');expect(admin.status()).toBe(404);
  expect(violations).toEqual([]);expect(errors).toEqual([]);expect(blocked).toEqual([]);
  const report={checkedAt:new Date().toISOString(),pages,detail,adminPublicStatus:admin.status(),cspViolations:violations,pageErrors:errors,externalAttempts:blocked,mobileOverflow:false};
  fs.writeFileSync('.cache/release-20261102/public-postflight.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
