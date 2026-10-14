import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {encodeTrip} from "../src/lib/shared-trip";
import {emptyBudget} from "../src/lib/trip-budget";

test("saved and shared plans survive reload and recipients edit independent copies",async({page,browser},testInfo)=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto("/deals/browser-deal#calculator");
 await page.locator("#budget-start").fill("2027-01-15");
 await page.locator("#budget-end").fill("2027-01-17");
 await page.locator("#budget-people").fill("3");
 await page.locator("#budget-hotel").fill("123,45");
 await page.getByRole("button",{name:"Zapisz wyjazd",exact:true}).click();
 await expect(page.locator("#calculator")).toContainText("Zapisano wyjazd");
 await page.getByRole("button",{name:"Udostępnij",exact:true}).click();
 const url=await page.locator("#trip-share-link").inputValue();
 const recipient=await browser.newContext({viewport:testInfo.project.name==="mobile" ? {width:390,height:844} : {width:1280,height:900}});
 try {
  const copy=await recipient.newPage();
  await copy.goto(url);
  await expect(copy.locator("#budget-people")).toHaveValue("3");
  await expect(copy.locator("#budget-hotel")).toHaveValue("123,45");
  await expect(copy.getByTestId("budget-total")).toHaveText(/847,65/);
  await expect(copy.getByRole("main")).toContainText("Kopia zapisanego planu");
  await expect(copy.locator('meta[property="og:title"]')).toHaveAttribute("content",/zapisany plan/);
  await expect(copy.locator('meta[property="og:description"]')).toHaveAttribute("content",/Plan pobytu:.*2027.*weryfikacji/);
  await copy.locator("#budget-people").fill("4");
  await copy.reload();
  await expect(copy.locator("#budget-people")).toHaveValue("4");
  await page.reload();
  await expect(page.locator("#budget-people")).toHaveValue("3");
  expect((await new AxeBuilder({page:copy}).include("main").analyze()).violations).toEqual([]);
  expect(await copy.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await copy.screenshot({path:testInfo.outputPath("shared-plan.png"),fullPage:true});
 }finally{await recipient.close();}
 await page.goto("/saved");
 await expect(page.getByRole("main").getByRole("link",{name:/→/})).toHaveCount(1);
 await page.reload();
 await expect(page.getByRole("main").getByRole("link",{name:/→/})).toHaveCount(1);
 await page.getByRole("button",{name:/Usuń plan/}).click();
 await expect(page.getByRole("main")).toContainText("Nie masz jeszcze zapisanych");
 await page.goto(url);
 await expect(page.locator("#budget-people")).toHaveValue("3");
});

test("invalid, missing and expired offers retain clear states and honest previews",async({page})=>{
 await page.goto("/trip?plan=broken");
 await expect(page.getByRole("heading",{level:1})).toHaveText("Nie można odczytać planu");
 const trip={version:1 as const,offer:{slug:"missing-offer",origin:"Wrocław",destination:"Mediolan",start:"2090-01-15",end:"2090-01-17",price:"123",observedAt:"2026-10-11T12:00:00Z"},draft:{version:1 as const,input:{...emptyBudget,hotel:"100"},start:"2090-01-15",end:"2090-01-17",context:"",review:true}};
 await page.goto(`/trip?plan=${encodeTrip(trip)}`);
 await expect(page.getByRole("main").getByRole("status").first()).toContainText("nie jest już dostępna");
 await expect(page.locator("#budget-hotel")).toHaveValue("100");
 await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content","Wrocław → Mediolan — zapisany plan | HopTrip");
 await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content",/2090/);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
 await page.goto(`/trip?plan=${encodeTrip({...trip,offer:{...trip.offer,start:"2020-01-15",end:"2020-01-17"}})}`);
 await expect(page.getByRole("main").getByRole("status").first()).toContainText("już minął");
});

test("sharing remains available when browser storage and clipboard are blocked",async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked");}});
  Object.defineProperty(navigator,"clipboard",{get(){throw new Error("blocked");}});
 });
 await page.goto("/deals/browser-deal#calculator");
 await page.getByRole("button",{name:"Zapisz wyjazd",exact:true}).click();
 await expect(page.locator("#calculator")).toContainText("Nie udało się zapisać wyjazdu");
 await page.getByRole("button",{name:"Udostępnij",exact:true}).click();
 await expect(page.locator("#trip-share-link")).toHaveValue(/\/trip\?plan=/);
 await expect(page.locator("#calculator")).toContainText("Skopiuj link z pola");
});
