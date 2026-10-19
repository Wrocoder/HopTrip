import {test,expect} from "@playwright/test";
import {shell} from "../src/lib/i18n/shell";
import {budgetText} from "../src/lib/i18n/budget-copy";

test("budget language switch preserves drafts, query, hash and consent",async({page},testInfo)=>{
 const errors:string[]=[];
 page.on("pageerror",error=>errors.push(error.message));
 const events:string[]=[];
 page.on("request",r=>{if(r.url().endsWith("/analytics/events"))events.push(r.postDataJSON()?.event_name);});
 await page.goto("/en/info/trip-budget?origin=WRO#calculator");
 await page.getByRole("button",{name:shell.en.reject,exact:true}).click();
 await expect(page.locator("html")).toHaveAttribute("lang","en");
 await page.locator("#budget-flight").fill("100");
 await expect(page.getByTestId("budget-total")).toContainText("200");
 expect(events).toEqual([]);
 for(const [locale,label] of [["ru","Русский"],["uk","Українська"],["pl","Polski"],["en","English"]] as const){
  await page.getByRole("navigation",{name:/Language|Язык|Мова|Język/}).getByRole("link",{name:label,exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  expect(new URL(page.url()).searchParams.get("origin")).toBe("WRO");
  expect(new URL(page.url()).hash).toBe("#calculator");
  await expect(page.locator("#budget-flight")).toHaveValue("100");
  await expect(page.locator("#budget-heading")).toHaveText(budgetText(locale,"Kalkulator budżetu podróży"));
  await expect(page.getByRole("button",{name:shell[locale].reject,exact:true})).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",locale==="pl" ? "http://127.0.0.1:3100/info/trip-budget" : `http://127.0.0.1:3100/${locale}/info/trip-budget`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
 }
 await page.locator("#budget-people").fill("0");
 await expect(page.locator("#budget-people-error")).toHaveText("Enter a whole number from 1 to 50.");
 await page.locator("#budget-people").fill("2");
 await page.getByRole("button",{name:shell.en.settings,exact:true}).click();
 await page.getByRole("checkbox",{name:shell.en.analytics,exact:true}).check();
 await page.getByRole("button",{name:shell.en.save,exact:true}).click();
 const event=page.waitForRequest(r=>r.url().endsWith("/analytics/events") && r.postDataJSON()?.event_name==="BUDGET_USE");
 await page.locator("#budget-flight").fill("101");
 const request=await event;
 expect(request.postDataJSON().metadata.page_type).toBe("budget");
 await page.getByRole("button",{name:shell.en.settings,exact:true}).click();
 await page.getByRole("button",{name:shell.en.reject,exact:true}).click();
 const count=events.length;
 await page.locator("#budget-flight").fill("102");
 expect(events.length).toBe(count);
 await page.setViewportSize({width:320,height:850});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath("localized-budget.png"),fullPage:true});
 expect(errors).toEqual([]);
});

test("only translated pages exist and locale headers cannot override Polish URLs",async({request})=>{
 const response=await request.get("/info/trip-budget",{headers:{"x-hoptrip-locale":"ru"}});
 expect(await response.text()).toContain('lang="pl"');
 for(const path of ["/de/info/trip-budget","/ua/info/trip-budget","/pl/info/trip-budget","/en/deals"]){
  expect((await request.get(path)).status()).toBe(404);
 }
 const xml=await (await request.get("/sitemap.xml")).text();
 for(const locale of ["en","ru","uk"])expect(xml).toContain(`/${locale}/info/trip-budget`);
 expect(xml).not.toContain("/en/deals");
});
