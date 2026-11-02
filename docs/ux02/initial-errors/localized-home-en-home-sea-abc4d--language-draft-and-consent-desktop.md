# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: localized-home.spec.ts >> en: home, search, flight and logo retain language, draft and consent
- Location: tests\localized-home.spec.ts:15:6

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/en\/deals\?origin=WRO&duration_min=2&duration_max=4$/
Received string:  "http://127.0.0.1:3125/en/deals?origin=KRK&duration_min=2&duration_max=4"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    4 × locator resolved to <html lang="en" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
      - unexpected value "http://127.0.0.1:3125/en?origin=WRO"
    29 × locator resolved to <html lang="en" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
       - unexpected value "http://127.0.0.1:3125/en/deals?origin=KRK&duration_min=2&duration_max=4"

```

```yaml
- link "Skip to content":
  - /url: "#content"
- banner:
  - link "HopTrip — home":
    - /url: /en
    - text: HopTrip
  - navigation "Main navigation":
    - link "Current deals":
      - /url: /en/deals
    - link "Saved":
      - /url: /en/saved
    - link "Budget calculator":
      - /url: /en/info/trip-budget
    - link "How HopTrip works":
      - /url: /en/info
  - navigation "Language":
    - link "Polski":
      - /url: /deals?origin=KRK&duration_min=2&duration_max=4
    - link "Русский":
      - /url: /ru/deals?origin=KRK&duration_min=2&duration_max=4
    - link "English":
      - /url: /en/deals?origin=KRK&duration_min=2&duration_max=4
    - link "Українська":
      - /url: /uk/deals?origin=KRK&duration_min=2&duration_max=4
- main:
  - paragraph: Flights from Poland
  - heading "Current deals" [level=1]
  - paragraph: The price covers the flight. Accommodation, extra baggage and transfers are not included.
  - region "Choose flights":
    - form "Flight filters":
      - group:
        - text: From
        - combobox "From": Kraków — KRK
        - text: City or IATA code. Leave empty for any. To
        - combobox "To"
        - text: City or IATA code. Leave empty for any. Flight budget / person (PLN)
        - spinbutton "Flight budget / person (PLN)"
        - button "Apply filters"
      - group "Quick filters":
        - button "Weekend"
        - button "2–3 nights"
        - button "Flights up to PLN 300"
      - group: How filters work
      - group:
        - text: "Dates and length of stay Active: 2 −"
        - paragraph: "Departure date range, not return dates. Stay length in nights. Empty field: no limit."
        - text: Depart from
        - textbox "Depart from"
        - text: Depart by
        - textbox "Depart by"
        - text: Stay from (nights)
        - spinbutton "Stay from (nights)": "2"
        - text: Stay up to (nights)
        - spinbutton "Stay up to (nights)": "4"
      - text: Sort flights
      - combobox "Sort flights":
        - option "Offer score — highest first" [selected]
        - option "Price — lowest first"
        - option "Departure — soonest first"
    - paragraph: Applied filters
    - navigation "Applied filters":
      - 'link "Remove filter: From: Kraków — KRK"':
        - /url: /en/deals?duration_min=2&duration_max=4
        - text: "From:"
        - strong: Kraków — KRK
      - 'link "Remove filter: Stay from (nights): 2"':
        - /url: /en/deals?origin=KRK&duration_max=4
        - text: "Stay from (nights):"
        - strong: "2"
      - 'link "Remove filter: Stay up to (nights): 4"':
        - /url: /en/deals?origin=KRK&duration_min=2
        - text: "Stay up to (nights):"
        - strong: "4"
    - link "Clear all filters":
      - /url: /en/deals
  - status:
    - text: "Offers:"
    - strong: "0"
  - heading "No current offers" [level=2]
  - paragraph: Change a condition to broaden your search. Filters stay unchanged until you choose an option.
  - link "Remove the nights limit":
    - /url: /en/deals?origin=KRK
  - navigation "Results pages"
  - paragraph:
    - link "Notify me about matching flights":
      - /url: /en/alerts?origin=KRK&duration_min=2&duration_max=4
    - text: ·
    - link "Saved trips":
      - /url: /en/saved
- contentinfo:
  - text: HopTrip.
  - paragraph: "Affiliate link: we may earn a commission after a booking. We do not sell tickets."
  - navigation "About the service":
    - link "City break":
      - /url: /en/city-break
    - link "Weekend flights":
      - /url: /en/tanie-loty-na-weekend
    - link "Flights from Warsaw":
      - /url: /en/from/warszawa
    - link "Saved trips":
      - /url: /en/saved
    - link "Flight alerts":
      - /url: /en/alerts
    - link "About HopTrip":
      - /url: /en/info/about
    - link "Contact":
      - /url: /en/info/contact
    - link "Privacy":
      - /url: /en/info/privacy
    - link "Terms of use":
      - /url: /en/info/terms
    - link "Affiliate partnerships":
      - /url: /en/info/partners
  - button "Privacy settings"
- alert
```

# Test source

```ts
  1  | import {test,expect as baseExpect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {homeText} from '../src/lib/i18n/home-copy';
  4  | import {localeNames} from '../src/lib/i18n/config';
  5  | import {chooseOrigin} from './origin-helpers';
  6  | const expect=baseExpect.configure({timeout:15000});
  7  | 
  8  | test.beforeEach(async({page})=>{
  9  |  await page.addInitScript(()=>{
  10 |   if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  11 |  });
  12 | });
  13 | 
  14 | for(const locale of ['en','ru','uk'] as const){
  15 |  test(`${locale}: home, search, flight and logo retain language, draft and consent`,async({page})=>{
  16 |   test.setTimeout(90000);
  17 |   const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  18 |   await page.goto(`/${locale}?origin=WRO#current-deals`);
  19 |   const consent=await page.evaluate(()=>localStorage.getItem('hoptrip.consent.v1'));
  20 |   await expect(page.locator('html')).toHaveAttribute('lang',locale);
  21 |   await expect(page.getByRole('heading',{level:1})).toHaveText(homeText(locale,'Tanie podróże zaczynają się tutaj.'));
  22 |   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`http://127.0.0.1:3125/${locale}`);
  23 |   await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  24 |   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index,/);
  25 | 
  26 |   await chooseOrigin(page,'KRK');
  27 | 
  28 |   await expect(page).toHaveURL(new RegExp(`/${locale}\\?origin=KRK#current-deals$`));
  29 |   await page.goto(`/${locale}`);
  30 |   await expect(page.locator('#home-origin')).toHaveValue(/KRK/);
  31 |   // The fixture has no short KRK trips; use its WRO offers for the card journey.
  32 | 
  33 |   await chooseOrigin(page,'WRO');
  34 | 
  35 |   await expect(page).toHaveURL(new RegExp(`/${locale}\\?origin=WRO$`));
  36 |   await page.getByRole('link',{name:homeText(locale,'Zobacz wszystkie loty na 2–4 noce →'),exact:true}).click();
> 37 |   await expect(page).toHaveURL(new RegExp(`/${locale}/deals\\?origin=WRO&duration_min=2&duration_max=4$`));
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  38 |   await page.locator('.deal-card-link').first().click();
  39 |   await expect(page).toHaveURL(new RegExp(`/${locale}/deals/browser[^/?]*\\?returnTo=`));
  40 |   const flight=page.url();
  41 |   await expect(page.locator('html')).toHaveAttribute('lang',locale);
  42 |   await page.locator('#budget-hotel').fill('321');
  43 |   await page.locator('.site-header .brand').click();
  44 |   await expect(page).toHaveURL(new RegExp(`/${locale}$`));
  45 |   await expect(page.getByRole('heading',{level:1})).toHaveText(homeText(locale,'Tanie podróże zaczynają się tutaj.'));
  46 |   expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  47 |   await page.setViewportSize({width:320,height:850});
  48 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  49 |   await page.goto(flight);
  50 |   await expect(page.locator('#budget-hotel')).toHaveValue('321');
  51 |   expect(await page.evaluate(()=>localStorage.getItem('hoptrip.consent.v1'))).toBe(consent);
  52 |   expect(errors).toEqual([]);
  53 |  });
  54 | }
  55 | 
  56 | test('home language switching preserves query and fragment; landing links retain language',async({page,request})=>{
  57 |  await page.goto('/?origin=WRO#current-deals');
  58 |  for(const locale of ['en','ru','uk','pl'] as const){
  59 |   await page.locator('.language-switcher').getByRole('link',{name:localeNames[locale],exact:true}).click();
  60 |   await expect(page.locator('html')).toHaveAttribute('lang',locale);
  61 |   await expect(page.locator('.site-header .brand')).toHaveAttribute('href',locale==='pl'?'/':`/${locale}`);
  62 |   expect(new URL(page.url()).search).toBe('?origin=WRO');expect(new URL(page.url()).hash).toBe('#current-deals');
  63 |   await expect(page.locator(`main a[href="${locale==='pl'?'':`/${locale}`}/city-break"]`)).toHaveAttribute('hrefLang',locale);
  64 |  }
  65 |  const xml=await(await request.get('/sitemap.xml')).text();
  66 |  for(const locale of ['en','ru','uk'])expect(xml).toContain(`/${locale}</loc>`);
  67 |  for(const path of ['/pl','/de','/ua'])expect((await request.get(path)).status()).toBe(404);
  68 | });
  69 | 
```