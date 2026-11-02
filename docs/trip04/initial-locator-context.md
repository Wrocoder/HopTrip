# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: event-context.spec.ts >> event context and OTHER filter preserve the plan in pl
- Location: tests\event-context.spec.ts:13:56

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('#trip-events').getByLabel('Kategoria', { exact: true })

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
        - /url: /#home-destinations
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
        - paragraph [ref=e26]: "Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026"
        - paragraph [ref=e27]: 3 noce planowanego pobytu — daty noclegu sprawdź osobno.
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
            - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e41]': ≈ 48 €
            - generic [ref=e42]: za osobę · w obie strony
          - generic [ref=e43]:
            - paragraph [ref=e44]:
              - text: "Czas zapisanej obserwacji:"
              - time [ref=e45]: sob., 31 paź 2026, 22:39
              - text: (czas w Polsce).
            - paragraph [ref=e46]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
            - group [ref=e47]:
              - generic "Pochodzenie i czas wycofania oferty" [ref=e48] [cursor=pointer]
          - paragraph [ref=e49]:
            - strong [ref=e50]: Brak wiarygodnego porównania tej ceny z historią.
          - heading "Szczegóły lotu" [level=2] [ref=e51]
          - generic [ref=e52]:
            - note [ref=e53]:
              - strong [ref=e54]: Niepełne dane lotu
              - paragraph [ref=e55]: Nie wszystkie godziny podróży są znane.
              - group [ref=e56]:
                - generic "Jakich danych brakuje?" [ref=e57]
              - paragraph [ref=e58]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
            - paragraph [ref=e59]:
              - strong [ref=e60]: Wylot
              - text: "· 30 lis: WRO 11:00 → BCN 13:00 · szac."
              - generic [ref=e61]: Bez przesiadek
            - paragraph [ref=e62]:
              - strong [ref=e63]: Powrót
              - text: "· 3 gru: BCN 11:00 → WRO brak godziny"
              - generic [ref=e64]: "Liczba przesiadek: 1"
            - paragraph [ref=e65]: Godziny lokalne · Przylot szacowany
            - paragraph [ref=e66]: "Wylot: Ryanair (FR) · Powrót: Przewoźnik powrotny do sprawdzenia"
          - paragraph [ref=e67]: Bez noclegu · bagaż do sprawdzenia
          - group [ref=e68]:
            - generic "Pełne dane lotu i bagaż" [ref=e69] [cursor=pointer]
        - region [ref=e70]:
          - heading "Przejście do partnera" [level=2] [ref=e71]
          - generic [ref=e72]: Współpraca partnerska
          - generic [ref=e73]:
            - paragraph [ref=e74]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e75]': ≈ 48 €
              - generic [ref=e76]: za osobę · w obie strony
            - status [ref=e77]:
              - paragraph [ref=e78]: Link do rezerwacji nie jest jeszcze dostępny.
              - link "Wróć do katalogu lotów" [ref=e79] [cursor=pointer]:
                - /url: /deals
          - paragraph [ref=e80]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
      - region [ref=e81]:
        - heading "Znajdź nocleg — Barcelona" [level=2] [ref=e82]
        - paragraph [ref=e83]: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
        - paragraph [ref=e84]: Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.
        - complementary "Miejscowe daty według rozkładu:" [ref=e85]:
          - paragraph [ref=e86]:
            - strong [ref=e87]: "Miejscowe daty według rozkładu:"
            - text: przylot
            - time [ref=e88]: pon., 30 lis 2026
            - text: · wylot powrotny
            - time [ref=e89]: czw., 3 gru 2026
          - paragraph [ref=e90]: Przylot obliczono z czasu lotu. Potwierdź datę i rozkład u partnera.
          - paragraph [ref=e91]: Daty możesz zmienić; sprawdź dojazd i godzinę zameldowania.
        - group [ref=e92]:
          - generic "Jak dobrać daty noclegu do lotu?" [ref=e93] [cursor=pointer]
        - group "Daty pobytu i dorośli" [ref=e94]:
          - generic [ref=e96]:
            - generic [ref=e97]:
              - generic [ref=e98]: Zameldowanie
              - textbox "Zameldowanie" [ref=e99]: 2026-11-30
            - generic [ref=e100]:
              - generic [ref=e101]: Wymeldowanie
              - textbox "Wymeldowanie" [ref=e102]: 2026-12-03
            - generic [ref=e103]:
              - generic [ref=e104]: Dorośli
              - spinbutton "Dorośli" [ref=e105]: "2"
        - paragraph [ref=e106]: Sprawdź ponownie ceny noclegu i lotu dla zmienionego planu. Wpisane kwoty pozostają w budżecie.
        - generic [ref=e107]:
          - paragraph [ref=e108]:
            - strong [ref=e109]: Barcelona
            - text: ": pon., 30 lis 2026 – czw., 3 gru 2026 · 3 noce · dorośli: 2."
          - link "Znajdź nocleg przez Stay22 (nowa karta)" [ref=e110] [cursor=pointer]:
            - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-11-30&checkout=2026-12-03&adults=2&campaign=hoptrip_accommodation&lang=pl&currency=PLN
        - paragraph [ref=e111]: Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.
        - paragraph [ref=e112]: Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.
        - group [ref=e113]:
          - generic "Jak dodać cenę noclegu do planu?" [ref=e114] [cursor=pointer]
        - link "Dodaj koszt noclegu do budżetu podróży" [ref=e115] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=e116]:
        - paragraph [ref=e117]: Pomysły na pobyt · Barcelona
        - heading "Muzea i atrakcje" [level=2] [ref=e118]
        - paragraph [ref=e119]: Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.
        - list [ref=e120]:
          - listitem [ref=e121]:
            - generic [ref=e122]: Architektura
            - heading "Casa Batlló — bilet Blue" [level=3] [ref=e123]
            - paragraph [ref=e124]: Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.
            - paragraph [ref=e125]:
              - strong [ref=e126]: "Dla kogo:"
              - text: Dla osób zainteresowanych architekturą Gaudíego i zwiedzaniem z audioprzewodnikiem.
            - paragraph [ref=e127]:
              - strong [ref=e128]: "Czas wizyty:"
              - text: Około 1 godziny dla wariantu Blue; bez dojazdu i oczekiwania na wejście.
            - paragraph [ref=e129]: Wariant Blue nie obejmuje tarasu na dachu, tabletu VR ani wejścia bez kolejki. Sprawdź godzinę wejścia i język audioprzewodnika.
            - generic [ref=e130]:
              - paragraph [ref=e131]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=e132]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Casa Batlló — bilet Blue (nowa karta)" [ref=e133] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Sprawdź daty i cenę
              - paragraph [ref=e134]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=e135] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=e136]:
            - generic [ref=e137]: Akwarium
            - heading "Aquarium Barcelona — bilet wstępu" [level=3] [ref=e138]
            - paragraph [ref=e139]: "Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą."
            - paragraph [ref=e140]:
              - strong [ref=e141]: "Dla kogo:"
              - text: Dla rodzin i osób ciekawych morskiej przyrody; propozycja zwiedzania pod dachem.
            - paragraph [ref=e142]:
              - strong [ref=e143]: "Czas wizyty:"
              - text: Orientacyjnie 1,5–2 godziny na zwiedzanie; bez dojazdu i kolejki.
            - paragraph [ref=e144]: Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.
            - generic [ref=e145]:
              - paragraph [ref=e146]: Cena do sprawdzenia w Tiqets
              - paragraph [ref=e147]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
              - 'link "Sprawdź daty i cenę w Tiqets: Aquarium Barcelona — bilet wstępu (nowa karta)" [ref=e148] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Sprawdź daty i cenę
              - paragraph [ref=e149]:
                - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=e150] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=e151]:
            - generic [ref=e152]: Przyroda · bezpłatny wstęp
            - heading "Hivernacle — oranżeria w parku Ciutadella" [level=3] [ref=e153]
            - paragraph [ref=e154]: Zabytkowa oranżeria z kolekcjami roślin w parku Ciutadella.
            - paragraph [ref=e155]:
              - strong [ref=e156]: "Dla kogo:"
              - text: Dla miłośników roślin i spokojnego spaceru wśród zieleni.
            - paragraph [ref=e157]: Bezpłatny wstęp dotyczy samodzielnej wizyty. Sprawdź godziny i zamknięcia; wycieczki z przewodnikiem mają osobne zasady i rezerwacje.
            - generic [ref=e158]:
              - paragraph [ref=e159]: "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony."
              - 'link "Sprawdź zasady wizyty: Hivernacle — oranżeria w parku Ciutadella (nowa karta)" [ref=e160] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Sprawdź zasady wizyty
        - paragraph [ref=e161]: Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu, ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.
        - paragraph [ref=e162]: Opisy i zasady sprawdzono pon., 12 paź 2026. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.
        - paragraph [ref=e163]: W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.
        - link "Uwzględnij atrakcje w budżecie" [ref=e164] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=e165]:
        - generic [ref=e166]:
          - generic [ref=e167]:
            - heading "Wydarzenia w terminie podróży" [level=2] [ref=e168]
            - paragraph [ref=e169]: Koncerty, sport i kultura w mieście docelowym. Bilety na wydarzenia kupujesz osobno.
          - generic [ref=e170]: Ticketmaster
        - paragraph [ref=e171]:
          - generic [ref=e172]: Twój pobyt · Barcelona
          - strong [ref=e173]: 30 lis 2026 – 3 gru 2026
        - generic [ref=e174]:
          - strong [ref=e175]: Daty podróży
          - button "Inne daty" [ref=e176] [cursor=pointer]
        - paragraph [ref=e177]: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
        - generic [ref=e178]:
          - generic [ref=e179]:
            - text: Od
            - textbox "Od" [ref=e180]: 2026-11-30
          - generic [ref=e181]:
            - text: Do
            - textbox "Do" [ref=e182]: 2026-12-03
          - generic [ref=e183]:
            - text: Kategoria
            - combobox "Kategoria" [ref=e184]:
              - option "Wszystkie" [selected]
              - option "Muzyka"
              - option "Sport"
              - option "Kultura"
              - option "Inne"
          - button "Pokaż wydarzenia" [ref=e185] [cursor=pointer]
        - generic [ref=e186]:
          - generic [ref=e187]:
            - text: Przeglądaj dni
            - combobox "Przeglądaj dni" [ref=e188]:
              - option "Wszystkie dni" [selected]
              - option "pon., 30 lis"
              - option "wt., 1 gru"
              - option "śr., 2 gru"
              - option "czw., 3 gru"
          - button "Poprzedni dzień" [disabled] [ref=e189]: ←
          - button "Następny dzień" [ref=e190] [cursor=pointer]: →
        - status [ref=e191]:
          - paragraph [ref=e192]:
            - text: "Wyświetlane wydarzenia:"
            - strong [ref=e193]: 1–1 z 1
            - text: · Wszystkie dni · Czas lokalny
        - group [ref=e194]:
          - generic "Zgodność z rozkładem lotu" [ref=e195] [cursor=pointer]
        - list [ref=e196]:
          - listitem [ref=e197]:
            - generic [ref=e198]:
              - generic [ref=e199]: Muzyka
              - generic [aria-hidden] [ref=e200]: 30 lis
            - heading "TRIP-04 synthetic concert" [level=3] [ref=e201]
            - paragraph [ref=e202]: Synthetic venue · Barcelona
            - paragraph [ref=e203]:
              - time [ref=e204]: 30 lis 2026
              - text: · 20:00
            - paragraph [ref=e205]: "Strefa czasu wydarzenia: Europe/Madrid"
            - paragraph [ref=e206]: "W źródle: w sprzedaży — dostępność do sprawdzenia"
            - note "Zgodność z rozkładem lotu" [ref=e207]:
              - paragraph [ref=e208]:
                - strong [ref=e209]: Zgodność z lotem nie została sprawdzona
              - paragraph [ref=e210]: Czas trwania nieznany.
            - paragraph [ref=e211]: Cena do sprawdzenia u sprzedawcy
            - 'link "Sprawdź daty i cenę: TRIP-04 synthetic concert. Otwiera się w nowej karcie" [ref=e212] [cursor=pointer]':
              - /url: https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fconcert
              - text: Sprawdź daty i cenę
              - generic [aria-hidden] [ref=e213]: ↗
            - generic [ref=e214]:
              - 'button "W planie: TRIP-04 synthetic concert" [disabled] [ref=e215] [cursor=pointer]': W planie
              - status [ref=e216]:
                - link "Edytuj bilety w planie" [ref=e217] [cursor=pointer]:
                  - /url: "#planned-events"
        - paragraph [ref=e218]: "Źródło: Ticketmaster · Czas sprawdzenia nieznany"
        - paragraph [ref=e219]: Dane katalogu, nie dostępność na żywo. Status sprzedaży i cena od nie gwarantują wolnych biletów; potwierdź je u sprzedawcy. Nieaktywnej lub nieznanej sprzedaży nie dodajemy z listy do planu.
        - group [ref=e220]:
          - generic "Przed rezerwacją" [ref=e221] [cursor=pointer]
        - paragraph [ref=e222]: "Linki partnerskie: HopTrip może otrzymać prowizję od zakupu. Dostępność biletów i zasady wstępu potwierdź u sprzedawcy."
      - navigation "Zaplanuj pobyt" [ref=e223]:
        - heading "Zaplanuj pobyt" [level=2] [ref=e224]
        - list [ref=e225]:
          - listitem [ref=e226]:
            - 'link "Barcelona: BCN, Girona czy Reus" [ref=e227] [cursor=pointer]':
              - /url: /info/barcelona-airports
          - listitem [ref=e228]:
            - 'link "Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu" [ref=e229] [cursor=pointer]':
              - /url: /info/barcelona-3-days
      - region [ref=e230]:
        - heading "Kalkulator budżetu podróży" [level=2] [ref=e231]
        - paragraph [ref=e232]: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
        - paragraph [ref=e233]: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
        - group "Tryb kalkulatora" [ref=e234]:
          - button "Szybki budżet" [pressed] [ref=e235] [cursor=pointer]
          - button "Szczegółowy budżet" [ref=e236] [cursor=pointer]
        - paragraph [ref=e237]: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
        - group [ref=e238]:
          - generic "Jak liczymy koszty?" [ref=e239] [cursor=pointer]
        - paragraph [ref=e240]: Szkic zapisany w tej przeglądarce. Odświeżenie strony go nie usuwa.
        - group "Twój plan podróży" [ref=e241]:
          - generic [ref=e243]:
            - generic [ref=e244]:
              - generic [ref=e245]: Początek pobytu (opcjonalnie)
              - textbox "Początek pobytu (opcjonalnie)" [ref=e246]: 2026-11-30
            - generic [ref=e247]:
              - generic [ref=e248]: Koniec pobytu (opcjonalnie)
              - textbox "Koniec pobytu (opcjonalnie)" [ref=e249]: 2026-12-03
          - paragraph [ref=e250]: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
          - generic [ref=e251]:
            - generic [ref=e252]:
              - generic [ref=e253]: Liczba dorosłych
              - generic [ref=e254]: Od 1 do 50 osób
              - textbox "Liczba dorosłych" [ref=e255]: "2"
            - generic [ref=e256]:
              - generic [ref=e257]: Liczba nocy
              - generic [ref=e258]: Od 0 do 365 nocy
              - textbox "Liczba nocy" [ref=e259]: "3"
            - generic [ref=e260]:
              - generic [ref=e261]: Liczba dni wydatków
              - generic [ref=e262]: Od 1 do 365 dni, także dni przylotu i odlotu
              - textbox "Liczba dni wydatków" [ref=e263]: "4"
          - paragraph [ref=e264]:
            - generic [ref=e265]:
              - checkbox "Wszyscy podróżni są dorośli" [checked] [ref=e266]
              - text: Wszyscy podróżni są dorośli
          - generic [ref=e267]:
            - paragraph [ref=e268]: Zmieniono daty, długość pobytu, liczbę osób lub dane oferty. Sprawdź ponownie loty, nocleg, transfery i pozostałe wpisane kwoty. Przeliczenie sumy nie potwierdza cen u sprzedawców.
            - button "Kwoty sprawdzone dla tego planu" [ref=e269] [cursor=pointer]
          - group [ref=e270]:
            - generic "Sprawdź orientacyjne koszty na miejscu" [ref=e271] [cursor=pointer]
            - 'option "Barcelona: T-casual, 10 przejazdów, 1 strefa — 13,00 EUR" [selected]'
          - heading "Główne koszty" [level=3] [ref=e272]
          - generic [ref=e273]:
            - generic [ref=e274]:
              - generic [ref=e275]: Loty (PLN)
              - generic [ref=e276]: Na osobę, za wszystkie planowane odcinki
              - textbox "Loty (PLN)" [ref=e277]:
                - /placeholder: Nieznane
                - text: "100"
              - generic [ref=e278]: Wpisana kwota — do weryfikacji
            - generic [ref=e279]:
              - generic [ref=e280]: Jak podana jest cena noclegu?
              - combobox "Jak podana jest cena noclegu?" [ref=e281]:
                - option "Za jedną noc — cała grupa" [selected]
                - option "Za cały pobyt — cała grupa"
              - generic [ref=e282]:
                - generic [ref=e283]: Nocleg (PLN)
                - generic [ref=e284]: Za jedną noc dla całej grupy (wszystkie pokoje)
                - textbox "Nocleg (PLN)" [ref=e285]:
                  - /placeholder: Nieznane
                - generic [ref=e286]: Nieznane
              - generic [ref=e287]: Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.
            - generic [ref=e288]:
              - generic [ref=e289]: Dojazdy i transport (PLN)
              - generic [ref=e290]: "Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
              - textbox "Dojazdy i transport (PLN)" [ref=e291]:
                - /placeholder: Nieznane
              - generic [ref=e292]: Nieznane
            - generic [ref=e293]:
              - generic [ref=e294]: Jedzenie i wydatki dzienne (PLN)
              - generic [ref=e295]: Na osobę dziennie
              - textbox "Jedzenie i wydatki dzienne (PLN)" [ref=e296]:
                - /placeholder: Nieznane
              - generic [ref=e297]: Nieznane
          - group [ref=e298]:
            - 'generic "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa" [ref=e299] [cursor=pointer]'
        - region [ref=e300]:
          - heading "Wybrane wydarzenia" [level=3] [ref=e301]
          - paragraph [ref=e302]: To zapisane wybory, nie rezerwacje. Sprawdź termin, zgodność z lotem i warunki biletu u sprzedawcy; zapis nie aktualizuje się automatycznie.
          - paragraph [ref=e303]: Podaj własną cenę jednego biletu w PLN. Liczba biletów jest niezależna od liczby podróżnych. Tych kosztów nie wpisuj ponownie w polu „Atrakcje i bilety wstępu”.
          - list [ref=e304]:
            - listitem [ref=e305]:
              - heading "TRIP-04 synthetic concert" [level=4] [ref=e306]
              - paragraph [ref=e307]: Synthetic venue
              - paragraph [ref=e308]:
                - time [ref=e309]: 30 lis 2026
                - text: · 20:00 · Europe/Madrid
              - group "TRIP-04 synthetic concert" [ref=e310]:
                - generic [ref=e312]:
                  - generic [ref=e313]: Liczba biletów
                  - textbox "Liczba biletów" [ref=e314]: "2"
                - generic [ref=e315]:
                  - generic [ref=e316]: Cena jednego biletu (PLN)
                  - textbox "Cena jednego biletu (PLN)" [active] [ref=e317]:
                    - /placeholder: Cena nieznana
                    - text: 12,34
              - status [ref=e318]: "Koszt biletów: 24,68 zł"
              - generic [ref=e319]:
                - link "Sprawdź bilet u sprzedawcy" [ref=e320] [cursor=pointer]:
                  - /url: https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fconcert
                  - text: Sprawdź bilet u sprzedawcy
                  - generic [aria-hidden] [ref=e321]: ↗
                - 'button "Usuń z planu: TRIP-04 synthetic concert" [ref=e322] [cursor=pointer]': Usuń z planu
        - status [ref=e323]:
          - heading "Szacowany budżet całej grupy (PLN)" [level=3] [ref=e324]
          - paragraph [ref=e325]:
            - text: "Suma znanych kosztów:"
            - strong [ref=e326]: 224,68 zł
          - paragraph [ref=e327]:
            - text: "Na osobę przy równym podziale (w zaokrągleniu):"
            - strong [ref=e328]: 112,34 zł
          - paragraph [ref=e329]: "Budżet niepełny. Do uzupełnienia: Bagaż i dodatki do lotu, Nocleg, Dojazdy i transport, Transport miejski, Jedzenie i wydatki dzienne, Atrakcje i bilety wstępu, Inne koszty i rezerwa, Podatki i opłaty, Rezerwa awaryjna."
        - group [ref=e330]:
          - generic "Rozbicie kosztów całej grupy" [ref=e331] [cursor=pointer]
        - paragraph [ref=e332]: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
        - button "Wyczyść kalkulator" [ref=e333] [cursor=pointer]
        - region "Zapisz i udostępnij wyjazd" [ref=e334]:
          - heading "Zachowaj plan podróży" [level=3] [ref=e335]
          - paragraph [ref=e336]: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
          - paragraph [ref=e337]: Link zawiera również wybrane wydarzenia, ich daty, miejsca, linki do biletów i wpisane koszty. Każdy odbiorca może je zobaczyć.
          - generic [ref=e338]:
            - button "Zapisz wyjazd" [ref=e339] [cursor=pointer]
            - button "Udostępnij" [ref=e340] [cursor=pointer]
            - link "Zapisane wyjazdy" [ref=e341] [cursor=pointer]:
              - /url: /saved
          - paragraph
      - generic [ref=e342]:
        - heading "Cena na tle historii" [level=2] [ref=e344]
        - generic [ref=e345]:
          - generic "Cena na tle historii" [ref=e346]:
            - paragraph [ref=e347]:
              - strong [ref=e348]: Brak wiarygodnego porównania tej ceny z historią.
            - paragraph [ref=e349]: Liczba obserwacji nieznana. Brak wystarczającej, zgodnej bazy porównawczej.
            - group [ref=e350]:
              - generic "Zakres i wiarygodność porównania" [ref=e351]
            - paragraph [ref=e352]:
              - text: "Czas zapisanej obserwacji:"
              - time [ref=e353]: sob., 31 paź 2026, 22:39
              - text: (czas w Polsce). Źródło czasu nieznane.
            - paragraph [ref=e354]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
          - paragraph [ref=e355]: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
          - paragraph [ref=e356]: Dla tej starszej oceny nie zapisano pełnego, zgodnego zestawu składników. Nie możemy rzetelnie odtworzyć punktów. Wyjaśnienie pojawi się po ponownym przeliczeniu oferty.
          - group [ref=e357]:
            - generic "Co porównujemy, a czego nie uwzględniamy?" [ref=e358] [cursor=pointer]
          - link "Pełna metodologia porównania cen →" [ref=e359] [cursor=pointer]:
            - /url: /info/price-comparison
  - contentinfo [ref=e360]:
    - generic [ref=e361]:
      - generic [ref=e362]: HopTrip.
      - paragraph [ref=e363]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e364]:
      - link "Jak działa HopTrip" [ref=e365] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e366] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e367] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e368] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e369] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e370] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e371] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e372] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e373] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e374] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e375] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e377] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e383] [cursor=pointer]
  - alert [ref=e387]
```

# Test source

```ts
  1   | import {test,expect} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {eventCopy} from '../src/lib/i18n/event-copy';
  4   | import {eventContextCopy} from '../src/lib/i18n/event-context-copy';
  5   | import {plannedEventsCopy} from '../src/lib/i18n/planned-events-copy';
  6   | 
  7   | test.setTimeout(60000);
  8   | const ticket=(id:string)=>`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2F${id}`;
  9   | test.beforeEach(async({page})=>{
  10  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  11  | });
  12  | 
  13  | for(const locale of ['pl','en','ru','uk'] as const)test(`event context and OTHER filter preserve the plan in ${locale}`,async({page},testInfo)=>{
  14  |  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  15  |  const calls:URLSearchParams[]=[];
  16  |  const t=eventCopy[locale],copy=eventContextCopy[locale],plan=plannedEventsCopy[locale];
  17  |  await page.route('**/api/v1/deals/*/events?**',route=>{
  18  |   const params=new URL(route.request().url()).searchParams;calls.push(params);
  19  |   const other=params.get('category')==='OTHER';
  20  |   return route.fulfill({json:{status:'READY',partial:false,checked_at:null,total:1,has_more:false,
  21  |    events:[{id:other?'other':'concert',name:other?'TRIP-04 other event':'TRIP-04 synthetic concert',
  22  |     category:other?'OTHER':'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:params.get('start_date'),end_date:null,
  23  |     local_time:other?null:'20:00:00',timezone:'Europe/Madrid',status:'onsale',price_from:null,currency:null,
  24  |     url:ticket(other?'other':'concert')}],
  25  |   }});
  26  |  });
  27  |  await page.goto(`${locale==='pl'?'':`/${locale}`}/deals/browser-13`);
  28  |  const events=page.locator('#trip-events');
  29  |  const card=events.locator(':scope > ul > li');
  30  |  await expect(card.getByRole('heading',{name:'TRIP-04 synthetic concert',exact:true})).toBeVisible();
  31  |  await expect(card).toContainText(t.music);
  32  |  await expect(card).toContainText('Synthetic venue');await expect(card).toContainText('20:00');
  33  |  await expect(card).toContainText(`${copy.zone}: Europe/Madrid`);
  34  |  await expect(card).toContainText(copy.sale.onsale);
  35  |  await expect(events).toContainText(t.source);await expect(events).toContainText(copy.unknownCheck);
  36  |  await expect(events).toContainText(copy.availability);
  37  |  await expect(card.locator('img')).toHaveCount(0);
  38  |  await expect(card.locator('a[href^="https://ticketmaster.evyy.net/"]')).toHaveAttribute('href',ticket('concert'));
  39  |  const start=await page.locator('#budget-start').inputValue(),end=await page.locator('#budget-end').inputValue();
  40  |  await expect(card.locator('time')).toHaveAttribute('datetime',start);
  41  |  await page.locator('#budget-flight').fill('100');await page.locator('#budget-people').fill('2');
  42  |  await card.getByRole('button',{name:`${plan.add}: TRIP-04 synthetic concert`,exact:true}).click();
  43  |  const selected=page.locator('#planned-events');
  44  |  await selected.getByLabel(plan.quantity,{exact:true}).fill('2');
  45  |  await selected.getByLabel(plan.unitPrice,{exact:true}).fill('12,34');
  46  |  await expect(page.getByTestId('budget-total')).toHaveText(/224[,.]68/);
> 47  |  await events.getByLabel(t.category,{exact:true}).selectOption('OTHER');
      |                                                   ^ Error: locator.selectOption: Test timeout of 60000ms exceeded.
  48  |  await expect(card.getByRole('heading',{name:'TRIP-04 other event',exact:true})).toBeVisible();
  49  |  await expect(card).toContainText(t.other);await expect(card).toContainText(t.unknownTime);
  50  |  await expect(card).not.toContainText('20:00');
  51  |  expect(calls.at(-1)?.get('category')).toBe('OTHER');
  52  |  expect(calls.at(-1)?.get('start_date')).toBe(start);expect(calls.at(-1)?.get('end_date')).toBe(end);
  53  |  expect(calls.at(-1)?.get('date_mode')).toBe('stay');expect(calls.at(-1)?.get('page')).toBe('1');
  54  |  await expect(page.locator('#budget-end')).toHaveValue(end);
  55  |  await expect(page.locator('#budget-flight')).toHaveValue('100');
  56  |  await expect(selected.getByRole('heading',{name:'TRIP-04 synthetic concert',exact:true})).toBeVisible();
  57  |  await expect(page.getByTestId('budget-total')).toHaveText(/224[,.]68/);
  58  |  await page.setViewportSize({width:320,height:844});
  59  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  60  |  expect((await new AxeBuilder({page}).include('#trip-events').include('#planned-events').analyze()).violations).toEqual([]);
  61  |  await events.screenshot({path:testInfo.outputPath(`event-context-${locale}-320.png`),scale:'css'});
  62  |  expect(errors).toEqual([]);
  63  | });
  64  | 
  65  | test('inactive and unknown sales have no booking or add action; mixed options keep their own status',async({page,context})=>{
  66  |  await context.route('https://ticketmaster.evyy.net/**',route=>route.fulfill({contentType:'text/html',body:'<title>Local ticket fixture</title><p>Synthetic ticket page</p>'}));
  67  |  await page.route('**/api/v1/deals/*/events?**',route=>{
  68  |   const day=new URL(route.request().url()).searchParams.get('start_date');
  69  |   const base={category:'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:day,end_date:null,
  70  |    local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',price_from:null,currency:null};
  71  |   return route.fulfill({json:{status:'READY',partial:false,checked_at:'invalid',events:[
  72  |    {...base,id:'off',name:'Inactive sale fixture',status:'offsale',url:ticket('off')},
  73  |    {...base,id:'unknown',name:'Unknown sale fixture',status:'unexpected',url:ticket('unknown')},
  74  |    {...base,id:'changed',name:'Rescheduled fixture',status:'rescheduled',url:ticket('changed')},
  75  |    {...base,id:'missing',name:'Missing metadata fixture',venue:'',city:'',timezone:'Invalid/Zone',local_time:null,url:ticket('missing')},
  76  |    {...base,id:'variants',name:'Variant status fixture',url:ticket('variants'),ticket_options:[
  77  |     {id:'standard',name:'Synthetic standard',ticket_kind:'STANDARD',status:'onsale',url:ticket('standard'),price_from:null,currency:null},
  78  |     {id:'premium',name:'Synthetic premium',ticket_kind:'PREMIUM',status:'offsale',url:ticket('premium'),price_from:'120',currency:'EUR'},
  79  |    ]},
  80  |   ]}});
  81  |  });
  82  |  await page.goto('/deals/browser-13');
  83  |  const events=page.locator('#trip-events');
  84  |  const card=(name:string)=>events.locator(':scope > ul > li').filter({has:page.getByRole('heading',{name,exact:true})});
  85  |  for(const [name,label] of [['Inactive sale fixture',eventContextCopy.pl.sale.offsale],['Unknown sale fixture',eventContextCopy.pl.sale.unknown]]){
  86  |   await expect(card(name)).toContainText(label);
  87  |   await expect(card(name).getByRole('link')).toHaveCount(0);
  88  |   await expect(card(name).getByRole('button')).toHaveCount(0);
  89  |  }
  90  |  await expect(card('Rescheduled fixture')).toContainText(eventCopy.pl.rescheduled);
  91  |  await expect(card('Rescheduled fixture').getByRole('link')).toHaveAttribute('href',ticket('changed'));
  92  |  const missing=card('Missing metadata fixture');
  93  |  for(const text of [eventContextCopy.pl.unknownVenue,eventContextCopy.pl.unknownCity,eventContextCopy.pl.unknownZone,eventCopy.pl.unknownTime])await expect(missing).toContainText(text);
  94  |  await expect(missing.getByRole('button',{name:/Dodaj do planu/})).toBeDisabled();
  95  |  await expect(events).toContainText(eventContextCopy.pl.unknownCheck);
  96  |  const variants=card('Variant status fixture');
  97  |  await expect(variants.getByRole('link')).toHaveCount(1);
  98  |  await expect(variants.getByRole('link')).toHaveAttribute('href',ticket('standard'));
  99  |  await expect(variants.getByRole('button',{name:/Dodaj do planu/})).toHaveCount(1);
  100 |  await expect(variants).toContainText(eventContextCopy.pl.sale.offsale);
  101 |  await expect(variants.getByRole('link')).toHaveAttribute('rel','sponsored noopener noreferrer');
  102 |  const popupPromise=context.waitForEvent('page');await variants.getByRole('link').click();
  103 |  const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
  104 |  await expect(popup).toHaveTitle('Local ticket fixture');await popup.close();
  105 |  await page.setViewportSize({width:320,height:844});
  106 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  107 |  expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);
  108 | });
  109 | 
```