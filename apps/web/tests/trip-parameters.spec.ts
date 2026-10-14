import {test,expect} from "@playwright/test";
import {emptyBudget} from "../src/lib/trip-budget";
import {encodeTrip} from "../src/lib/shared-trip";

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("one to two adults share stay dates, costs and saved search parameters",async({page})=>{
 await page.goto("/deals/browser-deal");
 const stay=page.getByRole("link",{name:/przez Stay22/});
 const flight=page.locator(".booking-card a.cta").first();
 const originalFlight=await flight.getAttribute("href");
 await expect(page.locator("#budget-people")).toHaveValue("1");
 await page.locator("#budget-people").fill("2");
 await page.locator("#budget-start").fill("2027-01-15");
 await page.locator("#budget-end").fill("2027-01-17");
 await page.locator("#budget-hotel-basis").selectOption("stay");
 await page.locator("#budget-hotel_total").fill("900");
 await expect(page.locator("#stay-adults")).toHaveValue("2");
 await expect(page.locator("#stay-checkin")).toHaveValue("2027-01-15");
 await page.locator("#stay-checkout").fill("2027-01-18");
 await expect(page.locator("#budget-end")).toHaveValue("2027-01-18");
 await expect(page.locator("#budget-nights")).toHaveValue("3");
 await expect(page.locator("#budget-hotel_total")).toHaveValue("900");
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*300,50/);
 await expect(page.getByTestId("budget-person")).toHaveText(/650,25/);
 await expect(page.getByTestId("budget-review")).toBeVisible();
 await expect(page.getByTestId("flight-search-limitation").first()).toContainText("2 dorosłych");
 await expect(flight).toHaveAttribute("href",originalFlight!);
 const checkLink=async()=>{
  const params=new URL((await stay.getAttribute("href"))!).searchParams;
  expect(Object.fromEntries(params)).toMatchObject({adults:"2",checkin:"2027-01-15",checkout:"2027-01-18",aid:"hoptrip",campaign:"hoptrip_accommodation"});
 };
 await checkLink();
 await page.reload();
 await checkLink();
 await page.getByRole("button",{name:"Zapisz wyjazd",exact:true}).click();
 await page.goto("/saved");
 await page.getByRole("main").getByRole("link",{name:/→/}).first().click();
 await expect(page.locator("#budget-people")).toHaveValue("2");
 await expect(page.locator("#budget-hotel_total")).toHaveValue("900");
 await checkLink();
 await page.reload();
 await checkLink();
});

test("old drafts and shared plans preserve people without declaring children adults",async({page})=>{
 const draft={version:1 as const,input:{...emptyBudget,people:"3",hotel:"123"},start:"2027-01-15",end:"2027-01-17",context:"old",review:false};
 await page.addInitScript(d=>localStorage.setItem("hoptrip.budget.v1:deal:browser-deal",JSON.stringify(d)),draft);
 await page.goto("/deals/browser-deal");
 await expect(page.locator("#budget-people")).toHaveValue("3");
 await expect(page.getByLabel("Wszyscy podróżni są dorośli")).not.toBeChecked();
 await expect(page.getByRole("link",{name:/przez Stay22/})).toHaveCount(0);
 await page.getByLabel("Wszyscy podróżni są dorośli").check();
 await expect(page.locator("#stay-adults")).toHaveValue("3");
 await page.getByLabel("Wszyscy podróżni są dorośli").uncheck();
 await expect(page.getByRole("link",{name:/przez Stay22/})).toHaveCount(0);
 const plan=encodeTrip({version:1,offer:{slug:"browser-deal",origin:"Wrocław",destination:"Barcelona",start:draft.start,end:draft.end,price:"200",observedAt:""},draft});
 await page.goto(`/trip?plan=${plan}`);
 await expect(page.locator("#budget-people")).toHaveValue("3");
 await expect(page.locator("#budget-hotel")).toHaveValue("123");
 await expect(page.getByLabel("Wszyscy podróżni są dorośli")).not.toBeChecked();
 await expect(page.getByRole("link",{name:/przez Stay22/})).toHaveCount(0);
});
