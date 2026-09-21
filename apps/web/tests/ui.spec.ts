import {test,expect} from "@playwright/test";

test("UI keeps navigation, fonts and controls usable across viewport sizes",async({page},testInfo)=>{
 for(const [name,path] of [["home","/"],["catalog","/deals"],["deal","/deals/browser-deal"],["article","/info/price-comparison"],["empty","/deals?budget=1"]]) {
  await page.goto(path);
  await expect(page.locator("main[role='status']")).toHaveCount(0);
  await expect(page.locator("main")).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>Array.from(document.fonts).filter(font=>font.status==="loaded").length)).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  if(name==="deal" && testInfo.project.name==="mobile") {
   await expect(page.getByRole("link",{name:"Sprawdź ofertę u partnera"})).toBeInViewport();
  }
  await page.screenshot({path:testInfo.outputPath(`${name}.png`),fullPage:true});
 }
 await page.goto("/");
 await page.keyboard.press("Tab");
 await expect(page.getByRole("link",{name:"Przejdź do treści"})).toBeFocused();
 await page.keyboard.press("Enter");
 await expect(page.locator("#content")).toBeFocused();
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.getByRole("link",{name:"Aktualne okazje",exact:true}).last().hover();
 expect(await page.getByRole("link",{name:"Aktualne okazje",exact:true}).last().evaluate(el=>getComputedStyle(el).transform)).toBe("none");
 await page.setViewportSize({width:320,height:740});
 for(const path of ["/deals","/deals/browser-deal","/info/price-comparison"]) {
  await page.goto(path);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
 }
 await page.goto("/deals");
 await expect(page.getByRole("button",{name:"Filtruj",exact:true})).toBeVisible();
 await page.getByRole("spinbutton",{name:"Budżet na lot / osobę (PLN)",exact:true}).fill("1");
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect(page.getByText("Brak aktualnych ofert",{exact:false})).toBeVisible();
});

test("applied filter chips preserve other values and reset pagination",async({page},testInfo)=>{
 await page.goto("/deals?origin=WRO&budget=220&duration_min=3&duration_max=3&offset=12");
 await expect(page.locator(".advanced-filters")).toHaveAttribute("open","");
 await expect(page.locator(".deal-card")).toHaveCount(2);
 const budget=page.getByRole("spinbutton",{name:"Budżet na lot / osobę (PLN)",exact:true});
 await budget.fill("999");
 await page.getByRole("link",{name:"Usuń filtr: Pobyt od (dni): 3",exact:true}).click();
 await expect(page).not.toHaveURL(/offset=|duration_min=/);
 await expect(page).toHaveURL(/duration_max=3/);
 await expect(budget).toHaveValue("220");
 await expect(page.getByRole("textbox",{name:"Skąd",exact:true})).toHaveValue("WRO");
 await expect(page.locator(".deal-card")).toHaveCount(12);
 await page.getByRole("link",{name:"Wyczyść wszystkie filtry",exact:true}).click();
 await expect(page).toHaveURL("http://127.0.0.1:3100/deals");
 await expect(budget).toHaveValue("");
 await expect(page.locator(".advanced-filters")).not.toHaveAttribute("open","");
 await page.goBack();
 await expect(budget).toHaveValue("220");
 await expect(page.locator(".advanced-filters")).toHaveAttribute("open","");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:testInfo.outputPath("applied-filters.png"),fullPage:true});
});

test("advanced fields remain keyboard accessible and navigation shows current section",async({page})=>{
 await page.goto("/deals");
 const menu=page.getByRole("navigation",{name:"Nawigacja główna"});
 await expect(menu.getByRole("link",{name:"Aktualne okazje"})).toHaveAttribute("aria-current","page");
 const summary=page.locator(".advanced-filters summary");
 await summary.focus();
 await page.keyboard.press("Enter");
 const duration=page.getByRole("spinbutton",{name:"Pobyt od (dni)",exact:true});
 await expect(duration).toBeVisible();
 await duration.fill("-1");
 await summary.click();
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect(duration).toBeVisible();
 await expect(duration).toBeFocused();
 await duration.fill("3");
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect(page).toHaveURL(/duration_min=3/);
 await expect(page.locator(".advanced-filters")).toHaveAttribute("open","");
 for(const path of ["/from/WRO","/deals/browser-deal"]) {
  await page.goto(path);
  await expect(menu.getByRole("link",{name:"Aktualne okazje"})).toHaveAttribute("aria-current","location");
 }
 await menu.getByRole("link",{name:"Jak działa HopTrip"}).click();
 await expect(menu.getByRole("link",{name:"Jak działa HopTrip"})).toHaveAttribute("aria-current","page");
 await page.getByRole("link",{name:"Jak porównujemy ceny lotów",exact:false}).click();
 await expect(menu.getByRole("link",{name:"Jak działa HopTrip"})).toHaveAttribute("aria-current","location");
 await page.getByRole("link",{name:"HopTrip — strona główna"}).click();
 await expect(menu.locator("[aria-current]")).toHaveCount(0);
});
