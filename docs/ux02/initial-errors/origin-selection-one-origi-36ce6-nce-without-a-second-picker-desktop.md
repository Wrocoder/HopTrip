# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: origin-selection.spec.ts >> one origin updates search, recommendations, URL and preference without a second picker
- Location: tests\origin-selection.spec.ts:11:5

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByRole('combobox', { name: 'Skąd', exact: true })
Expected pattern: /KTW/
Received string:  "Gdańsk — GDN"
Timeout: 15000ms

Call log:
  - Expect "toHaveValue" getByRole('combobox', { name: 'Skąd', exact: true }) with timeout 15000ms
  - waiting for getByRole('combobox', { name: 'Skąd', exact: true })
    33 × locator resolved to <input name="origin" maxlength="240" role="combobox" id="home-origin" autocomplete="off" aria-invalid="false" value="Gdańsk — GDN" aria-expanded="false" aria-autocomplete="list" placeholder="Dowolne lotnisko" aria-controls="home-origin-options" aria-describedby="home-origin-hint"/>
       - unexpected value "Gdańsk — GDN"

```

```yaml
- combobox "Skąd": Gdańsk — GDN
```

# Test source

```ts
  1  | import {test,expect as baseExpect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {chooseOrigin} from './origin-helpers';
  4  | const expect=baseExpect.configure({timeout:15000});
  5  | test.beforeEach(async({page,request})=>{
  6  |  await request.post('http://127.0.0.1:8125/__test__/short-trips?enabled=true');
  7  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  8  | });
  9  | test.afterEach(async({request})=>{await request.post('http://127.0.0.1:8125/__test__/short-trips?enabled=false');});
  10 | 
  11 | test('one origin updates search, recommendations, URL and preference without a second picker',async({page,context})=>{
  12 |  await page.goto('/');
  13 |  const origin=page.getByRole('combobox',{name:'Skąd',exact:true});
  14 |  await chooseOrigin(page,'KTW');
  15 |  await expect(page).toHaveURL(/origin=KTW/);
  16 |  await expect(page.locator('.catalog-section .section-heading .eyebrow')).toContainText('KTW');
  17 |  await expect(page.locator('#short-trip-origin')).toHaveCount(0);
  18 |  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
  19 |  expect((await context.cookies()).find(c=>c.name==='hoptrip.origin.v1')?.value).toBe('KTW');
  20 |  await page.reload();await expect(origin).toHaveValue(/KTW/);
  21 |  await page.getByRole('button',{name:'Zmień lotnisko',exact:true}).click();await expect(origin).toBeFocused();
  22 |  await chooseOrigin(page,'GDN');
  23 |  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
  24 |  await expect(page.locator('.catalog-section')).toContainText('Brak aktualnych lotów');
> 25 |  await page.goBack();await expect(origin).toHaveValue(/KTW/);
     |                                           ^ Error: expect(locator).toHaveValue(expected) failed
  26 |  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
  27 |  await page.goBack();await expect(origin).toHaveValue('');
  28 | });
  29 | 
  30 | test('origin changes preserve destination, date and budget drafts and clear without resurrecting the cookie',async({page})=>{
  31 |  await page.goto('/?origin=WAW');
  32 |  await page.locator('input[name="destination"]').fill('Mediolan');
  33 |  await page.locator('input[name="budget"]').fill('321');
  34 |  await page.locator('input[name="departure_from"]').fill('2030-05-01');
  35 |  await chooseOrigin(page,'KTW');
  36 |  await expect(page.locator('input[name="budget"]')).toHaveValue('321');
  37 |  await expect(page.locator('input[name="departure_from"]')).toHaveValue('2030-05-01');
  38 |  await expect(page.locator('input[name="destination"]')).toHaveValue(/Mediolan/);
  39 |  await chooseOrigin(page,'');
  40 |  await page.reload();await expect(page.locator('#home-origin')).toHaveValue('');
  41 |  await page.goto('/');await expect(page.locator('#home-origin')).toHaveValue('');
  42 |  expect((await new AxeBuilder({page}).include('.hero').analyze()).violations).toEqual([]);
  43 |  await page.setViewportSize({width:320,height:844});
  44 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  45 | });
  46 | 
  47 | test('a delayed earlier recommendation response cannot replace the current origin, even without cookie storage',async({page})=>{
  48 |  test.setTimeout(60000);
  49 |  await page.goto('/?origin=WAW');
  50 |  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(6);
  51 |  let held=false;
  52 |  let release!:()=>void;
  53 |  const gate=new Promise<void>(resolve=>{release=resolve;});
  54 |  // Simulate optional preference failure and delay one server snapshot deterministically.
  55 |  await page.route('**/*',async route=>{
  56 |   const req=route.request(),url=new URL(req.url());
  57 |   if(req.method()==='POST' && req.headers()['next-action'])return route.abort();
  58 |   if(req.method()==='GET' && url.searchParams.get('origin')==='KTW' && url.searchParams.has('_rsc')){
  59 |    const response=await route.fetch();held=true;await gate;await route.fulfill({response});return;
  60 |   }
  61 |   await route.continue();
  62 |  });
  63 |  const select=async(code:string)=>{const input=page.locator('#home-origin');await input.fill(code);await input.press('ArrowDown');await input.press('Enter');};
  64 |  try{
  65 |   await select('KTW');
  66 |   await expect.poll(()=>held).toBe(true);
  67 |   await expect(page.locator('.catalog-section')).toHaveAttribute('aria-busy','true');
  68 |   await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
  69 |   await select('GDN');
  70 |   await expect(page.locator('.catalog-section')).toHaveAttribute('aria-busy','false');
  71 |   release();
  72 |   await expect(page.locator('.catalog-section .section-heading .eyebrow')).toContainText('GDN');
  73 |   await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
  74 |   await expect(page.locator('.catalog-section')).toContainText('Brak aktualnych lotów');
  75 |  }finally{release();await page.unrouteAll({behavior:'wait'});}
  76 | });
  77 | 
  78 | test('an invalid airport draft does not change the committed origin or recommendations',async({page})=>{
  79 |  await page.goto('/?origin=KTW');
  80 |  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
  81 |  const input=page.locator('#home-origin');
  82 |  await input.fill('Missing airport');
  83 |  await page.getByRole('button',{name:'Znajdź tani lot',exact:true}).click();
  84 |  await expect(input).toBeFocused();
  85 |  await expect(input).toHaveAttribute('aria-invalid','true');
  86 |  await expect(page).toHaveURL(/origin=KTW$/);
  87 |  await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
  88 | });
  89 | 
```