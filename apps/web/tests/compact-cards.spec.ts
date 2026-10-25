import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page,request})=>{
 await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");
});

test("compact cards preserve clocks, missing facts, keyboard access and long names",async({page},testInfo)=>{
 await page.setViewportSize(testInfo.project.name==="desktop" ? {width:1366,height:900} : {width:390,height:844});
 await page.goto("/deals");
 await page.evaluate(()=>document.fonts.ready);
 const first=page.locator(".deal-card").first();
 if(testInfo.project.name==="desktop") {
  const price=await first.locator(".deal-price").boundingBox();
  expect(price!.y+price!.height).toBeLessThan(900);
 }
 await expect(first.locator(".flight-schedule-compact")).toContainText("brak godziny");
 await expect(first.locator(".flight-schedule-compact")).not.toContainText("Powrót");
 const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-13"]')});
 await expect(card.locator(".flight-schedule-compact")).toContainText("Godziny lokalne");
 await expect(card.locator(".flight-schedule-compact")).toContainText("Przylot szacowany");
 await expect(card.locator(".flight-schedule-compact")).not.toContainText(/Europe\/|GMT/);
 // Two stop summaries now belong to the collapsed card, one for each direction.
 await expect(card.locator(".flight-stops")).toHaveCount(2);
 if(testInfo.project.name==="desktop") {
  // Observation and availability are now always visible; the existing card stays compact.
  const freshness=await card.locator('.price-freshness').boundingBox();
  expect(freshness!.height).toBeLessThan(130);
  expect((await card.boundingBox())!.height).toBeLessThan(730);
 }
 await page.screenshot({path:testInfo.outputPath("catalog.png")});
 await card.screenshot({path:testInfo.outputPath("card.png")});
 await card.locator(".trip-details > summary").focus();
 await page.keyboard.press("Enter");
 await expect(card.locator(".flight-facts")).toBeVisible();
 await expect(card.locator(".flight-facts")).toContainText("Europe/Warsaw");
 expect((await new AxeBuilder({page}).include(".deal-grid").analyze()).violations).toEqual([]);
 await page.keyboard.press("Enter");
 // Synthetic long content tests wrapping, not a new production destination.
 await card.locator(".deal-card-link h2").evaluate(el=>{el.textContent="Bardzo długa nazwa kierunku podróży — Santiago de Compostela";});
 await page.setViewportSize({width:320,height:812});
 await page.addStyleTag({content:".deal-card {font-size:200%} .deal-card h2 {font-size:2em}"});
 expect(await card.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await card.screenshot({path:testInfo.outputPath("long-name.png")});
});

test("next-day home arrival is visible without expanding details",async({page,request},testInfo)=>{
 await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=midnight");
 await page.goto("/deals");
 const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-13"]')});
 await expect(card.locator(".home-arrival")).toBeVisible();
 await expect(card.locator(".home-arrival")).toContainText("+1 dzień");
 await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
 await expect(card.locator(".flight-schedule-compact")).toContainText("Przylot szacowany");
 await card.screenshot({path:testInfo.outputPath("midnight.png")});
});
