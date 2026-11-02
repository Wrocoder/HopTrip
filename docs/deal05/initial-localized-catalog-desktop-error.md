# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: localized-catalog.spec.ts >> localized empty, invalid, unavailable and loading results keep conditions
- Location: tests\localized-catalog.spec.ts:68:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'No current offers' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'No current offers' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'No current offers' })

```

```yaml
- link "Skip to content":
  - /url: "#content"
- banner:
  - link "HopTrip — home":
    - /url: /en
    - text: HopTrip
  - navigation "Main navigation":
    - link "Cheap flights":
      - /url: /en/deals
    - link "Weekends":
      - /url: /en/tanie-loty-na-weekend
    - link "Destinations":
      - /url: /en#home-destinations
    - link "Saved":
      - /url: /en/saved
    - link "Budget calculator":
      - /url: /en/info/trip-budget
  - navigation "Language":
    - link "Polski":
      - /url: /deals?origin=WRO&sort=price&budget=1
    - link "Русский":
      - /url: /ru/deals?origin=WRO&sort=price&budget=1
    - link "English":
      - /url: /en/deals?origin=WRO&sort=price&budget=1
    - link "Українська":
      - /url: /uk/deals?origin=WRO&sort=price&budget=1
- main:
  - paragraph: Flights from Poland
  - heading "Current deals" [level=1]
  - paragraph: The price covers the flight. Accommodation, extra baggage and transfers are not included.
  - region "Choose flights":
    - form "Flight filters":
      - group:
        - text: From
        - combobox "From": WRO
        - text: Suggestions are unavailable. Enter an airport code, e.g. WRO. To
        - combobox "To"
        - text: Suggestions are unavailable. Enter a destination name or ID, e.g. milan. Flight budget / person (PLN)
        - spinbutton "Flight budget / person (PLN)": "1"
        - button "Apply filters"
      - group:
        - text: Dates and length of stay −
        - paragraph: "Departure date range, not return dates. Stay length in nights. Empty field: no limit."
        - text: Depart from
        - textbox "Depart from"
        - text: Depart by
        - textbox "Depart by"
        - text: Stay from (nights)
        - spinbutton "Stay from (nights)"
        - text: Stay up to (nights)
        - spinbutton "Stay up to (nights)"
      - text: Sort flights
      - combobox "Sort flights Changing the sort order also applies the entered filters.":
        - option "Offer score — highest first"
        - option "Price — lowest first" [selected]
        - option "Departure — soonest first"
      - text: Changing the sort order also applies the entered filters.
      - group "Quick filters":
        - button "Weekend"
        - button "2–3 nights"
        - button "Flights up to PLN 300"
      - paragraph: Presets replace their own fields and apply the form immediately. Click again to remove those conditions.
      - group: How filters work
    - paragraph: Applied filters (2)
    - navigation "Applied filters":
      - 'link "Remove filter: From: WRO"':
        - /url: /en/deals?budget=1&sort=price
        - text: "From:"
        - strong: WRO
      - 'link "Remove filter: Flight budget / person (PLN): PLN 1.00"':
        - /url: /en/deals?origin=WRO&sort=price
        - text: "Flight budget / person (PLN):"
        - strong: PLN 1.00
    - link "Clear all filters":
      - /url: /en/deals?sort=price
    - text: Reset removes filters. Your selected sort order is kept.
  - alert:
    - heading "Could not load offers" [level=2]
    - paragraph: Could not load offers. Please try again shortly.
    - link "Try again":
      - /url: /en/deals?origin=WRO&budget=1&sort=price
    - link "Clear search parameters":
      - /url: /en/deals
  - paragraph:
    - link "Saved trips":
      - /url: /en/saved
- contentinfo:
  - text: HopTrip.
  - paragraph: "Affiliate link: we may earn a commission after a booking. We do not sell tickets."
  - navigation "About the service":
    - link "How HopTrip works":
      - /url: /en/info
    - link "City break":
      - /url: /en/city-break
    - link "Weekend flights":
      - /url: /en/tanie-loty-na-weekend
    - link "Flights from Warsaw":
      - /url: /en/from/warszawa
    - link "Saved trips":
      - /url: /en/saved
    - link "Flight alerts":
      - /url: /en/alerts
    - link "About HopTrip":
      - /url: /en/info/about
    - link "Contact":
      - /url: /en/info/contact
    - link "Privacy":
      - /url: /en/info/privacy
    - link "Terms of use":
      - /url: /en/info/terms
    - link "Affiliate partnerships":
      - /url: /en/info/partners
  - button "Privacy settings"
- alert
```

# Test source

```ts
  1   | import {test,expect} from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import {catalogText} from "../src/lib/i18n/catalog-copy";
  4   | import {filterText} from "../src/lib/i18n/filter-copy";
  5   | import {getMessages} from "../src/lib/i18n/messages";
  6   | 
  7   | test.setTimeout(90000);
  8   | 
  9   | test.beforeEach(async({page})=>{
  10  |  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  11  | });
  12  | 
  13  | test("catalog languages preserve filters, pages, consent and server language",async({page},testInfo)=>{
  14  |  const errors:string[]=[],events:string[]=[];
  15  |  page.on("pageerror",error=>errors.push(error.message));
  16  |  page.on("request",r=>{if(r.url().endsWith("/analytics/events"))events.push(r.url());});
  17  |  await page.setViewportSize(testInfo.project.name==="desktop" ? {width:1366,height:900} : {width:375,height:812});
  18  |  await page.goto("/en/deals?origin=WRO&sort=price");
  19  |  for(const [locale,name] of [["en","English"],["ru","Русский"],["uk","Українська"],["pl","Polski"]] as const){
  20  |   if(locale!=="en")await page.locator(".language-switcher").getByRole("link",{name,exact:true}).click();
  21  |   const prefix=locale==="pl" ? "" : `/${locale}`,messages=getMessages(locale);
  22  |   await expect(page.locator("html")).toHaveAttribute("lang",locale);
  23  |   await expect(page.locator(".result-count")).toContainText(`${catalogText(locale,"Liczba ofert:")} 14`);
  24  |   await expect(page.locator(".deal-card")).toHaveCount(12);
  25  |   await expect(page.locator(".sort-control select")).toHaveValue("price");
  26  |   expect(new URL(page.url()).searchParams.get("origin")).toBe("WRO");
  27  |   if(locale!=="pl"){
  28  |    await expect(page.locator(".deal-card-link").first()).toHaveAttribute("href",new RegExp(`^/${locale}/deals/`));
  29  |    await expect(page.locator(".deal-card").first()).not.toContainText("Daty oferty");
  30  |   }
  31  |   await page.evaluate(()=>scrollTo(0,0));
  32  |   if(testInfo.project.name==="desktop"){
  33  |    const price=await page.locator(".deal-price").first().boundingBox();
  34  |    expect(price!.y+price!.height).toBeLessThan(900);
  35  |   }
  36  |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  37  |   await page.screenshot({path:testInfo.outputPath(`catalog-${locale}.png`)});
  38  |   await page.getByRole("link",{name:messages.next,exact:true}).click();
  39  |   await expect(page).toHaveURL(new RegExp(`${prefix}/deals.*offset=12`));
  40  |   await expect(page.locator(".result-count")).toContainText("13–14");
  41  |   await page.reload();
  42  |   await expect(page.locator("html")).toHaveAttribute("lang",locale);
  43  |   await page.getByLabel(filterText(locale,"Sortuj oferty")).selectOption("departure");
  44  |   await expect(page).not.toHaveURL(/offset=/);
  45  |   await page.goBack();
  46  |   await expect(page).toHaveURL(/offset=12/);
  47  |   await page.getByRole("link",{name:messages.previous,exact:true}).click();
  48  |   await expect(page.locator(".deal-card")).toHaveCount(12);
  49  |  }
  50  |  expect(events).toEqual([]);
  51  |  expect(errors).toEqual([]);
  52  | });
  53  | 
  54  | test("translated details and offer links retain the catalog language",async({page})=>{
  55  |  for(const locale of ["en","ru","uk"] as const){
  56  |   await page.goto(`/${locale}/deals?origin=WRO&sort=price`);
  57  |   const card=page.locator(".deal-card").first();
  58  |   await card.locator(".trip-details > summary").click();
  59  |   await expect(card.locator(".flight-facts")).toContainText(catalogText(locale,"Bagaż do sprawdzenia u partnera"));
  60  |   await expect(card.locator(".price-assessment")).toContainText(catalogText(locale,"Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo."));
  61  |   expect((await new AxeBuilder({page}).include("main").analyze()).violations).toEqual([]);
  62  |   await card.locator(".deal-card-link").click();
  63  |   await expect(page).toHaveURL(/\/deals\/[^/?]+$/);
  64  |   await expect(page.locator("html")).toHaveAttribute("lang",locale);
  65  |  }
  66  | });
  67  | 
  68  | test("localized empty, invalid, unavailable and loading results keep conditions",async({page})=>{
  69  |  for(const locale of ["en","ru","uk"] as const){
  70  |   const t=(key:Parameters<typeof catalogText>[1])=>catalogText(locale,key);
  71  |   await page.goto(`/${locale}/deals?origin=WRO&sort=price&budget=1`);
> 72  |   await expect(page.getByRole("heading",{name:t("Brak aktualnych ofert")})).toBeVisible();
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  73  |   const relax=page.getByRole("link",{name:t("Usuń limit ceny"),exact:true});
  74  |   await expect(relax).toHaveAttribute("href",`/${locale}/deals?origin=WRO&sort=price`);
  75  |   await expect(page.locator('input[name="budget"]')).toHaveValue("1");
  76  |   await relax.click();
  77  |   await expect(page.locator(".deal-card")).toHaveCount(12);
  78  |   await page.goto(`/${locale}/deals?sort=invalid`);
  79  |   await expect(page.getByRole("heading",{name:t("Sprawdź parametry wyszukiwania")})).toBeVisible();
  80  |   await page.goto(`/${locale}/deals?budget=987653`);
  81  |   await expect(page.getByRole("heading",{name:t("Nie udało się pobrać ofert")})).toBeVisible();
  82  |   await expect(page.getByRole("link",{name:t("Spróbuj ponownie")})).toBeVisible();
  83  |   await page.goto(`/${locale}/deals?budget=987654`,{waitUntil:"commit"});
  84  |   await expect(page.getByRole("status").filter({hasText:getMessages(locale).loading})).toBeVisible();
  85  |   await expect(page.locator(".result-count")).toContainText("14");
  86  |  }
  87  | });
  88  | 
  89  | test("catalog canonical and alternates preserve normalized queries without indexing filters",async({page,request})=>{
  90  |  for(const locale of ["en","ru","uk"] as const){
  91  |   await page.goto(`/${locale}/deals?origin=wro&sort=price&utm_source=test`);
  92  |   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`http://127.0.0.1:3125/${locale}/deals?origin=WRO&sort=price`);
  93  |   await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  94  |   await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  95  |   await page.goto(`/${locale}/deals`);
  96  |   await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/^index,/);
  97  |  }
  98  |  for(const path of ["/ua/deals","/de/deals","/pl/deals","/en/deals/untranslated-offer"]){
  99  |   expect((await request.get(path)).status()).toBe(404);
  100 |  }
  101 |  const response=await request.get("/deals",{headers:{"x-hoptrip-locale":"ru"}});
  102 |  expect(await response.text()).toContain('lang="pl"');
  103 |  const sitemap=await (await request.get("/sitemap.xml")).text();
  104 |  for(const locale of ["en","ru","uk"])expect(sitemap).toContain(`/${locale}/deals`);
  105 |  expect(sitemap).not.toContain("?origin=");
  106 | });
  107 | 
```