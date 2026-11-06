# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-analytics.spec.ts >> product taxonomy follows real actions without private payloads in en
- Location: tests\product-analytics.spec.ts:40:56

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 9
Received: 11

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=e3]:
    - link "HopTrip — home" [ref=e4] [cursor=pointer]:
      - /url: /en
      - generic [aria-hidden] [ref=e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=e6]: .
    - navigation "Main navigation" [ref=e7]:
      - link "Cheap flights" [ref=e8] [cursor=pointer]:
        - /url: /en/deals
      - link "Weekends" [ref=e9] [cursor=pointer]:
        - /url: /en/tanie-loty-na-weekend
      - link "Destinations" [ref=e10] [cursor=pointer]:
        - /url: /en#home-destinations
      - link "Saved" [ref=e11] [cursor=pointer]:
        - /url: /en/saved
      - link "Budget calculator" [ref=e12] [cursor=pointer]:
        - /url: /en/info/trip-budget
    - navigation "Language" [ref=e13]:
      - link "Polski" [ref=e14] [cursor=pointer]:
        - /url: /deals?budget=1&sort=price
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals?budget=1&sort=price
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals?budget=1&sort=price
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals?budget=1&sort=price
  - main [ref=e19]:
    - generic [ref=e20]:
      - paragraph [ref=e21]: Flights from Poland
      - heading "Current deals" [level=1] [ref=e22]
      - paragraph [ref=e23]: The price covers the flight. Accommodation, extra baggage and transfers are not included.
    - region "Choose flights" [ref=e24]:
      - form "Flight filters" [ref=e25]:
        - group [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: From
            - combobox "From" [ref=e29]
            - generic [ref=e30]: City or IATA code. Leave empty for any.
          - generic [ref=e31]:
            - generic [ref=e32]: To
            - combobox "To" [ref=e33]
            - generic [ref=e34]: City or IATA code. Leave empty for any.
          - generic [ref=e35]:
            - text: Flight budget / person (PLN)
            - spinbutton "Flight budget / person (PLN)" [ref=e36]: "1"
          - button "Apply filters" [ref=e37] [cursor=pointer]
        - group [ref=e38]:
          - generic "Dates and length of stay +" [ref=e39] [cursor=pointer]
        - generic [ref=e40]:
          - text: Sort flights
          - combobox "Sort flights Changing the sort order also applies the entered filters." [ref=e41]:
            - option "Supporting score ↓"
            - option "Price/person (PLN) ↑" [selected]
            - option "Departure date ↑"
          - generic [ref=e42]: Changing the sort order also applies the entered filters.
        - group "Quick filters" [ref=e43]:
          - button "Weekend" [ref=e45] [cursor=pointer]
          - button "2–3 nights" [ref=e47] [cursor=pointer]
          - button "Flights up to PLN 300" [ref=e49] [cursor=pointer]
        - group [ref=e50]:
          - generic "How filters work" [ref=e51] [cursor=pointer]
      - generic [ref=e52]:
        - paragraph [ref=e53]: Applied filters (1)
        - navigation "Applied filters" [ref=e54]:
          - 'link "Remove filter: Flight budget / person (PLN): PLN 1.00" [ref=e55] [cursor=pointer]':
            - /url: /en/deals?sort=price
            - generic [ref=e56]:
              - text: "Flight budget / person (PLN):"
              - strong [ref=e57]: PLN 1.00
            - generic [aria-hidden] [ref=e58]: ×
        - link "Clear all filters" [ref=e59] [cursor=pointer]:
          - /url: /en/deals?sort=price
        - generic [ref=e60]: Reset removes filters. Your selected sort order is kept.
    - status [ref=e61]:
      - text: "Offers:"
      - strong [ref=e62]: "0"
    - generic [ref=e63]:
      - heading "No current offers" [level=2] [ref=e64]
      - paragraph [ref=e65]: Change a condition to broaden your search. Filters stay unchanged until you choose an option.
      - link "Remove price limit" [ref=e67] [cursor=pointer]:
        - /url: /en/deals?sort=price
    - navigation "Results pages"
    - paragraph [ref=e68]:
      - link "Notify me about matching flights" [ref=e69] [cursor=pointer]:
        - /url: /en/alerts?budget=1
      - text: ·
      - link "Saved trips" [ref=e70] [cursor=pointer]:
        - /url: /en/saved
  - contentinfo [ref=e71]:
    - generic [ref=e72]:
      - generic [ref=e73]: HopTrip.
      - paragraph [ref=e74]: "Affiliate link: we may earn a commission after a booking. We do not sell tickets."
    - navigation "About the service" [ref=e75]:
      - link "How HopTrip works" [ref=e76] [cursor=pointer]:
        - /url: /en/info
      - link "City break" [ref=e77] [cursor=pointer]:
        - /url: /en/city-break
      - link "Weekend flights" [ref=e78] [cursor=pointer]:
        - /url: /en/tanie-loty-na-weekend
      - link "Flights from Warsaw" [ref=e79] [cursor=pointer]:
        - /url: /en/from/warszawa
      - link "Saved trips" [ref=e80] [cursor=pointer]:
        - /url: /en/saved
      - link "Flight alerts" [ref=e81] [cursor=pointer]:
        - /url: /en/alerts
      - link "About HopTrip" [ref=e82] [cursor=pointer]:
        - /url: /en/info/about
      - link "Contact" [ref=e83] [cursor=pointer]:
        - /url: /en/info/contact
      - link "Privacy" [ref=e84] [cursor=pointer]:
        - /url: /en/info/privacy
      - link "Terms of use" [ref=e85] [cursor=pointer]:
        - /url: /en/info/terms
      - link "Affiliate partnerships" [ref=e86] [cursor=pointer]:
        - /url: /en/info/partners
    - button "Privacy settings" [ref=e88] [cursor=pointer]
  - alert [ref=e89]: Current deals
```

# Test source

```ts
  1   | import {localOutbound} from './local-outbound';
  2   | import {test,expect,type Page,type BrowserContext} from '@playwright/test';
  3   | import {localizedHref} from '../src/lib/i18n/routing';
  4   | import {tripText} from '../src/lib/i18n/trip-copy';
  5   | import {alertText} from '../src/lib/i18n/alert-copy';
  6   | import type {Locale} from '../src/lib/i18n/config';
  7   | import type {AnalyticsEventName} from '../src/lib/analytics-context';
  8   | 
  9   | type Event={event_name:AnalyticsEventName;deal_slug?:string;filter?:{action:string};metadata:Record<string,string>};
  10  | const ticket='https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret';
  11  | async function setup(page:Page,context:BrowserContext,allowed=true){
  12  |  await page.addInitScript(allowed=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:allowed,marketing:false,at:Date.now()}));},allowed);
  13  |  // All external traffic is fulfilled locally, including popup ticket destinations.
  14  |  await context.route('https://**',route=>route.fulfill({body:'Synthetic local destination',contentType:'text/html'}));
  15  |  await page.route('**/api/v1/deals/*/events?**',route=>{
  16  |   const item={id:'private-event-id',name:'Synthetic concert',category:'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:ticket,price_from:null,currency:null};
  17  |   return route.fulfill({json:{status:'READY',events:[item,{...item,id:'variant-fixture',name:'Synthetic variants',ticket_options:[{id:'private-option',name:'Synthetic standard',ticket_kind:'STANDARD',url:ticket,price_from:null,currency:null}]},{...item,id:'cancelled-fixture',name:'Synthetic cancelled',status:'cancelled'}],partial:false,checked_at:null}});
  18  |  });
  19  |  const events:Event[]=[],statuses:number[]=[],externalTrackers:string[]=[];
  20  |  page.on('request',request=>{
  21  |   if(request.url().endsWith('/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());
  22  |   if(/emrld\.ltd|api\.telegram\.org/.test(request.url()))externalTrackers.push(request.url());
  23  |  });
  24  |  page.on('response',response=>{if(response.url().endsWith('/analytics/events')&&response.request().method()==='POST')statuses.push(response.status());});
  25  |  return {events,statuses,externalTrackers};
  26  | }
  27  | const count=(events:Event[],name:AnalyticsEventName)=>events.filter(e=>e.event_name===name).length;
  28  | async function clickTicket(page:Page,variant=false){
  29  |  const card=page.locator('#trip-events li').filter({has:page.getByRole('heading',{level:3,name:variant?'Synthetic variants':'Synthetic concert',exact:true})});
  30  |  const link=card.locator('a[target="_blank"]');
  31  |  await expect(link).toHaveAttribute('rel','sponsored noopener noreferrer');
  32  |  const restore=await localOutbound(link);const opened=page.waitForEvent('popup');await link.click();const popup=await opened;await popup.waitForLoadState();await popup.close();await restore();
  33  | }
  34  | async function signup(page:Page,locale:Locale,email:string){
  35  |  await page.getByLabel('Email',{exact:true}).fill(email);
  36  |  await page.locator('input[name="consent"]').check();
  37  |  await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
  38  | }
  39  | 
  40  | for(const locale of ['pl','en','ru','uk'] as const)test(`product taxonomy follows real actions without private payloads in ${locale}`,async({page,context,request})=>{
  41  |  test.setTimeout(120000);
  42  |  const {events,statuses,externalTrackers}=await setup(page,context);
> 43  |  const flush=async()=>{await expect.poll(()=>statuses.length).toBe(events.length);expect(statuses.every(s=>s===202)).toBe(true);};
      |                                                               ^ Error: expect(received).toBe(expected) // Object.is equality
  44  |  await page.goto(localizedHref('/deals?origin=WRO&budget=300&sort=price',locale));
  45  |  await page.locator('.filter-chip').last().click();
  46  |  await expect.poll(()=>events.some(e=>e.filter?.action==='remove')).toBe(true);
  47  |  await page.locator('.filter-reset').click();
  48  |  await expect.poll(()=>events.some(e=>e.filter?.action==='reset')).toBe(true);
  49  |  await expect(page).toHaveURL(/sort=price/);
  50  |  await page.locator('input[name="budget"]').fill('1');
  51  |  await page.locator('.filters button[type="submit"]').click();
  52  |  await expect.poll(()=>events.some(e=>e.filter?.action==='apply')).toBe(true);
  53  |  await expect.poll(()=>count(events,'SEARCH')).toBe(1);
  54  |  expect(events.filter(e=>e.event_name==='FILTER_USE').map(e=>e.filter?.action)).toEqual(['remove','reset','apply']);
  55  |  await flush();
  56  |  await page.goto(localizedHref('/deals/browser-13',locale));
  57  |  await page.locator('#budget-hotel').fill('200');
  58  |  await expect.poll(()=>count(events,'BUDGET_USE')).toBe(1);
  59  |  const save=page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true});
  60  |  await save.click();await expect.poll(()=>count(events,'TRIP_SAVE')).toBe(1);await save.click();
  61  |  await clickTicket(page);
  62  |  await expect.poll(()=>count(events,'EVENT_CLICK')).toBe(1);
  63  |  expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
  64  |  await expect(page.locator('#trip-events li').filter({has:page.getByRole('heading',{name:'Synthetic cancelled',exact:true})}).locator('a')).toHaveCount(0);
  65  |  await flush();
  66  |  await page.goto(localizedHref('/saved',locale));
  67  |  await page.locator('main ul li button').click();
  68  |  await expect.poll(()=>count(events,'TRIP_REMOVE')).toBe(1);
  69  |  expect(events.find(e=>e.event_name==='TRIP_REMOVE')?.metadata.page_type).toBe('saved');
  70  |  expect(count(events,'TRIP_SAVE')).toBe(1);
  71  |  await flush();
  72  |  await page.goto(localizedHref('/alerts?origin=WRO',locale));
  73  |  await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
  74  |  expect(count(events,'ALERT_STARTED')).toBe(0);
  75  |  const email=`taxonomy-${crypto.randomUUID()}@example.test`;
  76  |  await signup(page,locale,email);
  77  |  await expect(page.getByRole('status')).toContainText(alertText(locale,'Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Prośba o zapis nie oznacza potwierdzonej subskrypcji. Link wysyłamy najwyżej raz na dobę.'));
  78  |  expect(count(events,'ALERT_STARTED')).toBe(1);expect(count(events,'ALERT_CONFIRMED')).toBe(0);
  79  |  await flush();
  80  |  const api=process.env.HOPTRIP_API_URL??'http://127.0.0.1:8125';
  81  |  const response=await request.get(`${api}/__test__/mail?email=${encodeURIComponent(email)}`);expect(response.ok()).toBe(true);
  82  |  const mail=await response.json(),confirm=mail[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0];
  83  |  expect(new URL(confirm).origin).toBe(new URL(page.url()).origin);
  84  |  await page.goto(confirm);
  85  |  await page.getByRole('button',{name:alertText('pl','Potwierdzam zapis'),exact:true}).click();
  86  |  await expect.poll(()=>count(events,'ALERT_CONFIRMED')).toBe(1);
  87  |  await flush();
  88  |  expect(JSON.stringify(events)).not.toMatch(/private|taxonomy-|example\.test|email|token|plan=|Synthetic/);
  89  |  expect(externalTrackers).toEqual([]);
  90  |  // Withdrawal persists over a full navigation, including an explicit signup attempt.
  91  |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
  92  |  await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
  93  |  const before=events.length;
  94  |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  95  |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','withdrawn@example.test');
  96  |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  97  |  expect(events).toHaveLength(before);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
  98  | });
  99  | 
  100 | test('ticket variants emit the same minimal click and failures never block navigation',async({page,context})=>{
  101 |  const {events}=await setup(page,context);
  102 |  await page.route('**/analytics/events',route=>route.abort('failed'));
  103 |  await page.goto('/deals/browser-13');await clickTicket(page,true);
  104 |  expect(count(events,'EVENT_CLICK')).toBe(1);
  105 |  expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
  106 |  expect(JSON.stringify(events)).not.toMatch(/private|Synthetic|ticketmaster/);
  107 | });
  108 | 
  109 | test('denied consent suppresses filter, ticket, save, remove and signup analytics',async({page,context})=>{
  110 |  const {events}=await setup(page,context,false);
  111 |  await page.goto('/deals?budget=300');await page.locator('.filter-reset').click();
  112 |  await page.goto('/deals/browser-13');await clickTicket(page);
  113 |  await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  114 |  await page.goto('/saved');await page.locator('main ul li button').click();
  115 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  116 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','denied@example.test');
  117 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  118 |  expect(events).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
  119 | });
  120 | 
  121 | test('failed saved-trip write emits no remove and leaves the plan available',async({page,context})=>{
  122 |  const {events}=await setup(page,context);
  123 |  await page.goto('/deals/browser-13');await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  124 |  await page.goto('/saved');await expect(page.locator('main ul li button')).toHaveCount(1);
  125 |  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.includes('saved'))throw Error('Synthetic storage failure');return original.call(this,key,value);};});
  126 |  await page.locator('main ul li button').click();
  127 |  await expect(page.getByRole('status')).toContainText('Nie udało się usunąć planu');
  128 |  expect(count(events,'TRIP_REMOVE')).toBe(0);await expect(page.locator('main ul li button')).toHaveCount(1);
  129 | });
  130 | 
  131 | test('a failed signup counts one start per visit and never reports completion',async({page,context})=>{
  132 |  const {events}=await setup(page,context);
  133 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  134 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','failed@example.test');
  135 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  136 |  await signup(page,'pl','failed@example.test');await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  137 |  expect(events.map(e=>e.event_name)).toEqual(['ALERT_STARTED']);
  138 | });
  139 | 
```