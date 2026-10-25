import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('observation and seller caveat are visible next to the price without opening details',async({page},testInfo)=>{
 await page.goto('/from/WRO');
 const card=page.locator('.deal-card').filter({has:page.locator('a[href="/deals/browser-deal"]')});
 const notice=card.locator('.price-freshness');
 await expect(notice.getByText(/Pierwszy zapis tej ceny/)).toBeVisible();
 await expect(notice.getByText(/Dostępność i ostateczną cenę/)).toBeVisible();
 await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');
 const observed=await notice.locator('> p time').getAttribute('datetime');
 await card.locator('.deal-card-link').click();
 const detail=page.locator('#flight-price-freshness');
 await expect(detail.locator('> p time')).toHaveAttribute('datetime',observed!);
 await expect(detail.getByText(/Bez potwierdzenia na żywo/)).toBeVisible();
 await detail.locator('summary').click();
 await expect(detail).toContainText('48 h');
 await expect(detail).toContainText('Pobrano rekord: czas nieznany');
 expect((await new AxeBuilder({page}).include('.detail-layout').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await detail.screenshot({path:testInfo.outputPath('price-freshness.png')});
});

test('delivery time is separate and an open tab removes the partner link at the deadline',async({page})=>{
 await page.clock.install({time:new Date()});
 await page.goto('/deals/freshness-fixture');
 const notice=page.locator('#flight-price-freshness');
 await expect(notice.getByText(/Obserwacja ceny u źródła/)).toBeVisible();
 await expect(page.getByRole('link',{name:'Sprawdź lot — Fixture program'})).toBeVisible();
 await notice.locator('summary').click();
 const stamps=await notice.locator('time').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('datetime')!));
 expect(Date.parse(stamps[1])-Date.parse(stamps[0])).toBe(3*3600000);
 await page.clock.fastForward(61000);
 await expect(notice).toHaveAttribute('data-expired','true');
 await expect(notice.getByRole('status')).toContainText('Upłynął czas');
 await expect(page.getByRole('link',{name:'Sprawdź lot — Fixture program'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Odśwież stronę'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.detail-layout').analyze()).violations).toEqual([]);
});
