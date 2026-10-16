import {test,expect} from '@playwright/test';

test.beforeEach(async({request})=>{expect((await request.post('http://127.0.0.1:8100/__test__/growth')).ok()).toBe(true);});
test.afterEach(async({request})=>{await request.delete('http://127.0.0.1:8100/__test__/growth');});

test('city break keeps dates, origin, sorting, pagination and back; empty state is explicit',async({page},info)=>{
 await page.goto('/city-break?origin=KRK');
 await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 await expect(page.locator('h1')).toHaveText('City break na 2–4 noce');
 await expect(page.locator('.deal-card')).toHaveCount(12);
 await expect(page.locator('input[name="duration_min"]')).toHaveValue('2');
 await page.locator(".advanced-filters summary").click();
 await page.locator('[name="departure_from"]').fill('2030-05-03');
 await page.locator('[name="departure_to"]').fill('2030-05-03');
 await page.locator('[name="sort"]').selectOption('price');
 await expect(page).toHaveURL(/city-break\?origin=KRK&departure_from=2030-05-03&departure_to=2030-05-03&sort=price/);
 await page.locator('.pagination a').filter({hasText:'Następna'}).click();
 await expect(page).toHaveURL(/offset=12/);
 await expect(page.locator('.deal-card')).toHaveCount(3);
 await expect(page.locator('[name="departure_from"]')).toHaveValue('2030-05-03');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('city-break.png'),fullPage:true});
 await info.attach('navigation-timing',{body:JSON.stringify(await page.evaluate(()=>{
   const entry=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
   return {environment:'local Next dev + SQLite fixture, not production CWV',ttfb_ms:entry.responseStart-entry.requestStart,dom_content_loaded_ms:entry.domContentLoadedEventEnd,transfer_bytes:entry.transferSize};
 })),contentType:'application/json'});
 await page.locator('.deal-card-link').first().click();
 await expect(page.locator('#calculator')).toBeAttached();
 await expect(page.locator('#budget-flight')).toHaveValue('112.00');
 await page.goBack();
 await expect(page).toHaveURL(/offset=12/);
 await page.locator('[name="budget"]').fill('1');
 await page.getByRole('button',{name:'Filtruj',exact:true}).click();
 await expect(page.locator('.empty-state')).toContainText('Brak aktualnych ofert');
 await page.getByRole('link',{name:'Usuń limit ceny',exact:true}).click();
 await expect(page.locator('.deal-card')).toHaveCount(12);
});

test('Warsaw union, individual airports, weekend and route constraints',async({page},info)=>{
 await page.goto('/from/warszawa');
 await expect(page.locator('.deal-card')).toHaveCount(2);
 await expect(page.locator('.deal-origin').nth(0)).toContainText('WAW');
 await expect(page.locator('.deal-origin').nth(1)).toContainText('WMI');
 await page.locator('[name="origin"]').selectOption('WMI');
 await page.getByRole('button',{name:'Filtruj',exact:true}).click();
 await expect(page.locator('.deal-card')).toHaveCount(1);
 await expect(page.locator('.deal-origin')).toContainText('WMI');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('[name="origin"]').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 expect((await page.locator('[name="origin"]').boundingBox())!.height).toBeGreaterThanOrEqual(44);
 await page.screenshot({path:info.outputPath('warsaw.png'),fullPage:true});
 await page.goto('/tanie-loty-na-weekend?origin=WAW%2CWMI&weekend=false');
 await expect(page.locator('.deal-card')).toHaveCount(2);
 await expect(page.locator('[name="weekend"]')).toHaveValue('true');
 await page.goto('/routes/krakow-rome?origin=WRO&destination=barcelona');
 await expect(page.locator('.deal-card')).toHaveCount(12);
 await expect(page.locator('[name="origin"]')).toHaveValue('KRK');
 await expect(page.locator('[name="destination"]')).toHaveValue('rome');
 await expect(page.locator('.deal-card').first()).toContainText('Między przylotem a odlotem:');
});

test('new landing metadata, real HTTP 404 and normalized canonical',async({page})=>{
 for(const path of ['/city-break','/tanie-loty-na-weekend','/from/warszawa','/from/KRK','/routes/krakow-rome']){
  expect((await page.goto(path))?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+path);
 }
 await page.goto('/city-break?budget=300&origin=KRK&utm_source=test');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100/city-break?origin=KRK&budget=300');
 for(const path of ['/from/ZZZ','/destinations/missing','/deals/missing','/missing-page'])expect((await page.goto(path))?.status(),path).toBe(404);
});

test('budget and successful save count once; storage failure and rejected confirmation do not count',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()})));
 const events:{event_name:string;metadata:Record<string,string>}[]=[];
 page.on('response',response=>{if(response.url().endsWith('/analytics/events') && response.status()===202)events.push(response.request().postDataJSON());});
 await page.goto('/deals/growth-0');
 expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
 await page.locator('#budget-hotel').fill('200');
 await page.locator('#budget-food').fill('50');
 await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await expect.poll(()=>events.filter(e=>e.event_name==='TRIP_SAVE').length).toBe(1);
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await page.locator('#budget-food').fill('60');
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.includes('saved'))throw new Error('blocked');original.call(this,key,value);};});
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await expect(page.locator('#trip-save')).toContainText('Nie udało się zapisać');
 expect(events.filter(e=>e.event_name==='TRIP_SAVE')).toHaveLength(1);
 await page.goto('/alerts/confirm#token='+ 'a'.repeat(100));
 await page.getByRole('button',{name:'Potwierdzam zapis'}).click();
 await expect(page.getByRole('status')).toContainText('Link jest nieprawidłowy');
 expect(events.filter(e=>e.event_name==='ALERT_CONFIRMED')).toHaveLength(0);
 expect(JSON.stringify(events)).not.toContain('invalid-private-token');
});

test('only successful email confirmation emits a token-free consent-gated event',async({page,request})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()})));
 const payloads:Record<string,unknown>[]=[];
 page.on('response',response=>{if(response.url().endsWith('/analytics/events') && response.status()===202)payloads.push(response.request().postDataJSON());});
 const email=`growth-${crypto.randomUUID()}@example.test`;
 await page.goto('/alerts?origin=KRK');
 await page.getByLabel('Email',{exact:true}).fill(email);
 await page.getByRole('checkbox',{name:/Chcę otrzymywać/}).check();
 await page.getByRole('button',{name:'Wyślij link potwierdzający'}).click();
 await expect(page.getByRole('status')).toContainText('Sprawdź skrzynkę');
 expect(payloads).toHaveLength(0);
 const mail=await (await request.get(`http://127.0.0.1:8100/__test__/mail?email=${encodeURIComponent(email)}`)).json();
 await page.goto(mail[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0]);
 await page.getByRole('button',{name:'Potwierdzam zapis'}).click();
 await expect(page.getByRole('link',{name:'Zarządzaj alertem'})).toBeVisible();
 await expect.poll(()=>payloads.length).toBe(1);
 expect(payloads[0].event_name).toBe('ALERT_CONFIRMED');
 expect(JSON.stringify(payloads)).not.toMatch(/token|example.test|email/);
});
