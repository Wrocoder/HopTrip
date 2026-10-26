import {test,expect} from "@playwright/test";

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
  await page.locator(".detail-summary .trip-details > summary").click();
  await expect(page.locator(".detail-summary .flight-facts")).toContainText("Bagaż do sprawdzenia u partnera");
  await expect(page.locator(".detail-summary .flight-facts")).toContainText("Przewoźnik do sprawdzenia u partnera");
  await expect(page.locator(".booking-price")).toContainText("za osobę · w jedną stronę");
});

test("round trip facts agree between card and detail without mobile overflow",async({page},testInfo)=>{
  await page.goto("/deals");
  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  const card=page.locator(".deal-card").filter({has:page.locator('a[href="/deals/browser-13"]')});
  await expect(card.locator(".flight-schedule-compact")).toBeVisible();
  await expect(card.locator(".flight-schedule-compact")).not.toContainText("Europe/Warsaw");
  await expect(card.locator(".flight-schedule")).toContainText("Ryanair (FR)");
  await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
  await expect(card.locator(".outbound-leg .flight-stops")).toHaveText("Bez przesiadek");
  await expect(card.locator(".return-leg .flight-stops")).toHaveText("Liczba przesiadek: 1");
  await card.locator(".trip-details > summary").click();
  await expect(card.locator(".deal-price")).toContainText("za osobę · w obie strony");
  await expect(card.locator(".flight-facts")).toContainText("Ryanair (FR)");
  await expect(card.locator(".flight-facts")).toContainText("70 godz. 0 min");
  await card.screenshot({path:testInfo.outputPath("flight-card.png")});
  await card.locator(".deal-card-link").click();
  const facts=page.locator(".detail-summary .flight-facts");
  await page.locator(".detail-summary .trip-details > summary").click();
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
    await page.goto("/deals");
    const card=page.locator(".deal-card").filter({has:page.locator('a[href="/deals/browser-13"]')});
    await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
    await expect(card.locator(".outbound-leg")).toContainText(/WRO .*→ STN/);
    await expect(card.locator(".return-leg")).toContainText(/LTN .*→ WRO/);
    await expect(card.locator(".return-leg")).not.toContainText("STN");
    await expect(card.locator(".outbound-leg .flight-stops")).toHaveText("Bez przesiadek");
    await expect(card.locator(".return-leg .flight-stops")).toHaveText("Liczba przesiadek: 1");
    await card.screenshot({path:testInfo.outputPath("open-jaw-card.png")});
    await card.locator(".deal-card-link").click();
    const schedule=page.locator(".detail-summary .flight-schedule-compact");
    await expect(schedule.locator(".return-leg")).toContainText(/LTN .*→ WRO/);
    await page.locator(".detail-summary .trip-details > summary").click();
    await expect(page.locator(".detail-summary .flight-facts")).toContainText("Powrót: Lotnisko wylotu: LTN · Lotnisko docelowe: WRO");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  } finally {await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");}
});

test("missing return airports use explicit unknowns and UTC without copying outbound airports",async({page,request})=>{
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  try {
    for(const scenario of ["unknown-return","unknown-airports"]){
      await request.post(`http://127.0.0.1:8100/__test__/compact-card?scenario=${scenario}`);
      await page.goto("/deals/browser-13");
      const schedule=page.locator(".detail-summary .flight-schedule-compact");
      await expect(schedule.locator(".return-leg")).toContainText("lotnisko do sprawdzenia");
      await expect(schedule.locator(".return-leg")).toContainText("UTC");
      await expect(schedule.locator(".return-leg")).not.toContainText(/WRO|BCN/);
      await expect(schedule.locator(".return-leg .flight-stops")).toBeVisible();
      await page.locator("#stay-schedule > summary").click();
      await expect(page.locator("#stay-schedule p").filter({hasText:"Zapisany wylot powrotny:"})).toContainText("UTC");
      if(scenario==="unknown-airports")await expect(schedule.locator(".outbound-leg")).not.toContainText(/WRO|BCN/);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    }
  } finally {await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");}
});
