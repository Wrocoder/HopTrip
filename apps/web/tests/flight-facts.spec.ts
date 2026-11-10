import {test,expect} from "@playwright/test";

test('structured return shows the actual airports, clocks and connecting flights',async({page,request})=>{
 await request.post('http://127.0.0.1:8100/__test__/compact-card?scenario=structured-return');
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 try{
  await page.goto('/deals/browser-13');
  const summary=page.locator('.detail-summary'),information=page.locator('.decision-information');
  await expect(summary.locator('.home-arrival')).not.toContainText('szac.');
  await expect(summary.locator('[data-decision-risks]')).toContainText('Powrót z innego lotniska: LTN (przylot: STN)');
  await information.locator('.trip-details > summary').click();
  const legs=information.locator('.flight-connections');
  await expect(legs).toContainText('WRO → STN');
  await expect(legs).toContainText('LTN → BER');
  await expect(legs).toContainText('BER → WRO');
  for(const flight of ['FR 8406','W6 1234','LO 999'])await expect(legs).toContainText(flight);
  const body=await(await request.get('http://127.0.0.1:8100/api/v1/deals/browser-13')).json();
  expect(body.flight_facts.return_legs).toHaveLength(2);
  expect((Date.parse(body.flight_facts.return_arrival)-Date.parse(body.flight_facts.return_departure))/60000).toBe(180);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await request.post('http://127.0.0.1:8100/__test__/compact-card?scenario=normal');}
});

test("unknown flight details remain explicit before the partner click",async({page})=>{
  await page.goto("/deals");
  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  const card=page.locator(".deal-card").first();
  const flag=card.locator("h2 .country-flag");
  await expect(flag).toHaveAttribute("title","Hiszpania");
  await expect(flag).toBeVisible();
  await expect.poll(()=>flag.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBeGreaterThan(0);
  await expect(card.locator(".flight-facts")).not.toBeVisible();
  await expect(card.locator(".flight-schedule-compact .flight-stops")).toBeVisible();
  await expect(card.locator(".flight-schedule-compact .flight-stops")).toContainText("Przesiadki do sprawdzenia u partnera");
  await expect(card.locator(".flight-schedule-compact .outbound-leg")).toContainText("lotnisko do sprawdzenia → lotnisko do sprawdzenia");
  await card.locator(".trip-details > summary").click();
  await expect(card.locator(".flight-facts")).toBeVisible();
  await expect(card.locator(".deal-price")).toContainText("za osobę · w jedną stronę");
  await expect(card.locator(".flight-facts")).toContainText("Lotnisko wylotu: do sprawdzenia u partnera");
  await expect(card.locator(".flight-facts")).toContainText("Brak danych o godzinie");
  await card.locator(".deal-card-link").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("h1 .country-flag")).toHaveAttribute("title","Hiszpania");
  await page.locator(".decision-information .trip-details > summary").click();
  await expect(page.locator(".decision-information .flight-facts")).toContainText("Bagaż do sprawdzenia u partnera");
  await expect(page.locator(".decision-information .flight-facts")).toContainText("Przewoźnik do sprawdzenia u partnera");
  await expect(page.locator(".detail-summary .deal-price")).toContainText("za osobę · w jedną stronę");
});

test("round trip facts agree between card and detail without mobile overflow",async({page},testInfo)=>{
  await page.goto("/deals?offset=12");
  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  const card=page.locator(".deal-card").filter({has:page.locator('a[href^="/deals/browser-13"]')});
  await expect(card.locator(".flight-schedule-compact")).toBeVisible();
  await expect(card.locator(".flight-schedule-compact")).not.toContainText("Europe/Warsaw");
  // DEAL-01 keeps full carrier details in the disclosure; they are checked below.
  await expect(card.locator(".flight-schedule")).not.toContainText("Ryanair (FR)");
  await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
  await expect(card.locator(".outbound-leg .flight-stops")).toHaveText("Bez przesiadek");
  await expect(card.locator(".return-leg .flight-stops")).toHaveText("Liczba przesiadek: 1");
  await card.locator(".trip-details > summary").click();
  await expect(card.locator(".deal-price")).toContainText("za osobę · w obie strony");
  await expect(card.locator(".flight-facts")).toContainText("Ryanair (FR)");
  await expect(card.locator(".destination-time")).toContainText("70 godz. 0 min");
  await card.screenshot({path:testInfo.outputPath("flight-card.png")});
  await card.locator(".deal-card-link").click();
  const facts=page.locator(".decision-information .flight-facts");
  await page.locator(".decision-information .trip-details > summary").click();
  await expect(facts).toContainText("Lotnisko docelowe: BCN");
  await expect(facts).toContainText("Godziny lokalne");
  await expect(facts).toContainText("obliczony z czasu lotu");
  await expect(page.locator(".detail-summary")).toContainText("za osobę · w obie strony");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const summaryBox=await page.locator(".detail-summary").boundingBox();
  const bookingBox=await page.locator(".booking-card").boundingBox();
  if (testInfo.project.name==="mobile") expect(summaryBox!.y).toBeLessThan(bookingBox!.y);
  await page.locator(".detail-layout").screenshot({path:testInfo.outputPath("flight-facts.png")});
});

test("different return airports stay independent on cards and details",async({page,request},testInfo)=>{
  await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=open-jaw");
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  try {
    await page.goto("/deals?offset=12");
    const card=page.locator(".deal-card").filter({has:page.locator('a[href^="/deals/browser-13"]')});
    await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
    await expect(card.locator(".outbound-leg")).toContainText(/WRO .*→ STN/);
    await expect(card.locator(".return-leg")).toContainText(/LTN .*→ WRO/);
    await expect(card.locator(".return-leg")).not.toContainText("STN");
    await expect(card.locator(".outbound-leg .flight-stops")).toHaveText("Bez przesiadek");
    await expect(card.locator(".return-leg .flight-stops")).toHaveText("Liczba przesiadek: 1");
    await card.screenshot({path:testInfo.outputPath("open-jaw-card.png")});
    await card.locator(".deal-card-link").click();
    await expect(page.locator('.detail-summary [data-decision-risks]')).toContainText('Powrót z innego lotniska: LTN');
    await page.locator(".decision-information .trip-details > summary").click();
    await expect(page.locator(".decision-information .flight-facts")).toContainText("Powrót: Lotnisko wylotu: LTN · Lotnisko docelowe: WRO");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  } finally {await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");}
});

test("missing return airports use explicit unknowns and UTC without copying outbound airports",async({page,request})=>{
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  try {
    for(const scenario of ["unknown-return","unknown-airports"]){
      await request.post(`http://127.0.0.1:8100/__test__/compact-card?scenario=${scenario}`);
      await page.goto("/deals/browser-13");
      await expect(page.locator('.detail-summary .home-arrival')).toContainText('do potwierdzenia');
      await expect(page.locator('.detail-summary [data-decision-risks]')).toContainText('Sprawdź lotniska powrotu u partnera');
      await page.locator('.decision-information .trip-details > summary').click();
      const facts=page.locator('.decision-information .flight-facts');
      const airports=facts.locator('p').filter({hasText:'Powrót: Lotnisko wylotu:'});
      await expect(airports).toContainText('do sprawdzenia u partnera');
      await expect(airports).not.toContainText(/WRO|BCN/);
      await expect(facts.locator('p').filter({hasText:'Powrót — odlot:'})).toContainText('UTC');
      await expect(facts.locator('.flight-stop-counts')).toBeVisible();
      await page.locator("#stay-schedule > summary").click();
      await expect(page.locator("#stay-schedule p").filter({hasText:"Zapisany wylot powrotny:"})).toContainText("UTC");
      if(scenario==="unknown-airports"){
       const outbound=facts.locator('p').filter({hasText:/^Lotnisko wylotu:/});
       await expect(outbound).toContainText('Lotnisko wylotu: do sprawdzenia u partnera · Lotnisko docelowe: do sprawdzenia u partnera');
       await expect(outbound).toContainText('kod kierunku: BCN; nie potwierdza lotniska');
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    }
  } finally {await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");}
});
