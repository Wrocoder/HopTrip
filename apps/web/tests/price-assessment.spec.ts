import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("comparison, sample and observation stay visible while calculation is collapsed",async({page},testInfo)=>{
  await page.goto("/from/WRO");
  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-deal"]')});
  const summary=card.locator(".deal-card-link > .price-assessment");
  await expect(summary).toContainText("Cena 19,9% poniżej mediany porównywalnych obserwacji");
  await expect(summary).toContainText("Mediana: 250,00");
  await expect(summary).toContainText("Liczba obserwacji: 24");
  await expect(summary).toContainText("Pierwszy zapis tej ceny w HopTrip");
  await expect(summary).toContainText("Bez potwierdzenia na żywo");
  await expect(card.locator(".score-trigger")).toContainText("Ocena oferty cenowej: 69/100");
  await card.screenshot({path:testInfo.outputPath("price-card.png")});
  const observation=await summary.locator("time").getAttribute("datetime");
  await card.locator(".deal-card-link").click();
  await expect(page.locator(".detail-summary .price-assessment time")).toHaveAttribute("datetime",observation!);
  await expect(page.locator(".detail-summary .price-assessment")).toContainText("19,9% poniżej");
  const score=page.locator("#score");
  await expect(score.locator(".score-sum")).not.toBeVisible();
  await expect(score.getByRole("link",{name:/Pełna metodologia/})).toBeVisible();
  await score.locator(".score-calculation summary").focus();
  await page.keyboard.press("Enter");
  await expect(score.locator(".score-sum")).toBeVisible();
  await expect(score.locator(".score-sum")).toContainText("41,9 + 20 + 7,5 = 69,4");
  await page.keyboard.press("Enter");
  await expect(score.locator(".score-sum")).not.toBeVisible();
  expect((await new AxeBuilder({page}).include("#score").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await score.screenshot({path:testInfo.outputPath("price-explanation.png")});
});

test("insufficient and historical data never advertise a price advantage",async({page})=>{
  for(const [slug,label] of [["browser-2","Ocena wstępna"],["browser-3","poprzedniej metody"],["browser-1","Brak wiarygodnego porównania"]]) {
    await page.goto(`/deals/${slug}`);
    const summary=page.locator(".detail-summary .price-assessment");
    await expect(summary).toContainText(label);
    await expect(summary).not.toContainText(/%|poniżej mediany/);
    await expect(summary).toContainText("Brak wystarczającej");
    await expect(summary).toContainText("Bez potwierdzenia na żywo");
    await expect(page.locator("#score .score-sum")).not.toBeVisible();
  }
});
