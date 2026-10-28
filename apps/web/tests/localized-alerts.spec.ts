import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {alertText,type AlertKey} from "../src/lib/i18n/alert-copy";

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:true,marketing:true,at:Date.now()})));
});

test("localized signup, confirmation and management preserve contracts and private tokens",async({page,request},testInfo)=>{
 test.setTimeout(120000);
 for(const locale of ["en","ru","uk"] as const){
  const t=(key:AlertKey)=>alertText(locale,key);
  const events:{event_name:string}[]=[];
  await page.route("**/api/v1/analytics/events",route=>{events.push(route.request().postDataJSON());return route.fulfill({status:200,json:{ok:true}});});
  const external:string[]=[];
  page.on("request",req=>{if(req.url().includes("emrld.ltd"))external.push(req.url());});
  await page.goto(`/${locale}/alerts?origin=WRO&budget=230&duration_min=2&duration_max=4&destination=barcelona&weekend=true`);
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  await expect(page.getByLabel(t("Lotnisko wylotu"))).toHaveValue("WRO");
  await expect(page.getByLabel(t("Budżet na lot na osobę (PLN)"))).toHaveValue("230");
  await expect(page.getByText(t("Wiadomości email są obecnie dostępne po polsku. Język strony nie zmienia języka wiadomości."))).toBeVisible();
  await expect(page.locator('input[name="consent"]')).not.toBeChecked();
  const email=`localized-${crypto.randomUUID()}@example.test`;
  await page.getByLabel("Email",{exact:true}).fill(email);
  await page.locator('input[name="consent"]').check();
  const sent=page.waitForRequest(req=>req.url().endsWith("/api/v1/alerts") && req.method()==="POST");
  await page.getByRole("button",{name:t("Wyślij link potwierdzający")}).click();
  expect((await sent).postDataJSON()).toEqual({email,consent:true,filters:{origin:"WRO",budget:"230",duration_min:2,duration_max:4,destination:"barcelona",departure_from:null,departure_to:null,weekend:true,frequency:"weekly"}});
  await expect(page.getByRole("status")).toContainText(t("Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Prośba o zapis nie oznacza potwierdzonej subskrypcji. Link wysyłamy najwyżej raz na dobę."));
  expect(events).toEqual([]);
  const mails=await (await request.get(`http://127.0.0.1:8100/__test__/mail?email=${encodeURIComponent(email)}`)).json();
  const confirm=new URL(mails[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0]);
  // Emails keep their existing Polish URLs; users can switch language without losing the capability.
  await page.goto(confirm.href);
  await page.locator(`.language-switcher a[lang="${locale}"]`).click();
  expect(new URL(page.url()).hash).toBe(confirm.hash);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex, nofollow");
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content","no-referrer");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100/${locale}/alerts/confirm`);
  expect(events).toEqual([]);
  await page.getByRole("button",{name:t("Potwierdzam zapis")}).click();
  await expect(page.getByRole("status")).toHaveText(t("Alert został potwierdzony."));
  await expect.poll(()=>events.length).toBe(1);
  expect(events[0].event_name).toBe("ALERT_CONFIRMED");
  expect(JSON.stringify(events)).not.toContain(email);
  expect(JSON.stringify(events)).not.toContain(confirm.hash.slice(7));
  await page.getByRole("link",{name:t("Zarządzaj alertem")}).click();
  expect(new URL(page.url()).pathname).toBe(`/${locale}/alerts/manage`);
  await page.getByRole("button",{name:t("Pokaż ustawienia")}).click();
  await page.getByLabel(t("Budżet na lot na osobę (PLN)")).fill("220");
  await page.getByLabel(t("Częstotliwość")).selectOption("daily");
  await page.getByRole("button",{name:t("Zapisz ustawienia")}).click();
  await expect(page.getByRole("status")).toHaveText(t("Zapisano ustawienia."));
  await page.reload();
  await page.getByRole("button",{name:t("Pokaż ustawienia")}).click();
  await expect(page.getByLabel(t("Częstotliwość"))).toHaveValue("daily");
  await expect(page.getByLabel(t("Budżet na lot na osobę (PLN)"))).toHaveValue("220");
  expect((await new AxeBuilder({page}).include(".alert-panel").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator(".alert-panel").screenshot({path:testInfo.outputPath(`alerts-${locale}.png`)});
  await page.getByRole("button",{name:t("Wyłącz alert")}).click();
  await expect(page.getByText(t("Ten alert jest wyłączony."))).toBeVisible();
  expect(events).toHaveLength(1);
  expect(external).toEqual([]);
 }
});

test("localized errors never confirm a subscription and disabled signup stays honest",async({page,request})=>{
 test.setTimeout(90000);
 for(const locale of ["en","ru","uk"] as const){
  const t=(key:AlertKey)=>alertText(locale,key);
  for(const [status,key] of [[404,"Link jest nieprawidłowy lub wygasł."],[410,"Link wygasł. Zapisz się ponownie, aby otrzymać nowy."],[422,"Sprawdź lotnisko, email i zakres dat oraz długości pobytu."],[429,"Limit prób został osiągnięty. Spróbuj później."],[503,"Nie udało się wykonać operacji. Spróbuj ponownie później."]] as const){
   await page.route("**/api/v1/alerts/confirm",route=>route.fulfill({status,json:{detail:"internal failure"}}));
   await page.goto(`/${locale}/alerts/confirm#token=invalid`);
   await page.getByRole("button",{name:t("Potwierdzam zapis")}).click();
   await expect(page.getByRole("status")).toHaveText(t(key));
   await expect(page.getByRole("link",{name:t("Zarządzaj alertem")})).toHaveCount(0);
  }
  await request.post("http://127.0.0.1:8100/__test__/alerts-enabled?enabled=false");
  try {
   await page.goto(`/${locale}/alerts`);
   await expect(page.getByRole("main")).toContainText(t("Zapisy na alerty są obecnie niedostępne. Sprawdź aktualne loty w"));
   await expect(page.getByLabel("Email",{exact:true})).toHaveCount(0);
   await expect(page.getByRole("main").getByRole("link",{name:t("katalogu ofert")})).toHaveAttribute("href",`/${locale}/deals`);
  } finally {await request.post("http://127.0.0.1:8100/__test__/alerts-enabled?enabled=true");}
 }
});

test("catalog filters, locale switches and private route SEO stay consistent",async({page,request})=>{
 await page.goto("/ru/deals?origin=WRO&budget=1&duration_min=2&duration_max=4");
 await page.locator('main a[href^="/ru/alerts?"]').click();
 await expect(page).toHaveURL(/\/ru\/alerts\?/);
 await expect(page.getByLabel(alertText("ru","Lotnisko wylotu"))).toHaveValue("WRO");
 await page.locator('.language-switcher a[lang="uk"]').click();
 await expect(page.getByLabel(alertText("uk","Lotnisko wylotu"))).toHaveValue("WRO");
 await expect(page.getByLabel(alertText("uk","Budżet na lot na osobę (PLN)"))).toHaveValue("1");
 await expect(page.getByLabel(alertText("uk","Minimum nocy"))).toHaveValue("2");
 await expect(page.getByLabel(alertText("uk","Maksimum nocy"))).toHaveValue("4");
 const sitemap=await (await request.get("/sitemap.xml")).text();
 expect(sitemap).not.toContain("/alerts");
 expect((await request.get("/ru/alerts/unknown")).status()).toBe(404);
 expect((await request.get("/de/alerts")).status()).toBe(404);
});
