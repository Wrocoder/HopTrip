import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page,request})=>{
 await request.post("http://127.0.0.1:8100/__test__/short-trips?enabled=true");
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test.afterEach(async({request})=>{
 await request.post("http://127.0.0.1:8100/__test__/short-trips?enabled=false");
});

test("first visit has no airport restriction and explicit choices survive a new home visit",async({page,context},testInfo)=>{
 await page.goto("/");
 const origin=page.getByRole("combobox",{name:"Skąd",exact:true});
 await expect(origin).toHaveValue("");
 await expect(origin).toHaveAttribute("placeholder","Dowolne lotnisko");
 await expect(page.locator(".catalog-section > .section-heading .eyebrow")).toHaveText("Wylot: dowolne lotnisko");
 await expect(page.locator(".catalog-section .deal-card")).toHaveCount(6);
 expect((await page.locator(".catalog-section .deal-origin").allTextContents()).some(text=>!text.includes("WRO"))).toBe(true);
 await page.screenshot({path:testInfo.outputPath("home-any-airport.png"),scale:"css"});
 await origin.fill("WAW");
 await page.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(page).toHaveURL(/origin=WAW/);
 await page.getByRole("link",{name:"HopTrip — strona główna"}).click();
 await expect(origin).toHaveValue(/WAW/);
 await expect(page.locator("#short-trip-origin")).toHaveValue("WAW");
 const fresh=await context.newPage();
 await fresh.goto("/");
 await expect(fresh.locator("#short-trip-origin")).toHaveValue("WAW");
 await fresh.close();
 await page.goto("/?origin=KTW");
 await expect(origin).toHaveValue(/KTW/);
 await expect(page.locator(".catalog-section .deal-card")).toHaveCount(2);
 await page.goto("/?origin=");
 await expect(origin).toHaveValue("");
 await page.goto("/");
 await expect(origin).toHaveValue(/WAW/);
 await page.locator(".short-trip-airport > summary").click();
 await page.locator("#short-trip-origin").selectOption("");
 await page.getByRole("button",{name:"Pokaż krótkie wyjazdy"}).click();
 await expect(page).toHaveURL(/origin=$/);
 await page.goto("/");
 await expect(origin).toHaveValue("");
});

test("short-trip selection and clearing a catalog origin update the preference",async({page})=>{
 await page.goto("/");
 await page.locator(".short-trip-airport > summary").click();
 await page.locator("#short-trip-origin").selectOption("KTW");
 await page.getByRole("button",{name:"Pokaż krótkie wyjazdy"}).click();
 await expect(page).toHaveURL(/origin=KTW/);
 await page.goto("/");
 await expect(page.locator("#short-trip-origin")).toHaveValue("KTW");
 await page.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(page).toHaveURL(/origin=KTW/);
 await page.getByRole("link",{name:/Usuń filtr: Skąd/}).click();
 await expect(page).not.toHaveURL(/origin=/);
 await page.goto("/");
 await expect(page.locator("#short-trip-origin")).toHaveValue("");
});

test("stale preferences are ignored and an empty search clears a remembered airport",async({page,context})=>{
 await context.addCookies([{name:"hoptrip.origin.v1",value:"ZZZ",url:"http://127.0.0.1:3100"}]);
 await page.goto("/");
 const origin=page.getByRole("combobox",{name:"Skąd",exact:true});
 await expect(origin).toHaveValue("");
 await context.addCookies([{name:"hoptrip.origin.v1",value:"WAW",url:"http://127.0.0.1:3100"}]);
 await page.reload();
 await expect(origin).toHaveValue(/WAW/);
 await origin.fill("");
 await page.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(page).toHaveURL(/\/deals$/);
 await page.goto("/");
 await expect(origin).toHaveValue("");
 expect((await context.cookies()).find(cookie=>cookie.name==="hoptrip.origin.v1")).toBeUndefined();
});

test("six short trips retain nights and airport in the catalog",async({page},testInfo)=>{
 await page.goto("/?origin=WAW");
 const selection=page.getByRole("region",{name:"Krótkie wyjazdy · 2–4 noce"});
 await expect(selection.locator(".deal-card")).toHaveCount(6);
 for(const card of await selection.locator(".deal-card").all()){
  await expect(card.locator(".deal-origin")).toContainText("WAW");
  await expect(card.locator(".deal-note").first()).toHaveText(/^[234] noce$/);
  await expect(card.locator(".deal-price")).toContainText("za osobę · w obie strony");
 }
 await expect(selection).toContainText("Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione");
 await expect(selection.locator('a[href="/deals/short-WAW-6"]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.catalog-section').analyze()).violations).toEqual([]);
 await selection.screenshot({path:testInfo.outputPath("short-trips.png")});
 await selection.getByRole("link",{name:/Zobacz wszystkie loty/}).click();
 await expect(page).toHaveURL(/\/deals\?.*duration_min=2.*duration_max=4/);
 const query=new URL(page.url()).searchParams;
 expect(Object.fromEntries(query)).toMatchObject({origin:"WAW",duration_min:"2",duration_max:"4"});
 await expect(page.locator(".deal-card")).toHaveCount(6);
 await page.goto("/deals?origin=WAW");
 await expect(page.locator('a[href="/deals/short-WAW-6"]').first()).toBeVisible();
});

test("airport choice persists with two or zero matches and never fills gaps with long trips",async({page})=>{
 await page.goto("/");
 await expect(page.locator("#short-trip-origin")).toHaveValue("");
 await page.locator(".short-trip-airport > summary").click();
 await page.locator("#short-trip-origin").selectOption("KTW");
 await page.getByRole("button",{name:"Pokaż krótkie wyjazdy"}).click();
 await expect(page).toHaveURL(/origin=KTW/);
 const selection=page.getByRole("region",{name:"Krótkie wyjazdy · 2–4 noce"});
 await expect(selection.locator(".deal-card")).toHaveCount(2);
 await expect(selection).toContainText("Obecnie pokazujemy mniej propozycji");
 await page.reload();
 await expect(page.locator("#short-trip-origin")).toHaveValue("KTW");
 await expect(selection.locator(".deal-card")).toHaveCount(2);
 await page.locator(".short-trip-airport > summary").click();
 await page.locator("#short-trip-origin").selectOption("GDN");
 await page.getByRole("button",{name:"Pokaż krótkie wyjazdy"}).click();
 await expect(selection.locator(".deal-card")).toHaveCount(0);
 await expect(selection).toContainText("Brak aktualnych lotów na 2–4 noce z tego lotniska");
 await expect(selection.getByRole("link",{name:/Zobacz wszystkie loty/})).toHaveAttribute("href","/deals?origin=GDN&duration_min=2&duration_max=4");
 await page.goBack();
 await expect(page.locator("#short-trip-origin")).toHaveValue("KTW");
 await expect(selection.locator(".deal-card")).toHaveCount(2);
});
