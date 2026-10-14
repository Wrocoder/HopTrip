import {chromium,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {writeFile} from "node:fs/promises";

const base=new URL(process.argv[2] ?? "https://hoptrip.pl").origin;
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL ?? "msedge"});
const report={checkedAt:new Date().toISOString(),base,pages:[]};
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const page=await context.newPage();
 const partnerRequests=[],errors=[];
 page.on("request",request=>{if(/tpx\.gr|welcomepickups\.com/.test(new URL(request.url()).hostname)) partnerRequests.push(request.url());});
 page.on("pageerror",error=>errors.push(error.message));
 for(const [slug,href] of Object.entries({"malaga-airport":"https://tpx.gr/mTuIViB0","alicante-airport":"https://tpx.gr/gtneOoSO","prague-airport":"https://tpx.gr/YbMCDRFd"})) {
  expect((await page.goto(`${base}/info/${slug}`)).status()).toBe(200);
  const block=page.getByRole("complementary",{name:"Transfer z lotniska"});
  await expect(block).toBeVisible();
  const link=block.getByRole("link",{name:"Sprawdź transfer w Welcome Pickups (nowa karta)"});
  await expect(link).toHaveAttribute("href",href);
  await expect(link).toHaveAttribute("rel","sponsored noopener noreferrer");
  await expect(link).toHaveAttribute("target","_blank");
  await expect(block).toContainText("Link afiliacyjny");
  expect((await new AxeBuilder({page}).include('aside[aria-label="Transfer z lotniska"]').analyze()).violations).toEqual([]);
  for(const width of [320,390,1280]) {
   await page.setViewportSize({width,height:844});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.setViewportSize({width:390,height:844});
  if(slug==="malaga-airport") await block.screenshot({path:"../../docs/transfers-mobile-2026-10-05.png"});
  report.pages.push({slug,href,accessibility:"passed",widths:[320,390,1280]});
 }
 await page.goto(`${base}/info/wro-airport`);
 await expect(page.getByRole("complementary",{name:"Transfer z lotniska"})).toHaveCount(0);
 expect(partnerRequests).toEqual([]);
 expect(errors).toEqual([]);
 report.noPartnerRequestsOnLoad=true;
 report.noBrowserErrors=true;
 await writeFile("../../docs/transfers-production-check-2026-10-05.json",JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
