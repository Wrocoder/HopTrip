# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: destination-imagery.spec.ts >> destination photographs preserve links, reserved layout and credits in pl
- Location: tests\destination-imagery.spec.ts:14:56

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.focus: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('section:has(> #home-destinations)').locator('li').filter({ has: locator('section:has(> #home-destinations)').getByAltText('Wnętrze Koloseum w Rzymie') }).locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Przejdź do treści" [ref=e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=e3]:
    - link "HopTrip — strona główna" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=e6]: .
    - navigation "Nawigacja główna" [ref=e7]:
      - link "Tanie loty" [ref=e8] [cursor=pointer]:
        - /url: /deals
      - link "Na weekend" [ref=e9] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Kierunki" [ref=e10] [cursor=pointer]:
        - /url: /#home-destinations
      - link "Zapisane" [ref=e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=e13]:
      - link "Polski" [ref=e14] [cursor=pointer]:
        - /url: /
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk
  - main [ref=e19]:
    - region [ref=e20]:
      - generic [ref=e21]:
        - paragraph [ref=e22]: Loty z Polski · HopTrip
        - heading "Tanie podróże zaczynają się tutaj." [level=1] [ref=e24]
        - paragraph [ref=e25]: Znajdź lot, sprawdź wydarzenia i zaplanuj wyjazd w jednym miejscu.
      - region "Wybór ofert" [ref=e26]:
        - form "Filtry ofert" [ref=e27]:
          - group [ref=e28]:
            - generic [ref=e29]:
              - generic [ref=e30]: Skąd
              - combobox "Skąd" [ref=e31]
              - generic [ref=e32]: "Miasto lub kod IATA. Puste pole: dowolne."
            - generic [ref=e33]:
              - generic [ref=e34]: Dokąd
              - combobox "Dokąd" [ref=e35]
              - generic [ref=e36]: "Miasto lub kod IATA. Puste pole: dowolne."
            - group "Elastyczne daty wylotu" [ref=e37]:
              - generic [ref=e39]:
                - generic [ref=e40]:
                  - text: Wylot od
                  - textbox "Wylot od" [ref=e41]
                - generic [ref=e42]:
                  - text: Wylot do
                  - textbox "Wylot do" [ref=e43]
              - paragraph [ref=e44]: Wybierz przedział możliwego wylotu. Zostaw daty puste, aby szukać bez ograniczeń.
            - generic [ref=e45]:
              - text: Budżet na lot / osobę (PLN, opcjonalnie)
              - spinbutton "Budżet na lot / osobę (PLN, opcjonalnie)" [ref=e46]
            - button "Znajdź tani lot" [ref=e47] [cursor=pointer]
          - group [ref=e48]:
            - 'generic "Więcej opcji: długość pobytu" [ref=e49] [cursor=pointer]'
    - region [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - paragraph [ref=e53]: "Wylot: dowolne lotnisko"
          - heading "Krótkie wyjazdy · 2–4 noce" [level=2] [ref=e54]
        - generic [ref=e55]: za osobę · PLN
      - paragraph [ref=e56]: W tej sekcji pomijamy loty z brakującymi lub sprzecznymi kluczowymi danymi trasy. Pełny katalog może zawierać takie loty z ostrzeżeniem.
      - button "Zmień lotnisko" [ref=e57] [cursor=pointer]
      - paragraph [ref=e58]: Lotnisko wybierasz w wyszukiwarce. Ten sam wybór stosujemy do propozycji poniżej i zapamiętujemy na tym urządzeniu.
      - article [ref=e60]:
        - generic [ref=e62]: W obie strony
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 – pt., 4 gru 2026 3 noce 213,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony Zobacz szczegóły lotu" [ref=e64] [cursor=pointer]':
          - /url: /deals/browser-13
          - paragraph [ref=e65]: Wrocław (WRO) →
          - heading [level=2] [ref=e66]:
            - text: Barcelona
            - img "Hiszpania" [ref=e67]
          - paragraph [ref=e68]: "Daty oferty: wt., 1 gru 2026 – pt., 4 gru 2026"
          - paragraph [ref=e69]: 3 noce
          - generic [ref=e70]:
            - paragraph [ref=e71]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e72]': ≈ 48 €
              - generic [ref=e73]: za osobę · w obie strony
            - generic [ref=e74]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e75]: →
        - paragraph [ref=e76]:
          - strong [ref=e77]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e78]:
          - paragraph [ref=e79]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e80]: 1.11.2026, 11:05
            - text: (czas w Polsce).
          - paragraph [ref=e81]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e82]:
          - note [ref=e83]:
            - strong [ref=e84]: Niepełne dane lotu
          - paragraph [ref=e85]:
            - strong [ref=e86]: Wylot
            - text: · WRO → BCN · Bez przesiadek
          - paragraph [ref=e87]:
            - strong [ref=e88]: Powrót
            - text: "· BCN → WRO · Liczba przesiadek: 1"
          - paragraph [ref=e89]: brak godziny
          - paragraph [ref=e90]: Przylot szacowany
        - paragraph [ref=e91]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e92]:
          - generic "Szczegóły lotu i ceny" [ref=e93] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e94] [cursor=pointer]':
          - /url: /deals/browser-13#score
          - generic [ref=e95]: Jak porównujemy cenę? ⓘ
      - paragraph [ref=e96]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
      - status [ref=e97]: "Liczba propozycji na 2–4 noce: 1."
      - paragraph [ref=e98]: Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.
      - paragraph [ref=e99]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione. Sprawdź godziny lotów i potrzebne dni urlopu.
      - paragraph [ref=e100]:
        - link "Zobacz wszystkie loty na 2–4 noce →" [ref=e101] [cursor=pointer]:
          - /url: /deals?origin=&duration_min=2&duration_max=4
    - region [ref=e102]:
      - heading "Kolekcje na krótki wyjazd" [level=2] [ref=e103]
      - navigation "Pomysły na krótki wyjazd" [ref=e104]:
        - link "City break na 2–4 noce" [ref=e105] [cursor=pointer]:
          - /url: /city-break
        - link "Tanie loty na weekend" [ref=e106] [cursor=pointer]:
          - /url: /tanie-loty-na-weekend
        - link "Warszawa — oba lotniska" [ref=e107] [cursor=pointer]:
          - /url: /from/warszawa
      - paragraph [ref=e108]:
        - link "Zobacz loty ze wszystkich lotnisk →" [ref=e109] [cursor=pointer]:
          - /url: /deals
    - region [ref=e110]:
      - heading "Kierunki" [level=2] [ref=e111]
      - list [ref=e112]:
        - listitem [ref=e113]:
          - link "Barcelona" [ref=e114] [cursor=pointer]:
            - /url: /destinations/barcelona
            - img "Pawilony wejściowe Parku Güell z panoramą Barcelony" [ref=e116]
            - generic [ref=e117]: Barcelona →
          - group [ref=e118]:
            - 'generic "Zdjęcie: essetefano" [ref=e119] [cursor=pointer]'
        - listitem [ref=e120]:
          - link "Rzym" [ref=e121] [cursor=pointer]:
            - /url: /destinations/rome
            - img "Wnętrze Koloseum w Rzymie" [ref=e123]
            - generic [ref=e124]: Rzym →
          - group [ref=e125]:
            - 'generic "Zdjęcie: Sebastian Straub" [ref=e126] [cursor=pointer]'
      - link "Mediolan" [ref=e128] [cursor=pointer]:
        - /url: /destinations/milan
    - region [ref=e129]:
      - heading "Zaplanuj podróż" [level=2] [ref=e130]
      - paragraph [ref=e131]: "Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy."
      - generic [ref=e132]:
        - link "Policz budżet podróży" [ref=e133] [cursor=pointer]:
          - /url: /info/trip-budget#calculator
        - link "Zapisane wyjazdy" [ref=e134] [cursor=pointer]:
          - /url: /saved
    - region [ref=e135]:
      - heading "Jak działa HopTrip" [level=2] [ref=e136]
      - list [ref=e137]:
        - listitem [ref=e138]: Wyszukaj lot według lotniska, dat i budżetu.
        - listitem [ref=e139]: Porównaj oferty i sprawdź szczegóły wybranego lotu.
        - listitem [ref=e140]: Zaplanuj koszty podróży. Dostępność i warunki rezerwacji potwierdź u partnera.
    - region [ref=e141]:
      - heading "Poradniki i pomoc" [level=2] [ref=e142]
      - generic [ref=e143]:
        - link "Jak oceniamy ofertę" [ref=e144] [cursor=pointer]:
          - /url: /info/price-comparison
        - link "Świeżość ofert" [ref=e145] [cursor=pointer]:
          - /url: /info/price-freshness
        - link "Współpraca partnerska" [ref=e146] [cursor=pointer]:
          - /url: /info/partners
        - link "Wszystkie poradniki" [ref=e147] [cursor=pointer]:
          - /url: /info
    - group [ref=e148]:
      - generic "Lotniska wylotu" [ref=e149] [cursor=pointer]
  - contentinfo [ref=e150]:
    - generic [ref=e151]:
      - generic [ref=e152]: HopTrip.
      - paragraph [ref=e153]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e154]:
      - link "Jak działa HopTrip" [ref=e155] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e156] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e157] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e158] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e159] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e160] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e161] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e162] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e163] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e164] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e165] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e167] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e173] [cursor=pointer]
  - alert [ref=e177]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {writeFileSync} from 'node:fs';
  4  | import {destinationImages,imageryCopy} from '../src/lib/destination-imagery';
  5  | import {destinationLabel} from '../src/lib/destinations';
  6  | import {localizedHref,pageLocales} from '../src/lib/i18n/routing';
  7  | import type {Destination} from '../src/lib/api';
  8  | 
  9  | test.setTimeout(90000);
  10 | test.beforeEach(async({page})=>{
  11 |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  12 | });
  13 | 
  14 | for(const locale of ['pl','en','ru','uk'] as const)test(`destination photographs preserve links, reserved layout and credits in ${locale}`,async({page,request},info)=>{
  15 |  const errors:string[]=[],external:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  16 |  page.on('request',r=>{if(r.resourceType()==='image'&&!r.url().startsWith('http://127.0.0.1:3125')&&!r.url().startsWith('http://127.0.0.1:3125')&&!r.url().startsWith('data:'))external.push(r.url());});
  17 |  let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
  18 |  await page.route('**/_next/image?*',async route=>{await gate;await route.continue();});
  19 |  try{
  20 |   await page.goto(localizedHref('/',locale),{waitUntil:'domcontentloaded'});
  21 |   await expect(page.locator('.hero h1')).toBeVisible();await expect(page.locator('.hero button[type="submit"]')).toBeEnabled();
  22 |   const destinations:Destination[]=await(await request.get('http://127.0.0.1:8125/api/v1/destinations')).json();
  23 |   const section=page.locator('section:has(> #home-destinations)');
  24 |   for(const d of destinations){
  25 |    const route=pageLocales(`/destinations/${d.slug}`).includes(locale)?`/destinations/${d.slug}`:`/deals?destination=${encodeURIComponent(d.slug)}`;
  26 |    await expect(section.locator(`a[href="${localizedHref(route,locale)}"]`)).toHaveCount(1);
  27 |   }
  28 |   const img=section.getByAltText(destinationImages.rome.alt[locale]);
  29 |   await expect(img).toHaveAttribute('loading','lazy');await expect(img).toHaveAttribute('width','960');await expect(img).toHaveAttribute('height','600');
  30 |   await expect(img).toHaveAttribute('sizes',/max-width/);await expect(img).toHaveAttribute('srcset',/640w/);
  31 |   expect(await page.locator('link[rel="preload"][as="image"]').count()).toBe(0);
  32 |   await img.scrollIntoViewIfNeeded();const before=await img.boundingBox();expect(before!.height).toBeGreaterThan(100);
  33 |   expect(before!.width/before!.height).toBeCloseTo(1.6,1);
  34 |   release();await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  35 |   const after=await img.boundingBox();expect(after!.width).toBeCloseTo(before!.width,1);expect(after!.height).toBeCloseTo(before!.height,1);
  36 |   const card=section.locator('li').filter({has:img});
> 37 |   await card.locator('summary').focus();await page.keyboard.press('Enter');
     |                                 ^ Error: locator.focus: Test timeout of 90000ms exceeded.
  38 |   await expect(card.getByRole('link',{name:destinationImages.rome.title,exact:true})).toHaveAttribute('href',destinationImages.rome.source);
  39 |   await expect(card.getByRole('link',{name:'CC BY 3.0',exact:true})).toHaveAttribute('href',destinationImages.rome.licenseUrl);
  40 |   await expect(card).toContainText(imageryCopy[locale].edited);
  41 |   expect((await new AxeBuilder({page}).include('.destination-links').analyze()).violations).toEqual([]);
  42 |   await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  43 |   if(locale==='pl')await section.screenshot({path:info.outputPath('destinations-320.png'),scale:'css',animations:'disabled'});
  44 |   writeFileSync(info.outputPath(`image-${locale}.json`),JSON.stringify({before,after,currentSrc:await img.evaluate(el=>(el as HTMLImageElement).currentSrc),external,errors},null,2));
  45 |   const rome=destinations.find(d=>d.slug==='rome')!;
  46 |   const link=card.getByRole('link',{name:destinationLabel(rome,locale),exact:true});await link.focus();await expect(link).toHaveCSS('outline-width','3px');await page.keyboard.press('Enter');
  47 |   await expect(page).toHaveURL(locale==='pl'?/\/destinations\/rome$/:new RegExp(`/${locale}/deals\\?destination=rome$`));
  48 |   await expect(page.locator('.deal-card img:not(.country-flag)')).toHaveCount(0);expect(errors).toEqual([]);expect(external).toEqual([]);
  49 |  }finally{release();}
  50 | });
  51 | 
  52 | test('failed local image retains destination action and layout without retry or remote fallback',async({page},info)=>{
  53 |  await page.route('**/_next/image?*',route=>route.abort('failed'));
  54 |  await page.goto('/');const section=page.locator('section:has(> #home-destinations)');
  55 |  const card=section.locator('li').filter({hasText:'Sebastian Straub'});
  56 |  await card.scrollIntoViewIfNeeded();await expect(card.getByText(imageryCopy.pl.unavailable,{exact:true})).toBeVisible();
  57 |  await expect(card.locator('img')).toHaveCount(0);await expect(card.locator('a[href="/destinations/rome"]')).toBeVisible();
  58 |  const frame=await card.locator('a[href="/destinations/rome"] > span').first().boundingBox();expect(frame!.width/frame!.height).toBeCloseTo(1.6,1);
  59 |  await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  60 |  await card.screenshot({path:info.outputPath('fallback-320.png'),scale:'css',animations:'disabled'});
  61 | });
  62 | 
  63 | test('all local WebP assets and credits ship with bounded responsive responses',async({request},info)=>{
  64 |  const sizes=[];
  65 |  for(const image of Object.values(destinationImages)){
  66 |   const original=await request.get(image.src);expect(original.status()).toBe(200);expect(original.headers()['content-type']).toContain('image/webp');
  67 |   expect((await original.body()).length).toBeLessThanOrEqual(110000);
  68 |   for(const width of [384,640]){
  69 |    const response=await request.get(`/_next/image?url=${encodeURIComponent(image.src)}&w=${width}&q=75`,{headers:{accept:'image/webp'}});
  70 |    expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');
  71 |    const bytes=(await response.body()).length;expect(bytes).toBeLessThanOrEqual(110000);sizes.push({src:image.src,width,bytes});
  72 |   }
  73 |  }
  74 |  const credits=await request.get('/media/destinations/CREDITS.md');expect(credits.status()).toBe(200);expect(await credits.text()).toContain('Sebastian Straub');
  75 |  writeFileSync(info.outputPath('response-sizes.json'),JSON.stringify(sizes,null,2));
  76 | });
  77 | 
```