# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: detail-layout.spec.ts >> pl: flight decision precedes planning without hiding critical warnings or losing the shared plan
- Location: tests\detail-layout.spec.ts:16:56

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator: locator('#trip-booking').locator('a.cta')
Expected: in viewport
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeInViewport" locator('#trip-booking').locator('a.cta') with timeout 5000ms
  - waiting for locator('#trip-booking').locator('a.cta')

```

```yaml
- link "Przejdź do treści":
  - /url: "#content"
- banner:
  - link "HopTrip — strona główna":
    - /url: /
    - text: HopTrip
  - navigation "Nawigacja główna":
    - link "Tanie loty":
      - /url: /deals
    - link "Na weekend":
      - /url: /tanie-loty-na-weekend
    - link "Kierunki":
      - /url: /#home-destinations
    - link "Zapisane":
      - /url: /saved
    - link "Kalkulator budżetu":
      - /url: /info/trip-budget
  - navigation "Język":
    - link "Polski":
      - /url: /deals/browser-13?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
    - link "Русский":
      - /url: /ru/deals/browser-13?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
    - link "English":
      - /url: /en/deals/browser-13?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
    - link "Українська":
      - /url: /uk/deals/browser-13?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
- main:
  - link "← Aktualne okazje":
    - /url: /deals?origin=WRO&offset=12&sort=price
  - article:
    - paragraph: W obie strony
    - heading "Wrocław (WRO) → Barcelona Hiszpania" [level=1]:
      - text: Wrocław (WRO) → Barcelona
      - img "Hiszpania"
    - paragraph: "Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026"
    - paragraph: 3 noce planowanego pobytu — daty noclegu sprawdź osobno.
    - navigation "Sekcje planu podróży":
      - link "Lot":
        - /url: "#trip-flight"
      - link "Do partnera":
        - /url: "#trip-booking"
      - link "Nocleg":
        - /url: "#accommodation"
      - link "Atrakcje":
        - /url: "#destination-activities"
      - link "Wydarzenia":
        - /url: "#trip-events"
      - link "Budżet":
        - /url: "#calculator"
      - link "Zapisz":
        - /url: "#trip-save"
      - link "Porównanie ceny":
        - /url: "#score"
    - region "Cena lotu":
      - paragraph: za osobę · PLN
      - paragraph: 213,00 zł ≈ 48 € za osobę · w obie strony
      - paragraph:
        - text: "Czas zapisanej obserwacji:"
        - time: sob., 31 paź 2026, 18:02
        - text: (czas w Polsce).
      - paragraph: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
      - group: Pochodzenie i czas wycofania oferty
      - paragraph:
        - strong: Brak wiarygodnego porównania tej ceny z historią.
      - heading "Szczegóły lotu" [level=2]
      - paragraph:
        - strong: Wylot
        - text: "· 30 lis: WRO 11:00 → BCN 13:00 Bez przesiadek"
      - paragraph:
        - strong: Powrót
        - text: "· 3 gru: BCN 11:00 → WRO 13:00 Bez przesiadek"
      - paragraph: Godziny lokalne
      - paragraph: "Wylot: Ryanair (FR 123) · Powrót: Ryanair (FR 124)"
      - paragraph: Bez noclegu · bagaż do sprawdzenia
      - group: Pełne dane lotu i bagaż
    - region "Przejście do partnera":
      - heading "Przejście do partnera" [level=2]
      - text: Współpraca partnerska
      - paragraph: 213,00 zł ≈ 48 € za osobę · w obie strony
      - status:
        - paragraph: Link do rezerwacji nie jest jeszcze dostępny.
        - link "Wróć do katalogu lotów":
          - /url: /deals
      - paragraph: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - region "Znajdź nocleg — Barcelona":
      - heading "Znajdź nocleg — Barcelona" [level=2]
      - paragraph: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
      - group: Jak dobrać daty noclegu do lotu?
      - group "Daty pobytu i dorośli":
        - text: Daty pobytu i dorośli Zameldowanie
        - textbox "Zameldowanie": 2026-11-30
        - text: Wymeldowanie
        - textbox "Wymeldowanie": 2026-12-03
        - text: Dorośli
        - spinbutton "Dorośli": "1"
      - paragraph:
        - strong: Barcelona
        - text: ": pon., 30 lis 2026 – czw., 3 gru 2026 · 3 noce · dorośli: 1."
      - link "Znajdź nocleg przez Stay22 (nowa karta)":
        - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-11-30&checkout=2026-12-03&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
      - paragraph: Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.
      - group: Jak dodać cenę noclegu do planu?
      - link "Dodaj koszt noclegu do budżetu podróży":
        - /url: "#budget-hotel-basis"
    - region "Muzea i atrakcje":
      - paragraph: Pomysły na pobyt · Barcelona
      - heading "Muzea i atrakcje" [level=2]
      - paragraph: Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.
      - list:
        - listitem:
          - text: Architektura
          - heading "Casa Batlló — bilet Blue" [level=3]
          - paragraph: Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.
          - paragraph:
            - strong: "Dla kogo:"
            - text: Dla osób zainteresowanych architekturą Gaudíego i zwiedzaniem z audioprzewodnikiem.
          - paragraph:
            - strong: "Czas wizyty:"
            - text: Około 1 godziny dla wariantu Blue; bez dojazdu i oczekiwania na wejście.
          - paragraph: Wariant Blue nie obejmuje tarasu na dachu, tabletu VR ani wejścia bez kolejki. Sprawdź godzinę wejścia i język audioprzewodnika.
          - paragraph: Cena do sprawdzenia w Tiqets
          - paragraph: Link afiliacyjny — możemy otrzymać prowizję za zakup.
          - 'link "Sprawdź daty i cenę w Tiqets: Casa Batlló — bilet Blue (nowa karta)"':
            - /url: https://tiqets.tpx.gr/JikjB3NX
            - text: Sprawdź daty i cenę
          - paragraph:
            - link "Źródło informacji o czasie wizyty (nowa karta)":
              - /url: https://www.casabatllo.es/en/visit/faqs/
        - listitem:
          - text: Akwarium
          - heading "Aquarium Barcelona — bilet wstępu" [level=3]
          - paragraph: "Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą."
          - paragraph:
            - strong: "Dla kogo:"
            - text: Dla rodzin i osób ciekawych morskiej przyrody; propozycja zwiedzania pod dachem.
          - paragraph:
            - strong: "Czas wizyty:"
            - text: Orientacyjnie 1,5–2 godziny na zwiedzanie; bez dojazdu i kolejki.
          - paragraph: Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.
          - paragraph: Cena do sprawdzenia w Tiqets
          - paragraph: Link afiliacyjny — możemy otrzymać prowizję za zakup.
          - 'link "Sprawdź daty i cenę w Tiqets: Aquarium Barcelona — bilet wstępu (nowa karta)"':
            - /url: https://tiqets.tpx.gr/ALlisode
            - text: Sprawdź daty i cenę
          - paragraph:
            - link "Źródło informacji o czasie wizyty (nowa karta)":
              - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
        - listitem:
          - text: Przyroda · bezpłatny wstęp
          - heading "Hivernacle — oranżeria w parku Ciutadella" [level=3]
          - paragraph: Zabytkowa oranżeria z kolekcjami roślin w parku Ciutadella.
          - paragraph:
            - strong: "Dla kogo:"
            - text: Dla miłośników roślin i spokojnego spaceru wśród zieleni.
          - paragraph: Bezpłatny wstęp dotyczy samodzielnej wizyty. Sprawdź godziny i zamknięcia; wycieczki z przewodnikiem mają osobne zasady i rezerwacje.
          - paragraph: "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony."
          - 'link "Sprawdź zasady wizyty: Hivernacle — oranżeria w parku Ciutadella (nowa karta)"':
            - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
            - text: Sprawdź zasady wizyty
      - paragraph: Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu, ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.
      - paragraph: Opisy i zasady sprawdzono pon., 12 paź 2026. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.
      - paragraph: W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.
      - link "Uwzględnij atrakcje w budżecie":
        - /url: "#calculator"
    - region "Wydarzenia w terminie podróży":
      - heading "Wydarzenia w terminie podróży" [level=2]
      - paragraph: Koncerty, sport i kultura w mieście docelowym. Bilety na wydarzenia kupujesz osobno.
      - text: Ticketmaster
      - paragraph:
        - text: Twój pobyt · Barcelona
        - strong: 30 lis 2026 – 3 gru 2026
      - strong: Daty podróży
      - button "Inne daty"
      - paragraph: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
      - text: Od
      - textbox "Od": 2026-11-30
      - text: Do
      - textbox "Do": 2026-12-03
      - text: Kategoria
      - combobox "Kategoria":
        - option "Wszystkie" [selected]
        - option "Muzyka"
        - option "Sport"
        - option "Kultura"
      - button "Pokaż wydarzenia"
      - text: Przeglądaj dni
      - combobox "Przeglądaj dni":
        - option "Wszystkie dni" [selected]
        - option "pon., 30 lis"
        - option "wt., 1 gru"
        - option "śr., 2 gru"
        - option "czw., 3 gru"
      - button "Poprzedni dzień" [disabled]: ←
      - button "Następny dzień": →
      - status:
        - paragraph: Nie znaleźliśmy pasujących ofert ze zweryfikowanym linkiem do biletów dla tych dat.
      - heading "Co możesz zrobić dalej?" [level=3]
      - paragraph: Pokazujemy oferty z Ticketmaster z poprawnym linkiem do biletów. Katalog nie obejmuje wszystkich organizatorów, wydarzeń i terminów. Pusta lista nie oznacza, że w mieście nic się nie dzieje.
      - button "Zmień okres wyszukiwania"
      - link "Zobacz atrakcje w mieście":
        - /url: "#destination-activities"
      - group: Przed rezerwacją
      - paragraph: "Linki partnerskie: HopTrip może otrzymać prowizję od zakupu. Dostępność biletów i zasady wstępu potwierdź u sprzedawcy."
    - navigation "Zaplanuj pobyt":
      - heading "Zaplanuj pobyt" [level=2]
      - list:
        - listitem:
          - 'link "Barcelona: BCN, Girona czy Reus"':
            - /url: /info/barcelona-airports
        - listitem:
          - 'link "Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu"':
            - /url: /info/barcelona-3-days
    - region "Kalkulator budżetu podróży":
      - heading "Kalkulator budżetu podróży" [level=2]
      - paragraph: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
      - group: Jak liczymy koszty?
      - paragraph: Zmiany zapisujemy automatycznie w tej przeglądarce, osobno dla każdej oferty.
      - group "Twój plan podróży":
        - text: Twój plan podróży Początek pobytu (opcjonalnie)
        - textbox "Początek pobytu (opcjonalnie)": 2026-11-30
        - text: Koniec pobytu (opcjonalnie)
        - textbox "Koniec pobytu (opcjonalnie)": 2026-12-03
        - paragraph: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
        - text: Liczba dorosłych Od 1 do 50 osób
        - textbox "Liczba dorosłych": "1"
        - text: Liczba nocy Od 0 do 365 nocy
        - textbox "Liczba nocy": "3"
        - text: Liczba dni wydatków Od 1 do 365 dni, także dni przylotu i odlotu
        - textbox "Liczba dni wydatków": "4"
        - paragraph:
          - checkbox "Wszyscy podróżni są dorośli" [checked]
          - text: Wszyscy podróżni są dorośli
        - group: Sprawdź orientacyjne koszty na miejscu
        - heading "Główne koszty" [level=3]
        - text: Loty (PLN) Na osobę, za wszystkie planowane odcinki
        - textbox "Loty (PLN)":
          - /placeholder: Nieznane
          - text: "213.00"
        - text: Jak podana jest cena noclegu?
        - combobox "Jak podana jest cena noclegu?":
          - option "Za jedną noc — cała grupa" [selected]
          - option "Za cały pobyt — cała grupa"
        - text: Nocleg (PLN) Za jedną noc dla całej grupy (wszystkie pokoje)
        - textbox "Nocleg (PLN)":
          - /placeholder: Nieznane
        - text: "Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie. Dojazdy i transport (PLN) Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
        - textbox "Dojazdy i transport (PLN)":
          - /placeholder: Nieznane
        - text: Jedzenie i wydatki dzienne (PLN) Na osobę dziennie
        - textbox "Jedzenie i wydatki dzienne (PLN)":
          - /placeholder: Nieznane
        - group: "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa"
      - status:
        - paragraph:
          - text: "Suma znanych kosztów:"
          - strong: 213,00 zł
        - paragraph:
          - text: "Na osobę przy równym podziale (w zaokrągleniu):"
          - strong: 213,00 zł
        - paragraph: "Budżet niepełny. Do uzupełnienia: Bagaż i dodatki do lotu, Nocleg, Dojazdy i transport, Transport miejski, Jedzenie i wydatki dzienne, Atrakcje i bilety wstępu, Inne koszty i rezerwa."
      - group: Rozbicie kosztów całej grupy
      - paragraph: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
      - button "Wyczyść kalkulator"
      - region "Zapisz i udostępnij wyjazd":
        - heading "Zachowaj plan podróży" [level=3]
        - paragraph: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
        - button "Zapisz wyjazd"
        - button "Udostępnij"
        - link "Zapisane wyjazdy":
          - /url: /saved
        - paragraph
    - heading "Cena na tle historii" [level=2]
    - paragraph:
      - strong: Brak wiarygodnego porównania tej ceny z historią.
    - paragraph: Liczba obserwacji nieznana. Brak wystarczającej, zgodnej bazy porównawczej.
    - group: Zakres i wiarygodność porównania
    - paragraph:
      - text: "Czas zapisanej obserwacji:"
      - time: sob., 31 paź 2026, 18:02
      - text: (czas w Polsce). Źródło czasu nieznane.
    - paragraph: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
    - paragraph: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
    - paragraph: Dla tej starszej oceny nie zapisano pełnego, zgodnego zestawu składników. Nie możemy rzetelnie odtworzyć punktów. Wyjaśnienie pojawi się po ponownym przeliczeniu oferty.
    - group: Co porównujemy, a czego nie uwzględniamy?
    - link "Pełna metodologia porównania cen →":
      - /url: /info/price-comparison
- contentinfo:
  - text: HopTrip.
  - paragraph: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
  - navigation "Informacje o serwisie":
    - link "Jak działa HopTrip":
      - /url: /info
    - link "City break":
      - /url: /city-break
    - link "Loty na weekend":
      - /url: /tanie-loty-na-weekend
    - link "Loty z Warszawy":
      - /url: /from/warszawa
    - link "Zapisane wyjazdy":
      - /url: /saved
    - link "Subskrypcja lotów":
      - /url: /alerts
    - link "O HopTrip":
      - /url: /info/about
    - link "Kontakt":
      - /url: /info/contact
    - link "Prywatność":
      - /url: /info/privacy
    - link "Zasady korzystania":
      - /url: /info/terms
    - link "Współpraca partnerska":
      - /url: /info/partners
  - button "Ustawienia prywatności"
- alert
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {localizedHref} from '../src/lib/i18n/routing';
  4  | import {tripText} from '../src/lib/i18n/trip-copy';
  5  | import {qualityReasonText} from '../src/lib/i18n/quality-copy';
  6  | import {savedTripsKey} from '../src/lib/shared-trip';
  7  | 
  8  | test.beforeEach(async({page})=>{
  9  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  10 | });
  11 | test.afterEach(async({request})=>{
  12 |  await request.post('http://127.0.0.1:8125/__test__/quality?scenario=reset');
  13 |  await request.post('http://127.0.0.1:8125/__test__/compact-card?scenario=normal');
  14 | });
  15 | 
  16 | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: flight decision precedes planning without hiding critical warnings or losing the shared plan`,async({page,request},info)=>{
  17 |  test.setTimeout(180000);
  18 |  await page.setViewportSize(info.project.name==='desktop'?{width:1366,height:900}:{width:390,height:844});
  19 |  const t=(key:Parameters<typeof tripText>[1])=>tripText(locale,key);
  20 |  const nav=page.locator('.trip-navigation'),summary=page.locator('.detail-summary'),booking=page.locator('#trip-booking');
  21 |  for(const scenario of ['complete','partial','critical']){
  22 |   const response=await request.post(`http://127.0.0.1:8125/__test__/quality?scenario=${scenario}`);
  23 |   expect(response.ok()).toBe(true);const {quality}=await response.json();
  24 |   await page.goto(localizedHref('/deals/browser-13?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
  25 |   await expect(page.locator('h1')).toHaveCount(1);
  26 |   await expect(summary.locator('.deal-price')).toBeVisible();
  27 |   await expect(summary.locator('h2')).toHaveText(t('Szczegóły lotu'));
  28 |   await expect(booking.getByRole('heading',{level:2})).toHaveText(t('Przejście do partnera'));
  29 |   await expect(summary.locator('.trip-details')).not.toHaveAttribute('open','');
  30 |   await expect(summary.locator('.price-assessment')).toHaveCount(0);
  31 |   await expect(summary.locator('.price-freshness')).toHaveCount(1);
  32 |   await expect(page.locator('.price-assessment')).toHaveCount(1);
  33 |   const warning=summary.locator('.flight-quality');
  34 |   if(scenario==='complete')await expect(warning).toHaveCount(0);
  35 |   else await expect(warning).toHaveAttribute('data-quality',quality.status);
  36 |   if(scenario==='critical'){
  37 |    await expect(warning.locator('details')).toHaveCount(0);
  38 |    for(const reason of quality.reasons)await expect(warning.getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  39 |   }
  40 |   const ids=['trip-flight','trip-booking','accommodation'];
  41 |   if(await page.locator('#destination-activities').count())ids.push('destination-activities');
  42 |   if(await page.locator('#trip-events').count())ids.push('trip-events');
  43 |   ids.push('calculator','trip-save','score');
  44 |   expect(await page.locator(ids.map(id=>'#'+id).join(',')).evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(ids);
  45 |   await expect(page.locator('.offer-detail > section').last()).toHaveAttribute('id','score');
  46 |   const targets=await nav.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href')!));
  47 |   for(const target of targets){await expect(page.locator(target)).toHaveCount(1);await expect(page.locator(target)).toHaveAttribute('tabindex','-1');}
  48 |   await nav.locator('a[href="#trip-booking"]').focus();await page.keyboard.press('Enter');
> 49 |   await expect(booking).toBeFocused();await expect(booking.locator('a.cta')).toBeInViewport();
     |                                                                              ^ Error: expect(locator).toBeInViewport() failed
  50 |   expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  51 |   if(locale==='pl'&&scenario==='complete'){
  52 |    await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
  53 |    await page.screenshot({path:info.outputPath('detail-first-screen.png'),scale:'css'});
  54 |    await page.locator('.detail-layout').screenshot({path:info.outputPath('flight-decision.png'),scale:'css'});
  55 |   }
  56 |   if(locale==='pl'&&scenario==='critical')await warning.screenshot({path:info.outputPath('critical-warnings.png'),scale:'css'});
  57 |  }
  58 |  // Native anchor focus and existing detail disclosure are still usable by keyboard.
  59 |  await nav.locator('a[href="#trip-flight"]').focus();await page.keyboard.press('Enter');
  60 |  await expect(page.locator('#trip-flight')).toBeFocused();
  61 |  await summary.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');
  62 |  await expect(summary.locator('.flight-facts')).toBeVisible();
  63 |  await nav.locator('a[href="#score"]').focus();await page.keyboard.press('Enter');
  64 |  await expect(page.locator('#score')).toBeFocused();
  65 |  await expect(page.locator('#score .score-sum')).not.toBeVisible();
  66 |  await expect(page.locator('.back-link')).toHaveAttribute('href',localizedHref('/deals?origin=WRO&sort=price&offset=12',locale));
  67 |  // These are existing planning functions, exercised after their sections move.
  68 |  const flight=booking.locator('a.cta'),original=await flight.getAttribute('href');
  69 |  await page.locator('#stay-checkin').fill('2030-05-01');await page.locator('#stay-checkout').fill('2030-05-04');
  70 |  await page.locator('#stay-adults').fill('2');
  71 |  await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('1000');
  72 |  await expect(page.locator('#budget-people')).toHaveValue('2');await expect(page.locator('#budget-nights')).toHaveValue('3');
  73 |  const stay=page.locator('#accommodation a[rel*="sponsored"]');
  74 |  expect(Object.fromEntries(new URL((await stay.getAttribute('href'))!).searchParams)).toMatchObject({adults:'2',checkin:'2030-05-01',checkout:'2030-05-04',aid:'hoptrip',campaign:'hoptrip_accommodation'});
  75 |  await expect(flight).toHaveAttribute('href',original!);
  76 |  await nav.locator('a[href="#trip-save"]').focus();await page.keyboard.press('Enter');
  77 |  await expect(page.locator('#trip-save')).toBeFocused();
  78 |  await page.getByRole('button',{name:t('Zapisz wyjazd'),exact:true}).click();
  79 |  expect(JSON.parse((await page.evaluate(key=>localStorage.getItem(key),savedTripsKey))!)).toHaveLength(1);
  80 |  await page.getByRole('button',{name:t('Udostępnij'),exact:true}).click();
  81 |  const shared=await page.locator('#trip-share-link').inputValue();
  82 |  await page.goto(shared);await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
  83 |  await expect(page.locator('#stay-adults')).toHaveValue('2');
  84 |  await expect(page.locator('.trip-navigation a[href="#trip-booking"],.trip-navigation a[href="#score"]')).toHaveCount(0);
  85 |  await page.reload();await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
  86 |  await page.setViewportSize({width:320,height:844});
  87 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  88 | });
  89 | 
```