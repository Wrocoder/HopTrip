import {test,expect} from "@playwright/test";
import {content,publishedInfoPages,relatedInfoPages} from "../src/lib/content";

const guides=[
 ["baggage","Bagaż: co naprawdę obejmuje cena biletu"],
 ["connections","Przesiadki: jedna rezerwacja czy osobne bilety"],
 ["booking-with-agents","Zakup biletu u pośrednika: co sprawdzić"],
 ["wro-airport","Wylot z Wrocławia: dojazd na WRO"],
 ["waw-airport","Lotnisko Chopina: dojazd i wylot z WAW"],
 ["wmi-airport","Warszawa-Modlin: jak zaplanować wylot z WMI"],
 ["krk-airport","Kraków Airport: pociąg, autobus i wylot z KRK"],
 ["gdn-airport","Gdańsk Airport: dojazd z Trójmiasta na GDN"],
 ["ktw-airport","Katowice Airport w Pyrzowicach: dojazd na KTW"],
 ["poz-airport","Poznań-Ławica: dojazd i powrót z POZ"],
 ["barcelona-airports","Barcelona: BCN, Girona czy Reus"],
 ["rome-airports","Rzym: Fiumicino i Ciampino bez pomyłki"],
 ["lisbon-airport","Lizbona: dojazd z LIS i powrót do terminala"],
 ["athens-airport","Ateny: z ATH do centrum czy do portu"],
 ["paris-airports","Paryż: CDG, Orly i Beauvais w jednym porównaniu"],
 ["london-airports","Londyn: sześć lotnisk i różne drogi do miasta"],
 ["milan-airports","Mediolan: Linate, Malpensa czy Bergamo"],
 ["budapest-airport","Budapeszt: 100E czy 200E z lotniska BUD"],
 ["madrid-airport","Madryt: terminal MAD, metro i dalsza podróż"],
 ["valencia-airport","Walencja: z VLC do centrum i nad morze"],
 ["alicante-airport","Alicante: autobus C6 i dalsza droga po Costa Blanca"],
 ["malaga-airport","Malaga: kolej C1, centrum i Costa del Sol"],
 ["porto-airport","Porto: metro E, Andante i ostatni odcinek do noclegu"],
 ["vienna-airport","Wiedeń: dojazd z VIE podczas zmian na kolei"],
 ["prague-airport","Praga: trolejbus 59 czy Airport Express"],
 ["amsterdam-airport","Amsterdam: Schiphol, pociąg i autobus 397"],
 ["copenhagen-airport","Kopenhaga: metro czy pociąg z CPH"],
 ["stockholm-airports","Sztokholm: Arlanda i Skavsta to różne transfery"],
] as const;

test("editorial registry has complete references and no links to drafts",()=>{
 expect(publishedInfoPages()).toHaveLength(35);
 for(const [slug,page] of publishedInfoPages()) {
  const links=relatedInfoPages(slug).map(item=>item.slug);
  expect(new Set(links).size).toBe(links.length);
  expect(links).not.toContain(slug);
  if(page.category==="airports") for(const key of ["baggage","connections","trip-budget"]) expect(links).toContain(key);
  for(const key of links) expect(content[key].draft).toBe(false);
 }
 for(const [slug] of guides) {
  const guide=content[slug];
  expect(guide.draft).toBe(false);
  expect(guide.description).toBeTruthy();
  expect(guide.sources?.length).toBeGreaterThanOrEqual(2);
  expect(guide.sources?.length).toBeLessThanOrEqual(3);
  expect(new Set(guide.sources?.map(source=>source.href)).size).toBe(guide.sources?.length);
  const referenced=new Set(guide.sections?.flatMap(section=>section.sourceIds ?? []));
  expect([...referenced].sort()).toEqual(guide.sources?.map((_,index)=>index));
  for(const source of guide.sources ?? []) expect(new URL(source.href).protocol).toBe("https:");
  for(const related of guide.related ?? []) {
   expect(Object.hasOwn(content,related)).toBe(true);
   expect(content[related].draft).toBe(false);
  }
  for(const route of guide.routes ?? []) expect(route.href).toMatch(/^\/(deals|from\/[A-Z]{3}|destinations\/[a-z-]+)$/);
 }
});

test("editorial index groups all 35 pages and sitemap excludes trust drafts",async({page,request})=>{
 await page.goto("/info");
 await expect(page.locator("main .deal-card")).toHaveCount(35);
 for(const [id,count] of [["method",5],["planning",5],["airports",7],["destinations",18]] as const) {
  await expect(page.locator(`#${id} .deal-card`)).toHaveCount(count);
 }
 const response=await request.get("/sitemap.xml");
 expect(response.ok()).toBe(true);
 const xml=await response.text();
 expect((xml.match(/<loc>/g) ?? []).length).toBe(37);
 for(const [slug,title] of guides) {
  await expect(page.locator(`main a[href="/info/${slug}"]`)).toContainText(title);
  expect(xml).toContain(`/info/${slug}</loc>`);
 }
 for(const slug of ["privacy","terms","contact"]) expect(xml).not.toContain(`/info/${slug}`);
 await page.getByRole("link",{name:"Lotniska wylotu w Polsce",exact:true}).click();
 await expect(page).toHaveURL(/#airports$/);
 await page.locator('a[href="/info/wro-airport"]').click();
 await page.getByRole("link",{name:"Loty z Wrocławia (WRO)",exact:true}).click();
 await expect(page).toHaveURL(/\/from\/WRO$/);
 await expect(page.locator(".deal-card").first()).toBeVisible();
});

for(const [slug,title] of guides) {
 test(`editorial page ${slug} has sources, metadata and narrow layout`,async({page})=>{
  await page.setViewportSize({width:320,height:740});
  const response=await page.goto(`/info/${slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading",{level:1})).toHaveText(title);
  await expect(page.locator("article time")).toHaveAttribute("datetime",content[slug].reviewedAt!);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3100/info/${slug}`);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content",title);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index, follow");
  await expect(page.getByRole("navigation",{name:"Powiązane trasy"})).toBeVisible();
  const sources=page.locator('article ul[aria-label^="Źródła:"] a');
  expect(await sources.count()).toBeGreaterThanOrEqual(2);
  for(const source of content[slug].sources ?? []) {
   await expect(sources.filter({hasText:source.label}).first()).toHaveAttribute("href",source.href);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
