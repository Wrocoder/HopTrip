// Read-only production review; never submits an external booking or sends analytics.
const {chromium}=require('../../apps/web/node_modules/playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'offers-snapshot.json'),'utf8').replace(/^\uFEFF/,''));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/analytics/events',r=>r.abort());
 const report={checkedAtUtc:new Date().toISOString(),analyticsBlocked:true,pages:[]};
 try {
  const page=await context.newPage();
  const urls=['https://hoptrip.pl/from/WRO?utm_source=instagram&utm_medium=organic_social&utm_campaign=wro-weekend&utm_content=carousel_20261012',
   'https://hoptrip.pl/deals?origin=WRO&duration_min=2&duration_max=4&sort=price&utm_source=facebook&utm_medium=organic_social&utm_campaign=wro-weekend&utm_content=weekly_20261012',
   ...snapshot.offers.map(o=>`https://hoptrip.pl/deals/${o.slug}`)];
  for(const url of urls){
   const response=await page.goto(url,{waitUntil:'networkidle',timeout:60000});
   const dismiss=page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true});
   if(await dismiss.isVisible())await dismiss.click();
   const row={url,status:response.status(),heading:await page.locator('h1').innerText(),finalUrl:page.url()};
   if(response.status()!==200)throw Error(`Bad page status: ${url}`);
   const offer=snapshot.offers.find(o=>url.endsWith(o.slug));
   if(offer){
    row.observedPrice=await page.locator('.detail-summary .deal-price').innerText();
    const expected=Number(offer.flight_price_pln).toFixed(2).replace('.',',');
    if(!row.observedPrice.includes(expected))throw Error('Price differs from snapshot');
    row.flightLink=await page.locator('a.cta').getAttribute('href');
    if(!row.flightLink?.includes('/go/'))throw Error('No flight action');
    const calculator=page.locator('#calculator');
    row.budgetVisible=await calculator.count()===1;
    await page.locator('#budget-people').fill('2');
    await page.locator('#budget-hotel').fill('100');
    row.budgetEditable=await page.locator('#budget-hotel').inputValue()==='100';
    row.disclaimer=await calculator.innerText();
    await page.screenshot({path:path.join(__dirname,offer.slug+'.png'),fullPage:false});
   }
   if(url.includes('/deals?')){
    row.origin=await page.locator('input[name="origin"]').inputValue();
    if(!row.origin.includes('WRO'))throw Error('Origin not preserved');
   }
   report.pages.push(row);
  }
  report.passed=true;
 } finally {
  fs.writeFileSync(path.join(__dirname,'public-check.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
 }
 console.log(JSON.stringify({passed:report.passed,pages:report.pages.length}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
