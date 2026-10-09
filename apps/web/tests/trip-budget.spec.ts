import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("budget calculates shared costs, validates input and resets accessibly",async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.setViewportSize({width:320,height:740});
 await page.goto("/info/trip-budget#calculator");
 const calculator=page.getByRole("region",{name:"Kalkulator budżetu podróży"});
 await expect(calculator.getByRole("status")).toContainText("Budżet niepełny");
 for(const [id,value] of Object.entries({flight:"300",baggage:"50",hotel:"200",transfers:"100",local_transport:"0",food:"40",activities:"30",other:"100"}))
  await page.locator(`#budget-${id}`).fill(value);
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*600,00\s*zł/);
 await expect(page.getByTestId("budget-person")).toHaveText(/800,00\s*zł/);
 await expect(calculator.getByRole("status")).not.toContainText("Budżet niepełny");
 await page.locator("#budget-flight").fill("-1");
 await expect(page.locator("#budget-flight")).toHaveAttribute("aria-invalid","true");
 await expect(page.getByTestId("budget-total")).toHaveCount(0);
 await page.locator("#budget-flight").fill("300,50");
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*601,00\s*zł/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include("#calculator").analyze()).violations).toEqual([]);
 await page.getByRole("button",{name:"Wyczyść kalkulator"}).click();
 await expect(page.locator("#budget-flight")).toHaveValue("");
 await expect(calculator.getByRole("status")).toContainText("Budżet niepełny");
});

test("flight links to the budget calculator",async({page})=>{
 await page.goto("/deals/browser-deal");
 await page.getByRole("link",{name:"Policz budżet całej podróży"}).click();
 await expect(page).toHaveURL(/\/deals\/browser-deal#calculator$/);
 await expect(page.getByRole("heading",{name:"Kalkulator budżetu podróży"})).toBeVisible();
 await expect(page.locator("#budget-flight")).toHaveValue("200.25");
 await expect(page.locator("#budget-people")).toHaveValue("1");
});
test("reference fare fills only local transport and preserves manual amounts",async({page})=>{
 await page.route("https://api.nbp.pl/**",route=>route.fulfill({json:{table:"A",currency:"euro",code:"EUR",rates:[{no:"fixture",effectiveDate:new Date().toISOString().slice(0,10),mid:4}]}}));
 await page.goto("/deals/browser-deal#calculator");
 await page.setViewportSize({width:320,height:740});
 await page.getByText("Sprawdź orientacyjne koszty na miejscu",{exact:true}).click();
 await page.getByRole("button",{name:"Uzupełnij transport miejski w PLN"}).click();
 await expect(page.locator("#budget-local_transport")).toHaveValue("52.00");
 await expect(page.locator("#budget-transfers")).toHaveValue("");
 await page.locator("#budget-local_transport").fill("75");
 await expect(page.getByRole("button",{name:"Uzupełnij transport miejski w PLN"})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("lodging total survives mode changes and is counted only once",async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.setViewportSize({width:320,height:740});
 await page.goto("/info/trip-budget#calculator");
 await page.locator("#budget-hotel").fill("100");
 await page.locator("#budget-hotel-basis").selectOption("stay");
 await expect(page.locator("#budget-hotel_total")).toHaveValue("");
 await page.locator("#budget-hotel_total").fill("1000,01");
 await page.locator("#budget-people").fill("3");
 await page.locator("#budget-nights").fill("7");
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*000,01\s*zł/);
 await page.locator("#budget-hotel-basis").selectOption("night");
 await expect(page.locator("#budget-hotel")).toHaveValue("100");
 await expect(page.getByTestId("budget-total")).toHaveText(/700,00\s*zł/);
 await page.locator("#budget-hotel-basis").selectOption("stay");
 await expect(page.locator("#budget-hotel_total")).toHaveValue("1000,01");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include("#calculator").analyze()).violations).toEqual([]);
 await page.getByRole("button",{name:"Wyczyść kalkulator"}).click();
 await expect(page.locator("#budget-hotel-basis")).toHaveValue("night");
 await page.locator("#budget-hotel-basis").selectOption("stay");
 await expect(page.locator("#budget-hotel_total")).toHaveValue("");
});
