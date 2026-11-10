import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
const fixture='http://127.0.0.1:8100';
const expected={pl:{country:'Norwegia',city:'Ålesund'},en:{country:'Norway',city:'Ålesund'},ru:{country:'Норвегия',city:'Олесунн'},uk:{country:'Норвегія',city:'Олесунн'}};

test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/destination-images?slug=aalesund&slug=rome&slug=milan`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/destination-images`);});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: city, country, navigation and reciprocal language metadata stay localized`,async({page,request},info)=>{
 test.setTimeout(120000);
 const path=localizedHref('/destinations/aalesund',locale);
 expect((await page.goto(path))?.status()).toBe(200);
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
 await expect(page.locator('main h1')).toHaveText(expected[locale].city);
 await expect(page.locator('[data-destination-planning]')).toContainText(`${expected[locale].country} (NO)`);
 if(locale!=='en')await expect(page.locator('[data-destination-planning]')).not.toContainText('Norway');
 await expect(page.locator('.page-heading .lead')).not.toContainText('Wybierz lot');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(path,info.project.use.baseURL).href);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
 const switcher=page.locator('nav.language-switcher');
 await expect(switcher.locator('a')).toHaveCount(4);
 for(const language of ['pl','en','ru','uk'] as const){
  const target=localizedHref('/destinations/aalesund',language);
  await expect(switcher.locator(`a[lang="${language}"]`)).toHaveAttribute('href',target);
  await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute('href',new URL(target,info.project.use.baseURL).href);
 }
 await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href',new URL('/destinations/aalesund',info.project.use.baseURL).href);
 await expect(switcher.locator('a[aria-current="page"]')).toHaveAttribute('lang',locale);
 await expect(page.locator('[data-destination-search]').first()).toHaveAttribute('href',localizedHref('/deals?destination=aalesund',locale));
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.site-header').include('[data-destination-planning]').analyze()).violations).toEqual([]);
 await page.locator('[data-destination-planning]').screenshot({path:info.outputPath(`country-${locale}-320.png`)});
 // The actual switch must retain city, query and fragment, not return to a catalog.
 await page.goto(path+'?origin=WRO#destination-planning-heading');
 const next=locale==='en'?'ru':'en';
 await page.locator(`nav.language-switcher a[lang="${next}"]`).focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(new URL(localizedHref('/destinations/aalesund?origin=WRO#destination-planning-heading',next),info.project.use.baseURL).href);
 await expect(page.locator('html')).toHaveAttribute('lang',next);
 // Existing reviewed Milan indexability is preserved, not extended to every city.
 await page.goto(localizedHref('/destinations/milan',locale));
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
 const sitemap=await(await request.get('/sitemap.xml')).text();
 expect(sitemap).not.toContain('/destinations/aalesund</loc>');
 await page.goto(localizedHref('/destinations/rome',locale));
 await expect(page.locator(`main a[href="${localizedHref('/routes/krakow-rome',locale)}"]`)).toBeVisible();
});

test('destination language links and translated metadata are server-rendered without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL});
 try{
  const page=await context.newPage();await page.goto('/destinations/aalesund');
  await expect(page.locator('[data-destination-planning]')).toContainText('Norwegia (NO)');
  await page.locator('nav.language-switcher a[lang="uk"]').click();
  await expect(page).toHaveURL(/\/uk\/destinations\/aalesund$/);
  await expect(page.locator('html')).toHaveAttribute('lang','uk');
  await expect(page.locator('[data-destination-planning]')).toContainText('Норвегія (NO)');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL('/uk/destinations/aalesund',info.project.use.baseURL).href);
 }finally{await context.close();}
});
