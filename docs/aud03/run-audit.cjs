// Local fixture UX evidence capture; run after starting the existing E2E servers.
// From repository root: node docs/aud03/run-audit.cjs
const {createRequire}=require('node:module');
const path=require('node:path');
const fs=require('node:fs/promises');
const deps=createRequire(path.resolve('apps/web/package.json'));
const {chromium,expect}=deps('@playwright/test');
const AxeBuilder=deps('@axe-core/playwright').default;
const base='http://127.0.0.1:3100',out=__dirname;
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const report={at:new Date().toISOString(),base,fixture:'apps/api/tests/e2e_app.py; synthetic data',pages:[],checks:{},errors:[]};
 try {
  for(const width of [320,390,768,1440]) {
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
   await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
   const page=await context.newPage();page.setDefaultTimeout(15000);
   for(const [name,route] of [['home','/'],['catalog','/deals?origin=WRO&sort=price&budget=220'],['deal','/deals/browser-13'],['budget','/info/trip-budget'],['saved','/saved'],['empty','/deals?budget=1']]) {
    await page.goto(base+route);await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('main')).toBeVisible();
    if(name==='deal'||name==='budget')await expect(page.locator('#budget-people')).toBeEnabled();
    await page.evaluate(()=>document.fonts.ready);
    await page.addStyleTag({content:'nextjs-portal{display:none}'});
    const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
     headings:[...document.querySelectorAll('main h1,main h2')].map(n=>n.textContent),
     firstCardY:document.querySelector('.deal-card')?.getBoundingClientRect().top,
     cardHeights:[...document.querySelectorAll('.deal-card')].map(n=>Math.round(n.getBoundingClientRect().height)),
     smallTargets:[...document.querySelectorAll('main button,main input,main select')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.height>0&&r.height<24}).map(n=>({tag:n.tagName,type:n.type,id:n.id,height:Math.round(n.getBoundingClientRect().height)}))}));
    const row={name,route,width,metrics};
    if(width===390||width===1440){
     const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
     row.axe={violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:axe.incomplete.map(v=>v.id)};
    }
    if(width===390||width===1440||width===320&&['home','catalog'].includes(name)) {
     row.screenshot=`${name}-${width}.png`;await page.screenshot({path:path.join(out,row.screenshot),fullPage:false});
     if(name==='deal'){await page.locator('#accommodation').screenshot({path:path.join(out,`stay-${width}.png`)});}
    }
    report.pages.push(row);await fs.writeFile(path.join(out,'evidence.json'),JSON.stringify(report,null,2)+'\n');
   }
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.setDefaultTimeout(15000);
  await page.goto(base+'/');await expect(page.locator('.consent-panel')).toBeVisible();
  await page.screenshot({path:path.join(out,'consent-390.png')});
  await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
  await page.goto(base+'/deals?origin=WRO&budget=220&sort=price');
  await page.locator('.deal-card-link').first().click();
  report.checks.detailBackHref=await page.locator('.back-link').getAttribute('href');
  await page.locator('.back-link').click();
  await expect(page).toHaveURL(base+'/deals');await expect(page.locator('[name=sort]')).toHaveValue('score');
  report.checks.afterDetailBack={url:page.url(),origin:await page.locator('[name=origin]').inputValue(),budget:await page.locator('[name=budget]').inputValue(),sort:await page.locator('[name=sort]').inputValue()};
  await page.goto(base+'/deals?origin=WRO&budget=220&sort=price');
  await page.getByRole('link',{name:'Wyczyść wszystkie filtry',exact:true}).click();
  await expect(page).toHaveURL(base+'/deals?sort=price');
  report.checks.afterReset={url:page.url(),sort:await page.locator('[name=sort]').inputValue()};
  await page.goto(base+'/');await page.keyboard.press('Tab');
  report.checks.firstTab=await page.evaluate(()=>document.activeElement.textContent);
  await page.keyboard.press('Enter');report.checks.skipFocus=await page.evaluate(()=>document.activeElement.id);
  await page.goto(base+'/deals');
  if(!await page.locator('.score-trigger').count())await page.reload();
  const trigger=page.locator('.score-trigger').first();await trigger.click();
  await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
  report.checks.scoreFocusReturned=await trigger.evaluate(n=>n===document.activeElement);
  await page.goto(base+'/deals?sort=invalid');report.checks.invalid=await page.locator('main [role=alert]').innerText();
  await page.goto(base+'/deals?budget=987653');report.checks.apiFailure=await page.locator('main [role=alert]').innerText();
  await page.goto(base+'/deals?budget=987654',{waitUntil:'commit'});
  await expect(page.getByRole('status').filter({hasText:'Ładowanie ofert'})).toBeVisible();report.checks.loading=true;
  await expect(page.locator('.result-count')).toBeVisible();
  await context.close();
 }catch(error){report.errors.push(String(error));process.exitCode=1;}
 finally{await fs.writeFile(path.join(out,'evidence.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
 console.log(JSON.stringify({pages:report.pages.length,violations:report.pages.flatMap(p=>(p.axe?.violations??[]).map(v=>({route:p.route,width:p.width,id:v.id}))),checks:report.checks,errors:report.errors},null,2));
})();
