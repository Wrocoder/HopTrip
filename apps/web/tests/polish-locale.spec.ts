import {test,expect} from "@playwright/test";

test("Polish city labels, landing links, dates and calculator remain consistent",async({page},testInfo)=>{
 await page.goto("/");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 const milan=page.getByRole("link",{name:"Mediolan",exact:true});
 await expect(milan).toHaveAttribute("href","/destinations/milan");
 await milan.click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("Mediolan");
 await expect(page).toHaveTitle(/Mediolanu/);
 await page.goto("/from/WRO");
 await expect(page.getByRole("heading",{level:1})).toHaveText("Loty z Wrocławia (WRO)");
 const card=page.locator('.deal-card').first();
 await expect(card.locator('.deal-origin')).toContainText("Wrocław (WRO)");
 await expect(card.locator('.deal-dates')).toContainText(/(?:pon|wt|śr|czw|pt|sob|niedz)\./);
 await expect(card.locator('.deal-price')).toContainText(/\d+,\d{2}\s*zł/);
 await card.locator('.deal-card-link').click();
 await expect(page.getByRole("heading",{level:1})).toContainText("Wrocław (WRO) → Barcelona");
 await expect(page.getByRole("heading",{name:"Znajdź nocleg — Barcelona"})).toBeVisible();
 await page.locator('#budget-flight').fill("123,45");
 // One-way offers have no return date: complete the optional stay before calculating.
 await expect(page.getByTestId('budget-total')).toHaveCount(0);
 await page.locator('#budget-end').fill(await page.locator('#budget-start').inputValue());
 await expect(page.getByTestId('budget-total')).toContainText(/123,45\s*zł/);
 await page.locator("#calculator").screenshot({path:testInfo.outputPath("polish-calculator.png")});
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:testInfo.outputPath("polish-detail.png")});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.goto("/deals?origin=WRO&destination=milan&budget=300&departure_from=2030-05-03");
 const chips=page.getByRole("navigation",{name:"Zastosowane filtry"});
 await expect(chips).toContainText("Mediolan");
 await expect(chips).toContainText(/300,00\s*zł/);
 await expect(chips).toContainText(/pt\./);
 await expect(page).toHaveURL(/destination=milan/);
});
