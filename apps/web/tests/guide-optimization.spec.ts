import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import config from '../playwright.config';
import {availableHref,localizedHref} from '../src/lib/i18n/routing';
import {guideUi} from '../src/lib/i18n/guide-ui';

const targets=[['madrid-airport','madrid'],['valencia-airport','valencia'],['porto-airport','porto'],['vienna-airport','vienna'],['prague-airport','prague'],['copenhagen-airport','copenhagen'],['stockholm-airports','stockholm'],['milan-weekend','milan'],['paris-weekend','paris'],['stockholm-weekend','stockholm'],['oslo-weekend','oslo']] as const;
const notice='https://www.wien.info/en/travel-info/arrival-departure/airport-to-center/important-information-for-airport-travellers-2026-2027-1118558';
const servers=config.webServer;
if(!Array.isArray(servers)||!servers[0]?.url)throw new Error('Fixture API URL required');
const api=new URL(servers[0].url).origin;
test.afterEach(async({request})=>{expect((await request.post(`${api}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);});

for(const locale of ['pl','en','ru','uk'] as const)test(`guide search CTAs keep the city in ${locale}`,async({page,request},info)=>{
 test.setTimeout(120000);
 if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const evidence=[];
 for(const [slug,destination] of targets){
  const path=localizedHref(`/info/${slug}`,locale),expected=localizedHref(`/deals?destination=${destination}`,locale);
  expect((await page.goto(path))?.status()).toBe(200);
  const nav=page.getByRole('navigation',{name:guideUi(locale,'routes'),exact:true});
  await expect(nav.getByRole('link')).toHaveCount(1);
  await expect(nav.getByRole('link')).toHaveAttribute('href',expected);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(path,info.project.use.baseURL).href);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  if(slug==='vienna-airport')await expect(page.locator(`article a[href="${notice}"]`)).toHaveCount(1);
  if(slug==='milan-weekend'){
   expect((await new AxeBuilder({page}).include(`article nav[aria-label="${guideUi(locale,'routes')}"]`).analyze()).violations).toEqual([]);
   if(locale==='pl'){
    await nav.evaluate(element=>window.scrollTo(0,scrollY+element.getBoundingClientRect().top-16));
    await page.screenshot({path:info.outputPath('guide-cta.png'),scale:'css'});
   }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  evidence.push({path,destination,href:expected,status:200});
 }
 for(const [slug,destination] of [['rome-3-days','rome'],['lisbon-3-days','lisbon']] as const){
  await page.goto(localizedHref(`/info/${slug}`,locale));
  const links=page.getByRole('navigation',{name:guideUi(locale,'routes'),exact:true}).getByRole('link');
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute('href',availableHref(`/destinations/${destination}`,locale));
  await expect(links.nth(1)).toHaveAttribute('href',localizedHref('/deals',locale));
  await expect(links.nth(2)).toHaveAttribute('href',localizedHref('/info/trip-budget#calculator',locale));
 }
 await info.attach('guide-ctas',{body:JSON.stringify(evidence,null,2),contentType:'application/json'});
 expect((await request.post(`${api}/__test__/catalog-state?unavailable=true`)).ok()).toBe(true);
 await page.goto(localizedHref('/info/milan-weekend',locale));
 await expect(page.locator('article h1')).toBeVisible();
 await expect(page.getByRole('navigation',{name:guideUi(locale,'routes'),exact:true}).getByRole('link')).toHaveAttribute('href',localizedHref('/deals?destination=milan',locale));
 expect(errors).toEqual([]);
});

test.describe('ordinary browser without JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('city guide CTA opens that city even when no observations exist',async({page},info)=>{
  test.setTimeout(90000);
  if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
  for(const [slug,destination,href] of [['milan-weekend','milan','/deals?destination=milan'],['rome-3-days','rome','/destinations/rome']] as const){
   await page.goto(`/info/${slug}`);
   const link=page.getByRole('navigation',{name:guideUi('pl','routes'),exact:true}).locator(`a[href="${href}"]`);
   const expected=new URL(href,info.project.use.baseURL).href;
   await expect(link).toHaveCount(1);
   await Promise.all([page.waitForURL(expected),link.click()]);await expect(page).toHaveURL(expected);
   if(destination==='milan')await expect(page.locator('.result-count')).toContainText('0');
   else await expect(page.locator('[data-destination-search]')).toHaveAttribute('href','/deals?destination=rome');
   // A destination may offer other cities below its empty primary catalogue.
   const primary=destination==='rome'?page.locator('[aria-labelledby="destination-flights-heading"]'):page.locator('main');
   await expect(primary.locator('.deal-card')).toHaveCount(0);
   await expect(primary.locator('[data-state="empty"]')).toBeVisible();
  }
 });
});
