import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test("subscription preserves filters, confirms email, updates and stops",async({page,request})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto("/deals?origin=Wroc%C5%82aw&budget=230&duration_min=2&duration_max=4&destination=barcelona");
 await page.getByRole("link",{name:"Powiadom mnie o lotach"}).click();
 await expect(page.getByLabel("Lotnisko wylotu")).toHaveValue("WRO");
 await expect(page.getByLabel("Budżet na lot na osobę (PLN)")).toHaveValue("230");
 await expect(page.getByRole("combobox",{name:"Kierunek",exact:true})).toHaveValue("barcelona");
 await expect(page.getByRole("checkbox",{name:/Chcę otrzymywać/})).not.toBeChecked();
 const email=`browser-${crypto.randomUUID()}@example.test`;
 await page.getByLabel("Email",{exact:true}).fill(email);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include(".alert-panel").analyze()).violations).toEqual([]);
 await page.getByRole("checkbox",{name:/Chcę otrzymywać/}).check();
 await page.getByRole("button",{name:"Wyślij link potwierdzający"}).click();
 await expect(page.getByRole("status")).toContainText("Sprawdź skrzynkę");
 const messages=await (await request.get(`http://127.0.0.1:8100/__test__/mail?email=${encodeURIComponent(email)}`)).json();
 const confirm=messages[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0];
 await page.goto(confirm);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex, nofollow");
 await page.getByRole("button",{name:"Potwierdzam zapis"}).click();
 await page.getByRole("link",{name:"Zarządzaj alertem"}).click();
 await page.getByRole("button",{name:"Pokaż ustawienia"}).click();
 await page.getByLabel("Budżet na lot na osobę (PLN)").fill("220");
 await page.getByRole("button",{name:"Zapisz ustawienia"}).click();
 await expect(page.getByRole("status")).toHaveText("Zapisano ustawienia.");
 await page.getByRole("button",{name:"Wyłącz alert"}).click();
 await expect(page.getByRole("status")).toContainText("Alert wyłączony");
 await page.reload();
 await page.getByRole("button",{name:"Pokaż ustawienia"}).click();
 await expect(page.getByText("Ten alert jest wyłączony.")).toBeVisible();
 await expect(page.getByRole("button",{name:"Zapisz ustawienia"})).toHaveCount(0);
});

test("invalid confirmation does not report success",async({page})=>{
 await page.goto("/alerts/confirm#token="+"a".repeat(100));
 await page.getByRole("button",{name:"Potwierdzam zapis"}).click();
 await expect(page.getByRole("status")).toContainText("Link jest nieprawidłowy");
 await expect(page.getByRole("link",{name:"Zarządzaj alertem"})).toHaveCount(0);
});

test("email and capability pages never start tracking after saved consent",async({page})=>{
 await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:true,marketing:true,at:Date.now()})));
 const tracked:string[]=[];
 page.on("request",request=>{if(/emrld\.ltd|\/analytics\/events/.test(request.url()))tracked.push(request.url());});
 await page.goto("/alerts/manage#token="+"a".repeat(100));
 await page.getByRole("button",{name:"Pokaż ustawienia"}).click();
 await expect(page.getByRole("status")).toContainText("Link jest nieprawidłowy");
 expect(tracked).toEqual([]);
});
