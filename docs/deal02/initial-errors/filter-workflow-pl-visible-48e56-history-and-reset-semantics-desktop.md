# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: filter-workflow.spec.ts >> pl: visible primary filters preserve manual overrides, history and reset semantics
- Location: tests\filter-workflow.spec.ts:17:56

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: Test timeout of 120000ms exceeded.
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
        - /url: /deals?origin=WRO&budget=300&sort=price
      - link "Русский" [ref=e15] [cursor=pointer]:
        - /url: /ru/deals?origin=WRO&budget=300&sort=price
      - link "English" [ref=e16] [cursor=pointer]:
        - /url: /en/deals?origin=WRO&budget=300&sort=price
      - link "Українська" [ref=e17] [cursor=pointer]:
        - /url: /uk/deals?origin=WRO&budget=300&sort=price
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
            - spinbutton "Budżet na lot / osobę (PLN)" [ref=e36]: "300"
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
            - option "Ocena oferty — najwyższa"
            - option "Cena — najniższa" [selected]
            - option "Wylot — najbliższy"
          - generic [ref=e52]: Zmiana sortowania stosuje też wpisane filtry.
        - group "Szybkie filtry" [ref=e53]:
          - button "Na weekend" [ref=e55] [cursor=pointer]
          - button "2–3 noce" [ref=e57] [cursor=pointer]
          - button "Loty do 300 zł" [pressed] [ref=e59] [cursor=pointer]
        - paragraph [ref=e60]: Skróty zastępują własne pola i od razu stosują formularz. Ponowne kliknięcie usuwa te warunki.
        - group [ref=e61]:
          - generic "Jak działają filtry" [ref=e62] [cursor=pointer]
      - generic [ref=e63]:
        - paragraph [ref=e64]: Zastosowane filtry (2)
        - navigation "Zastosowane filtry" [ref=e65]:
          - 'link "Usuń filtr: Skąd: Wrocław — WRO" [ref=e66] [cursor=pointer]':
            - /url: /deals?budget=300&sort=price
            - generic [ref=e67]:
              - text: "Skąd:"
              - strong [ref=e68]: Wrocław — WRO
            - generic [aria-hidden] [ref=e69]: ×
          - 'link "Usuń filtr: Budżet na lot / osobę (PLN): 300,00 zł" [ref=e70] [cursor=pointer]':
            - /url: /deals?origin=WRO&sort=price
            - generic [ref=e71]:
              - text: "Budżet na lot / osobę (PLN):"
              - strong [ref=e72]: 300,00 zł
            - generic [aria-hidden] [ref=e73]: ×
        - link "Wyczyść wszystkie filtry" [ref=e74] [cursor=pointer]:
          - /url: /deals?sort=price
        - generic [ref=e75]: Reset usuwa filtry. Wybrane sortowanie pozostaje bez zmian.
    - status [ref=e76]:
      - text: "Liczba ofert:"
      - strong [ref=e77]: "14"
      - text: "· Wyświetlane: 1–12"
    - generic [ref=e78]:
      - article [ref=e79]:
        - generic [ref=e81]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 200,25 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e83] [cursor=pointer]':
          - /url: /deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e84]: Wrocław (WRO) →
          - heading [level=2] [ref=e85]:
            - text: Barcelona
            - img "Hiszpania" [ref=e86]
          - paragraph [ref=e87]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e88]:
            - paragraph [ref=e89]:
              - text: 200,25 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e90]': ≈ 46 €
              - generic [ref=e91]: za osobę · w jedną stronę
            - generic [ref=e92]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e93]: →
        - paragraph [ref=e94]:
          - strong [ref=e95]: Cena o 49,75 zł poniżej mediany próby.
          - text: Próba kierunku, nie identycznych taryf.
        - generic [ref=e96]:
          - paragraph [ref=e97]:
            - text: "Pierwszy zapis tej ceny w HopTrip:"
            - time [ref=e98]: 31.10.2026, 08:57
            - text: (czas w Polsce).
          - paragraph [ref=e99]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e100]:
          - note [ref=e101]:
            - strong [ref=e102]: Sprawdź trasę przed wyborem
            - paragraph [ref=e103]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e104]:
            - strong [ref=e105]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e106]: brak godziny
        - paragraph [ref=e107]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e108]:
          - generic "Szczegóły lotu i ceny" [ref=e109] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 76/100: Barcelona" [ref=e110] [cursor=pointer]':
          - /url: /deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e111]: Jak porównujemy cenę? ⓘ
      - article [ref=e112]:
        - generic [ref=e114]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 201,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e116] [cursor=pointer]':
          - /url: /deals/browser-1?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e117]: Wrocław (WRO) →
          - heading [level=2] [ref=e118]:
            - text: Barcelona
            - img "Hiszpania" [ref=e119]
          - paragraph [ref=e120]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e121]:
            - paragraph [ref=e122]:
              - text: 201,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e123]': ≈ 46 €
              - generic [ref=e124]: za osobę · w jedną stronę
            - generic [ref=e125]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e126]: →
        - paragraph [ref=e127]:
          - strong [ref=e128]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e129]:
          - paragraph [ref=e130]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e131]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e132]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e133]:
          - note [ref=e134]:
            - strong [ref=e135]: Sprawdź trasę przed wyborem
            - paragraph [ref=e136]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e137]:
            - strong [ref=e138]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e139]: brak godziny
        - paragraph [ref=e140]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e141]:
          - generic "Szczegóły lotu i ceny" [ref=e142] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e143] [cursor=pointer]':
          - /url: /deals/browser-1?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e144]: Jak porównujemy cenę? ⓘ
      - article [ref=e145]:
        - generic [ref=e147]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 202,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e149] [cursor=pointer]':
          - /url: /deals/browser-2?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e150]: Wrocław (WRO) →
          - heading [level=2] [ref=e151]:
            - text: Barcelona
            - img "Hiszpania" [ref=e152]
          - paragraph [ref=e153]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e154]:
            - paragraph [ref=e155]:
              - text: 202,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e156]': ≈ 46 €
              - generic [ref=e157]: za osobę · w jedną stronę
            - generic [ref=e158]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e159]: →
        - paragraph [ref=e160]:
          - strong [ref=e161]: Ocena wstępna — za mało danych do porównania ceny.
        - generic [ref=e162]:
          - paragraph [ref=e163]:
            - text: "Pierwszy zapis tej ceny w HopTrip:"
            - time [ref=e164]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e165]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e166]:
          - note [ref=e167]:
            - strong [ref=e168]: Sprawdź trasę przed wyborem
            - paragraph [ref=e169]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e170]:
            - strong [ref=e171]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e172]: brak godziny
        - paragraph [ref=e173]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e174]:
          - generic "Szczegóły lotu i ceny" [ref=e175] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 45/100: Barcelona, ocena wstępna" [ref=e176] [cursor=pointer]':
          - /url: /deals/browser-2?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e177]: Jak porównujemy cenę? ⓘ
      - article [ref=e178]:
        - generic [ref=e180]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 203,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e182] [cursor=pointer]':
          - /url: /deals/browser-3?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e183]: Wrocław (WRO) →
          - heading [level=2] [ref=e184]:
            - text: Barcelona
            - img "Hiszpania" [ref=e185]
          - paragraph [ref=e186]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e187]:
            - paragraph [ref=e188]:
              - text: 203,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e189]': ≈ 46 €
              - generic [ref=e190]: za osobę · w jedną stronę
            - generic [ref=e191]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e192]: →
        - paragraph [ref=e193]:
          - strong [ref=e194]: Ocena według poprzedniej metody — porównanie wymaga odświeżenia.
        - generic [ref=e195]:
          - paragraph [ref=e196]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e197]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e198]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e199]:
          - note [ref=e200]:
            - strong [ref=e201]: Sprawdź trasę przed wyborem
            - paragraph [ref=e202]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e203]:
            - strong [ref=e204]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e205]: brak godziny
        - paragraph [ref=e206]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e207]:
          - generic "Szczegóły lotu i ceny" [ref=e208] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 68/100: Barcelona" [ref=e209] [cursor=pointer]':
          - /url: /deals/browser-3?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e210]: Jak porównujemy cenę? ⓘ
      - article [ref=e211]:
        - generic [ref=e213]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 204,00 zł Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e215] [cursor=pointer]':
          - /url: /deals/browser-4?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e216]: Wrocław (WRO) →
          - heading [level=2] [ref=e217]:
            - text: Barcelona
            - img "Hiszpania" [ref=e218]
          - paragraph [ref=e219]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e220]:
            - paragraph [ref=e221]:
              - text: 204,00 zł
              - 'generic "Orientacyjnie 46 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e222]': ≈ 46 €
              - generic [ref=e223]: za osobę · w jedną stronę
            - generic [ref=e224]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e225]: →
        - paragraph [ref=e226]:
          - strong [ref=e227]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e228]:
          - paragraph [ref=e229]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e230]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e231]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e232]:
          - note [ref=e233]:
            - strong [ref=e234]: Sprawdź trasę przed wyborem
            - paragraph [ref=e235]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e236]:
            - strong [ref=e237]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e238]: brak godziny
        - paragraph [ref=e239]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e240]:
          - generic "Szczegóły lotu i ceny" [ref=e241] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e242] [cursor=pointer]':
          - /url: /deals/browser-4?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e243]: Jak porównujemy cenę? ⓘ
      - article [ref=e244]:
        - generic [ref=e246]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 205,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e248] [cursor=pointer]':
          - /url: /deals/browser-5?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e249]: Wrocław (WRO) →
          - heading [level=2] [ref=e250]:
            - text: Barcelona
            - img "Hiszpania" [ref=e251]
          - paragraph [ref=e252]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e253]:
            - paragraph [ref=e254]:
              - text: 205,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e255]': ≈ 47 €
              - generic [ref=e256]: za osobę · w jedną stronę
            - generic [ref=e257]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e258]: →
        - paragraph [ref=e259]:
          - strong [ref=e260]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e261]:
          - paragraph [ref=e262]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e263]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e264]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e265]:
          - note [ref=e266]:
            - strong [ref=e267]: Sprawdź trasę przed wyborem
            - paragraph [ref=e268]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e269]:
            - strong [ref=e270]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e271]: brak godziny
        - paragraph [ref=e272]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e273]:
          - generic "Szczegóły lotu i ceny" [ref=e274] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e275] [cursor=pointer]':
          - /url: /deals/browser-5?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e276]: Jak porównujemy cenę? ⓘ
      - article [ref=e277]:
        - generic [ref=e279]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 206,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e281] [cursor=pointer]':
          - /url: /deals/browser-6?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e282]: Wrocław (WRO) →
          - heading [level=2] [ref=e283]:
            - text: Barcelona
            - img "Hiszpania" [ref=e284]
          - paragraph [ref=e285]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e286]:
            - paragraph [ref=e287]:
              - text: 206,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e288]': ≈ 47 €
              - generic [ref=e289]: za osobę · w jedną stronę
            - generic [ref=e290]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e291]: →
        - paragraph [ref=e292]:
          - strong [ref=e293]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e294]:
          - paragraph [ref=e295]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e296]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e297]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e298]:
          - note [ref=e299]:
            - strong [ref=e300]: Sprawdź trasę przed wyborem
            - paragraph [ref=e301]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e302]:
            - strong [ref=e303]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e304]: brak godziny
        - paragraph [ref=e305]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e306]:
          - generic "Szczegóły lotu i ceny" [ref=e307] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e308] [cursor=pointer]':
          - /url: /deals/browser-6?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e309]: Jak porównujemy cenę? ⓘ
      - article [ref=e310]:
        - generic [ref=e312]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 207,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e314] [cursor=pointer]':
          - /url: /deals/browser-7?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e315]: Wrocław (WRO) →
          - heading [level=2] [ref=e316]:
            - text: Barcelona
            - img "Hiszpania" [ref=e317]
          - paragraph [ref=e318]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e319]:
            - paragraph [ref=e320]:
              - text: 207,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e321]': ≈ 47 €
              - generic [ref=e322]: za osobę · w jedną stronę
            - generic [ref=e323]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e324]: →
        - paragraph [ref=e325]:
          - strong [ref=e326]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e327]:
          - paragraph [ref=e328]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e329]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e330]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e331]:
          - note [ref=e332]:
            - strong [ref=e333]: Sprawdź trasę przed wyborem
            - paragraph [ref=e334]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e335]:
            - strong [ref=e336]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e337]: brak godziny
        - paragraph [ref=e338]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e339]:
          - generic "Szczegóły lotu i ceny" [ref=e340] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e341] [cursor=pointer]':
          - /url: /deals/browser-7?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e342]: Jak porównujemy cenę? ⓘ
      - article [ref=e343]:
        - generic [ref=e345]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 208,00 zł Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e347] [cursor=pointer]':
          - /url: /deals/browser-8?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e348]: Wrocław (WRO) →
          - heading [level=2] [ref=e349]:
            - text: Barcelona
            - img "Hiszpania" [ref=e350]
          - paragraph [ref=e351]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e352]:
            - paragraph [ref=e353]:
              - text: 208,00 zł
              - 'generic "Orientacyjnie 47 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e354]': ≈ 47 €
              - generic [ref=e355]: za osobę · w jedną stronę
            - generic [ref=e356]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e357]: →
        - paragraph [ref=e358]:
          - strong [ref=e359]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e360]:
          - paragraph [ref=e361]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e362]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e363]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e364]:
          - note [ref=e365]:
            - strong [ref=e366]: Sprawdź trasę przed wyborem
            - paragraph [ref=e367]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e368]:
            - strong [ref=e369]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e370]: brak godziny
        - paragraph [ref=e371]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e372]:
          - generic "Szczegóły lotu i ceny" [ref=e373] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e374] [cursor=pointer]':
          - /url: /deals/browser-8?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e375]: Jak porównujemy cenę? ⓘ
      - article [ref=e376]:
        - generic [ref=e378]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 209,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e380] [cursor=pointer]':
          - /url: /deals/browser-9?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e381]: Wrocław (WRO) →
          - heading [level=2] [ref=e382]:
            - text: Barcelona
            - img "Hiszpania" [ref=e383]
          - paragraph [ref=e384]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e385]:
            - paragraph [ref=e386]:
              - text: 209,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e387]': ≈ 48 €
              - generic [ref=e388]: za osobę · w jedną stronę
            - generic [ref=e389]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e390]: →
        - paragraph [ref=e391]:
          - strong [ref=e392]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e393]:
          - paragraph [ref=e394]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e395]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e396]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e397]:
          - note [ref=e398]:
            - strong [ref=e399]: Sprawdź trasę przed wyborem
            - paragraph [ref=e400]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e401]:
            - strong [ref=e402]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e403]: brak godziny
        - paragraph [ref=e404]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e405]:
          - generic "Szczegóły lotu i ceny" [ref=e406] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e407] [cursor=pointer]':
          - /url: /deals/browser-9?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e408]: Jak porównujemy cenę? ⓘ
      - article [ref=e409]:
        - generic [ref=e411]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 210,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e413] [cursor=pointer]':
          - /url: /deals/browser-10?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e414]: Wrocław (WRO) →
          - heading [level=2] [ref=e415]:
            - text: Barcelona
            - img "Hiszpania" [ref=e416]
          - paragraph [ref=e417]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e418]:
            - paragraph [ref=e419]:
              - text: 210,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e420]': ≈ 48 €
              - generic [ref=e421]: za osobę · w jedną stronę
            - generic [ref=e422]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e423]: →
        - paragraph [ref=e424]:
          - strong [ref=e425]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e426]:
          - paragraph [ref=e427]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e428]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e429]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e430]:
          - note [ref=e431]:
            - strong [ref=e432]: Sprawdź trasę przed wyborem
            - paragraph [ref=e433]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e434]:
            - strong [ref=e435]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e436]: brak godziny
        - paragraph [ref=e437]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e438]:
          - generic "Szczegóły lotu i ceny" [ref=e439] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e440] [cursor=pointer]':
          - /url: /deals/browser-10?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e441]: Jak porównujemy cenę? ⓘ
      - article [ref=e442]:
        - generic [ref=e444]: W jedną stronę
        - 'link "Wrocław (WRO) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 211,00 zł Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w jedną stronę Zobacz szczegóły lotu" [ref=e446] [cursor=pointer]':
          - /url: /deals/browser-11?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice
          - paragraph [ref=e447]: Wrocław (WRO) →
          - heading [level=2] [ref=e448]:
            - text: Barcelona
            - img "Hiszpania" [ref=e449]
          - paragraph [ref=e450]: "Daty oferty: pon., 30 lis 2026"
          - generic [ref=e451]:
            - paragraph [ref=e452]:
              - text: 211,00 zł
              - 'generic "Orientacyjnie 48 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e453]': ≈ 48 €
              - generic [ref=e454]: za osobę · w jedną stronę
            - generic [ref=e455]:
              - text: Zobacz szczegóły lotu
              - generic [aria-hidden] [ref=e456]: →
        - paragraph [ref=e457]:
          - strong [ref=e458]: Brak wiarygodnego porównania tej ceny z historią.
        - generic [ref=e459]:
          - paragraph [ref=e460]:
            - text: "Czas zapisanej obserwacji:"
            - time [ref=e461]: 31.10.2026, 11:57
            - text: (czas w Polsce).
          - paragraph [ref=e462]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
        - generic [ref=e463]:
          - note [ref=e464]:
            - strong [ref=e465]: Sprawdź trasę przed wyborem
            - paragraph [ref=e466]: Nie można potwierdzić danych trasy ze źródła.
          - paragraph [ref=e467]:
            - strong [ref=e468]: Wylot
            - text: · lotnisko do sprawdzenia → lotnisko do sprawdzenia · Przesiadki do sprawdzenia u partnera
          - paragraph [ref=e469]: brak godziny
        - paragraph [ref=e470]: Bez noclegu · bagaż do sprawdzenia
        - group [ref=e471]:
          - generic "Szczegóły lotu i ceny" [ref=e472] [cursor=pointer]
        - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e473] [cursor=pointer]':
          - /url: /deals/browser-11?returnTo=%2Fdeals%3Forigin%3DWRO%26budget%3D300%26sort%3Dprice#score
          - generic [ref=e474]: Jak porównujemy cenę? ⓘ
    - paragraph [ref=e475]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
    - navigation "Strony ofert" [ref=e476]:
      - link "Następna strona" [ref=e477] [cursor=pointer]:
        - /url: /deals?origin=WRO&budget=300&offset=12&sort=price
    - paragraph [ref=e478]:
      - link "Powiadom mnie o pasujących lotach" [ref=e479] [cursor=pointer]:
        - /url: /alerts?origin=WRO&budget=300
      - text: ·
      - link "Zapisane wyjazdy" [ref=e480] [cursor=pointer]:
        - /url: /saved
  - contentinfo [ref=e481]:
    - generic [ref=e482]:
      - generic [ref=e483]: HopTrip.
      - paragraph [ref=e484]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e485]:
      - link "Jak działa HopTrip" [ref=e486] [cursor=pointer]:
        - /url: /info
      - link "City break" [ref=e487] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e488] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e489] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e490] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e491] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e492] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e493] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e494] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e495] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e496] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e498] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e504] [cursor=pointer]
  - alert [ref=e508]
```

# Test source

```ts
  1  | import {test,expect,type Locator,type Page} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {filterText} from '../src/lib/i18n/filter-copy';
  4  | import {catalogText} from '../src/lib/i18n/catalog-copy';
  5  | import {getMessages} from '../src/lib/i18n/messages';
  6  | import {localizedHref} from '../src/lib/i18n/routing';
  7  | 
  8  | test.beforeEach(async({page})=>{
  9  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  10 | });
  11 | async function apply(page:Page,button:Locator){
  12 |  const reply=page.waitForResponse(r=>r.request().method()==='POST' && !!r.request().headers()['next-action']);
> 13 |  await button.click();await(await reply).finished();
     |                                          ^ Error: Test timeout of 120000ms exceeded.
  14 |  await expect(page.locator('.filters')).toHaveAttribute('aria-busy','false');
  15 | }
  16 | 
  17 | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: visible primary filters preserve manual overrides, history and reset semantics`,async({page},info)=>{
  18 |  test.setTimeout(120000);
  19 |  const t=(s:string)=>filterText(locale,s),m=getMessages(locale);
  20 |  await page.goto(localizedHref('/deals?origin=WRO&budget=300&sort=price',locale));
  21 |  const form=page.locator('.filters'),budget=page.locator('input[name="budget"]');
  22 |  const quickBudget=form.getByRole('button',{name:t('Loty do 300 zł'),exact:true});
  23 |  const nights=form.getByRole('button',{name:t('2–3 noce'),exact:true});
  24 |  for(const name of ['departure_from','departure_to','duration_min','duration_max'])await expect(form.locator(`[name="${name}"]`)).toBeVisible();
  25 |  await budget.fill('150');await expect(quickBudget).toHaveAttribute('aria-pressed','false');
  26 |  // Applying this preset resolves to the current URL; the edited field must
  27 |  // still become 300, without relying on a route-key remount.
  28 |  await apply(page,quickBudget);await expect(budget).toHaveValue('300');
  29 |  await expect(quickBudget).toHaveAttribute('aria-pressed','true');
  30 |  await budget.fill('125');
  31 |  await form.locator('[name="duration_min"]').fill('5');await form.locator('[name="duration_max"]').fill('8');
  32 |  await form.locator('[name="departure_from"]').fill('2030-05-01');
  33 |  await apply(page,nights);
  34 |  await expect(budget).toHaveValue('125');
  35 |  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({origin:'WRO',budget:'125',duration_min:'2',duration_max:'3',departure_from:'2030-05-01',sort:'price'});
  36 |  await apply(page,nights);
  37 |  await expect(form.locator('[name="duration_min"]')).toHaveValue('');
  38 |  await expect(form.locator('[name="duration_max"]')).toHaveValue('');
  39 |  const noNights=page.url();await page.goBack();await expect(nights).toHaveAttribute('aria-pressed','true');
  40 |  await page.goForward();await expect(page).toHaveURL(noNights);
  41 |  await form.locator('[name="duration_min"]').fill('4');await form.locator('[name="duration_max"]').fill('6');
  42 |  await budget.fill('200');await apply(page,form.getByRole('button',{name:m.filter,exact:true}));
  43 |  await page.reload();await expect(budget).toHaveValue('200');
  44 |  await expect(form.locator('[name="duration_min"]')).toHaveValue('4');
  45 |  await budget.fill('210');
  46 |  await form.locator('[name="sort"]').selectOption('departure');
  47 |  await expect(page).toHaveURL(/budget=210/);await expect(form).toHaveAttribute('aria-busy','false');
  48 |  expect(new URL(page.url()).searchParams.get('sort')).toBe('departure');
  49 |  await page.locator('.filter-chips a').filter({hasText:m.budget}).click();
  50 |  await expect(page).not.toHaveURL(/budget=/);
  51 |  expect(new URL(page.url()).searchParams.get('duration_min')).toBe('4');
  52 |  await expect(page.getByRole('heading',{name:catalogText(locale,'Brak aktualnych ofert'),exact:true})).toBeVisible();
  53 |  expect((await new AxeBuilder({page}).include('.filter-panel').analyze()).violations).toEqual([]);
  54 |  if(locale==='pl')await page.locator('.filter-panel').screenshot({path:info.outputPath('filters.png')});
  55 |  await page.setViewportSize({width:320,height:844});
  56 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  57 |  if(locale==='pl')await page.locator('.filter-panel').screenshot({path:info.outputPath('filters-320.png')});
  58 |  await page.getByRole('link',{name:t('Wyczyść wszystkie filtry'),exact:true}).click();
  59 |  await expect(page).toHaveURL(new URL(localizedHref('/deals?sort=departure',locale),info.project.use.baseURL).href);
  60 |  await expect(page.locator('.active-filters')).toContainText(t('Brak dodatkowych filtrów.'));
  61 |  expect((await page.context().cookies()).find(c=>c.name==='hoptrip.origin.v1')).toBeUndefined();
  62 | });
  63 | 
  64 | test('a full search wins over a delayed earlier origin preference response',async({page})=>{
  65 |  test.setTimeout(60000);
  66 |  await page.goto('/');let held=false;let release!:()=>void;
  67 |  const gate=new Promise<void>(resolve=>{release=resolve;});
  68 |  await page.route('**/*',async route=>{
  69 |   if(route.request().method()==='POST' && route.request().headers()['next-action']){held=true;await gate;}
  70 |   await route.continue();
  71 |  });
  72 |  try{
  73 |   const origin=page.locator('#home-origin');await origin.fill('WRO');await origin.press('ArrowDown');await origin.press('Enter');
  74 |   await expect.poll(()=>held).toBe(true);
  75 |   await expect(page.locator('.hero form')).toHaveAttribute('aria-busy','false');
  76 |   await page.locator('input[name="destination"]').fill('Mediolan');
  77 |   await page.locator('input[name="budget"]').fill('300');
  78 |   await page.locator('.hero button[type="submit"]').click();
  79 |   await expect(page.locator('.hero form')).toHaveAttribute('aria-busy','true');
  80 |   release();
  81 |   await expect(page).toHaveURL(/\/deals\?origin=WRO&destination=milan&budget=300$/,{timeout:15000});
  82 |   await expect(page.locator('input[name="budget"]')).toHaveValue('300');
  83 |  }finally{release();await page.unrouteAll({behavior:'wait'});}
  84 | });
  85 | 
  86 | test('removing a fixed landing constraint opens the general catalog without losing unrelated conditions',async({page})=>{
  87 |  await page.goto('/city-break?origin=WRO&sort=price');
  88 |  await expect(page.locator('input[name="duration_min"]')).toHaveValue('2');
  89 |  await expect(page.locator('input[name="duration_min"]')).toHaveAttribute('readonly','');
  90 |  await page.locator('.filter-chips a').filter({hasText:'Pobyt od'}).click();
  91 |  await expect(page).toHaveURL(/\/deals\?/);
  92 |  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({origin:'WRO',duration_max:'4',sort:'price'});
  93 |  expect(new URL(page.url()).searchParams.has('duration_min')).toBe(false);
  94 |  await page.goto('/from/warszawa?budget=250&sort=price');
  95 |  await page.getByRole('link',{name:/Usuń filtr: Skąd/}).click();
  96 |  await expect(page).toHaveURL(/\/deals\?/);
  97 |  expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual({budget:'250',sort:'price'});
  98 | });
  99 | 
```