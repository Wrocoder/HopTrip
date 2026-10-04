import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("budget calculates shared costs, validates input and resets accessibly",async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.setViewportSize({width:320,height:740});
 await page.goto("/info/trip-budget#calculator");
 const calculator=page.getByRole("region",{name:"Kalkulator budżetu podróży"});
 await expect(calculator.getByRole("status")).toContainText("Budżet niepełny");
 for(const [id,value] of Object.entries({flight:"300",baggage:"50",hotel:"200",transfers:"100",food:"40",activities:"30",other:"100"}))
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
 await expect(page).toHaveURL(/\/info\/trip-budget#calculator$/);
 await expect(page.getByRole("heading",{name:"Kalkulator budżetu podróży"})).toBeVisible();
});
