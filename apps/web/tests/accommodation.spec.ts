import {test,expect} from "@playwright/test";

test("Stay22 lets travellers edit their stay before an attributed outbound click",async({page,context})=>{
 await page.goto("/deals/browser-deal");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Znajdź nocleg — Barcelona"})).toBeVisible();
 await page.getByLabel("Zameldowanie",{exact:true}).fill("2026-11-10");
 await page.getByLabel("Wymeldowanie",{exact:true}).fill("2026-11-10");
 const link=page.getByRole("link",{name:"Znajdź nocleg przez Stay22 (nowa karta)"});
 await expect(link).toHaveCount(0);
 await page.getByLabel("Wymeldowanie",{exact:true}).fill("2026-11-13");
 await page.getByLabel("Dorośli",{exact:true}).fill("2");
 await expect(link).toBeVisible();
 const url=new URL((await link.getAttribute("href"))!);
 expect(url.searchParams.get("aid")).toBe("hoptrip");
 expect(url.searchParams.get("address")).toBe("Barcelona");
 expect(url.searchParams.get("checkin")).toBe("2026-11-10");
 expect(url.searchParams.get("checkout")).toBe("2026-11-13");
 expect(url.searchParams.get("adults")).toBe("2");
 expect(url.searchParams.get("campaign")).toBe("hoptrip_accommodation");
 await expect(link).toHaveAttribute("rel","sponsored noopener noreferrer");
 await context.route("https://www.stay22.com/**",route=>route.fulfill({contentType:"text/html",body:"<h1>Stay22 test destination</h1>"}));
 const opened=context.waitForEvent("page");
 await link.click();
 const destination=await opened;
 await expect(destination.getByRole("heading")).toHaveText("Stay22 test destination");
 await destination.close();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});
