# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog.spec.ts >> airport to deal to partner keeps one session and records click
- Location: tests\catalog.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Wrocław — WRO', exact: true })

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
        - /url: /
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk
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
              - combobox "Skąd" [ref=e29]
              - generic [ref=e30]: "Miasto lub kod IATA. Puste pole: dowolne."
            - generic [ref=e31]:
              - generic [ref=e32]: Dokąd
              - combobox "Dokąd" [ref=e33]
              - generic [ref=e34]: "Miasto lub kod IATA. Puste pole: dowolne."
            - group "Elastyczne daty wylotu" [ref=e35]:
              - generic [ref=e37]:
                - generic [ref=e38]:
                  - text: Wylot od
                  - textbox "Wylot od" [ref=e39]
                - generic [ref=e40]:
                  - text: Wylot do
                  - textbox "Wylot do" [ref=e41]
              - paragraph [ref=e42]: Wybierz przedział możliwego wylotu. Zostaw daty puste, aby szukać bez ograniczeń.
            - generic [ref=e43]:
              - text: Budżet na lot / osobę (PLN, opcjonalnie)
              - spinbutton "Budżet na lot / osobę (PLN, opcjonalnie)" [ref=e44]
            - button "Znajdź tani lot" [ref=e45] [cursor=pointer]
          - group [ref=e46]:
            - 'generic "Więcej opcji: długość pobytu" [ref=e47] [cursor=pointer]'
    - region [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - paragraph [ref=e51]: "Wylot: dowolne lotnisko"
          - heading "Krótkie wyjazdy · 2–4 noce" [level=2] [ref=e52]
        - generic [ref=e53]: za osobę · PLN
      - paragraph [ref=e54]: W tej sekcji pomijamy loty z brakującymi lub sprzecznymi kluczowymi danymi trasy. Pełny katalog może zawierać takie loty z ostrzeżeniem.
      - button "Zmień lotnisko" [ref=e55] [cursor=pointer]
      - paragraph [ref=e56]: Lotnisko wybierasz w wyszukiwarce. Ten sam wybór stosujemy do propozycji poniżej i zapamiętujemy na tym urządzeniu.
      - article [ref=e58]:
        - generic [ref=e60]: W obie strony
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026 3 noce 213,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony Zobacz szczegóły lotu" [ref=e62] [cursor=pointer]':
          - /url: /deals/browser-13
          - paragraph [ref=e63]: Wrocław (WRO) →
          - heading [level=2] [ref=e64]:
            - text: Barcelona
            - img "Hiszpania" [ref=e65]
          - paragraph [ref=e66]: "Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026"
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
            - time [ref=e78]: 31.10.2026, 16:40
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
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e92] [cursor=pointer]':
          - /url: /deals/browser-13#score
          - generic [ref=e93]: Jak porównujemy cenę? ⓘ
      - paragraph [ref=e94]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
      - status [ref=e95]: "Liczba propozycji na 2–4 noce: 1."
      - paragraph [ref=e96]: Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.
      - paragraph [ref=e97]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione. Sprawdź godziny lotów i potrzebne dni urlopu.
      - paragraph [ref=e98]:
        - link "Zobacz wszystkie loty na 2–4 noce →" [ref=e99] [cursor=pointer]:
          - /url: /deals?origin=&duration_min=2&duration_max=4
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
      - generic [ref=e110]:
        - link "Barcelona" [ref=e111] [cursor=pointer]:
          - /url: /destinations/barcelona
        - link "Mediolan" [ref=e112] [cursor=pointer]:
          - /url: /destinations/milan
        - link "Rzym" [ref=e113] [cursor=pointer]:
          - /url: /destinations/rome
    - region [ref=e114]:
      - heading "Zaplanuj podróż" [level=2] [ref=e115]
      - paragraph [ref=e116]: "Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy."
      - generic [ref=e117]:
        - link "Policz budżet podróży" [ref=e118] [cursor=pointer]:
          - /url: /info/trip-budget#calculator
        - link "Zapisane wyjazdy" [ref=e119] [cursor=pointer]:
          - /url: /saved
    - region [ref=e120]:
      - heading "Jak działa HopTrip" [level=2] [ref=e121]
      - list [ref=e122]:
        - listitem [ref=e123]: Wyszukaj lot według lotniska, dat i budżetu.
        - listitem [ref=e124]: Porównaj oferty i sprawdź szczegóły wybranego lotu.
        - listitem [ref=e125]: Zaplanuj koszty podróży. Dostępność i warunki rezerwacji potwierdź u partnera.
    - region [ref=e126]:
      - heading "Poradniki i pomoc" [level=2] [ref=e127]
      - generic [ref=e128]:
        - link "Jak oceniamy ofertę" [ref=e129] [cursor=pointer]:
          - /url: /info/price-comparison
        - link "Świeżość ofert" [ref=e130] [cursor=pointer]:
          - /url: /info/price-freshness
        - link "Współpraca partnerska" [ref=e131] [cursor=pointer]:
          - /url: /info/partners
        - link "Wszystkie poradniki" [ref=e132] [cursor=pointer]:
          - /url: /info
    - group [ref=e133]:
      - generic "Lotniska wylotu" [ref=e134] [cursor=pointer]
  - contentinfo [ref=e135]:
    - generic [ref=e136]:
      - generic [ref=e137]: HopTrip.
      - paragraph [ref=e138]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e139]:
      - link "Jak działa HopTrip" [ref=e140] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e141] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e142] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e143] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e144] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e145] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e146] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e147] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e148] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e149] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e150] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [active] [ref=e152] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e158] [cursor=pointer]
  - alert [ref=e162]
```

# Test source

```ts
  1   | import {test,expect} from "@playwright/test";
  2   | 
  3   | test("airport to deal to partner keeps one session and records click",async({page,request})=>{
  4   |  let trackingId:string|null=null;
  5   |  // Redirect hops cannot reliably be routed in Chromium. Check the real API
  6   |  // response, then change only its destination to the local fixture server.
  7   |  await page.route("http://127.0.0.1:8125/go/**",async route=>{
  8   |   const response=await route.fetch({maxRedirects:0});
  9   |   expect(response.status()).toBe(307);
  10  |   const destination=new URL(response.headers().location);
  11  |   expect(destination.origin).toBe("https://partner.example");
  12  |   expect(destination.pathname).toBe("/book");
  13  |   expect(destination.searchParams.get("foo")).toBe("bar");
  14  |   trackingId=destination.searchParams.get("sub_id");
  15  |   expect(trackingId).toMatch(/^ht-[0-9a-f]{32}$/);
  16  |   await route.fulfill({response,headers:{...response.headers(),
  17  |    location:`http://127.0.0.1:8125/__test__/partner${destination.search}`}});
  18  |  });
  19  |  await page.goto("/");
  20  |  await page.getByRole("button",{name:"Akceptuj wszystkie",exact:true}).click();
> 21  |  await page.getByRole("link",{name:"Wrocław — WRO",exact:true}).click();
      |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  22  |  await expect(page.locator(".deal-card")).toHaveCount(14);
  23  |  await page.locator('a.deal-card-link[href="/deals/browser-deal"],a.deal-card-link[href^="/deals/browser-deal?"]').click();
  24  |  await expect(page.getByRole("heading",{level:1})).toContainText("Barcelona");
  25  |  await expect(page.getByText("200,25",{exact:false}).first()).toBeVisible();
  26  |  const sid=await page.evaluate(()=>JSON.parse(localStorage.getItem("hoptrip.session.v2")!).id);
  27  |  await page.getByRole("link",{name:"Sprawdź lot — Fixture program"}).focus();
  28  |  await page.keyboard.press("Enter");
  29  |  await expect(page).toHaveURL(/127\.0\.0\.1:8125\/__test__\/partner\?/);
  30  |  await expect(page.getByText("Local partner fixture")).toBeVisible();
  31  |  expect(new URL(page.url()).searchParams.get("sub_id")).toBe(trackingId);
  32  |  const data=await (await request.get("http://127.0.0.1:8125/__test__/tracking")).json();
  33  |  expect(data.clicks.filter((c:{session:string;program:number;tracking_id:string})=>
  34  |   c.session===sid && c.program>0 && c.tracking_id===trackingId)).toHaveLength(1);
  35  |  expect(data.events.some((e:{session:string;name:string})=>e.session===sid && e.name==="DEAL_VIEW")).toBeTruthy();
  36  | });
  37  | 
  38  | test("combined filters, pagination, empty and invalid states",async({page})=>{
  39  |  await page.goto("/deals?origin=WRO&budget=220&duration_min=3&duration_max=3");
  40  |  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  41  |  await expect(page.locator(".deal-card")).toHaveCount(12);
  42  |  await page.getByRole("link",{name:"Następna strona"}).click();
  43  |  await expect(page).toHaveURL(/budget=220/);
  44  |  await expect(page.locator(".deal-card")).toHaveCount(2);
  45  |  await page.goto("/deals?budget=1");
  46  |  await expect(page.getByText("Brak aktualnych ofert", {exact:false})).toBeVisible();
  47  |  await page.goto("/deals?duration_min=5&duration_max=2");
  48  |  await expect(page.getByRole("alert").first()).toContainText("Sprawdź");
  49  | });
  50  | 
  51  | test("no link, expired and unknown route",async({page})=>{
  52  |  await page.goto("/deals/browser-1");
  53  |  await expect(page.getByText("Link do rezerwacji nie jest jeszcze dostępny.")).toBeVisible();
  54  |  await expect(page.getByRole("link",{name:"Sprawdź lot — Fixture program"})).toHaveCount(0);
  55  |  for(const path of ["/deals/browser-14","/from/ZZZ","/destinations/unknown"]) {
  56  |    await page.goto(path);
  57  |    await expect(page.getByRole("heading",{level:1})).toContainText("Nie znaleziono");
  58  |  }
  59  | });
  60  | 
  61  | test("storage failure does not break UI and session rotates after inactivity",async({page})=>{
  62  |  await page.goto("/deals/browser-deal");
  63  |  await page.getByRole("button",{name:"Akceptuj wszystkie",exact:true}).click();
  64  |  await expect.poll(()=>page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).not.toBeNull();
  65  |  const old=await page.evaluate(()=>{
  66  |    const value=JSON.parse(localStorage.getItem("hoptrip.session.v2")!);
  67  |    value.touched=Date.now()-31*60*1000;
  68  |    localStorage.setItem("hoptrip.session.v2",JSON.stringify(value));return value.id;
  69  |  });
  70  |  await page.reload();
  71  |  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("hoptrip.session.v2")!).id)).not.toBe(old);
  72  |  await page.addInitScript(()=>{Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked");}});});
  73  |  await page.reload();
  74  |  await expect(page.getByRole("link",{name:"Sprawdź lot — Fixture program"})).toBeVisible();
  75  | });
  76  | 
  77  | test("canonical, sitemap and draft noindex",async({page,request})=>{
  78  |  await page.goto("/info/privacy");
  79  |  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  80  |  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  81  |  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","http://127.0.0.1:3125/info/privacy");
  82  |  const sitemap=await (await request.get("/sitemap.xml")).text();
  83  |  expect(sitemap).not.toContain("/privacy");
  84  |  expect(sitemap).not.toContain("/deals?");
  85  |  expect(sitemap).toContain("/info/about");
  86  |  for(const slug of ["price-comparison","price-freshness","price-history","trip-budget","one-way-round-trip"]) {
  87  |   expect(sitemap).toContain(`/info/${slug}`);
  88  |  }
  89  |  await page.goto("/info");
  90  |  await page.getByRole("link",{name:"Jak porównujemy ceny lotów",exact:false}).click();
  91  |  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","http://127.0.0.1:3125/info/price-comparison");
  92  |  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content","Jak porównujemy ceny lotów");
  93  |  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
  94  |  await expect(page.getByRole("heading",{name:"Jak rozumieć procent poniżej mediany"})).toBeVisible();
  95  |  await page.getByRole("link",{name:"Co oznacza świeżość oferty",exact:true}).click();
  96  |  await expect(page.getByRole("heading",{level:1})).toHaveText("Co oznacza świeżość oferty");
  97  |  await page.getByRole("link",{name:"Co mówi, a czego nie mówi historia cen",exact:true}).click();
  98  |  await expect(page.getByRole("heading",{level:1})).toHaveText("Co mówi, a czego nie mówi historia cen");
  99  |  await page.goto("/info/trip-budget");
  100 |  await expect(page.getByRole("heading",{name:"Nie zamieniaj brakującej ceny w zero"})).toBeVisible();
  101 |  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","http://127.0.0.1:3125/info/trip-budget");
  102 |  await page.getByRole("link",{name:"Lot w jedną stronę czy w obie strony",exact:true}).click();
  103 |  await expect(page.getByRole("heading",{level:1})).toHaveText("Lot w jedną stronę czy w obie strony");
  104 |  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
  105 | });
  106 | 
  107 | test("unknown information slugs including object properties show not found",async({page})=>{
  108 |  for(const slug of ["missing-page","constructor","toString","__proto__"]) {
  109 |   await page.goto(`/info/${slug}`);
  110 |   await expect(page.getByRole("heading",{level:1})).toContainText("Nie znaleziono");
  111 |   await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content",/noindex/);
  112 |  }
  113 | });
  114 | 
```