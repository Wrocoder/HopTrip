import {publishedPageCount} from './seo-inventory';
import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {editorialCopy} from "../src/lib/i18n/editorial-copy";
import {priceGuide} from "../src/lib/i18n/price-guide";
import {priceDataGuides} from "../src/lib/i18n/price-data-guides";
import {scoreText} from "../src/lib/i18n/score-copy";
import {getInfoContent} from "../src/lib/content";
test.setTimeout(120000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("editorial index separates translated guides and labelled Polish material",async({page,request})=>{
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/info`);
  await expect(page.getByRole("heading",{level:1})).toHaveText(editorialCopy[locale].title);
  await expect(page.locator("main .deal-card")).toHaveCount(51);
  const polish=page.locator('main .deal-card[href="/info/one-way-round-trip"]');
  await expect(polish).toContainText(editorialCopy[locale].polish);
  await expect(polish.locator("h2")).toHaveAttribute("lang","pl");
  await page.locator(`main .deal-card[href="/${locale}/info/price-comparison"]`).click();
  await expect(page.getByRole("heading",{level:1})).toHaveText(priceGuide[locale].title);
  for(const section of priceGuide[locale].sections??[]){
   await expect(page.getByRole("heading",{name:section.title,exact:true})).toBeVisible();
   for(const paragraph of section.paragraphs)await expect(page.getByText(paragraph,{exact:true})).toBeVisible();
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100/${locale}/info/price-comparison`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('time[datetime="2026-09-27"]')).toBeVisible();
  await page.locator('main a[href="/info/one-way-round-trip"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang","pl");
 }
 const sitemap=await (await request.get("/sitemap.xml")).text();
 expect((sitemap.match(/<loc>/g)??[]).length).toBe(publishedPageCount);
 for(const locale of ["en","ru","uk"]){
  expect(sitemap).toContain(`/${locale}/info</loc>`);
  expect(sitemap).toContain(`/${locale}/info/price-comparison</loc>`);
  expect(sitemap).not.toContain(`/${locale}/info/one-way-round-trip`);
 }
 expect((await request.get("/ru/info/one-way-round-trip")).status()).toBe(404);
 expect((await request.get("/de/info")).status()).toBe(404);
});

test("translated score shows the same saved calculation and all uncertainty states",async({page},testInfo)=>{
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/deals/browser-deal`);
  await page.locator("#score .score-calculation summary").click();
  await expect(page.locator("#score .score-part")).toHaveCount(3);
  // The current fixture retains a three-hour observation: 14.1 freshness points.
  await expect(page.locator("#score .score-sum")).toContainText(locale==="en" ? "41.9 + 20 + 14.1 = 76" : "41,9 + 20 + 14,1 = 76");
  await expect(page.locator("#score .score-sum")).toContainText("76/100");
  await expect(page.locator("#score")).toContainText(scoreText(locale,"firstSeen"));
  await expect(page.locator('#score [lang="pl"]')).toHaveCount(0);
  await page.locator("#score details").last().locator("summary").click();
  await expect(page.locator("#score")).toContainText(scoreText(locale,"exclusions"));
  expect((await new AxeBuilder({page}).include("#score").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator("#score").screenshot({path:testInfo.outputPath(`score-${locale}.png`)});
  await page.locator("#score a.text-link").click();
  await expect(page.getByRole("heading",{level:1})).toHaveText(priceGuide[locale].title);
  await page.goto(`/${locale}/deals/browser-2`);
  await expect(page.locator("#score")).toContainText(scoreText(locale,"provisional"));
  await expect(page.locator("#score")).toContainText(scoreText(locale,"provisionalPrice"));
  await page.goto(`/${locale}/deals/browser-3`);
  await expect(page.locator("#score")).toContainText(scoreText(locale,"legacy"));
  await expect(page.locator("#score .score-part")).toHaveCount(5);
  await expect(page.locator("#score .score-sum")).toContainText(locale==="en" ? "68.05" : "68,05");
  await page.goto(`/${locale}/deals/browser-1`);
  await expect(page.locator("#score")).toContainText(scoreText(locale,"unavailable"));
  await expect(page.locator("#score .score-part")).toHaveCount(0);
 }
});

test("localized editorial index remains accessible at narrow widths",async({page},testInfo)=>{
 await page.setViewportSize({width:320,height:850});
 await page.goto("/uk/info");
 expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator(".page-heading").screenshot({path:testInfo.outputPath("editorial-uk.png")});
 await page.locator('.language-switcher a[lang="en"]').click();
 await expect(page.locator("html")).toHaveAttribute("lang","en");
 await expect(page.getByRole("heading",{level:1})).toHaveText(editorialCopy.en.title);
});

test("freshness and history articles preserve language, complete text and publication rules",async({page},testInfo)=>{
 for(const locale of ["en","ru","uk"] as const){
  await page.goto(`/${locale}/info`);
  await page.locator(`main a[href="/${locale}/info/price-freshness"]`).first().click();
  for(const slug of ["price-freshness","price-history"] as const){
   if(slug==="price-history")await page.locator(`main a[href="/${locale}/info/price-history"]`).first().click();
   const article=priceDataGuides[locale][slug];
   await expect(page.getByRole("heading",{level:1})).toHaveText(article.title);
   for(const paragraph of article.paragraphs)await expect(page.getByText(paragraph,{exact:true})).toBeVisible();
   for(const section of article.sections??[]){
    await expect(page.getByRole("heading",{name:section.title,exact:true})).toBeVisible();
    for(const paragraph of section.paragraphs)await expect(page.getByText(paragraph,{exact:true})).toBeVisible();
   }
   await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100/${locale}/info/${slug}`);
   await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
   await expect(page.locator(`time[datetime="${getInfoContent(slug)!.reviewedAt}"]`)).toBeVisible();
   if(slug==="price-freshness")await expect(page.locator("main p").filter({hasText:/6.*7.*24.*30.*48/})).toBeVisible();
   await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
   expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(locale==="ru")await page.getByRole("main").screenshot({path:testInfo.outputPath(`${slug}.png`)});
  }
  await page.locator(`main a[href="/${locale}/info/price-comparison"]`).first().click();
  await expect(page.getByRole("heading",{level:1})).toHaveText(priceGuide[locale].title);
 }
});
