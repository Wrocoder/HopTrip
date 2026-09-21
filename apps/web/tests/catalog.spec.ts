import {test,expect} from "@playwright/test";

test("airport to deal to partner keeps one session and records click",async({page,request})=>{
 await page.route("https://partner.example/**",route=>route.fulfill({status:200,body:"Local partner fixture"}));
 await page.goto("/");
 await page.getByRole("link",{name:"Wrocław (WRO)",exact:true}).click();
 await expect(page.locator(".deal-card")).toHaveCount(14);
 await page.locator('a[href="/deals/browser-deal"]').click();
 await expect(page.getByRole("heading",{level:1})).toContainText("Barcelona");
 await expect(page.getByText("200,25",{exact:false}).first()).toBeVisible();
 const sid=await page.evaluate(()=>JSON.parse(localStorage.getItem("hoptrip.session.v2")!).id);
 await page.getByRole("link",{name:"Sprawdź ofertę u partnera"}).focus();
 await page.keyboard.press("Enter");
 await expect(page).toHaveURL(/partner.example/);
 await expect(page.getByText("Local partner fixture")).toBeVisible();
 const data=await (await request.get("http://127.0.0.1:8100/__test__/tracking")).json();
 expect(data.clicks.some((c:{session:string;program:number})=>c.session===sid && c.program>0)).toBeTruthy();
 expect(data.events.some((e:{session:string;name:string})=>e.session===sid && e.name==="DEAL_VIEW")).toBeTruthy();
});

test("combined filters, pagination, empty and invalid states",async({page})=>{
 await page.goto("/deals?origin=WRO&budget=220&duration_min=3&duration_max=3");
 await expect(page.locator(".deal-card")).toHaveCount(12);
 await page.getByRole("link",{name:"Następna strona"}).click();
 await expect(page).toHaveURL(/budget=220/);
 await expect(page.locator(".deal-card")).toHaveCount(2);
 await page.goto("/deals?budget=1");
 await expect(page.getByText("Brak aktualnych ofert", {exact:false})).toBeVisible();
 await page.goto("/deals?duration_min=5&duration_max=2");
 await expect(page.getByRole("alert").first()).toContainText("Sprawdź");
});

test("no link, expired and unknown route",async({page})=>{
 await page.goto("/deals/browser-1");
 await expect(page.getByText("Link do rezerwacji nie jest jeszcze dostępny.")).toBeVisible();
 await expect(page.getByRole("link",{name:"Sprawdź ofertę u partnera"})).toHaveCount(0);
 for(const path of ["/deals/browser-14","/from/ZZZ","/destinations/unknown"]) {
   await page.goto(path);
   await expect(page.getByRole("heading",{level:1})).toContainText("Nie znaleziono");
 }
});

test("storage failure does not break UI and session rotates after inactivity",async({page})=>{
 await page.goto("/deals/browser-deal");
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).not.toBeNull();
 const old=await page.evaluate(()=>{
   const value=JSON.parse(localStorage.getItem("hoptrip.session.v2")!);
   value.touched=Date.now()-31*60*1000;
   localStorage.setItem("hoptrip.session.v2",JSON.stringify(value));return value.id;
 });
 await page.reload();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("hoptrip.session.v2")!).id)).not.toBe(old);
 await page.addInitScript(()=>{Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked");}});});
 await page.reload();
 await expect(page.getByRole("link",{name:"Sprawdź ofertę u partnera"})).toBeVisible();
});

test("canonical, sitemap and draft noindex",async({page,request})=>{
 await page.goto("/info/privacy");
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","http://127.0.0.1:3100/info/privacy");
 const sitemap=await (await request.get("/sitemap.xml")).text();
 expect(sitemap).not.toContain("/privacy");
 expect(sitemap).not.toContain("/deals?");
 expect(sitemap).toContain("/info/about");
 for(const slug of ["price-comparison","price-freshness","price-history"]) {
  expect(sitemap).toContain(`/info/${slug}`);
 }
 await page.goto("/info");
 await page.getByRole("link",{name:"Jak porównujemy ceny lotów",exact:false}).click();
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","http://127.0.0.1:3100/info/price-comparison");
 await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content","Jak porównujemy ceny lotów");
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
 await expect(page.getByRole("heading",{name:"Jak rozumieć procent poniżej mediany"})).toBeVisible();
 await page.getByRole("link",{name:"Co oznacza świeżość oferty",exact:true}).click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Co oznacza świeżość oferty");
 await page.getByRole("link",{name:"Co mówi, a czego nie mówi historia cen",exact:true}).click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Co mówi, a czego nie mówi historia cen");
});

test("unknown information slugs including object properties show not found",async({page})=>{
 for(const slug of ["missing-page","constructor","toString","__proto__"]) {
  await page.goto(`/info/${slug}`);
  await expect(page.getByRole("heading",{level:1})).toContainText("Nie znaleziono");
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content",/noindex/);
 }
});
