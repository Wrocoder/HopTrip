# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-system.spec.ts >> shared visual controls, modal and trip focus in pl
- Location: tests\design-system.spec.ts:13:56

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator: locator('#calculator .modes button[aria-pressed="false"]')
Expected: "rgb(255, 255, 255)"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveCSS" locator('#calculator .modes button[aria-pressed="false"]') with timeout 5000ms
  - waiting for locator('#calculator .modes button[aria-pressed="false"]')

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
      - /url: /deals/browser-deal
    - link "Русский":
      - /url: /ru/deals/browser-deal
    - link "English":
      - /url: /en/deals/browser-deal
    - link "Українська":
      - /url: /uk/deals/browser-deal
- main:
  - link "← Aktualne okazje":
    - /url: /deals
  - article:
    - paragraph: W jedną stronę
    - heading "Wrocław (WRO) → Barcelona Hiszpania" [level=1]:
      - text: Wrocław (WRO) → Barcelona
      - img "Hiszpania"
    - paragraph: "Daty oferty: wt., 1 gru 2026"
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
      - paragraph: 200,25 zł ≈ 46 € za osobę · w jedną stronę
      - paragraph:
        - text: "Pierwszy zapis tej ceny w HopTrip:"
        - time: niedz., 1 lis 2026, 07:32
        - text: (czas w Polsce).
      - paragraph: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
      - group: Pochodzenie i czas wycofania oferty
      - paragraph:
        - strong: Cena o 49,75 zł poniżej mediany próby.
        - text: "Obserwacje: 24. Próba kierunku, nie identycznych taryf ani całego rynku."
      - heading "Szczegóły lotu" [level=2]
      - note:
        - strong: Sprawdź trasę przed wyborem
        - paragraph: Nie można potwierdzić danych trasy ze źródła.
        - list
        - paragraph: Kompletność danych nie potwierdza dostępności u sprzedawcy.
      - paragraph:
        - strong: Wylot
        - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · brak godziny Przesiadki do sprawdzenia u partnera
      - paragraph: "Wylot: Przewoźnik do sprawdzenia"
      - paragraph: Bez noclegu · bagaż do sprawdzenia
      - group: Pełne dane lotu i bagaż
    - region "Przejście do partnera":
      - heading "Przejście do partnera" [level=2]
      - text: Współpraca partnerska
      - paragraph: 200,25 zł ≈ 46 € za osobę · w jedną stronę
      - paragraph:
        - strong: U partnera ustaw 1 dorosłego.
        - text: Link otwiera daty tej oferty. Nie przekazujemy zmian dat ani liczby pasażerów z planu. Sprawdź cenę u partnera.
      - link "Sprawdź lot — Fixture program":
        - /url: http://127.0.0.1:8125/go/browser-deal/flight
      - paragraph: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - region "Znajdź nocleg — Barcelona":
      - heading "Znajdź nocleg — Barcelona" [level=2]
      - paragraph: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
      - paragraph: Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.
      - group: Jak dobrać daty noclegu do lotu?
      - paragraph: To lot w jedną stronę — uzupełnij datę wymeldowania.
      - group "Daty pobytu i dorośli":
        - text: Daty pobytu i dorośli Zameldowanie
        - textbox "Zameldowanie": 2026-12-01
        - text: Wymeldowanie
        - textbox "Wymeldowanie": 2026-12-03
        - text: Dorośli
        - spinbutton "Dorośli": "1"
      - paragraph: Sprawdź ponownie ceny noclegu i lotu dla zmienionego planu. Wpisane kwoty pozostają w budżecie.
      - paragraph:
        - strong: Barcelona
        - text: ": wt., 1 gru 2026 – czw., 3 gru 2026 · 2 noce · dorośli: 1."
      - link "Znajdź nocleg przez Stay22 (nowa karta)":
        - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-12-01&checkout=2026-12-03&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
      - paragraph: Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.
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
        - strong: 1 gru 2026 – 3 gru 2026
      - strong: Daty podróży
      - button "Inne daty"
      - paragraph: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
      - text: Od
      - textbox "Od": 2026-12-01
      - text: Do
      - textbox "Do": 2026-12-03
      - text: Kategoria
      - combobox "Kategoria":
        - option "Wszystkie" [selected]
        - option "Muzyka"
        - option "Sport"
        - option "Kultura"
        - option "Inne"
      - button "Pokaż wydarzenia"
      - text: Przeglądaj dni
      - combobox "Przeglądaj dni":
        - option "Wszystkie dni" [selected]
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
      - paragraph: "Źródło: Ticketmaster · Czas sprawdzenia nieznany"
      - paragraph: Dane katalogu, nie dostępność na żywo. Status sprzedaży i cena od nie gwarantują wolnych biletów; potwierdź je u sprzedawcy. Nieaktywnej lub nieznanej sprzedaży nie dodajemy z listy do planu.
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
      - paragraph: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
      - group "Tryb kalkulatora":
        - button "Szybki budżet" [pressed]
        - button "Szczegółowy budżet"
      - paragraph: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
      - group: Jak liczymy koszty?
      - paragraph: Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.
      - group "Twój plan podróży":
        - text: Twój plan podróży Początek pobytu (opcjonalnie)
        - textbox "Początek pobytu (opcjonalnie)": 2026-12-01
        - text: Koniec pobytu (opcjonalnie)
        - textbox "Koniec pobytu (opcjonalnie)": 2026-12-03
        - paragraph: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
        - text: Liczba dorosłych Od 1 do 50 osób
        - textbox "Liczba dorosłych": "1"
        - text: Liczba nocy Od 0 do 365 nocy
        - textbox "Liczba nocy": "2"
        - text: Liczba dni wydatków Od 1 do 365 dni, także dni przylotu i odlotu
        - textbox "Liczba dni wydatków": "3"
        - paragraph:
          - checkbox "Wszyscy podróżni są dorośli" [checked]
          - text: Wszyscy podróżni są dorośli
        - paragraph: Zmieniono daty, długość pobytu, liczbę osób lub dane oferty. Sprawdź ponownie loty, nocleg, transfery i pozostałe wpisane kwoty. Przeliczenie sumy nie potwierdza cen u sprzedawców.
        - button "Kwoty sprawdzone dla tego planu"
        - group: Sprawdź orientacyjne koszty na miejscu
        - heading "Główne koszty" [level=3]
        - text: Loty (PLN) Na osobę, za wszystkie planowane odcinki
        - textbox "Loty (PLN)":
          - /placeholder: Nieznane
          - text: "200.25"
        - text: Wpisana kwota — do weryfikacji Jak podana jest cena noclegu?
        - combobox "Jak podana jest cena noclegu?":
          - option "Za jedną noc — cała grupa" [selected]
          - option "Za cały pobyt — cała grupa"
        - text: Nocleg (PLN) Za jedną noc dla całej grupy (wszystkie pokoje)
        - textbox "Nocleg (PLN)":
          - /placeholder: Nieznane
        - text: "Nieznane Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie. Dojazdy i transport (PLN) Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
        - textbox "Dojazdy i transport (PLN)":
          - /placeholder: Nieznane
        - text: Nieznane Jedzenie i wydatki dzienne (PLN) Na osobę dziennie
        - textbox "Jedzenie i wydatki dzienne (PLN)":
          - /placeholder: Nieznane
        - text: Nieznane
        - group: "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa"
      - status:
        - heading "Szacowany budżet całej grupy (PLN)" [level=3]
        - paragraph:
          - text: "Suma znanych kosztów:"
          - strong: 200,25 zł
        - paragraph:
          - text: "Na osobę przy równym podziale (w zaokrągleniu):"
          - strong: 200,25 zł
        - paragraph: "Budżet niepełny. Do uzupełnienia: Bagaż i dodatki do lotu, Nocleg, Dojazdy i transport, Transport miejski, Jedzenie i wydatki dzienne, Atrakcje i bilety wstępu, Inne koszty i rezerwa, Podatki i opłaty, Rezerwa awaryjna."
      - group: Rozbicie kosztów całej grupy
      - paragraph: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
      - button "Wyczyść kalkulator"
      - region "Zapisz i udostępnij wyjazd":
        - heading "Zachowaj plan podróży" [level=3]
        - paragraph: Zapis tylko w tym profilu przeglądarki na tym urządzeniu. Usunięcie danych witryny usuwa plany. Zachowaj link, aby otworzyć kopię gdzie indziej.
        - paragraph: Zapis dodaje kopię do listy. Zmiany kalkulatora zapisujemy osobno w tej przeglądarce; zapisz ponownie, aby zachować nową kopię. Otwarcie kopii przywraca też jej lokalny szkic kalkulatora, jeśli istnieje.
        - paragraph: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
        - paragraph: Ta wersja nie jest jeszcze na liście zapisanych wyjazdów.
        - button "Zapisz wyjazd"
        - button "Udostępnij"
        - link "Zapisane wyjazdy":
          - /url: /saved
        - paragraph
    - heading "Cena na tle historii" [level=2]
    - paragraph:
      - strong: Cena o 49,75 zł poniżej mediany próby.
      - text: "Mediana: 250,00 zł."
    - paragraph: "Liczba obserwacji: 24. Próg porównania: 5; próbka nie obejmuje całego rynku."
    - group: Zakres i wiarygodność porównania
    - paragraph:
      - text: "Pierwszy zapis tej ceny w HopTrip:"
      - time: niedz., 1 lis 2026, 07:32
      - text: (czas w Polsce).
    - paragraph: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
    - paragraph: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
    - group: Jak działa pomocniczy wynik sortowania?
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
  1   | import {test,expect} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {writeFileSync} from 'node:fs';
  4   | import {localizedHref} from '../src/lib/i18n/routing';
  5   | import {encodeTrip,savedTripsKey} from '../src/lib/shared-trip';
  6   | import {emptyBudget} from '../src/lib/trip-budget';
  7   | 
  8   | test.setTimeout(90000);
  9   | test.beforeEach(async({page})=>{
  10  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  11  | });
  12  | 
  13  | for(const locale of ['pl','en','ru','uk'] as const)test(`shared visual controls, modal and trip focus in ${locale}`,async({page},info)=>{
  14  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  15  |  await page.goto(localizedHref('/deals?origin=WRO',locale));
  16  |  await page.mouse.move(0,0);
  17  |  const primary=page.locator('.filters button[type="submit"]');
  18  |  await expect(primary).toBeEnabled();
  19  |  await expect(primary).toHaveCSS('background-color','rgb(36, 92, 64)');
  20  |  await expect(primary).toHaveCSS('color','rgb(255, 255, 255)');
  21  |  await expect(primary).toHaveCSS('border-radius','10px');
  22  |  expect((await primary.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  23  |  const card=page.locator('.deal-card').first();
  24  |  await expect(card).toHaveCSS('border-radius','16px');
  25  |  const trigger=card.locator('.score-trigger');
  26  |  await trigger.focus();await page.keyboard.press('Enter');
  27  |  const dialog=page.locator('.score-dialog[open]');
  28  |  await expect(dialog).toBeVisible();await expect(dialog).toHaveCSS('border-radius','24px');
  29  |  await expect(dialog.locator('.score-close')).toBeFocused();
  30  |  await page.keyboard.press('Shift+Tab');
  31  |  const firstTab=await page.evaluate(()=>({inside:!!document.activeElement?.closest('dialog[open]'),browser:!document.hasFocus()&&document.activeElement===document.body}));
  32  |  expect(firstTab.inside||firstTab.browser).toBe(true);
  33  |  // Native Chrome may visit browser chrome at the boundary; page controls stay inert.
  34  |  if(firstTab.browser)await page.keyboard.press('Shift+Tab');
  35  |  expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog[open]'))).toBe(true);
  36  |  expect((await new AxeBuilder({page}).include('.score-dialog[open]').analyze()).violations).toEqual([]);
  37  |  if(locale==='pl')await dialog.screenshot({path:info.outputPath('dialog.png'),scale:'css',animations:'disabled'});
  38  |  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  39  |  const departure=new Date();departure.setUTCDate(departure.getUTCDate()+1);
  40  |  await page.locator('.filters input[name="departure_from"]').fill(departure.toISOString().slice(0,10));
  41  |  const submitted=page.waitForResponse(r=>r.request().method()==='POST'&&!!r.request().headers()['next-action']);
  42  |  await primary.click();await submitted;await expect(page).toHaveURL(/departure_from=/);
  43  |  await expect(primary).toBeEnabled();
  44  |  await page.goto(localizedHref('/deals/browser-deal',locale));
  45  |  await expect(page.locator('#budget-start')).toBeEnabled();
  46  |  const day=await page.locator('#budget-start').inputValue();
  47  |  const end=new Date(`${day}T12:00:00Z`);end.setUTCDate(end.getUTCDate()+2);
  48  |  await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
  49  |  for(const selector of ['#stay-checkin','#budget-flight','#budget-hotel-basis']){
  50  |   const field=page.locator(selector);
  51  |   await expect(field).toHaveCSS('border-radius','10px');await expect(field).toHaveCSS('border-top-color','rgb(117, 139, 129)');
  52  |   await expect(field).toHaveCSS('background-color','rgb(252, 253, 251)');
  53  |   expect((await field.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  54  |  }
  55  |  const secondary=page.locator('#calculator .modes button[aria-pressed="false"]');
  56  |  await page.mouse.move(0,0);
> 57  |  await expect(secondary).toHaveCSS('background-color','rgb(255, 255, 255)');
      |                          ^ Error: expect(locator).toHaveCSS(expected) failed
  58  |  await expect(secondary).toHaveCSS('color','rgb(36, 92, 64)');
  59  |  await secondary.focus();await expect(secondary).toHaveCSS('outline-width','3px');
  60  |  await page.locator('#budget-flight').fill('-1');
  61  |  await expect(page.locator('#budget-flight')).toHaveCSS('border-top-color','rgb(161, 38, 34)');
  62  |  const disabled=page.locator('#trip-save button').first();await expect(disabled).toBeDisabled();
  63  |  await disabled.hover({force:true});await expect(disabled).toHaveCSS('transform','none');
  64  |  await page.locator('#budget-flight').fill('100');
  65  |  await page.setViewportSize({width:320,height:844});
  66  |  const skip=page.locator('.skip-link');
  67  |  await skip.focus();await expect(skip).toBeInViewport();
  68  |  await page.locator('#budget-flight').focus();await expect(skip).not.toBeInViewport();
  69  |  await expect(skip).toHaveCSS('transform','none');await expect(skip).toHaveCSS('transition-duration','0s');
  70  |  const focus=await page.evaluate(()=>{
  71  |   const skip=document.querySelector('.skip-link')!,field=document.querySelector('#budget-flight')!;
  72  |   return {activeId:document.activeElement?.id,skipRect:skip.getBoundingClientRect().toJSON(),skipTop:getComputedStyle(skip).top,outline:getComputedStyle(field).outline,shadow:getComputedStyle(field).boxShadow};
  73  |  });
  74  |  writeFileSync(info.outputPath(`focus-${locale}.json`),JSON.stringify(focus,null,2));
  75  |  expect((await new AxeBuilder({page}).include('#calculator').include('#accommodation').analyze()).violations).toEqual([]);
  76  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  77  |  if(locale==='pl')await page.locator('#calculator').screenshot({path:info.outputPath('calculator-320.png'),scale:'css',animations:'disabled'});
  78  |  expect(errors).toEqual([]);
  79  | });
  80  | 
  81  | test('empty/error/notice states, reduced motion and forced-colors keep shared cues',async({page},info)=>{
  82  |  await page.goto('/deals?budget=1');
  83  |  const empty=page.locator('.offer-state[data-state="empty"]');
  84  |  await expect(empty).toBeVisible();await expect(empty).toHaveCSS('border-top-style','dashed');
  85  |  // Exercise the shipped loading-line CSS without a public demo route or timed provider call.
  86  |  await empty.evaluate(el=>{const line=document.createElement('div');line.className='loading-line';line.setAttribute('aria-hidden','true');el.append(line);});
  87  |  await page.emulateMedia({reducedMotion:'reduce'});
  88  |  expect(await page.locator('.loading-line').evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  89  |  await page.goto('/deals/unavailable-fixture');
  90  |  const error=page.locator('.offer-state[data-state="error"]');
  91  |  await expect(error).toBeVisible();await expect(error).toHaveCSS('background-color','rgb(255, 241, 237)');
  92  |  await expect(error).toHaveCSS('border-left-color','rgb(161, 38, 34)');
  93  |  const token=encodeTrip({version:1,offer:{slug:'missing-offer',origin:'Warsaw',destination:'Barcelona',start:'2020-01-01',end:'2020-01-03',price:'100',observedAt:''},
  94  |   draft:{version:1,input:{...emptyBudget,flight:'100'},start:'2020-01-01',end:'2020-01-03',context:'',review:true}})!;
  95  |  await page.evaluate(({key,token})=>localStorage.setItem(key,JSON.stringify([token])),{key:savedTripsKey,token});
  96  |  await page.goto('/saved');
  97  |  const saved=page.locator('main > ul > li');await expect(saved).toHaveCSS('border-radius','16px');
  98  |  const warning=saved.locator('p').filter({hasText:'Data zapisanego lotu już minęła.'});
  99  |  await expect(warning).toHaveCSS('color','rgb(109, 67, 14)');await expect(warning).toHaveCSS('background-color','rgb(255, 247, 231)');
  100 |  await page.setViewportSize({width:320,height:844});
  101 |  await page.locator('main h2').focus();await expect(page.locator('.skip-link')).not.toBeInViewport();
  102 |  await page.locator('main').screenshot({path:info.outputPath('saved-focus-320.png'),scale:'css',animations:'disabled'});
  103 |  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  104 |  await page.goto('/deals');await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();
  105 |  await expect(page.locator('.skip-link')).toBeInViewport();await page.keyboard.press('Enter');
  106 |  await expect(page.locator('#content')).toBeFocused();await expect(page.locator('.skip-link')).not.toBeInViewport();
  107 |  await page.emulateMedia({forcedColors:'active'});
  108 |  const select=page.locator('.sort-control select');await select.focus();
  109 |  await expect(select).toHaveCSS('outline-style','solid');await expect(select).toHaveCSS('outline-width','3px');await expect(select).toHaveCSS('box-shadow','none');
  110 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  111 | });
  112 | 
```