import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("trip details reveal comparison on demand without navigating or opening other cards",async({page},testInfo)=>{
  await page.goto("/from/WRO");
  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-deal"]')});
  const summary=card.locator(".trip-details .price-assessment");
  await expect(summary).not.toBeVisible();
  await expect(card.locator(".deal-price")).toBeVisible();
  await expect(card.locator(".price-summary")).toBeVisible();
  const cardComparison=await summary.locator(".price-comparison strong").textContent();
  const toggle=card.locator(".trip-details > summary");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(summary).toBeVisible();
  await expect(page).toHaveURL(/\/from\/WRO$/);
  await expect(page.locator(".deal-card .trip-details[open]")).toHaveCount(1);
  expect((await new AxeBuilder({page}).include(".deal-grid").analyze()).violations).toEqual([]);
  await page.keyboard.press("Enter");
  await expect(summary).not.toBeVisible();
  await toggle.click();
  await expect(summary).toContainText("Cena o 49,75 zł poniżej mediany próby");
  await expect(summary).toContainText("Mediana: 250,00");
  await expect(summary).toContainText("Liczba obserwacji: 24");
  await expect(summary).toContainText("Pierwszy zapis tej ceny w HopTrip");
  await expect(summary).toContainText("Bez potwierdzenia na żywo");
  const origin=card.locator('.trip-details .card-price-origin');
  await expect(origin).toBeVisible();
  await expect(origin).toContainText('czas w Polsce');
  await expect(origin.locator('time').first()).toHaveAttribute('datetime',/T.+(?:Z|[+-]\d{2}:\d{2})$/);
  await expect(card.locator(".score-trigger")).toContainText("Jak porównujemy cenę?");
  await card.screenshot({path:testInfo.outputPath("price-card.png")});
  const observation=await summary.locator("time").getAttribute("datetime");
  await card.locator(".deal-card-link").click();
  await expect(page.locator(".detail-summary .price-summary")).toContainText(cardComparison!);
  await expect(page.locator(".detail-summary .price-assessment")).toHaveCount(0);
  await page.evaluate(()=>{location.hash='score';});
  await expect(page.locator("#score .price-assessment time")).toHaveAttribute("datetime",observation!);
  await expect(page.locator("#score .price-assessment")).toContainText("49,75 zł poniżej");
  const score=page.locator("#score");
  await expect(score.locator(".score-sum")).not.toBeVisible();
  await expect(score.getByRole("link",{name:/Pełna metodologia/})).toBeVisible();
  await score.locator(".score-calculation summary").focus();
  await page.keyboard.press("Enter");
  await expect(score.locator(".score-sum")).toBeVisible();
  // The shared fixture now records a three-hour-old quote (14.1 freshness points).
  await expect(score.locator(".score-sum")).toContainText("41,9 + 20 + 14,1 = 76");
  await page.keyboard.press("Enter");
  await expect(score.locator(".score-sum")).not.toBeVisible();
  expect((await new AxeBuilder({page}).include("#score").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.setViewportSize({width:320,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await score.screenshot({path:testInfo.outputPath("price-explanation.png")});
});

test("insufficient and historical data never advertise a price advantage",async({page})=>{
  for(const [slug,label] of [["browser-2","Za mało danych"],["browser-3","poprzedniej metody"],["browser-1","Brak wiarygodnego porównania"]]) {
    await page.goto(`/deals/${slug}`);
    await page.evaluate(()=>{location.hash='score';});
    const summary=page.locator("#score .price-assessment");
    await expect(summary).toContainText(label);
    await expect(summary).not.toContainText(/%|poniżej mediany/);
    await expect(summary).toContainText("Brak wystarczającej");
    await expect(summary).toContainText("Bez potwierdzenia na żywo");
    await expect(page.locator("#score .score-sum")).not.toBeVisible();
  }
});

test("methodology explains the UTC cohort in every supported locale",async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:320,height:844});
  for(const [locale,phrase] of [["pl","Odstęp dni między wylotami"],["en","Days between departures"],
    ["ru","Дни между вылетами"],["uk","Дні між вильотами"]]){
    await page.goto(`${locale==="pl" ? "" : `/${locale}`}/info/price-comparison`);
    await expect(page.locator("html")).toHaveAttribute("lang",locale);
    await expect(page.getByRole("main")).toContainText(phrase);
    await expect(page.getByRole("main")).toContainText("UTC");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
});
