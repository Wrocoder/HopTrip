# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h3-baseline.spec.ts >> H3 baseline pages and widths: pl
- Location: tests\h3-baseline.spec.ts:19:56

# Error details

```
Error: /info/trip-budget failed assets

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 6

- Array []
+ Array [
+   Object {
+     "failure": "net::ERR_ABORTED",
+     "url": "/_next/image",
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=f9e1]:
  - link "Przejdź do treści" [ref=f9e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f9e3]:
    - link "HopTrip — strona główna" [ref=f9e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=f9e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f9e6]: .
    - navigation "Nawigacja główna" [ref=f9e7]:
      - link "Tanie loty" [ref=f9e8] [cursor=pointer]:
        - /url: /deals
      - link "Na weekend" [ref=f9e9] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Kierunki" [ref=f9e10] [cursor=pointer]:
        - /url: /destinations
      - link "Zapisane" [ref=f9e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=f9e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=f9e13]:
      - link "Polski" [ref=f9e14] [cursor=pointer]:
        - /url: /alerts
      - link "Русский" [ref=f9e15] [cursor=pointer]:
        - /url: /ru/alerts
      - link "English" [ref=f9e16] [cursor=pointer]:
        - /url: /en/alerts
      - link "Українська" [ref=f9e17] [cursor=pointer]:
        - /url: /uk/alerts
  - main [ref=f9e19]:
    - heading "Loty dopasowane do Ciebie" [level=1] [ref=f9e20]
    - paragraph [ref=f9e21]: "Zapisz preferencje krótkich wyjazdów: lotnisko, cenę, daty i częstotliwość. Najpierw potwierdzisz email."
    - region "Alerty lotnicze" [ref=f9e22]:
      - paragraph [ref=f9e23]: Wysyłka podsumowań jest obecnie wstrzymana. Możesz zapisać i potwierdzić preferencje; oferty otrzymasz dopiero po wznowieniu wysyłki.
      - generic [ref=f9e24]:
        - generic [ref=f9e25]:
          - text: Email
          - textbox "Email" [ref=f9e26]
        - generic [ref=f9e27]:
          - text: Lotnisko wylotu
          - combobox "Lotnisko wylotu" [ref=f9e28]:
            - option "Wybierz lotnisko" [selected]
            - option "Kraków — KRK"
            - option "Warszawa-Chopin — WAW"
            - option "Warszawa-Modlin — WMI"
            - option "Wrocław — WRO"
        - generic [ref=f9e29]:
          - text: Kierunek
          - combobox "Kierunek" [ref=f9e30]:
            - option "Dowolny" [selected]
            - option "Barcelona"
            - option "Mediolan"
            - option "Rzym"
        - generic [ref=f9e31]:
          - text: Budżet na lot na osobę (PLN)
          - spinbutton "Budżet na lot na osobę (PLN)" [ref=f9e32]: "200"
        - generic [ref=f9e33]:
          - text: Minimum nocy
          - spinbutton "Minimum nocy" [ref=f9e34]: "0"
        - generic [ref=f9e35]:
          - text: Maksimum nocy
          - spinbutton "Maksimum nocy" [ref=f9e36]: "14"
        - generic [ref=f9e37]:
          - text: Wylot od (opcjonalnie)
          - textbox "Wylot od (opcjonalnie)" [ref=f9e38]
        - generic [ref=f9e39]:
          - text: Wylot do (opcjonalnie)
          - textbox "Wylot do (opcjonalnie)" [ref=f9e40]
        - generic [ref=f9e41]:
          - 'checkbox "Tylko weekendy: wylot w piątek lub sobotę, powrót w najbliższą niedzielę" [ref=f9e42]'
          - text: "Tylko weekendy: wylot w piątek lub sobotę, powrót w najbliższą niedzielę"
        - generic [ref=f9e43]:
          - text: Częstotliwość
          - combobox "Częstotliwość" [ref=f9e44]:
            - option "Raz w tygodniu" [selected]
            - option "Najwyżej raz dziennie"
        - generic [ref=f9e45]:
          - checkbox "Chcę otrzymywać od HopTrip email z pasującymi lotami według wybranej częstotliwości gdy wysyłka jest włączona. Mogę wyłączyć alert w każdej chwili." [ref=f9e46]
          - text: Chcę otrzymywać od HopTrip email z pasującymi lotami według wybranej częstotliwości gdy wysyłka jest włączona. Mogę wyłączyć alert w każdej chwili.
        - button "Wyślij link potwierdzający" [ref=f9e47] [cursor=pointer]
      - status
      - paragraph [ref=f9e48]:
        - text: Email i ustawienia służą obsłudze alertu. Nie przekazujemy adresu email partnerom ofert.
        - link "Prywatność" [ref=f9e49] [cursor=pointer]:
          - /url: /info/privacy
    - paragraph [ref=f9e50]:
      - link "Zapisane wyjazdy" [ref=f9e51] [cursor=pointer]:
        - /url: /saved
  - contentinfo [ref=f9e52]:
    - generic [ref=f9e53]:
      - generic [ref=f9e54]: HopTrip.
      - paragraph [ref=f9e55]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=f9e56]:
      - link "Jak działa HopTrip" [ref=f9e57] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=f9e58] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=f9e59] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=f9e60] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=f9e61] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=f9e62] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=f9e63] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=f9e64] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=f9e65] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=f9e66] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=f9e67] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=f9e69] [cursor=pointer]
  - alert [ref=f9e70]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {readFileSync,writeFileSync} from 'node:fs';
  4  | import config from '../playwright.config';
  5  | import {availableHref} from '../src/lib/i18n/routing';
  6  | 
  7  | // Baseline observation, not an approval of existing defects. Artifacts survive failures.
  8  | const paths=['/','/deals','/tanie-loty-na-weekend','/city-break',
  9  |  '/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved',
  10 |  '/info/trip-budget','/alerts'];
  11 | const widths=[320,375,390,768,1440];
  12 | test.beforeEach(async({request},info)=>{
  13 |  if(process.env.HOPTRIP_H3_PRODUCTION!=='1')return;
  14 |  const servers=config.webServer;if(!Array.isArray(servers))throw Error('Expected fixture servers');
  15 |  expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
  16 |  const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await (await request.get('/deals')).text()).toContain(build);
  17 |  await info.attach('execution-mode',{body:JSON.stringify({command:servers[1].command,nodeEnv:servers[1].env?.NODE_ENV,build}),contentType:'application/json'});
  18 | });
  19 | for(const locale of ['pl','en','ru','uk'] as const)test(`H3 baseline pages and widths: ${locale}`,async({page,context},info)=>{
  20 |  test.skip(info.project.name!=='desktop','The explicit width matrix runs once; touch journeys run separately.');
  21 |  test.setTimeout(300000);
  22 |  const records:unknown[]=[],errors:string[]=[],external:string[]=[];
  23 |  let assetFailures:{url:string;failure:string}[]=[],httpErrors:{url:string;status:number;type:string}[]=[];
  24 |  page.on('pageerror',error=>errors.push(error.message));
  25 |  page.on('requestfailed',request=>{
  26 |   if(['script','stylesheet','font','image'].includes(request.resourceType()))assetFailures.push({url:new URL(request.url()).pathname,failure:request.failure()?.errorText??'unknown'});
  27 |  });
  28 |  page.on('response',response=>{
  29 |   if(response.status()>=400)httpErrors.push({url:new URL(response.url()).pathname,status:response.status(),type:response.request().resourceType()});
  30 |  });
  31 |  await context.route('**/*',route=>{
  32 |   const url=new URL(route.request().url());
  33 |   if(['127.0.0.1','localhost'].includes(url.hostname))return route.continue();
  34 |   external.push(url.origin+url.pathname);return route.abort();
  35 |  });
  36 |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  37 |  const save=()=>writeFileSync(info.outputPath(`baseline-${locale}.json`),JSON.stringify({locale,mode:'local synthetic fixture; layout/accessibility, not a performance score',records,errors,external},null,2));
  38 |  for(const [index,path] of paths.entries()){
  39 |   assetFailures=[];httpErrors=[];
  40 |   const href=availableHref(path,locale); // Untranslated destination URLs retain their published PL route.
  41 |   try{
  42 |    await page.setViewportSize({width:390,height:844});
  43 |    const response=await page.goto(href);
  44 |    await expect(page.locator('main h1').first()).toBeVisible();
  45 |    await page.evaluate(()=>document.fonts.ready);
  46 |    const photos=page.locator('main img');
  47 |    for(const image of await photos.all()){
  48 |     await image.scrollIntoViewIfNeeded();
  49 |     await expect(image).toHaveJSProperty('complete',true);
  50 |     await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  51 |    }
  52 |    const images=await photos.evaluateAll(elements=>elements.map(node=>{const image=node as HTMLImageElement;return {src:new URL(image.currentSrc||image.src).pathname,alt:image.alt,width:image.width,height:image.height,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,loading:image.loading,sizes:image.sizes,srcset:image.srcset};}));
  53 |    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  54 |    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  55 |    const viewports=[];
  56 |    for(const width of widths){
  57 |     await page.setViewportSize({width,height:900});
  58 |     await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  59 |     const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
  60 |      overflowing:[...document.querySelectorAll('main *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).slice(0,12).map(el=>({tag:el.tagName,class:el.className})),
  61 |      cards:document.querySelectorAll('.deal-card').length}));
  62 |     viewports.push({width,...layout});
  63 |     expect.soft(layout.overflow,`${href} overflow at ${width}`).toBe(false);
  64 |     if((locale==='pl'||index===0)&&(width===320||width===1440))await page.screenshot({path:info.outputPath(`${locale}-${index}-${width}.png`),fullPage:true,animations:'disabled'});
  65 |    }
  66 |    await page.locator('.skip-link').focus();await page.keyboard.press('Enter');await expect(page.locator('#content')).toBeFocused();
  67 |    const publishedLocale=href.match(/^\/(en|ru|uk)(\/|$)/)?.[1]??'pl';
  68 |    await expect(page.locator('html')).toHaveAttribute('lang',publishedLocale);
  69 |    const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(item=>{const entry=item as PerformanceResourceTiming;return {path:new URL(entry.name).pathname,type:entry.initiatorType,startMs:entry.startTime,durationMs:entry.duration,transferBytes:entry.transferSize,encodedBytes:entry.encodedBodySize,decodedBytes:entry.decodedBodySize};}));
  70 |    records.push({path,href,status:response?.status(),h1:await page.locator('main h1').allTextContents(),
  71 |     canonical:await page.locator('link[rel="canonical"]').getAttribute('href'),publishedLocale,viewports,images,resources,assetFailures,httpErrors,
  72 |     violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
  73 |     needsReview:axe.incomplete.map(v=>v.id)});
  74 |    expect.soft(response?.status(),href).toBe(200);
  75 |    expect.soft(axe.violations.map(v=>v.id),`${href} axe`).toEqual([]);
> 76 |    expect.soft(assetFailures,`${href} failed assets`).toEqual([]);
     |                                                       ^ Error: /info/trip-budget failed assets
  77 |    expect.soft(httpErrors,`${href} HTTP errors`).toEqual([]);
  78 |   }catch(error){records.push({path,href,error:String(error)});expect.soft(false,`${href}: ${String(error)}`).toBe(true);}
  79 |   finally{save();}
  80 |  }
  81 |  expect.soft(errors,'Browser runtime errors').toEqual([]);
  82 |  await info.attach(`baseline-${locale}`,{path:info.outputPath(`baseline-${locale}.json`),contentType:'application/json'});
  83 | });
  84 | 
```