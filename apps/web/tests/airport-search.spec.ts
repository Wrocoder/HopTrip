import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("home airport suggestions support keyboard and preserve search filters",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("button",{name:"Szukaj lotów",exact:true})).toBeInViewport();
  const origin=page.getByRole("combobox",{name:"Skąd",exact:true});
  await origin.fill("wroclaw");
  await expect(page.getByRole("option",{name:"Wrocław — WRO",exact:true})).toBeVisible();
  await origin.press("ArrowDown");
  await origin.press("Enter");
  await expect(origin).toHaveValue("Wrocław — WRO");
  await expect(origin).toHaveAttribute("aria-expanded","false");
  await page.getByRole("spinbutton",{name:"Budżet na lot / osobę (PLN)",exact:true}).fill("220");
  await page.getByLabel("Wylot od",{exact:true}).fill("2026-01-01");
  await page.getByLabel("Wylot do",{exact:true}).fill("2099-12-31");
  await page.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
  await expect(page).toHaveURL(/origin=WRO/);
  await expect(page).toHaveURL(/departure_from=2026-01-01/);
  await expect(page).toHaveURL(/departure_to=2099-12-31/);
  await expect(page.locator(".deal-card")).toHaveCount(12);
  await expect(origin).toHaveValue("Wrocław — WRO");
  await expect(page.getByRole("spinbutton",{name:"Budżet na lot / osobę (PLN)",exact:true})).toHaveValue("220");
});

test("city, alias and IATA URLs show the same offers",async({page})=>{
  for(const value of ["WRO","wro","Wrocław","Wroclaw","  Wrocław  "]) {
    await page.goto(`/deals?origin=${encodeURIComponent(value)}&budget=220`);
    await expect(page.locator(".deal-card")).toHaveCount(12);
    await expect(page.getByRole("combobox",{name:"Skąd",exact:true})).toHaveValue("Wrocław — WRO");
  }
  await page.goto("/deals?origin=MissingCity&budget=220");
  await expect(page.getByRole("alert").first()).toContainText("Nie znaleziono lotniska");
  await expect(page.getByText("Brak aktualnych ofert",{exact:false})).toHaveCount(0);
});

test("editing a selected airport never submits a stale code",async({page})=>{
  await page.goto("/deals?origin=WRO&budget=220");
  const origin=page.getByRole("combobox",{name:"Skąd",exact:true});
  await origin.fill("MissingCity");
  await page.getByRole("button",{name:"Filtruj",exact:true}).click();
  await expect(page.getByRole("form",{name:"Filtry ofert"}).getByRole("alert")).toContainText("Nie znaleziono lotniska");
  await expect(origin).toBeFocused();
  await origin.fill("Wrocław");
  await origin.press("Escape");
  await expect(origin).toHaveAttribute("aria-expanded","false");
  await origin.press("Enter");
  await expect(page).toHaveURL(/origin=WRO/);
  await origin.fill("");
  await page.getByRole("button",{name:"Filtruj",exact:true}).click();
  await expect(page).not.toHaveURL(/origin=/);
  await expect(page).toHaveURL(/budget=220/);
});

test("home validates dates and remains accessible on a narrow screen",async({page},testInfo)=>{
  await page.goto("/");
  await page.getByLabel("Wylot od",{exact:true}).fill("2027-05-20");
  await page.getByLabel("Wylot do",{exact:true}).fill("2027-05-10");
  await page.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
  await expect(page.getByRole("form",{name:"Filtry ofert"}).getByRole("alert")).toContainText("Koniec zakresu dat");
  await expect(page.getByLabel("Wylot do",{exact:true})).toBeFocused();
  await page.getByLabel("Wylot do",{exact:true}).fill("2027-05-21");
  await page.getByRole("combobox",{name:"Skąd",exact:true}).fill("wro");
  await expect(page.getByRole("option",{name:"Wrocław — WRO",exact:true})).toBeVisible();
  const axe=await new AxeBuilder({page}).include(".hero-search").analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole("option",{name:"Wrocław — WRO",exact:true}).click();
  await expect(page.getByRole("combobox",{name:"Skąd",exact:true})).toHaveValue("Wrocław — WRO");
  await page.setViewportSize({width:320,height:740});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:testInfo.outputPath("home-search-320.png"),fullPage:true});
});
