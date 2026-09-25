import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("optional analytics are off until consent and withdrawal clears the session",async({page})=>{
 const events:string[]=[];
 page.on("request",r=>{if(r.url().includes("/analytics/events"))events.push(r.url());});
 await page.goto("/deals/browser-deal?utm_source=consent-test");
 await expect(page.getByRole("heading",{name:"Twój wybór prywatności"})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).toBeNull();
 expect(events).toHaveLength(0);
 await expect(page.locator('script[src*="emrld.ltd"]')).toHaveCount(0);
 const audit=await new AxeBuilder({page}).include(".consent-panel").analyze();
 expect(audit.violations).toEqual([]);
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await page.reload();
 await expect(page.locator(".consent-panel")).toHaveCount(0);
 expect(events).toHaveLength(0);
 await page.getByRole("button",{name:"Ustawienia prywatności"}).click();
 await page.getByRole("checkbox",{name:/Analityka HopTrip/}).check();
 await page.getByRole("button",{name:"Zapisz wybór"}).click();
 await expect.poll(()=>events.length).toBeGreaterThan(0);
 expect(await page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).not.toBeNull();
 await page.getByRole("button",{name:"Ustawienia prywatności"}).click();
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).toBeNull();
 const count=events.length;
 await page.reload();
 expect(events).toHaveLength(count);
 let query="missing";
 await page.route("http://127.0.0.1:8100/go/**",async route=>{
   query=new URL(route.request().url()).search;
   await route.fulfill({status:200,body:"Partner transition"});
 });
 await page.getByRole("link",{name:"Sprawdź ofertę u partnera"}).click();
 expect(query).toBe("");
});

test("expired or inaccessible consent storage fails closed",async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:true,marketing:true,at:Date.now()-181*86400000}));
  localStorage.setItem("hoptrip.session.v2",JSON.stringify({id:crypto.randomUUID(),touched:Date.now()}));
 });
 await page.goto("/");
 await expect(page.locator(".consent-panel")).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).toBeNull();
 await page.addInitScript(()=>Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked");}}));
 await page.reload();
 await expect(page.locator(".consent-panel")).toBeVisible();
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await expect(page.locator(".consent-panel")).toHaveCount(0);
});
