import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {activitySelections,activitiesForDestination} from "../src/lib/destination-activities";
import {destinationForGuide} from "../src/lib/guide-destinations";
import {publishedInfoPages} from "../src/lib/content";

test("published city guides have matching activity selections",()=>{
  const matched=publishedInfoPages().filter(([slug])=>destinationForGuide(slug));
  expect(matched).toHaveLength(21);
  for(const [slug] of matched) expect(activitiesForDestination(destinationForGuide(slug)!.slug)).toBeDefined();
  for(const slug of ["privacy","trip-budget","wro-airport","amsterdam-airport"]) expect(destinationForGuide(slug)).toBeUndefined();
});

for(const [guide,city,id,kind] of [
  ["barcelona-airports","barcelona","tiqets-973672","affiliate"],
  ["oslo-weekend","oslo","official-oslo","official"],
] as const) {
  test(`guide ${guide}: native links work and tracking follows consent`,async({page,context})=>{
    // Fulfil external navigation locally; never generate real partner clicks in tests.
    await context.route(/https:\/\/(tiqets\.tpx\.gr|tp\.media|frammuseum\.no)\//,route=>route.fulfill({body:"Local destination fixture",contentType:"text/html"}));
    const events:Record<string,unknown>[]=[];
    page.on("request",request=>{
      if(request.url().endsWith("/analytics/events") && request.method()==="POST") {
        const payload=request.postDataJSON();
        if(payload.event_name==="ACTIVITY_CLICK") events.push(payload);
      }
    });
    await page.goto(`/info/${guide}?private_parameter=discard`);
    await page.getByRole("button",{name:"Odrzuć opcjonalne"}).click();
    const panel=page.getByRole("region",{name:"Muzea i atrakcje"});
    const link=panel.getByRole("link").first();
    async function openLink() {
      const popupPromise=page.waitForEvent("popup");
      await link.click();
      const popup=await popupPromise;
      await popup.waitForLoadState();
      await popup.close();
    }
    await openLink();
    expect(events).toEqual([]);
    await page.getByRole("button",{name:"Ustawienia prywatności"}).click();
    await page.getByRole("checkbox",{name:/Analityka HopTrip/}).check();
    await page.getByRole("button",{name:"Zapisz wybór"}).click();
    const accepted=page.waitForResponse(response=>response.url().endsWith("/analytics/events") && response.request().postDataJSON()?.event_name==="ACTIVITY_CLICK");
    await openLink();
    expect((await accepted).status()).toBe(202);
    expect(events).toHaveLength(1);
    expect(events[0].activity).toEqual({city,activity_id:id,page:`/info/${guide}`,link_kind:kind});
    expect(JSON.stringify(events)).not.toContain("private_parameter");
    await page.getByRole("button",{name:"Ustawienia prywatności"}).click();
    await page.getByRole("button",{name:"Odrzuć opcjonalne"}).click();
    await openLink();
    expect(events).toHaveLength(1);
    expect((await new AxeBuilder({page}).include('[aria-labelledby="destination-activities-title"]').analyze()).violations).toEqual([]);
  });
}

test("catalog keeps distinct city-specific sources and verified affiliate destinations",()=>{
  expect(Object.keys(activitySelections)).toHaveLength(68);
  expect(Object.values(activitySelections).filter(s=>s.items.some(i=>i.affiliateHref))).toHaveLength(32);
  const urls:string[]=[];
  for(const selection of Object.values(activitySelections)) {
    expect(selection.items.length).toBeGreaterThan(0);
    for(const item of selection.items) {
      const url=new URL(item.href);
      expect(url.protocol).toBe("https:");
      if(item.kind!=="visit") {
        expect(url.origin).toBe("https://www.tiqets.com");
        expect(url.search).toBe("");
        expect(url.pathname).toMatch(/-p\d+\/$/);
        expect(item.affiliateHref).toBeTruthy();
      } else {
        expect(item.affiliateHref).toBeUndefined();
      }
      if(item.affiliateHref) {
        const affiliate=new URL(item.affiliateHref);
        expect(["https://tiqets.tpx.gr","https://tp.media"]).toContain(affiliate.origin);
        if(affiliate.hostname==="tp.media") {
          expect(affiliate.pathname).toBe("/r");
          expect(affiliate.searchParams.get("u")).toBe(item.href);
          expect(affiliate.searchParams.get("marker")).toBe("779959");
          expect(affiliate.searchParams.get("trs")).toBe("577569");
          expect(affiliate.searchParams.get("campaign_id")).toBe("89");
          expect(affiliate.searchParams.get("sub_id")).toBe("hoptrip_attractions");
        }
      }
      urls.push(item.href);
    }
  }
  expect(new Set(urls).size).toBe(urls.length);
  expect(activitiesForDestination("unknown-city")).toBeUndefined();
  expect(activitiesForDestination("constructor")).toBeUndefined();
});

test("trip shows only local attractions without provider requests or changing flight price",async({page},testInfo)=>{
  const externalRequests:string[]=[];
  page.on("request",request=>{
    if(/tiqets|ticketmaster/.test(request.url())) externalRequests.push(request.url());
  });
  await page.goto("/deals/browser-deal");
  await page.getByRole("button",{name:"Odrzuć opcjonalne"}).click();
  const panel=page.getByRole("region",{name:"Muzea i atrakcje"});
  await expect(panel.getByRole("heading",{name:"Casa Batlló — bilet Blue"})).toBeVisible();
  await expect(panel.getByRole("heading",{name:"Aquarium Barcelona — bilet wstępu"})).toBeVisible();
  await expect(panel.getByRole("listitem")).toHaveCount(2);
  await expect(panel).not.toContainText("Duomo");
  await expect(panel).toContainText("Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy");
  await expect(panel).toContainText("Wariant Blue nie obejmuje tarasu na dachu");
  for(const item of activitySelections.barcelona.items) {
    const link=panel.getByRole("link",{name:new RegExp(item.title)});
    await expect(link).toHaveAttribute("href",item.affiliateHref ?? item.href);
    await expect(link).toHaveAttribute("rel",item.affiliateHref ? "sponsored noopener noreferrer" : "noopener noreferrer");
  }
  await expect(page.locator(".detail-summary .deal-price")).toContainText("200,25");
  await expect(page.getByRole("link",{name:"Sprawdź ofertę u partnera"})).toBeVisible();
  expect(externalRequests).toEqual([]);
  expect((await new AxeBuilder({page}).include('[aria-labelledby="destination-activities-title"]').analyze()).violations).toEqual([]);
  await page.setViewportSize({width:320,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await panel.screenshot({path:testInfo.outputPath("activities.png")});
});
