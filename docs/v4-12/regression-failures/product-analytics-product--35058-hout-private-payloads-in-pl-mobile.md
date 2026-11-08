# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-analytics.spec.ts >> product taxonomy follows real actions without private payloads in pl
- Location: tests\product-analytics.spec.ts:40:56

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f5e1]:
  - link "Przejdź do treści" [ref=f5e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f5e3]:
    - link "HopTrip — strona główna" [ref=f5e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=f5e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f5e6]: .
    - navigation "Nawigacja główna" [ref=f5e7]:
      - link "Tanie loty" [ref=f5e8] [cursor=pointer]:
        - /url: /deals
      - link "Na weekend" [ref=f5e9] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Kierunki" [ref=f5e10] [cursor=pointer]:
        - /url: /destinations
      - link "Zapisane" [ref=f5e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=f5e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=f5e13]:
      - link "Polski" [ref=f5e14] [cursor=pointer]:
        - /url: /deals/browser-13
      - link "Русский" [ref=f5e15] [cursor=pointer]:
        - /url: /ru/deals/browser-13
      - link "English" [ref=f5e16] [cursor=pointer]:
        - /url: /en/deals/browser-13
      - link "Українська" [ref=f5e17] [cursor=pointer]:
        - /url: /uk/deals/browser-13
  - main [ref=f5e19]:
    - link "← Aktualne okazje" [ref=f5e20] [cursor=pointer]:
      - /url: /deals
    - article [ref=f5e21]:
      - generic [ref=f5e22]:
        - paragraph [ref=f5e23]: W obie strony
        - heading [level=1] [ref=f5e24]:
          - text: Wrocław (WRO) → Barcelona
          - img "Hiszpania" [ref=f5e25]
        - paragraph [ref=f5e26]: "Daty wylotów: wt., 8 gru 2026 – pt., 11 gru 2026"
        - paragraph [ref=f5e27]: "Noce na miejscu: 3 (szac.) planowanego pobytu — daty noclegu sprawdź osobno."
      - navigation "Sekcje planu podróży" [ref=f5e28]:
        - link "Lot i rezerwacja" [ref=f5e29] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "Nocleg i atrakcje" [ref=f5e30] [cursor=pointer]:
          - /url: "#trip-stay"
        - link "Budżet całej podróży" [ref=f5e31] [cursor=pointer]:
          - /url: "#calculator"
        - link "Zapisz i udostępnij" [ref=f5e32] [cursor=pointer]:
          - /url: "#trip-save"
      - region "Lot i rezerwacja" [ref=f5e33]:
        - generic [ref=f5e34]:
          - region "Cena lotu" [ref=f5e35]:
            - paragraph [ref=f5e36]: za osobę · PLN
            - paragraph [ref=f5e37]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 6 lis 2026: 1 EUR = 4,3925 PLN. Kurs płatności może się różnić." [ref=f5e38]':
                - generic [aria-hidden] [ref=f5e39]: ≈ 48 €
              - generic [ref=f5e41]: za osobę · w obie strony
            - generic [ref=f5e42]:
              - paragraph [ref=f5e43]:
                - text: "Czas zapisanej obserwacji:"
                - time [ref=f5e44]: niedz., 8 lis 2026, 18:25
                - text: (czas w Polsce).
              - paragraph [ref=f5e45]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
              - group [ref=f5e46]:
                - generic "Pochodzenie i czas wycofania oferty" [ref=f5e47] [cursor=pointer]
            - paragraph [ref=f5e48]:
              - strong [ref=f5e49]: Brak wiarygodnego porównania tej ceny z historią.
            - heading "Szczegóły lotu" [level=2] [ref=f5e50]
            - generic [ref=f5e51]:
              - note [ref=f5e52]:
                - strong [ref=f5e53]: Niepełne dane lotu
                - paragraph [ref=f5e54]: Nie wszystkie godziny podróży są znane.
                - group [ref=f5e55]:
                  - generic "Jakich danych brakuje?" [ref=f5e56]
                - paragraph [ref=f5e57]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
              - paragraph [ref=f5e58]:
                - strong [ref=f5e59]: Wylot
                - text: "· 8 gru: WRO 11:00 → BCN 13:00 · szac."
                - generic [ref=f5e60]: Bez przesiadek
              - paragraph [ref=f5e61]:
                - strong [ref=f5e62]: Powrót
                - text: "· 11 gru: BCN 11:00 → WRO brak godziny"
                - generic [ref=f5e63]: "Liczba przesiadek: 1"
              - paragraph [ref=f5e64]:
                - strong [ref=f5e65]: Dzień i godzina przylotu powrotnego do potwierdzenia.
              - paragraph [ref=f5e66]: "Wpływ na urlop: do potwierdzenia"
              - paragraph [ref=f5e67]: "Indeks wygody podróży (model): 17/100 · niepełne dane"
              - generic [ref=f5e69]:
                - paragraph [ref=f5e70]:
                  - strong [ref=f5e71]: Przesiadka w drodze powrotnej
                - list [ref=f5e72]:
                  - listitem [ref=f5e73]: Brak potwierdzonych szczegółów przesiadek. Sprawdź czas, lotniska i warunki transferu u partnera.
              - paragraph [ref=f5e74]: "Między przylotem a odlotem: 70 godz. 0 min (szacunek) · BCN → BCN. Czas w mieście nieznany."
              - paragraph [ref=f5e75]: Godziny lokalne · Przylot szacowany
              - paragraph [ref=f5e77]: Czas i koszt dojazdu nieznane — sprawdź transport na datę podróży.
              - paragraph [ref=f5e78]: "Wylot: Ryanair (FR) · Powrót: Przewoźnik powrotny do sprawdzenia"
            - paragraph [ref=f5e79]: Cena dotyczy lotu. Nocleg nie jest wliczony. Bagaż do sprawdzenia
            - group [ref=f5e80]:
              - generic "Pełne dane lotu i bagaż" [ref=f5e81] [cursor=pointer]
          - region [ref=f5e82]:
            - heading "Przejście do partnera" [level=2] [ref=f5e83]
            - generic [ref=f5e84]: Współpraca partnerska
            - generic [ref=f5e85]:
              - paragraph [ref=f5e86]:
                - text: 213,00 zł
                - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 6 lis 2026: 1 EUR = 4,3925 PLN. Kurs płatności może się różnić." [ref=f5e87]':
                  - generic [aria-hidden] [ref=f5e88]: ≈ 48 €
                - generic [ref=f5e90]: za osobę · w obie strony
              - status [ref=f5e91]:
                - paragraph [ref=f5e92]: Link do rezerwacji nie jest jeszcze dostępny.
                - link "Wróć do katalogu lotów" [ref=f5e93] [cursor=pointer]:
                  - /url: /deals
            - paragraph [ref=f5e94]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
        - generic [ref=f5e95]:
          - heading "Cena na tle historii" [level=2] [ref=f5e96]
          - generic [ref=f5e97]:
            - group "Cena na tle historii" [ref=f5e98]:
              - paragraph [ref=f5e99]:
                - strong [ref=f5e100]: Brak wiarygodnego porównania tej ceny z historią.
              - paragraph [ref=f5e101]: Liczba obserwacji nieznana. Brak wystarczającej, zgodnej bazy porównawczej.
              - paragraph [ref=f5e102]:
                - text: "Czas zapisanej obserwacji:"
                - time [ref=f5e103]: niedz., 8 lis 2026, 18:25
                - text: (czas w Polsce). Źródło czasu nieznane.
              - paragraph [ref=f5e104]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
            - paragraph [ref=f5e105]: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
            - paragraph [ref=f5e106]: Brakuje pełnych danych zgodnych z wyświetlaną ceną. Nie możemy rzetelnie odtworzyć porównania ani punktów. Potrzebne jest ponowne przeliczenie oferty.
            - link "Pełna metodologia porównania cen →" [ref=f5e107] [cursor=pointer]:
              - /url: /info/price-comparison
      - region [ref=f5e108]:
        - heading "Nocleg i atrakcje" [level=2] [ref=f5e109]
        - region [ref=f5e110]:
          - heading "Znajdź nocleg — Barcelona" [level=2] [ref=f5e111]
          - paragraph [ref=f5e112]: Nocleg rezerwujesz osobno od lotu. Daty i dorośli są wspólne z budżetem; daty lotu pozostają bez zmian.
          - paragraph [ref=f5e113]: Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.
          - complementary "Miejscowe daty według rozkładu:" [ref=f5e114]:
            - paragraph [ref=f5e115]:
              - strong [ref=f5e116]: "Miejscowe daty według rozkładu:"
              - text: przylot
              - time [ref=f5e117]: wt., 8 gru 2026
              - text: · wylot powrotny
              - time [ref=f5e118]: pt., 11 gru 2026
            - paragraph [ref=f5e119]: Przylot obliczono z czasu lotu. Potwierdź datę i rozkład u partnera.
            - paragraph [ref=f5e120]: Daty możesz zmienić; sprawdź dojazd i godzinę zameldowania.
          - group [ref=f5e121]:
            - generic "Jak dobrać daty noclegu do lotu?" [ref=f5e122] [cursor=pointer]
          - group "Daty pobytu i dorośli" [ref=f5e123]:
            - generic [ref=f5e125]:
              - generic [ref=f5e126]:
                - generic [ref=f5e127]: Zameldowanie
                - textbox "Zameldowanie" [ref=f5e128]: 2026-12-08
              - generic [ref=f5e129]:
                - generic [ref=f5e130]: Wymeldowanie
                - textbox "Wymeldowanie" [ref=f5e131]: 2026-12-11
              - generic [ref=f5e132]:
                - generic [ref=f5e133]: Dorośli
                - spinbutton "Dorośli" [ref=f5e134]: "1"
          - generic [ref=f5e135]:
            - paragraph [ref=f5e136]:
              - strong [ref=f5e137]: Barcelona
              - text: ": wt., 8 gru 2026 – pt., 11 gru 2026 · 3 noce · dorośli: 1."
            - link "Znajdź nocleg przez Stay22 (nowa karta)" [ref=f5e138] [cursor=pointer]:
              - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-12-08&checkout=2026-12-11&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
          - paragraph [ref=f5e139]: Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.
          - paragraph [ref=f5e140]: Link afiliacyjny — możemy otrzymać prowizję. Przekazujemy tylko dorosłych; dzieci i ich wiek ustaw u partnera. Sprawdź daty, gości, cenę i warunki anulowania.
          - group [ref=f5e141]:
            - generic "Jak dodać cenę noclegu do planu?" [ref=f5e142] [cursor=pointer]
          - link "Dodaj koszt noclegu do budżetu podróży" [ref=f5e143] [cursor=pointer]:
            - /url: "#budget-hotel-basis"
        - region [ref=f5e144]:
          - paragraph [ref=f5e145]: Pomysły na pobyt · Barcelona
          - heading "Muzea i atrakcje" [level=2] [ref=f5e146]
          - paragraph [ref=f5e147]: Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.
          - list [ref=f5e148]:
            - listitem [ref=f5e149]:
              - generic [ref=f5e150]: Architektura
              - heading "Casa Batlló — bilet Blue" [level=3] [ref=f5e151]
              - paragraph [ref=f5e152]: Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.
              - paragraph [ref=f5e153]:
                - strong [ref=f5e154]: "Dla kogo:"
                - text: Dla osób zainteresowanych architekturą Gaudíego i zwiedzaniem z audioprzewodnikiem.
              - paragraph [ref=f5e155]:
                - strong [ref=f5e156]: "Czas wizyty:"
                - text: Około 1 godziny dla wariantu Blue; bez dojazdu i oczekiwania na wejście.
              - paragraph [ref=f5e157]: Wariant Blue nie obejmuje tarasu na dachu, tabletu VR ani wejścia bez kolejki. Sprawdź godzinę wejścia i język audioprzewodnika.
              - generic [ref=f5e158]:
                - paragraph [ref=f5e159]: Cena do sprawdzenia w Tiqets
                - paragraph [ref=f5e160]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
                - 'link "Sprawdź daty i cenę w Tiqets: Casa Batlló — bilet Blue (nowa karta)" [ref=f5e161] [cursor=pointer]':
                  - /url: https://tiqets.tpx.gr/JikjB3NX
                  - text: Sprawdź daty i cenę
                - paragraph [ref=f5e162]:
                  - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=f5e163] [cursor=pointer]:
                    - /url: https://www.casabatllo.es/en/visit/faqs/
            - listitem [ref=f5e164]:
              - generic [ref=f5e165]: Akwarium
              - heading "Aquarium Barcelona — bilet wstępu" [level=3] [ref=f5e166]
              - paragraph [ref=f5e167]: "Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą."
              - paragraph [ref=f5e168]:
                - strong [ref=f5e169]: "Dla kogo:"
                - text: Dla rodzin i osób ciekawych morskiej przyrody; propozycja zwiedzania pod dachem.
              - paragraph [ref=f5e170]:
                - strong [ref=f5e171]: "Czas wizyty:"
                - text: Orientacyjnie 1,5–2 godziny na zwiedzanie; bez dojazdu i kolejki.
              - paragraph [ref=f5e172]: Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.
              - generic [ref=f5e173]:
                - paragraph [ref=f5e174]: Cena do sprawdzenia w Tiqets
                - paragraph [ref=f5e175]: Link afiliacyjny — możemy otrzymać prowizję za zakup.
                - 'link "Sprawdź daty i cenę w Tiqets: Aquarium Barcelona — bilet wstępu (nowa karta)" [ref=f5e176] [cursor=pointer]':
                  - /url: https://tiqets.tpx.gr/ALlisode
                  - text: Sprawdź daty i cenę
                - paragraph [ref=f5e177]:
                  - link "Źródło informacji o czasie wizyty (nowa karta)" [ref=f5e178] [cursor=pointer]:
                    - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
            - listitem [ref=f5e179]:
              - generic [ref=f5e180]: Przyroda · bezpłatny wstęp
              - heading "Hivernacle — oranżeria w parku Ciutadella" [level=3] [ref=f5e181]
              - paragraph [ref=f5e182]: Zabytkowa oranżeria z kolekcjami roślin w parku Ciutadella.
              - paragraph [ref=f5e183]:
                - strong [ref=f5e184]: "Dla kogo:"
                - text: Dla miłośników roślin i spokojnego spaceru wśród zieleni.
              - paragraph [ref=f5e185]: Bezpłatny wstęp dotyczy samodzielnej wizyty. Sprawdź godziny i zamknięcia; wycieczki z przewodnikiem mają osobne zasady i rezerwacje.
              - generic [ref=f5e186]:
                - paragraph [ref=f5e187]: "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony."
                - 'link "Sprawdź zasady wizyty: Hivernacle — oranżeria w parku Ciutadella (nowa karta)" [ref=f5e188] [cursor=pointer]':
                  - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                  - text: Sprawdź zasady wizyty
          - paragraph [ref=f5e189]: Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu, ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.
          - paragraph [ref=f5e190]: Zmiany dat i składu grupy w planie nie są automatycznie przekazywane w tym linku. Sprawdź termin, uczestników i cenę u partnera.
          - paragraph [ref=f5e191]: Opisy i zasady sprawdzono pon., 12 paź 2026. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.
          - paragraph [ref=f5e192]: W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.
          - link "Uwzględnij atrakcje w budżecie" [ref=f5e193] [cursor=pointer]:
            - /url: "#calculator"
        - region [ref=f5e194]:
          - generic [ref=f5e195]:
            - generic [ref=f5e196]:
              - heading "Wydarzenia w terminie podróży" [level=2] [ref=f5e197]
              - paragraph [ref=f5e198]: Koncerty, sport i kultura w mieście docelowym. Bilety na wydarzenia kupujesz osobno.
            - generic [ref=f5e199]: Ticketmaster
          - paragraph [ref=f5e200]:
            - generic [ref=f5e201]: Twój pobyt · Barcelona
            - strong [ref=f5e202]: 8 gru 2026 – 11 gru 2026
          - generic [ref=f5e203]:
            - strong [ref=f5e204]: Daty podróży
            - button "Inne daty" [ref=f5e205] [cursor=pointer]
          - paragraph [ref=f5e206]: Daty są wspólne z noclegiem i budżetem. Zmiany automatycznie odświeżają wydarzenia. To daty planu — sprawdź ich zgodność z rozkładem lotu.
          - generic [ref=f5e207]:
            - generic [ref=f5e208]:
              - text: Od
              - textbox "Od" [ref=f5e209]: 2026-12-08
            - generic [ref=f5e210]:
              - text: Do
              - textbox "Do" [ref=f5e211]: 2026-12-11
            - generic [ref=f5e212]:
              - text: Kategoria
              - combobox "Kategoria" [ref=f5e213]:
                - option "Wszystkie" [selected]
                - option "Muzyka"
                - option "Sport"
                - option "Kultura"
                - option "Inne"
            - button "Pokaż wydarzenia" [ref=f5e214] [cursor=pointer]
          - generic [ref=f5e216]:
            - text: Zgodność z lotem
            - combobox "Zgodność z lotem" [ref=f5e217]:
              - option "Wszystkie wydarzenia" [selected]
              - option "Może pasować do lotu"
          - paragraph [ref=f5e218]: Ten tryb ukrywa tylko pewne kolizje z lotem. Wydarzenia z małym zapasem lub brakującymi danymi pozostają widoczne. Formalności na lotnisku i dojazd do miejsca wymagają sprawdzenia; udział nie jest gwarantowany.
          - generic [ref=f5e219]:
            - generic [ref=f5e220]:
              - text: Przeglądaj dni
              - combobox "Przeglądaj dni" [ref=f5e221]:
                - option "Wszystkie dni" [selected]
                - option "wt., 8 gru"
                - option "śr., 9 gru"
                - option "czw., 10 gru"
                - option "pt., 11 gru"
            - button "Poprzedni dzień" [disabled] [ref=f5e222]: ←
            - button "Następny dzień" [ref=f5e223] [cursor=pointer]: →
          - status [ref=f5e224]:
            - paragraph [ref=f5e225]:
              - text: "Wyświetlane wydarzenia:"
              - strong [ref=f5e226]: "3"
              - text: · Wszystkie dni · Czas lokalny
          - group [ref=f5e227]:
            - generic "Zgodność z rozkładem lotu" [ref=f5e228] [cursor=pointer]
          - list [ref=f5e229]:
            - listitem [ref=f5e230]:
              - generic [ref=f5e231]:
                - generic [ref=f5e232]: Muzyka
                - generic [aria-hidden] [ref=f5e233]: 8 gru
              - heading "Synthetic concert" [level=3] [ref=f5e234]
              - paragraph [ref=f5e235]: Synthetic venue · Barcelona
              - paragraph [ref=f5e236]:
                - time [ref=f5e237]: 8 gru 2026
                - text: · 20:00
              - paragraph [ref=f5e238]: "Strefa czasu wydarzenia: Europe/Madrid"
              - paragraph [ref=f5e239]: "W źródle: w sprzedaży — dostępność do sprawdzenia"
              - note "Zgodność z rozkładem lotu" [ref=f5e240]:
                - paragraph [ref=f5e241]:
                  - strong [ref=f5e242]: Zgodność z lotem nie została sprawdzona
                - paragraph [ref=f5e243]: Czas trwania nieznany.
              - paragraph [ref=f5e244]: Cena do sprawdzenia u sprzedawcy
              - 'link "Sprawdź daty i cenę: Synthetic concert. Otwiera się w nowej karcie" [active] [ref=f5e245] [cursor=pointer]':
                - /url: https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret
                - text: Sprawdź daty i cenę
                - generic [aria-hidden] [ref=f5e246]: ↗
              - generic [ref=f5e247]:
                - 'button "Dodaj do planu: Synthetic concert" [disabled] [ref=f5e248]': Dodaj do planu
                - paragraph [ref=f5e249]: "Nie można zapisać tego biletu: dane są niepełne lub link wymaga sprawdzenia."
            - listitem [ref=f5e250]:
              - generic [ref=f5e251]:
                - generic [ref=f5e252]: Muzyka
                - generic [aria-hidden] [ref=f5e253]: 8 gru
              - heading "Synthetic variants" [level=3] [ref=f5e254]
              - paragraph [ref=f5e255]: Synthetic venue · Barcelona
              - paragraph [ref=f5e256]:
                - time [ref=f5e257]: 8 gru 2026
                - text: · 20:00
              - paragraph [ref=f5e258]: "Strefa czasu wydarzenia: Europe/Madrid"
              - paragraph [ref=f5e259]: "W źródle: w sprzedaży — dostępność do sprawdzenia"
              - paragraph [ref=f5e260]: Ta sama data i godzina. Ocena lotu uwzględnia wszystkie warianty; sprawdź zakres wybranego biletu.
              - note "Zgodność z rozkładem lotu" [ref=f5e261]:
                - paragraph [ref=f5e262]:
                  - strong [ref=f5e263]: Zgodność z lotem nie została sprawdzona
                - paragraph [ref=f5e264]: Czas trwania nieznany.
              - generic [ref=f5e265]:
                - heading "Warianty biletów" [level=4] [ref=f5e266]
                - list [ref=f5e267]:
                  - listitem [ref=f5e268]:
                    - paragraph [ref=f5e269]:
                      - strong [ref=f5e270]: Oferta podstawowa
                    - paragraph [ref=f5e271]: Synthetic standard
                    - paragraph [ref=f5e272]: Cena do sprawdzenia u sprzedawcy
                    - 'link "Sprawdź daty i cenę: Synthetic standard (Oferta podstawowa). Otwiera się w nowej karcie" [ref=f5e273] [cursor=pointer]':
                      - /url: https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret
                      - text: Sprawdź daty i cenę
                      - generic [aria-hidden] [ref=f5e274]: ↗
                    - generic [ref=f5e275]:
                      - 'button "Dodaj do planu: Synthetic standard" [disabled] [ref=f5e276]': Dodaj do planu
                      - paragraph [ref=f5e277]: "Nie można zapisać tego biletu: dane są niepełne lub link wymaga sprawdzenia."
            - listitem [ref=f5e278]:
              - generic [ref=f5e279]:
                - generic [ref=f5e280]: Muzyka
                - generic [aria-hidden] [ref=f5e281]: 8 gru
              - heading "Synthetic cancelled" [level=3] [ref=f5e282]
              - paragraph [ref=f5e283]: Synthetic venue · Barcelona
              - paragraph [ref=f5e284]:
                - time [ref=f5e285]: 8 gru 2026
                - text: · 20:00
              - paragraph [ref=f5e286]: "Strefa czasu wydarzenia: Europe/Madrid"
              - paragraph [ref=f5e287]: Status sprzedaży nieznany
              - note "Zgodność z rozkładem lotu" [ref=f5e288]:
                - paragraph [ref=f5e289]:
                  - strong [ref=f5e290]: Zgodność z lotem nie została sprawdzona
                - paragraph [ref=f5e291]: Czas trwania nieznany.
              - paragraph [ref=f5e292]: Cena do sprawdzenia u sprzedawcy
          - paragraph [ref=f5e293]: "Źródło: Ticketmaster · Czas sprawdzenia nieznany"
          - paragraph [ref=f5e294]: Dane katalogu, nie dostępność na żywo. Status sprzedaży i cena od nie gwarantują wolnych biletów; potwierdź je u sprzedawcy. Nieaktywnej lub nieznanej sprzedaży nie dodajemy z listy do planu.
          - group [ref=f5e295]:
            - generic "Przed rezerwacją" [ref=f5e296] [cursor=pointer]
          - paragraph [ref=f5e297]: "Linki partnerskie: HopTrip może otrzymać prowizję od zakupu. Dostępność biletów i zasady wstępu potwierdź u sprzedawcy."
          - paragraph [ref=f5e298]: Zmiany dat i składu grupy w planie nie są automatycznie przekazywane w tym linku. Sprawdź termin, uczestników i cenę u partnera.
        - navigation "Zaplanuj pobyt" [ref=f5e299]:
          - heading "Zaplanuj pobyt" [level=2] [ref=f5e300]
          - list [ref=f5e301]:
            - listitem [ref=f5e302]:
              - 'link "Barcelona: BCN, Girona czy Reus" [ref=f5e303] [cursor=pointer]':
                - /url: /info/barcelona-airports
            - listitem [ref=f5e304]:
              - 'link "Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu" [ref=f5e305] [cursor=pointer]':
                - /url: /info/barcelona-3-days
      - region [ref=f5e306]:
        - heading "Kalkulator budżetu podróży" [level=2] [ref=f5e307]
        - paragraph [ref=f5e308]: Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.
        - paragraph [ref=f5e309]: Znana cena lotu jest kopiowana z oferty na osobę i obejmuje tylko jej odcinki. Dodaj brakujący powrót do kwoty lotów, jeśli nie ma go w ofercie; nie licz go drugi raz, gdy jest już zawarty. To zaobserwowana cena, nie potwierdzenie rezerwacji. Pozostałe kwoty to twoje szacunki lub ceny wpisane ręcznie; nie weryfikujemy ich u sprzedawców.
        - group "Tryb kalkulatora" [ref=f5e310]:
          - button "Szybki budżet" [pressed] [ref=f5e311] [cursor=pointer]
          - button "Szczegółowy budżet" [ref=f5e312] [cursor=pointer]
        - paragraph [ref=f5e313]: Oba tryby liczą wszystkie wpisane koszty i wydarzenia. Zmiana trybu zachowuje kwoty. Rozwiń szczegóły, aby uzupełnić brakujące koszty.
        - group [ref=f5e314]:
          - generic "Jak liczymy koszty?" [ref=f5e315] [cursor=pointer]
        - paragraph [ref=f5e316]: Przywrócono zapisany szkic. Kolejne zmiany zapisujemy automatycznie.
        - group "Twój plan podróży" [ref=f5e317]:
          - generic [ref=f5e319]:
            - heading "Zacznij od głównych kosztów" [level=3] [ref=f5e320]
            - paragraph [ref=f5e321]: Uzupełnij podróżnych i długość pobytu, następnie loty, nocleg, jedzenie i dojazdy. Profile i taryfy pomocnicze są niżej.
            - paragraph [ref=f5e322]: "Wpisane główne koszty: 2/4. To jeszcze nie pełny budżet."
            - generic [ref=f5e323]:
              - 'button "Uzupełnij: Jedzenie i wydatki dzienne" [ref=f5e324] [cursor=pointer]'
              - 'button "Uzupełnij: Dojazdy i transport" [ref=f5e325] [cursor=pointer]'
          - generic [ref=f5e326]:
            - generic [ref=f5e327]:
              - generic [ref=f5e328]: Początek pobytu (opcjonalnie)
              - textbox "Początek pobytu (opcjonalnie)" [ref=f5e329]: 2026-12-08
            - generic [ref=f5e330]:
              - generic [ref=f5e331]: Koniec pobytu (opcjonalnie)
              - textbox "Koniec pobytu (opcjonalnie)" [ref=f5e332]: 2026-12-11
          - paragraph [ref=f5e333]: Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.
          - generic [ref=f5e334]:
            - generic [ref=f5e335]:
              - generic [ref=f5e336]: Liczba dorosłych
              - generic [ref=f5e337]: Od 1 do 50 osób
              - textbox "Liczba dorosłych" [ref=f5e338]: "1"
            - generic [ref=f5e339]:
              - generic [ref=f5e340]: Liczba nocy
              - generic [ref=f5e341]: Od 0 do 365 nocy
              - textbox "Liczba nocy" [ref=f5e342]: "3"
            - generic [ref=f5e343]:
              - generic [ref=f5e344]: Liczba dni wydatków
              - generic [ref=f5e345]: Od 1 do 365 dni, także dni przylotu i odlotu
              - textbox "Liczba dni wydatków" [ref=f5e346]: "4"
          - paragraph [ref=f5e347]:
            - generic [ref=f5e348]:
              - checkbox "Wszyscy podróżni są dorośli" [checked] [ref=f5e349]
              - text: Wszyscy podróżni są dorośli
          - heading "Główne koszty" [level=3] [ref=f5e350]
          - generic [ref=f5e351]:
            - generic [ref=f5e352]:
              - generic [ref=f5e353]: Loty (PLN)
              - generic [ref=f5e354]: Na osobę, za wszystkie planowane odcinki
              - textbox "Loty (PLN)" [ref=f5e355]:
                - /placeholder: Nieznane
                - text: "213.00"
              - generic [ref=f5e356]:
                - text: Skopiowana obserwacja ceny lotu — nie cena na żywo
                - group [ref=f5e357]:
                  - generic "Pochodzenie kwoty" [ref=f5e358] [cursor=pointer]
            - generic [ref=f5e359]:
              - generic [ref=f5e360]: Jak podana jest cena noclegu?
              - combobox "Jak podana jest cena noclegu?" [ref=f5e361]:
                - option "Za jedną noc — cała grupa" [selected]
                - option "Za cały pobyt — cała grupa"
              - generic [ref=f5e362]:
                - generic [ref=f5e363]: Nocleg (PLN)
                - generic [ref=f5e364]: Za jedną noc dla całej grupy (wszystkie pokoje)
                - textbox "Nocleg (PLN)" [ref=f5e365]:
                  - /placeholder: Nieznane
                  - text: "200"
                - generic [ref=f5e366]: Własna kwota — do weryfikacji
              - generic [ref=f5e367]: Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.
            - generic [ref=f5e368]:
              - generic [ref=f5e369]: Dojazdy i transport (PLN)
              - generic [ref=f5e370]: "Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno"
              - textbox "Dojazdy i transport (PLN)" [ref=f5e371]:
                - /placeholder: Nieznane
              - generic [ref=f5e372]: Nieznane
            - generic [ref=f5e373]:
              - generic [ref=f5e374]: Jedzenie i wydatki dzienne (PLN)
              - generic [ref=f5e375]: Na osobę dziennie
              - textbox "Jedzenie i wydatki dzienne (PLN)" [ref=f5e376]:
                - /placeholder: Nieznane
              - generic [ref=f5e377]: Nieznane
          - group [ref=f5e378]:
            - 'generic "Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa" [ref=f5e379] [cursor=pointer]'
        - status [ref=f5e380]:
          - heading "Suma znanych kosztów · PLN" [level=3] [ref=f5e381]
          - paragraph [ref=f5e382]:
            - strong [ref=f5e383]: 813,00 zł
          - paragraph [ref=f5e384]:
            - text: "Na osobę przy równym podziale (w zaokrągleniu):"
            - strong [ref=f5e385]: 813,00 zł
          - paragraph [ref=f5e386]: "Budżet niepełny. Do uzupełnienia: Bagaż i dodatki do lotu, Dojazdy i transport, Transport miejski, Jedzenie i wydatki dzienne, Atrakcje i bilety wstępu, Inne koszty i rezerwa, Podatki i opłaty, Rezerwa awaryjna."
        - group "Porównaj osobiste profile" [ref=f5e387]:
          - region [ref=f5e388]:
            - heading "Osobiste profile budżetu" [level=3] [ref=f5e389]
            - paragraph [ref=f5e390]: To twoje założenia w PLN, nie średnie ceny w mieście. Profile nie mają gotowych cen. Uzupełnij zakresy lub skopiuj własne kwoty. Wpisane koszty, także 0, mają pierwszeństwo.
            - group "Osobiste profile budżetu" [ref=f5e391]:
              - button "Oszczędnie" [ref=f5e392] [cursor=pointer]
              - button "Standardowo" [ref=f5e393] [cursor=pointer]
              - button "Komfortowo" [ref=f5e394] [cursor=pointer]
              - button "Bez profilu" [pressed] [ref=f5e395] [cursor=pointer]
          - group [ref=f5e396]:
            - generic "Sprawdź orientacyjne koszty na miejscu" [ref=f5e397] [cursor=pointer]
            - 'option "Barcelona: T-casual, 10 przejazdów, 1 strefa — 13,00 EUR" [selected]'
        - group [ref=f5e398]:
          - generic "Rozbicie kosztów całej grupy" [ref=f5e399] [cursor=pointer]
        - paragraph [ref=f5e400]: To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.
        - button "Wyczyść kalkulator" [ref=f5e401] [cursor=pointer]
      - region "Zapisz i udostępnij wyjazd" [ref=f5e402]:
        - heading "Zachowaj plan podróży" [level=2] [ref=f5e403]
        - paragraph [ref=f5e404]: Zapis tylko w tym profilu przeglądarki na tym urządzeniu. Usunięcie danych witryny usuwa plany. Zachowaj link, aby otworzyć kopię gdzie indziej.
        - paragraph [ref=f5e405]: Zapis otwiera plan z listy. Wybierz „Aktualizuj plan”, aby zachować w nim późniejsze zmiany. Udostępnianie tworzy niezależną kopię.
        - paragraph [ref=f5e406]: Link zawiera trasę, daty, liczbę osób i wpisany budżet. Każdy, kto go otrzyma, może zobaczyć te dane. Jest to kopia planu, nie aktualna oferta sprzedawcy.
        - paragraph [ref=f5e407]: "Nowe linki przechowują plan po # w adresie, poza żądaniem wysyłanym do witryny. Link nie jest szyfrowany: każdy odbiorca może odczytać plan. Przeglądarka i usługa, w której wkleisz link, mogą zachować cały adres."
        - paragraph [ref=f5e408]: Ten plan jest zapisany.
        - generic [ref=f5e409]:
          - button "Zapisz wyjazd" [ref=f5e410] [cursor=pointer]
          - button "Udostępnij" [ref=f5e411] [cursor=pointer]
          - link "Zapisane wyjazdy" [ref=f5e412] [cursor=pointer]:
            - /url: /saved
        - paragraph
  - contentinfo [ref=f5e413]:
    - generic [ref=f5e414]:
      - generic [ref=f5e415]: HopTrip.
      - paragraph [ref=f5e416]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=f5e417]:
      - link "Jak działa HopTrip" [ref=f5e418] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=f5e419] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=f5e420] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=f5e421] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=f5e422] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=f5e423] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=f5e424] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=f5e425] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=f5e426] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=f5e427] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=f5e428] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=f5e430] [cursor=pointer]
  - alert [ref=f5e431]
```

# Test source

```ts
  1   | import {localOutbound} from './local-outbound';
  2   | import {test,expect,type Page,type BrowserContext} from '@playwright/test';
  3   | import {localizedHref} from '../src/lib/i18n/routing';
  4   | import {tripText} from '../src/lib/i18n/trip-copy';
  5   | import {alertText} from '../src/lib/i18n/alert-copy';
  6   | import type {Locale} from '../src/lib/i18n/config';
  7   | import type {AnalyticsEventName} from '../src/lib/analytics-context';
  8   | 
  9   | type Event={event_name:AnalyticsEventName;deal_slug?:string;filter?:{action:string};metadata:Record<string,string>};
  10  | const ticket='https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret';
  11  | async function setup(page:Page,context:BrowserContext,allowed=true){
  12  |  await page.addInitScript(allowed=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:allowed,marketing:false,at:Date.now()}));},allowed);
  13  |  // All external traffic is fulfilled locally, including popup ticket destinations.
  14  |  await context.route('https://**',route=>route.fulfill({body:'Synthetic local destination',contentType:'text/html'}));
  15  |  await page.route('**/api/v1/deals/*/events?**',route=>{
  16  |   const item={id:'private-event-id',name:'Synthetic concert',category:'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:ticket,price_from:null,currency:null};
  17  |   return route.fulfill({json:{status:'READY',events:[item,{...item,id:'variant-fixture',name:'Synthetic variants',ticket_options:[{id:'private-option',name:'Synthetic standard',ticket_kind:'STANDARD',url:ticket,price_from:null,currency:null}]},{...item,id:'cancelled-fixture',name:'Synthetic cancelled',status:'cancelled'}],partial:false,checked_at:null}});
  18  |  });
  19  |  const events:Event[]=[],statuses:{name:AnalyticsEventName;status:number}[]=[],externalTrackers:string[]=[];
  20  |  page.on('request',request=>{
  21  |   if(request.url().endsWith('/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());
  22  |   if(/emrld\.ltd|api\.telegram\.org/.test(request.url()))externalTrackers.push(request.url());
  23  |  });
  24  |  page.on('response',response=>{if(response.url().endsWith('/analytics/events')&&response.request().method()==='POST')statuses.push({name:response.request().postDataJSON().event_name,status:response.status()});});
  25  |  return {events,statuses,externalTrackers};
  26  | }
  27  | const count=(events:Event[],name:AnalyticsEventName)=>events.filter(e=>e.event_name===name).length;
  28  | async function clickTicket(page:Page,variant=false){
  29  |  const card=page.locator('#trip-events li').filter({has:page.getByRole('heading',{level:3,name:variant?'Synthetic variants':'Synthetic concert',exact:true})});
  30  |  const link=card.locator('a[target="_blank"]');
  31  |  await expect(link).toHaveAttribute('rel','sponsored noopener noreferrer');
  32  |  const restore=await localOutbound(link);const opened=page.waitForEvent('popup');await link.click();const popup=await opened;await popup.waitForLoadState();await popup.close();await restore();
  33  | }
  34  | async function signup(page:Page,locale:Locale,email:string){
  35  |  await page.getByLabel('Email',{exact:true}).fill(email);
  36  |  await page.locator('input[name="consent"]').check();
  37  |  await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
  38  | }
  39  | 
  40  | for(const locale of ['pl','en','ru','uk'] as const)test(`product taxonomy follows real actions without private payloads in ${locale}`,async({page,context,request})=>{
  41  |  test.setTimeout(120000);
  42  |  const {events,statuses,externalTrackers}=await setup(page,context);
  43  |  const flush=async()=>{
  44  |   // Navigation can enqueue more events while earlier responses are still in flight.
  45  |   // Sample both counters together instead of freezing the expected request count.
  46  |   // Save opens a new document; its keepalive response may not remain observable.
> 47  |   await expect.poll(()=>events.length>0&&statuses.filter(s=>s.name!=='TRIP_SAVE').length===events.filter(e=>e.event_name!=='TRIP_SAVE').length).toBe(true);
      |                                                                                                                                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  48  |   expect(statuses.every(s=>s.status===202)).toBe(true);
  49  |  };
  50  |  await page.goto(localizedHref('/deals?origin=WRO&budget=300&sort=price',locale));
  51  |  await page.locator('.filter-chip').last().click();
  52  |  await expect.poll(()=>events.some(e=>e.filter?.action==='remove')).toBe(true);
  53  |  await page.locator('.filter-reset').click();
  54  |  await expect.poll(()=>events.some(e=>e.filter?.action==='reset')).toBe(true);
  55  |  await expect(page).toHaveURL(/sort=price/);
  56  |  await page.locator('input[name="budget"]').fill('1');
  57  |  await page.locator('.filters button[type="submit"]').click();
  58  |  await expect.poll(()=>events.some(e=>e.filter?.action==='apply')).toBe(true);
  59  |  await expect.poll(()=>count(events,'SEARCH')).toBe(1);
  60  |  expect(events.filter(e=>e.event_name==='FILTER_USE').map(e=>e.filter?.action)).toEqual(['remove','reset','apply']);
  61  |  await flush();
  62  |  await page.goto(localizedHref('/deals/browser-13',locale));
  63  |  await page.locator('#budget-hotel').fill('200');
  64  |  await expect.poll(()=>count(events,'BUDGET_USE')).toBe(1);
  65  |  const save=page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true});
  66  |  await save.click();await expect(page).toHaveURL(/\/trip#local=/);await expect.poll(()=>count(events,'TRIP_SAVE')).toBe(1);
  67  |  await page.goto(localizedHref('/deals/browser-13',locale));await page.locator('#budget-hotel').fill('200');
  68  |  await save.click();await expect(page).toHaveURL(/\/trip#local=/);expect(count(events,'TRIP_SAVE')).toBe(1);
  69  |  await page.goto(localizedHref('/deals/browser-13',locale));
  70  |  await clickTicket(page);
  71  |  await expect.poll(()=>count(events,'EVENT_CLICK')).toBe(1);
  72  |  expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
  73  |  await expect(page.locator('#trip-events li').filter({has:page.getByRole('heading',{name:'Synthetic cancelled',exact:true})}).locator('a')).toHaveCount(0);
  74  |  await flush();
  75  |  await page.goto(localizedHref('/saved',locale));
  76  |  await page.locator('main ul li button').click();
  77  |  await expect.poll(()=>count(events,'TRIP_REMOVE')).toBe(1);
  78  |  expect(events.find(e=>e.event_name==='TRIP_REMOVE')?.metadata.page_type).toBe('saved');
  79  |  expect(count(events,'TRIP_SAVE')).toBe(1);
  80  |  await flush();
  81  |  await page.goto(localizedHref('/alerts?origin=WRO',locale));
  82  |  await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
  83  |  expect(count(events,'ALERT_STARTED')).toBe(0);
  84  |  const email=`taxonomy-${crypto.randomUUID()}@example.test`;
  85  |  await signup(page,locale,email);
  86  |  await expect(page.getByRole('status')).toContainText(alertText(locale,'Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Prośba o zapis nie oznacza potwierdzonej subskrypcji. Link wysyłamy najwyżej raz na dobę.'));
  87  |  expect(count(events,'ALERT_STARTED')).toBe(1);expect(count(events,'ALERT_CONFIRMED')).toBe(0);
  88  |  await flush();
  89  |  const api=process.env.HOPTRIP_API_URL??'http://127.0.0.1:8100';
  90  |  const response=await request.get(`${api}/__test__/mail?email=${encodeURIComponent(email)}`);expect(response.ok()).toBe(true);
  91  |  const mail=await response.json(),confirm=mail[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0];
  92  |  expect(new URL(confirm).origin).toBe(new URL(page.url()).origin);
  93  |  await page.goto(confirm);
  94  |  await page.getByRole('button',{name:alertText('pl','Potwierdzam zapis'),exact:true}).click();
  95  |  await expect.poll(()=>count(events,'ALERT_CONFIRMED')).toBe(1);
  96  |  await flush();
  97  |  expect(JSON.stringify(events)).not.toMatch(/private|taxonomy-|example\.test|email|token|plan=|Synthetic/);
  98  |  expect(externalTrackers).toEqual([]);
  99  |  // Withdrawal persists over a full navigation, including an explicit signup attempt.
  100 |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
  101 |  await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
  102 |  const before=events.length;
  103 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  104 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','withdrawn@example.test');
  105 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  106 |  expect(events).toHaveLength(before);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
  107 | });
  108 | 
  109 | test('ticket variants emit the same minimal click and failures never block navigation',async({page,context})=>{
  110 |  const {events}=await setup(page,context);
  111 |  await page.route('**/analytics/events',route=>route.abort('failed'));
  112 |  await page.goto('/deals/browser-13');await clickTicket(page,true);
  113 |  expect(count(events,'EVENT_CLICK')).toBe(1);
  114 |  expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
  115 |  expect(JSON.stringify(events)).not.toMatch(/private|Synthetic|ticketmaster/);
  116 | });
  117 | 
  118 | test('denied consent suppresses filter, ticket, save, remove and signup analytics',async({page,context})=>{
  119 |  const {events}=await setup(page,context,false);
  120 |  await page.goto('/deals?budget=300');await page.locator('.filter-reset').click();
  121 |  await page.goto('/deals/browser-13');await clickTicket(page);
  122 |  await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  123 |  await expect(page).toHaveURL(/\/trip#local=/);
  124 |  await page.goto('/saved');await page.locator('main ul li button').click();
  125 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  126 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','denied@example.test');
  127 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  128 |  expect(events).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
  129 | });
  130 | 
  131 | test('failed saved-trip write emits no remove and leaves the plan available',async({page,context})=>{
  132 |  const {events}=await setup(page,context);
  133 |  await page.goto('/deals/browser-13');await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  134 |  await expect(page).toHaveURL(/\/trip#local=/);
  135 |  await page.goto('/saved');await expect(page.locator('main ul li button')).toHaveCount(1);
  136 |  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.includes('saved'))throw Error('Synthetic storage failure');return original.call(this,key,value);};});
  137 |  await page.locator('main ul li button').click();
  138 |  await expect(page.getByRole('status')).toContainText('Nie udało się usunąć planu');
  139 |  expect(count(events,'TRIP_REMOVE')).toBe(0);await expect(page.locator('main ul li button')).toHaveCount(1);
  140 | });
  141 | 
  142 | test('a failed signup counts one start per visit and never reports completion',async({page,context})=>{
  143 |  const {events}=await setup(page,context);
  144 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  145 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','failed@example.test');
  146 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  147 |  await signup(page,'pl','failed@example.test');await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
```