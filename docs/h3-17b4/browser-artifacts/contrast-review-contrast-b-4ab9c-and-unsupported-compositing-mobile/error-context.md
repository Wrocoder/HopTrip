# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contrast-review.spec.ts >> contrast bounds reject low contrast and unsupported compositing
- Location: tests\contrast-review.spec.ts:106:5

# Error details

```
Error: expect(received).rejects.toThrow(expected)

Expected substring: "Unsupported gradient"
Received message:   "locator.evaluate: Error: Unsupported compositing:H2
    at conservativeContrast (eval at evaluate (:311:30), <anonymous>:18:253)
    at UtilityScript.evaluate (<anonymous>:313:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)"

      at conservativeContrast (eval at evaluate (:311:30), <anonymous>:18:253)
      at UtilityScript.evaluate (<anonymous>:313:16)
      at UtilityScript.<anonymous> (<anonymous>:1:44)
      at tests/contrast-review.spec.ts:118:22
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
        - /url: /destinations
      - link "Zapisane" [ref=e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=e13]:
      - link "Polski" [ref=e14] [cursor=pointer]:
        - /url: /deals/browser-deal
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals/browser-deal
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals/browser-deal
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals/browser-deal
  - main [ref=e19]:
    - link "← Aktualne okazje" [ref=e20] [cursor=pointer]:
      - /url: /deals
    - article [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: W jedną stronę
        - heading [level=1] [ref=e24]:
          - text: Wrocław (WRO) → Barcelona
          - img "Hiszpania" [ref=e25]
        - paragraph [ref=e26]: "Daty wylotów: sob., 5 gru 2026"
      - navigation "Sekcje planu podróży" [ref=e27]:
        - link "Lot" [ref=e28] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "Do partnera" [ref=e29] [cursor=pointer]:
          - /url: "#trip-booking"
        - link "Nocleg" [ref=e30] [cursor=pointer]:
          - /url: "#accommodation"
        - link "Atrakcje" [ref=e31] [cursor=pointer]:
          - /url: "#destination-activities"
        - link "Wydarzenia" [ref=e32] [cursor=pointer]:
          - /url: "#trip-events"
        - link "Budżet" [ref=e33] [cursor=pointer]:
          - /url: "#calculator"
        - link "Zapisz" [ref=e34] [cursor=pointer]:
          - /url: "#trip-save"
        - link "Porównanie ceny" [ref=e35] [cursor=pointer]:
          - /url: "#score"
      - generic [ref=e36]:
        - region "Cena lotu" [ref=e37]:
          - paragraph [ref=e38]: za osobę · PLN
          - paragraph [ref=e39]:
            - text: 200,25 zł
            - 'generic "Orientacyjnie 46 €. Średni kurs NBP z czw., 5 lis 2026: 1 EUR = 4,3916 PLN. Kurs płatności może się różnić." [ref=e40]':
              - generic [aria-hidden] [ref=e41]: ≈ 46 €
            - generic [ref=e43]: za osobę · w jedną stronę
          - generic [ref=e44]:
            - paragraph [ref=e45]:
              - text: "Pierwszy zapis tej ceny w HopTrip:"
              - time [ref=e46]: czw., 5 lis 2026, 14:24
              - text: (czas w Polsce).
            - paragraph [ref=e47]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
            - group [ref=e48]:
              - generic "Pochodzenie i czas wycofania oferty" [ref=e49] [cursor=pointer]
          - paragraph [ref=e50]:
            - strong [ref=e51]: Cena o 49,75 zł poniżej mediany próby.
            - text: "Obserwacje: 24. Próba kierunku, nie identycznych taryf ani całego rynku."
          - heading "Szczegóły lotu" [level=2] [ref=e52]
          - generic [ref=e53]:
            - note [ref=e54]:
              - strong [ref=e55]: Sprawdź trasę przed wyborem
              - paragraph [ref=e56]: Nie można potwierdzić danych trasy ze źródła.
              - list
              - paragraph [ref=e57]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
            - paragraph [ref=e58]:
              - strong [ref=e59]: Wylot
              - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · brak godziny
              - generic [ref=e60]: Przesiadki do sprawdzenia u partnera
            - paragraph [ref=e62]: Czas i koszt dojazdu nieznane — sprawdź transport na datę podróży.
            - paragraph [ref=e63]: "Wylot: Przewoźnik do sprawdzenia"
          - paragraph [ref=e64]: Cena dotyczy lotu. Nocleg nie jest wliczony.
          - paragraph [ref=e65]: Bagaż do sprawdzenia
          - group [ref=e66]:
            - generic "Pełne dane lotu i bagaż" [ref=e67] [cursor=pointer]
        - region [ref=e68]:
          - heading "Przejście do partnera" [level=2] [ref=e69]
          - generic [ref=e70]: Współpraca partnerska
          - generic [ref=e71]:
            - paragraph [ref=e72]:
              - text: 200,25 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z czw., 5 lis 2026: 1 EUR = 4,3916 PLN. Kurs płatności może się różnić." [ref=e73]':
                - generic [aria-hidden] [ref=e74]: ≈ 46 €
              - generic [ref=e76]: za osobę · w jedną stronę
            - paragraph [ref=e77]:
              - strong [ref=e78]: U partnera ustaw 1 dorosłego.
              - text: Link otwiera ofertę partnera. Nie przekazujemy zmian dat ani liczby pasażerów z planu. Sprawdź daty i cenę u partnera.
            - link "Sprawdź lot — Fixture program" [ref=e79] [cursor=pointer]:
              - /url: http://127.0.0.1:8125/go/browser-deal/flight
          - paragraph [ref=e80]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
      - region [ref=e81]:
        - heading "Znajdź nocleg — Barcelona" [level=2] [ref=e82]
        - paragraph [ref=e83]: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
        - paragraph [ref=e84]: Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.
        - group [ref=e85]:
          - generic "Jak dobrać daty noclegu do lotu?" [ref=e86] [cursor=pointer]
        - paragraph [ref=e87]: To lot w jedną stronę — uzupełnij datę wymeldowania.
        - group "Daty pobytu i dorośli" [ref=e88]:
          - generic [ref=e90]:
            - generic [ref=e91]:
              - generic [ref=e92]: Zameldowanie
              - textbox "Zameldowanie" [invalid] [ref=e93]: 2026-12-05
            - generic [ref=e94]:
              - generic [ref=e95]: Wymeldowanie
              - textbox "Wymeldowanie" [invalid] [ref=e96]
              - status [ref=e97]: Wybierz datę wymeldowania późniejszą niż zameldowanie.
            - generic [ref=e98]:
              - generic [ref=e99]: Dorośli
              - spinbutton "Dorośli" [ref=e100]: "1"
        - paragraph [ref=e102]:
          - strong [ref=e103]: Barcelona
          - text: ": sob., 5 gru 2026 – Wybierz datę · dorośli: 1."
        - paragraph [ref=e104]: Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.
        - paragraph [ref=e105]: Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.
        - group [ref=e106]:
          - generic "Jak dodać cenę noclegu do planu?" [ref=e107] [cursor=pointer]
        - link "Dodaj koszt noclegu do budżetu podróży" [ref=e108] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=e109]:
        - paragraph [ref=e110]: Pomysły na pobyt · Barcelona
        - heading "Muzea i atrakcje" [level=2] [ref=e111]
        - paragraph [ref=e112]: Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.
        - list [ref=e113]:
          - listitem [ref=e114]:
            - generic [ref=e115]: Architektura
            - heading "Casa Batlló — bilet Blue" [level=3] [ref=e116]
            - paragraph [ref=e117]: Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.
            - paragraph [ref=e118]:
              - strong [ref=e119]: "Dla kogo:"
              - text: Dla osób zainteresowanych architekturą Gaudíego i zwiedzaniem z audioprzewodnikiem.
            - paragraph [ref=e120]:
              - strong [ref=e121]: "Czas wizyty:"
              - text: Około 1 godziny dla wariantu Blue; bez dojazdu i oczekiwania na wejście.
            - paragraph [ref=e122]: Wariant Blue nie obejmuje tarasu na dachu, tabletu VR ani wejścia bez kolejki. Sprawdź godzinę wejścia i język audioprzewodnika.
            - generic [ref=e123]:
              - paragraph [ref=e124]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=e125]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Casa Batlló — bilet Blue (nowa karta)" [ref=e126] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Sprawdź daty i cenę
              - paragraph [ref=e127]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=e128] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=e129]:
            - generic [ref=e130]: Akwarium
            - heading "Aquarium Barcelona — bilet wstępu" [level=3] [ref=e131]
            - paragraph [ref=e132]: "Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą."
            - paragraph [ref=e133]:
              - strong [ref=e134]: "Dla kogo:"
              - text: Dla rodzin i osób ciekawych morskiej przyrody; propozycja zwiedzania pod dachem.
            - paragraph [ref=e135]:
              - strong [ref=e136]: "Czas wizyty:"
              - text: Orientacyjnie 1,5–2 godziny na zwiedzanie; bez dojazdu i kolejki.
            - paragraph [ref=e137]: Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.
            - generic [ref=e138]:
              - paragraph [ref=e139]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=e140]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Aquarium Barcelona — bilet wstępu (nowa karta)" [ref=e141] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Sprawdź daty i cenę
              - paragraph [ref=e142]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=e143] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=e144]:
            - generic [ref=e145]: Przyroda · bezpłatny wstęp
            - heading "Hivernacle — oranżeria w parku Ciutadella" [level=3] [ref=e146]
            - paragraph [ref=e147]: Zabytkowa oranżeria z kolekcjami roślin w parku Ciutadella.
            - paragraph [ref=e148]:
              - strong [ref=e149]: "Dla kogo:"
              - text: Dla miłośników roślin i spokojnego spaceru wśród zieleni.
            - paragraph [ref=e150]: Bezpłatny wstęp dotyczy samodzielnej wizyty. Sprawdź godziny i zamknięcia; wycieczki z przewodnikiem mają osobne zasady i rezerwacje.
            - generic [ref=e151]:
              - paragraph [ref=e152]: "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony."
              - 'link "Sprawdź zasady wizyty: Hivernacle — oranżeria w parku Ciutadella (nowa karta)" [ref=e153] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Sprawdź zasady wizyty
        - paragraph [ref=e154]: Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu, ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.
        - paragraph [ref=e155]: Zmiany dat i składu grupy w planie nie są automatycznie przekazywane w tym linku. Sprawdź termin, uczestników i cenę u partnera.
        - paragraph [ref=e156]: Opisy i zasady sprawdzono pon., 12 paź 2026. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.
        - paragraph [ref=e157]: W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.
        - link "Uwzględnij atrakcje w budżecie" [ref=e158] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=e159]:
        - generic [ref=e160]:
          - generic [ref=e161]:
            - heading "Wydarzenia w terminie podróży" [level=2] [ref=e162]
            - paragraph [ref=e163]: Koncerty, sport i kultura w mieście docelowym. Bilety na wydarzenia kupujesz osobno.
          - generic [ref=e164]: Ticketmaster
        - paragraph [ref=e165]:
          - generic [ref=e166]: Twój pobyt · Barcelona
          - strong [ref=e167]: 5 gru 2026 – Daty nieustalone
        - generic [ref=e168]:
          - strong [ref=e169]: Daty podróży
          - button "Inne daty" [ref=e170] [cursor=pointer]
        - paragraph [ref=e171]: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
        - generic [ref=e172]:
          - generic [ref=e173]:
            - text: Od
            - textbox "Od" [invalid] [ref=e174]: 2026-12-05
          - generic [ref=e175]:
            - text: Do
            - textbox "Do" [invalid] [ref=e176]
          - generic [ref=e177]:
            - text: Kategoria
            - combobox "Kategoria" [ref=e178]:
              - option "Wszystkie" [selected]
              - option "Muzyka"
              - option "Sport"
              - option "Kultura"
              - option "Inne"
          - button "Pokaż wydarzenia" [ref=e179] [cursor=pointer]
        - generic [ref=e181]:
          - text: Zgodność z lotem
          - combobox "Zgodność z lotem" [ref=e182]:
            - option "Wszystkie wydarzenia" [selected]
            - option "Może pasować do lotu"
        - paragraph [ref=e183]: Ten tryb ukrywa tylko pewne kolizje z lotem. Wydarzenia z małym zapasem lub brakującymi danymi pozostają widoczne. Formalności na lotnisku i dojazd do miejsca wymagają sprawdzenia; udział nie jest gwarantowany.
        - status [ref=e184]:
          - paragraph [ref=e185]: Wybierz poprawny okres do 31 dni, nie dalej niż 365 dni naprzód.
        - group [ref=e186]:
          - generic "Przed rezerwacją" [ref=e187] [cursor=pointer]
        - paragraph [ref=e188]: "Linki partnerskie: HopTrip może otrzymać prowizję od zakupu. Dostępność biletów i zasady wstępu potwierdź u sprzedawcy."
        - paragraph [ref=e189]: Zmiany dat i składu grupy w planie nie są automatycznie przekazywane w tym linku. Sprawdź termin, uczestników i cenę u partnera.
      - navigation "Zaplanuj pobyt" [ref=e190]:
        - heading "Zaplanuj pobyt" [level=2] [ref=e191]
        - list [ref=e192]:
          - listitem [ref=e193]:
            - 'link "Barcelona: BCN, Girona czy Reus" [ref=e194] [cursor=pointer]':
              - /url: /info/barcelona-airports
          - listitem [ref=e195]:
            - 'link "Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu" [ref=e196] [cursor=pointer]':
              - /url: /info/barcelona-3-days
      - region [ref=e197]:
        - heading "Kalkulator budżetu podróży" [level=2] [ref=e198]
        - paragraph [ref=e199]: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
        - paragraph [ref=e200]: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
        - group "Tryb kalkulatora" [ref=e201]:
          - button "Szybki budżet" [pressed] [ref=e202] [cursor=pointer]
          - button "Szczegółowy budżet" [ref=e203] [cursor=pointer]
        - paragraph [ref=e204]: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
        - group [ref=e205]:
          - generic "Jak liczymy koszty?" [ref=e206] [cursor=pointer]
        - paragraph [ref=e207]: Zmiany zapisujemy automatycznie w tej przeglądarce, osobno dla każdej oferty.
        - group "Twój plan podróży" [ref=e208]:
          - generic [ref=e210]:
            - generic [ref=e211]:
              - generic [ref=e212]: Początek pobytu (opcjonalnie)
              - textbox "Początek pobytu (opcjonalnie)" [invalid] [ref=e213]: 2026-12-05
            - generic [ref=e214]:
              - generic [ref=e215]: Koniec pobytu (opcjonalnie)
              - textbox "Koniec pobytu (opcjonalnie)" [invalid] [ref=e216]
          - paragraph [ref=e217]: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
          - paragraph [ref=e218]: "Uzupełnij obie daty: koniec nie może być wcześniejszy niż początek; pobyt może obejmować najwyżej 365 dni."
          - generic [ref=e219]:
            - generic [ref=e220]:
              - generic [ref=e221]: Liczba dorosłych
              - generic [ref=e222]: Od 1 do 50 osób
              - textbox "Liczba dorosłych" [ref=e223]: "1"
            - generic [ref=e224]:
              - generic [ref=e225]: Liczba nocy
              - generic [ref=e226]: Od 0 do 365 nocy
              - textbox "Liczba nocy" [ref=e227]: "2"
            - generic [ref=e228]:
              - generic [ref=e229]: Liczba dni wydatków
              - generic [ref=e230]: Od 1 do 365 dni, także dni przylotu i odlotu
              - textbox "Liczba dni wydatków" [ref=e231]: "3"
          - paragraph [ref=e232]:
            - generic [ref=e233]:
              - checkbox "Wszyscy podróżni są dorośli" [checked] [ref=e234]
              - text: Wszyscy podróżni są dorośli
          - region [ref=e235]:
            - heading "Osobiste profile budżetu" [level=3] [ref=e236]
            - paragraph [ref=e237]: To twoje założenia w PLN, nie średnie ceny w mieście. Profile nie mają gotowych cen. Uzupełnij zakresy lub skopiuj własne kwoty. Wpisane koszty, także 0, mają pierwszeństwo.
            - group "Osobiste profile budżetu" [ref=e238]:
              - button "Oszczędnie" [ref=e239] [cursor=pointer]
              - button "Standardowo" [ref=e240] [cursor=pointer]
              - button "Komfortowo" [ref=e241] [cursor=pointer]
              - button "Bez profilu" [pressed] [ref=e242] [cursor=pointer]
          - group [ref=e243]:
            - generic "Sprawdź orientacyjne koszty na miejscu" [ref=e244] [cursor=pointer]
            - 'option "Barcelona: T-casual, 10 przejazdów, 1 strefa — 13,00 EUR" [selected]'
          - heading "Główne koszty" [level=3] [ref=e245]
          - generic [ref=e246]:
            - generic [ref=e247]:
              - generic [ref=e248]: Loty (PLN)
              - generic [ref=e249]: Na osobę, za wszystkie planowane odcinki
              - textbox "Loty (PLN)" [ref=e250]:
                - /placeholder: Nieznane
                - text: "200.25"
              - generic [ref=e251]:
                - text: Skopiowana obserwacja ceny lotu — nie cena na żywo
                - group [ref=e252]:
                  - generic "Pochodzenie kwoty" [ref=e253] [cursor=pointer]
            - generic [ref=e254]:
              - generic [ref=e255]: Jak podana jest cena noclegu?
              - combobox "Jak podana jest cena noclegu?" [ref=e256]:
                - option "Za jedną noc — cała grupa" [selected]
                - option "Za cały pobyt — cała grupa"
              - generic [ref=e257]:
                - generic [ref=e258]: Nocleg (PLN)
                - generic [ref=e259]: Za jedną noc dla całej grupy (wszystkie pokoje)
                - textbox "Nocleg (PLN)" [ref=e260]:
                  - /placeholder: Nieznane
                - generic [ref=e261]: Nieznane
              - generic [ref=e262]: Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.
            - generic [ref=e263]:
              - generic [ref=e264]: Dojazdy i transport (PLN)
              - generic [ref=e265]: "Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
              - textbox "Dojazdy i transport (PLN)" [ref=e266]:
                - /placeholder: Nieznane
              - generic [ref=e267]: Nieznane
            - generic [ref=e268]:
              - generic [ref=e269]: Jedzenie i wydatki dzienne (PLN)
              - generic [ref=e270]: Na osobę dziennie
              - textbox "Jedzenie i wydatki dzienne (PLN)" [ref=e271]:
                - /placeholder: Nieznane
              - generic [ref=e272]: Nieznane
          - group [ref=e273]:
            - 'generic "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa" [ref=e274] [cursor=pointer]'
        - status [ref=e275]:
          - heading "Szacowany budżet całej grupy (PLN)" [level=3] [ref=e276]
          - paragraph [ref=e277]: Popraw zaznaczone pola i daty, aby obliczyć budżet.
        - paragraph [ref=e278]: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
        - button "Wyczyść kalkulator" [ref=e279] [cursor=pointer]
        - region "Zapisz i udostępnij wyjazd" [ref=e280]:
          - heading "Zachowaj plan podróży" [level=3] [ref=e281]
          - paragraph [ref=e282]: Zapis tylko w tym profilu przeglądarki na tym urządzeniu. Usunięcie danych witryny usuwa plany. Zachowaj link, aby otworzyć kopię gdzie indziej.
          - paragraph [ref=e283]: Zapis otwiera plan z listy. Wybierz „Aktualizuj plan”, aby zachować w nim późniejsze zmiany. Udostępnianie tworzy niezależną kopię.
          - paragraph [ref=e284]: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
          - paragraph [ref=e285]: "Nowe linki przechowują plan po # w adresie, poza żądaniem wysyłanym do witryny. Link nie jest szyfrowany: każdy odbiorca może odczytać plan. Przeglądarka i usługa, w której wkleisz link, mogą zachować cały adres."
          - paragraph [ref=e286]: Ta wersja ma niezapisane zmiany.
          - generic [ref=e287]:
            - button "Zapisz wyjazd" [ref=e288] [cursor=pointer]
            - button "Udostępnij" [ref=e289] [cursor=pointer]
            - link "Zapisane wyjazdy" [ref=e290] [cursor=pointer]:
              - /url: /saved
          - paragraph
      - generic [ref=e291]:
        - heading "Cena na tle historii" [level=2] [ref=e293]
        - generic [ref=e294]:
          - group "Cena na tle historii" [ref=e295]:
            - paragraph [ref=e296]:
              - strong [ref=e297]: Cena o 49,75 zł poniżej mediany próby.
              - text: "Mediana: 250,00 zł."
            - paragraph [ref=e298]: "Liczba obserwacji: 24. Próg porównania: 5; próbka nie obejmuje całego rynku."
            - paragraph [ref=e299]:
              - text: "Pierwszy zapis tej ceny w HopTrip:"
              - time [ref=e300]: czw., 5 lis 2026, 14:24
              - text: (czas w Polsce).
            - paragraph [ref=e301]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
          - paragraph [ref=e302]: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
          - group [ref=e303]:
            - generic "Jak działa pomocniczy wynik sortowania?" [ref=e304] [cursor=pointer]
          - link "Pełna metodologia porównania cen →" [ref=e305] [cursor=pointer]:
            - /url: /info/price-comparison
  - contentinfo [ref=e306]:
    - generic [ref=e307]:
      - generic [ref=e308]: HopTrip.
      - paragraph [ref=e309]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e310]:
      - link "Jak działa HopTrip" [ref=e311] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e312] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e313] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e314] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e315] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e316] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e317] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e318] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e319] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e320] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e321] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e323] [cursor=pointer]
  - alert [ref=e324]
```

# Test source

```ts
  18  |       const style=getComputedStyle(layer);
  19  |       if(style.opacity!=='1'||style.filter!=='none'||style.backdropFilter!=='none'||style.mixBlendMode!=='normal'||style.backgroundBlendMode!=='normal'||style.textShadow!=='none'||style.webkitTextFillColor!==style.color)throw Error('Unsupported compositing:'+layer.tagName);
  20  |       for(const pseudo of ['::before','::after']){
  21  |        const paint=getComputedStyle(layer,pseudo);if(paint.content==='none'||paint.content==='normal')continue;
  22  |        if(layer!==document.body||pseudo!=='::before'||paint.zIndex!=='-1'||paint.position!=='fixed')throw Error('Unsupported pseudo overlay');
  23  |       }
  24  |       const color=parse(style.backgroundColor);
  25  |       if(color[3]===1){low=color.slice(0,3);high=color.slice(0,3);if(layer!==document.body&&layer!==document.documentElement)opaqueAfterBody=true;}
  26  |       else if(color[3]>0){if(!low||!high)throw Error('No opaque canvas');low=low.map((value,i)=>color[i]*color[3]+value*(1-color[3]));high=high.map((value,i)=>color[i]*color[3]+value*(1-color[3]));}
  27  |       if(style.backgroundImage!=='none'){
  28  |        if(style.backgroundImage.startsWith('linear-gradient(')){
  29  |         const colors=[...style.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(match=>parse(match[0]));
  30  |         if(!/^linear-gradient\([\d.]+deg,\s*rgba?\([^)]+\)(?:\s+[\d.]+%)?,\s*rgba?\([^)]+\)(?:\s+[\d.]+%)?\)$/.test(style.backgroundImage)||colors.length!==2||colors.some(color=>color[3]!==1))throw Error('Unsupported gradient:'+style.backgroundImage);
  31  |         low=[0,1,2].map(i=>Math.min(...colors.map(color=>color[i])));high=[0,1,2].map(i=>Math.max(...colors.map(color=>color[i])));
  32  |         opaqueAfterBody=true;
  33  |         evidence.push({kind:'OPAQUE_TWO_STOP_GRADIENT',image:style.backgroundImage});
  34  |        }else if(layer===el&&el.tagName==='SELECT'){
  35  |         const match=style.backgroundImage.match(/^url\("(data:image\/svg\+xml,[^"]+)"\)$/);if(!match)throw Error('Unsupported select image');
  36  |         const svg=new DOMParser().parseFromString(decodeURIComponent(match[1].split(',').slice(1).join(',')),'image/svg+xml').documentElement;
  37  |         const size=[Number(svg.getAttribute('width')),Number(svg.getAttribute('height'))];
  38  |         const right=style.backgroundPositionX.match(/^calc\(100% - ([\d.]+)px\)$/);
  39  |         const painted=style.backgroundSize.match(/^([\d.]+)px ([\d.]+)px$/);
  40  |         if(!right||!painted||style.appearance!=='none'||style.backgroundRepeat!=='no-repeat'||!size.every(value=>value>0)||svg.querySelectorAll('*').length!==1||svg.firstElementChild?.tagName!=='path')throw Error('Unsupported select arrow geometry');
  41  |         const reserved=Number.parseFloat(style.paddingRight),imageEnd=Number(right[1])+Number(painted[1]);if(reserved<imageEnd)throw Error('Arrow overlaps text content box');
  42  |         evidence.push({kind:'SVG_OUTSIDE_TEXT_CONTENT',intrinsicSize:size,paintedSize:[Number(painted[1]),Number(painted[2])],rightInset:Number(right[1]),reserved});
  43  |        }else if(layer===document.body){
  44  |         throw Error('Unsupported body image');
  45  |        }else throw Error('Unsupported background image:'+style.backgroundImage);
  46  |       }
  47  |      }
  48  |      if(!low||!high||!opaqueAfterBody)throw Error('No opaque background bound above body texture');
  49  |      const foreground=parse(getComputedStyle(el).color);if(foreground[3]!==1)throw Error('Unsupported translucent foreground');
  50  |      const lum=(color:number[])=>color.slice(0,3).map(value=>{const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;}).reduce((value,channel,i)=>value+channel*[.2126,.7152,.0722][i],0);
  51  |      const fg=lum(foreground),lo=lum(low),hi=lum(high);const minimum=fg>=lo&&fg<=hi?1:Math.min((Math.max(fg,lo)+.05)/(Math.min(fg,lo)+.05),(Math.max(fg,hi)+.05)/(Math.min(fg,hi)+.05));
  52  |      return {foreground,low,high,minimum,evidence};
  53  | 
  54  | }
  55  | 
  56  | test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Contrast review requires the isolated production runner.');
  57  | const paths=['/','/deals','/tanie-loty-na-weekend','/city-break','/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved','/info/trip-budget','/alerts'];
  58  | 
  59  | test.beforeEach(async({page,request},info)=>{
  60  |  const servers=config.webServer;if(!Array.isArray(servers))throw Error('Expected fixture servers');
  61  |  expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
  62  |  const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await(await request.get('/deals')).text()).toContain(build);
  63  |  await info.attach('execution-mode',{body:JSON.stringify({command:servers[1].command,nodeEnv:servers[1].env?.NODE_ENV,build}),contentType:'application/json'});
  64  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  65  |  await page.route('**/*',route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
  66  | });
  67  | 
  68  | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: classify every contrast review item without hiding axe results`,async({page},info)=>{
  69  |  test.setTimeout(240000);
  70  |  const width=info.project.name==='mobile'?390:1440;await page.setViewportSize({width,height:900});
  71  |  const records:unknown[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  72  |  try{
  73  |   for(const path of paths){
  74  |    const href=availableHref(path,locale);expect((await page.goto(href))?.status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
  75  |    const audit=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
  76  |    const reviews:unknown[]=[];
  77  |    records.push({path,href,width,project:info.project.name,violations:audit.violations,incomplete:audit.incomplete,reviews});
  78  |    for(const rule of audit.incomplete)for(const node of rule.nodes){
  79  |     expect(node.target).toHaveLength(1);expect(typeof node.target[0]).toBe('string');
  80  |     const target=String(node.target[0]),element=page.locator(target);await expect(element).toHaveCount(1);
  81  |     const keys=[...node.any,...node.all,...node.none].map(check=>(check.data as {messageKey?:string}|null)?.messageKey);expect(keys.length).toBeGreaterThan(0);
  82  |     if(keys.every(key=>key==='nonBmp')){
  83  |      await expect(element).toHaveAttribute('aria-hidden','true');expect((await element.textContent())?.trim()).toMatch(/^[→ⓘ]$/u);
  84  |      const control=element.locator('xpath=ancestor::*[self::a or self::button][1]');await expect(control).toHaveCount(1);await expect(control).toHaveAccessibleName(/[\p{L}\p{N}]/u);
  85  |      reviews.push({target,classification:'DECORATIVE_WITH_NAMED_CONTROL',keys,html:node.html});
  86  |      continue;
  87  |     }
  88  |     if(keys.includes('shortTextContent')){
  89  |      expect(await element.evaluate(el=>el.tagName)).toBe('LABEL');
  90  |      const label=await element.evaluate(el=>[...el.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join('').trim());
  91  |      expect(label).toMatch(/^[СЗ]$/u);await expect(element.locator('input[type="date"]')).toHaveAccessibleName(label);
  92  |     }
  93  |     expect(keys.every(key=>key==='bgGradient'||key==='bgImage'||key==='shortTextContent'),target+':'+JSON.stringify(keys)).toBe(true);
  94  |     const bound=await element.evaluate(conservativeContrast);
  95  |     // Use the normal-text threshold even for large headings.
  96  |     expect(bound.minimum,target).toBeGreaterThanOrEqual(4.5);
  97  |     reviews.push({target,classification:'CONSERVATIVE_CONTRAST_BOUND',keys,...bound,html:node.html});
  98  |    }
  99  |    expect(audit.violations).toEqual([]);
  100 |    if(locale==='pl'&&path==='/deals/browser-deal')await page.locator('#trip-events').screenshot({path:info.outputPath('event-gradient.png'),animations:'disabled'});
  101 |   }
  102 |   expect(errors).toEqual([]);
  103 |  }finally{writeFileSync(info.outputPath('contrast-review.json'),JSON.stringify({locale,width,project:info.project.name,records,errors},null,2)+'\n');}
  104 | });
  105 | 
  106 | test('contrast bounds reject low contrast and unsupported compositing',async({page},info)=>{
  107 |  await page.goto('/deals/browser-deal');await page.evaluate(()=>document.fonts.ready);
  108 |  const title=page.locator('#trip-events-title');const original=await title.getAttribute('style');
  109 |  const restore=()=>title.evaluate((el,style)=>{if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);},original);
  110 |  const baseline=await title.evaluate(conservativeContrast);expect(baseline.minimum).toBeGreaterThanOrEqual(4.5);
  111 |  let lowContrast=0;
  112 |  try{
  113 |   await title.evaluate(el=>{(el as HTMLElement).style.color='#bbbbbb';});
  114 |   lowContrast=(await title.evaluate(conservativeContrast)).minimum;expect(lowContrast).toBeLessThan(4.5);await restore();
  115 |   await title.evaluate(el=>{(el as HTMLElement).style.opacity='0.5';});
  116 |   await expect(title.evaluate(conservativeContrast)).rejects.toThrow('Unsupported compositing');await restore();
  117 |   await title.evaluate(el=>{(el as HTMLElement).style.backgroundImage='linear-gradient(145deg,rgb(237,244,235),rgb(248,250,246)),url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E")';});
> 118 |   await expect(title.evaluate(conservativeContrast)).rejects.toThrow('Unsupported gradient');
      |                                                              ^ Error: expect(received).rejects.toThrow(expected)
  119 |  }finally{await restore();}
  120 |  expect((await title.evaluate(conservativeContrast)).minimum).toBe(baseline.minimum);
  121 |  await info.attach('negative-controls',{body:JSON.stringify({baseline:baseline.minimum,lowContrast,translucentAncestorRejected:true,multipleBackgroundRejected:true,restored:true}),contentType:'application/json'});
  122 | });
  123 | 
```