# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compact-cards.spec.ts >> compact cards preserve clocks, missing facts, keyboard access and long names
- Location: tests\compact-cards.spec.ts:12:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.boundingBox: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.deal-card').first().locator('.deal-price')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - /url: /deals
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals
  - main [ref=e19]:
    - generic [ref=e20]:
      - paragraph [ref=e21]: Loty z Polski
      - heading "Aktualne okazje" [level=1] [ref=e22]
      - paragraph [ref=e23]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione.
    - region "Wybór ofert" [ref=e24]:
      - form "Filtry ofert" [ref=e25]:
        - group [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: Skąd
            - combobox "Skąd" [ref=e29]
            - generic [ref=e30]: Podpowiedzi są niedostępne. Wpisz kod lotniska, np. WRO.
          - generic [ref=e31]:
            - generic [ref=e32]: Dokąd
            - combobox "Dokąd" [ref=e33]
            - generic [ref=e34]: Podpowiedzi są niedostępne. Wpisz nazwę lub identyfikator kierunku, np. milan.
          - generic [ref=e35]:
            - text: Budżet na lot / osobę (PLN)
            - spinbutton "Budżet na lot / osobę (PLN)" [ref=e36]
          - button "Filtruj" [ref=e37] [cursor=pointer]
        - group [ref=e38]:
          - generic "Daty i długość pobytu −" [ref=e39] [cursor=pointer]
          - paragraph [ref=e40]: "Zakres dat wylotu, nie powrotu. Długość pobytu w nocach. Puste pole: bez ograniczenia."
          - generic [ref=e41]:
            - generic [ref=e42]:
              - text: Wylot od
              - textbox "Wylot od" [ref=e43]
            - generic [ref=e44]:
              - text: Wylot do
              - textbox "Wylot do" [ref=e45]
            - generic [ref=e46]:
              - text: Pobyt od (nocy)
              - spinbutton "Pobyt od (nocy)" [ref=e47]
            - generic [ref=e48]:
              - text: Pobyt do (nocy)
              - spinbutton "Pobyt do (nocy)" [ref=e49]
        - generic [ref=e50]:
          - text: Sortuj oferty
          - combobox "Sortuj oferty Zmiana sortowania stosuje też wpisane filtry." [ref=e51]:
            - option "Ocena oferty — najwyższa" [selected]
            - option "Cena — najniższa"
            - option "Wylot — najbliższy"
          - generic [ref=e52]: Zmiana sortowania stosuje też wpisane filtry.
        - group "Szybkie filtry" [ref=e53]:
          - button "Na weekend" [ref=e55] [cursor=pointer]
          - button "2–3 noce" [ref=e57] [cursor=pointer]
          - button "Loty do 300 zł" [ref=e59] [cursor=pointer]
        - paragraph [ref=e60]: Skróty zastępują własne pola i od razu stosują formularz. Ponowne kliknięcie usuwa te warunki.
        - group [ref=e61]:
          - generic "Jak działają filtry" [ref=e62] [cursor=pointer]
      - generic [ref=e63]:
        - paragraph [ref=e64]: Zastosowane filtry (0)
        - paragraph [ref=e65]: Brak dodatkowych filtrów.
    - alert [ref=e66]:
      - heading "Nie udało się pobrać ofert" [level=2] [ref=e67]
      - paragraph [ref=e68]: Nie udało się pobrać ofert. Spróbuj ponownie za chwilę.
      - generic [ref=e69]:
        - link "Spróbuj ponownie" [ref=e70] [cursor=pointer]:
          - /url: /deals
        - link "Wyczyść parametry wyszukiwania" [ref=e71] [cursor=pointer]:
          - /url: /deals
    - paragraph [ref=e72]:
      - link "Zapisane wyjazdy" [ref=e73] [cursor=pointer]:
        - /url: /saved
    - region "Jak wybrać okazję lotniczą" [ref=e74]:
      - heading "Jak wybrać okazję lotniczą" [level=2] [ref=e75]
      - paragraph [ref=e76]: Zacznij od lotniska, z którego wygodnie dojedziesz na wylot. Następnie ustaw budżet na lot na osobę i opcjonalny zakres dat. Długość pobytu filtrujemy w nocach.
      - generic [ref=e77]:
        - heading "Porównuj ten sam zakres podróży" [level=3] [ref=e78]
        - paragraph [ref=e79]: Lot w jedną stronę i lot w obie strony mają różny zakres. Otwórz ofertę i sprawdź oznaczenie trasy, daty oraz potrzebny bagaż. Cena w katalogu nie obejmuje automatycznie noclegu ani dojazdów.
      - generic [ref=e80]:
        - heading "Cena ma datę obserwacji" [level=3] [ref=e81]
        - paragraph [ref=e82]: Oferty pochodzą z zapisanych obserwacji, a nie z rezerwacji w czasie rzeczywistym. W szczegółach znajdziesz datę sprawdzenia i wyjaśnienie oceny. Dostępność oraz końcową cenę potwierdź po przejściu do sprzedawcy.
      - navigation "Zaplanuj podróż" [ref=e83]:
        - link "Loty z Wrocławia" [ref=e84] [cursor=pointer]:
          - /url: /from/WRO
        - link "Loty do Mediolanu" [ref=e85] [cursor=pointer]:
          - /url: /destinations/milan
        - link "Policz budżet całej podróży" [ref=e86] [cursor=pointer]:
          - /url: /info/trip-budget
  - contentinfo [ref=e87]:
    - generic [ref=e88]:
      - generic [ref=e89]: HopTrip.
      - paragraph [ref=e90]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e91]:
      - link "Jak działa HopTrip" [ref=e92] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e93] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e94] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e95] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e96] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e97] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e98] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e99] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e100] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e101] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e102] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e104] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e110] [cursor=pointer]
  - alert [ref=e114]
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | 
  4  | test.beforeEach(async({page,request})=>{
  5  |  await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=normal");
  6  |  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  7  | });
  8  | test.afterEach(async({request})=>{
  9  |  await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=normal");
  10 | });
  11 | 
  12 | test("compact cards preserve clocks, missing facts, keyboard access and long names",async({page},testInfo)=>{
  13 |  await page.setViewportSize(testInfo.project.name==="desktop" ? {width:1366,height:900} : {width:390,height:844});
  14 |  await page.goto("/deals");
  15 |  await page.evaluate(()=>document.fonts.ready);
  16 |  const first=page.locator(".deal-card").first();
  17 |  if(testInfo.project.name==="desktop") {
> 18 |   const price=await first.locator(".deal-price").boundingBox();
     |                                                  ^ Error: locator.boundingBox: Test timeout of 30000ms exceeded.
  19 |   expect(price!.y+price!.height).toBeLessThan(900);
  20 |  }
  21 |  await expect(first.locator(".flight-schedule-compact")).toContainText("brak godziny");
  22 |  await expect(first.locator(".flight-schedule-compact")).not.toContainText("Powrót");
  23 |  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-13"]')});
  24 |  // DEAL-01 keeps route warnings outside; full known clocks/zones are in details.
  25 |  await expect(card.locator(".flight-schedule-compact")).toContainText("Przylot szacowany");
  26 |  await expect(card.locator(".flight-schedule-compact")).not.toContainText(/Europe\/|GMT/);
  27 |  // Two stop summaries now belong to the collapsed card, one for each direction.
  28 |  await expect(card.locator(".flight-stops")).toHaveCount(2);
  29 |  if(testInfo.project.name==="desktop") {
  30 |   // Observation and availability are now always visible; the existing card stays compact.
  31 |   const freshness=await card.locator('.price-freshness').boundingBox();
  32 |   expect(freshness!.height).toBeLessThan(130);
  33 |   expect((await card.boundingBox())!.height).toBeLessThan(730);
  34 |  }
  35 |  await page.screenshot({path:testInfo.outputPath("catalog.png")});
  36 |  await card.screenshot({path:testInfo.outputPath("card.png")});
  37 |  await card.locator(".trip-details > summary").focus();
  38 |  await page.keyboard.press("Enter");
  39 |  await expect(card.locator(".flight-facts")).toBeVisible();
  40 |  await expect(card.locator(".flight-facts")).toContainText("Europe/Warsaw");
  41 |  expect((await new AxeBuilder({page}).include(".deal-grid").analyze()).violations).toEqual([]);
  42 |  await page.keyboard.press("Enter");
  43 |  // Synthetic long content tests wrapping, not a new production destination.
  44 |  await card.locator(".deal-card-link h2").evaluate(el=>{el.textContent="Bardzo długa nazwa kierunku podróży — Santiago de Compostela";});
  45 |  await page.setViewportSize({width:320,height:812});
  46 |  await page.addStyleTag({content:".deal-card {font-size:200%} .deal-card h2 {font-size:2em}"});
  47 |  expect(await card.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  48 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  49 |  await card.screenshot({path:testInfo.outputPath("long-name.png")});
  50 | });
  51 | 
  52 | test("next-day home arrival is visible without expanding details",async({page,request},testInfo)=>{
  53 |  await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=midnight");
  54 |  await page.goto("/deals");
  55 |  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-13"]')});
  56 |  await expect(card.locator(".home-arrival")).toBeVisible();
  57 |  await expect(card.locator(".home-arrival")).toContainText("+1 dzień");
  58 |  await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
  59 |  await expect(card.locator(".flight-schedule-compact")).toContainText("Przylot szacowany");
  60 |  await card.screenshot({path:testInfo.outputPath("midnight.png")});
  61 | });
  62 | 
```