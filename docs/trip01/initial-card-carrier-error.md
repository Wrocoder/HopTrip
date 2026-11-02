# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flight-facts.spec.ts >> round trip facts agree between card and detail without mobile overflow
- Location: tests\flight-facts.spec.ts:52:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.deal-card').filter({ has: locator('a[href="/deals/browser-13"]') }).locator('.flight-schedule')
Expected substring: "Ryanair (FR)"
Received string:    "Niepełne dane lotuWylot · WRO → BCNBez przesiadekPowrót · BCN → WROLiczba przesiadek: 1brak godzinyPrzylot szacowany"
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('.deal-card').filter({ has: locator('a[href="/deals/browser-13"]') }).locator('.flight-schedule') with timeout 5000ms
  - waiting for locator('.deal-card').filter({ has: locator('a[href="/deals/browser-13"]') }).locator('.flight-schedule')
    14 × locator resolved to <div class="flight-schedule flight-schedule-compact">…</div>
       - unexpected value "Niepełne dane lotuWylot · WRO → BCNBez przesiadekPowrót · BCN → WROLiczba przesiadek: 1brak godzinyPrzylot szacowany"

```

```yaml
- note:
  - strong: Niepełne dane lotu
- paragraph:
  - strong: Wylot
  - text: · WRO → BCN · Bez przesiadek
- paragraph:
  - strong: Powrót
  - text: "· BCN → WRO · Liczba przesiadek: 1"
- paragraph: brak godziny
- paragraph: Przylot szacowany
```

# Test source

```ts
  1   | import {test,expect} from "@playwright/test";
  2   | 
  3   | test('structured return shows the actual airports, clocks and connecting flights',async({page,request})=>{
  4   |  await request.post('http://127.0.0.1:8125/__test__/compact-card?scenario=structured-return');
  5   |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  6   |  try{
  7   |   await page.goto('/deals/browser-13');
  8   |   const summary=page.locator('.detail-summary'),schedule=summary.locator('.flight-schedule-compact');
  9   |   await expect(schedule.locator('.outbound-leg')).toContainText(/WRO .*→ STN/);
  10  |   await expect(schedule.locator('.return-leg')).toContainText(/LTN .*→ WRO/);
  11  |   await expect(schedule.locator('.return-leg')).not.toContainText('szac.');
  12  |   await expect(schedule.locator('.flight-route-warning')).toContainText('Powrót z innego lotniska: LTN (przylot: STN)');
  13  |   await expect(schedule.locator('.schedule-airline')).toContainText('FR 8406');
  14  |   await expect(schedule.locator('.schedule-airline')).toContainText('W6 1234');
  15  |   await expect(schedule.locator('.schedule-airline')).toContainText('LO 999');
  16  |   await summary.locator('.trip-details > summary').click();
  17  |   await expect(summary.locator('.flight-connections')).toContainText('LTN → BER');
  18  |   await expect(summary.locator('.flight-connections')).toContainText('BER → WRO');
  19  |   const body=await(await request.get('http://127.0.0.1:8125/api/v1/deals/browser-13')).json();
  20  |   expect(body.flight_facts.return_legs).toHaveLength(2);
  21  |   expect((Date.parse(body.flight_facts.return_arrival)-Date.parse(body.flight_facts.return_departure))/60000).toBe(180);
  22  |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  23  |  }finally{await request.post('http://127.0.0.1:8125/__test__/compact-card?scenario=normal');}
  24  | });
  25  | 
  26  | test("unknown flight details remain explicit before the partner click",async({page})=>{
  27  |   await page.goto("/deals");
  28  |   await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  29  |   const card=page.locator(".deal-card").first();
  30  |   const flag=card.locator("h2 .country-flag");
  31  |   await expect(flag).toHaveAttribute("title","Hiszpania");
  32  |   await expect(flag).toBeVisible();
  33  |   await expect.poll(()=>flag.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBeGreaterThan(0);
  34  |   await expect(card.locator(".flight-facts")).not.toBeVisible();
  35  |   await expect(card.locator(".flight-schedule-compact .flight-stops")).toBeVisible();
  36  |   await expect(card.locator(".flight-schedule-compact .flight-stops")).toContainText("Przesiadki do sprawdzenia u partnera");
  37  |   await expect(card.locator(".flight-schedule-compact .outbound-leg")).toContainText("lotnisko do sprawdzenia → lotnisko do sprawdzenia");
  38  |   await card.locator(".trip-details > summary").click();
  39  |   await expect(card.locator(".flight-facts")).toBeVisible();
  40  |   await expect(card.locator(".deal-price")).toContainText("za osobę · w jedną stronę");
  41  |   await expect(card.locator(".flight-facts")).toContainText("Lotnisko wylotu: do sprawdzenia u partnera");
  42  |   await expect(card.locator(".flight-facts")).toContainText("Brak danych o godzinie");
  43  |   await card.locator(".deal-card-link").focus();
  44  |   await page.keyboard.press("Enter");
  45  |   await expect(page.locator("h1 .country-flag")).toHaveAttribute("title","Hiszpania");
  46  |   await page.locator(".detail-summary .trip-details > summary").click();
  47  |   await expect(page.locator(".detail-summary .flight-facts")).toContainText("Bagaż do sprawdzenia u partnera");
  48  |   await expect(page.locator(".detail-summary .flight-facts")).toContainText("Przewoźnik do sprawdzenia u partnera");
  49  |   await expect(page.locator(".booking-price")).toContainText("za osobę · w jedną stronę");
  50  | });
  51  | 
  52  | test("round trip facts agree between card and detail without mobile overflow",async({page},testInfo)=>{
  53  |   await page.goto("/deals");
  54  |   await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  55  |   const card=page.locator(".deal-card").filter({has:page.locator('a[href="/deals/browser-13"]')});
  56  |   await expect(card.locator(".flight-schedule-compact")).toBeVisible();
  57  |   await expect(card.locator(".flight-schedule-compact")).not.toContainText("Europe/Warsaw");
> 58  |   await expect(card.locator(".flight-schedule")).toContainText("Ryanair (FR)");
      |                                                  ^ Error: expect(locator).toContainText(expected) failed
  59  |   await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
  60  |   await expect(card.locator(".outbound-leg .flight-stops")).toHaveText("Bez przesiadek");
  61  |   await expect(card.locator(".return-leg .flight-stops")).toHaveText("Liczba przesiadek: 1");
  62  |   await card.locator(".trip-details > summary").click();
  63  |   await expect(card.locator(".deal-price")).toContainText("za osobę · w obie strony");
  64  |   await expect(card.locator(".flight-facts")).toContainText("Ryanair (FR)");
  65  |   await expect(card.locator(".flight-facts")).toContainText("70 godz. 0 min");
  66  |   await card.screenshot({path:testInfo.outputPath("flight-card.png")});
  67  |   await card.locator(".deal-card-link").click();
  68  |   const facts=page.locator(".detail-summary .flight-facts");
  69  |   await page.locator(".detail-summary .trip-details > summary").click();
  70  |   await expect(facts).toContainText("Lotnisko docelowe: BCN");
  71  |   await expect(facts).toContainText("Godziny lokalne");
  72  |   await expect(facts).toContainText("obliczony z czasu lotu");
  73  |   await expect(page.locator(".detail-summary")).toContainText("za osobę · w obie strony");
  74  |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  75  |   const summaryBox=await page.locator(".detail-summary").boundingBox();
  76  |   const bookingBox=await page.locator(".booking-card").boundingBox();
  77  |   if (testInfo.project.name==="mobile") expect(summaryBox!.y).toBeLessThan(bookingBox!.y);
  78  |   await page.locator(".detail-layout").screenshot({path:testInfo.outputPath("flight-facts.png")});
  79  | });
  80  | 
  81  | test("different return airports stay independent on cards and details",async({page,request},testInfo)=>{
  82  |   await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=open-jaw");
  83  |   await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  84  |   try {
  85  |     await page.goto("/deals");
  86  |     const card=page.locator(".deal-card").filter({has:page.locator('a[href="/deals/browser-13"]')});
  87  |     await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
  88  |     await expect(card.locator(".outbound-leg")).toContainText(/WRO .*→ STN/);
  89  |     await expect(card.locator(".return-leg")).toContainText(/LTN .*→ WRO/);
  90  |     await expect(card.locator(".return-leg")).not.toContainText("STN");
  91  |     await expect(card.locator(".outbound-leg .flight-stops")).toHaveText("Bez przesiadek");
  92  |     await expect(card.locator(".return-leg .flight-stops")).toHaveText("Liczba przesiadek: 1");
  93  |     await card.screenshot({path:testInfo.outputPath("open-jaw-card.png")});
  94  |     await card.locator(".deal-card-link").click();
  95  |     const schedule=page.locator(".detail-summary .flight-schedule-compact");
  96  |     await expect(schedule.locator(".return-leg")).toContainText(/LTN .*→ WRO/);
  97  |     await page.locator(".detail-summary .trip-details > summary").click();
  98  |     await expect(page.locator(".detail-summary .flight-facts")).toContainText("Powrót: Lotnisko wylotu: LTN · Lotnisko docelowe: WRO");
  99  |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  100 |   } finally {await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=normal");}
  101 | });
  102 | 
  103 | test("missing return airports use explicit unknowns and UTC without copying outbound airports",async({page,request})=>{
  104 |   await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  105 |   try {
  106 |     for(const scenario of ["unknown-return","unknown-airports"]){
  107 |       await request.post(`http://127.0.0.1:8125/__test__/compact-card?scenario=${scenario}`);
  108 |       await page.goto("/deals/browser-13");
  109 |       const schedule=page.locator(".detail-summary .flight-schedule-compact");
  110 |       await expect(schedule.locator(".return-leg")).toContainText("lotnisko do sprawdzenia");
  111 |       await expect(schedule.locator(".return-leg")).toContainText("UTC");
  112 |       await expect(schedule.locator(".return-leg")).not.toContainText(/WRO|BCN/);
  113 |       await expect(schedule.locator(".return-leg .flight-stops")).toBeVisible();
  114 |       await page.locator("#stay-schedule > summary").click();
  115 |       await expect(page.locator("#stay-schedule p").filter({hasText:"Zapisany wylot powrotny:"})).toContainText("UTC");
  116 |       if(scenario==="unknown-airports")await expect(schedule.locator(".outbound-leg")).not.toContainText(/WRO|BCN/);
  117 |       expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  118 |     }
  119 |   } finally {await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=normal");}
  120 | });
  121 | 
```