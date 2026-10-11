import {test,expect} from "@playwright/test";

test("unknown flight details remain explicit before the partner click",async({page})=>{
  await page.goto("/deals");
  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  const card=page.locator(".deal-card").first();
  await expect(card.locator(".deal-price")).toContainText("za osobę · w jedną stronę");
  await expect(card.locator(".flight-facts")).toContainText("Lotnisko wylotu: WRO");
  await expect(card.locator(".flight-facts")).toContainText("Godziny do sprawdzenia u partnera");
  await card.locator(".deal-card-link").click();
  await expect(page.locator(".detail-summary .flight-facts")).toContainText("Bagaż do sprawdzenia u partnera");
  await expect(page.locator(".detail-summary .flight-facts")).toContainText("Przewoźnik do sprawdzenia u partnera");
  await expect(page.locator(".booking-price")).toContainText("za osobę · w jedną stronę");
});

test("round trip facts agree between card and detail without mobile overflow",async({page},testInfo)=>{
  await page.goto("/deals");
  await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
  const card=page.locator(".deal-card").filter({has:page.locator('a[href="/deals/browser-13"]')});
  await expect(card.locator(".deal-price")).toContainText("za osobę · w obie strony");
  await expect(card.locator(".flight-facts")).toContainText("Wylot: Bez przesiadek · Powrót: Liczba przesiadek: 1");
  await expect(card.locator(".flight-facts")).toContainText("IATA): FR");
  await expect(card.locator(".flight-facts")).toContainText("70 godz. 0 min");
  await card.screenshot({path:testInfo.outputPath("flight-card.png")});
  await card.locator(".deal-card-link").click();
  const facts=page.locator(".detail-summary .flight-facts");
  await expect(facts).toContainText("Lotnisko docelowe: BCN");
  await expect(facts).toContainText("Godziny w UTC");
  await expect(facts).toContainText("Przyloty obliczone");
  await expect(page.locator(".detail-summary")).toContainText("za osobę · w obie strony");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const summaryBox=await page.locator(".detail-summary").boundingBox();
  const bookingBox=await page.locator(".booking-card").boundingBox();
  if (testInfo.project.name==="mobile") expect(summaryBox!.y).toBeLessThan(bookingBox!.y);
  await page.locator(".detail-layout").screenshot({path:testInfo.outputPath("flight-facts.png")});
});
