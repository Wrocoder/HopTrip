# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: trip-navigation.spec.ts >> trip anchors focus sections and the two-adult budget survives sharing
- Location: tests\trip-navigation.spec.ts:3:5

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 0
Received:    -231.78125
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
        - /url: /deals/browser-13
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals/browser-13
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals/browser-13
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals/browser-13
  - main [ref=e19]:
    - link "← Aktualne okazje" [ref=e20] [cursor=pointer]:
      - /url: /deals
    - article [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: W obie strony
        - heading [level=1] [ref=e24]:
          - text: Wrocław (WRO) → Barcelona
          - img "Hiszpania" [ref=e25]
        - paragraph [ref=e26]: "Daty wylotów: niedz., 6 gru 2026 – śr., 9 gru 2026"
        - paragraph [ref=e27]: "Noce na miejscu: 3 (szac.) planowanego pobytu — daty noclegu sprawdź osobno."
      - navigation "Sekcje planu podróży" [ref=e28]:
        - link "Lot" [ref=e29] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "Do partnera" [ref=e30] [cursor=pointer]:
          - /url: "#trip-booking"
        - link "Nocleg" [ref=e31] [cursor=pointer]:
          - /url: "#accommodation"
        - link "Atrakcje" [ref=e32] [cursor=pointer]:
          - /url: "#destination-activities"
        - link "Wydarzenia" [ref=e33] [cursor=pointer]:
          - /url: "#trip-events"
        - link "Budżet" [ref=e34] [cursor=pointer]:
          - /url: "#calculator"
        - link "Zapisz" [ref=e35] [cursor=pointer]:
          - /url: "#trip-save"
        - link "Porównanie ceny" [ref=e36] [cursor=pointer]:
          - /url: "#score"
      - generic [ref=e37]:
        - region "Cena lotu" [ref=e38]:
          - paragraph [ref=e39]: za osobę · PLN
          - paragraph [ref=e40]:
            - text: 213,00 zł
            - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 6 lis 2026: 1 EUR = 4,3925 PLN. Kurs płatności może się różnić." [ref=e41]':
              - generic [aria-hidden] [ref=e42]: ≈ 48 €
            - generic [ref=e44]: za osobę · w obie strony
          - generic [ref=e45]:
            - paragraph [ref=e46]:
              - text: "Czas zapisanej obserwacji:"
              - time [ref=e47]: pt., 6 lis 2026, 23:55
              - text: (czas w Polsce).
            - paragraph [ref=e48]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
            - group [ref=e49]:
              - generic "Pochodzenie i czas wycofania oferty" [ref=e50] [cursor=pointer]
          - paragraph [ref=e51]:
            - strong [ref=e52]: Brak wiarygodnego porównania tej ceny z historią.
          - heading "Szczegóły lotu" [level=2] [ref=e53]
          - generic [ref=e54]:
            - note [ref=e55]:
              - strong [ref=e56]: Niepełne dane lotu
              - paragraph [ref=e57]: Nie wszystkie godziny podróży są znane.
              - group [ref=e58]:
                - generic "Jakich danych brakuje?" [ref=e59]
              - paragraph [ref=e60]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
            - paragraph [ref=e61]:
              - strong [ref=e62]: Wylot
              - text: "· 6 gru: WRO 11:00 → BCN 13:00 · szac."
              - generic [ref=e63]: Bez przesiadek
            - paragraph [ref=e64]:
              - strong [ref=e65]: Powrót
              - text: "· 9 gru: BCN 11:00 → WRO brak godziny"
              - generic [ref=e66]: "Liczba przesiadek: 1"
            - paragraph [ref=e67]:
              - strong [ref=e68]: Dzień i godzina przylotu powrotnego do potwierdzenia.
            - paragraph [ref=e69]: "Wpływ na urlop: do potwierdzenia"
            - paragraph [ref=e70]: "Między przylotem a odlotem: 70 godz. 0 min (szacunek) · BCN → BCN. Czas w mieście nieznany."
            - paragraph [ref=e71]: Godziny lokalne · Przylot szacowany
            - paragraph [ref=e73]: Czas i koszt dojazdu nieznane — sprawdź transport na datę podróży.
            - paragraph [ref=e74]: "Wylot: Ryanair (FR) · Powrót: Przewoźnik powrotny do sprawdzenia"
          - paragraph [ref=e75]: Cena dotyczy lotu. Nocleg nie jest wliczony.
          - paragraph [ref=e76]: Bagaż do sprawdzenia
          - group [ref=e77]:
            - generic "Pełne dane lotu i bagaż" [ref=e78] [cursor=pointer]
        - region [ref=e79]:
          - heading "Przejście do partnera" [level=2] [ref=e80]
          - generic [ref=e81]: Współpraca partnerska
          - generic [ref=e82]:
            - paragraph [ref=e83]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 6 lis 2026: 1 EUR = 4,3925 PLN. Kurs płatności może się różnić." [ref=e84]':
                - generic [aria-hidden] [ref=e85]: ≈ 48 €
              - generic [ref=e87]: za osobę · w obie strony
            - status [ref=e88]:
              - paragraph [ref=e89]: Link do rezerwacji nie jest jeszcze dostępny.
              - link "Wróć do katalogu lotów" [ref=e90] [cursor=pointer]:
                - /url: /deals
          - paragraph [ref=e91]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
      - region [active] [ref=e92]:
        - heading "Znajdź nocleg — Barcelona" [level=2] [ref=e93]
        - paragraph [ref=e94]: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
        - paragraph [ref=e95]: Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.
        - complementary "Miejscowe daty według rozkładu:" [ref=e96]:
          - paragraph [ref=e97]:
            - strong [ref=e98]: "Miejscowe daty według rozkładu:"
            - text: przylot
            - time [ref=e99]: niedz., 6 gru 2026
            - text: · wylot powrotny
            - time [ref=e100]: śr., 9 gru 2026
          - paragraph [ref=e101]: Przylot obliczono z czasu lotu. Potwierdź datę i rozkład u partnera.
          - paragraph [ref=e102]: Daty możesz zmienić; sprawdź dojazd i godzinę zameldowania.
        - group [ref=e103]:
          - generic "Jak dobrać daty noclegu do lotu?" [ref=e104] [cursor=pointer]
        - group "Daty pobytu i dorośli" [ref=e105]:
          - generic [ref=e107]:
            - generic [ref=e108]:
              - generic [ref=e109]: Zameldowanie
              - textbox "Zameldowanie" [ref=e110]: 2026-12-06
            - generic [ref=e111]:
              - generic [ref=e112]: Wymeldowanie
              - textbox "Wymeldowanie" [ref=e113]: 2026-12-09
            - generic [ref=e114]:
              - generic [ref=e115]: Dorośli
              - spinbutton "Dorośli" [ref=e116]: "1"
        - generic [ref=e117]:
          - paragraph [ref=e118]:
            - strong [ref=e119]: Barcelona
            - text: ": niedz., 6 gru 2026 – śr., 9 gru 2026 · 3 noce · dorośli: 1."
          - link "Znajdź nocleg przez Stay22 (nowa karta)" [ref=e120] [cursor=pointer]:
            - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-12-06&checkout=2026-12-09&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
        - paragraph [ref=e121]: Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.
        - paragraph [ref=e122]: Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.
        - group [ref=e123]:
          - generic "Jak dodać cenę noclegu do planu?" [ref=e124] [cursor=pointer]
        - link "Dodaj koszt noclegu do budżetu podróży" [ref=e125] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=e126]:
        - paragraph [ref=e127]: Pomysły na pobyt · Barcelona
        - heading "Muzea i atrakcje" [level=2] [ref=e128]
        - paragraph [ref=e129]: Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.
        - list [ref=e130]:
          - listitem [ref=e131]:
            - generic [ref=e132]: Architektura
            - heading "Casa Batlló — bilet Blue" [level=3] [ref=e133]
            - paragraph [ref=e134]: Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.
            - paragraph [ref=e135]:
              - strong [ref=e136]: "Dla kogo:"
              - text: Dla osób zainteresowanych architekturą Gaudíego i zwiedzaniem z audioprzewodnikiem.
            - paragraph [ref=e137]:
              - strong [ref=e138]: "Czas wizyty:"
              - text: Około 1 godziny dla wariantu Blue; bez dojazdu i oczekiwania na wejście.
            - paragraph [ref=e139]: Wariant Blue nie obejmuje tarasu na dachu, tabletu VR ani wejścia bez kolejki. Sprawdź godzinę wejścia i język audioprzewodnika.
            - generic [ref=e140]:
              - paragraph [ref=e141]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=e142]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Casa Batlló — bilet Blue (nowa karta)" [ref=e143] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Sprawdź daty i cenę
              - paragraph [ref=e144]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=e145] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=e146]:
            - generic [ref=e147]: Akwarium
            - heading "Aquarium Barcelona — bilet wstępu" [level=3] [ref=e148]
            - paragraph [ref=e149]: "Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą."
            - paragraph [ref=e150]:
              - strong [ref=e151]: "Dla kogo:"
              - text: Dla rodzin i osób ciekawych morskiej przyrody; propozycja zwiedzania pod dachem.
            - paragraph [ref=e152]:
              - strong [ref=e153]: "Czas wizyty:"
              - text: Orientacyjnie 1,5–2 godziny na zwiedzanie; bez dojazdu i kolejki.
            - paragraph [ref=e154]: Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.
            - generic [ref=e155]:
              - paragraph [ref=e156]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=e157]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Aquarium Barcelona — bilet wstępu (nowa karta)" [ref=e158] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Sprawdź daty i cenę
              - paragraph [ref=e159]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=e160] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=e161]:
            - generic [ref=e162]: Przyroda · bezpłatny wstęp
            - heading "Hivernacle — oranżeria w parku Ciutadella" [level=3] [ref=e163]
            - paragraph [ref=e164]: Zabytkowa oranżeria z kolekcjami roślin w parku Ciutadella.
            - paragraph [ref=e165]:
              - strong [ref=e166]: "Dla kogo:"
              - text: Dla miłośników roślin i spokojnego spaceru wśród zieleni.
            - paragraph [ref=e167]: Bezpłatny wstęp dotyczy samodzielnej wizyty. Sprawdź godziny i zamknięcia; wycieczki z przewodnikiem mają osobne zasady i rezerwacje.
            - generic [ref=e168]:
              - paragraph [ref=e169]: "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony."
              - 'link "Sprawdź zasady wizyty: Hivernacle — oranżeria w parku Ciutadella (nowa karta)" [ref=e170] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Sprawdź zasady wizyty
        - paragraph [ref=e171]: Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu, ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.
        - paragraph [ref=e172]: Zmiany dat i składu grupy w planie nie są automatycznie przekazywane w tym linku. Sprawdź termin, uczestników i cenę u partnera.
        - paragraph [ref=e173]: Opisy i zasady sprawdzono pon., 12 paź 2026. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.
        - paragraph [ref=e174]: W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.
        - link "Uwzględnij atrakcje w budżecie" [ref=e175] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=e176]:
        - generic [ref=e177]:
          - generic [ref=e178]:
            - heading "Wydarzenia w terminie podróży" [level=2] [ref=e179]
            - paragraph [ref=e180]: Koncerty, sport i kultura w mieście docelowym. Bilety na wydarzenia kupujesz osobno.
          - generic [ref=e181]: Ticketmaster
        - paragraph [ref=e182]:
          - generic [ref=e183]: Twój pobyt · Barcelona
          - strong [ref=e184]: 6 gru 2026 – 9 gru 2026
        - generic [ref=e185]:
          - strong [ref=e186]: Daty podróży
          - button "Inne daty" [ref=e187] [cursor=pointer]
        - paragraph [ref=e188]: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
        - generic [ref=e189]:
          - generic [ref=e190]:
            - text: Od
            - textbox "Od" [ref=e191]: 2026-12-06
          - generic [ref=e192]:
            - text: Do
            - textbox "Do" [ref=e193]: 2026-12-09
          - generic [ref=e194]:
            - text: Kategoria
            - combobox "Kategoria" [ref=e195]:
              - option "Wszystkie" [selected]
              - option "Muzyka"
              - option "Sport"
              - option "Kultura"
              - option "Inne"
          - button "Pokaż wydarzenia" [ref=e196] [cursor=pointer]
        - generic [ref=e198]:
          - text: Zgodność z lotem
          - combobox "Zgodność z lotem" [ref=e199]:
            - option "Wszystkie wydarzenia" [selected]
            - option "Może pasować do lotu"
        - paragraph [ref=e200]: Ten tryb ukrywa tylko pewne kolizje z lotem. Wydarzenia z małym zapasem lub brakującymi danymi pozostają widoczne. Formalności na lotnisku i dojazd do miejsca wymagają sprawdzenia; udział nie jest gwarantowany.
        - generic [ref=e201]:
          - generic [ref=e202]:
            - text: Przeglądaj dni
            - combobox "Przeglądaj dni" [ref=e203]:
              - option "Wszystkie dni" [selected]
              - option "niedz., 6 gru"
              - option "pon., 7 gru"
              - option "wt., 8 gru"
              - option "śr., 9 gru"
          - button "Poprzedni dzień" [disabled] [ref=e204]: ←
          - button "Następny dzień" [ref=e205] [cursor=pointer]: →
        - status [ref=e206]:
          - paragraph [ref=e207]: Nie znaleźliśmy pasujących ofert ze zweryfikowanym linkiem do biletów dla tych dat.
        - generic [ref=e208]:
          - heading "Co możesz zrobić dalej?" [level=3] [ref=e209]
          - paragraph [ref=e210]: Pokazujemy oferty z Ticketmaster z poprawnym linkiem do biletów. Katalog nie obejmuje wszystkich organizatorów, wydarzeń i terminów. Pusta lista nie oznacza, że w mieście nic się nie dzieje.
          - generic [ref=e211]:
            - button "Zmień okres wyszukiwania" [ref=e212] [cursor=pointer]
            - link "Zobacz atrakcje w mieście" [ref=e213] [cursor=pointer]:
              - /url: "#destination-activities"
        - paragraph [ref=e214]: "Źródło: Ticketmaster · Czas sprawdzenia nieznany"
        - paragraph [ref=e215]: Dane katalogu, nie dostępność na żywo. Status sprzedaży i cena od nie gwarantują wolnych biletów; potwierdź je u sprzedawcy. Nieaktywnej lub nieznanej sprzedaży nie dodajemy z listy do planu.
        - group [ref=e216]:
          - generic "Przed rezerwacją" [ref=e217] [cursor=pointer]
        - paragraph [ref=e218]: "Linki partnerskie: HopTrip może otrzymać prowizję od zakupu. Dostępność biletów i zasady wstępu potwierdź u sprzedawcy."
        - paragraph [ref=e219]: Zmiany dat i składu grupy w planie nie są automatycznie przekazywane w tym linku. Sprawdź termin, uczestników i cenę u partnera.
      - navigation "Zaplanuj pobyt" [ref=e220]:
        - heading "Zaplanuj pobyt" [level=2] [ref=e221]
        - list [ref=e222]:
          - listitem [ref=e223]:
            - 'link "Barcelona: BCN, Girona czy Reus" [ref=e224] [cursor=pointer]':
              - /url: /info/barcelona-airports
          - listitem [ref=e225]:
            - 'link "Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu" [ref=e226] [cursor=pointer]':
              - /url: /info/barcelona-3-days
      - region [ref=e227]:
        - heading "Kalkulator budżetu podróży" [level=2] [ref=e228]
        - paragraph [ref=e229]: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
        - paragraph [ref=e230]: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
        - group "Tryb kalkulatora" [ref=e231]:
          - button "Szybki budżet" [pressed] [ref=e232] [cursor=pointer]
          - button "Szczegółowy budżet" [ref=e233] [cursor=pointer]
        - paragraph [ref=e234]: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
        - group [ref=e235]:
          - generic "Jak liczymy koszty?" [ref=e236] [cursor=pointer]
        - paragraph [ref=e237]: Zmiany zapisujemy automatycznie w tej przeglądarce, osobno dla każdej oferty.
        - group "Twój plan podróży" [ref=e238]:
          - generic [ref=e240]:
            - generic [ref=e241]:
              - generic [ref=e242]: Początek pobytu (opcjonalnie)
              - textbox "Początek pobytu (opcjonalnie)" [ref=e243]: 2026-12-06
            - generic [ref=e244]:
              - generic [ref=e245]: Koniec pobytu (opcjonalnie)
              - textbox "Koniec pobytu (opcjonalnie)" [ref=e246]: 2026-12-09
          - paragraph [ref=e247]: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
          - generic [ref=e248]:
            - generic [ref=e249]:
              - generic [ref=e250]: Liczba dorosłych
              - generic [ref=e251]: Od 1 do 50 osób
              - textbox "Liczba dorosłych" [ref=e252]: "1"
            - generic [ref=e253]:
              - generic [ref=e254]: Liczba nocy
              - generic [ref=e255]: Od 0 do 365 nocy
              - textbox "Liczba nocy" [ref=e256]: "3"
            - generic [ref=e257]:
              - generic [ref=e258]: Liczba dni wydatków
              - generic [ref=e259]: Od 1 do 365 dni, także dni przylotu i odlotu
              - textbox "Liczba dni wydatków" [ref=e260]: "4"
          - paragraph [ref=e261]:
            - generic [ref=e262]:
              - checkbox "Wszyscy podróżni są dorośli" [checked] [ref=e263]
              - text: Wszyscy podróżni są dorośli
          - region [ref=e264]:
            - heading "Osobiste profile budżetu" [level=3] [ref=e265]
            - paragraph [ref=e266]: To twoje założenia w PLN, nie średnie ceny w mieście. Profile nie mają gotowych cen. Uzupełnij zakresy lub skopiuj własne kwoty. Wpisane koszty, także 0, mają pierwszeństwo.
            - group "Osobiste profile budżetu" [ref=e267]:
              - button "Oszczędnie" [ref=e268] [cursor=pointer]
              - button "Standardowo" [ref=e269] [cursor=pointer]
              - button "Komfortowo" [ref=e270] [cursor=pointer]
              - button "Bez profilu" [pressed] [ref=e271] [cursor=pointer]
          - group [ref=e272]:
            - generic "Sprawdź orientacyjne koszty na miejscu" [ref=e273] [cursor=pointer]
            - 'option "Barcelona: T-casual, 10 przejazdów, 1 strefa — 13,00 EUR" [selected]'
          - heading "Główne koszty" [level=3] [ref=e274]
          - generic [ref=e275]:
            - generic [ref=e276]:
              - generic [ref=e277]: Loty (PLN)
              - generic [ref=e278]: Na osobę, za wszystkie planowane odcinki
              - textbox "Loty (PLN)" [ref=e279]:
                - /placeholder: Nieznane
                - text: "213.00"
              - generic [ref=e280]:
                - text: Skopiowana obserwacja ceny lotu — nie cena na żywo
                - group [ref=e281]:
                  - generic "Pochodzenie kwoty" [ref=e282] [cursor=pointer]
            - generic [ref=e283]:
              - generic [ref=e284]: Jak podana jest cena noclegu?
              - combobox "Jak podana jest cena noclegu?" [ref=e285]:
                - option "Za jedną noc — cała grupa" [selected]
                - option "Za cały pobyt — cała grupa"
              - generic [ref=e286]:
                - generic [ref=e287]: Nocleg (PLN)
                - generic [ref=e288]: Za jedną noc dla całej grupy (wszystkie pokoje)
                - textbox "Nocleg (PLN)" [ref=e289]:
                  - /placeholder: Nieznane
                - generic [ref=e290]: Nieznane
              - generic [ref=e291]: Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.
            - generic [ref=e292]:
              - generic [ref=e293]: Dojazdy i transport (PLN)
              - generic [ref=e294]: "Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
              - textbox "Dojazdy i transport (PLN)" [ref=e295]:
                - /placeholder: Nieznane
              - generic [ref=e296]: Nieznane
            - generic [ref=e297]:
              - generic [ref=e298]: Jedzenie i wydatki dzienne (PLN)
              - generic [ref=e299]: Na osobę dziennie
              - textbox "Jedzenie i wydatki dzienne (PLN)" [ref=e300]:
                - /placeholder: Nieznane
              - generic [ref=e301]: Nieznane
          - group [ref=e302]:
            - 'generic "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa" [ref=e303] [cursor=pointer]'
        - status [ref=e304]:
          - heading "Szacowany budżet całej grupy (PLN)" [level=3] [ref=e305]
          - paragraph [ref=e306]:
            - text: "Suma znanych kosztów:"
            - strong [ref=e307]: 213,00 zł
          - paragraph [ref=e308]:
            - text: "Na osobę przy równym podziale (w zaokrągleniu):"
            - strong [ref=e309]: 213,00 zł
          - paragraph [ref=e310]: "Budżet niepełny. Do uzupełnienia: Bagaż i dodatki do lotu, Nocleg, Dojazdy i transport, Transport miejski, Jedzenie i wydatki dzienne, Atrakcje i bilety wstępu, Inne koszty i rezerwa, Podatki i opłaty, Rezerwa awaryjna."
        - group [ref=e311]:
          - generic "Rozbicie kosztów całej grupy" [ref=e312] [cursor=pointer]
        - paragraph [ref=e313]: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
        - button "Wyczyść kalkulator" [ref=e314] [cursor=pointer]
        - region "Zapisz i udostępnij wyjazd" [ref=e315]:
          - heading "Zachowaj plan podróży" [level=3] [ref=e316]
          - paragraph [ref=e317]: Zapis tylko w tym profilu przeglądarki na tym urządzeniu. Usunięcie danych witryny usuwa plany. Zachowaj link, aby otworzyć kopię gdzie indziej.
          - paragraph [ref=e318]: Zapis otwiera plan z listy. Wybierz „Aktualizuj plan”, aby zachować w nim późniejsze zmiany. Udostępnianie tworzy niezależną kopię.
          - paragraph [ref=e319]: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
          - paragraph [ref=e320]: "Nowe linki przechowują plan po # w adresie, poza żądaniem wysyłanym do witryny. Link nie jest szyfrowany: każdy odbiorca może odczytać plan. Przeglądarka i usługa, w której wkleisz link, mogą zachować cały adres."
          - paragraph [ref=e321]: Ta wersja ma niezapisane zmiany.
          - generic [ref=e322]:
            - button "Zapisz wyjazd" [ref=e323] [cursor=pointer]
            - button "Udostępnij" [ref=e324] [cursor=pointer]
            - link "Zapisane wyjazdy" [ref=e325] [cursor=pointer]:
              - /url: /saved
          - paragraph
      - generic [ref=e326]:
        - heading "Cena na tle historii" [level=2] [ref=e328]
        - generic [ref=e329]:
          - group "Cena na tle historii" [ref=e330]:
            - paragraph [ref=e331]:
              - strong [ref=e332]: Brak wiarygodnego porównania tej ceny z historią.
            - paragraph [ref=e333]: Liczba obserwacji nieznana. Brak wystarczającej, zgodnej bazy porównawczej.
            - paragraph [ref=e334]:
              - text: "Czas zapisanej obserwacji:"
              - time [ref=e335]: pt., 6 lis 2026, 23:55
              - text: (czas w Polsce). Źródło czasu nieznane.
            - paragraph [ref=e336]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
          - paragraph [ref=e337]: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
          - paragraph [ref=e338]: Brakuje pełnych danych zgodnych z wyświetlaną ceną. Nie możemy rzetelnie odtworzyć porównania ani punktów. Potrzebne jest ponowne przeliczenie oferty.
          - link "Pełna metodologia porównania cen →" [ref=e339] [cursor=pointer]:
            - /url: /info/price-comparison
  - contentinfo [ref=e340]:
    - generic [ref=e341]:
      - generic [ref=e342]: HopTrip.
      - paragraph [ref=e343]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e344]:
      - link "Jak działa HopTrip" [ref=e345] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e346] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e347] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e348] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e349] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e350] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e351] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e352] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e353] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e354] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e355] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e357] [cursor=pointer]
  - alert [ref=e358]
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | test("trip anchors focus sections and the two-adult budget survives sharing",async({page},info)=>{
  4  |  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  5  |  await page.setViewportSize(info.project.name==="desktop"?{width:1366,height:900}:{width:390,height:844});
  6  |  await page.goto("/deals/browser-13");
  7  |  await expect(page.locator("#stay-checkin")).toBeEnabled();
  8  |  await page.evaluate(()=>document.fonts.ready);
  9  |  await page.addStyleTag({content:"nextjs-portal {display:none}"});
  10 |  expect((await new AxeBuilder({page}).include("#trip-flight").include(".trip-navigation").analyze()).violations).toEqual([]);
  11 |  await page.screenshot({path:`../../docs/htui02/after-${info.project.name}.png`,fullPage:true,scale:"css"});
  12 |  await page.locator("#accommodation").screenshot({path:`../../docs/htui02/form-${info.project.name}.png`,scale:"css"});
  13 |  const navigate=async(label:string,id:string)=>{
  14 |   await page.getByRole("navigation",{name:"Sekcje planu podróży"}).getByRole("link",{name:label,exact:true}).focus();
  15 |   await page.keyboard.press("Enter");
  16 |   await expect(page.locator(id)).toBeFocused();
> 17 |   expect((await page.locator(id).boundingBox())!.y).toBeGreaterThanOrEqual(0);
     |                                                     ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  18 |  };
  19 |  await navigate("Nocleg","#accommodation");
  20 |  await page.locator("#stay-checkin").fill("2027-01-15");
  21 |  await page.locator("#stay-checkout").fill("2027-01-22");
  22 |  await page.locator("#stay-adults").fill("2");
  23 |  await navigate("Budżet","#calculator");
  24 |  await page.locator("#budget-flight").fill("256");
  25 |  await page.locator("#budget-hotel").fill("200");
  26 |  await page.locator("#budget-food").fill("50");
  27 |  await expect(page.locator("#budget-nights")).toHaveValue("7");
  28 |  await expect(page.locator("#budget-days")).toHaveValue("8");
  29 |  await expect(page.getByTestId("budget-total")).toHaveText(/2\s*712,00/);
  30 |  await expect(page.getByTestId("budget-person")).toHaveText(/1\s*356,00/);
  31 |  await expect(page.locator("#calculator")).toContainText("Budżet niepełny");
  32 |  await page.reload();
  33 |  await expect(page.getByTestId("budget-total")).toHaveText(/2\s*712,00/);
  34 |  await navigate("Zapisz","#trip-save");
  35 |  await page.getByRole("button",{name:"Udostępnij",exact:true}).click();
  36 |  await page.goto(await page.locator("#trip-share-link").inputValue());
  37 |  await expect(page.getByTestId("budget-total")).toHaveText(/2\s*712,00/);
  38 |  await navigate("Lot","#trip-flight");
  39 |  await navigate("Nocleg","#accommodation");
  40 |  const href=await page.getByRole("link",{name:/przez Stay22/}).getAttribute("href");
  41 |  expect(Object.fromEntries(new URL(href!).searchParams)).toMatchObject({adults:"2",checkin:"2027-01-15",checkout:"2027-01-22",aid:"hoptrip",campaign:"hoptrip_accommodation"});
  42 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  43 |  await page.screenshot({path:`../../docs/htui02/shared-${info.project.name}.png`,fullPage:true,scale:"css"});
  44 | });
  45 | 
```