import {test,expect as baseExpect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {chooseOrigin} from './origin-helpers';
const expect=baseExpect.configure({timeout:15000});
test.beforeEach(async({page,request})=>{
 await request.post('http://127.0.0.1:8100/__test__/short-trips?enabled=true');
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post('http://127.0.0.1:8100/__test__/short-trips?enabled=false');});

test('one origin updates search, recommendations, URL and preference without a second picker',async({page,context})=>{
 await page.goto('/');
 const origin=page.getByRole('combobox',{name:'Skąd',exact:true});
 await chooseOrigin(page,'KTW');
 await expect(page).toHaveURL(/origin=KTW/);
 await expect(page.locator('.catalog-section .section-heading .eyebrow')).toContainText('KTW');
 await expect(page.locator('#short-trip-origin')).toHaveCount(0);
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
 expect((await context.cookies()).find(c=>c.name==='hoptrip.origin.v1')?.value).toBe('KTW');
 await page.reload();await expect(origin).toHaveValue(/KTW/);
 await page.getByRole('button',{name:'Zmień lotnisko',exact:true}).click();await expect(origin).toBeFocused();
 await chooseOrigin(page,'GDN');
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
 await expect(page.locator('.catalog-section')).toContainText('Brak aktualnych lotów');
 await page.goBack();await expect(origin).toHaveValue(/KTW/);
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
 await page.goBack();await expect(origin).toHaveValue('');
});

test('origin changes preserve destination, date and budget drafts and clear without resurrecting the cookie',async({page})=>{
 await page.goto('/?origin=WAW');
 await page.locator('input[name="destination"]').fill('Mediolan');
 await page.locator('input[name="budget"]').fill('321');
 await page.locator('input[name="departure_from"]').fill('2030-05-01');
 await chooseOrigin(page,'KTW');
 await expect(page.locator('input[name="budget"]')).toHaveValue('321');
 await expect(page.locator('input[name="departure_from"]')).toHaveValue('2030-05-01');
 await expect(page.locator('input[name="destination"]')).toHaveValue(/Mediolan/);
 await chooseOrigin(page,'');
 await page.reload();await expect(page.locator('#home-origin')).toHaveValue('');
 await page.goto('/');await expect(page.locator('#home-origin')).toHaveValue('');
 expect((await new AxeBuilder({page}).include('.hero').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('a delayed earlier recommendation response cannot replace the current origin, even without cookie storage',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/?origin=WAW');
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(6);
 let held=false,delivered=false;
 let release!:()=>void;
 const gate=new Promise<void>(resolve=>{release=resolve;});
 // Simulate optional preference failure and delay one server snapshot deterministically.
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()==='POST' && req.headers()['next-action'])return route.abort();
  if(req.method()==='GET' && url.searchParams.get('origin')==='KTW' && url.searchParams.has('_rsc')){
   const response=await route.fetch();held=true;await gate;await route.fulfill({response});delivered=true;return;
  }
  await route.continue();
 });
 const select=async(code:string)=>{const input=page.locator('#home-origin');await input.fill(code);await input.press('ArrowDown');await input.press('Enter');};
 try{
  await select('KTW');
  await expect.poll(()=>held).toBe(true);
  await expect(page.locator('.catalog-section')).toHaveAttribute('aria-busy','true');
  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
  await select('GDN');
  await expect(page.locator('.catalog-section .section-heading .eyebrow')).toContainText('GDN');
  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
  // React may entangle both transitions; release the first before waiting for
  // the final server commit, while never showing its cards under the new label.
  release();
  await expect.poll(()=>delivered).toBe(true);
  await expect(page.locator('.catalog-section')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('.catalog-section .section-heading .eyebrow')).toContainText('GDN');
  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
  await expect(page.locator('.catalog-section')).toContainText('Brak aktualnych lotów');
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});

test('an invalid airport draft does not change the committed origin or recommendations',async({page})=>{
 await page.goto('/?origin=KTW');
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
 const input=page.locator('#home-origin');
 await input.fill('Missing airport');
 await page.getByRole('button',{name:'Znajdź tani lot',exact:true}).click();
 await expect(input).toBeFocused();
 await expect(input).toHaveAttribute('aria-invalid','true');
 await expect(page).toHaveURL(/origin=KTW$/);
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
});
