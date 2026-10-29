import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {referenceText,referenceTicket} from '../src/lib/i18n/reference-copy';
import {referenceCosts} from '../src/lib/reference-costs';
import {guideTranslations} from '../src/lib/i18n/guide-content';
import {shell} from '../src/lib/i18n/shell';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {translatedGuideSlugs} from '../src/lib/i18n/guide-slugs';
import {getInfoContent} from '../src/lib/content';
import {activitySelections} from '../src/lib/destination-activities';
import {activityText} from '../src/lib/i18n/activity-copy';
test.setTimeout(90000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test('complete guide translations expose full text, original source links and reciprocal metadata',async({page,request},testInfo)=>{
 for(const locale of ['en','ru','uk'] as const){
  const path=`/${locale}/info/baggage`,response=await page.goto(path);
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  const strings=guideTranslations.baggage[locale];
  await expect(page.getByRole('heading',{level:1})).toHaveText(strings[0]);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',strings[1]);
  for(const paragraph of strings.slice(2).filter(text=>text.length>100))await expect(page.getByText(paragraph,{exact:true})).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`http://127.0.0.1:3100${path}`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  await expect(page.locator('time[datetime="2026-09-23"]')).toBeVisible();
  await expect(page.locator('a[href="https://help.ryanair.com/hc/en-ie/articles/12888036565521-Ryanair-s-Bag-Policy"]').first()).toBeVisible();
  const crumbs=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent()??'{}');
  expect(crumbs.itemListElement.map((c:{item:string})=>c.item)).toEqual([`http://127.0.0.1:3100/${locale}`,`http://127.0.0.1:3100/${locale}/info`,`http://127.0.0.1:3100${path}`]);
  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  await page.setViewportSize({width:320,height:850});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`baggage-${locale}.png`)});
 }
 const pl=await request.get('/info/baggage');
 expect(await pl.text()).toMatch(/hrefLang="uk"/i);
 const sitemap=await(await request.get('/sitemap.xml')).text();
 for(const locale of ['en','ru','uk']){
  expect(sitemap).toContain(`/${locale}</loc>`);
  expect(sitemap).toContain(`/${locale}/info/baggage</loc>`);
 }
});
test('reference fares are translated and conversion preserves manually entered costs',async({page})=>{
 await page.clock.install({time:new Date('2026-10-08T12:00:00Z')});
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:{table:'A',currency:'euro',code:'EUR',rates:[{no:'test',effectiveDate:'2026-10-07',mid:4.25}]}}));
 for(const locale of ['en','ru','uk'] as const){
  await page.goto(`/${locale}/info/trip-budget`);
  await page.locator('.reference-costs > summary').click();
  await expect(page.locator('#reference-ticket option').first()).toHaveText(new RegExp(referenceTicket(locale,referenceCosts[0]).label));
  if(await page.locator('#budget-local_transport').inputValue()){
   await page.getByText(budgetText(locale,'Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa'),{exact:true}).click();
   await page.locator('#budget-local_transport').fill('');
  }
  await page.getByRole('button',{name:referenceText(locale,'apply'),exact:true}).click();
  await expect(page.locator('#budget-local_transport')).toHaveValue('32.30');
  await expect(page.getByRole('button',{name:referenceText(locale,'apply'),exact:true})).toBeDisabled();
  await page.locator('#budget-flight').fill('123.45');
  await page.getByRole('button',{name:shell[locale].settings,exact:true}).click();
  await page.getByRole('button',{name:shell[locale].reject,exact:true}).click();
  await expect(page.locator('#budget-flight')).toHaveValue('123.45');
 }
});
test('every published guide has complete public translations and original sources',async({request},testInfo)=>{
 test.setTimeout(240000);
 const slugs=testInfo.project.name==='desktop'?translatedGuideSlugs:['krk-airport','barcelona-3-days','islandia-wieloryby-lodowce-atrakcje'];
 const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
 for(const locale of ['en','ru','uk'] as const)for(const slug of slugs){
  const path=`/${locale}/info/${slug}`,response=await request.get(path);
  expect(response.status(),path).toBe(200);
  const html=await response.text(),source=getInfoContent(slug)!;
  expect(html).toContain(`lang="${locale}"`);
  expect(html).toContain(`<link rel="canonical" href="http://127.0.0.1:3100${path}"`);
  expect((html.match(/rel="alternate" hrefLang=/g)??[]).length).toBe(5);
  if(source.reviewedAt)expect(html).toContain(`dateTime="${source.reviewedAt}"`);
  for(const text of guideTranslations[slug][locale])expect(html,`${path}: ${text.slice(0,80)}`).toContain(escape(text));
  for(const link of source.sources??[])expect(html).toContain(`href="${escape(link.href)}"`);
 }
});
test('destination widgets are translated, retain links and fit a narrow screen',async({page},testInfo)=>{
 test.setTimeout(150000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const locale of ['en','ru','uk'] as const)for(const [slug,city]of [['milan-weekend','milan'],['islandia-wieloryby-lodowce-atrakcje','reykjavik']] as const){
  await page.setViewportSize({width:320,height:850});
  await page.goto(`/${locale}/info/${slug}`);
  const activities=page.locator('#destination-activities');
  await expect(activities).toBeVisible();
  for(const item of activitySelections[city].items){
   await expect(activities.getByRole('heading',{name:activityText(locale,item.title),exact:true})).toBeVisible();
   await expect(activities.locator(`a[href="${item.affiliateHref??item.href}"]`).first()).toBeVisible();
  }
  await expect(activities.locator('[lang="pl"]')).toHaveCount(0);
  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(locale==='uk')await page.screenshot({path:testInfo.outputPath(`${slug}-uk-320.png`)});
 }
 expect(errors).toEqual([]);
});
