# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-system.spec.ts >> shared visual controls, modal and trip focus in pl
- Location: tests\design-system.spec.ts:13:56

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
        - /url: /deals?origin=WRO
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals?origin=WRO
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals?origin=WRO
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals?origin=WRO
  - main [ref=e19]:
    - generic [ref=e20]:
      - paragraph [ref=e21]: Loty z Polski
      - heading "Aktualne okazje" [level=1] [ref=e22]
      - paragraph [ref=e23]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione.
    - region "Wybór ofert" [ref=e24]:
      - form "Filtry ofert" [ref=e25]:
        - group [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: Skąd
            - combobox "Skąd" [ref=e29]: Wrocław — WRO
            - generic [ref=e30]: "Miasto lub kod IATA. Puste pole: dowolne."
          - generic [ref=e31]:
            - generic [ref=e32]: Dokąd
            - combobox "Dokąd" [ref=e33]
            - generic [ref=e34]: "Miasto lub kod IATA. Puste pole: dowolne."
          - generic [ref=e35]:
            - text: Budżet na lot / osobę (PLN)
            - spinbutton "Budżet na lot / osobę (PLN)" [ref=e36]
          - button "Filtruj" [ref=e37] [cursor=pointer]
        - group [ref=e38]:
          - generic "Daty i długość pobytu −" [ref=e39] [cursor=pointer]
          - paragraph [ref=e40]: "Zakres dat wylotu, nie powrotu. Długość pobytu w nocach. Puste pole: bez ograniczenia."
          - generic [ref=e41]:
            - generic [ref=e42]:
              - text: Wylot od
              - textbox "Wylot od" [ref=e43]
            - generic [ref=e44]:
              - text: Wylot do
              - textbox "Wylot do" [ref=e45]
            - generic [ref=e46]:
              - text: Pobyt od (nocy)
              - spinbutton "Pobyt od (nocy)" [ref=e47]
            - generic [ref=e48]:
              - text: Pobyt do (nocy)
              - spinbutton "Pobyt do (nocy)" [ref=e49]
        - generic [ref=e50]:
          - text: Sortuj oferty
          - combobox "Sortuj oferty Zmiana sortowania stosuje też wpisane filtry." [ref=e51]:
            - option "Wynik pomocniczy ↓" [selected]
            - option "Cena/os. (PLN) ↑"
            - option "Data wylotu ↑"
          - generic [ref=e52]: Zmiana sortowania stosuje też wpisane filtry.
        - paragraph [ref=e53]:
          - text: "Zastosowane sortowanie:"
          - strong [ref=e54]: Wynik pomocniczy ↓
          - text: ". Malejąco według zapisanego wyniku złożonego, nie samej różnicy od mediany ani jakości podróży. Remis: wcześniejsza data wylotu, potem stała kolejność."
          - link "Jak działa wynik pomocniczy?" [ref=e55] [cursor=pointer]:
            - /url: /info/price-comparison
        - group "Szybkie filtry" [ref=e56]:
          - button "Na weekend" [ref=e58] [cursor=pointer]
          - button "2–3 noce" [ref=e60] [cursor=pointer]
          - button "Loty do 300 zł" [ref=e62] [cursor=pointer]
        - paragraph [ref=e63]: Skróty zastępują własne pola i od razu stosują formularz. Ponowne kliknięcie usuwa te warunki.
        - group [ref=e64]:
          - generic "Jak działają filtry" [ref=e65] [cursor=pointer]
      - generic [ref=e66]:
        - paragraph [ref=e67]: Zastosowane filtry (1)
        - navigation "Zastosowane filtry" [ref=e68]:
          - 'link "Usuń filtr: Skąd: Wrocław — WRO" [ref=e69] [cursor=pointer]':
            - /url: /deals
            - generic [ref=e70]:
              - text: "Skąd:"
              - strong [ref=e71]: Wrocław — WRO
            - generic [aria-hidden] [ref=e72]: ×
        - link "Wyczyść wszystkie filtry" [ref=e73] [cursor=pointer]:
          - /url: /deals
        - generic [ref=e74]: Reset usuwa filtry. Wybrane sortowanie pozostaje bez zmian.
    - status [ref=e75]:
      - text: "Liczba ofert:"
      - strong [ref=e76]: "14"
      - text: "· Wyświetlane: 1–12"
    - generic [ref=e77]:
      - article [ref=e78]:
        - generic [ref=e80]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 200,25 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e82] [cursor=pointer]':
          - /url: /deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e83]: Wrocław (WRO) →
          - heading [level=2] [ref=e84]:
            - text: Barcelona
            - img "Hiszpania" [ref=e85]
          - paragraph [ref=e86]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e87]:
            - paragraph [ref=e88]:
              - text: 200,25 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e89]': ≈ 46 €
              - generic [ref=e90]: za osobę · w jedną stronę
            - generic [ref=e91]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e92]: →
        - paragraph [ref=e93]:
          - strong [ref=e94]: Cena o 49,75 zł poniżej mediany próby.
          - text: "Obserwacje: 24. Próba kierunku, nie identycznych taryf ani całego rynku."
        - generic [ref=e95]:
          - paragraph [ref=e96]:
            - text: "Pierwszy zapis tej ceny w HopTrip:"
            - time [ref=e97]: 1.11.2026, 07:24
            - text: (czas w Polsce).
          - paragraph [ref=e98]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e99]:
          - note [ref=e100]:
            - strong [ref=e101]: Sprawdź trasę przed wyborem
            - paragraph [ref=e102]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e103]:
            - strong [ref=e104]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e105]: brak godziny
        - paragraph [ref=e106]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e107]:
          - generic "Szczegóły lotu i ceny" [ref=e108] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e109] [cursor=pointer]':
          - /url: /deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e110]: Jak porównujemy cenę? ⓘ
        - dialog [ref=e111]:
          - generic [ref=e112]:
            - generic [ref=e113]:
              - paragraph [ref=e114]: Barcelona · Cena na tle historii
              - heading "Cena na tle historii" [level=2] [ref=e115]
            - button "Zamknij porównanie ceny" [ref=e116] [cursor=pointer]: ✕
          - generic [ref=e117]:
            - generic "Cena na tle historii" [ref=e118]:
              - paragraph [ref=e119]:
                - strong [ref=e120]: Cena o 49,75 zł poniżej mediany próby.
                - text: "Mediana: 250,00 zł."
              - paragraph [ref=e121]: "Liczba obserwacji: 24. Próg porównania: 5; próbka nie obejmuje całego rynku."
              - group [ref=e122]:
                - generic "Zakres i wiarygodność porównania" [ref=e123]
              - paragraph [ref=e124]:
                - text: "Pierwszy zapis tej ceny w HopTrip:"
                - time [ref=e125]: niedz., 1 lis 2026, 07:24
                - text: (czas w Polsce).
              - paragraph [ref=e126]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
            - paragraph [ref=e127]: Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.
            - group [ref=e128]:
              - generic "Jak działa pomocniczy wynik sortowania?" [ref=e129] [cursor=pointer]
            - group [ref=e130]:
              - generic "Co porównujemy, a czego nie uwzględniamy?" [ref=e131] [cursor=pointer]
            - link "Pełna metodologia porównania cen →" [ref=e132] [cursor=pointer]:
              - /url: /info/price-comparison
      - article [ref=e133]:
        - generic [ref=e135]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 201,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e137] [cursor=pointer]':
          - /url: /deals/browser-1?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e138]: Wrocław (WRO) →
          - heading [level=2] [ref=e139]:
            - text: Barcelona
            - img "Hiszpania" [ref=e140]
          - paragraph [ref=e141]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e142]:
            - paragraph [ref=e143]:
              - text: 201,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e144]': ≈ 46 €
              - generic [ref=e145]: za osobę · w jedną stronę
            - generic [ref=e146]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e147]: →
        - paragraph [ref=e148]:
          - strong [ref=e149]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e150]:
          - paragraph [ref=e151]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e152]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e153]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e154]:
          - note [ref=e155]:
            - strong [ref=e156]: Sprawdź trasę przed wyborem
            - paragraph [ref=e157]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e158]:
            - strong [ref=e159]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e160]: brak godziny
        - paragraph [ref=e161]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e162]:
          - generic "Szczegóły lotu i ceny" [ref=e163] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e164] [cursor=pointer]':
          - /url: /deals/browser-1?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e165]: Jak porównujemy cenę? ⓘ
      - article [ref=e166]:
        - generic [ref=e168]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 204,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e170] [cursor=pointer]':
          - /url: /deals/browser-4?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e171]: Wrocław (WRO) →
          - heading [level=2] [ref=e172]:
            - text: Barcelona
            - img "Hiszpania" [ref=e173]
          - paragraph [ref=e174]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e175]:
            - paragraph [ref=e176]:
              - text: 204,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e177]': ≈ 46 €
              - generic [ref=e178]: za osobę · w jedną stronę
            - generic [ref=e179]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e180]: →
        - paragraph [ref=e181]:
          - strong [ref=e182]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e183]:
          - paragraph [ref=e184]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e185]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e186]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e187]:
          - note [ref=e188]:
            - strong [ref=e189]: Sprawdź trasę przed wyborem
            - paragraph [ref=e190]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e191]:
            - strong [ref=e192]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e193]: brak godziny
        - paragraph [ref=e194]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e195]:
          - generic "Szczegóły lotu i ceny" [ref=e196] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e197] [cursor=pointer]':
          - /url: /deals/browser-4?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e198]: Jak porównujemy cenę? ⓘ
      - article [ref=e199]:
        - generic [ref=e201]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 205,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e203] [cursor=pointer]':
          - /url: /deals/browser-5?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e204]: Wrocław (WRO) →
          - heading [level=2] [ref=e205]:
            - text: Barcelona
            - img "Hiszpania" [ref=e206]
          - paragraph [ref=e207]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e208]:
            - paragraph [ref=e209]:
              - text: 205,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e210]': ≈ 47 €
              - generic [ref=e211]: za osobę · w jedną stronę
            - generic [ref=e212]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e213]: →
        - paragraph [ref=e214]:
          - strong [ref=e215]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e216]:
          - paragraph [ref=e217]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e218]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e219]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e220]:
          - note [ref=e221]:
            - strong [ref=e222]: Sprawdź trasę przed wyborem
            - paragraph [ref=e223]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e224]:
            - strong [ref=e225]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e226]: brak godziny
        - paragraph [ref=e227]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e228]:
          - generic "Szczegóły lotu i ceny" [ref=e229] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e230] [cursor=pointer]':
          - /url: /deals/browser-5?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e231]: Jak porównujemy cenę? ⓘ
      - article [ref=e232]:
        - generic [ref=e234]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 206,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e236] [cursor=pointer]':
          - /url: /deals/browser-6?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e237]: Wrocław (WRO) →
          - heading [level=2] [ref=e238]:
            - text: Barcelona
            - img "Hiszpania" [ref=e239]
          - paragraph [ref=e240]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e241]:
            - paragraph [ref=e242]:
              - text: 206,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e243]': ≈ 47 €
              - generic [ref=e244]: za osobę · w jedną stronę
            - generic [ref=e245]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e246]: →
        - paragraph [ref=e247]:
          - strong [ref=e248]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e249]:
          - paragraph [ref=e250]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e251]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e252]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e253]:
          - note [ref=e254]:
            - strong [ref=e255]: Sprawdź trasę przed wyborem
            - paragraph [ref=e256]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e257]:
            - strong [ref=e258]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e259]: brak godziny
        - paragraph [ref=e260]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e261]:
          - generic "Szczegóły lotu i ceny" [ref=e262] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e263] [cursor=pointer]':
          - /url: /deals/browser-6?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e264]: Jak porównujemy cenę? ⓘ
      - article [ref=e265]:
        - generic [ref=e267]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 207,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e269] [cursor=pointer]':
          - /url: /deals/browser-7?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e270]: Wrocław (WRO) →
          - heading [level=2] [ref=e271]:
            - text: Barcelona
            - img "Hiszpania" [ref=e272]
          - paragraph [ref=e273]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e274]:
            - paragraph [ref=e275]:
              - text: 207,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e276]': ≈ 47 €
              - generic [ref=e277]: za osobę · w jedną stronę
            - generic [ref=e278]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e279]: →
        - paragraph [ref=e280]:
          - strong [ref=e281]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e282]:
          - paragraph [ref=e283]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e284]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e285]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e286]:
          - note [ref=e287]:
            - strong [ref=e288]: Sprawdź trasę przed wyborem
            - paragraph [ref=e289]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e290]:
            - strong [ref=e291]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e292]: brak godziny
        - paragraph [ref=e293]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e294]:
          - generic "Szczegóły lotu i ceny" [ref=e295] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e296] [cursor=pointer]':
          - /url: /deals/browser-7?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e297]: Jak porównujemy cenę? ⓘ
      - article [ref=e298]:
        - generic [ref=e300]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 208,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e302] [cursor=pointer]':
          - /url: /deals/browser-8?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e303]: Wrocław (WRO) →
          - heading [level=2] [ref=e304]:
            - text: Barcelona
            - img "Hiszpania" [ref=e305]
          - paragraph [ref=e306]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e307]:
            - paragraph [ref=e308]:
              - text: 208,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e309]': ≈ 47 €
              - generic [ref=e310]: za osobę · w jedną stronę
            - generic [ref=e311]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e312]: →
        - paragraph [ref=e313]:
          - strong [ref=e314]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e315]:
          - paragraph [ref=e316]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e317]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e318]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e319]:
          - note [ref=e320]:
            - strong [ref=e321]: Sprawdź trasę przed wyborem
            - paragraph [ref=e322]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e323]:
            - strong [ref=e324]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e325]: brak godziny
        - paragraph [ref=e326]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e327]:
          - generic "Szczegóły lotu i ceny" [ref=e328] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e329] [cursor=pointer]':
          - /url: /deals/browser-8?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e330]: Jak porównujemy cenę? ⓘ
      - article [ref=e331]:
        - generic [ref=e333]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 209,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e335] [cursor=pointer]':
          - /url: /deals/browser-9?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e336]: Wrocław (WRO) →
          - heading [level=2] [ref=e337]:
            - text: Barcelona
            - img "Hiszpania" [ref=e338]
          - paragraph [ref=e339]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e340]:
            - paragraph [ref=e341]:
              - text: 209,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e342]': ≈ 48 €
              - generic [ref=e343]: za osobę · w jedną stronę
            - generic [ref=e344]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e345]: →
        - paragraph [ref=e346]:
          - strong [ref=e347]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e348]:
          - paragraph [ref=e349]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e350]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e351]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e352]:
          - note [ref=e353]:
            - strong [ref=e354]: Sprawdź trasę przed wyborem
            - paragraph [ref=e355]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e356]:
            - strong [ref=e357]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e358]: brak godziny
        - paragraph [ref=e359]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e360]:
          - generic "Szczegóły lotu i ceny" [ref=e361] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e362] [cursor=pointer]':
          - /url: /deals/browser-9?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e363]: Jak porównujemy cenę? ⓘ
      - article [ref=e364]:
        - generic [ref=e366]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 210,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e368] [cursor=pointer]':
          - /url: /deals/browser-10?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e369]: Wrocław (WRO) →
          - heading [level=2] [ref=e370]:
            - text: Barcelona
            - img "Hiszpania" [ref=e371]
          - paragraph [ref=e372]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e373]:
            - paragraph [ref=e374]:
              - text: 210,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e375]': ≈ 48 €
              - generic [ref=e376]: za osobę · w jedną stronę
            - generic [ref=e377]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e378]: →
        - paragraph [ref=e379]:
          - strong [ref=e380]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e381]:
          - paragraph [ref=e382]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e383]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e384]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e385]:
          - note [ref=e386]:
            - strong [ref=e387]: Sprawdź trasę przed wyborem
            - paragraph [ref=e388]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e389]:
            - strong [ref=e390]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e391]: brak godziny
        - paragraph [ref=e392]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e393]:
          - generic "Szczegóły lotu i ceny" [ref=e394] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e395] [cursor=pointer]':
          - /url: /deals/browser-10?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e396]: Jak porównujemy cenę? ⓘ
      - article [ref=e397]:
        - generic [ref=e399]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 211,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e401] [cursor=pointer]':
          - /url: /deals/browser-11?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e402]: Wrocław (WRO) →
          - heading [level=2] [ref=e403]:
            - text: Barcelona
            - img "Hiszpania" [ref=e404]
          - paragraph [ref=e405]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e406]:
            - paragraph [ref=e407]:
              - text: 211,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e408]': ≈ 48 €
              - generic [ref=e409]: za osobę · w jedną stronę
            - generic [ref=e410]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e411]: →
        - paragraph [ref=e412]:
          - strong [ref=e413]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e414]:
          - paragraph [ref=e415]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e416]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e417]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e418]:
          - note [ref=e419]:
            - strong [ref=e420]: Sprawdź trasę przed wyborem
            - paragraph [ref=e421]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e422]:
            - strong [ref=e423]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e424]: brak godziny
        - paragraph [ref=e425]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e426]:
          - generic "Szczegóły lotu i ceny" [ref=e427] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e428] [cursor=pointer]':
          - /url: /deals/browser-11?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e429]: Jak porównujemy cenę? ⓘ
      - article [ref=e430]:
        - generic [ref=e432]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 212,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e434] [cursor=pointer]':
          - /url: /deals/browser-12?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e435]: Wrocław (WRO) →
          - heading [level=2] [ref=e436]:
            - text: Barcelona
            - img "Hiszpania" [ref=e437]
          - paragraph [ref=e438]: "Daty oferty: wt., 1 gru 2026"
          - generic [ref=e439]:
            - paragraph [ref=e440]:
              - text: 212,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e441]': ≈ 48 €
              - generic [ref=e442]: za osobę · w jedną stronę
            - generic [ref=e443]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e444]: →
        - paragraph [ref=e445]:
          - strong [ref=e446]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e447]:
          - paragraph [ref=e448]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e449]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e450]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e451]:
          - note [ref=e452]:
            - strong [ref=e453]: Sprawdź trasę przed wyborem
            - paragraph [ref=e454]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e455]:
            - strong [ref=e456]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e457]: brak godziny
        - paragraph [ref=e458]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e459]:
          - generic "Szczegóły lotu i ceny" [ref=e460] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e461] [cursor=pointer]':
          - /url: /deals/browser-12?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e462]: Jak porównujemy cenę? ⓘ
      - article [ref=e463]:
        - generic [ref=e465]: W obie strony
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: wt., 1 gru 2026 – pt., 4 gru 2026 3 noce 213,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony Zobacz szczegóły lotu" [ref=e467] [cursor=pointer]':
          - /url: /deals/browser-13?returnTo=%2Fdeals%3Forigin%3DWRO
          - paragraph [ref=e468]: Wrocław (WRO) →
          - heading [level=2] [ref=e469]:
            - text: Barcelona
            - img "Hiszpania" [ref=e470]
          - paragraph [ref=e471]: "Daty oferty: wt., 1 gru 2026 – pt., 4 gru 2026"
          - paragraph [ref=e472]: 3 noce
          - generic [ref=e473]:
            - paragraph [ref=e474]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e475]': ≈ 48 €
              - generic [ref=e476]: za osobę · w obie strony
            - generic [ref=e477]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e478]: →
        - paragraph [ref=e479]:
          - strong [ref=e480]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e481]:
          - paragraph [ref=e482]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e483]: 1.11.2026, 10:24
            - text: (czas w Polsce).
          - paragraph [ref=e484]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e485]:
          - note [ref=e486]:
            - strong [ref=e487]: Niepełne dane lotu
          - paragraph [ref=e488]:
            - strong [ref=e489]: Wylot
            - text: · WRO → BCN · Bez przesiadek
          - paragraph [ref=e490]:
            - strong [ref=e491]: Powrót
            - text: "· BCN → WRO · Liczba przesiadek: 1"
          - paragraph [ref=e492]: brak godziny
          - paragraph [ref=e493]: Przylot szacowany
        - paragraph [ref=e494]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e495]:
          - generic "Szczegóły lotu i ceny" [ref=e496] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e497] [cursor=pointer]':
          - /url: /deals/browser-13?returnTo=%2Fdeals%3Forigin%3DWRO#score
          - generic [ref=e498]: Jak porównujemy cenę? ⓘ
    - paragraph [ref=e499]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
    - navigation "Strony ofert" [ref=e500]:
      - link "Następna strona" [ref=e501] [cursor=pointer]:
        - /url: /deals?origin=WRO&offset=12
    - paragraph [ref=e502]:
      - link "Powiadom mnie o pasujących lotach" [ref=e503] [cursor=pointer]:
        - /url: /alerts?origin=WRO
      - text: ·
      - link "Zapisane wyjazdy" [ref=e504] [cursor=pointer]:
        - /url: /saved
  - contentinfo [ref=e505]:
    - generic [ref=e506]:
      - generic [ref=e507]: HopTrip.
      - paragraph [ref=e508]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e509]:
      - link "Jak działa HopTrip" [ref=e510] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e511] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e512] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e513] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e514] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e515] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e516] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e517] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e518] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e519] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e520] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e522] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e528] [cursor=pointer]
  - alert [ref=e532]
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
  16  |  const primary=page.locator('.filters button[type="submit"]');
  17  |  await expect(primary).toBeEnabled();
  18  |  await expect(primary).toHaveCSS('background-color','rgb(36, 92, 64)');
  19  |  await expect(primary).toHaveCSS('color','rgb(255, 255, 255)');
  20  |  await expect(primary).toHaveCSS('border-radius','10px');
  21  |  expect((await primary.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  22  |  const card=page.locator('.deal-card').first();
  23  |  await expect(card).toHaveCSS('border-radius','16px');
  24  |  const trigger=card.locator('.score-trigger');
  25  |  await trigger.focus();await page.keyboard.press('Enter');
  26  |  const dialog=page.locator('.score-dialog[open]');
  27  |  await expect(dialog).toBeVisible();await expect(dialog).toHaveCSS('border-radius','24px');
  28  |  await expect(dialog.locator('.score-close')).toBeFocused();
  29  |  await page.keyboard.press('Shift+Tab');
> 30  |  expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog[open]'))).toBe(true);
      |                                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  31  |  expect((await new AxeBuilder({page}).include('.score-dialog[open]').analyze()).violations).toEqual([]);
  32  |  if(locale==='pl')await dialog.screenshot({path:info.outputPath('dialog.png'),scale:'css',animations:'disabled'});
  33  |  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  34  |  const departure=new Date();departure.setUTCDate(departure.getUTCDate()+1);
  35  |  await page.locator('.filters input[name="departure_from"]').fill(departure.toISOString().slice(0,10));
  36  |  const submitted=page.waitForResponse(r=>r.request().method()==='POST'&&!!r.request().headers()['next-action']);
  37  |  await primary.click();await submitted;await expect(page).toHaveURL(/departure_from=/);
  38  |  await expect(primary).toBeEnabled();
  39  |  await page.goto(localizedHref('/deals/browser-deal',locale));
  40  |  await expect(page.locator('#budget-start')).toBeEnabled();
  41  |  const day=await page.locator('#budget-start').inputValue();
  42  |  const end=new Date(`${day}T12:00:00Z`);end.setUTCDate(end.getUTCDate()+2);
  43  |  await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
  44  |  for(const selector of ['#stay-checkin','#budget-flight','#budget-hotel-basis']){
  45  |   const field=page.locator(selector);
  46  |   await expect(field).toHaveCSS('border-radius','10px');await expect(field).toHaveCSS('border-top-color','rgb(117, 139, 129)');
  47  |   await expect(field).toHaveCSS('background-color','rgb(252, 253, 251)');
  48  |   expect((await field.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  49  |  }
  50  |  const secondary=page.locator('#calculator .modes button[aria-pressed="false"]');
  51  |  await expect(secondary).toHaveCSS('background-color','rgb(255, 255, 255)');
  52  |  await expect(secondary).toHaveCSS('color','rgb(36, 92, 64)');
  53  |  await secondary.focus();await expect(secondary).toHaveCSS('outline-width','3px');
  54  |  await page.locator('#budget-flight').fill('-1');
  55  |  await expect(page.locator('#budget-flight')).toHaveCSS('border-top-color','rgb(161, 38, 34)');
  56  |  const disabled=page.locator('#trip-save button').first();await expect(disabled).toBeDisabled();
  57  |  await disabled.hover({force:true});await expect(disabled).toHaveCSS('transform','none');
  58  |  await page.locator('#budget-flight').fill('100');
  59  |  await page.setViewportSize({width:320,height:844});
  60  |  const skip=page.locator('.skip-link');
  61  |  await skip.focus();await expect(skip).toBeInViewport();
  62  |  await page.locator('#budget-flight').focus();await expect(skip).not.toBeInViewport();
  63  |  await expect(skip).toHaveCSS('transform','none');await expect(skip).toHaveCSS('transition-duration','0s');
  64  |  const focus=await page.evaluate(()=>{
  65  |   const skip=document.querySelector('.skip-link')!,field=document.querySelector('#budget-flight')!;
  66  |   return {activeId:document.activeElement?.id,skipRect:skip.getBoundingClientRect().toJSON(),skipTop:getComputedStyle(skip).top,outline:getComputedStyle(field).outline,shadow:getComputedStyle(field).boxShadow};
  67  |  });
  68  |  writeFileSync(info.outputPath(`focus-${locale}.json`),JSON.stringify(focus,null,2));
  69  |  expect((await new AxeBuilder({page}).include('#calculator').include('#accommodation').analyze()).violations).toEqual([]);
  70  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  71  |  if(locale==='pl')await page.locator('#calculator').screenshot({path:info.outputPath('calculator-320.png'),scale:'css',animations:'disabled'});
  72  |  expect(errors).toEqual([]);
  73  | });
  74  | 
  75  | test('empty/error/notice states, reduced motion and forced-colors keep shared cues',async({page},info)=>{
  76  |  await page.goto('/deals?budget=1');
  77  |  const empty=page.locator('.offer-state[data-state="empty"]');
  78  |  await expect(empty).toBeVisible();await expect(empty).toHaveCSS('border-top-style','dashed');
  79  |  // Exercise the shipped loading-line CSS without a public demo route or timed provider call.
  80  |  await empty.evaluate(el=>{const line=document.createElement('div');line.className='loading-line';line.setAttribute('aria-hidden','true');el.append(line);});
  81  |  await page.emulateMedia({reducedMotion:'reduce'});
  82  |  expect(await page.locator('.loading-line').evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  83  |  await page.goto('/deals/unavailable-fixture');
  84  |  const error=page.locator('.offer-state[data-state="error"]');
  85  |  await expect(error).toBeVisible();await expect(error).toHaveCSS('background-color','rgb(255, 241, 237)');
  86  |  await expect(error).toHaveCSS('border-left-color','rgb(161, 38, 34)');
  87  |  const token=encodeTrip({version:1,offer:{slug:'missing-offer',origin:'Warsaw',destination:'Barcelona',start:'2020-01-01',end:'2020-01-03',price:'100',observedAt:''},
  88  |   draft:{version:1,input:{...emptyBudget,flight:'100'},start:'2020-01-01',end:'2020-01-03',context:'',review:true}})!;
  89  |  await page.evaluate(({key,token})=>localStorage.setItem(key,JSON.stringify([token])),{key:savedTripsKey,token});
  90  |  await page.goto('/saved');
  91  |  const saved=page.locator('main > ul > li');await expect(saved).toHaveCSS('border-radius','16px');
  92  |  const warning=saved.locator('p').filter({hasText:'Data zapisanego lotu już minęła.'});
  93  |  await expect(warning).toHaveCSS('color','rgb(109, 67, 14)');await expect(warning).toHaveCSS('background-color','rgb(255, 247, 231)');
  94  |  await page.setViewportSize({width:320,height:844});
  95  |  await page.locator('main h2').focus();await expect(page.locator('.skip-link')).not.toBeInViewport();
  96  |  await page.locator('main').screenshot({path:info.outputPath('saved-focus-320.png'),scale:'css',animations:'disabled'});
  97  |  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  98  |  await page.goto('/deals');await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();
  99  |  await expect(page.locator('.skip-link')).toBeInViewport();await page.keyboard.press('Enter');
  100 |  await expect(page.locator('#content')).toBeFocused();await expect(page.locator('.skip-link')).not.toBeInViewport();
  101 |  await page.emulateMedia({forcedColors:'active'});
  102 |  const select=page.locator('.sort-control select');await select.focus();
  103 |  await expect(select).toHaveCSS('outline-style','solid');await expect(select).toHaveCSS('outline-width','3px');await expect(select).toHaveCSS('box-shadow','none');
  104 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  105 | });
  106 | 
```