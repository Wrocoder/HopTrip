# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-workflow.spec.ts >> 375px >> pl: mobile discovery, planning and return context
- Location: tests\mobile-workflow.spec.ts:17:57

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Przejdź do treści" [ref=e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=e3]:
    - link "HopTrip — strona główna" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=e6]: .
    - navigation "Nawigacja główna" [ref=e7]:
      - link "Tanie loty" [ref=e8] [cursor=pointer]:
        - /url: /deals
      - link "Na weekend" [ref=e9] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Kierunki" [ref=e10] [cursor=pointer]:
        - /url: /#home-destinations
      - link "Zapisane" [ref=e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=e13]:
      - link "Polski" [ref=e14] [cursor=pointer]:
        - /url: /?origin=WRO
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru?origin=WRO
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en?origin=WRO
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk?origin=WRO
  - main [ref=e19]:
    - region [ref=e20]:
      - generic [ref=e21]:
        - heading "Tanie podróże zaczynają się tutaj." [level=1] [ref=e22]
        - paragraph [ref=e23]: Znajdź lot, sprawdź wydarzenia i zaplanuj wyjazd w jednym miejscu.
      - region "Wybór ofert" [ref=e24]:
        - form "Filtry ofert" [ref=e25]:
          - group [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: Skąd
              - combobox "Skąd" [ref=e29]: Wrocław — WRO
              - generic [ref=e30]: "Miasto lub kod IATA. Puste pole: dowolne."
            - generic [ref=e31]:
              - generic [ref=e32]: Dokąd
              - combobox "Dokąd" [ref=e33]: Barcelona
              - generic [ref=e34]: "Miasto lub kod IATA. Puste pole: dowolne."
            - group "Elastyczne daty wylotu" [ref=e35]:
              - generic [ref=e37]:
                - generic [ref=e38]:
                  - text: Wylot od
                  - textbox "Wylot od" [ref=e39]: 2026-12-01
                - generic [ref=e40]:
                  - text: Wylot do
                  - textbox "Wylot do" [ref=e41]: 2026-12-01
              - paragraph [ref=e42]: Wybierz przedział możliwego wylotu. Zostaw daty puste, aby szukać bez ograniczeń.
            - generic [ref=e43]:
              - text: Budżet na lot / osobę (PLN, opcjonalnie)
              - spinbutton "Budżet na lot / osobę (PLN, opcjonalnie)" [active] [ref=e44]: "500"
            - button "Znajdź tani lot" [ref=e45] [cursor=pointer]
          - group [ref=e46]:
            - 'generic "Więcej opcji: długość pobytu" [ref=e47] [cursor=pointer]'
    - region [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - paragraph [ref=e51]: "Wylot: WRO"
          - heading "Krótkie wyjazdy · 2–4 noce" [level=2] [ref=e52]
        - generic [ref=e53]: za osobę · PLN
      - paragraph [ref=e54]: W tej sekcji pomijamy loty z brakującymi lub sprzecznymi kluczowymi danymi trasy. Pełny katalog może zawierać takie loty z ostrzeżeniem.
      - button "Zmień lotnisko" [ref=e55] [cursor=pointer]
      - paragraph [ref=e56]: Lotnisko wybierasz w wyszukiwarce. Ten sam wybór stosujemy do propozycji poniżej i zapamiętujemy na tym urządzeniu.
      - article [ref=e58]:
        - generic [ref=e60]: W obie strony
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 – pt., 4 gru 2026 3 noce 213,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony Zobacz szczegóły lotu" [ref=e62] [cursor=pointer]':
          - /url: /deals/browser-13
          - paragraph [ref=e63]: Wrocław (WRO) →
          - heading [level=2] [ref=e64]:
            - text: Barcelona
            - img "Hiszpania" [ref=e65]
          - paragraph [ref=e66]: "Daty oferty: wt., 1 gru 2026 – pt., 4 gru 2026"
          - paragraph [ref=e67]: 3 noce
          - generic [ref=e68]:
            - paragraph [ref=e69]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e70]': ≈ 48 €
              - generic [ref=e71]: za osobę · w obie strony
            - generic [ref=e72]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e73]: →
        - paragraph [ref=e74]:
          - strong [ref=e75]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e76]:
          - paragraph [ref=e77]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e78]: 1.11.2026, 11:26
            - text: (czas w Polsce).
          - paragraph [ref=e79]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e80]:
          - note [ref=e81]:
            - strong [ref=e82]: Niepełne dane lotu
          - paragraph [ref=e83]:
            - strong [ref=e84]: Wylot
            - text: · WRO → BCN · Bez przesiadek
          - paragraph [ref=e85]:
            - strong [ref=e86]: Powrót
            - text: "· BCN → WRO · Liczba przesiadek: 1"
          - paragraph [ref=e87]: brak godziny
          - paragraph [ref=e88]: Przylot szacowany
        - paragraph [ref=e89]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e90]:
          - generic "Szczegóły lotu i ceny" [ref=e91] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e92] [cursor=pointer]':
          - /url: /deals/browser-13#score
          - generic [ref=e93]: Jak porównujemy cenę? ⓘ
      - paragraph [ref=e94]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
      - status [ref=e95]: "Liczba propozycji na 2–4 noce: 1."
      - paragraph [ref=e96]: Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.
      - paragraph [ref=e97]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione. Sprawdź godziny lotów i potrzebne dni urlopu.
      - paragraph [ref=e98]:
        - link "Zobacz wszystkie loty na 2–4 noce →" [ref=e99] [cursor=pointer]:
          - /url: /deals?origin=WRO&duration_min=2&duration_max=4
    - region [ref=e100]:
      - heading "Kolekcje na krótki wyjazd" [level=2] [ref=e101]
      - navigation "Pomysły na krótki wyjazd" [ref=e102]:
        - link "City break na 2–4 noce" [ref=e103] [cursor=pointer]:
          - /url: /city-break
        - link "Tanie loty na weekend" [ref=e104] [cursor=pointer]:
          - /url: /tanie-loty-na-weekend
        - link "Warszawa — oba lotniska" [ref=e105] [cursor=pointer]:
          - /url: /from/warszawa
      - paragraph [ref=e106]:
        - link "Zobacz loty ze wszystkich lotnisk →" [ref=e107] [cursor=pointer]:
          - /url: /deals
    - region [ref=e108]:
      - heading "Kierunki" [level=2] [ref=e109]
      - list [ref=e110]:
        - listitem [ref=e111]:
          - link "Barcelona" [ref=e112] [cursor=pointer]:
            - /url: /destinations/barcelona
            - img "Pawilony wejściowe Parku Güell z panoramą Barcelony" [ref=e114]
            - generic [ref=e115]: Barcelona →
          - group [ref=e116]:
            - 'generic "Zdjęcie: essetefano" [ref=e117] [cursor=pointer]'
        - listitem [ref=e118]:
          - link "Rzym" [ref=e119] [cursor=pointer]:
            - /url: /destinations/rome
            - img "Wnętrze Koloseum w Rzymie" [ref=e121]
            - generic [ref=e122]: Rzym →
          - group [ref=e123]:
            - 'generic "Zdjęcie: Sebastian Straub" [ref=e124] [cursor=pointer]'
      - link "Mediolan" [ref=e126] [cursor=pointer]:
        - /url: /destinations/milan
    - region [ref=e127]:
      - heading "Zaplanuj podróż" [level=2] [ref=e128]
      - paragraph [ref=e129]: "Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy."
      - generic [ref=e130]:
        - link "Policz budżet podróży" [ref=e131] [cursor=pointer]:
          - /url: /info/trip-budget#calculator
        - link "Zapisane wyjazdy" [ref=e132] [cursor=pointer]:
          - /url: /saved
    - region [ref=e133]:
      - heading "Jak działa HopTrip" [level=2] [ref=e134]
      - list [ref=e135]:
        - listitem [ref=e136]: Wyszukaj lot według lotniska, dat i budżetu.
        - listitem [ref=e137]: Porównaj oferty i sprawdź szczegóły wybranego lotu.
        - listitem [ref=e138]: Zaplanuj koszty podróży. Dostępność i warunki rezerwacji potwierdź u partnera.
    - region [ref=e139]:
      - heading "Poradniki i pomoc" [level=2] [ref=e140]
      - generic [ref=e141]:
        - link "Jak oceniamy ofertę" [ref=e142] [cursor=pointer]:
          - /url: /info/price-comparison
        - link "Świeżość ofert" [ref=e143] [cursor=pointer]:
          - /url: /info/price-freshness
        - link "Współpraca partnerska" [ref=e144] [cursor=pointer]:
          - /url: /info/partners
        - link "Wszystkie poradniki" [ref=e145] [cursor=pointer]:
          - /url: /info
    - group [ref=e146]:
      - generic "Lotniska wylotu" [ref=e147] [cursor=pointer]
  - contentinfo [ref=e148]:
    - generic [ref=e149]:
      - generic [ref=e150]: HopTrip.
      - paragraph [ref=e151]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e152]:
      - link "Jak działa HopTrip" [ref=e153] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e154] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e155] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e156] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e157] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e158] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e159] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e160] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e161] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e162] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e163] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e165] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e171] [cursor=pointer]
  - alert [ref=e175]
```

# Test source

```ts
  1  | import {test,expect,type Locator} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {writeFileSync} from 'node:fs';
  4  | import {localizedHref} from '../src/lib/i18n/routing';
  5  | import {savedTripsKey} from '../src/lib/shared-trip';
  6  | 
  7  | async function fit(control:Locator) {
  8  |  await control.scrollIntoViewIfNeeded();
  9  |  const r=await control.boundingBox();expect(r!.x).toBeGreaterThanOrEqual(-1);
  10 |  expect(r!.width).toBeGreaterThan(0);expect(r!.height).toBeGreaterThanOrEqual(44);
  11 |  expect(await control.evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1)).toBe(true);
> 12 |  expect(await control.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||!!hit&&el.contains(hit);})).toBe(true);
     |                                                                                                                                                                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  13 | }
  14 | 
  15 | for(const width of [320,375,390,768,1440])test.describe(`${width}px`,()=>{
  16 |  test.use({viewport:{width,height:844},hasTouch:width<1000,isMobile:width<1000,deviceScaleFactor:1});
  17 |  for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: mobile discovery, planning and return context`,async({page,request},info)=>{
  18 |   test.setTimeout(120000);
  19 |   await page.addInitScript(()=>{
  20 |    localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  21 |    Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('test-only clipboard fallback');}}});
  22 |   });
  23 |   const activate=async(control:Locator)=>width<1000?control.tap():control.click();
  24 |   const metrics:unknown[]=[];
  25 |   const overflow=async(state:string)=>{
  26 |    const size=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
  27 |    metrics.push({state,...size});expect(size.document).toBeLessThanOrEqual(size.viewport);
  28 |   };
  29 |   const dealResponse=await request.get('http://127.0.0.1:8125/api/v1/deals/browser-deal');expect(dealResponse.ok()).toBe(true);
  30 |   const deal=await dealResponse.json(),start=deal.trip_start as string;
  31 |   const endDate=new Date(`${start}T12:00:00Z`);endDate.setUTCDate(endDate.getUTCDate()+2);const end=endDate.toISOString().slice(0,10);
  32 |   await page.goto(localizedHref('/?origin=WRO',locale));
  33 |   for(const link of await page.locator('.site-nav a,.language-switcher a').all())await fit(link);
  34 |   const hero=page.locator('.hero-search'),origin=hero.locator('input[name="origin"]'),destination=hero.locator('input[name="destination"]');
  35 |   await origin.fill('WRO');await origin.press('ArrowDown');await origin.press('Enter');
  36 |   await destination.fill('Barcelona');await destination.press('ArrowDown');await destination.press('ArrowDown');await destination.press('Enter');
  37 |   await expect(destination).toHaveAttribute('data-destination-slug','barcelona');
  38 |   await hero.locator('input[name="departure_from"]').fill(start);await hero.locator('input[name="departure_to"]').fill(start);
  39 |   await hero.locator('input[name="budget"]').fill('500');
  40 |   for(const field of await hero.locator('input:not([type="hidden"])').all()){
  41 |    await fit(field);expect(await field.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  42 |   }
  43 |   await overflow('home');if(locale==='pl')await hero.screenshot({path:info.outputPath(`home-${width}.png`),scale:'css',animations:'disabled'});
  44 |   await activate(hero.locator('button[type="submit"]'));
  45 |   await expect(page).toHaveURL(/\/deals\?/);await expect(page.locator('.sort-control select')).toBeEnabled();
  46 |   const selected={origin:'WRO',destination:'barcelona',departure_from:start,departure_to:start,budget:'500'};
  47 |   for(const [key,value] of Object.entries(selected))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
  48 |   const sort=page.locator('.sort-control select');await sort.selectOption('price');await expect(page).toHaveURL(/sort=price/);
  49 |   const applied=new URL(page.url());
  50 |   for(const field of await page.locator('.filters input:not([type="hidden"]),.filters select').all())if(await field.isVisible())await fit(field);
  51 |   await overflow('catalog');
  52 |   const card=page.locator('.deal-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-deal?',locale)}"]`)});
  53 |   await expect(card).toHaveCount(1);const trigger=card.locator('.score-trigger');await trigger.focus();await page.keyboard.press('Enter');
  54 |   const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
  55 |   await fit(dialog.locator('.score-close'));const box=await dialog.boundingBox();expect(box!.height).toBeLessThanOrEqual(844);expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);
  56 |   await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await activate(card.locator('.deal-card-link'));
  57 |   await expect(page.locator('#budget-start')).toBeEnabled();await fit(page.locator('.back-link'));await overflow('detail');
  58 |   for(const id of ['trip-booking','accommodation','trip-events','calculator']){
  59 |    const link=page.locator(`.trip-navigation a[href="#${id}"]`);await link.focus();await page.keyboard.press('Enter');await expect(page.locator('#'+id)).toBeFocused();
  60 |   }
  61 |   await fit(page.locator('#trip-booking .cta'));const sellerHref=await page.locator('#trip-booking .cta').getAttribute('href');
  62 |   await page.locator('#stay-checkin').fill(start);await page.locator('#stay-checkout').fill(end);
  63 |   await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('123,45');
  64 |   await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('400');
  65 |   await page.locator('#budget-food').fill('0');await page.locator('#budget-transfers').fill('0');
  66 |   await expect(page.getByTestId('budget-total')).toContainText(/646[,.]90/);
  67 |   await expect(page.locator('#budget-end')).toHaveValue(end);await expect(page.locator('#budget-nights')).toHaveValue('2');
  68 |   await expect(page.locator('#trip-events input[type="date"]').nth(1)).toHaveValue(end);
  69 |   await expect(page.locator('#trip-booking .cta')).toHaveAttribute('href',sellerHref!);
  70 |   // A shorter viewport checks occlusion/reachability; this does not summon an OS keyboard.
  71 |   await page.setViewportSize({width,height:400});
  72 |   for(const field of [page.locator('#stay-checkout'),page.locator('#budget-hotel-basis'),page.locator('#budget-flight')]){
  73 |    const value=await field.inputValue();await field.focus();await fit(field);await field.press('Escape');await expect(field).toHaveValue(value);
  74 |   }
  75 |   await expect(page.locator('#budget-flight')).toHaveAttribute('inputmode','decimal');await overflow('short-viewport');
  76 |   await page.setViewportSize({width,height:844});
  77 |   const actions=page.locator('#trip-save .trip-actions button');await activate(actions.nth(0));
  78 |   await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'[]').length,savedTripsKey)).toBe(1);
  79 |   await activate(actions.nth(1));const shared=page.locator('#trip-share-link');await expect(shared).toHaveValue(/\/trip\?plan=/);await fit(shared);
  80 |   if(width===320||width===1440)expect((await new AxeBuilder({page}).include('.site-header').include('#calculator').include('#accommodation').include('#trip-events').analyze()).violations).toEqual([]);
  81 |   if(locale==='pl')await page.locator('#calculator').screenshot({path:info.outputPath(`calculator-${width}.png`),scale:'css',animations:'disabled'});
  82 |   await page.reload();await expect(page.locator('#budget-flight')).toHaveValue('123,45');await expect(page.getByTestId('budget-total')).toContainText(/646[,.]90/);
  83 |   await activate(page.locator('.back-link'));await expect(page).toHaveURL(applied.href);
  84 |   for(const [key,value] of Object.entries(selected))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
  85 |   await page.goBack();await expect(page.locator('#budget-flight')).toHaveValue('123,45');await expect(page.locator('#budget-end')).toHaveValue(end);
  86 |   await page.goForward();await expect(page).toHaveURL(applied.href);await overflow('return');
  87 |   writeFileSync(info.outputPath(`workflow-${locale}-${width}.json`),JSON.stringify(metrics,null,2));
  88 |  });
  89 | });
  90 | 
```