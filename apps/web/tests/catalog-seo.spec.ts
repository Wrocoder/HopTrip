import {test,expect} from "@playwright/test";

test("only reviewed permanent catalog pages are indexable",async({page})=>{
 for(const [path,index] of [["/deals",true],["/from/WRO",true],["/destinations/milan",true],
  ["/destinations/barcelona",false],["/deals?origin=WRO&budget=200",false],["/deals?offset=12",false]] as const) {
  await page.goto(path);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",index?"index, follow":"noindex, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100${path}`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content",/\/preview\//);
 }
});
test("previews are real images and unavailable trips have no preview",async({request})=>{
 for(const path of ["site/home","catalog/deals","airport/WRO","destination/milan","deal/browser-deal"]) {
  const response=await request.get(`/preview/${path}`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const png=await response.body();
  expect(png.readUInt32BE(16)).toBe(1200);expect(png.readUInt32BE(20)).toBe(630);
 }
 for(const path of ["airport/XXX","destination/missing","deal/browser-14","deal/missing"])
  expect((await request.get(`/preview/${path}`)).status()).toBe(404);
});
