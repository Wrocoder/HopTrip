import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {arrivalCopy,arrivalSlugs,arrivalSources} from '../src/lib/airport-arrival';

for(const slug of arrivalSlugs)for(const locale of ['pl','en','ru','uk'] as const)test(`${slug}: ${locale} arrival answer, costs and navigation`,async({page,request},info)=>{
 test.setTimeout(60000);
 await page.setViewportSize({width:info.project.name==='mobile'?320:1280,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const path=localizedHref(`/info/${slug}`,locale),response=await request.get(path);expect(response.status()).toBe(200);
 const html=await response.text();expect(html.indexOf('data-airport-arrival')).toBeGreaterThan(0);expect(html.indexOf('data-airport-arrival')).toBeLessThan(html.indexOf('data-article-photo="cover"'));
 await page.goto(path);const pilot=page.locator(`[data-airport-arrival="${slug}"]`),text=arrivalCopy[slug][locale];
 await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect(page.locator('h1')).toHaveCount(1);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+path);
 await expect(page.locator('link[hreflang]')).toHaveCount(5);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
 await expect(pilot.locator('h2').first()).toHaveText(text.title);await expect(pilot).toContainText(text.ticket);await expect(pilot).toContainText(text.detail);
 await expect(pilot.locator('time')).toHaveAttribute('datetime','2026-11-07');await expect(pilot.locator('tbody tr')).toHaveCount(3);
 for(const source of arrivalSources[slug])await expect(pilot.locator(`a[href="${source.href}"]`)).toHaveCount(1);
 for(const link of await pilot.locator('nav a').all())await expect(page.locator((await link.getAttribute('href'))!)).toHaveCount(1);
 await expect(pilot.locator('nav a')).toHaveCount(4);
 const city=slug==='malaga-airport'?'malaga':'lisbon',guide=city==='malaga'?'malaga-weekend':'lisbon-3-days';
 await expect(pilot.locator(`a[href="${localizedHref(`/info/${guide}`,locale)}"]`)).toHaveCount(1);
 await expect(pilot.locator(`a[href="${localizedHref(`/deals?destination=${city}`,locale)}"]`)).toHaveCount(1);
 const image=page.locator('[data-article-photo="cover"] img');await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 expect((await new AxeBuilder({page}).include('[data-airport-arrival]').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await pilot.locator('nav a').first().focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(`#${slug}-section-0$`));
 if(locale==='pl'){await pilot.locator('h2').first().evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top-16));await page.screenshot({path:info.outputPath(`${slug}-pl.png`),scale:'css'});}
 expect(errors).toEqual([]);
});

test('new airport summaries work without JavaScript and preserve the Alicante pilot',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:'http://127.0.0.1:3100'});
 try{
  const page=await context.newPage();
  for(const slug of arrivalSlugs){await page.goto('/info/'+slug);const pilot=page.locator('[data-airport-arrival]');await expect(pilot).toBeVisible();await pilot.locator('nav a').first().click();await expect(page).toHaveURL(new RegExp(`#${slug}-section-0$`));}
  const old=await request.get('/info/alicante-airport'),html=await old.text();expect(old.status()).toBe(200);expect(html).toContain('data-alicante-arrival');expect(html).not.toContain('data-airport-arrival');
 }finally{await context.close();}
});
