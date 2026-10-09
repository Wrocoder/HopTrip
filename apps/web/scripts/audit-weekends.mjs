import {chromium,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {writeFile} from "node:fs/promises";

const base="https://hoptrip.pl";
const report={checkedAt:new Date().toISOString(),pages:[]};
const browser=await chromium.launch({channel:"msedge"});
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 const sitemap=await (await context.request.get(`${base}/sitemap.xml`)).text();
 expect((sitemap.match(/<loc>/g) ?? []).length).toBe(46);
 for(const city of ["malaga","alicante","prague"]) {
  const path=`/info/${city}-weekend`;
  expect((await page.goto(base+path)).status()).toBe(200);
  expect(sitemap).toContain(`${path}</loc>`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",base+path);
  const maps=page.getByRole("link",{name:/Mapa spaceru/});
  await expect(maps).toHaveCount(2);
  for(const href of await maps.evaluateAll(nodes=>nodes.map(n=>n.href))) {
   const url=new URL(href);
   expect(url.hostname).toBe("www.google.com");
   expect(url.searchParams.get("travelmode")).toBe("walking");
   expect(url.searchParams.get("origin")).toBeTruthy();
   expect(url.searchParams.get("destination")).toBeTruthy();
  }
  await page.locator('a[href="#destination-activities-title"]').click();
  await expect(page.locator("#destination-activities-title")).toBeInViewport();
  await expect(page.locator('a[href="/info/trip-budget#calculator"]')).toBeVisible();
  expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
  for(const width of [320,390,1280]) {
   await page.setViewportSize({width,height:844});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole("link",{name:"Dojazd z lotniska i transfer",exact:true}).click();
  await expect(page).toHaveURL(`${base}/info/${city}-airport`);
  await expect(page.getByRole("complementary",{name:"Transfer z lotniska"})).toBeVisible();
  await expect(page.locator(`a[href="${path}"]`)).toHaveCount(1);
  report.pages.push({path,maps:2,activitiesAnchor:true,airportAndTransfer:true,accessibility:"passed",widths:[320,390,1280]});
 }
 expect(errors).toEqual([]);
 report.sitemapUrls=46;
 report.browserErrors=errors;
 await writeFile("../../docs/weekends-production-check-2026-10-07.json",JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
