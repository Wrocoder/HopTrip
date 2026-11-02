# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui04-focus-before.spec.ts >> UI-04 removal keyboard focus before fix
- Location: tests\ui04-focus-before.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  locator('#calculator')
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" locator('#calculator') with timeout 5000ms
  - waiting for locator('#calculator')
    14 × locator resolved to <section tabindex="-1" id="calculator" aria-labelledby="budget-heading" class="trip-budget-calculator-module__AmH3vG__calculator">…</section>
       - unexpected value "inactive"

```

```yaml
- region "Kalkulator budżetu podróży":
  - heading "Kalkulator budżetu podróży" [level=2]
  - paragraph: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
  - paragraph: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
  - group "Tryb kalkulatora"
  - paragraph: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
  - group: Jak liczymy koszty?
  - paragraph: Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.
  - group "Twój plan podróży"
  - status
  - group: Rozbicie kosztów całej grupy
  - paragraph: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
  - button "Wyczyść kalkulator"
  - region "Zapisz i udostępnij wyjazd"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {writeFileSync} from 'node:fs';
  3  | test('UI-04 removal keyboard focus before fix',async({page},info)=>{
  4  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  5  |  await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[{
  6  |   id:'focus-fixture',name:'Test-only focus event',venue:'Fixture venue',city:'Barcelona',category:'MUSIC',
  7  |   start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
  8  |   url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Ffocus',price_from:null,currency:null,
  9  |  }]}}));
  10 |  await page.goto('/deals/browser-deal');await expect(page.locator('#budget-flight')).toBeEnabled();
  11 |  const start=await page.locator('#budget-start').inputValue(),end=new Date(start+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+2);
  12 |  await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
  13 |  await page.locator('#trip-events button[aria-label$=": Test-only focus event"]').click();
  14 |  const remove=page.locator('#planned-events button');await remove.focus();await page.keyboard.press('Enter');
  15 |  await expect(page.locator('#planned-events')).toHaveCount(0);
  16 |  const after=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id,body:document.activeElement===document.body}));
  17 |  writeFileSync(info.outputPath('remove-focus-before.json'),JSON.stringify(after,null,2));
> 18 |  await expect(page.locator('#calculator')).toBeFocused();
     |                                            ^ Error: expect(locator).toBeFocused() failed
  19 | });
  20 | 
```