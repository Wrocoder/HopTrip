import {test,expect} from "@playwright/test";

test("search funnel respects consent, validates payloads and categorizes partner clicks",async({page,context})=>{
 // Every external navigation is fulfilled locally: no real partner traffic.
 await context.route("https://**",route=>route.fulfill({body:"Local partner fixture",contentType:"text/html"}));
 const events:{event_name:string;search?:{filters:Record<string,string>;result_count?:number;error?:string};partner?:{category:string};deal_slug?:string;metadata?:Record<string,string>}[]=[];
 const statuses:number[]=[];
 page.on("response",response=>{
  if(response.url().endsWith("/analytics/events") && response.request().method()==="POST") {
   events.push(response.request().postDataJSON());statuses.push(response.status());
  }
 });
 await page.goto("/deals");
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 await page.getByRole("button",{name:"Loty do 300 zł",exact:true}).click();
 await expect(page).toHaveURL(/budget=300/);
 expect(events).toEqual([]);
 await page.goto("/deals?utm_source=newsletter&utm_campaign=private-token&email=private@example.com");
 await page.getByRole("button",{name:"Ustawienia prywatności",exact:true}).click();
 await page.getByRole("checkbox",{name:/Analityka HopTrip/}).check();
 await page.getByRole("button",{name:"Zapisz wybór",exact:true}).click();
 await expect.poll(()=>events.filter(e=>e.event_name==="SEARCH_RESULT").length).toBe(1);
 expect(events.find(e=>e.event_name==="SEARCH_RESULT")?.search?.result_count).toBe(12);
 await page.locator('input[name="budget"]').fill("1");
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect.poll(()=>events.some(e=>e.event_name==="SEARCH" && e.search?.filters.budget==="1")).toBeTruthy();
 await expect.poll(()=>events.some(e=>e.event_name==="SEARCH_RESULT" && e.search?.result_count===0)).toBeTruthy();
 await page.goto("/deals?destination=unknown-city");
 await expect.poll(()=>events.some(e=>e.search?.error==="invalid_filters")).toBeTruthy();
 await page.goto("/deals/browser-deal");
 await expect.poll(()=>events.filter(e=>e.event_name==="DEAL_VIEW" && e.deal_slug==="browser-deal").length).toBe(1);
 await page.locator('#stay-checkin').fill("2030-05-03");
 await page.locator('#stay-checkout').fill("2030-05-05");
 async function openPopup(link:ReturnType<typeof page.getByRole>) {
  const opened=page.waitForEvent("popup");await link.click();const popup=await opened;await popup.waitForLoadState();await popup.close();
 }
 await openPopup(page.getByRole("link",{name:"Znajdź nocleg przez Stay22 (nowa karta)",exact:true}));
 await openPopup(page.getByRole("link",{name:/Sprawdź daty i cenę w Tiqets: Casa/}));
 await expect.poll(()=>events.filter(e=>e.event_name==="PARTNER_CLICK").length).toBe(2);
 await page.locator('a.cta').click();
 await expect.poll(()=>events.some(e=>e.partner?.category==="flight")).toBeTruthy();
 expect(events.filter(e=>e.event_name==="PARTNER_CLICK").map(e=>e.partner?.category).sort()).toEqual(["activity","flight","stay"]);
 expect(statuses.every(s=>s===202)).toBeTruthy();
 expect(JSON.stringify(events)).not.toMatch(/private-token|private@example|email/);
 await page.goto("/deals/browser-deal");
 await page.getByRole("button",{name:"Ustawienia prywatności",exact:true}).click();
 await page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true}).click();
 const before=events.filter(e=>["SEARCH","SEARCH_RESULT","PARTNER_CLICK"].includes(e.event_name)).length;
 await openPopup(page.getByRole("link",{name:/Sprawdź daty i cenę w Tiqets: Casa/}));
 await page.goto("/deals");
 await page.getByRole("button",{name:"2–3 noce",exact:true}).click();
 await expect(page).toHaveURL(/duration_min=2/);
 expect(events.filter(e=>["SEARCH","SEARCH_RESULT","PARTNER_CLICK"].includes(e.event_name))).toHaveLength(before);
 expect(await page.evaluate(()=>localStorage.getItem("hoptrip.session.v2"))).toBeNull();
});
