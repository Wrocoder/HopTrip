import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("catalog exposes first offer and keyboard accessible filter help",async({page},testInfo)=>{
 await page.setViewportSize(testInfo.project.name==="desktop" ? {width:1366,height:900} : {width:375,height:812});
 await page.goto("/deals");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await expect(page.locator(".deal-card").first()).toBeVisible();
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:testInfo.outputPath("catalog.png"),fullPage:false});
 if(testInfo.project.name==="desktop") {
  const price=await page.locator(".deal-price").first().boundingBox();
  await testInfo.attach("first-price-bottom",{body:String(price!.y+price!.height),contentType:"text/plain"});
  expect(price!.y+price!.height).toBeLessThan(900);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const help=page.locator(".catalog-page .preset-rules");
 await expect(help).not.toHaveAttribute("open","");
 await help.locator("summary").focus();
 await page.keyboard.press("Enter");
 await expect(help).toHaveAttribute("open","");
 await expect(help).toContainText("Ponowne kliknięcie");
 await page.keyboard.press("Enter");
 await expect(help).not.toHaveAttribute("open","");
 await expect(page.locator(".advanced-filters")).not.toHaveAttribute("open","");
 await page.locator(".advanced-filters summary").click();
 await expect(page.locator('input[name="departure_from"]')).toBeVisible();
 expect((await new AxeBuilder({page}).include(".filter-panel").analyze()).violations).toEqual([]);
 if(testInfo.project.name==="mobile") {
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test("one active filter can be removed without clearing the other conditions",async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto("/deals?origin=WRO&budget=1&sort=price");
 await expect(page.getByRole("heading",{name:"Brak aktualnych ofert"})).toBeVisible();
 await expect(page.locator('input[name="budget"]')).toHaveValue("1");
 await page.getByRole("link",{name:/Usuń filtr: Budżet/}).click();
 await expect(page).not.toHaveURL(/budget=/);
 expect(new URL(page.url()).searchParams.get("origin")).toBe("WRO");
 expect(new URL(page.url()).searchParams.get("sort")).toBe("price");
 await expect(page.locator(".deal-card").first()).toBeVisible();
 await page.goBack();
 await expect(page.locator('input[name="budget"]')).toHaveValue("1");
 await expect(page.getByRole("heading",{name:"Brak aktualnych ofert"})).toBeVisible();
});
