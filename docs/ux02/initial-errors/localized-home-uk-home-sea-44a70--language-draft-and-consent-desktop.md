# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: localized-home.spec.ts >> uk: home, search, flight and logo retain language, draft and consent
- Location: tests\localized-home.spec.ts:15:6

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/uk\/deals\?origin=WRO&duration_min=2&duration_max=4$/
Received string:  "http://127.0.0.1:3125/uk/deals?origin=KRK&duration_min=2&duration_max=4"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    3 × locator resolved to <html lang="uk" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
      - unexpected value "http://127.0.0.1:3125/uk?origin=WRO"
    30 × locator resolved to <html lang="uk" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
       - unexpected value "http://127.0.0.1:3125/uk/deals?origin=KRK&duration_min=2&duration_max=4"

```

```yaml
- link "Перейти до вмісту":
  - /url: "#content"
- banner:
  - link "HopTrip — головна":
    - /url: /uk
    - text: HopTrip
  - navigation "Основна навігація":
    - link "Актуальні пропозиції":
      - /url: /uk/deals
    - link "Збережене":
      - /url: /uk/saved
    - link "Калькулятор бюджету":
      - /url: /uk/info/trip-budget
    - link "Як працює HopTrip":
      - /url: /uk/info
  - navigation "Мова":
    - link "Polski":
      - /url: /deals?origin=KRK&duration_min=2&duration_max=4
    - link "Русский":
      - /url: /ru/deals?origin=KRK&duration_min=2&duration_max=4
    - link "English":
      - /url: /en/deals?origin=KRK&duration_min=2&duration_max=4
    - link "Українська":
      - /url: /uk/deals?origin=KRK&duration_min=2&duration_max=4
- main:
  - paragraph: Перельоти з Польщі
  - heading "Актуальні пропозиції" [level=1]
  - paragraph: Ціна включає переліт. Проживання, додатковий багаж і трансфери оплачуються окремо.
  - region "Вибір перельотів":
    - form "Фільтри перельотів":
      - group:
        - text: Звідки
        - combobox "Звідки": Краків — KRK
        - text: "Місто або код IATA. Порожнє поле: будь-який варіант. Куди"
        - combobox "Куди"
        - text: "Місто або код IATA. Порожнє поле: будь-який варіант. Бюджет перельоту / особа (PLN)"
        - spinbutton "Бюджет перельоту / особа (PLN)"
        - button "Застосувати фільтри"
      - group "Швидкі фільтри":
        - button "На вихідні"
        - button "2–3 ночі"
        - button "Перельоти до 300 PLN"
      - group: Як працюють фільтри
      - group:
        - text: "Дати й строк поїздки Активно: 2 −"
        - paragraph: "Період вильоту, а не повернення. Строк поїздки в ночах. Порожнє поле: без обмеження."
        - text: Виліт від
        - textbox "Виліт від"
        - text: Виліт до
        - textbox "Виліт до"
        - text: Перебування від (ночей)
        - spinbutton "Перебування від (ночей)": "2"
        - text: Перебування до (ночей)
        - spinbutton "Перебування до (ночей)": "4"
      - text: Сортування перельотів
      - combobox "Сортування перельотів":
        - option "Оцінка пропозиції — спочатку висока" [selected]
        - option "Ціна — спочатку низька"
        - option "Виліт — спочатку найближчий"
    - paragraph: Застосовані фільтри
    - navigation "Застосовані фільтри":
      - 'link "Прибрати фільтр: Звідки: Краків — KRK"':
        - /url: /uk/deals?duration_min=2&duration_max=4
        - text: "Звідки:"
        - strong: Краків — KRK
      - 'link "Прибрати фільтр: Перебування від (ночей): 2"':
        - /url: /uk/deals?origin=KRK&duration_max=4
        - text: "Перебування від (ночей):"
        - strong: "2"
      - 'link "Прибрати фільтр: Перебування до (ночей): 4"':
        - /url: /uk/deals?origin=KRK&duration_min=2
        - text: "Перебування до (ночей):"
        - strong: "4"
    - link "Скинути всі фільтри":
      - /url: /uk/deals
  - status:
    - text: "Пропозицій:"
    - strong: "0"
  - heading "Немає актуальних пропозицій" [level=2]
  - paragraph: Змініть умову, щоб розширити пошук. Фільтри зберігаються, доки ви не виберете дію.
  - link "Прибрати обмеження кількості ночей":
    - /url: /uk/deals?origin=KRK
  - navigation "Сторінки результатів"
  - paragraph:
    - link "Повідомляти про відповідні перельоти":
      - /url: /uk/alerts?origin=KRK&duration_min=2&duration_max=4
    - text: ·
    - link "Збережені подорожі":
      - /url: /uk/saved
- contentinfo:
  - text: HopTrip.
  - paragraph: "Партнерське посилання: ми можемо отримати комісію після бронювання. Ми не продаємо квитки."
  - navigation "Про сервіс":
    - link "City break":
      - /url: /uk/city-break
    - link "Перельоти на вихідні":
      - /url: /uk/tanie-loty-na-weekend
    - link "Перельоти з Варшави":
      - /url: /uk/from/warszawa
    - link "Збережені подорожі":
      - /url: /uk/saved
    - link "Сповіщення про перельоти":
      - /url: /uk/alerts
    - link "Про HopTrip":
      - /url: /uk/info/about
    - link "Контакти":
      - /url: /uk/info/contact
    - link "Конфіденційність":
      - /url: /uk/info/privacy
    - link "Умови використання":
      - /url: /uk/info/terms
    - link "Партнерство":
      - /url: /uk/info/partners
  - button "Налаштування конфіденційності"
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