import {test,expect} from "@playwright/test";

test("destination aliases and keyboard suggestions preserve filters and allow clearing",async({page},testInfo)=>{
 await page.goto("/deals?origin=WRO&budget=250&duration_min=3&duration_max=3");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 const destination=page.locator('input[name="destination"]');
 const submit=page.locator('form[aria-label="Filtry ofert"] button[type="submit"]');
 for(const value of ["milan","Milan"," MILAN ","Mediolan","MIL"]){
  await destination.fill(value);
  await submit.click();
  await expect(page).toHaveURL(/destination=milan/);
  await expect(destination).toHaveValue("Mediolan");
  const query=new URL(page.url()).searchParams;
  for(const [key,expected] of Object.entries({origin:"WRO",budget:"250",duration_min:"3",duration_max:"3"}))
   expect(query.get(key)).toBe(expected);
 }
 await destination.fill("Unknown city");
 await submit.click();
 await expect(page.getByRole("alert").filter({hasText:"Nie znaleziono kierunku"})).toBeVisible();
 await expect(destination).toBeFocused();
 await destination.fill("barc");
 await expect(page.getByRole("option",{name:"Barcelona (ES)"})).toBeVisible();
 await page.screenshot({path:testInfo.outputPath("destination-suggestions.png")});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 await destination.press("ArrowDown");
 await destination.press("Enter");
 await expect(destination).toHaveValue("Barcelona");
 await submit.click();
 await expect(page).toHaveURL(/destination=barcelona/);
 await expect(page.locator('.deal-card').first()).toBeVisible();
 await destination.fill("");
 await submit.click();
 await expect(page).not.toHaveURL(/destination=/);
 await expect(page).toHaveURL(/budget=250/);
 await page.goto("/deals?origin=WRO&destination=Milan&budget=250");
 await expect(destination).toHaveValue("Mediolan");
 await expect(page.getByRole("alert").filter({hasText:"Sprawdź lotnisko"})).toHaveCount(0);
 await page.goto("/deals?destination=unknown-city");
 await expect(page.getByRole("alert").filter({hasText:"Nie znaleziono kierunku"})).toBeVisible();
});
