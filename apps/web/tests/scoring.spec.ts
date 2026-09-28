import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("score explains exact points without navigating and restores focus",async({page},testInfo)=>{
  await page.goto("/from/WRO");
  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-deal"]')});
  const trigger=card.getByRole("link",{name:/Wyjaśnij ocenę/});
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog=page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/from\/WRO$/);
  await expect(dialog.locator(".score-part")).toHaveCount(3);
  await expect(dialog.locator(".score-sum")).toContainText("41,9 + 20 + 7,5 = 69,4");
  await expect(dialog.locator(".score-sum")).toContainText("69/100");
  await expect(dialog).toContainText("200,25");
  await expect(dialog).toContainText("250,00");
  await expect(dialog).toContainText("pierwszego zapisania");
  await expect(dialog.getByRole("button",{name:"Zamknij wyjaśnienie oceny"})).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(()=>!!document.activeElement?.closest("dialog"))).toBeTruthy();
  await dialog.locator("summary").click();
  await expect(dialog).toContainText("Prowizja partnerska nie wpływa");
  await expect(dialog.getByRole("button",{name:"Zamknij wyjaśnienie oceny"})).toBeInViewport();
  expect((await new AxeBuilder({page}).include("dialog[open]").analyze()).violations).toEqual([]);
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();
  await dialog.evaluate(el=>{el.scrollTop=0;});
  await page.screenshot({path:testInfo.outputPath("score-explanation.png")});
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe("hidden");
  await trigger.click();
  await page.getByRole("button",{name:"Zamknij wyjaśnienie oceny"}).click();
  await expect(dialog).not.toBeVisible();
  await card.locator(".deal-card-link").click();
  await expect(page).toHaveURL(/\/deals\/browser-deal$/);
  await expect(page.locator("#score .score-sum")).toContainText("69/100");
});

test("provisional, legacy and missing explanations stay honest",async({page})=>{
  await page.goto("/deals/browser-2");
  await expect(page.locator("#score")).toContainText("Ocena wstępna — mało danych");
  await expect(page.locator("#score")).toContainText("neutralne 30 z 60 pkt");
  await page.goto("/deals/browser-3");
  await expect(page.locator("#score")).toContainText("Poprzednia metoda");
  await expect(page.locator("#score .score-part")).toHaveCount(5);
  await expect(page.locator("#score .score-sum")).toContainText("68,05");
  await page.goto("/deals/browser-1");
  await expect(page.locator("#score")).toContainText("Nie możemy rzetelnie odtworzyć punktów");
  await expect(page.locator("#score .score-part")).toHaveCount(0);
});

test("score link can open the full explanation in a separate tab",async({page,context})=>{
  await page.goto("/from/WRO");
  const opened=context.waitForEvent("page");
  await page.locator('a.score-trigger[href="/deals/browser-deal#score"]').click({modifiers:["Control"]});
  const detail=await opened;
  await expect(detail).toHaveURL(/\/deals\/browser-deal#score$/);
  await expect(detail.locator("#score .score-sum")).toContainText("69/100");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await detail.close();
});
