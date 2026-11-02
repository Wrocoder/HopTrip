# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compact-cards.spec.ts >> compact cards preserve clocks, missing facts, keyboard access and long names
- Location: tests\compact-cards.spec.ts:12:5

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 900
Received:   1210.21875
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
        - /url: /#home-destinations
      - link "Zapisane" [ref=e11] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=e12] [cursor=pointer]:
        - /url: /info/trip-budget
    - navigation "Język" [ref=e13]:
      - link "Polski" [ref=e14] [cursor=pointer]:
        - /url: /deals
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals
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
            - combobox "Skąd" [ref=e29]
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
            - option "Ocena oferty — najwyższa" [selected]
            - option "Cena — najniższa"
            - option "Wylot — najbliższy"
          - generic [ref=e52]: Zmiana sortowania stosuje też wpisane filtry.
        - group "Szybkie filtry" [ref=e53]:
          - button "Na weekend" [ref=e55] [cursor=pointer]
          - button "2–3 noce" [ref=e57] [cursor=pointer]
          - button "Loty do 300 zł" [ref=e59] [cursor=pointer]
        - paragraph [ref=e60]: Skróty zastępują własne pola i od razu stosują formularz. Ponowne kliknięcie usuwa te warunki.
        - group [ref=e61]:
          - generic "Jak działają filtry" [ref=e62] [cursor=pointer]
      - generic [ref=e63]:
        - paragraph [ref=e64]: Zastosowane filtry (0)
        - paragraph [ref=e65]: Brak dodatkowych filtrów.
    - status [ref=e66]:
      - text: "Liczba ofert:"
      - strong [ref=e67]: "14"
      - text: "· Wyświetlane: 1–12"
    - generic [ref=e68]:
      - article [ref=e69]:
        - generic [ref=e71]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 200,25 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e73] [cursor=pointer]':
          - /url: /deals/browser-deal
          - paragraph [ref=e74]: Wrocław (WRO) →
          - heading [level=2] [ref=e75]:
            - text: Barcelona
            - img "Hiszpania" [ref=e76]
          - paragraph [ref=e77]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e78]:
            - paragraph [ref=e79]:
              - text: 200,25 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e80]': ≈ 46 €
              - generic [ref=e81]: za osobę · w jedną stronę
            - generic [ref=e82]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e83]: →
        - paragraph [ref=e84]:
          - strong [ref=e85]: Cena o 49,75 zł poniżej mediany próby.
          - text: "Obserwacje: 24. Próba kierunku, nie identycznych taryf ani całego rynku."
        - generic [ref=e86]:
          - paragraph [ref=e87]:
            - text: "Pierwszy zapis tej ceny w HopTrip:"
            - time [ref=e88]: 31.10.2026, 14:16
            - text: (czas w Polsce).
          - paragraph [ref=e89]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e90]:
          - note [ref=e91]:
            - strong [ref=e92]: Sprawdź trasę przed wyborem
            - paragraph [ref=e93]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e94]:
            - strong [ref=e95]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e96]: brak godziny
        - paragraph [ref=e97]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e98]:
          - generic "Szczegóły lotu i ceny" [ref=e99] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e100] [cursor=pointer]':
          - /url: /deals/browser-deal#score
          - generic [ref=e101]: Jak porównujemy cenę? ⓘ
      - article [ref=e102]:
        - generic [ref=e104]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 201,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e106] [cursor=pointer]':
          - /url: /deals/browser-1
          - paragraph [ref=e107]: Wrocław (WRO) →
          - heading [level=2] [ref=e108]:
            - text: Barcelona
            - img "Hiszpania" [ref=e109]
          - paragraph [ref=e110]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e111]:
            - paragraph [ref=e112]:
              - text: 201,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e113]': ≈ 46 €
              - generic [ref=e114]: za osobę · w jedną stronę
            - generic [ref=e115]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e116]: →
        - paragraph [ref=e117]:
          - strong [ref=e118]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e119]:
          - paragraph [ref=e120]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e121]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e122]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e123]:
          - note [ref=e124]:
            - strong [ref=e125]: Sprawdź trasę przed wyborem
            - paragraph [ref=e126]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e127]:
            - strong [ref=e128]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e129]: brak godziny
        - paragraph [ref=e130]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e131]:
          - generic "Szczegóły lotu i ceny" [ref=e132] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e133] [cursor=pointer]':
          - /url: /deals/browser-1#score
          - generic [ref=e134]: Jak porównujemy cenę? ⓘ
      - article [ref=e135]:
        - generic [ref=e137]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 204,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e139] [cursor=pointer]':
          - /url: /deals/browser-4
          - paragraph [ref=e140]: Wrocław (WRO) →
          - heading [level=2] [ref=e141]:
            - text: Barcelona
            - img "Hiszpania" [ref=e142]
          - paragraph [ref=e143]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e144]:
            - paragraph [ref=e145]:
              - text: 204,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e146]': ≈ 46 €
              - generic [ref=e147]: za osobę · w jedną stronę
            - generic [ref=e148]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e149]: →
        - paragraph [ref=e150]:
          - strong [ref=e151]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e152]:
          - paragraph [ref=e153]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e154]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e155]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e156]:
          - note [ref=e157]:
            - strong [ref=e158]: Sprawdź trasę przed wyborem
            - paragraph [ref=e159]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e160]:
            - strong [ref=e161]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e162]: brak godziny
        - paragraph [ref=e163]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e164]:
          - generic "Szczegóły lotu i ceny" [ref=e165] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e166] [cursor=pointer]':
          - /url: /deals/browser-4#score
          - generic [ref=e167]: Jak porównujemy cenę? ⓘ
      - article [ref=e168]:
        - generic [ref=e170]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 205,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e172] [cursor=pointer]':
          - /url: /deals/browser-5
          - paragraph [ref=e173]: Wrocław (WRO) →
          - heading [level=2] [ref=e174]:
            - text: Barcelona
            - img "Hiszpania" [ref=e175]
          - paragraph [ref=e176]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e177]:
            - paragraph [ref=e178]:
              - text: 205,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e179]': ≈ 47 €
              - generic [ref=e180]: za osobę · w jedną stronę
            - generic [ref=e181]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e182]: →
        - paragraph [ref=e183]:
          - strong [ref=e184]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e185]:
          - paragraph [ref=e186]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e187]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e188]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e189]:
          - note [ref=e190]:
            - strong [ref=e191]: Sprawdź trasę przed wyborem
            - paragraph [ref=e192]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e193]:
            - strong [ref=e194]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e195]: brak godziny
        - paragraph [ref=e196]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e197]:
          - generic "Szczegóły lotu i ceny" [ref=e198] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e199] [cursor=pointer]':
          - /url: /deals/browser-5#score
          - generic [ref=e200]: Jak porównujemy cenę? ⓘ
      - article [ref=e201]:
        - generic [ref=e203]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 206,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e205] [cursor=pointer]':
          - /url: /deals/browser-6
          - paragraph [ref=e206]: Wrocław (WRO) →
          - heading [level=2] [ref=e207]:
            - text: Barcelona
            - img "Hiszpania" [ref=e208]
          - paragraph [ref=e209]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e210]:
            - paragraph [ref=e211]:
              - text: 206,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e212]': ≈ 47 €
              - generic [ref=e213]: za osobę · w jedną stronę
            - generic [ref=e214]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e215]: →
        - paragraph [ref=e216]:
          - strong [ref=e217]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e218]:
          - paragraph [ref=e219]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e220]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e221]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e222]:
          - note [ref=e223]:
            - strong [ref=e224]: Sprawdź trasę przed wyborem
            - paragraph [ref=e225]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e226]:
            - strong [ref=e227]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e228]: brak godziny
        - paragraph [ref=e229]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e230]:
          - generic "Szczegóły lotu i ceny" [ref=e231] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e232] [cursor=pointer]':
          - /url: /deals/browser-6#score
          - generic [ref=e233]: Jak porównujemy cenę? ⓘ
      - article [ref=e234]:
        - generic [ref=e236]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 207,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e238] [cursor=pointer]':
          - /url: /deals/browser-7
          - paragraph [ref=e239]: Wrocław (WRO) →
          - heading [level=2] [ref=e240]:
            - text: Barcelona
            - img "Hiszpania" [ref=e241]
          - paragraph [ref=e242]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e243]:
            - paragraph [ref=e244]:
              - text: 207,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e245]': ≈ 47 €
              - generic [ref=e246]: za osobę · w jedną stronę
            - generic [ref=e247]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e248]: →
        - paragraph [ref=e249]:
          - strong [ref=e250]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e251]:
          - paragraph [ref=e252]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e253]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e254]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e255]:
          - note [ref=e256]:
            - strong [ref=e257]: Sprawdź trasę przed wyborem
            - paragraph [ref=e258]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e259]:
            - strong [ref=e260]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e261]: brak godziny
        - paragraph [ref=e262]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e263]:
          - generic "Szczegóły lotu i ceny" [ref=e264] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e265] [cursor=pointer]':
          - /url: /deals/browser-7#score
          - generic [ref=e266]: Jak porównujemy cenę? ⓘ
      - article [ref=e267]:
        - generic [ref=e269]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 208,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e271] [cursor=pointer]':
          - /url: /deals/browser-8
          - paragraph [ref=e272]: Wrocław (WRO) →
          - heading [level=2] [ref=e273]:
            - text: Barcelona
            - img "Hiszpania" [ref=e274]
          - paragraph [ref=e275]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e276]:
            - paragraph [ref=e277]:
              - text: 208,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e278]': ≈ 47 €
              - generic [ref=e279]: za osobę · w jedną stronę
            - generic [ref=e280]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e281]: →
        - paragraph [ref=e282]:
          - strong [ref=e283]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e284]:
          - paragraph [ref=e285]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e286]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e287]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e288]:
          - note [ref=e289]:
            - strong [ref=e290]: Sprawdź trasę przed wyborem
            - paragraph [ref=e291]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e292]:
            - strong [ref=e293]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e294]: brak godziny
        - paragraph [ref=e295]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e296]:
          - generic "Szczegóły lotu i ceny" [ref=e297] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e298] [cursor=pointer]':
          - /url: /deals/browser-8#score
          - generic [ref=e299]: Jak porównujemy cenę? ⓘ
      - article [ref=e300]:
        - generic [ref=e302]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 209,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e304] [cursor=pointer]':
          - /url: /deals/browser-9
          - paragraph [ref=e305]: Wrocław (WRO) →
          - heading [level=2] [ref=e306]:
            - text: Barcelona
            - img "Hiszpania" [ref=e307]
          - paragraph [ref=e308]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e309]:
            - paragraph [ref=e310]:
              - text: 209,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e311]': ≈ 48 €
              - generic [ref=e312]: za osobę · w jedną stronę
            - generic [ref=e313]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e314]: →
        - paragraph [ref=e315]:
          - strong [ref=e316]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e317]:
          - paragraph [ref=e318]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e319]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e320]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e321]:
          - note [ref=e322]:
            - strong [ref=e323]: Sprawdź trasę przed wyborem
            - paragraph [ref=e324]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e325]:
            - strong [ref=e326]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e327]: brak godziny
        - paragraph [ref=e328]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e329]:
          - generic "Szczegóły lotu i ceny" [ref=e330] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e331] [cursor=pointer]':
          - /url: /deals/browser-9#score
          - generic [ref=e332]: Jak porównujemy cenę? ⓘ
      - article [ref=e333]:
        - generic [ref=e335]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 210,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e337] [cursor=pointer]':
          - /url: /deals/browser-10
          - paragraph [ref=e338]: Wrocław (WRO) →
          - heading [level=2] [ref=e339]:
            - text: Barcelona
            - img "Hiszpania" [ref=e340]
          - paragraph [ref=e341]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e342]:
            - paragraph [ref=e343]:
              - text: 210,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e344]': ≈ 48 €
              - generic [ref=e345]: za osobę · w jedną stronę
            - generic [ref=e346]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e347]: →
        - paragraph [ref=e348]:
          - strong [ref=e349]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e350]:
          - paragraph [ref=e351]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e352]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e353]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e354]:
          - note [ref=e355]:
            - strong [ref=e356]: Sprawdź trasę przed wyborem
            - paragraph [ref=e357]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e358]:
            - strong [ref=e359]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e360]: brak godziny
        - paragraph [ref=e361]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e362]:
          - generic "Szczegóły lotu i ceny" [ref=e363] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e364] [cursor=pointer]':
          - /url: /deals/browser-10#score
          - generic [ref=e365]: Jak porównujemy cenę? ⓘ
      - article [ref=e366]:
        - generic [ref=e368]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 211,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e370] [cursor=pointer]':
          - /url: /deals/browser-11
          - paragraph [ref=e371]: Wrocław (WRO) →
          - heading [level=2] [ref=e372]:
            - text: Barcelona
            - img "Hiszpania" [ref=e373]
          - paragraph [ref=e374]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e375]:
            - paragraph [ref=e376]:
              - text: 211,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e377]': ≈ 48 €
              - generic [ref=e378]: za osobę · w jedną stronę
            - generic [ref=e379]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e380]: →
        - paragraph [ref=e381]:
          - strong [ref=e382]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e383]:
          - paragraph [ref=e384]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e385]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e386]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e387]:
          - note [ref=e388]:
            - strong [ref=e389]: Sprawdź trasę przed wyborem
            - paragraph [ref=e390]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e391]:
            - strong [ref=e392]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e393]: brak godziny
        - paragraph [ref=e394]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e395]:
          - generic "Szczegóły lotu i ceny" [ref=e396] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e397] [cursor=pointer]':
          - /url: /deals/browser-11#score
          - generic [ref=e398]: Jak porównujemy cenę? ⓘ
      - article [ref=e399]:
        - generic [ref=e401]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 212,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e403] [cursor=pointer]':
          - /url: /deals/browser-12
          - paragraph [ref=e404]: Wrocław (WRO) →
          - heading [level=2] [ref=e405]:
            - text: Barcelona
            - img "Hiszpania" [ref=e406]
          - paragraph [ref=e407]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e408]:
            - paragraph [ref=e409]:
              - text: 212,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e410]': ≈ 48 €
              - generic [ref=e411]: za osobę · w jedną stronę
            - generic [ref=e412]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e413]: →
        - paragraph [ref=e414]:
          - strong [ref=e415]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e416]:
          - paragraph [ref=e417]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e418]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e419]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e420]:
          - note [ref=e421]:
            - strong [ref=e422]: Sprawdź trasę przed wyborem
            - paragraph [ref=e423]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e424]:
            - strong [ref=e425]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e426]: brak godziny
        - paragraph [ref=e427]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e428]:
          - generic "Szczegóły lotu i ceny" [ref=e429] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e430] [cursor=pointer]':
          - /url: /deals/browser-12#score
          - generic [ref=e431]: Jak porównujemy cenę? ⓘ
      - article [ref=e432]:
        - generic [ref=e434]: W obie strony
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026 3 noce 213,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony Zobacz szczegóły lotu" [ref=e436] [cursor=pointer]':
          - /url: /deals/browser-13
          - paragraph [ref=e437]: Wrocław (WRO) →
          - heading [level=2] [ref=e438]:
            - text: Barcelona
            - img "Hiszpania" [ref=e439]
          - paragraph [ref=e440]: "Daty oferty: pon., 30 lis 2026 – czw., 3 gru 2026"
          - paragraph [ref=e441]: 3 noce
          - generic [ref=e442]:
            - paragraph [ref=e443]:
              - text: 213,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e444]': ≈ 48 €
              - generic [ref=e445]: za osobę · w obie strony
            - generic [ref=e446]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e447]: →
        - paragraph [ref=e448]:
          - strong [ref=e449]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e450]:
          - paragraph [ref=e451]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e452]: 31.10.2026, 17:16
            - text: (czas w Polsce).
          - paragraph [ref=e453]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e454]:
          - note [ref=e455]:
            - strong [ref=e456]: Niepełne dane lotu
          - paragraph [ref=e457]:
            - strong [ref=e458]: Wylot
            - text: · WRO → BCN · Bez przesiadek
          - paragraph [ref=e459]:
            - strong [ref=e460]: Powrót
            - text: "· BCN → WRO · Liczba przesiadek: 1"
          - paragraph [ref=e461]: brak godziny
          - paragraph [ref=e462]: Przylot szacowany
        - paragraph [ref=e463]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e464]:
          - generic "Szczegóły lotu i ceny" [ref=e465] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij porównanie ceny: Barcelona" [ref=e466] [cursor=pointer]':
          - /url: /deals/browser-13#score
          - generic [ref=e467]: Jak porównujemy cenę? ⓘ
    - paragraph [ref=e468]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
    - navigation "Strony ofert" [ref=e469]:
      - link "Następna strona" [ref=e470] [cursor=pointer]:
        - /url: /deals?offset=12
    - paragraph [ref=e471]:
      - link "Powiadom mnie o pasujących lotach" [ref=e472] [cursor=pointer]:
        - /url: /alerts?
      - text: ·
      - link "Zapisane wyjazdy" [ref=e473] [cursor=pointer]:
        - /url: /saved
    - region "Jak wybrać okazję lotniczą" [ref=e474]:
      - heading "Jak wybrać okazję lotniczą" [level=2] [ref=e475]
      - paragraph [ref=e476]: Zacznij od lotniska, z którego wygodnie dojedziesz na wylot. Następnie ustaw budżet na lot na osobę i opcjonalny zakres dat. Długość pobytu filtrujemy w nocach.
      - generic [ref=e477]:
        - heading "Porównuj ten sam zakres podróży" [level=3] [ref=e478]
        - paragraph [ref=e479]: Lot w jedną stronę i lot w obie strony mają różny zakres. Otwórz ofertę i sprawdź oznaczenie trasy, daty oraz potrzebny bagaż. Cena w katalogu nie obejmuje automatycznie noclegu ani dojazdów.
      - generic [ref=e480]:
        - heading "Cena ma datę obserwacji" [level=3] [ref=e481]
        - paragraph [ref=e482]: Oferty pochodzą z zapisanych obserwacji, a nie z rezerwacji w czasie rzeczywistym. W szczegółach znajdziesz datę sprawdzenia i wyjaśnienie oceny. Dostępność oraz końcową cenę potwierdź po przejściu do sprzedawcy.
      - navigation "Zaplanuj podróż" [ref=e483]:
        - link "Loty z Wrocławia" [ref=e484] [cursor=pointer]:
          - /url: /from/WRO
        - link "Loty do Mediolanu" [ref=e485] [cursor=pointer]:
          - /url: /destinations/milan
        - link "Policz budżet całej podróży" [ref=e486] [cursor=pointer]:
          - /url: /info/trip-budget
  - contentinfo [ref=e487]:
    - generic [ref=e488]:
      - generic [ref=e489]: HopTrip.
      - paragraph [ref=e490]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e491]:
      - link "Jak działa HopTrip" [ref=e492] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e493] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e494] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e495] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e496] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e497] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e498] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e499] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e500] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e501] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e502] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e504] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e510] [cursor=pointer]
  - alert [ref=e514]
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | 
  4  | test.beforeEach(async({page,request})=>{
  5  |  await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=normal");
  6  |  await page.addInitScript(()=>localStorage.setItem("hoptrip.consent.v1",JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  7  | });
  8  | test.afterEach(async({request})=>{
  9  |  await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=normal");
  10 | });
  11 | 
  12 | test("compact cards preserve clocks, missing facts, keyboard access and long names",async({page},testInfo)=>{
  13 |  await page.setViewportSize(testInfo.project.name==="desktop" ? {width:1366,height:900} : {width:390,height:844});
  14 |  await page.goto("/deals");
  15 |  await page.evaluate(()=>document.fonts.ready);
  16 |  const first=page.locator(".deal-card").first();
  17 |  if(testInfo.project.name==="desktop") {
  18 |   const price=await first.locator(".deal-price").boundingBox();
> 19 |   expect(price!.y+price!.height).toBeLessThan(900);
     |                                  ^ Error: expect(received).toBeLessThan(expected)
  20 |  }
  21 |  await expect(first.locator(".flight-schedule-compact")).toContainText("brak godziny");
  22 |  await expect(first.locator(".flight-schedule-compact")).not.toContainText("Powrót");
  23 |  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-13"]')});
  24 |  // DEAL-01 keeps route warnings outside; full known clocks/zones are in details.
  25 |  await expect(card.locator(".flight-schedule-compact")).toContainText("Przylot szacowany");
  26 |  await expect(card.locator(".flight-schedule-compact")).not.toContainText(/Europe\/|GMT/);
  27 |  // Two stop summaries now belong to the collapsed card, one for each direction.
  28 |  await expect(card.locator(".flight-stops")).toHaveCount(2);
  29 |  if(testInfo.project.name==="desktop") {
  30 |   // Observation and availability are now always visible; the existing card stays compact.
  31 |   const freshness=await card.locator('.price-freshness').boundingBox();
  32 |   expect(freshness!.height).toBeLessThan(130);
  33 |   expect((await card.boundingBox())!.height).toBeLessThan(730);
  34 |  }
  35 |  await page.screenshot({path:testInfo.outputPath("catalog.png")});
  36 |  await card.screenshot({path:testInfo.outputPath("card.png")});
  37 |  await card.locator(".trip-details > summary").focus();
  38 |  await page.keyboard.press("Enter");
  39 |  await expect(card.locator(".flight-facts")).toBeVisible();
  40 |  await expect(card.locator(".flight-facts")).toContainText("Europe/Warsaw");
  41 |  expect((await new AxeBuilder({page}).include(".deal-grid").analyze()).violations).toEqual([]);
  42 |  await page.keyboard.press("Enter");
  43 |  // Synthetic long content tests wrapping, not a new production destination.
  44 |  await card.locator(".deal-card-link h2").evaluate(el=>{el.textContent="Bardzo długa nazwa kierunku podróży — Santiago de Compostela";});
  45 |  await page.setViewportSize({width:320,height:812});
  46 |  await page.addStyleTag({content:".deal-card {font-size:200%} .deal-card h2 {font-size:2em}"});
  47 |  expect(await card.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  48 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  49 |  await card.screenshot({path:testInfo.outputPath("long-name.png")});
  50 | });
  51 | 
  52 | test("next-day home arrival is visible without expanding details",async({page,request},testInfo)=>{
  53 |  await request.post("http://127.0.0.1:8125/__test__/compact-card?scenario=midnight");
  54 |  await page.goto("/deals");
  55 |  const card=page.locator(".deal-card").filter({has:page.locator('a.deal-card-link[href="/deals/browser-13"]')});
  56 |  await expect(card.locator(".home-arrival")).toBeVisible();
  57 |  await expect(card.locator(".home-arrival")).toContainText("+1 dzień");
  58 |  await expect(card.locator(".trip-details")).not.toHaveAttribute("open","");
  59 |  await expect(card.locator(".flight-schedule-compact")).toContainText("Przylot szacowany");
  60 |  await card.screenshot({path:testInfo.outputPath("midnight.png")});
  61 | });
  62 | 
```