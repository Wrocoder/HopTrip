import {test,expect} from "@playwright/test";

test("legal pages render runtime operator, remain noindex, and exclude Drive",async({page,request})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:true,at:Date.now()})));
 for(const slug of ["contact","privacy","terms"]) {
  const response=await page.goto(`/info/${slug}`);
  expect(response?.status()).toBe(200);
  const operator=page.getByRole("region",{name:"Dane operatora"});
  await expect(operator).toContainText("Example Test Operator");
  await expect(operator).toContainText("Example Street 1");
  await expect(operator.getByRole("link")).toHaveAttribute("href","mailto:contact@example.test");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content",/Example/);
  await expect(page.locator("#travelpayouts-drive")).toHaveCount(0);
  await expect(page.locator('article [role="note"]')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const sitemap=await (await request.get("/sitemap.xml")).text();
 for(const slug of ["contact","privacy","terms"]) {
  expect(sitemap).not.toContain(`/info/${slug}`);
  expect((await request.get(`/share/${slug}`)).status()).toBe(404);
 }
 expect(sitemap).not.toContain("Example");
 await page.goto("/info/baggage");
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
 await expect(page.locator("body")).not.toContainText("Example Test Operator");
 const robots=await (await request.get("/robots.txt")).text();
 expect(robots).toContain("Allow: /");
 expect(robots).not.toMatch(/Disallow: \/\s*(?:\n|$)/);
});
