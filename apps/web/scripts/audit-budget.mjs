import {chromium,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {writeFile} from "node:fs/promises";

const base=new URL(process.argv[2] ?? "https://hoptrip.pl").origin;
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL ?? "msedge"});
const report={base,checkedAt:new Date().toISOString(),checks:[],deals:[]};
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 expect((await page.goto(base)).status()).toBe(200);
 await expect(page.getByRole("navigation",{name:"Nawigacja główna"}).getByRole("link",{name:"Kalkulator budżetu",exact:true})).toBeVisible();
 await page.getByRole("link",{name:"Policz budżet podróży",exact:true}).click();
 await expect(page).toHaveURL(`${base}/info/trip-budget#calculator`);
 for(const [id,value] of Object.entries({flight:"300",baggage:"50",hotel:"200",transfers:"100",local_transport:"0",food:"40",activities:"30",other:"100"}))
  await page.locator(`#budget-${id}`).fill(value);
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*600,00\s*zł/);
 await expect(page.getByTestId("budget-person")).toHaveText(/800,00\s*zł/);
 report.checks.push("home CTA and navigation", "standalone budget: 1600 / 800 PLN");
 const response=await context.request.get(`${base}/api/v1/deals?limit=100`);
 expect(response.ok()).toBe(true);
 const deals=await response.json();
 const selected=[deals.find(d=>d.trip_type==="ROUND_TRIP"),deals.find(d=>d.trip_type==="ONE_WAY")].filter(Boolean);
 expect(selected.length).toBeGreaterThan(0);
 for(const deal of selected) {
  expect((await page.goto(`${base}/deals/${encodeURIComponent(deal.slug)}`)).status()).toBe(200);
  await page.getByRole("link",{name:"Policz budżet całej podróży",exact:true}).click();
  await expect(page.locator("#budget-flight")).toHaveValue(Number(deal.flight_price_pln).toFixed(2));
  await expect(page.locator("#budget-people")).toHaveValue("1");
  if(deal.trip_type==="ROUND_TRIP") {
   const nights=(Date.parse(deal.trip_end)-Date.parse(deal.trip_start))/86400000;
   await expect(page.locator("#budget-nights")).toHaveValue(String(nights));
   await expect(page.locator("#budget-days")).toHaveValue(String(nights+1));
  } else await expect(page.locator("#calculator")).toContainText("To lot w jedną stronę");
  await page.locator("#budget-hotel").fill("100");
  await expect(page.locator("#calculator").getByRole("status")).toContainText("Budżet niepełny");
  expect((await new AxeBuilder({page}).include("#calculator").include(".site-nav").analyze()).violations).toEqual([]);
  for(const width of [320,390,1280]) {
   await page.setViewportSize({width,height:844});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  report.deals.push({slug:deal.slug,type:deal.trip_type,flight:deal.flight_price_pln,accessibility:"passed",widths:[320,390,1280]});
 }
 await page.goto(base);
 for(const width of [320,390,1280]) {
  await page.setViewportSize({width,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 expect(errors).toEqual([]);
 report.checks.push("home and deal responsive widths", "no browser runtime errors");
 await writeFile("../../docs/budget-production-check-2026-10-05.json",JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
