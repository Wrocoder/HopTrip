import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {tripSectionCopy} from '../src/lib/i18n/trip-section-copy';
import {tripText} from '../src/lib/i18n/trip-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {encodeTrip} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';

test.setTimeout(120000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:{table:'A',code:'EUR',rates:[{mid:4,effectiveDate:new Date().toISOString().slice(0,10)}]}}));
});
const ids=['trip-flight','trip-stay','calculator','trip-save'];
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: four sections retain anchors, shared state and usable unavailable plans`,async({page},info)=>{
 const copy=tripSectionCopy[locale],nav=page.locator('.trip-navigation');
 await page.goto(localizedHref('/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price'),locale));
 await expect(page.locator('#budget-flight')).toBeEnabled();
 await expect(nav.getByRole('link')).toHaveText([copy.flight,copy.stay,copy.budget,copy.save]);
 expect(await page.locator('.offer-detail > section').evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(ids);
 await expect(page.locator('#trip-flight #trip-booking')).toHaveCount(1);
 await expect(page.locator('#trip-flight #score')).toHaveCount(1);
 await expect(page.locator('#trip-stay #accommodation')).toHaveCount(1);
 await expect(page.locator('#trip-stay #destination-activities')).toHaveCount(1);
 await expect(page.locator('#trip-stay #trip-events')).toHaveCount(1);
 await expect(page.locator('#calculator #trip-save')).toHaveCount(0);
 const metrics=[];
 for(const width of [320,375,390,768,1440]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const links=await nav.getByRole('link').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return {height:box.height,width:box.width};}));
  expect(links.every(link=>link.height>=44&&link.width<=width)).toBe(true);
  metrics.push({width,links});
  if(width===320||width===1440){
   expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
   if(locale==='ru'){
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:info.outputPath(`detail-ru-${width}.png`),scale:'css',animations:'disabled'});
   }
  }
 }
 writeFileSync(info.outputPath('navigation.json'),JSON.stringify({locale,project:info.project.name,links:4,sections:ids,metrics},null,2));
 for(const id of ids){await nav.locator(`a[href="#${id}"]`).focus();await page.keyboard.press('Enter');await expect(page.locator('#'+id)).toBeFocused();}
 // Old external hashes still reach their original targets.
 for(const id of ['trip-booking','accommodation','destination-activities','trip-events','score']){
  await page.evaluate(id=>{location.hash=id;},id);await expect(page.locator('#'+id)).toBeFocused();
 }
 const seller=await page.locator('#trip-booking .cta').getAttribute('href');
 await page.locator('#stay-checkin').fill('2030-05-01');await page.locator('#stay-checkout').fill('2030-05-03');
 await page.locator('#stay-adults').fill('2');await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('900');
 await page.locator('#budget-food').fill('0');await page.locator('#budget-transfers').fill('0');
 await expect(page.locator('#budget-people')).toHaveValue('2');await expect(page.getByTestId('budget-total')).toContainText(/1\D?300[,.]50/);
 await expect(page.locator('#trip-booking .cta')).toHaveAttribute('href',seller!);
 await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();
 const shared=await page.locator('#trip-share-link').inputValue();await page.goto(shared);
 await expect(page.locator('#stay-checkin')).toBeEnabled();
 expect(await page.locator('main > section').evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(ids);
 await expect(page.locator('#trip-stay #trip-events')).toHaveCount(1);
 await nav.locator('a[href="#trip-stay"]').focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#plan=.+&section=trip-stay$/);await page.reload();
 await expect(page.locator('#trip-stay')).toBeFocused();await expect(page.locator('#budget-hotel_total')).toHaveValue('900');
 // A missing offer cannot remove the navigation target or erase entered costs.
 const token=encodeTrip({version:1,offer:{slug:'missing-offer',origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},draft:{version:1,input:{...emptyBudget,flight:'100',hotel:'0'},start:'2030-05-01',end:'2030-05-03',context:'',review:true,adultsOnly:false}})!;
 await page.goto(localizedHref('/trip#plan='+token+'&section=trip-stay',locale));
 await expect(page.locator('#trip-stay')).toContainText(copy.unavailable);
 await expect(page.locator('#trip-stay')).toBeFocused();await expect(nav.getByRole('link')).toHaveCount(4);
 await expect(page.locator('#budget-flight')).toHaveValue('100');await expect(page.locator('#accommodation')).toHaveCount(0);
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
});
