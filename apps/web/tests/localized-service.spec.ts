import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {serviceContent,serviceLabels,serviceSlugs} from "../src/lib/i18n/service-content";
import {legalSourceUrls} from "../src/app/components/legal-sources";
import {shell} from "../src/lib/i18n/shell";

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  if(!localStorage.getItem("hoptrip.consent.v1"))localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:true,marketing:true,at:Date.now()}));
 });
});

test("service translations preserve content, metadata, operator privacy and accessible layout",async({page},testInfo)=>{
 test.setTimeout(120000);
 const drive:string[]=[];
 page.on("request",req=>{if(req.url().includes("emrld.ltd"))drive.push(req.url());});
 for(const locale of ["en","ru","uk"] as const){
  for(const slug of serviceSlugs){
   const translated=serviceContent(slug,locale),path=`/${locale}/info/${slug}`;
   const response=await page.goto(path);
   expect(response?.status()).toBe(200);
   const html=await response!.text();
   for(const value of ["Example Test Operator","Example Street","Test Country"])expect(html).not.toContain(value);
   await expect(page.locator("html")).toHaveAttribute("lang",locale);
   await expect(page.getByRole("heading",{level:1})).toHaveText(translated.title);
   for(const paragraph of translated.paragraphs)await expect(page.getByText(paragraph,{exact:true})).toBeVisible();
   for(const section of translated.sections??[]){
    await expect(page.getByRole("heading",{name:section.title,exact:true})).toBeVisible();
    for(const paragraph of section.paragraphs)await expect(page.getByText(paragraph,{exact:true})).toBeVisible();
   }
   if(slug==="privacy"){
    await expect(page.locator(".legal-sources a")).toHaveCount(legalSourceUrls.length);
    for(const href of legalSourceUrls)await expect(page.locator(`.legal-sources a[href="${href}"]`)).toHaveCount(1);
   }
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100${path}`);
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",translated.noindex ? "noindex, follow" : "index, follow");
   await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
   await expect(page.locator('link[hreflang="pl"]')).toHaveAttribute("href",`http://127.0.0.1:3100/info/${slug}`);
   await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(translated.noindex){
    const region=page.getByRole("region",{name:serviceLabels[locale].contact});
    await expect(region).toHaveAttribute("data-nosnippet");
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content",/contact@example/);
    await expect(region.getByRole("link")).toHaveAttribute("href","mailto:contact@example.test");
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content","no-referrer");
    await expect(page.getByRole("main")).not.toContainText("Example Test Operator");
    await expect(page.getByRole("main")).not.toContainText("Example Street");
    expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
    await page.getByRole("main").screenshot({path:testInfo.outputPath(`${slug}-${locale}.png`)});
   }
  }
 }
 expect(drive).toEqual([]);
});

test("consent and signup privacy links keep language and consent can still be withdrawn",async({page})=>{
 const events:string[]=[];
 page.on("request",req=>{if(req.url().includes("/analytics/events"))events.push(req.url());});
 await page.goto("/ru/alerts");
 await page.locator('.alert-panel a[href="/ru/info/privacy"]').click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Конфиденциальность");
 await page.getByRole("button",{name:shell.ru.settings,exact:true}).click();
 await page.locator(".consent-panel details").evaluate((element:HTMLDetailsElement)=>element.open=true);
 await expect(page.locator('.consent-panel a[href="/ru/info/privacy"]')).toBeVisible();
 await page.getByRole("button",{name:shell.ru.reject,exact:true}).click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("hoptrip.consent.v1")!));
 expect(stored.analytics).toBe(false);expect(stored.marketing).toBe(false);
 const count=events.length;
 await page.locator('.language-switcher a[lang="uk"]').click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Конфіденційність");
 await page.locator('main a[href="/uk/info/terms"]').click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Умови використання");
 expect(events).toHaveLength(count);
 await expect(page.locator("#travelpayouts-drive")).toHaveCount(0);
 await page.locator('.language-switcher a[lang="pl"]').click();
 await expect(page.locator("html")).toHaveAttribute("lang","pl");
 await expect(page.getByRole("heading",{level:1})).toHaveText("Zasady korzystania");
});

test("footer, language switches and legal links stay in the selected language",async({page,request})=>{
 await page.goto("/ru/deals");
 await page.locator('footer a[href="/ru/info/about"]').click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("О HopTrip");
 await page.locator('main a[href="/ru/info/contact"]').click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Контакты");
 await page.locator('.language-switcher a[lang="uk"]').click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Контакти");
 await page.locator('main a[href="/uk/info/privacy"]').click();
 await expect(page.locator("html")).toHaveAttribute("lang","uk");
 const sitemap=await (await request.get("/sitemap.xml")).text();
 expect((sitemap.match(/<loc>/g)??[]).length).toBe(85);
 for(const locale of ["en","ru","uk"]){
  for(const slug of ["about","partners"])expect(sitemap).toContain(`/${locale}/info/${slug}</loc>`);
  for(const slug of ["contact","privacy","terms"])expect(sitemap).not.toContain(`/${locale}/info/${slug}`);
 }
 for(const path of ["/ru/info/unknown","/de/info/about","/pl/info/contact"]){
  expect((await request.get(path)).status()).toBe(404);
 }
});
