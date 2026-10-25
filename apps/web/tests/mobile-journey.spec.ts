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

for(const width of [320,375,390,430,768,1366]) test(`complete journey at ${width}px`,async({page,browser,request},testInfo)=>{
 test.skip((width===1366)!==(testInfo.project.name==="desktop"),"Desktop at 1366; touch emulation at other widths");
 test.setTimeout(120000);
 const eventName='Koncert z wyjątkowo długą nazwą — wieczór muzyki i specjalni goście z całej Europy';
 const venue='Sala koncertowa z bardzo długą nazwą w centrum miasta';
 const ticket=(id:string)=>`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2F${id}`;
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const query=new URL(route.request().url()).searchParams;
  return route.fulfill({json:{status:query.get('category')==='SPORTS'?'EMPTY':'READY',partial:false,checked_at:null,
   events:query.get('category')==='SPORTS'?[]:[{id:'mobile-event',name:eventName,venue,city:'Barcelona',category:'MUSIC',
    start_date:query.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:ticket('standard'),price_from:'50',currency:'EUR',
    ticket_options:[{id:'mobile-event',name:eventName,ticket_kind:'STANDARD',url:ticket('standard'),price_from:'50',currency:'EUR'},
     {id:'mobile-premium',name:eventName+' - Venue Premium Tickets',ticket_kind:'PREMIUM',url:ticket('premium'),price_from:'100',currency:'EUR'}]}]}});
 });
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
 await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content',/width=device-width/);
 expect(await page.locator('meta[name="viewport"]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:,|$)/);
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
 await activate(nav.getByRole('link',{name:'Wydarzenia',exact:true}));
 const events=page.locator('#trip-events');await expect(events).toBeFocused();
 await expect(events.getByLabel('Od',{exact:true})).toHaveValue('2027-01-15');
 await expect(events.getByLabel('Do',{exact:true})).toHaveValue('2027-01-17');
 await events.getByLabel('Kategoria').selectOption('SPORTS');
 await expect(events).toContainText('Pusta lista nie oznacza');
 await activate(events.getByRole('button',{name:'Pokaż wszystkie kategorie',exact:true}));
 await expect(events.getByRole('heading',{name:eventName,exact:true})).toBeVisible();
 await capture('events',events);
 await fields('#trip-events input, #trip-events select');
 await noOverflow(page);
 const add=events.getByRole('button',{name:`Dodaj do planu: ${eventName}`,exact:true});
 await reachable(add);await activate(add);
 const planned=page.locator('#planned-events');
 await expect(planned.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('');
 await expect(planned).toContainText('Cena nieznana');
 await planned.getByLabel('Liczba biletów').fill('2');
 const ticketPrice=planned.getByLabel('Cena jednego biletu (PLN)');
 await ticketPrice.fill('120,29');
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
 await ticketPrice.focus();await reachable(ticketPrice);
 await expect(ticketPrice).toHaveAttribute('inputmode','decimal');
 await expect(page.getByTestId('budget-total')).toHaveText(/1\s*387,58/);
 await page.setViewportSize({width,height});
 await fields('#calculator input:not([type="checkbox"]), #calculator select, #accommodation input');
 await capture("budget",page.locator("#calculator"));
 expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
 await activate(page.getByRole("button",{name:"Zapisz wyjazd",exact:true}));
 await page.reload();
 await expect(hotel).toHaveValue("210,50");
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*387,58/);
 await expect(planned.getByLabel('Liczba biletów')).toHaveValue('2');
 await expect(ticketPrice).toHaveValue('120,29');
 await expect(page.locator("#calculator")).toContainText("Budżet niepełny");
 await activate(page.getByRole("button",{name:"Udostępnij",exact:true}));
 await expect(page.locator("#trip-save")).toContainText("Skopiuj link z pola");
 const share=page.locator("#trip-share-link");
 await reachable(share);
 await share.focus();
 expect(await share.evaluate((el:HTMLInputElement)=>el.selectionEnd!-el.selectionStart!)).toBe((await share.inputValue()).length);
 await capture("share-fallback",page.locator("#trip-save"));
 const copyContext=await browser.newContext({viewport:{width,height},isMobile:testInfo.project.name==='mobile',hasTouch:testInfo.project.name==='mobile'});
 await copyContext.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const copy=await copyContext.newPage();
 await copy.goto(await share.inputValue());
 await expect(copy.locator("#stay-adults")).toHaveValue("2");
 await expect(copy.locator("#stay-checkout")).toHaveValue("2027-01-17");
 await expect(copy.getByTestId("budget-total")).toHaveText(/1\s*387,58/);
 await expect(copy.locator('#planned-events')).toContainText(eventName);
 await expect(copy.locator('#planned-events')).toContainText(venue);
 await expect(copy.locator('#planned-events').getByRole('link')).toHaveAttribute('href',ticket('standard'));
 await copy.locator('#planned-events').getByLabel('Liczba biletów').fill('3');
 await copy.reload();await expect(copy.getByTestId('budget-total')).toHaveText(/1\s*507,87/);
 await noOverflow(copy);
 await copy.addStyleTag({content:"nextjs-portal {display:none}"});
 await copy.locator("#accommodation").screenshot({path:screenshotPath("copy-stay"),scale:"css"});
 await copyContext.close();
 await page.goto("/saved");
 await capture("saved");
 await noOverflow(page);
 await page.getByRole("main").getByRole("link",{name:/→/}).first().click();
 await expect(page.getByTestId("budget-total")).toHaveText(/1\s*387,58/);
 await expect(page.locator('#planned-events').getByLabel('Liczba biletów')).toHaveValue('2');
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
