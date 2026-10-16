import {test,expect,type Page,type Locator} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach(async({request})=>{
 await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=normal");
});

async function noOverflow(page:Page) {
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
}
async function reachable(locator:Locator) {
 await locator.scrollIntoViewIfNeeded();
 expect(await locator.evaluate(node=>{
  const rect=node.getBoundingClientRect();
  const top=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
  return node===top || node.contains(top);
 })).toBe(true);
}

for(const width of [320,375,390,430,768,1366]) test(`complete journey at ${width}px`,async({page,context,request},testInfo)=>{
 test.skip((width===1366)!==(testInfo.project.name==="desktop"),"Desktop at 1366; touch emulation at other widths");
 test.setTimeout(90000);
 const screenshotPath=(name:string)=>process.env.HOPTRIP_UI04_CAPTURE
  ? `../../docs/htui04/${name}-${width}.png` : testInfo.outputPath(`${name}-${width}.png`);
 const activate=(target:Locator)=>testInfo.project.name==="mobile" ? target.tap() : target.click();
 const capture=async(name:string,target?:Locator)=>{
  await page.addStyleTag({content:"nextjs-portal {display:none}"});
  await page.evaluate(()=>document.fonts.ready);
  const path=screenshotPath(name);
  if(target)await target.screenshot({path,scale:"css"});
  else await page.screenshot({path,scale:"css"});
 };
 const fields=async(selector:string)=>{
  for(const input of await page.locator(selector).all()) {
   if(!await input.isVisible())continue;
   expect(await input.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
   expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
 };
 const height=width===375 ? 812 : width===1366 ? 900 : 844;
 await request.post("http://127.0.0.1:8100/__test__/compact-card?scenario=midnight");
 await page.addInitScript(()=>Object.defineProperty(navigator,"clipboard",{get(){throw new Error("blocked for fallback test");}}));
 await page.setViewportSize({width,height});
 await page.goto("/");
 await expect(page.locator(".consent-panel")).toBeVisible();
 await noOverflow(page);
 await capture("home-consent");
 const reject=page.getByRole("button",{name:"Odrzuć opcjonalne",exact:true});
 await reachable(reject);
 await reject.focus();await page.keyboard.press("Enter");
 await expect(page.locator(".consent-panel")).toHaveCount(0);
 const form=page.getByRole("form",{name:"Filtry ofert"});
 const origin=form.locator('[name="origin"]');
 await origin.fill("Wro");
 await capture("suggestions",form);
 await activate(form.getByRole("option",{name:"Wrocław — WRO",exact:true}));
 await expect(origin).toHaveValue(/Wrocław/);
 if(width===320)expect(await origin.evaluate((el:HTMLInputElement)=>{
  const style=getComputedStyle(el),context=document.createElement("canvas").getContext("2d")!;
  context.font=style.font;
  return context.measureText(el.value).width<=el.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
 })).toBe(true);
 const destination=form.locator('[name="destination"]');
 await destination.fill("NieistniejąceMiasto".repeat(10));
 await noOverflow(page);
 await form.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(destination).toBeFocused();
 await expect(form.getByRole("alert")).toContainText("Nie znaleziono kierunku");
 await expect(destination).toHaveAttribute("aria-invalid","true");
 await expect(destination).toHaveAccessibleDescription(/Nie znaleziono kierunku/);
 await destination.fill("Barcelona");await activate(form.getByRole("option",{name:/Barcelona/}));
 const summary=form.locator(".advanced-filters summary");
 await summary.focus();await page.keyboard.press("Space");
 await page.keyboard.press("Tab");
 await expect(form.locator('[name="departure_from"]')).toBeFocused();
 await form.locator('[name="departure_from"]').fill("2027-02-02");
 await form.locator('[name="departure_to"]').fill("2027-02-01");
 await form.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 const end=form.locator('[name="departure_to"]');
 await expect(end).toBeFocused();
 await expect(end).toHaveAttribute("aria-invalid","true");
 await expect(end).toHaveAccessibleDescription(/Koniec zakresu dat/);
 await form.locator('[name="departure_from"]').fill("");await end.fill("");
 await expect(end).toHaveAttribute("aria-invalid","false");
 await form.locator('[name="budget"]').fill("220");
 await form.getByRole("button",{name:"Szukaj lotów",exact:true}).click();
 await expect(page).toHaveURL(/origin=WRO/);
 await expect(page.locator(".deal-card")).toHaveCount(12);
 await noOverflow(page);
 await capture("catalog",page.locator(".filter-panel"));
 await fields(".filter-primary input, .sort-control select");
 await page.locator('[name="sort"]').selectOption("price");
 await expect(page).toHaveURL(/sort=price/);
 await page.getByRole("button",{name:"Loty do 300 zł",exact:true}).click();
 await expect(page).toHaveURL(/budget=300/);
 await page.getByRole("link",{name:/Usuń filtr: Budżet/}).click();
 await expect(page).not.toHaveURL(/budget=/);
 expect(new URL(page.url()).searchParams.get("origin")).toBe("WRO");
 await page.locator('input[name="budget"]').fill("1");
 await page.getByRole("button",{name:"Filtruj",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Brak aktualnych ofert"})).toBeVisible();
 await noOverflow(page);
 await page.getByRole("link",{name:/Usuń filtr: Budżet/}).click();
 const card=page.locator(".deal-card").filter({has:page.locator('a[href="/deals/browser-13"]')});
 if(await card.count()===0)await page.getByRole("link",{name:/Następ/}).click();
 await expect(card.locator(".home-arrival")).toContainText("+1 dzień");
 await capture("midnight",card);
 if(width===320) {
  const title=card.locator(".deal-card-link h2");
  const original=await title.textContent();
  await title.evaluate(el=>{el.textContent="Bardzo długa nazwa kierunku — Santiago de Compostela";});
  await noOverflow(page);
  await capture("long-name",card);
  await title.evaluate((el,text)=>{el.textContent=text;},original);
 }
 await activate(card.locator(".deal-card-link"));
 await expect(page.getByRole("heading",{level:1})).toContainText("Barcelona");
 await noOverflow(page);
 await capture("flight",page.locator(".detail-layout"));
 const nav=page.getByRole("navigation",{name:"Sekcje planu podróży"});
 await activate(nav.getByRole("link",{name:"Nocleg",exact:true}));
 await expect(page.locator("#accommodation")).toBeFocused();
 await page.locator("#stay-checkin").fill("2027-01-15");
 await page.locator("#stay-checkout").fill("2027-01-15");
 await expect(page.locator("#stay-dates-error")).toBeVisible();
 await reachable(page.locator("#stay-dates-error"));
 await page.locator("#stay-checkout").fill("2027-01-17");
 await page.locator("#stay-adults").fill("2");
 const params=new URL((await page.getByRole("link",{name:/przez Stay22/}).getAttribute("href"))!).searchParams;
 expect(Object.fromEntries(params)).toMatchObject({checkin:"2027-01-15",checkout:"2027-01-17",adults:"2",aid:"hoptrip",campaign:"hoptrip_accommodation"});
 await capture("stay",page.locator("#accommodation"));
 await activate(nav.getByRole("link",{name:"Lot",exact:true}));
 await expect(page.locator("#trip-flight")).toBeFocused();
 await activate(nav.getByRole("link",{name:"Budżet",exact:true}));
 await expect(page.locator("#calculator")).toBeFocused();
 const hotel=page.locator("#budget-hotel");
 await page.locator("#budget-food").fill("50");
 await page.locator("#budget-start").fill("2027-01-15");
 await page.locator("#budget-end").fill("2027-01-17");
 await hotel.fill("-1");
 await expect(hotel).toHaveAttribute("aria-invalid","true");
 await expect(page.getByTestId("budget-total")).toHaveCount(0);
 await hotel.fill("210,50");
 await expect(page.getByTestId("budget-total")).toBeVisible();
 // Reduced visual space approximates keyboard occlusion; it is not a native keyboard test.
 await page.setViewportSize({width,height:400});
 await hotel.focus();await reachable(hotel);
 await expect(hotel).toHaveAttribute("inputmode","decimal");
 await noOverflow(page);
 await page.setViewportSize({width,height});
 await fields('#calculator input:not([type="checkbox"]), #calculator select, #accommodation input');
 await capture("budget",page.locator("#calculator"));
 expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
 await activate(page.getByRole("button",{name:"Zapisz wyjazd",exact:true}));
 await page.reload();
 await expect(hotel).toHaveValue("210,50");
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*147,00/);
 await expect(page.locator("#calculator")).toContainText("Budżet niepełny");
 await activate(page.getByRole("button",{name:"Udostępnij",exact:true}));
 await expect(page.locator("#trip-save")).toContainText("Skopiuj link z pola");
 const share=page.locator("#trip-share-link");
 await reachable(share);
 await share.focus();
 expect(await share.evaluate((el:HTMLInputElement)=>el.selectionEnd!-el.selectionStart!)).toBe((await share.inputValue()).length);
 await capture("share-fallback",page.locator("#trip-save"));
 const copy=await context.newPage();
 await copy.setViewportSize({width,height});
 await copy.goto(await share.inputValue());
 await expect(copy.locator("#stay-adults")).toHaveValue("2");
 await expect(copy.locator("#stay-checkout")).toHaveValue("2027-01-17");
 await expect(copy.getByTestId("budget-total")).toHaveText(/1\s*147,00/);
 await noOverflow(copy);
 await copy.addStyleTag({content:"nextjs-portal {display:none}"});
 await copy.locator("#accommodation").screenshot({path:screenshotPath("copy-stay"),scale:"css"});
 await copy.close();
 await page.goto("/saved");
 await capture("saved");
 await noOverflow(page);
 await page.getByRole("main").getByRole("link",{name:/→/}).first().click();
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*147,00/);
 await page.goto("/deals/browser-deal");
 const timing=await page.evaluate(()=>{
  const n=performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  return {ttfbMs:n.responseStart,domContentLoadedMs:n.domContentLoadedEventEnd,transferBytes:n.transferSize};
 });
 await testInfo.attach(`local-dev-navigation-${width}`,{body:JSON.stringify(timing),contentType:"application/json"});
 await page.route("http://127.0.0.1:8100/go/**",async route=>{
  const response=await route.fetch({maxRedirects:0});expect(response.status()).toBe(307);
  expect(new URL(response.headers().location).host).toBe("partner.example");
  await route.fulfill({response,headers:{...response.headers(),location:"http://127.0.0.1:8100/__test__/partner"}});
 });
 const partner=page.getByRole("link",{name:"Sprawdź lot — Fixture program"});
 await reachable(partner);await partner.focus();await page.keyboard.press("Enter");
 await expect(page.getByText("Local partner fixture")).toBeVisible();
});
