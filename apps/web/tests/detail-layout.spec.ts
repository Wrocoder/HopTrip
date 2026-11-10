import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {tripText} from '../src/lib/i18n/trip-copy';
import {qualityReasonText} from '../src/lib/i18n/quality-copy';
import {savedPlansKey as savedTripsKey} from '../src/lib/saved-plans';
import {searchReturnPath} from '../src/lib/search-context';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';

test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post('http://127.0.0.1:8100/__test__/quality?scenario=reset');
 await request.post('http://127.0.0.1:8100/__test__/compact-card?scenario=normal');
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: flight decision precedes planning without hiding critical warnings or losing the shared plan`,async({page,request},info)=>{
 test.setTimeout(180000);
 await page.setViewportSize(info.project.name==='desktop'?{width:1366,height:900}:{width:390,height:844});
 const t=(key:Parameters<typeof tripText>[1])=>tripText(locale,key);
 const nav=page.locator('.trip-navigation'),summary=page.locator('.detail-summary'),booking=page.locator('#trip-booking');
 for(const scenario of ['complete','partial','critical']){
  const response=await request.post(`http://127.0.0.1:8100/__test__/quality?scenario=${scenario}`);
  expect(response.ok()).toBe(true);const {quality}=await response.json();
  await page.goto(localizedHref('/deals/browser-13?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(summary.locator('.deal-price')).toBeVisible();
  await expect(summary.locator('.home-arrival')).toBeVisible();
  await expect(booking.getByRole('heading',{level:2})).toHaveText(t('Przejście do partnera'));
  await expect(page.locator('.decision-information .trip-details')).not.toHaveAttribute('open','');
  await expect(summary.locator('.price-assessment')).toHaveCount(0);
  await expect(summary.locator('.price-freshness')).toHaveCount(0);
  await expect(page.locator('.decision-information .price-freshness')).toHaveCount(1);
  await expect(page.locator('.price-assessment')).toHaveCount(1);
  const warning=summary.locator('.flight-quality');
  if(scenario==='critical')await expect(warning).toHaveAttribute('data-quality',quality.status);
  else await expect(warning).toHaveCount(0);
  if(scenario==='partial'){
   await page.locator('.decision-information .trip-details > summary').click();
   for(const reason of quality.reasons)await expect(page.locator('.card-quality-details').getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
   await page.locator('.decision-information .trip-details > summary').click();
  }
  if(scenario==='critical'){
   await expect(warning.locator('details')).toHaveCount(0);
   for(const reason of quality.reasons)await expect(warning.getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  }
  const ids=['trip-flight','trip-booking','score','trip-stay','accommodation'];
  if(await page.locator('#destination-activities').count())ids.push('destination-activities');
  if(await page.locator('#trip-events').count())ids.push('trip-events');
  ids.push('calculator','trip-save');
  expect(await page.locator(ids.map(id=>'#'+id).join(',')).evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(ids);
  await expect(page.locator('.offer-detail > section').last()).toHaveAttribute('id','trip-save');
  const targets=await nav.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href')!));
  for(const target of targets){await expect(page.locator(target)).toHaveCount(1);await expect(page.locator(target)).toHaveAttribute('tabindex','-1');}
  await page.evaluate(()=>{location.hash='trip-booking';});
  await expect(booking).toBeFocused();
  await expect(booking.locator('a.cta')).toHaveCount(0);
  await expect(booking.locator('.partner-unavailable a')).toBeInViewport();
  expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  if(locale==='pl'&&scenario==='complete'){
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:info.outputPath('detail-first-screen.png'),scale:'css'});
   await page.locator('.detail-layout').screenshot({path:info.outputPath('flight-decision.png'),scale:'css'});
  }
  if(locale==='pl'&&scenario==='critical')await warning.screenshot({path:info.outputPath('critical-warnings.png'),scale:'css'});
 }
 // The schedule fixture has no approved seller link. Use the approved flight
 // fixture for CTA visibility and the existing planning/share journey.
 await page.goto(localizedHref('/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
 await expect(page.locator('#budget-people')).toBeEnabled();await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{location.hash='trip-booking';});
 await expect(booking).toBeFocused();await expect(booking.locator('a.cta')).toBeInViewport();
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 if(locale==='pl')await expect(summary.locator('.deal-price')).toBeInViewport({ratio:1});
 if(info.project.name==='desktop')await expect(booking.locator('a.cta')).toBeInViewport({ratio:1});
 if(locale==='pl'){
  await page.screenshot({path:info.outputPath('available-first-screen.png'),scale:'css'});
  await page.locator('.detail-layout').screenshot({path:info.outputPath('available-flight-decision.png'),scale:'css'});
 }
 // Native anchor focus and existing detail disclosure are still usable by keyboard.
 await nav.locator('a[href="#trip-flight"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#trip-flight')).toBeFocused();
 await page.locator('.decision-information .trip-details > summary').focus();await page.keyboard.press('Enter');
 await expect(page.locator('.decision-information .flight-facts')).toBeVisible();
 await page.evaluate(()=>{location.hash='score';});
 await expect(page.locator('#score')).toBeFocused();
 await expect(page.locator('#score .score-sum')).not.toBeVisible();
 await expect(page.locator('.back-link')).toHaveAttribute('href',localizedHref(searchReturnPath('/deals?origin=WRO&sort=price&offset=12'),locale));
 // These are existing planning functions, exercised after their sections move.
 const flight=booking.locator('a.cta'),original=await flight.getAttribute('href');
 await page.locator('#stay-checkin').fill('2030-05-01');await page.locator('#stay-checkout').fill('2030-05-04');
 await page.locator('#stay-adults').fill('2');
 await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('1000');
 await expect(page.locator('#budget-people')).toHaveValue('2');await expect(page.locator('#budget-nights')).toHaveValue('3');
 const stay=page.locator('#accommodation a[rel*="sponsored"]');
 expect(Object.fromEntries(new URL((await stay.getAttribute('href'))!).searchParams)).toMatchObject({adults:'2',checkin:'2030-05-01',checkout:'2030-05-04',aid:'hoptrip',campaign:'hoptrip_accommodation'});
 await expect(flight).toHaveAttribute('href',original!);
 await nav.locator('a[href="#trip-save"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#trip-save')).toBeFocused();
 await page.getByRole('button',{name:t('Zapisz wyjazd'),exact:true}).click();
  await expect(page).toHaveURL(/\/trip#local=[0-9a-f-]{36}$/);
  await expect(page.getByRole('button',{name:planEditorCopy[locale].update,exact:true})).toBeDisabled();
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'null')?.plans.length??0,savedTripsKey)).toBe(1);
 await page.getByRole('button',{name:t('Udostępnij'),exact:true}).click();
 const shared=await page.locator('#trip-share-link').inputValue();
 await page.goto(shared);await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
 await expect(page.locator('#stay-adults')).toHaveValue('2');
 await expect(page.locator('.trip-navigation a[href="#trip-booking"],.trip-navigation a[href="#score"]')).toHaveCount(0);
 await page.reload();await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('critical flight detail and navigation fit 320px in every locale',async({page,request},info)=>{
 test.setTimeout(120000);
 await page.setViewportSize({width:320,height:844});
 const response=await request.post('http://127.0.0.1:8100/__test__/quality?scenario=critical');
 expect(response.ok()).toBe(true);const {quality}=await response.json();
 for(const locale of ['pl','en','ru','uk'] as const){
  await page.goto(localizedHref('/deals/browser-13',locale));
  const warning=page.locator('.detail-summary .flight-quality');
  await expect(warning.locator('details')).toHaveCount(0);
  for(const reason of quality.reasons)await expect(warning.getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const sizes=await page.locator('.trip-navigation a').evaluateAll(links=>links.map(link=>link.getBoundingClientRect().height));
  expect(sizes.every(height=>height>=44)).toBe(true);
  expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  if(locale==='pl')await page.locator('.detail-layout').screenshot({path:info.outputPath('critical-detail-320.png'),scale:'css'});
 }
});
