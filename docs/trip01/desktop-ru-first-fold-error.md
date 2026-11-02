# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: detail-layout.spec.ts >> ru: flight decision precedes planning without hiding critical warnings or losing the shared plan
- Location: tests\detail-layout.spec.ts:17:56

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator:  locator('#trip-booking').locator('a.cta')
Expected: in viewport
Received: viewport ratio 0.7542273998260498
Timeout:  5000ms

Call log:
  - Expect "toBeInViewport" locator('#trip-booking').locator('a.cta') with timeout 5000ms
  - waiting for locator('#trip-booking').locator('a.cta')
    13 × locator resolved to <a class="cta" rel="sponsored noopener" href="http://127.0.0.1:8125/go/browser-deal/flight">Посмотреть перелёт — Fixture program</a>
       - unexpected value "viewport ratio 0.7542273998260498"

```

```yaml
- link "Посмотреть перелёт — Fixture program":
  - /url: http://127.0.0.1:8125/go/browser-deal/flight
```

# Test source

```ts
  1   | import {test,expect} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {localizedHref} from '../src/lib/i18n/routing';
  4   | import {tripText} from '../src/lib/i18n/trip-copy';
  5   | import {qualityReasonText} from '../src/lib/i18n/quality-copy';
  6   | import {savedTripsKey} from '../src/lib/shared-trip';
  7   | import {searchReturnPath} from '../src/lib/search-context';
  8   | 
  9   | test.beforeEach(async({page})=>{
  10  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  11  | });
  12  | test.afterEach(async({request})=>{
  13  |  await request.post('http://127.0.0.1:8125/__test__/quality?scenario=reset');
  14  |  await request.post('http://127.0.0.1:8125/__test__/compact-card?scenario=normal');
  15  | });
  16  | 
  17  | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: flight decision precedes planning without hiding critical warnings or losing the shared plan`,async({page,request},info)=>{
  18  |  test.setTimeout(180000);
  19  |  await page.setViewportSize(info.project.name==='desktop'?{width:1366,height:900}:{width:390,height:844});
  20  |  const t=(key:Parameters<typeof tripText>[1])=>tripText(locale,key);
  21  |  const nav=page.locator('.trip-navigation'),summary=page.locator('.detail-summary'),booking=page.locator('#trip-booking');
  22  |  for(const scenario of ['complete','partial','critical']){
  23  |   const response=await request.post(`http://127.0.0.1:8125/__test__/quality?scenario=${scenario}`);
  24  |   expect(response.ok()).toBe(true);const {quality}=await response.json();
  25  |   await page.goto(localizedHref('/deals/browser-13?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
  26  |   await expect(page.locator('h1')).toHaveCount(1);
  27  |   await expect(summary.locator('.deal-price')).toBeVisible();
  28  |   await expect(summary.locator('h2')).toHaveText(t('Szczegóły lotu'));
  29  |   await expect(booking.getByRole('heading',{level:2})).toHaveText(t('Przejście do partnera'));
  30  |   await expect(summary.locator('.trip-details')).not.toHaveAttribute('open','');
  31  |   await expect(summary.locator('.price-assessment')).toHaveCount(0);
  32  |   await expect(summary.locator('.price-freshness')).toHaveCount(1);
  33  |   await expect(page.locator('.price-assessment')).toHaveCount(1);
  34  |   const warning=summary.locator('.flight-quality');
  35  |   if(scenario==='complete')await expect(warning).toHaveCount(0);
  36  |   else await expect(warning).toHaveAttribute('data-quality',quality.status);
  37  |   if(scenario==='critical'){
  38  |    await expect(warning.locator('details')).toHaveCount(0);
  39  |    for(const reason of quality.reasons)await expect(warning.getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  40  |   }
  41  |   const ids=['trip-flight','trip-booking','accommodation'];
  42  |   if(await page.locator('#destination-activities').count())ids.push('destination-activities');
  43  |   if(await page.locator('#trip-events').count())ids.push('trip-events');
  44  |   ids.push('calculator','trip-save','score');
  45  |   expect(await page.locator(ids.map(id=>'#'+id).join(',')).evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(ids);
  46  |   await expect(page.locator('.offer-detail > section').last()).toHaveAttribute('id','score');
  47  |   const targets=await nav.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href')!));
  48  |   for(const target of targets){await expect(page.locator(target)).toHaveCount(1);await expect(page.locator(target)).toHaveAttribute('tabindex','-1');}
  49  |   await nav.locator('a[href="#trip-booking"]').focus();await page.keyboard.press('Enter');
  50  |   await expect(booking).toBeFocused();
  51  |   await expect(booking.locator('a.cta')).toHaveCount(0);
  52  |   await expect(booking.locator('.partner-unavailable a')).toBeInViewport();
  53  |   expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  54  |   if(locale==='pl'&&scenario==='complete'){
  55  |    await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
  56  |    await page.screenshot({path:info.outputPath('detail-first-screen.png'),scale:'css'});
  57  |    await page.locator('.detail-layout').screenshot({path:info.outputPath('flight-decision.png'),scale:'css'});
  58  |   }
  59  |   if(locale==='pl'&&scenario==='critical')await warning.screenshot({path:info.outputPath('critical-warnings.png'),scale:'css'});
  60  |  }
  61  |  // The schedule fixture has no approved seller link. Use the approved flight
  62  |  // fixture for CTA visibility and the existing planning/share journey.
  63  |  await page.goto(localizedHref('/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
  64  |  await nav.locator('a[href="#trip-booking"]').focus();await page.keyboard.press('Enter');
  65  |  await expect(booking).toBeFocused();await expect(booking.locator('a.cta')).toBeInViewport();
  66  |  await page.evaluate(()=>scrollTo(0,0));
  67  |  if(locale==='pl')await expect(summary.locator('.deal-price')).toBeInViewport({ratio:1});
> 68  |  if(info.project.name==='desktop')await expect(booking.locator('a.cta')).toBeInViewport({ratio:1});
      |                                                                          ^ Error: expect(locator).toBeInViewport() failed
  69  |  if(locale==='pl'){
  70  |   await page.screenshot({path:info.outputPath('available-first-screen.png'),scale:'css'});
  71  |   await page.locator('.detail-layout').screenshot({path:info.outputPath('available-flight-decision.png'),scale:'css'});
  72  |  }
  73  |  // Native anchor focus and existing detail disclosure are still usable by keyboard.
  74  |  await nav.locator('a[href="#trip-flight"]').focus();await page.keyboard.press('Enter');
  75  |  await expect(page.locator('#trip-flight')).toBeFocused();
  76  |  await summary.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');
  77  |  await expect(summary.locator('.flight-facts')).toBeVisible();
  78  |  await nav.locator('a[href="#score"]').focus();await page.keyboard.press('Enter');
  79  |  await expect(page.locator('#score')).toBeFocused();
  80  |  await expect(page.locator('#score .score-sum')).not.toBeVisible();
  81  |  await expect(page.locator('.back-link')).toHaveAttribute('href',localizedHref(searchReturnPath('/deals?origin=WRO&sort=price&offset=12'),locale));
  82  |  // These are existing planning functions, exercised after their sections move.
  83  |  const flight=booking.locator('a.cta'),original=await flight.getAttribute('href');
  84  |  await page.locator('#stay-checkin').fill('2030-05-01');await page.locator('#stay-checkout').fill('2030-05-04');
  85  |  await page.locator('#stay-adults').fill('2');
  86  |  await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('1000');
  87  |  await expect(page.locator('#budget-people')).toHaveValue('2');await expect(page.locator('#budget-nights')).toHaveValue('3');
  88  |  const stay=page.locator('#accommodation a[rel*="sponsored"]');
  89  |  expect(Object.fromEntries(new URL((await stay.getAttribute('href'))!).searchParams)).toMatchObject({adults:'2',checkin:'2030-05-01',checkout:'2030-05-04',aid:'hoptrip',campaign:'hoptrip_accommodation'});
  90  |  await expect(flight).toHaveAttribute('href',original!);
  91  |  await nav.locator('a[href="#trip-save"]').focus();await page.keyboard.press('Enter');
  92  |  await expect(page.locator('#trip-save')).toBeFocused();
  93  |  await page.getByRole('button',{name:t('Zapisz wyjazd'),exact:true}).click();
  94  |  expect(JSON.parse((await page.evaluate(key=>localStorage.getItem(key),savedTripsKey))!)).toHaveLength(1);
  95  |  await page.getByRole('button',{name:t('Udostępnij'),exact:true}).click();
  96  |  const shared=await page.locator('#trip-share-link').inputValue();
  97  |  await page.goto(shared);await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
  98  |  await expect(page.locator('#stay-adults')).toHaveValue('2');
  99  |  await expect(page.locator('.trip-navigation a[href="#trip-booking"],.trip-navigation a[href="#score"]')).toHaveCount(0);
  100 |  await page.reload();await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
  101 |  await page.setViewportSize({width:320,height:844});
  102 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  103 | });
  104 | 
```