# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: localized-home.spec.ts >> ru: home, search, flight and logo retain language, draft and consent
- Location: tests\localized-home.spec.ts:15:6

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/ru\/deals\?origin=WRO&duration_min=2&duration_max=4$/
Received string:  "http://127.0.0.1:3125/ru/deals?origin=KRK&duration_min=2&duration_max=4"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    5 × locator resolved to <html lang="ru" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
      - unexpected value "http://127.0.0.1:3125/ru?origin=WRO"
    28 × locator resolved to <html lang="ru" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
       - unexpected value "http://127.0.0.1:3125/ru/deals?origin=KRK&duration_min=2&duration_max=4"

```

```yaml
- link "Перейти к содержимому":
  - /url: "#content"
- banner:
  - link "HopTrip — главная":
    - /url: /ru
    - text: HopTrip
  - navigation "Основная навигация":
    - link "Актуальные предложения":
      - /url: /ru/deals
    - link "Сохранённое":
      - /url: /ru/saved
    - link "Калькулятор бюджета":
      - /url: /ru/info/trip-budget
    - link "Как работает HopTrip":
      - /url: /ru/info
  - navigation "Язык":
    - link "Polski":
      - /url: /deals?origin=KRK&duration_min=2&duration_max=4
    - link "Русский":
      - /url: /ru/deals?origin=KRK&duration_min=2&duration_max=4
    - link "English":
      - /url: /en/deals?origin=KRK&duration_min=2&duration_max=4
    - link "Українська":
      - /url: /uk/deals?origin=KRK&duration_min=2&duration_max=4
- main:
  - paragraph: Перелёты из Польши
  - heading "Актуальные предложения" [level=1]
  - paragraph: Цена включает перелёт. Проживание, дополнительный багаж и трансферы оплачиваются отдельно.
  - region "Выбор перелётов":
    - form "Фильтры перелётов":
      - group:
        - text: Откуда
        - combobox "Откуда": Краков — KRK
        - text: "Город или код IATA. Пустое поле: любой вариант. Куда"
        - combobox "Куда"
        - text: "Город или код IATA. Пустое поле: любой вариант. Бюджет перелёта / человек (PLN)"
        - spinbutton "Бюджет перелёта / человек (PLN)"
        - button "Применить фильтры"
      - group "Быстрые фильтры":
        - button "На выходные"
        - button "2–3 ночи"
        - button "Перелёты до 300 PLN"
      - group: Как работают фильтры
      - group:
        - text: "Даты и срок поездки Активно: 2 −"
        - paragraph: "Период вылета, а не возвращения. Срок поездки в ночах. Пустое поле: без ограничения."
        - text: Вылет с
        - textbox "Вылет с"
        - text: Вылет до
        - textbox "Вылет до"
        - text: Пребывание от (ночей)
        - spinbutton "Пребывание от (ночей)": "2"
        - text: Пребывание до (ночей)
        - spinbutton "Пребывание до (ночей)": "4"
      - text: Сортировка перелётов
      - combobox "Сортировка перелётов":
        - option "Оценка предложения — сначала высокая" [selected]
        - option "Цена — сначала низкая"
        - option "Вылет — сначала ближайший"
    - paragraph: Применённые фильтры
    - navigation "Применённые фильтры":
      - 'link "Убрать фильтр: Откуда: Краков — KRK"':
        - /url: /ru/deals?duration_min=2&duration_max=4
        - text: "Откуда:"
        - strong: Краков — KRK
      - 'link "Убрать фильтр: Пребывание от (ночей): 2"':
        - /url: /ru/deals?origin=KRK&duration_max=4
        - text: "Пребывание от (ночей):"
        - strong: "2"
      - 'link "Убрать фильтр: Пребывание до (ночей): 4"':
        - /url: /ru/deals?origin=KRK&duration_min=2
        - text: "Пребывание до (ночей):"
        - strong: "4"
    - link "Сбросить все фильтры":
      - /url: /ru/deals
  - status:
    - text: "Предложений:"
    - strong: "0"
  - heading "Нет актуальных предложений" [level=2]
  - paragraph: Измените условие, чтобы расширить поиск. Фильтры сохраняются, пока вы не выберете действие.
  - link "Убрать ограничение числа ночей":
    - /url: /ru/deals?origin=KRK
  - navigation "Страницы результатов"
  - paragraph:
    - link "Сообщать о подходящих перелётах":
      - /url: /ru/alerts?origin=KRK&duration_min=2&duration_max=4
    - text: ·
    - link "Сохранённые поездки":
      - /url: /ru/saved
- contentinfo:
  - text: HopTrip.
  - paragraph: "Партнёрская ссылка: мы можем получить комиссию после бронирования. Мы не продаём билеты."
  - navigation "О сервисе":
    - link "City break":
      - /url: /ru/city-break
    - link "Перелёты на выходные":
      - /url: /ru/tanie-loty-na-weekend
    - link "Перелёты из Варшавы":
      - /url: /ru/from/warszawa
    - link "Сохранённые поездки":
      - /url: /ru/saved
    - link "Уведомления о перелётах":
      - /url: /ru/alerts
    - link "О HopTrip":
      - /url: /ru/info/about
    - link "Контакты":
      - /url: /ru/info/contact
    - link "Конфиденциальность":
      - /url: /ru/info/privacy
    - link "Условия использования":
      - /url: /ru/info/terms
    - link "Партнёрство":
      - /url: /ru/info/partners
  - button "Настройки конфиденциальности"
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