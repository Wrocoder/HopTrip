import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';

for(const locale of ['pl','en','ru','uk'] as const)test(`Alicante pilot: ${locale} answer, sources, navigation and SSR`,async({page,request},info)=>{
 test.setTimeout(60000);
 const path=localizedHref('/info/alicante-airport',locale);
 await page.setViewportSize({width:info.project.name==='mobile'?320:1280,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const response=await request.get(path);expect(response.status()).toBe(200);
 const html=await response.text();expect(html.indexOf('data-alicante-arrival')).toBeGreaterThan(0);
 expect(html.indexOf('data-alicante-arrival')).toBeLessThan(html.indexOf('data-article-photo="cover"'));
 await page.goto(path);
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
 await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('h1')).toContainText('C6');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+path);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
 await expect(page.locator('link[hreflang]')).toHaveCount(5);
 const pilot=page.locator('[data-alicante-arrival]');
 await expect(pilot).toContainText('4,70 €');
 await expect(pilot.locator('time')).toHaveAttribute('datetime','2026-11-07');
 await expect(pilot.locator('a[href="https://alicanteturismo.com/como-llegar-a-alicante/"]')).toHaveCount(1);
 await expect(pilot.locator('#alicante-quick-answer')).toBeVisible();
 const answer=await pilot.locator('#alicante-quick-answer').boundingBox();expect(answer!.y).toBeLessThan(844);
 await expect(pilot.locator('tbody tr')).toHaveCount(3);
 await expect(pilot.locator('a[href="https://alicante.vectalia.es/bonos-y-tarifas/"]')).toHaveCount(1);
 const toc=pilot.locator('nav a');await expect(toc).toHaveCount(4);
 for(const anchor of await toc.all()){
  const href=(await anchor.getAttribute('href'))!;await expect(page.locator(href)).toHaveCount(1);
 }
 await expect(pilot.locator(`a[href="${localizedHref('/info/alicante-weekend',locale)}"]`)).toHaveCount(1);
 await expect(pilot.locator(`a[href="${localizedHref('/deals?destination=alicante',locale)}"]`)).toHaveCount(1);
 const audit=await new AxeBuilder({page}).include('[data-alicante-arrival]').analyze();expect(audit.violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await toc.first().focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#alicante-section-0$/);
 await page.goto(path);await page.screenshot({path:info.outputPath(`alicante-${locale}.png`),fullPage:false});
 expect(errors).toEqual([]);
});

test('Alicante pilot works without JavaScript and does not appear on another guide',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:'http://127.0.0.1:3100'});
 try{
  const page=await context.newPage();await page.goto('/info/alicante-airport');
  await expect(page.locator('[data-alicante-arrival]')).toBeVisible();
  await page.locator('[data-alicante-arrival] nav a').first().click();await expect(page).toHaveURL(/#alicante-section-0$/);
  const other=await request.get('/info/malaga-airport');expect(other.status()).toBe(200);
  expect(await other.text()).not.toContain('data-alicante-arrival');
 }finally{await context.close();}
});
