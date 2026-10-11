import {test,expect} from "@playwright/test";

test("trip presets combine, survive history and reload, validate dates and clear",async({page},testInfo)=>{
 await page.goto("/deals?origin=WRO&destination=barcelona&budget=250&duration_min=1&departure_from=2030-05-01&departure_to=2030-05-31");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 const weekend=page.getByRole("button",{name:"Na weekend",exact:true});
 const nights=page.getByRole("button",{name:"2–3 noce",exact:true});
 const budget=page.getByRole("button",{name:"Loty do 300 zł",exact:true});
 await nights.click();
 await expect(page).toHaveURL(/duration_min=2/);
 await expect(nights).toHaveAttribute("aria-pressed","true");
 await budget.click();
 await expect(page).toHaveURL(/budget=300/);
 await weekend.click();
 await expect(page).toHaveURL(/weekend=true/);
 for(const [key,value] of Object.entries({origin:"WRO",destination:"barcelona",budget:"300",duration_min:"2",duration_max:"3",departure_from:"2030-05-01",departure_to:"2030-05-31"}))
   expect(new URL(page.url()).searchParams.get(key)).toBe(value);
 await page.reload();
 await expect(weekend).toHaveAttribute("aria-pressed","true");
 await expect(page.locator('input[name="departure_to"]')).toHaveValue("2030-05-31");
 await page.screenshot({path:testInfo.outputPath("trip-presets.png"),fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 await weekend.click();
 await expect(page).not.toHaveURL(/weekend=/);
 await page.goBack();
 await expect(weekend).toHaveAttribute("aria-pressed","true");
 await expect(page.locator('input[name="budget"]')).toHaveValue("300");
 await nights.click();
 await expect(page).not.toHaveURL(/duration_min=|duration_max=/);
 await budget.click();
 await expect(page).not.toHaveURL(/budget=/);
 await expect(weekend).toHaveAttribute("aria-pressed","true");
 const from=page.locator('input[name="departure_from"]'),to=page.locator('input[name="departure_to"]');
 await from.fill("2030-06-01");
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect(page.getByRole("alert").filter({hasText:"Koniec zakresu dat"})).toBeVisible();
 await expect(to).toBeFocused();
 await expect(page).toHaveURL(/departure_from=2030-05-01/);
 await from.fill("2030-05-31");
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect(page).toHaveURL(/departure_from=2030-05-31/);
 await expect(page).toHaveURL(/weekend=true/);
 await page.getByRole("link",{name:"Wyczyść wszystkie filtry",exact:true}).click();
 await expect(page).toHaveURL(/\/deals$/);
 await expect(weekend).toHaveAttribute("aria-pressed","false");
 await expect(page.locator('.deal-card').first()).toBeVisible();
});

test("home presets carry the entered departure date into results",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await page.getByText("Daty i długość pobytu",{exact:true}).click();
 await page.locator('input[name="departure_from"]').fill("2030-05-01");
 await page.getByRole("button",{name:"Loty do 300 zł",exact:true}).click();
 await expect(page).toHaveURL(/\/deals\?/);
 await expect(page).toHaveURL(/budget=300/);
 await expect(page).toHaveURL(/departure_from=2030-05-01/);
});
