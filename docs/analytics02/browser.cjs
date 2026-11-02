// Render exact TestClient response bodies, not live/prod data or partner pages.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),web=path.join(root,'apps/web/node_modules');
const {chromium}=require(path.join(web,'@playwright/test'));
const axe=require(path.join(web,'@axe-core/playwright')),AxeBuilder=axe.default??axe;
const out=__dirname;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const results=[];
 try{
  for(const locale of ['pl','en','ru','uk'])for(const width of [1280,320]){
   // Test-only bypass permits axe injection; production headers are asserted by API tests.
   const context=await browser.newContext({viewport:{width,height:1000},bypassCSP:true});
   const requests=[];await context.route(/.*/,route=>route.abort());
   context.on('request',r=>requests.push(r.url()));const page=await context.newPage();
   try{
    const html=fs.readFileSync(path.join(out,'fixtures',`fixture-${locale}.html`),'utf8');
    assert.ok(!html.includes('<script')&&!html.includes('href="http'));
    await page.setContent(html,{waitUntil:'load'});
    assert.equal(await page.locator('html').getAttribute('lang'),locale);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('[data-metric]').count(),11);
    assert.match(await page.locator('[data-metric="search_success"] .rate').innerText(),locale==='en'?/33\.33%/:/33,33%/);
    assert.equal(await page.locator('[data-metric="returning_visitors"] .rate').innerText(),'—');
    assert.equal(await page.locator('[data-metric="device_funnel"] .rate').innerText(),'—');
    assert.equal(await page.locator('tbody tr').count(),4);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.keyboard.press('Tab');assert.equal(await page.locator('a.skip').evaluate(n=>n===document.activeElement),true);
    await page.keyboard.press('Enter');assert.equal(await page.locator('main').evaluate(n=>n===document.activeElement),true);
    await page.keyboard.press('Tab');assert.equal(await page.locator('.table-scroll').evaluate(n=>n===document.activeElement),true);
    const audit=await new AxeBuilder({page}).analyze();assert.deepEqual(audit.violations,[]);
    if(locale==='pl'&&width===1280||locale==='ru'&&width===320){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`fixture-${locale}-${width}.png`)});}
    assert.deepEqual(requests,[]);results.push({locale,width,passed:true,axeViolations:0,networkRequests:0,keyboard:true,pageOverflow:false});
   }finally{await context.close();}
  }
  const context=await browser.newContext({viewport:{width:320,height:900},bypassCSP:true});
  try{
   await context.route(/.*/,route=>route.abort());const page=await context.newPage();
   await page.setContent(fs.readFileSync(path.join(out,'fixtures','fixture-empty.html'),'utf8'));
   assert.equal(await page.locator('[data-metric] .rate').allTextContents().then(values=>values.every(v=>v==='—')),true);
   assert.equal(await page.locator('tbody tr').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
   results.push({locale:'pl',width:320,empty:true,passed:true,axeViolations:0,pageOverflow:false});
  }finally{await context.close();}
 }finally{await browser.close();}
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({asOf:'2026-11-02',dataset:'synthetic TestClient fixtures, not production',mode:'setContent response bodies, no HTTP auth or live navigation in browser',tests:results.length,results,fullPageAxeScans:results.length,unexpected:0},null,2)+'\n');
 console.log(JSON.stringify({browserCases:results.length,axeScans:results.length,unexpected:0,productionAccess:false}));
})().catch(error=>{fs.writeFileSync(path.join(out,'browser-error.txt'),error.stack+'\n');console.error(error);process.exitCode=1;});
