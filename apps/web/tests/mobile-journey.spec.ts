import {test,expect,type Page,type Locator} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function noOverflow(page:Page) {
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
}
async function reachable(locator:Locator) {
 await locator.scrollIntoViewIfNeeded();
 expect(await locator.evaluate(node=>{
  const rect=node.getBoundingClientRect();
  const top=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
  return node===top || node.contains(top);
 })).toBe(true);
}

for(const width of [360,390,768,1440]) test(`complete journey at ${width}px`,async({page},testInfo)=>{
 test.setTimeout(90000);
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 await expect(page.locator(".consent-panel")).toBeVisible();
 await noOverflow(page);
 await page.screenshot({path:testInfo.outputPath(`home-${width}.png`),fullPage:true});
 const reject=page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true});
 await reachable(reject);
 await reject.focus();await page.keyboard.press("Enter");
 await expect(page.locator(".consent-panel")).toHaveCount(0);
 const form=page.getByRole("form",{name:"Filtry ofert"});
 const origin=form.locator('[name="origin"]');
 await origin.fill("Wro");await page.keyboard.press("ArrowDown");await page.keyboard.press("Enter");
 await expect(origin).toHaveValue(/Wrocław/);
 const destination=form.locator('[name="destination"]');
 await destination.fill("NieistniejąceMiasto".repeat(10));
 await noOverflow(page);
 await form.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(destination).toBeFocused();
 await expect(form.getByRole("alert")).toContainText("Nie znaleziono kierunku");
 await expect(destination).toHaveAttribute("aria-invalid","true");
 await expect(destination).toHaveAccessibleDescription(/Nie znaleziono kierunku/);
 await destination.fill("Barcelona");await page.keyboard.press("ArrowDown");await page.keyboard.press("Enter");
 const summary=form.locator(".advanced-filters summary");
 await summary.focus();await page.keyboard.press("Space");
 await page.keyboard.press("Tab");
 await expect(form.locator('[name="departure_from"]')).toBeFocused();
 await form.locator('[name="departure_from"]').fill("2027-02-02");
 await form.locator('[name="departure_to"]').fill("2027-02-01");
 await form.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 const end=form.locator('[name="departure_to"]');
 await expect(end).toBeFocused();
 await expect(end).toHaveAttribute("aria-invalid","true");
 await expect(end).toHaveAccessibleDescription(/Koniec zakresu dat/);
 await form.locator('[name="departure_from"]').fill("");await end.fill("");
 await expect(end).toHaveAttribute("aria-invalid","false");
 await form.locator('[name="budget"]').fill("220");
 await form.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(page).toHaveURL(/origin=WRO/);
 await expect(page.locator(".deal-card")).toHaveCount(12);
 await noOverflow(page);
 await page.screenshot({path:testInfo.outputPath(`results-${width}.png`),fullPage:true});
 await page.locator('[name="sort"]').selectOption("price");
 await expect(page).toHaveURL(/sort=price/);
 await page.locator('a[href="/deals/browser-deal"]').click();
 await expect(page.getByRole("heading",{level:1})).toContainText("Barcelona");
 await noOverflow(page);
 await page.screenshot({path:testInfo.outputPath(`deal-${width}.png`),fullPage:true});
 const hotel=page.locator("#budget-hotel");
 await page.locator("#budget-start").fill("2027-01-15");
 await page.locator("#budget-end").fill("2027-01-17");
 await hotel.fill("-1");
 await expect(hotel).toHaveAttribute("aria-invalid","true");
 await expect(page.getByTestId("budget-total")).toHaveCount(0);
 await hotel.fill("210,50");
 await expect(page.getByTestId("budget-total")).toBeVisible();
 // Reduced visual space approximates keyboard occlusion; it is not a native keyboard test.
 await page.setViewportSize({width,height:400});
 await hotel.focus();await reachable(hotel);
 await expect(hotel).toHaveAttribute("inputmode","decimal");
 await noOverflow(page);
 await page.setViewportSize({width,height:900});
 await page.locator("#calculator").screenshot({path:testInfo.outputPath(`budget-${width}.png`)});
 expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
 await page.getByRole("button",{name:"Zapisz wyjazd",exact:true}).click();
 await page.reload();
 await expect(hotel).toHaveValue("210,50");
 const timing=await page.evaluate(()=>{
  const n=performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  return {ttfbMs:n.responseStart,domContentLoadedMs:n.domContentLoadedEventEnd,transferBytes:n.transferSize};
 });
 await testInfo.attach(`local-dev-navigation-${width}`,{body:JSON.stringify(timing),contentType:"application/json"});
 await page.route("http://127.0.0.1:8100/go/**",async route=>{
  const response=await route.fetch({maxRedirects:0});expect(response.status()).toBe(307);
  expect(new URL(response.headers().location).host).toBe("partner.example");
  await route.fulfill({response,headers:{...response.headers(),location:"http://127.0.0.1:8100/__test__/partner"}});
 });
 const partner=page.getByRole("link",{name:"Sprawdź lot — Fixture program"});
 await reachable(partner);await partner.focus();await page.keyboard.press("Enter");
 await expect(page.getByText("Local partner fixture")).toBeVisible();
});
