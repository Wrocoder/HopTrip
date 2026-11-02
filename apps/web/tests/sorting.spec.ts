import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {filterText} from '../src/lib/i18n/filter-copy';
import {getMessages} from '../src/lib/i18n/messages';
import type {DealResults} from '../src/lib/api';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
const labels={score:'Wynik pomocniczy ↓',price:'Cena/os. (PLN) ↑',departure:'Data wylotu ↑'};
const visibleSlugs=(page:Page)=>page.locator('.deal-card-link').evaluateAll(links=>links.map(link=>new URL((link as HTMLAnchorElement).href).pathname.split('/').at(-1)));

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: applied sorting matches the full catalog and survives paging, drafts and history`,async({page,request},info)=>{
 test.setTimeout(120000);
 const t=(source:string)=>filterText(locale,source),messages=getMessages(locale);
 const initial=localizedHref('/deals?origin=WRO&sort=score&offset=12',locale);
 await page.goto(initial);
 const select=page.locator('select[name="sort"]'),rule=page.locator('.sort-explanation');
 await expect(page.locator('.deal-card')).toHaveCount(2);
 await expect(rule).toContainText(t(labels.score));
 await expect(select.locator('option')).toHaveCount(3);
 for(const [key,label] of Object.entries(labels))await expect(select.locator(`option[value="${key}"]`)).toHaveText(t(label));
 expect(await select.getAttribute('aria-describedby')).toBe(await rule.getAttribute('id'));
 await page.locator('.preset-rules > summary').click();
 await expect(rule.getByRole('link')).toHaveAttribute('href',localizedHref('/info/price-comparison',locale));
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/*',async route=>{if(route.request().method()==='POST'&&route.request().headers()['next-action'])await gate;await route.continue();});
 try{
  await page.locator('input[name="budget"]').fill('220');
  await select.selectOption('price');
  await expect(select).toBeDisabled();
  await expect(rule).toContainText(t(labels.score));
  await expect(page).toHaveURL(new URL(initial,info.project.use.baseURL).href);
  release();await expect(select).toBeEnabled();
  await expect(select).toHaveValue('price');
  await expect(page).toHaveURL(/budget=220/);await expect(page).not.toHaveURL(/offset=/);
 }finally{release();await page.unrouteAll({behavior:'wait'});}
 const expected=async(sort:string)=>{
  const response=await request.get(`http://127.0.0.1:8100/api/v1/deals?origin=WRO&budget=220&sort=${sort}&include_total=true&limit=100`);
  expect(response.ok()).toBe(true);
  return (await response.json()) as DealResults;
 };
 const price=await expected('price');
 await expect(page.locator('.deal-card')).toHaveCount(12);
 expect(await visibleSlugs(page)).toEqual(price.items.slice(0,12).map(deal=>deal.slug));
 await expect(rule).toContainText(t(labels.price));await expect(rule.getByRole('link')).toHaveCount(0);
 await page.getByRole('link',{name:messages.next,exact:true}).click();
 await expect(page).toHaveURL(/offset=12/);
 await expect(page.locator('.deal-card')).toHaveCount(2);
 expect(await visibleSlugs(page)).toEqual(price.items.slice(12).map(deal=>deal.slug));
 await page.reload();await expect(select).toHaveValue('price');await expect(page.locator('.deal-card')).toHaveCount(2);
 for(const sort of ['departure','score'] as const){
  await select.selectOption(sort);await expect(select).toBeEnabled();
  await expect(page).toHaveURL(new RegExp('sort='+sort));await expect(page).not.toHaveURL(/offset=/);
  await expect(page.locator('.deal-card')).toHaveCount(12);
  expect(await visibleSlugs(page)).toEqual((await expected(sort)).items.slice(0,12).map(deal=>deal.slug));
  await expect(rule).toContainText(t(labels[sort]));
  await expect(page.locator('input[name="budget"]')).toHaveValue('220');
 }
 await page.goBack();await expect(select).toHaveValue('departure');await expect(rule).toContainText(t(labels.departure));
 await page.goForward();await expect(select).toHaveValue('score');await expect(rule).toContainText(t(labels.score));
 const back=new URL(page.url()).pathname+new URL(page.url()).search;
 await page.locator('.deal-card-link').first().click();
 await expect(page.locator('.back-link')).toHaveAttribute('href',back);
 await page.locator('.back-link').click();await expect(select).toHaveValue('score');
 expect((await new AxeBuilder({page}).include('.filter-panel').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('.filter-panel').screenshot({path:info.outputPath('sorting-320.png')});
 await page.goto(localizedHref('/deals?sort=duration',locale));
 await expect(rule).toHaveText(t('Wybierz poprawne sortowanie, aby uporządkować wyniki.'));
 await expect(rule).not.toContainText(t('Zastosowane sortowanie:'));
 await expect(page.locator('[data-state="error"]')).toBeVisible();
 await select.selectOption('price');await expect(page.locator('.result-count')).toBeVisible();
 await expect(rule).toContainText(t(labels.price));
});
