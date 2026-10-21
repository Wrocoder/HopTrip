import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {tripText} from "../src/lib/i18n/trip-copy";
import {shell} from "../src/lib/i18n/shell";
import {budgetText} from "../src/lib/i18n/budget-copy";
import {getMessages} from "../src/lib/i18n/messages";
import {encodeTrip,decodeTrip} from "../src/lib/shared-trip";
import {emptyBudget} from "../src/lib/trip-budget";
test.setTimeout(90000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("catalog to offer to saved plan keeps adults, money and partner parameters across languages",async({page,browser},testInfo)=>{
 const errors:string[]=[],events:string[]=[];
 page.on("pageerror",error=>errors.push(error.message));
 page.on("request",r=>{if(r.url().endsWith("/analytics/events"))events.push(r.url());});
 await page.goto("/en/deals?origin=WRO&sort=price");
 await page.locator(".deal-card-link").first().click();
 await expect(page).toHaveURL(/\/en\/deals\/browser-deal$/);
 const flight=page.locator(".booking-card a.cta").first();
 const flightHref=await flight.getAttribute("href");
 await page.locator("#budget-people").fill("2");
 await page.locator("#stay-checkin").fill("2090-01-15");
 await page.locator("#stay-checkout").fill("2090-01-18");
 await page.locator("#budget-hotel-basis").selectOption("stay");
 await page.locator("#budget-hotel_total").fill("900");
 await page.locator('.trip-navigation a[href="#calculator"]').click();
 let token="";
 for(const [locale,name] of [["en","English"],["ru","Русский"],["uk","Українська"],["pl","Polski"]] as const){
  if(locale!=="en")await page.locator(".language-switcher").getByRole("link",{name,exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  expect(new URL(page.url()).hash).toBe("#calculator");
  await expect(page.locator("#budget-people")).toHaveValue("2");
  await expect(page.locator("#stay-adults")).toHaveValue("2");
  await expect(page.locator("#budget-hotel_total")).toHaveValue("900");
  await expect(page.locator("#budget-nights")).toHaveValue("3");
  await expect(page.locator("#stay-checkout")).toHaveValue("2090-01-18");
  await expect(flight).toHaveAttribute("href",flightHref!);
  const href=await page.getByRole("link",{name:tripText(locale,"Znajdź nocleg przez Stay22 (nowa karta)"),exact:true}).getAttribute("href");
  expect(Object.fromEntries(new URL(href!).searchParams)).toMatchObject({address:"Barcelona",adults:"2",checkin:"2090-01-15",checkout:"2090-01-18",aid:"hoptrip",campaign:"hoptrip_accommodation"});
  await expect(page.getByTestId("flight-search-limitation")).toContainText("2");
  await page.getByRole("button",{name:tripText(locale,"Zapisz wyjazd"),exact:true}).click();
  await page.getByRole("button",{name:tripText(locale,"Udostępnij"),exact:true}).click();
  const url=new URL(await page.locator("#trip-share-link").inputValue());
  expect(url.pathname).toBe(locale==="pl" ? "/trip" : `/${locale}/trip`);
  if(token)expect(url.searchParams.get("plan")).toBe(token);
  token=url.searchParams.get("plan")!;
  expect(decodeTrip(token)!.draft.input.hotel_total).toBe("900");
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("hoptrip.saved-trips.v1")!))).toEqual([token]);
 }
 expect(events).toEqual([]);
 await page.goto("/ru/saved");
 const saved=page.getByRole("main").getByRole("link",{name:/→/});
 await expect(saved).toHaveCount(1);
 await expect(saved).toHaveAttribute("href",`/ru/trip?plan=${token}`);
 await saved.click();
 await expect(page.locator("#budget-hotel_total")).toHaveValue("900");
 await page.locator("#budget-hotel_total").fill("901");
 await page.locator(".language-switcher").getByRole("link",{name:"Українська",exact:true}).click();
 await expect(page.locator("#budget-hotel_total")).toHaveValue("901");
 expect(new URL(page.url()).searchParams.get("plan")).toBe(token);
 const recipient=await browser.newContext();
 try{
  const copy=await recipient.newPage();
  await copy.goto(new URL(`/uk/trip?plan=${token}`,page.url()).href);
  await expect(copy.locator("#budget-hotel_total")).toHaveValue("900");
  await expect(copy.locator("#budget-people")).toHaveValue("2");
 }finally{await recipient.close();}
 await page.goto("/uk/saved");
 await page.getByRole("button",{name:/Видалити план:/}).click();
 await expect(page.getByRole("main").getByRole("link",{name:/→/})).toHaveCount(0);
 await page.goto(`/uk/trip?plan=${token}`);
 await expect(page.locator("#budget-hotel_total")).toHaveValue("901");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath("localized-shared-trip.png")});
 expect(errors).toEqual([]);
});

test("old plans, missing offers and expired dates retain honest translated states",async({page})=>{
 const plan={version:1 as const,offer:{slug:"browser-deal",origin:"Wrocław",destination:"Mediolan",start:"2090-01-15",end:"2090-01-18",price:"260",observedAt:""},draft:{version:1 as const,input:{...emptyBudget,people:"3",hotel:"123"},start:"2090-01-15",end:"2090-01-18",context:"old",review:false}};
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/trip?plan=${encodeTrip(plan)}`);
  await expect(page.locator("#budget-people")).toHaveValue("3");
  await expect(page.locator("#budget-hotel")).toHaveValue("123");
  await expect(page.getByLabel(budgetText(locale,"Wszyscy podróżni są dorośli"))).not.toBeChecked();
  await expect(page.getByRole("link",{name:tripText(locale,"Znajdź nocleg przez Stay22 (nowa karta)")})).toHaveCount(0);
  await page.goto(`/${locale}/trip?plan=${encodeTrip({...plan,offer:{...plan.offer,slug:"missing-offer"}})}`);
  await expect(page.getByRole("status").first()).toContainText(tripText(locale,"Ta oferta nie jest już dostępna w katalogu. Zapisany plan i budżet pozostają dostępne."));
  await page.goto(`/${locale}/trip?plan=${encodeTrip({...plan,offer:{...plan.offer,start:"2020-01-15"}})}`);
  await expect(page.getByRole("status").first()).toContainText(tripText(locale,"Termin zapisanej oferty już minął. Zachowaliśmy plan i budżet; wybierz nowe daty i sprawdź ceny ponownie."));
  await page.goto(`/${locale}/trip?plan=broken`);
  await expect(page.getByRole("heading",{level:1})).toHaveText(tripText(locale,"Nie można odczytać planu"));
 }
});

test("flight detail languages expose local times, metadata, accessible controls and labelled Polish references",async({page},testInfo)=>{
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/deals/htr01-fixture`);
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  await expect(page.locator(".detail-summary .flight-schedule")).toContainText("00:40");
  await expect(page.locator(".detail-summary .home-arrival")).toContainText("25");
  await expect(page.locator(".detail-summary .home-arrival")).toContainText("+1");
  await expect(page.locator("#budget-nights")).toHaveValue("7");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100/${locale}/deals/htr01-fixture`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  await expect(page.locator("#score a.text-link")).toHaveAttribute("href",`/${locale}/info/price-comparison`);
  await expect(page.locator('#score [lang="pl"]')).toHaveCount(0);
  expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator(".detail-layout").screenshot({path:testInfo.outputPath(`detail-${locale}.png`)});
 }
});

test("localized storage failures still permit sharing and unavailable offers return translated 404",async({page,request})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked");}});
  Object.defineProperty(navigator,"clipboard",{get(){throw new Error("blocked");}});
 });
 await page.goto("/en/deals/browser-deal");
 await page.getByRole("button",{name:tripText("en","Zapisz wyjazd"),exact:true}).click();
 await expect(page.locator("#trip-save")).toContainText(tripText("en","Nie udało się zapisać wyjazdu w przeglądarce. Nadal możesz udostępnić link."));
 await page.getByRole("button",{name:tripText("en","Udostępnij"),exact:true}).click();
 await expect(page.locator("#trip-share-link")).toHaveValue(/\/en\/trip\?plan=/);
 await page.goto("/en/saved");
 await expect(page.getByRole("main")).toContainText(tripText("en","Pamięć przeglądarki jest niedostępna. Otrzymane linki nadal działają."));
 for(const locale of ["en","ru","uk"] as const){
  const response=await page.goto(`/${locale}/deals/missing-offer`);
  expect(response!.status()).toBe(404);
  await expect(page.getByRole("heading",{level:1})).toHaveText(getMessages(locale).notFound);
 }
 const sitemap=await (await request.get("/sitemap.xml")).text();
 expect(sitemap).not.toMatch(/\/(en|ru|uk)\/(trip|saved)(<|\/|\?)/);
 expect(sitemap).not.toContain("/en/deals/browser-deal");
 for(const path of ["/ua/saved","/de/trip","/pl/deals/browser-deal"])expect((await request.get(path)).status()).toBe(404);
});

test("localized partner clicks respect consent and never send the plan or budget to analytics",async({page,context})=>{
 await page.goto("/ru/deals/browser-deal");
 const outbound=page.locator(".booking-card a.cta").first();
 const initial=await outbound.getAttribute("href");
 const events:Record<string,unknown>[]=[];
 page.on("request",r=>{if(r.url().endsWith("/analytics/events"))events.push(r.postDataJSON());});
 await page.getByRole("button",{name:shell.ru.settings,exact:true}).click();
 await page.getByRole("checkbox",{name:shell.ru.analytics,exact:true}).check();
 await page.getByRole("button",{name:shell.ru.save,exact:true}).click();
 const budgetEvent=page.waitForRequest(r=>r.url().endsWith("/analytics/events") && r.postDataJSON()?.event_name==="BUDGET_USE");
 await page.locator("#budget-food").fill("52");
 await budgetEvent;
 await page.getByRole("button",{name:tripText("ru","Zapisz wyjazd"),exact:true}).click();
 await expect.poll(()=>events.filter(e=>e.event_name==="TRIP_SAVE").length).toBe(1);
 // Intercept the public redirect boundary; never visit a real seller.
 await context.route(initial!+"*",route=>route.fulfill({contentType:"text/html",body:"<h1>Test partner</h1>"}));
 await outbound.click();
 await expect(page.getByRole("heading")).toHaveText("Test partner");
 expect(new URL(page.url()).searchParams.has("session_id")).toBe(true);
 const click=events.find(e=>e.event_name==="PARTNER_CLICK");
 expect(click).toMatchObject({partner:{category:"flight",provider:"catalog"},metadata:{page_type:"deal"}});
 for(const event of events){
  const serialized=JSON.stringify(event);
  expect(serialized).not.toMatch(/plan=|hotel_total|budget-food|trip-share-link/);
 }
});
