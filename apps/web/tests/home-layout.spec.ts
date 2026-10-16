import {test,expect} from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

test("home layout comparison",async({page},testInfo)=>{
 const mobile=testInfo.project.name==="mobile";
 await page.setViewportSize(mobile ? {width:390,height:844} : {width:1440,height:900});
 await page.goto("/");
 await expect(page.locator(".consent-panel")).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);
 const phase=process.env.HOPTRIP_HOME_PHASE ?? "after";
 const dir=process.env.HOPTRIP_HOME_PHASE ? path.resolve("../../docs") : testInfo.outputDir;
 await fs.mkdir(dir,{recursive:true});
 const prefix=path.join(dir,`hoptrip-ht07-${phase}-${testInfo.project.name}`);
 await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
 await page.screenshot({path:prefix+"-consent.png"});
 if(phase!=="before") {
   const panel=await page.locator(".consent-panel").boundingBox();
   const main=await page.locator("main").boundingBox();
   expect(panel!.y+panel!.height).toBeLessThanOrEqual(main!.y);
   await expect(page.getByRole("checkbox",{name:/Analityka HopTrip/})).not.toBeChecked();
   await expect(page.getByRole("checkbox",{name:/Travelpayouts Drive/})).not.toBeChecked();
 }
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
 await page.screenshot({path:prefix+".png"});
 const firstCard=await page.locator(".deal-card").first().boundingBox();
 await fs.writeFile(prefix+".json",JSON.stringify({viewport:page.viewportSize(),firstCardTop:firstCard?.y},null,2)+"\n");
 if(phase!=="before") {
   expect(firstCard!.y).toBeLessThan(mobile ? 844 : 650);
   await expect(page.getByRole("combobox",{name:"Skąd",exact:true})).toHaveValue("");
   await page.getByRole("combobox",{name:"Skąd",exact:true}).fill("WRO");
   await page.getByText("Zasady szybkich filtrów",{exact:true}).click();
   await expect(page.locator(".preset-rules")).toContainText("bez godzin nie gwarantujemy wyjazdu bez urlopu");
   await page.getByRole("combobox",{name:"Dokąd",exact:true}).fill("Mediolan");
   await page.locator('input[name="budget"]').fill("300");
   await page.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
   await expect(page).toHaveURL(/destination=milan/);
   await expect(page).toHaveURL(/origin=WRO/);
   await expect(page).toHaveURL(/budget=300/);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
