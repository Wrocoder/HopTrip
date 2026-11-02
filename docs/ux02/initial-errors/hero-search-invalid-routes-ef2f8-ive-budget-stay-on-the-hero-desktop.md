# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hero-search.spec.ts >> invalid routes, inverted dates and negative budget stay on the hero
- Location: tests\hero-search.spec.ts:82:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/$/
Received string:  "http://127.0.0.1:3125/?origin=WRO"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × locator resolved to <html lang="pl" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__IJidSG__variable headingfont_80a9613f-module__PaPRZW__variable">…</html>
       - unexpected value "http://127.0.0.1:3125/?origin=WRO"

```

```yaml
- link "Przejdź do treści":
  - /url: "#content"
- banner:
  - link "HopTrip — strona główna":
    - /url: /
    - text: HopTrip
  - navigation "Nawigacja główna":
    - link "Aktualne okazje":
      - /url: /deals
    - link "Zapisane":
      - /url: /saved
    - link "Kalkulator budżetu":
      - /url: /info/trip-budget
    - link "Jak działa HopTrip":
      - /url: /info
  - navigation "Język":
    - link "Polski":
      - /url: /?origin=WRO
    - link "Русский":
      - /url: /ru?origin=WRO
    - link "English":
      - /url: /en?origin=WRO
    - link "Українська":
      - /url: /uk?origin=WRO
- main:
  - region "Tanie podróże zaczynają się tutaj.":
    - paragraph: Loty z Polski · HopTrip
    - heading "Tanie podróże zaczynają się tutaj." [level=1]
    - paragraph: Znajdź lot, sprawdź wydarzenia i zaplanuj wyjazd w jednym miejscu.
    - region "Wybór ofert":
      - form "Filtry ofert":
        - group:
          - text: Skąd
          - combobox "Skąd": Wrocław — WRO
          - text: "Miasto lub kod IATA. Puste pole: dowolne. Dokąd"
          - combobox "Dokąd"
          - text: "Miasto lub kod IATA. Puste pole: dowolne."
          - group "Elastyczne daty wylotu":
            - text: Elastyczne daty wylotu Wylot od
            - textbox "Wylot od": 2030-05-10
            - text: Wylot do
            - textbox "Wylot do": 2030-05-20
            - paragraph: Wybierz przedział możliwego wylotu. Zostaw daty puste, aby szukać bez ograniczeń.
          - text: Budżet na lot / osobę (PLN, opcjonalnie)
          - spinbutton "Budżet na lot / osobę (PLN, opcjonalnie)": "-1"
          - button "Znajdź tani lot"
        - group: "Więcej opcji: długość pobytu"
  - region "Krótkie wyjazdy · 2–4 noce":
    - paragraph: "Wylot: WRO"
    - heading "Krótkie wyjazdy · 2–4 noce" [level=2]
    - text: za osobę · PLN
    - paragraph: W tej sekcji pomijamy loty z brakującymi lub sprzecznymi kluczowymi danymi trasy. Pełny katalog może zawierać takie loty z ostrzeżeniem.
    - button "Zmień lotnisko"
    - paragraph: Lotnisko wybierasz w wyszukiwarce. Ten sam wybór stosujemy do propozycji poniżej i zapamiętujemy na tym urządzeniu.
    - article:
      - text: W obie strony
      - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026 3 noce 213,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony"':
        - /url: /deals/browser-13
        - paragraph: Wrocław (WRO)
        - heading "Barcelona Hiszpania" [level=2]:
          - text: Barcelona
          - img "Hiszpania"
        - paragraph: "Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026"
        - paragraph: 3 noce
        - paragraph: 213,00 zł ≈ 48 € za osobę · w obie strony
      - paragraph:
        - text: "Czas zapisanej obserwacji:"
        - time: 31.10.2026, 08:14
        - text: (czas w Polsce).
      - paragraph: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
      - note:
        - strong: Niepełne dane lotu
        - paragraph: Nie wszystkie godziny podróży są znane.
        - group: Jakich danych brakuje?
        - paragraph: Kompletność danych nie potwierdza dostępności u sprzedawcy.
      - paragraph:
        - strong: Wylot
        - text: "· 30 lis: WRO 11:00 → BCN 13:00 · szac. Bez przesiadek"
      - paragraph:
        - strong: Powrót
        - text: "· 3 gru: BCN 11:00 → WRO brak godziny Liczba przesiadek: 1"
      - paragraph: Godziny lokalne · Przylot szacowany
      - paragraph: "Wylot: Ryanair (FR) · Powrót: Przewoźnik powrotny do sprawdzenia"
      - paragraph: "Między przylotem a odlotem: 70 godz. 0 min (szac.)."
      - group: Szczegóły lotu i ceny
      - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona"':
        - /url: /deals/browser-13#score
        - text: Jak porównujemy cenę?
    - paragraph: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
    - status: "Liczba propozycji na 2–4 noce: 1."
    - paragraph: Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.
    - paragraph: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione. Sprawdź godziny lotów i potrzebne dni urlopu.
    - paragraph:
      - link "Zobacz wszystkie loty na 2–4 noce →":
        - /url: /deals?origin=WRO&duration_min=2&duration_max=4
  - navigation "Pomysły na krótki wyjazd":
    - link "City break na 2–4 noce":
      - /url: /city-break
    - link "Tanie loty na weekend":
      - /url: /tanie-loty-na-weekend
    - link "Warszawa — oba lotniska":
      - /url: /from/warszawa
  - paragraph:
    - link "Zobacz loty ze wszystkich lotnisk →":
      - /url: /deals
    - text: ·
    - link "Jak oceniamy ofertę →":
      - /url: /info/price-comparison
  - complementary "Budżet podróży":
    - paragraph: "Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy."
    - link "Policz budżet podróży":
      - /url: /info/trip-budget#calculator
  - paragraph: 02 / Skąd wyruszasz
  - heading "Lotniska wylotu" [level=2]
  - link "Kraków — KRK":
    - /url: /from/KRK
  - link "Warszawa-Chopin — WAW":
    - /url: /from/WAW
  - link "Warszawa-Modlin — WMI":
    - /url: /from/WMI
  - link "Wrocław — WRO":
    - /url: /from/WRO
  - paragraph: 03 / Dokąd chcesz polecieć
  - heading "Kierunki" [level=2]
  - link "Barcelona":
    - /url: /destinations/barcelona
  - link "Mediolan":
    - /url: /destinations/milan
  - link "Rzym":
    - /url: /destinations/rome
  - complementary:
    - paragraph: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione.
    - link "Współpraca partnerska →":
      - /url: /info/partners
- contentinfo:
  - text: HopTrip.
  - paragraph: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
  - navigation "Informacje o serwisie":
    - link "City break":
      - /url: /city-break
    - link "Loty na weekend":
      - /url: /tanie-loty-na-weekend
    - link "Loty z Warszawy":
      - /url: /from/warszawa
    - link "Zapisane wyjazdy":
      - /url: /saved
    - link "Subskrypcja lotów":
      - /url: /alerts
    - link "O HopTrip":
      - /url: /info/about
    - link "Kontakt":
      - /url: /info/contact
    - link "Prywatność":
      - /url: /info/privacy
    - link "Zasady korzystania":
      - /url: /info/terms
    - link "Współpraca partnerska":
      - /url: /info/partners
  - button "Ustawienia prywatności"
- alert: Tanie podróże zaczynają się tutaj.
```

# Test source

```ts
  1   | import {test,expect as baseExpect} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {homeText} from '../src/lib/i18n/home-copy';
  4   | import {filterText} from '../src/lib/i18n/filter-copy';
  5   | import {getMessages} from '../src/lib/i18n/messages';
  6   | import {chooseOrigin} from './origin-helpers';
  7   | const expect=baseExpect.configure({timeout:15000});
  8   | 
  9   | test.beforeEach(async({page})=>{
  10  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  11  | });
  12  | 
  13  | test('hero has one primary search, visible flexible dates and an explicit anywhere choice',async({page},testInfo)=>{
  14  |  await page.goto('/');
  15  |  await page.screenshot({path:testInfo.outputPath('hero.png'),fullPage:false});
  16  |  const hero=page.locator('.hero');
  17  |  await expect(hero.getByRole('heading',{level:1})).toHaveText('Tanie podróże zaczynają się tutaj.');
  18  |  await expect(hero.locator('form')).toHaveCount(1);
  19  |  await expect(hero.locator('button[type="submit"]')).toHaveCount(1);
  20  |  await expect(hero.locator('.trip-presets')).toHaveCount(0);
  21  |  await expect(hero.locator('input[name="departure_from"]')).toBeVisible();
  22  |  await expect(hero.locator('input[name="departure_to"]')).toBeVisible();
  23  |  await hero.getByRole('combobox',{name:'Dokąd',exact:true}).focus();
  24  |  await hero.getByRole('option',{name:'Dokądkolwiek',exact:true}).click();
  25  |  await expect(hero.getByRole('combobox',{name:'Dokąd',exact:true})).toHaveValue('');
  26  |  expect((await new AxeBuilder({page}).include('.hero').analyze()).violations).toEqual([]);
  27  |  await page.setViewportSize({width:320,height:844});
  28  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  29  |  for(const input of await hero.locator('input:not([type="hidden"])').all())if(await input.isVisible()){
  30  |   expect(await input.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  31  |   expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  32  |  }
  33  |  await page.screenshot({path:testInfo.outputPath('hero-320.png')});
  34  |  await hero.screenshot({path:testInfo.outputPath('hero-320-full.png')});
  35  | });
  36  | 
  37  | test('origin-only and destination-budget searches use the existing catalog filters',async({page})=>{
  38  |  await page.goto('/');
  39  |  await chooseOrigin(page,'WRO');
  40  |  let release=()=>{};
  41  |  const allowed=new Promise<void>(resolve=>{release=resolve;});
  42  |  const actionUrl=page.url();
  43  |  await page.route(actionUrl,async route=>{if(route.request().method()==='POST')await allowed;await route.continue();});
  44  |  try{
  45  |   await page.locator('.hero button[type="submit"]').click();
  46  |   await expect(page.locator('.hero form')).toHaveAttribute('aria-busy','true');
  47  |   await expect(page.getByRole('combobox',{name:'Skąd',exact:true})).toBeDisabled();
  48  |   await expect(page.locator('.hero button[type="submit"]')).toBeDisabled();
  49  |   release();await expect(page).toHaveURL(/\/deals\?origin=WRO$/);
  50  |  }finally{release();await page.unroute(actionUrl);}
  51  |  await expect(page.locator('.deal-card')).not.toHaveCount(0);
  52  |  await page.goto('/');
  53  |  await page.getByRole('combobox',{name:'Dokąd',exact:true}).fill('Mediolan');
  54  |  await page.locator('.hero input[name="budget"]').fill('300');
  55  |  await page.locator('.hero button[type="submit"]').click();
  56  |  await expect(page).toHaveURL(/origin=WRO&destination=milan&budget=300$/);
  57  |  await expect(page.locator('input[name="budget"]')).toHaveValue('300');
  58  | });
  59  | 
  60  | test('flexible departure bounds and every filter survive detail, reload and return',async({page})=>{
  61  |  await page.goto('/?origin=WRO&budget=220&departure_from=2030-05-01&departure_to=2030-05-10&sort=price');
  62  |  await expect(page.locator('.hero input[name="budget"]')).toHaveValue('220');
  63  |  await expect(page.locator('.hero input[name="departure_from"]')).toHaveValue('2030-05-01');
  64  |  // Fixture dates are relative to today; select an inclusive range around them.
  65  |  const from=new Date();from.setUTCDate(from.getUTCDate()+1);
  66  |  const to=new Date();to.setUTCDate(to.getUTCDate()+90);
  67  |  await page.locator('.hero input[name="departure_from"]').fill(from.toISOString().slice(0,10));
  68  |  await page.locator('.hero input[name="departure_to"]').fill(to.toISOString().slice(0,10));
  69  |  await page.locator('.hero button[type="submit"]').click();
  70  |  await expect(page).toHaveURL(/\/deals\?/);
  71  |  const search=page.url();
  72  |  expect(new URL(search).searchParams.get('departure_to')).toBe(to.toISOString().slice(0,10));
  73  |  expect(new URL(search).searchParams.get('sort')).toBe('price');
  74  |  await page.locator('.deal-card-link').first().click();
  75  |  await expect(page.locator('.back-link')).toBeVisible();
  76  |  await page.reload();
  77  |  await page.locator('.back-link').click();
  78  |  await expect(page).toHaveURL(search);
  79  |  await expect(page.locator('input[name="budget"]')).toHaveValue('220');
  80  | });
  81  | 
  82  | test('invalid routes, inverted dates and negative budget stay on the hero',async({page})=>{
  83  |  await page.goto('/');
  84  |  await page.getByRole('combobox',{name:'Skąd',exact:true}).fill('No such airport');
  85  |  await page.locator('.hero button[type="submit"]').click();
  86  |  await expect(page.locator('.hero [role="alert"]')).toContainText('Nie znaleziono lotniska');
  87  |  await expect(page.getByRole('combobox',{name:'Skąd',exact:true})).toBeFocused();
  88  |  await page.getByRole('combobox',{name:'Skąd',exact:true}).fill('WRO');
  89  |  await page.locator('.hero input[name="departure_from"]').fill('2030-05-10');
  90  |  await page.locator('.hero input[name="departure_to"]').fill('2030-05-01');
  91  |  await page.locator('.hero button[type="submit"]').click();
  92  |  await expect(page.locator('.hero [role="alert"]')).toContainText('Koniec zakresu dat');
  93  |  await page.locator('.hero input[name="departure_to"]').fill('2030-05-20');
  94  |  await page.locator('.hero input[name="budget"]').fill('-1');
  95  |  await page.locator('.hero button[type="submit"]').click();
  96  |  expect(await page.locator('.hero input[name="budget"]').evaluate((node:HTMLInputElement)=>node.validity.rangeUnderflow)).toBe(true);
> 97  |  await expect(page).toHaveURL(/\/$/);
      |                     ^ Error: expect(page).toHaveURL(expected) failed
  98  | });
  99  | 
  100 | test('all four languages retain translated search and return context',async({page})=>{
  101 |  test.setTimeout(120000);
  102 |  for(const locale of ['pl','en','ru','uk'] as const){
  103 |   const prefix=locale==='pl'?'':`/${locale}`;
  104 |   await page.goto(`${prefix}/?origin=WRO`);
  105 |   await expect(page.locator('#hero-title')).toHaveText(homeText(locale,'Tanie podróże zaczynają się tutaj.'));
  106 |   const destination=page.getByRole('combobox',{name:getMessages(locale).to,exact:true});
  107 |   await destination.focus();await destination.press('ArrowDown');await destination.press('Enter');
  108 |   await expect(destination).toHaveValue('');
  109 |   await expect(destination).toHaveAttribute('placeholder',filterText(locale,'Dokądkolwiek'));
  110 |   await page.locator('.hero input[name="budget"]').fill('220');
  111 |   await page.getByRole('button',{name:filterText(locale,'Znajdź tani lot'),exact:true}).click();
  112 |   await expect(page).toHaveURL(new RegExp(`${prefix}/deals\\?origin=WRO&budget=220$`));
  113 |   const search=page.url();
  114 |   await page.locator('.deal-card-link').first().click();
  115 |   await expect(page.locator('.back-link')).toHaveAttribute('href',`${prefix}/deals?origin=WRO&budget=220`);
  116 |   await expect(page.locator('link[rel="canonical"]')).not.toHaveAttribute('href',/returnTo/);
  117 |   await page.locator('.back-link').click();await expect(page).toHaveURL(search);
  118 |  }
  119 | });
  120 | 
```