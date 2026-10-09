import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("grouped sessions keep their own prices, status and ticket links", async({page})=>{
  await page.goto("/deals/browser-deal");
  await page.getByRole("button",{name:"Odrzuć opcjonalne"}).click();
  const panel=page.getByRole("region",{name:"Wydarzenia w terminie podróży"});
  const start=await panel.getByLabel("Od",{exact:true}).inputValue();
  await panel.getByLabel("Do",{exact:true}).fill(start);
  await page.route("**/api/v1/deals/*/events?*",async route=>{
    const response=await route.fetch();
    const body=await response.json();
    const item=body.events[0];
    item.genre="Jazz";
    item.sessions=[{...item,local_time:"10:00:00"},{...item,id:"evening",local_time:"20:00:00",
      status:"offsale",price_from:"25",currency:"EUR",url:"https://www.ticketmaster.fr/event/evening"}];
    await route.fulfill({response,json:body});
  });
  await panel.getByRole("button",{name:"Pokaż wydarzenia"}).click();
  const card=panel.locator(".event-card").filter({has:page.getByRole("heading",{name:"Koncert nad morzem"})});
  await expect(card).toHaveCount(1);
  await expect(card.getByText("Terminy w wybranym okresie: 2")).toBeVisible();
  await expect(card.getByText("Rodzaj według dostawcy: Jazz")).toBeVisible();
  await expect(card.getByText("Cena do sprawdzenia u sprzedawcy")).toBeVisible();
  await expect(card.getByText(/Od 25,00/)).toBeVisible();
  await expect(card.getByRole("link",{name:/Sprawdź szczegóły.*20:00/})).toHaveAttribute("href","https://www.ticketmaster.fr/event/evening");
  expect((await new AxeBuilder({page}).include(".trip-events").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test("one-way events require dates, preserve flight price and link to separate products", async({page},testInfo)=>{
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/deals/browser-deal");
  await page.getByRole("button",{name:"Odrzuć opcjonalne"}).click();
  const panel=page.getByRole("region",{name:"Wydarzenia w terminie podróży"});
  await expect(panel).toBeVisible();
  await expect(panel.getByText(/Lot w jedną stronę/)).toBeVisible();
  await expect(panel.getByLabel("Do",{exact:true})).toHaveValue("");
  let queries=0;
  page.on("request",req=>{if(req.url().includes("/events?"))queries++;});
  await panel.getByRole("button",{name:"Pokaż wydarzenia"}).click();
  expect(queries).toBe(0);
  const start=await panel.getByLabel("Od",{exact:true}).inputValue();
  await panel.getByLabel("Do",{exact:true}).fill(start);
  await panel.getByRole("button",{name:"Pokaż wydarzenia"}).click();
  await expect(panel.getByRole("heading",{name:"Koncert nad morzem"})).toBeVisible();
  await expect(panel.getByRole("heading",{name:"Wystawa fotografii"})).toBeVisible();
  await expect(panel.getByText("Cena do sprawdzenia u sprzedawcy")).toBeVisible();
  await expect(panel.getByText(/Godzina do potwierdzenia/).first()).toBeVisible();
  await expect(panel.getByText(/Obejmuje dzień lotu do celu/).first()).toBeVisible();
  const links=panel.getByRole("link",{name:/Sprawdź daty i cenę/});
  expect(await links.nth(0).getAttribute("href")).not.toBe(await links.nth(1).getAttribute("href"));
  await expect(page.locator(".detail-summary .deal-price")).toContainText("200,25");
  const audit=await new AxeBuilder({page}).include(".trip-events").analyze();
  expect(audit.violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await panel.screenshot({path:testInfo.outputPath("events.png")});
  expect(await page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).toBeNull();
});

test("category changes clear previous results; empty source and failure keep flight booking usable", async({page})=>{
  await page.goto("/deals/browser-deal");
  await page.getByRole("button",{name:"Odrzuć opcjonalne"}).click();
  const panel=page.getByRole("region",{name:"Wydarzenia w terminie podróży"});
  await panel.getByLabel("Do",{exact:true}).fill(await panel.getByLabel("Od",{exact:true}).inputValue());
  await panel.getByLabel("Kategoria").selectOption("MUSIC");
  await panel.getByRole("button",{name:"Pokaż wydarzenia"}).click();
  await expect(panel.getByRole("heading",{name:"Koncert nad morzem"})).toBeVisible();
  await expect(panel.getByRole("heading",{name:"Wystawa fotografii"})).toHaveCount(0);
  await panel.getByLabel("Kategoria").selectOption("SPORTS");
  await expect(panel.getByRole("heading",{name:"Koncert nad morzem"})).toHaveCount(0);
  await panel.getByRole("button",{name:"Pokaż wydarzenia"}).click();
  await expect(panel.getByRole("status")).toContainText("Nie znaleźliśmy wydarzeń w tym źródle");
  await page.route("**/api/v1/deals/*/events?*",route=>route.fulfill({status:503,body:"unavailable"}));
  await panel.getByRole("button",{name:"Pokaż wydarzenia"}).click();
  await expect(panel.getByRole("status")).toContainText("Nie udało się pobrać wydarzeń");
  await expect(page.getByRole("link",{name:"Sprawdź ofertę u partnera"})).toBeVisible();
});
