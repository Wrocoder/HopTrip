# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: budget-modes.spec.ts >> quick and detailed budgets retain all costs in pl
- Location: tests\budget-modes.spec.ts:10:56

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('budget-total')
Expected pattern: /1\D?640[,.]50/
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('budget-total') with timeout 5000ms
  - waiting for getByTestId('budget-total')

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
    - paragraph: "Daty oferty: pon., 30 lis 2026"
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
        - time: sob., 31 paź 2026, 19:11
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
        - strong: U partnera ustaw 2 dorosłych.
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
        - textbox "Zameldowanie" [invalid]: 2026-11-30
        - text: Wymeldowanie
        - textbox "Wymeldowanie" [invalid]
        - status: Wybierz datę wymeldowania późniejszą niż zameldowanie.
        - text: Dorośli
        - spinbutton "Dorośli": "2"
      - paragraph: Sprawdź ponownie ceny noclegu i lotu dla zmienionego planu. Wpisane kwoty pozostają w budżecie.
      - paragraph:
        - strong: Barcelona
        - text: ": pon., 30 lis 2026 – Wybierz datę · dorośli: 2."
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
        - strong: 30 lis 2026 – Daty nieustalone
      - strong: Daty podróży
      - button "Inne daty"
      - paragraph: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
      - text: Od
      - textbox "Od" [invalid]: 2026-11-30
      - text: Do
      - textbox "Do" [invalid]
      - text: Kategoria
      - combobox "Kategoria":
        - option "Wszystkie" [selected]
        - option "Muzyka"
        - option "Sport"
        - option "Kultura"
      - button "Pokaż wydarzenia"
      - status:
        - paragraph: Wybierz poprawny okres do 31 dni, nie dalej niż 365 dni naprzód.
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
      - paragraph: Znana cena lotu jest kopiowana z oferty na osobę, bez ponownego dodawania powrotu. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
      - group "Tryb kalkulatora":
        - button "Szybki budżet" [pressed]
        - button "Szczegółowy budżet"
      - paragraph: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
      - group: Jak liczymy koszty?
      - paragraph: Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.
      - group "Twój plan podróży":
        - text: Twój plan podróży Początek pobytu (opcjonalnie)
        - textbox "Początek pobytu (opcjonalnie)" [invalid]: 2026-11-30
        - text: Koniec pobytu (opcjonalnie)
        - textbox "Koniec pobytu (opcjonalnie)" [invalid]
        - paragraph: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
        - paragraph: "Uzupełnij obie daty: koniec nie może być wcześniejszy niż początek; pobyt może obejmować najwyżej 365 dni."
        - text: Liczba dorosłych Od 1 do 50 osób
        - textbox "Liczba dorosłych": "2"
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
          - option "Za jedną noc — cała grupa"
          - option "Za cały pobyt — cała grupa" [selected]
        - text: Nocleg (PLN) Łączna cena wszystkich nocy, gości i pokoi. Uwzględnij podatki i opłaty; tej kwoty nie mnożymy przez osoby ani noce.
        - textbox "Nocleg (PLN)":
          - /placeholder: Nieznane
          - text: "900"
        - text: "Wpisana kwota — do weryfikacji Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie. Dojazdy i transport (PLN) Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
        - textbox "Dojazdy i transport (PLN)":
          - /placeholder: Nieznane
          - text: "100"
        - text: Wpisana kwota — do weryfikacji Jedzenie i wydatki dzienne (PLN) Na osobę dziennie
        - textbox "Jedzenie i wydatki dzienne (PLN)":
          - /placeholder: Nieznane
          - text: "40"
        - text: Wpisana kwota — do weryfikacji
        - group: "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa"
      - status:
        - heading "Szacowany budżet całej grupy (PLN)" [level=3]
        - paragraph: Popraw zaznaczone pola i daty, aby obliczyć budżet.
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
      - strong: Cena o 49,75 zł poniżej mediany próby.
      - text: "Mediana: 250,00 zł."
    - paragraph: "Liczba obserwacji: 24. Próg porównania: 5; próbka nie obejmuje całego rynku."
    - group: Zakres i wiarygodność porównania
    - paragraph:
      - text: "Pierwszy zapis tej ceny w HopTrip:"
      - time: sob., 31 paź 2026, 19:11
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
  1  | import {test,expect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {budgetText} from '../src/lib/i18n/budget-copy';
  4  | import {emptyBudget} from '../src/lib/trip-budget';
  5  | 
  6  | test.beforeEach(async({page})=>{
  7  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  8  | });
  9  | 
  10 | for(const locale of ['pl','en','ru','uk'] as const)test(`quick and detailed budgets retain all costs in ${locale}`,async({page},testInfo)=>{
  11 |  const t=(source:string)=>budgetText(locale,source);
  12 |  await page.setViewportSize({width:320,height:844});
  13 |  await page.goto(`${locale==='pl'?'':`/${locale}`}/deals/browser-deal#calculator`);
  14 |  const modes=page.getByRole('group',{name:t('Tryb kalkulatora')});
  15 |  const quick=modes.getByRole('button',{name:t('Szybki budżet'),exact:true});
  16 |  const detailed=modes.getByRole('button',{name:t('Szczegółowy budżet'),exact:true});
  17 |  await expect(quick).toHaveAttribute('aria-pressed','true');
  18 |  await expect(page.locator('#budget-flight')).toHaveValue('200.25');
  19 |  await expect(page.locator('#budget-taxes')).not.toBeVisible();
  20 |  await page.locator('#budget-people').fill('2');
  21 |  await page.locator('#budget-hotel-basis').selectOption('stay');
  22 |  for(const [key,value] of Object.entries({hotel_total:'900',transfers:'100',food:'40'}))await page.locator(`#budget-${key}`).fill(value);
> 23 |  await expect(page.getByTestId('budget-total')).toContainText(/1\D?640[,.]50/);
     |                                                 ^ Error: expect(locator).toContainText(expected) failed
  24 |  await expect(page.locator('#calculator').getByRole('status')).toContainText(t('Budżet niepełny. Do uzupełnienia:'));
  25 |  await page.locator('#calculator').screenshot({path:testInfo.outputPath(`quick-${locale}.png`)});
  26 |  await detailed.focus();await page.keyboard.press('Enter');
  27 |  await expect(detailed).toHaveAttribute('aria-pressed','true');
  28 |  for(const [key,value] of Object.entries({baggage:'20',local_transport:'10',activities:'30',other:'50',taxes:'12,34',buffer:'100'}))await page.locator(`#budget-${key}`).fill(value);
  29 |  await expect(page.getByTestId('budget-total')).toContainText(/1\D?922[,.]84/);
  30 |  await expect(page.getByTestId('budget-person')).toContainText(/961[,.]42/);
  31 |  await expect(page.locator('#calculator').getByRole('status')).not.toContainText(t('Budżet niepełny. Do uzupełnienia:'));
  32 |  await page.locator('#calculator').screenshot({path:testInfo.outputPath(`detailed-${locale}.png`)});
  33 |  await quick.click();
  34 |  await expect(page.locator('#budget-taxes')).not.toBeVisible();
  35 |  await expect(page.getByTestId('budget-total')).toContainText(/1\D?922[,.]84/);
  36 |  await page.reload();await detailed.click();
  37 |  await expect(page.locator('#budget-taxes')).toHaveValue('12,34');
  38 |  await expect(page.locator('#budget-flight')).toHaveValue('200.25');
  39 |  await expect(page.getByTestId('budget-total')).toContainText(/1\D?922[,.]84/);
  40 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  41 |  expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
  42 | });
  43 | 
  44 | test('hidden invalid detailed costs can be reached and corrected from quick budget',async({page})=>{
  45 |  await page.goto('/info/trip-budget#calculator');
  46 |  const modes=page.getByRole('group',{name:'Tryb kalkulatora'});
  47 |  await modes.getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
  48 |  await page.locator('#budget-taxes').fill('-1');
  49 |  await modes.getByRole('button',{name:'Szybki budżet',exact:true}).click();
  50 |  await expect(page.getByTestId('budget-total')).toHaveCount(0);
  51 |  await expect(page.locator('#calculator')).toContainText('Błąd w dodatkowych kosztach.');
  52 |  await page.locator('#calculator > p').filter({hasText:'Błąd w dodatkowych kosztach.'}).getByRole('button').click();
  53 |  await expect(page.locator('#budget-taxes')).toBeVisible();
  54 |  await expect(page.locator('#budget-taxes')).toHaveAttribute('aria-invalid','true');
  55 |  await page.locator('#budget-taxes').fill('0');
  56 |  await expect(page.getByTestId('budget-total')).toContainText('0,00');
  57 |  await page.getByRole('button',{name:'Wyczyść kalkulator',exact:true}).click();
  58 |  await expect(page.locator('#budget-taxes')).toHaveValue('');
  59 |  await expect(page.locator('#budget-buffer')).toHaveValue('');
  60 | });
  61 | 
  62 | test('legacy plan and new taxes/buffer survive save/share without reallocating old contingency',async({page,browser})=>{
  63 |  const input:Partial<typeof emptyBudget>={...emptyBudget,flight:'100',people:'3',other:'50'};
  64 |  delete input.taxes;delete input.buffer;
  65 |  const old={version:1,input,start:'2030-05-01',end:'2030-05-03',context:'legacy',review:false};
  66 |  await page.addInitScript(d=>localStorage.setItem('hoptrip.budget.v1:deal:browser-deal',JSON.stringify(d)),old);
  67 |  await page.goto('/deals/browser-deal#calculator');
  68 |  const modes=page.getByRole('group',{name:'Tryb kalkulatora'});
  69 |  await modes.getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
  70 |  await expect(page.locator('#budget-other')).toHaveValue('50');
  71 |  await expect(page.locator('#budget-taxes')).toHaveValue('');
  72 |  await expect(page.locator('#budget-buffer')).toHaveValue('');
  73 |  await expect(page.getByTestId('budget-total')).toContainText('350,00');
  74 |  await page.locator('#budget-taxes').fill('12,34');await page.locator('#budget-buffer').fill('100');
  75 |  await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  76 |  await page.getByRole('button',{name:'Udostępnij',exact:true}).click();
  77 |  const url=await page.locator('#trip-share-link').inputValue();
  78 |  const context=await browser.newContext();
  79 |  try{
  80 |   const copy=await context.newPage();await copy.goto(url);
  81 |   await expect(copy.getByTestId('budget-total')).toContainText('462,34');
  82 |   await copy.getByRole('group',{name:'Tryb kalkulatora'}).getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
  83 |   await expect(copy.locator('#budget-other')).toHaveValue('50');
  84 |   await expect(copy.locator('#budget-taxes')).toHaveValue('12,34');
  85 |   await copy.locator('#budget-buffer').fill('200');
  86 |   await expect(copy.getByTestId('budget-total')).toContainText('562,34');
  87 |  }finally{await context.close();}
  88 |  await page.goto('/saved');await page.locator('main a[href^="/trip?plan="]').first().click();
  89 |  await expect(page.getByTestId('budget-total')).toContainText('462,34');
  90 | });
  91 | 
```