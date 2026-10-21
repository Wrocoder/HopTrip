import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {catalogText} from "../src/lib/i18n/catalog-copy";
import {filterText} from "../src/lib/i18n/filter-copy";
import {getMessages} from "../src/lib/i18n/messages";

test.setTimeout(90000);

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("catalog languages preserve filters, pages, consent and server language",async({page},testInfo)=>{
 const errors:string[]=[],events:string[]=[];
 page.on("pageerror",error=>errors.push(error.message));
 page.on("request",r=>{if(r.url().endsWith("/analytics/events"))events.push(r.url());});
 await page.setViewportSize(testInfo.project.name==="desktop" ? {width:1366,height:900} : {width:375,height:812});
 await page.goto("/en/deals?origin=WRO&sort=price");
 for(const [locale,name] of [["en","English"],["ru","Русский"],["uk","Українська"],["pl","Polski"]] as const){
  if(locale!=="en")await page.locator(".language-switcher").getByRole("link",{name,exact:true}).click();
  const prefix=locale==="pl" ? "" : `/${locale}`,messages=getMessages(locale);
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  await expect(page.locator(".result-count")).toContainText(`${catalogText(locale,"Liczba ofert:")} 14`);
  await expect(page.locator(".deal-card")).toHaveCount(12);
  await expect(page.locator(".sort-control select")).toHaveValue("price");
  expect(new URL(page.url()).searchParams.get("origin")).toBe("WRO");
  if(locale!=="pl"){
   await expect(page.locator(".deal-card-link").first()).toHaveAttribute("href",new RegExp(`^/${locale}/deals/`));
   await expect(page.locator(".deal-card").first()).not.toContainText("Daty oferty");
  }
  await page.evaluate(()=>scrollTo(0,0));
  if(testInfo.project.name==="desktop"){
   const price=await page.locator(".deal-price").first().boundingBox();
   expect(price!.y+price!.height).toBeLessThan(900);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`catalog-${locale}.png`)});
  await page.getByRole("link",{name:messages.next,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`${prefix}/deals.*offset=12`));
  await expect(page.locator(".result-count")).toContainText("13–14");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  await page.getByLabel(filterText(locale,"Sortuj oferty")).selectOption("departure");
  await expect(page).not.toHaveURL(/offset=/);
  await page.goBack();
  await expect(page).toHaveURL(/offset=12/);
  await page.getByRole("link",{name:messages.previous,exact:true}).click();
  await expect(page.locator(".deal-card")).toHaveCount(12);
 }
 expect(events).toEqual([]);
 expect(errors).toEqual([]);
});

test("translated details and offer links retain the catalog language",async({page})=>{
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/deals?origin=WRO&sort=price`);
  const card=page.locator(".deal-card").first();
  await card.locator(".trip-details > summary").click();
  await expect(card.locator(".flight-facts")).toContainText(catalogText(locale,"Bagaż do sprawdzenia u partnera"));
  await expect(card.locator(".price-assessment")).toContainText(catalogText(locale,"Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo."));
  expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
  await card.locator(".deal-card-link").click();
  await expect(page).toHaveURL(/\/deals\/[^/?]+$/);
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
 }
});

test("localized empty, invalid, unavailable and loading results keep conditions",async({page})=>{
 for(const locale of ["en","ru","uk"] as const){
  const t=(key:Parameters<typeof catalogText>[1])=>catalogText(locale,key);
  await page.goto(`/${locale}/deals?origin=WRO&sort=price&budget=1`);
  await expect(page.getByRole("heading",{name:t("Brak aktualnych ofert")})).toBeVisible();
  const relax=page.getByRole("link",{name:t("Usuń limit ceny"),exact:true});
  await expect(relax).toHaveAttribute("href",`/${locale}/deals?origin=WRO&sort=price`);
  await expect(page.locator('input[name="budget"]')).toHaveValue("1");
  await relax.click();
  await expect(page.locator(".deal-card")).toHaveCount(12);
  await page.goto(`/${locale}/deals?sort=invalid`);
  await expect(page.getByRole("heading",{name:t("Sprawdź parametry wyszukiwania")})).toBeVisible();
  await page.goto(`/${locale}/deals?budget=987653`);
  await expect(page.getByRole("heading",{name:t("Nie udało się pobrać ofert")})).toBeVisible();
  await expect(page.getByRole("link",{name:t("Spróbuj ponownie")})).toBeVisible();
  await page.goto(`/${locale}/deals?budget=987654`,{waitUntil:"commit"});
  await expect(page.getByRole("status").filter({hasText:getMessages(locale).loading})).toBeVisible();
  await expect(page.locator(".result-count")).toContainText("14");
 }
});

test("catalog canonical and alternates preserve normalized queries without indexing filters",async({page,request})=>{
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/deals?origin=wro&sort=price&utm_source=test`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100/${locale}/deals?origin=WRO&sort=price`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  await page.goto(`/${locale}/deals`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/^index,/);
 }
 for(const path of ["/ua/deals","/de/deals","/pl/deals","/en/deals/untranslated-offer"]){
  expect((await request.get(path)).status()).toBe(404);
 }
 const response=await request.get("/deals",{headers:{"x-hoptrip-locale":"ru"}});
 expect(await response.text()).toContain('lang="pl"');
 const sitemap=await (await request.get("/sitemap.xml")).text();
 for(const locale of ["en","ru","uk"])expect(sitemap).toContain(`/${locale}/deals`);
 expect(sitemap).not.toContain("?origin=");
});
