# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: trip-budget.spec.ts >> flight links to the budget calculator
- Location: tests\trip-budget.spec.ts:104:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/deals\/browser-deal#calculator$/
Received string:  "http://127.0.0.1:3125/deals/browser-deal"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="pl" data-scroll-behavior="smooth" class="bodyfont_b28f32cc-module__HxCUtq__variable headingfont_80a9613f-module__yIfleW__variable">…</html>
       - unexpected value "http://127.0.0.1:3125/deals/browser-deal"

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
- region "Twój wybór prywatności":
  - heading "Twój wybór prywatności" [level=2]
  - paragraph: Korzystaj z ofert także bez opcjonalnych zgód. Wybór możesz zmienić w ustawieniach prywatności.
  - checkbox "Analityka HopTrip — statystyki korzystania z ofert."
  - text: Analityka HopTrip — statystyki korzystania z ofert.
  - checkbox "Travelpayouts Drive — marketing partnerski."
  - text: Travelpayouts Drive — marketing partnerski.
  - group: Jak działają zgody i partnerzy
  - button "Odrzuć opcjonalne"
  - button "Akceptuj wszystkie"
  - button "Zapisz wybór"
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
        - textbox "Zameldowanie" [invalid]: 2026-11-30
        - text: Wymeldowanie
        - textbox "Wymeldowanie" [invalid]
        - status: Wybierz datę wymeldowania późniejszą niż zameldowanie.
        - text: Dorośli
        - spinbutton "Dorośli": "1"
      - paragraph:
        - strong: Barcelona
        - text: ": pon., 30 lis 2026 – Wybierz datę · dorośli: 1."
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
      - paragraph: Zmiany zapisujemy automatycznie w tej przeglądarce, osobno dla każdej oferty.
      - group "Twój plan podróży":
        - text: Twój plan podróży Początek pobytu (opcjonalnie)
        - textbox "Początek pobytu (opcjonalnie)" [invalid]: 2026-11-30
        - text: Koniec pobytu (opcjonalnie)
        - textbox "Koniec pobytu (opcjonalnie)" [invalid]
        - paragraph: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
        - paragraph: "Uzupełnij obie daty: koniec nie może być wcześniejszy niż początek; pobyt może obejmować najwyżej 365 dni."
        - text: Liczba dorosłych Od 1 do 50 osób
        - textbox "Liczba dorosłych": "1"
        - text: Liczba nocy Od 0 do 365 nocy
        - textbox "Liczba nocy": "2"
        - text: Liczba dni wydatków Od 1 do 365 dni, także dni przylotu i odlotu
        - textbox "Liczba dni wydatków": "3"
        - paragraph:
          - checkbox "Wszyscy podróżni są dorośli" [checked]
          - text: Wszyscy podróżni są dorośli
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
  7   |  await page.goto("/info/trip-budget#calculator");
  8   |  const calculator=page.getByRole("region",{name:"Kalkulator budżetu podróży"});
  9   |  await expect(calculator.getByRole("status")).toContainText("Budżet niepełny");
  10  |  await calculator.getByText("Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa",{exact:true}).click();
  11  |  for(const [id,value] of Object.entries({flight:"300",baggage:"50",hotel:"200",transfers:"100",local_transport:"0",food:"40",activities:"30",other:"100",taxes:"0",buffer:"0"}))
  12  |   await page.locator(`#budget-${id}`).fill(value);
  13  |  await expect(page.getByTestId("budget-total")).toHaveText(/1\s*600,00\s*zł/);
  14  |  await expect(page.getByTestId("budget-person")).toHaveText(/800,00\s*zł/);
  15  |  await expect(calculator.getByRole("status")).not.toContainText("Budżet niepełny");
  16  |  await page.locator("#budget-flight").fill("-1");
  17  |  await expect(page.locator("#budget-flight")).toHaveAttribute("aria-invalid","true");
  18  |  await expect(page.getByTestId("budget-total")).toHaveCount(0);
  19  |  await page.locator("#budget-flight").fill("300,50");
  20  |  await expect(page.getByTestId("budget-total")).toHaveText(/1\s*601,00\s*zł/);
  21  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  22  |  expect((await new AxeBuilder({page}).include("#calculator").analyze()).violations).toEqual([]);
  23  |  await page.getByRole("button",{name:"Wyczyść kalkulator"}).click();
  24  |  await expect(page.locator("#budget-flight")).toHaveValue("");
  25  |  await expect(calculator.getByRole("status")).toContainText("Budżet niepełny");
  26  | });
  27  | 
  28  | test("draft survives reload, stays separate per offer and reset persists",async({page})=>{
  29  |  await page.goto("/deals/browser-deal#calculator");
  30  |  await page.locator("#budget-hotel").fill("210,50");
  31  |  await page.locator("#budget-people").fill("3");
  32  |  await page.reload();
  33  |  await expect(page.locator("#budget-hotel")).toHaveValue("210,50");
  34  |  await expect(page.locator("#budget-people")).toHaveValue("3");
  35  |  await expect(page.getByTestId("budget-review")).toBeVisible();
  36  |  await page.goto("/deals/browser-2#calculator");
  37  |  await expect(page.locator("#budget-hotel")).toHaveValue("");
  38  |  await page.locator("#budget-hotel").fill("99");
  39  |  await page.goto("/info/trip-budget#calculator");
  40  |  await expect(page.locator("#budget-hotel")).toHaveValue("");
  41  |  await page.goto("/deals/browser-deal#calculator");
  42  |  await expect(page.locator("#budget-hotel")).toHaveValue("210,50");
  43  |  await page.getByRole("button",{name:"Wyczyść kalkulator"}).click();
  44  |  await page.reload();
  45  |  await expect(page.locator("#budget-hotel")).toHaveValue("");
  46  |  await expect(page.locator("#budget-flight")).toHaveValue("");
  47  |  await expect(page.getByTestId("budget-review")).toHaveCount(0);
  48  |  await page.goto("/deals/browser-2#calculator");
  49  |  await expect(page.locator("#budget-hotel")).toHaveValue("99");
  50  | });
  51  | 
  52  | test("date and party edits flag prices and keep whole-stay costs unchanged",async({page},testInfo)=>{
  53  |  await page.goto("/info/trip-budget#calculator");
  54  |  await page.locator("#budget-hotel-basis").selectOption("stay");
  55  |  await page.locator("#budget-hotel_total").fill("900,01");
  56  |  await page.locator("#budget-start").fill("2027-01-15");
  57  |  await expect(page.getByTestId("budget-total")).toHaveCount(0);
  58  |  await page.locator("#budget-end").fill("2027-01-17");
  59  |  await expect(page.locator("#budget-nights")).toHaveValue("2");
  60  |  await expect(page.locator("#budget-days")).toHaveValue("3");
  61  |  await page.locator("#budget-people").fill("3");
  62  |  await expect(page.getByTestId("budget-total")).toHaveText(/900,01/);
  63  |  await expect(page.getByTestId("budget-person")).toHaveText(/300,00/);
  64  |  await expect(page.getByTestId("budget-review")).toBeVisible();
  65  |  await page.getByRole("button",{name:"Kwoty sprawdzone dla tego planu"}).click();
  66  |  await page.reload();
  67  |  await expect(page.locator("#budget-end")).toHaveValue("2027-01-17");
  68  |  await expect(page.locator("#budget-hotel_total")).toHaveValue("900,01");
  69  |  await expect(page.getByTestId("budget-review")).toHaveCount(0);
  70  |  await page.locator("#budget-end").fill("2027-01-14");
  71  |  await expect(page.getByTestId("budget-total")).toHaveCount(0);
  72  |  await page.locator("#budget-end").fill("2027-01-18");
  73  |  await expect(page.locator("#budget-nights")).toHaveValue("3");
  74  |  await expect(page.getByTestId("budget-review")).toBeVisible();
  75  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  76  |  await page.locator("#calculator").screenshot({path:testInfo.outputPath("budget-draft.png")});
  77  | });
  78  | 
  79  | test("unavailable or corrupt storage never prevents calculation",async({page})=>{
  80  |  await page.addInitScript(()=>Object.defineProperty(window,"localStorage",{get(){throw new Error("storage blocked");}}));
  81  |  await page.goto("/info/trip-budget#calculator");
  82  |  await page.locator("#budget-flight").fill("100");
  83  |  await expect(page.getByTestId("budget-total")).toHaveText(/200,00/);
  84  |  await expect(page.locator("#calculator")).toContainText("Nie udało się zapisać zmian");
  85  | });
  86  | 
  87  | test("invalid draft and changed offer metadata are handled explicitly",async({page})=>{
  88  |  await page.addInitScript(()=>localStorage.setItem("hoptrip.budget.v1:standalone","{broken"));
  89  |  await page.goto("/info/trip-budget#calculator");
  90  |  await expect(page.locator("#calculator")).toContainText("Nie udało się odczytać szkicu");
  91  |  await page.goto("/deals/browser-deal#calculator");
  92  |  await page.locator("#budget-flight").fill("321");
  93  |  await page.evaluate(()=>{
  94  |   const key="hoptrip.budget.v1:deal:browser-deal";
  95  |   const draft=JSON.parse(localStorage.getItem(key)!);
  96  |   draft.context="older offer dates or price";
  97  |   localStorage.setItem(key,JSON.stringify(draft));
  98  |  });
  99  |  await page.reload();
  100 |  await expect(page.locator("#budget-flight")).toHaveValue("321");
  101 |  await expect(page.getByTestId("budget-review")).toBeVisible();
  102 | });
  103 | 
  104 | test("flight links to the budget calculator",async({page})=>{
  105 |  await page.goto("/deals/browser-deal");
  106 |  await page.locator('.trip-navigation a[href="#calculator"]').click();
> 107 |  await expect(page).toHaveURL(/\/deals\/browser-deal#calculator$/);
      |                     ^ Error: expect(page).toHaveURL(expected) failed
  108 |  await expect(page.getByRole("heading",{name:"Kalkulator budżetu podróży"})).toBeVisible();
  109 |  await expect(page.locator("#budget-flight")).toHaveValue("200.25");
  110 |  await expect(page.locator("#budget-people")).toHaveValue("1");
  111 | });
  112 | test("reference fare fills only local transport and preserves manual amounts",async({page})=>{
  113 |  await page.route("https://api.nbp.pl/**",route=>route.fulfill({json:{table:"A",currency:"euro",code:"EUR",rates:[{no:"fixture",effectiveDate:new Date().toISOString().slice(0,10),mid:4}]}}));
  114 |  await page.goto("/deals/browser-deal#calculator");
  115 |  await page.setViewportSize({width:320,height:740});
  116 |  await page.getByText("Sprawdź orientacyjne koszty na miejscu",{exact:true}).click();
  117 |  await page.getByRole("button",{name:"Uzupełnij transport miejski w PLN"}).click();
  118 |  await expect(page.locator("#budget-local_transport")).toHaveValue("52.00");
  119 |  await expect(page.locator("#budget-transfers")).toHaveValue("");
  120 |  await page.locator("#budget-local_transport").fill("75");
  121 |  await expect(page.getByRole("button",{name:"Uzupełnij transport miejski w PLN"})).toBeDisabled();
  122 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  123 | });
  124 | test("lodging total survives mode changes and is counted only once",async({page})=>{
  125 |  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  126 |  await page.setViewportSize({width:320,height:740});
  127 |  await page.goto("/info/trip-budget#calculator");
  128 |  await page.locator("#budget-hotel").fill("100");
  129 |  await page.locator("#budget-hotel-basis").selectOption("stay");
  130 |  await expect(page.locator("#budget-hotel_total")).toHaveValue("");
  131 |  await page.locator("#budget-hotel_total").fill("1000,01");
  132 |  await page.locator("#budget-people").fill("3");
  133 |  await page.locator("#budget-nights").fill("7");
  134 |  await expect(page.getByTestId("budget-total")).toHaveText(/1\s*000,01\s*zł/);
  135 |  await page.locator("#budget-hotel-basis").selectOption("night");
  136 |  await expect(page.locator("#budget-hotel")).toHaveValue("100");
  137 |  await expect(page.getByTestId("budget-total")).toHaveText(/700,00\s*zł/);
  138 |  await page.locator("#budget-hotel-basis").selectOption("stay");
  139 |  await expect(page.locator("#budget-hotel_total")).toHaveValue("1000,01");
  140 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  141 |  expect((await new AxeBuilder({page}).include("#calculator").analyze()).violations).toEqual([]);
  142 |  await page.getByRole("button",{name:"Wyczyść kalkulator"}).click();
  143 |  await expect(page.locator("#budget-hotel-basis")).toHaveValue("night");
  144 |  await page.locator("#budget-hotel-basis").selectOption("stay");
  145 |  await expect(page.locator("#budget-hotel_total")).toHaveValue("");
  146 | });
  147 | 
```