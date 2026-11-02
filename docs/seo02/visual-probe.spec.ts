import {test,expect} from '@playwright/test';
import config from '../playwright.config';
const servers=config.webServer;
if(!Array.isArray(servers)||!servers[0]?.url)throw new Error('Fixture URL required');
const api=new URL(servers[0].url).origin;
test('KRK context heading is visible in a normal mobile viewport',async({page,request},info)=>{
 await page.setViewportSize({width:320,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 expect((await request.post(`${api}/__test__/growth`)).ok()).toBe(true);
 try{
  await page.goto('/from/KRK');
  const context=page.locator('[data-airport-context]'),heading=context.getByRole('heading',{level:2});
  await expect(heading).toHaveText('Lotnisko i dalszy plan');
  await page.evaluate(()=>document.fonts.ready);
  await context.evaluate(element=>window.scrollTo(0,scrollY+element.getBoundingClientRect().top-16));
  await expect(heading).toBeVisible();
  const rect=await heading.boundingBox();expect(rect!.y).toBeGreaterThanOrEqual(16);expect(rect!.y+rect!.height).toBeLessThan(844);
  const measurements=await heading.evaluate(element=>({text:element.textContent,rect:element.getBoundingClientRect().toJSON(),display:getComputedStyle(element).display,visibility:getComputedStyle(element).visibility,overflow:document.documentElement.scrollWidth>innerWidth}));
  expect(measurements.overflow).toBe(false);
  await info.attach('visual-heading',{body:JSON.stringify(measurements,null,2),contentType:'application/json'});
  await page.screenshot({path:info.outputPath('KRK-viewport.png'),scale:'css'});
  await context.screenshot({path:info.outputPath('KRK-context.png'),scale:'css'});
 }finally{expect((await request.delete(`${api}/__test__/growth`)).ok()).toBe(true);}
});
