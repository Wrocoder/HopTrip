# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility-review.spec.ts >> accessible core states and planned-event removal in pl
- Location: tests\accessibility-review.spec.ts:13:56

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 4.5
Received:    3.45414150624405
```

# Page snapshot

```yaml
- generic [ref=f3e1]:
  - link "Przejdź do treści" [ref=f3e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f3e3]:
    - link "HopTrip — strona główna" [ref=f3e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=f3e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f3e6]: .
    - navigation "Nawigacja główna" [ref=f3e7]:
      - link "Tanie loty" [ref=f3e8] [cursor=pointer]:
        - /url: /deals
      - link "Na weekend" [ref=f3e9] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Kierunki" [ref=f3e10] [cursor=pointer]:
        - /url: /#home-destinations
      - link "Zapisane" [ref=f3e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=f3e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=f3e13]:
      - link "Polski" [ref=f3e14] [cursor=pointer]:
        - /url: /deals/browser-deal
      - link "Русский" [ref=f3e15] [cursor=pointer]:
        - /url: /ru/deals/browser-deal
      - link "English" [ref=f3e16] [cursor=pointer]:
        - /url: /en/deals/browser-deal
      - link "Українська" [ref=f3e17] [cursor=pointer]:
        - /url: /uk/deals/browser-deal
  - main [ref=f3e19]:
    - link "← Aktualne okazje" [ref=f3e20] [cursor=pointer]:
      - /url: /deals
    - article [ref=f3e21]:
      - generic [ref=f3e22]:
        - paragraph [ref=f3e23]: W jedną stronę
        - heading [level=1] [ref=f3e24]:
          - text: Wrocław (WRO) → Barcelona
          - img "Hiszpania" [ref=f3e25]
        - paragraph [ref=f3e26]: "Daty oferty: wt., 1 gru 2026"
      - navigation "Sekcje planu podróży" [ref=f3e27]:
        - link "Lot" [ref=f3e28] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "Do partnera" [ref=f3e29] [cursor=pointer]:
          - /url: "#trip-booking"
        - link "Nocleg" [ref=f3e30] [cursor=pointer]:
          - /url: "#accommodation"
        - link "Atrakcje" [ref=f3e31] [cursor=pointer]:
          - /url: "#destination-activities"
        - link "Wydarzenia" [ref=f3e32] [cursor=pointer]:
          - /url: "#trip-events"
        - link "Budżet" [ref=f3e33] [cursor=pointer]:
          - /url: "#calculator"
        - link "Zapisz" [ref=f3e34] [cursor=pointer]:
          - /url: "#trip-save"
        - link "Porównanie ceny" [ref=f3e35] [cursor=pointer]:
          - /url: "#score"
      - generic [ref=f3e36]:
        - region "Cena lotu" [ref=f3e37]:
          - paragraph [ref=f3e38]: za osobę · PLN
          - paragraph [ref=f3e39]:
            - text: 200,25 zł
            - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=f3e40]':
              - generic [aria-hidden] [ref=f3e41]: ≈ 46 €
            - generic [ref=f3e43]: za osobę · w jedną stronę
          - generic [ref=f3e44]:
            - paragraph [ref=f3e45]:
              - text: "Pierwszy zapis tej ceny w HopTrip:"
              - time [ref=f3e46]: niedz., 1 lis 2026, 09:15
              - text: (czas w Polsce).
            - paragraph [ref=f3e47]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
            - group [ref=f3e48]:
              - generic "Pochodzenie i czas wycofania oferty" [ref=f3e49] [cursor=pointer]
          - paragraph [ref=f3e50]:
            - strong [ref=f3e51]: Cena o 49,75 zł poniżej mediany próby.
            - text: "Obserwacje: 24. Próba kierunku, nie identycznych taryf ani całego rynku."
          - heading "Szczegóły lotu" [level=2] [ref=f3e52]
          - generic [ref=f3e53]:
            - note [ref=f3e54]:
              - strong [ref=f3e55]: Sprawdź trasę przed wyborem
              - paragraph [ref=f3e56]: Nie można potwierdzić danych trasy ze źródła.
              - list
              - paragraph [ref=f3e57]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
            - paragraph [ref=f3e58]:
              - strong [ref=f3e59]: Wylot
              - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · brak godziny
              - generic [ref=f3e60]: Przesiadki do sprawdzenia u partnera
            - paragraph [ref=f3e61]: "Wylot: Przewoźnik do sprawdzenia"
          - paragraph [ref=f3e62]: Bez noclegu · bagaż do sprawdzenia
          - group [ref=f3e63]:
            - generic "Pełne dane lotu i bagaż" [ref=f3e64] [cursor=pointer]
        - region [ref=f3e65]:
          - heading "Przejście do partnera" [level=2] [ref=f3e66]
          - generic [ref=f3e67]: Współpraca partnerska
          - generic [ref=f3e68]:
            - paragraph [ref=f3e69]:
              - text: 200,25 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=f3e70]':
                - generic [aria-hidden] [ref=f3e71]: ≈ 46 €
              - generic [ref=f3e73]: za osobę · w jedną stronę
            - paragraph [ref=f3e74]:
              - strong [ref=f3e75]: U partnera ustaw 1 dorosłego.
              - text: Link otwiera daty tej oferty. Nie przekazujemy zmian dat ani liczby pasażerów z planu. Sprawdź cenę u partnera.
            - link "Sprawdź lot — Fixture program" [ref=f3e76] [cursor=pointer]:
              - /url: http://127.0.0.1:8125/go/browser-deal/flight
          - paragraph [ref=f3e77]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
      - region [ref=f3e78]:
        - heading "Znajdź nocleg — Barcelona" [level=2] [ref=f3e79]
        - paragraph [ref=f3e80]: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
        - paragraph [ref=f3e81]: Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.
        - group [ref=f3e82]:
          - generic "Jak dobrać daty noclegu do lotu?" [ref=f3e83] [cursor=pointer]
        - paragraph [ref=f3e84]: To lot w jedną stronę — uzupełnij datę wymeldowania.
        - group "Daty pobytu i dorośli" [ref=f3e85]:
          - generic [ref=f3e87]:
            - generic [ref=f3e88]:
              - generic [ref=f3e89]: Zameldowanie
              - textbox "Zameldowanie" [ref=f3e90]: 2026-12-01
            - generic [ref=f3e91]:
              - generic [ref=f3e92]: Wymeldowanie
              - textbox "Wymeldowanie" [ref=f3e93]: 2026-12-03
            - generic [ref=f3e94]:
              - generic [ref=f3e95]: Dorośli
              - spinbutton "Dorośli" [ref=f3e96]: "1"
        - paragraph [ref=f3e97]: Sprawdź ponownie ceny noclegu i lotu dla zmienionego planu. Wpisane kwoty pozostają w budżecie.
        - generic [ref=f3e98]:
          - paragraph [ref=f3e99]:
            - strong [ref=f3e100]: Barcelona
            - text: ": wt., 1 gru 2026 – czw., 3 gru 2026 · 2 noce · dorośli: 1."
          - link "Znajdź nocleg przez Stay22 (nowa karta)" [ref=f3e101] [cursor=pointer]:
            - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-12-01&checkout=2026-12-03&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
        - paragraph [ref=f3e102]: Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.
        - paragraph [ref=f3e103]: Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.
        - group [ref=f3e104]:
          - generic "Jak dodać cenę noclegu do planu?" [ref=f3e105] [cursor=pointer]
        - link "Dodaj koszt noclegu do budżetu podróży" [ref=f3e106] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=f3e107]:
        - paragraph [ref=f3e108]: Pomysły na pobyt · Barcelona
        - heading "Muzea i atrakcje" [level=2] [ref=f3e109]
        - paragraph [ref=f3e110]: Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.
        - list [ref=f3e111]:
          - listitem [ref=f3e112]:
            - generic [ref=f3e113]: Architektura
            - heading "Casa Batlló — bilet Blue" [level=3] [ref=f3e114]
            - paragraph [ref=f3e115]: Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.
            - paragraph [ref=f3e116]:
              - strong [ref=f3e117]: "Dla kogo:"
              - text: Dla osób zainteresowanych architekturą Gaudíego i zwiedzaniem z audioprzewodnikiem.
            - paragraph [ref=f3e118]:
              - strong [ref=f3e119]: "Czas wizyty:"
              - text: Około 1 godziny dla wariantu Blue; bez dojazdu i oczekiwania na wejście.
            - paragraph [ref=f3e120]: Wariant Blue nie obejmuje tarasu na dachu, tabletu VR ani wejścia bez kolejki. Sprawdź godzinę wejścia i język audioprzewodnika.
            - generic [ref=f3e121]:
              - paragraph [ref=f3e122]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=f3e123]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Casa Batlló — bilet Blue (nowa karta)" [ref=f3e124] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Sprawdź daty i cenę
              - paragraph [ref=f3e125]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=f3e126] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=f3e127]:
            - generic [ref=f3e128]: Akwarium
            - heading "Aquarium Barcelona — bilet wstępu" [level=3] [ref=f3e129]
            - paragraph [ref=f3e130]: "Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą."
            - paragraph [ref=f3e131]:
              - strong [ref=f3e132]: "Dla kogo:"
              - text: Dla rodzin i osób ciekawych morskiej przyrody; propozycja zwiedzania pod dachem.
            - paragraph [ref=f3e133]:
              - strong [ref=f3e134]: "Czas wizyty:"
              - text: Orientacyjnie 1,5–2 godziny na zwiedzanie; bez dojazdu i kolejki.
            - paragraph [ref=f3e135]: Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.
            - generic [ref=f3e136]:
              - paragraph [ref=f3e137]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=f3e138]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Aquarium Barcelona — bilet wstępu (nowa karta)" [ref=f3e139] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Sprawdź daty i cenę
              - paragraph [ref=f3e140]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=f3e141] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=f3e142]:
            - generic [ref=f3e143]: Przyroda · bezpłatny wstęp
            - heading "Hivernacle — oranżeria w parku Ciutadella" [level=3] [ref=f3e144]
            - paragraph [ref=f3e145]: Zabytkowa oranżeria z kolekcjami roślin w parku Ciutadella.
            - paragraph [ref=f3e146]:
              - strong [ref=f3e147]: "Dla kogo:"
              - text: Dla miłośników roślin i spokojnego spaceru wśród zieleni.
            - paragraph [ref=f3e148]: Bezpłatny wstęp dotyczy samodzielnej wizyty. Sprawdź godziny i zamknięcia; wycieczki z przewodnikiem mają osobne zasady i rezerwacje.
            - generic [ref=f3e149]:
              - paragraph [ref=f3e150]: "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony."
              - 'link "Sprawdź zasady wizyty: Hivernacle — oranżeria w parku Ciutadella (nowa karta)" [ref=f3e151] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Sprawdź zasady wizyty
        - paragraph [ref=f3e152]: Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu, ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.
        - paragraph [ref=f3e153]: Opisy i zasady sprawdzono pon., 12 paź 2026. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.
        - paragraph [ref=f3e154]: W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.
        - link "Uwzględnij atrakcje w budżecie" [ref=f3e155] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=f3e156]:
        - generic [ref=f3e157]:
          - generic [ref=f3e158]:
            - heading "Wydarzenia w terminie podróży" [level=2] [ref=f3e159]
            - paragraph [ref=f3e160]: Koncerty, sport i kultura w mieście docelowym. Bilety na wydarzenia kupujesz osobno.
          - generic [ref=f3e161]: Ticketmaster
        - paragraph [ref=f3e162]:
          - generic [ref=f3e163]: Twój pobyt · Barcelona
          - strong [ref=f3e164]: 1 gru 2026 – 3 gru 2026
        - generic [ref=f3e165]:
          - strong [ref=f3e166]: Daty podróży
          - button "Inne daty" [ref=f3e167] [cursor=pointer]
        - paragraph [ref=f3e168]: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
        - generic [ref=f3e169]:
          - generic [ref=f3e170]:
            - text: Od
            - textbox "Od" [ref=f3e171]: 2026-12-01
          - generic [ref=f3e172]:
            - text: Do
            - textbox "Do" [ref=f3e173]: 2026-12-03
          - generic [ref=f3e174]:
            - text: Kategoria
            - combobox "Kategoria" [ref=f3e175]:
              - option "Wszystkie" [selected]
              - option "Muzyka"
              - option "Sport"
              - option "Kultura"
              - option "Inne"
          - button "Pokaż wydarzenia" [ref=f3e176] [cursor=pointer]
        - generic [ref=f3e177]:
          - generic [ref=f3e178]:
            - text: Przeglądaj dni
            - combobox "Przeglądaj dni" [ref=f3e179]:
              - option "Wszystkie dni" [selected]
              - option "wt., 1 gru"
              - option "śr., 2 gru"
              - option "czw., 3 gru"
          - button "Poprzedni dzień" [disabled] [ref=f3e180]: ←
          - button "Następny dzień" [ref=f3e181] [cursor=pointer]: →
        - status [ref=f3e182]:
          - paragraph [ref=f3e183]:
            - text: "Wyświetlane wydarzenia:"
            - strong [ref=f3e184]: "2"
            - text: · Wszystkie dni · Czas lokalny
        - group [ref=f3e185]:
          - generic "Zgodność z rozkładem lotu" [ref=f3e186] [cursor=pointer]
        - list [ref=f3e187]:
          - listitem [ref=f3e188]:
            - generic [ref=f3e189]:
              - generic [ref=f3e190]: Muzyka
              - generic [aria-hidden] [ref=f3e191]: 1 gru
            - heading "Test-only accessibility event a" [level=3] [ref=f3e192]
            - paragraph [ref=f3e193]: Fixture venue · Barcelona
            - paragraph [ref=f3e194]:
              - time [ref=f3e195]: 1 gru 2026
              - text: · 20:00
            - paragraph [ref=f3e196]: "Strefa czasu wydarzenia: Europe/Madrid"
            - paragraph [ref=f3e197]: "W źródle: w sprzedaży — dostępność do sprawdzenia"
            - note "Zgodność z rozkładem lotu" [ref=f3e198]:
              - paragraph [ref=f3e199]:
                - strong [ref=f3e200]: Zgodność z lotem nie została sprawdzona
              - paragraph [ref=f3e201]: Czas trwania nieznany.
            - paragraph [ref=f3e202]: Cena do sprawdzenia u sprzedawcy
            - 'link "Sprawdź daty i cenę: Test-only accessibility event a. Otwiera się w nowej karcie" [ref=f3e203] [cursor=pointer]':
              - /url: https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fa11y-a
              - text: Sprawdź daty i cenę
              - generic [aria-hidden] [ref=f3e204]: ↗
            - 'button "Dodaj do planu: Test-only accessibility event a" [ref=f3e206] [cursor=pointer]': Dodaj do planu
          - listitem [ref=f3e207]:
            - generic [ref=f3e208]:
              - generic [ref=f3e209]: Muzyka
              - generic [aria-hidden] [ref=f3e210]: 1 gru
            - heading "Test-only accessibility event b" [level=3] [ref=f3e211]
            - paragraph [ref=f3e212]: Fixture venue · Barcelona
            - paragraph [ref=f3e213]:
              - time [ref=f3e214]: 1 gru 2026
              - text: · 20:00
            - paragraph [ref=f3e215]: "Strefa czasu wydarzenia: Europe/Madrid"
            - paragraph [ref=f3e216]: "W źródle: w sprzedaży — dostępność do sprawdzenia"
            - note "Zgodność z rozkładem lotu" [ref=f3e217]:
              - paragraph [ref=f3e218]:
                - strong [ref=f3e219]: Zgodność z lotem nie została sprawdzona
              - paragraph [ref=f3e220]: Czas trwania nieznany.
            - paragraph [ref=f3e221]: Cena do sprawdzenia u sprzedawcy
            - 'link "Sprawdź daty i cenę: Test-only accessibility event b. Otwiera się w nowej karcie" [ref=f3e222] [cursor=pointer]':
              - /url: https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fa11y-b
              - text: Sprawdź daty i cenę
              - generic [aria-hidden] [ref=f3e223]: ↗
            - 'button "Dodaj do planu: Test-only accessibility event b" [ref=f3e225] [cursor=pointer]': Dodaj do planu
        - paragraph [ref=f3e226]: "Źródło: Ticketmaster · Czas sprawdzenia nieznany"
        - paragraph [ref=f3e227]: Dane katalogu, nie dostępność na żywo. Status sprzedaży i cena od nie gwarantują wolnych biletów; potwierdź je u sprzedawcy. Nieaktywnej lub nieznanej sprzedaży nie dodajemy z listy do planu.
        - group [ref=f3e228]:
          - generic "Przed rezerwacją" [ref=f3e229] [cursor=pointer]
        - paragraph [ref=f3e230]: "Linki partnerskie: HopTrip może otrzymać prowizję od zakupu. Dostępność biletów i zasady wstępu potwierdź u sprzedawcy."
      - navigation "Zaplanuj pobyt" [ref=f3e231]:
        - heading "Zaplanuj pobyt" [level=2] [ref=f3e232]
        - list [ref=f3e233]:
          - listitem [ref=f3e234]:
            - 'link "Barcelona: BCN, Girona czy Reus" [ref=f3e235] [cursor=pointer]':
              - /url: /info/barcelona-airports
          - listitem [ref=f3e236]:
            - 'link "Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu" [ref=f3e237] [cursor=pointer]':
              - /url: /info/barcelona-3-days
      - region [active] [ref=f3e238]:
        - heading "Kalkulator budżetu podróży" [level=2] [ref=f3e239]
        - paragraph [ref=f3e240]: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
        - paragraph [ref=f3e241]: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
        - group "Tryb kalkulatora" [ref=f3e242]:
          - button "Szybki budżet" [pressed] [ref=f3e243] [cursor=pointer]
          - button "Szczegółowy budżet" [ref=f3e244] [cursor=pointer]
        - paragraph [ref=f3e245]: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
        - group [ref=f3e246]:
          - generic "Jak liczymy koszty?" [ref=f3e247] [cursor=pointer]
        - paragraph [ref=f3e248]: Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.
        - group "Twój plan podróży" [ref=f3e249]:
          - generic [ref=f3e251]:
            - generic [ref=f3e252]:
              - generic [ref=f3e253]: Początek pobytu (opcjonalnie)
              - textbox "Początek pobytu (opcjonalnie)" [ref=f3e254]: 2026-12-01
            - generic [ref=f3e255]:
              - generic [ref=f3e256]: Koniec pobytu (opcjonalnie)
              - textbox "Koniec pobytu (opcjonalnie)" [ref=f3e257]: 2026-12-03
          - paragraph [ref=f3e258]: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
          - generic [ref=f3e259]:
            - generic [ref=f3e260]:
              - generic [ref=f3e261]: Liczba dorosłych
              - generic [ref=f3e262]: Od 1 do 50 osób
              - textbox "Liczba dorosłych" [ref=f3e263]: "1"
            - generic [ref=f3e264]:
              - generic [ref=f3e265]: Liczba nocy
              - generic [ref=f3e266]: Od 0 do 365 nocy
              - textbox "Liczba nocy" [ref=f3e267]: "2"
            - generic [ref=f3e268]:
              - generic [ref=f3e269]: Liczba dni wydatków
              - generic [ref=f3e270]: Od 1 do 365 dni, także dni przylotu i odlotu
              - textbox "Liczba dni wydatków" [ref=f3e271]: "3"
          - paragraph [ref=f3e272]:
            - generic [ref=f3e273]:
              - checkbox "Wszyscy podróżni są dorośli" [checked] [ref=f3e274]
              - text: Wszyscy podróżni są dorośli
          - generic [ref=f3e275]:
            - paragraph [ref=f3e276]: Zmieniono daty, długość pobytu, liczbę osób lub dane oferty. Sprawdź ponownie loty, nocleg, transfery i pozostałe wpisane kwoty. Przeliczenie sumy nie potwierdza cen u sprzedawców.
            - button "Kwoty sprawdzone dla tego planu" [ref=f3e277] [cursor=pointer]
          - group [ref=f3e278]:
            - generic "Sprawdź orientacyjne koszty na miejscu" [ref=f3e279] [cursor=pointer]
            - 'option "Barcelona: T-casual, 10 przejazdów, 1 strefa — 13,00 EUR" [selected]'
          - heading "Główne koszty" [level=3] [ref=f3e280]
          - generic [ref=f3e281]:
            - generic [ref=f3e282]:
              - generic [ref=f3e283]: Loty (PLN)
              - generic [ref=f3e284]: Na osobę, za wszystkie planowane odcinki
              - textbox "Loty (PLN)" [ref=f3e285]:
                - /placeholder: Nieznane
                - text: "200.25"
              - generic [ref=f3e286]: Wpisana kwota — do weryfikacji
            - generic [ref=f3e287]:
              - generic [ref=f3e288]: Jak podana jest cena noclegu?
              - combobox "Jak podana jest cena noclegu?" [ref=f3e289]:
                - option "Za jedną noc — cała grupa" [selected]
                - option "Za cały pobyt — cała grupa"
              - generic [ref=f3e290]:
                - generic [ref=f3e291]: Nocleg (PLN)
                - generic [ref=f3e292]: Za jedną noc dla całej grupy (wszystkie pokoje)
                - textbox "Nocleg (PLN)" [ref=f3e293]:
                  - /placeholder: Nieznane
                - generic [ref=f3e294]: Nieznane
              - generic [ref=f3e295]: Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.
            - generic [ref=f3e296]:
              - generic [ref=f3e297]: Dojazdy i transport (PLN)
              - generic [ref=f3e298]: "Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
              - textbox "Dojazdy i transport (PLN)" [ref=f3e299]:
                - /placeholder: Nieznane
              - generic [ref=f3e300]: Nieznane
            - generic [ref=f3e301]:
              - generic [ref=f3e302]: Jedzenie i wydatki dzienne (PLN)
              - generic [ref=f3e303]: Na osobę dziennie
              - textbox "Jedzenie i wydatki dzienne (PLN)" [ref=f3e304]:
                - /placeholder: Nieznane
              - generic [ref=f3e305]: Nieznane
          - group [ref=f3e306]:
            - 'generic "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa" [ref=f3e307] [cursor=pointer]'
        - status [ref=f3e308]:
          - heading "Szacowany budżet całej grupy (PLN)" [level=3] [ref=f3e309]
          - paragraph [ref=f3e310]:
            - text: "Suma znanych kosztów:"
            - strong [ref=f3e311]: 200,25 zł
          - paragraph [ref=f3e312]:
            - text: "Na osobę przy równym podziale (w zaokrągleniu):"
            - strong [ref=f3e313]: 200,25 zł
          - paragraph [ref=f3e314]: "Budżet niepełny. Do uzupełnienia: Bagaż i dodatki do lotu, Nocleg, Dojazdy i transport, Transport miejski, Jedzenie i wydatki dzienne, Atrakcje i bilety wstępu, Inne koszty i rezerwa, Podatki i opłaty, Rezerwa awaryjna."
        - group [ref=f3e315]:
          - generic "Rozbicie kosztów całej grupy" [ref=f3e316] [cursor=pointer]
        - paragraph [ref=f3e317]: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
        - button "Wyczyść kalkulator" [ref=f3e318] [cursor=pointer]
        - region "Zapisz i udostępnij wyjazd" [ref=f3e319]:
          - heading "Zachowaj plan podróży" [level=3] [ref=f3e320]
          - paragraph [ref=f3e321]: Zapis tylko w tym profilu przeglądarki na tym urządzeniu. Usunięcie danych witryny usuwa plany. Zachowaj link, aby otworzyć kopię gdzie indziej.
          - paragraph [ref=f3e322]: Zapis dodaje kopię do listy. Zmiany kalkulatora zapisujemy osobno w tej przeglądarce; zapisz ponownie, aby zachować nową kopię. Otwarcie kopii przywraca też jej lokalny szkic kalkulatora, jeśli istnieje.
          - paragraph [ref=f3e323]: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
          - paragraph [ref=f3e324]: Ta wersja nie jest jeszcze na liście zapisanych wyjazdów.
          - generic [ref=f3e325]:
            - button "Zapisz wyjazd" [ref=f3e326] [cursor=pointer]
            - button "Udostępnij" [ref=f3e327] [cursor=pointer]
            - link "Zapisane wyjazdy" [ref=f3e328] [cursor=pointer]:
              - /url: /saved
          - paragraph
      - generic [ref=f3e329]:
        - heading "Cena na tle historii" [level=2] [ref=f3e331]
        - generic [ref=f3e332]:
          - group "Cena na tle historii" [ref=f3e333]:
            - paragraph [ref=f3e334]:
              - strong [ref=f3e335]: Cena o 49,75 zł poniżej mediany próby.
              - text: "Mediana: 250,00 zł."
            - paragraph [ref=f3e336]: "Liczba obserwacji: 24. Próg porównania: 5; próbka nie obejmuje całego rynku."
            - group [ref=f3e337]:
              - generic "Zakres i wiarygodność porównania" [ref=f3e338]
            - paragraph [ref=f3e339]:
              - text: "Pierwszy zapis tej ceny w HopTrip:"
              - time [ref=f3e340]: niedz., 1 lis 2026, 09:15
              - text: (czas w Polsce).
            - paragraph [ref=f3e341]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
          - paragraph [ref=f3e342]: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
          - group [ref=f3e343]:
            - generic "Jak działa pomocniczy wynik sortowania?" [ref=f3e344] [cursor=pointer]
          - group [ref=f3e345]:
            - generic "Co porównujemy, a czego nie uwzględniamy?" [ref=f3e346] [cursor=pointer]
          - link "Pełna metodologia porównania cen →" [ref=f3e347] [cursor=pointer]:
            - /url: /info/price-comparison
  - contentinfo [ref=f3e348]:
    - generic [ref=f3e349]:
      - generic [ref=f3e350]: HopTrip.
      - paragraph [ref=f3e351]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=f3e352]:
      - link "Jak działa HopTrip" [ref=f3e353] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=f3e354] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=f3e355] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=f3e356] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=f3e357] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=f3e358] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=f3e359] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=f3e360] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=f3e361] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=f3e362] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=f3e363] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=f3e365] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=f3e371] [cursor=pointer]
  - alert [ref=f3e375]
```

# Test source

```ts
  1   | import {test,expect,type Locator} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {writeFileSync} from 'node:fs';
  4   | import {localizedHref} from '../src/lib/i18n/routing';
  5   | import {scoreText} from '../src/lib/i18n/score-copy';
  6   | import {plannedEventsCopy} from '../src/lib/i18n/planned-events-copy';
  7   | import {catalogText} from '../src/lib/i18n/catalog-copy';
  8   | 
  9   | async function namedControls(scope:Locator) {
  10  |  for(const control of await scope.locator('input:not([type="hidden"]),select,textarea,button').all())if(await control.isVisible())await expect(control).toHaveAccessibleName(/\S/);
  11  | }
  12  | 
  13  | for(const locale of ['pl','en','ru','uk'] as const)test(`accessible core states and planned-event removal in ${locale}`,async({page},info)=>{
  14  |  test.setTimeout(180000);
  15  |  if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
  16  |  await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:['a','b'].map(id=>({
  17  |   id:`a11y-${id}`,name:`Test-only accessibility event ${id}`,venue:'Fixture venue',city:'Barcelona',category:'MUSIC',
  18  |   start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
  19  |   url:`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fa11y-${id}`,price_from:null,currency:null,
  20  |  }))}}));
  21  |  const audits:unknown[]=[],trees:unknown[]=[];
  22  |  const scan=async(state:string)=>{
  23  |   const result=await new AxeBuilder({page}).analyze();
  24  |   const missing=await page.evaluate(()=>[...document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls],[aria-activedescendant]')].flatMap(el=>
  25  |    ['aria-labelledby','aria-describedby','aria-controls','aria-activedescendant'].flatMap(attr=>(el.getAttribute(attr)??'').split(/\s+/).filter(Boolean).filter(id=>!document.getElementById(id)).map(id=>({tag:el.tagName,attr,id})))));
  26  |   audits.push({state,violations:result.violations,incomplete:result.incomplete,missing});
  27  |   writeFileSync(info.outputPath(`axe-${locale}.json`),JSON.stringify(audits,null,2));
  28  |   expect(result.violations).toEqual([]);expect(missing).toEqual([]);
  29  |   expect(result.incomplete.filter(rule=>rule.id!=='color-contrast')).toEqual([]);
  30  |  };
  31  |  await page.goto(localizedHref('/deals',locale));
  32  |  const consent=page.locator('.consent-panel');await expect(consent).toBeVisible();await namedControls(consent);await scan('initial-consent');
  33  |  await consent.locator('.consent-actions button').first().focus();await page.keyboard.press('Enter');
  34  |  await expect(consent).toHaveCount(0);await expect(page.locator('.privacy-settings')).toBeFocused();
  35  |  await page.goto(localizedHref('/',locale));
  36  |  await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('#content')).toBeFocused();
  37  |  await namedControls(page.locator('main'));await scan('home');
  38  |  await page.goto(localizedHref('/deals',locale));await expect(page.locator('.deal-card').first()).toBeVisible();
  39  |  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.deal-card').first().hover();await expect(page.locator('.deal-card').first()).toHaveCSS('transform','none');
  40  |  const trigger=page.locator('.score-trigger').first();await trigger.focus();await page.keyboard.press('Enter');
  41  |  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog).toHaveAccessibleName(/\S/);
  42  |   await expect(dialog.getByRole('group',{name:catalogText(locale,'Cena na tle historii'),exact:true})).toBeVisible();
  43  |  await expect(dialog.locator('.score-close')).toHaveAccessibleName(scoreText(locale,'close'));await expect(dialog.locator('.score-close')).toBeFocused();
  44  |  expect(await dialog.evaluate(el=>el.matches(':modal'))).toBe(true);await page.keyboard.press('Shift+Tab');
  45  |  const boundary=await page.evaluate(()=>({inside:!!document.activeElement?.closest('dialog[open]'),browser:!document.hasFocus()&&document.activeElement===document.body}));
  46  |  expect(boundary.inside||boundary.browser).toBe(true);if(boundary.browser)await page.keyboard.press('Shift+Tab');
  47  |  expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog[open]'))).toBe(true);
  48  |  trees.push({state:'dialog',tree:await dialog.ariaSnapshot()});await scan('modal');
  49  |  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
  50  |  const origin=page.locator('.filters input[name="origin"]');await origin.fill('missing-airport');await page.locator('.filters button[type="submit"]').click();
  51  |  const alert=page.locator('.filters [role="alert"]');await expect(alert).toBeVisible();await expect(origin).toBeFocused();await expect(origin).toHaveAttribute('aria-invalid','true');await expect(origin).toHaveAccessibleDescription(/\S/);
  52  |  await scan('filter-error');
  53  |  await page.goto(localizedHref('/deals/browser-deal',locale));await expect(page.locator('#budget-flight')).toBeEnabled();
  54  |   const eur=page.locator('small.price-eur').first();
  55  |   if(await eur.count()){
  56  |    await expect(eur).not.toHaveAttribute('aria-label');await expect(eur.locator('[aria-hidden="true"]')).toBeVisible();
  57  |    await expect(eur.locator('[aria-hidden="true"]')).toHaveCSS('display','inline');
  58  |    await expect(eur.locator('.sr-only')).toHaveText((await eur.getAttribute('title'))!);
  59  |    const euroTree=await eur.ariaSnapshot();expect(euroTree).toContain('NBP');trees.push({state:'eur-explanation',tree:euroTree});
  60  |   }else trees.push({state:'eur-not-published',note:'Optional conversion; deterministic rate-present and rate-missing branches are tested in Node.'});
  61  |  const start=await page.locator('#budget-start').inputValue(),end=new Date(start+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+2);
  62  |  await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
  63  |  for(const id of ['a','b'])await page.locator(`#trip-events button[aria-label$=": Test-only accessibility event ${id}"]`).click();
  64  |  const first=page.locator('#planned-events > ul > li').filter({has:page.getByRole('heading',{name:'Test-only accessibility event a',exact:true})});
  65  |  const second=page.locator('#planned-events > ul > li').filter({has:page.getByRole('heading',{name:'Test-only accessibility event b',exact:true})});
  66  |  await first.locator('input[inputmode="numeric"]').fill('2');await first.locator('input[inputmode="decimal"]').fill('10');await second.locator('input[inputmode="decimal"]').fill('30');
  67  |  await expect(page.getByTestId('budget-total')).toContainText(/250[,.]25/);
  68  |  await namedControls(page.locator('main'));await scan('detail-planned');
  69  |  await page.locator('#budget-flight').fill('-1');await first.locator('input[inputmode="numeric"]').fill('0');
  70  |  for(const control of [page.locator('#budget-flight'),first.locator('input[inputmode="numeric"]')]){
  71  |   await expect(control).toHaveAttribute('aria-invalid','true');await expect(control).toHaveAccessibleDescription(/\S/);
  72  |   const ids=(await control.getAttribute('aria-describedby'))!.split(/\s+/);const error=page.locator(`[id="${ids.at(-1)}"]`);await expect(error).toBeVisible();await expect(error).toHaveText(/\S/);
  73  |  }
  74  |  await scan('detail-errors');
  75  |  await page.locator('#budget-flight').fill('200.25');await first.locator('input[inputmode="numeric"]').fill('2');
  76  |  await first.getByRole('button',{name:`${plannedEventsCopy[locale].remove}: Test-only accessibility event a`,exact:true}).focus();await page.keyboard.press('Enter');
  77  |  await expect(page.locator('#planned-events')).toBeFocused();await expect(page.getByTestId('budget-total')).toContainText(/230[,.]25/);
  78  |  await second.getByRole('button',{name:`${plannedEventsCopy[locale].remove}: Test-only accessibility event b`,exact:true}).focus();await page.keyboard.press('Enter');
  79  |  await expect(page.locator('#planned-events')).toHaveCount(0);await expect(page.locator('#calculator')).toBeFocused();await expect(page.getByTestId('budget-total')).toContainText(/200[,.]25/);
  80  |  trees.push({state:'calculator-after-removal',tree:await page.locator('#calculator').ariaSnapshot()});
  81  |   const colors=await page.evaluate(()=>{
  82  |    const root=getComputedStyle(document.documentElement),token=(name:string)=>root.getPropertyValue(name).trim();
  83  |    const rgb=(color:string)=>color.startsWith('#')?color.slice(1).match(/../g)!.map(n=>parseInt(n,16)):color.match(/[\d.]+/g)!.slice(0,3).map(Number);
  84  |    const lum=(color:string)=>rgb(color).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
  85  |    const contrast=(a:string,b:string)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  86  |    const backgrounds=['--color-surface','--color-surface-soft','--color-surface-subtle','--control-background'].map(token);
  87  |    const text=[...document.querySelectorAll('#trip-events h2,#trip-events header p,#trip-events form > label,#trip-events select,#budget-hotel-basis')].map(el=>{
  88  |     const s=getComputedStyle(el);return{tag:el.tagName,color:s.color,minRatio:Math.min(...backgrounds.map(bg=>contrast(s.color,bg)))};
  89  |    });
  90  |    const field=getComputedStyle(document.querySelector('#budget-hotel-basis')!);
  91  |    return{text,backgrounds,border:{color:field.borderTopColor,background:field.backgroundColor,ratio:contrast(field.borderTopColor,field.backgroundColor)},arrow:{image:field.backgroundImage,ratio:contrast(token('--color-primary'),field.backgroundColor)}};
  92  |   });
> 93  |   for(const sample of colors.text)expect(sample.minRatio).toBeGreaterThanOrEqual(4.5);
      |                                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  94  |   expect(colors.border.ratio).toBeGreaterThanOrEqual(3);expect(colors.arrow.ratio).toBeGreaterThanOrEqual(3);expect(colors.arrow.image).toContain('svg');
  95  |   writeFileSync(info.outputPath(`manual-colors-${locale}.json`),JSON.stringify(colors,null,2));
  96  |  await page.emulateMedia({forcedColors:'active'});await page.locator('#budget-flight').focus();await expect(page.locator('#budget-flight')).toHaveCSS('outline-width','3px');await expect(page.locator('#budget-flight')).toHaveCSS('box-shadow','none');
  97  |  await page.emulateMedia({forcedColors:'none'});await scan('after-removal');
  98  |  if(locale==='pl')await page.screenshot({path:info.outputPath('removal-focus.png'),scale:'css',animations:'disabled'});
  99  |  await page.locator('#trip-save .trip-actions button').first().click();await page.goto(localizedHref('/saved',locale));await scan('saved');
  100 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  101 |  writeFileSync(info.outputPath(`semantics-${locale}.json`),JSON.stringify(trees,null,2));
  102 | });
  103 | 
```