# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: consent-session-navigation.spec.ts >> consent storage events from another tab revoke tracking and clear shared identity
- Location: tests\consent-session-navigation.spec.ts:105:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 1

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
        - paragraph [ref=e26]: "Daty wylotów: niedz., 6 gru 2026"
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
            - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 6 lis 2026: 1 EUR = 4,3925 PLN. Kurs płatności może się różnić." [ref=e40]':
              - generic [aria-hidden] [ref=e41]: ≈ 46 €
            - generic [ref=e43]: za osobę · w jedną stronę
          - generic [ref=e44]:
            - paragraph [ref=e45]:
              - text: "Pierwszy zapis tej ceny w HopTrip:"
              - time [ref=e46]: pt., 6 lis 2026, 16:52
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
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 6 lis 2026: 1 EUR = 4,3925 PLN. Kurs płatności może się różnić." [ref=e73]':
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
              - textbox "Zameldowanie" [invalid] [ref=e93]: 2026-12-06
            - generic [ref=e94]:
              - generic [ref=e95]: Wymeldowanie
              - textbox "Wymeldowanie" [invalid] [ref=e96]
              - status [ref=e97]: Wybierz datę wymeldowania późniejszą niż zameldowanie.
            - generic [ref=e98]:
              - generic [ref=e99]: Dorośli
              - spinbutton "Dorośli" [ref=e100]: "1"
        - paragraph [ref=e102]:
          - strong [ref=e103]: Barcelona
          - text: ": niedz., 6 gru 2026 – Wybierz datę · dorośli: 1."
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
          - strong [ref=e167]: 6 gru 2026 – Daty nieustalone
        - generic [ref=e168]:
          - strong [ref=e169]: Daty podróży
          - button "Inne daty" [ref=e170] [cursor=pointer]
        - paragraph [ref=e171]: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
        - generic [ref=e172]:
          - generic [ref=e173]:
            - text: Od
            - textbox "Od" [invalid] [ref=e174]: 2026-12-06
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
        - paragraph [ref=e207]: Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.
        - group "Twój plan podróży" [ref=e208]:
          - generic [ref=e210]:
            - generic [ref=e211]:
              - generic [ref=e212]: Początek pobytu (opcjonalnie)
              - textbox "Początek pobytu (opcjonalnie)" [invalid] [ref=e213]: 2026-12-06
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
                - textbox "Nocleg (PLN)" [active] [ref=e260]:
                  - /placeholder: Nieznane
                  - text: "15"
                - generic [ref=e261]: Własna kwota — do weryfikacji
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
              - time [ref=e300]: pt., 6 lis 2026, 16:52
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
  10  | const consentKey='hoptrip.consent.v1',sessionKey='hoptrip.session.v2';
  11  | const staleId='00000000-0000-4000-8000-000000000088';
  12  | test.setTimeout(60000);
  13  | test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Session hydration regression requires the isolated production build');
  14  | test.beforeAll(async({request})=>{
  15  |  const config=readFileSync('playwright.config.ts','utf8');expect(config).toContain('command:"npm run start --');expect(config).toContain('NODE_ENV:"production"');expect(config).not.toContain('reuseExistingServer:true');
  16  |  expect(await (await request.get('/saved')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
  17  | });
  18  | async function setup(page:Page,initial:Initial='allow',stale=false,storage?:'session-only'|'all'){
  19  |  await page.addInitScript(({initial,stale,consentKey,sessionKey,staleId,storage})=>{
  20  |   (window as typeof window&{h3Document:string}).h3Document=crypto.randomUUID();
  21  |   if(!sessionStorage.getItem('h3.session.fixture.initialized')){
  22  |    sessionStorage.setItem('h3.session.fixture.initialized','1');
  23  |    if(initial!=='absent')localStorage.setItem(consentKey,initial==='malformed'?'broken-json':JSON.stringify({version:1,analytics:initial!=='deny',marketing:false,at:Date.now()-(initial==='expired'?181*86400000:initial==='future'?-86400000:0)}));
  24  |    if(stale)localStorage.setItem(sessionKey,JSON.stringify({id:staleId,touched:Date.now()}));
  25  |   }
  26  |   if(storage==='all')Object.defineProperty(window,'localStorage',{get(){throw Error('Synthetic blocked storage');}});
  27  |   if(storage==='session-only')for(const method of ['getItem','setItem','removeItem'] as const){
  28  |    const original=Storage.prototype[method];Object.defineProperty(Storage.prototype,method,{value:function(key:string,value?:string){if(this===localStorage&&key===sessionKey)throw Error('Synthetic blocked session store');return Reflect.apply(original,this,method==='setItem'?[key,value]:[key]);}});
  29  |   }
  30  |  },{initial,stale,consentKey,sessionKey,staleId,storage});
  31  |  const events:Event[]=[],statuses:number[]=[],errors:string[]=[];
  32  |  page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.method()==='POST')events.push(r.postDataJSON());});
  33  |  page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.request().method()==='POST')statuses.push(r.status());});
  34  |  page.on('pageerror',error=>errors.push(error.message));
  35  |  const views=()=>events.filter(e=>e.event_name==='PAGE_VIEW');
  36  |  const flush=async()=>{await expect.poll(()=>statuses.length===events.length).toBe(true);expect(statuses.every(s=>s===202)).toBe(true);expect(errors).toEqual([]);};
  37  |  return {events,views,flush,errors};
  38  | }
  39  | const storedId=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null')?.id,sessionKey);
  40  | const documentId=(page:Page)=>page.evaluate(()=>(window as typeof window&{h3Document:string}).h3Document);
  41  | async function grant(page:Page){
  42  |  if(!await page.locator('.consent-panel').count())await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
  43  |  await page.locator('.consent-panel input[type="checkbox"]').first().check();
  44  |  await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);
  45  | }
  46  | async function revoke(page:Page){
  47  |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);
  48  | }
  49  | 
  50  | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: accepted session survives reload, Save auto-open and full navigation`,async({page},info)=>{
  51  |  const {events,views,flush}=await setup(page);
  52  |  await page.goto(localizedHref('/deals/browser-deal?utm_source=newsletter&utm_campaign=test',locale));await expect(page.locator('#budget-start')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);await flush();
  53  |  const first=views()[0].anonymous_session_id,document=await documentId(page);
  54  |  await page.reload();await expect(page.locator('#budget-start')).toBeEnabled();await expect.poll(()=>views().length).toBe(2);await flush();
  55  |  expect(await documentId(page)).not.toBe(document);expect(await storedId(page)).toBe(first);expect(views()[1].anonymous_session_id).toBe(first);
  56  |  await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');
  57  |  await page.locator('#trip-save').getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
  58  |  await expect(page).toHaveURL(/\/trip#local=[a-f0-9-]{36}$/);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);await expect.poll(()=>views().length).toBe(3);await flush();
  59  |  expect(events.filter(e=>e.event_name==='TRIP_SAVE')).toHaveLength(1);
  60  |  await page.goto(localizedHref('/saved',locale));await expect.poll(()=>views().length).toBe(4);await expect(page.locator('.consent-panel')).toHaveCount(0);await flush();
  61  |  expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));
  62  |  expect(events.every(e=>e.source==='newsletter'&&e.metadata.campaign==='test')).toBe(true);
  63  |  expect(views().map(e=>e.metadata.page_type)).toEqual(['deal','deal','saved_trip','saved']);
  64  |  writeFileSync(info.outputPath('navigation.json'),JSON.stringify({locale,views:4,distinctSessions:1,saveAutoOpenRetainsSession:true,sourceCampaignRetained:true},null,2));
  65  | });
  66  | 
  67  | test('client navigation and real language-switcher full navigations keep one session',async({page},info)=>{
  68  |  const {events,views,flush}=await setup(page);await page.goto('/saved?utm_source=newsletter&utm_campaign=test');await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id,document=await documentId(page);
  69  |  await page.getByRole('navigation',{name:navigation.pl.main,exact:true}).getByRole('link',{name:navigation.pl.budget,exact:true}).click();await expect(page).toHaveURL(/\/info\/trip-budget$/);await expect.poll(()=>views().length).toBe(2);await flush();expect(await documentId(page)).toBe(document);
  70  |  let previous=document;
  71  |  for(const [index,locale] of (['en','ru','uk','pl'] as const).entries()){
  72  |   await page.locator(`.language-switcher a[lang="${locale}"]`).click();await expect(page).toHaveURL(new RegExp(localizedHref('/info/trip-budget',locale)+'$'));await expect.poll(()=>views().length).toBe(index+3);await flush();
  73  |   expect(await documentId(page)).not.toBe(previous);previous=await documentId(page);
  74  |  }
  75  |  expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));expect(events.every(e=>e.source==='newsletter'&&e.metadata.campaign==='test')).toBe(true);
  76  |  writeFileSync(info.outputPath('client-locale.json'),JSON.stringify({clientNavigationWithoutDocumentReload:true,languageSwitches:4,views:6,distinctSessions:1},null,2));
  77  | });
  78  | 
  79  | test('denial, grant, revocation and regrant clear old identity without replaying actions',async({page},info)=>{
  80  |  const {events,views,flush}=await setup(page,'deny',true);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>storedId(page)).toBeUndefined();
  81  |  await page.locator('#budget-hotel').fill('10');expect(events).toEqual([]);
  82  |  await grant(page);await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;expect(first).not.toBe(staleId);expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
  83  |  await page.locator('#budget-hotel').fill('20');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);await flush();
  84  |  await revoke(page);await expect.poll(()=>storedId(page)).toBeUndefined();const before=events.length;
  85  |  await page.locator('#budget-hotel').fill('30');await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();expect(events).toHaveLength(before);expect(await storedId(page)).toBeUndefined();
  86  |  await grant(page);await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(1);
  87  |  writeFileSync(info.outputPath('revocation.json'),JSON.stringify({staleIdentityCleared:true,noPreGrantOrRevokedReplay:true,regrantStartsNewSession:true},null,2));
  88  | });
  89  | 
  90  | for(const initial of ['absent','expired','future','malformed'] as const)test(`${initial} consent clears an existing session and sends nothing`,async({page})=>{
  91  |  const {events,flush}=await setup(page,initial,true);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect(page.locator('.consent-panel')).toBeVisible();await expect.poll(()=>storedId(page)).toBeUndefined();
  92  |  await page.locator('#budget-hotel').fill('10');await flush();expect(events).toEqual([]);
  93  | });
  94  | 
  95  | test('idle expiry rotates at thirty minutes while a twenty-nine-minute session survives hydration',async({page},info)=>{
  96  |  const {views,flush}=await setup(page);await page.goto('/saved');await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
  97  |  for(const [minutes,count] of [[29,2],[30,3]]){
  98  |   await page.evaluate(({key,minutes})=>{const session=JSON.parse(localStorage.getItem(key)!);session.touched=Date.now()-minutes*60000;localStorage.setItem(key,JSON.stringify(session));},{key:sessionKey,minutes});
  99  |   await page.reload();await expect.poll(()=>views().length).toBe(count);await flush();
  100 |   if(minutes===29)expect(views()[count-1].anonymous_session_id).toBe(first);else expect(views()[count-1].anonymous_session_id).not.toBe(first);
  101 |  }
  102 |  writeFileSync(info.outputPath('expiry.json'),JSON.stringify({at29MinutesSameSession:true,at30MinutesNewSession:true,views:3},null,2));
  103 | });
  104 | 
  105 | test('consent storage events from another tab revoke tracking and clear shared identity',async({page,context})=>{
  106 |  const {events,views,flush}=await setup(page);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
  107 |  const other=await context.newPage();try{
  108 |   await other.goto('/saved');await expect.poll(()=>storedId(other)).toBe(first);await revoke(other);
  109 |   await expect.poll(()=>storedId(page)).toBeUndefined();const before=events.length;await page.locator('#budget-hotel').fill('15');await flush();expect(events).toHaveLength(before);
> 110 |   await grant(other);await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);expect(await storedId(page)).toBe(await storedId(other));expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
      |                                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  111 |  }finally{await other.close();}
  112 | });
  113 | 
  114 | for(const storage of ['session-only','all'] as const)test(`${storage} blocked storage keeps analytics optional and the calculator usable`,async({page},info)=>{
  115 |  const {events,views,flush}=await setup(page,'allow',false,storage);
  116 |  await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();
  117 |  if(storage==='all'){await expect(page.locator('.consent-panel')).toBeVisible();expect(events).toEqual([]);await grant(page);}
  118 |  await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
  119 |  await page.locator('#budget-hotel').fill('15');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);await flush();expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));
  120 |  const before=events.length;await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();
  121 |  if(storage==='all'){await expect(page.locator('.consent-panel')).toBeVisible();expect(events).toHaveLength(before);}
  122 |  else{await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);}
  123 |  writeFileSync(info.outputPath('storage.json'),JSON.stringify({storage,calculatorUsable:true,inDocumentMemorySession:true,crossDocumentPersistenceAvailable:false},null,2));
  124 | });
  125 | 
  126 | test('blocked transport does not retry or reset a valid session',async({page},info)=>{
  127 |  const {events,views,errors}=await setup(page);await page.route('**/api/v1/analytics/events',route=>route.abort('failed'));
  128 |  await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);const first=views()[0].anonymous_session_id;
  129 |  await page.locator('#budget-hotel').fill('15');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);
  130 |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);expect(views()).toHaveLength(1);
  131 |  await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(2);expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));expect(errors).toEqual([]);
  132 |  writeFileSync(info.outputPath('blocked.json'),JSON.stringify({attemptedViews:2,documents:2,distinctSessions:1,noRetryFromConsentRerender:true,calculatorUsable:true},null,2));
  133 | });
  134 | 
```