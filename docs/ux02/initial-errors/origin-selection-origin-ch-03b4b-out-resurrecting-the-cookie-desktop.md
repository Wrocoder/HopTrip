# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: origin-selection.spec.ts >> origin changes preserve destination, date and budget drafts and clear without resurrecting the cookie
- Location: tests\origin-selection.spec.ts:30:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: ""
Received: "KTW"

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
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
      - link "Aktualne okazje" [ref=e8] [cursor=pointer]:
        - /url: /deals
      - link "Zapisane" [ref=e9] [cursor=pointer]:
        - /url: /saved
      - link "Kalkulator budżetu" [ref=e10] [cursor=pointer]:
        - /url: /info/trip-budget
      - link "Jak działa HopTrip" [ref=e11] [cursor=pointer]:
        - /url: /info
    - navigation "Język" [ref=e12]:
      - link "Polski" [ref=e13] [cursor=pointer]:
        - /url: /?origin=KTW
      - link "Русский" [ref=e14] [cursor=pointer]:
        - /url: /ru?origin=KTW
      - link "English" [ref=e15] [cursor=pointer]:
        - /url: /en?origin=KTW
      - link "Українська" [ref=e16] [cursor=pointer]:
        - /url: /uk?origin=KTW
  - main [ref=e18]:
    - region [ref=e19]:
      - generic [ref=e20]:
        - paragraph [ref=e21]: Loty z Polski · HopTrip
        - heading "Tanie podróże zaczynają się tutaj." [level=1] [ref=e23]
        - paragraph [ref=e24]: Znajdź lot, sprawdź wydarzenia i zaplanuj wyjazd w jednym miejscu.
      - region "Wybór ofert" [ref=e25]:
        - form "Filtry ofert" [ref=e26]:
          - group [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]: Skąd
              - combobox "Skąd" [ref=e30]: Katowice — KTW
              - generic [ref=e31]: "Miasto lub kod IATA. Puste pole: dowolne."
            - generic [ref=e32]:
              - generic [ref=e33]: Dokąd
              - combobox "Dokąd" [expanded] [active] [ref=e34]: Mediolan
              - listbox "Kierunki podróży" [ref=e35]:
                - option "Dokądkolwiek" [ref=e36] [cursor=pointer]
                - option "Mediolan (IT)" [ref=e37] [cursor=pointer]
              - generic [ref=e38]: "Miasto lub kod IATA. Puste pole: dowolne."
            - group "Elastyczne daty wylotu" [ref=e39]:
              - generic [ref=e41]:
                - generic [ref=e42]:
                  - text: Wylot od
                  - textbox "Wylot od" [ref=e43]: 2030-05-01
                - generic [ref=e44]:
                  - text: Wylot do
                  - textbox "Wylot do" [ref=e45]
              - paragraph [ref=e46]: Wybierz przedział możliwego wylotu. Zostaw daty puste, aby szukać bez ograniczeń.
            - generic [ref=e47]:
              - text: Budżet na lot / osobę (PLN, opcjonalnie)
              - spinbutton "Budżet na lot / osobę (PLN, opcjonalnie)" [ref=e48]: "321"
            - button "Znajdź tani lot" [ref=e49] [cursor=pointer]
          - group [ref=e50]:
            - 'generic "Więcej opcji: długość pobytu" [ref=e51] [cursor=pointer]'
    - region [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - paragraph [ref=e55]: "Wylot: KTW"
          - heading "Krótkie wyjazdy · 2–4 noce" [level=2] [ref=e56]
        - generic [ref=e57]: za osobę · PLN
      - paragraph [ref=e58]: W tej sekcji pomijamy loty z brakującymi lub sprzecznymi kluczowymi danymi trasy. Pełny katalog może zawierać takie loty z ostrzeżeniem.
      - button "Zmień lotnisko" [ref=e59] [cursor=pointer]
      - paragraph [ref=e60]: Lotnisko wybierasz w wyszukiwarce. Ten sam wybór stosujemy do propozycji poniżej i zapamiętujemy na tym urządzeniu.
      - generic [ref=e61]:
        - article [ref=e62]:
          - generic [ref=e64]: W obie strony
          - 'link "Katowice (KTW) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 – śr., 2 gru 2026 2 noce 180,00 zł Orientacyjnie 41 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony" [ref=e66] [cursor=pointer]':
            - /url: /deals/short-KTW-0
            - paragraph [ref=e67]: Katowice (KTW) →
            - heading [level=2] [ref=e68]:
              - text: Barcelona
              - img "Hiszpania" [ref=e69]
            - paragraph [ref=e70]: "Daty oferty: pon., 30 lis 2026 – śr., 2 gru 2026"
            - paragraph [ref=e71]: 2 noce
            - generic [ref=e72]:
              - paragraph [ref=e73]:
                - text: 180,00 zł
                - 'generic "Orientacyjnie 41 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e74]': ≈ 41 €
                - generic [ref=e75]: za osobę · w obie strony
              - generic [aria-hidden] [ref=e76]: ↗
          - generic [ref=e77]:
            - paragraph [ref=e78]:
              - text: "Czas zapisanej obserwacji:"
              - time [ref=e79]: 31.10.2026, 08:17
              - text: (czas w Polsce).
            - paragraph [ref=e80]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
          - generic [ref=e81]:
            - note [ref=e82]:
              - strong [ref=e83]: Niepełne dane lotu
              - paragraph [ref=e84]: Część godzin przylotu jest obliczona, nie potwierdzona rozkładem.
              - group [ref=e85]:
                - generic "Jakich danych brakuje?" [ref=e86]
              - paragraph [ref=e87]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
            - paragraph [ref=e88]:
              - strong [ref=e89]: Wylot
              - text: "· 30 lis: KTW 08:17 → BCN 10:17 · szac."
              - generic [ref=e90]: Bez przesiadek
            - paragraph [ref=e91]:
              - strong [ref=e92]: Powrót
              - text: "· 2 gru: BCN 08:17 → KTW 10:17 · szac."
              - generic [ref=e93]: Bez przesiadek
            - paragraph [ref=e94]: Godziny lokalne · Przylot szacowany
            - paragraph [ref=e95]: "Wylot: Ryanair (FR) · Powrót: Przewoźnik powrotny do sprawdzenia"
          - paragraph [ref=e96]: "Między przylotem a odlotem: 46 godz. 0 min (szac.)."
          - group [ref=e97]:
            - generic "Szczegóły lotu i ceny" [ref=e98] [cursor=pointer]
          - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e99] [cursor=pointer]':
            - /url: /deals/short-KTW-0#score
            - generic [ref=e100]: Jak porównujemy cenę? ⓘ
        - article [ref=e101]:
          - generic [ref=e103]: W obie strony
          - 'link "Katowice (KTW) Barcelona Hiszpania Daty oferty: pon., 30 lis 2026 – pt., 4 gru 2026 4 noce 181,00 zł Orientacyjnie 41 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić. za osobę · w obie strony" [ref=e105] [cursor=pointer]':
            - /url: /deals/short-KTW-1
            - paragraph [ref=e106]: Katowice (KTW) →
            - heading [level=2] [ref=e107]:
              - text: Barcelona
              - img "Hiszpania" [ref=e108]
            - paragraph [ref=e109]: "Daty oferty: pon., 30 lis 2026 – pt., 4 gru 2026"
            - paragraph [ref=e110]: 4 noce
            - generic [ref=e111]:
              - paragraph [ref=e112]:
                - text: 181,00 zł
                - 'generic "Orientacyjnie 41 €. Średni kurs NBP z pt., 30 paź 2026: 1 EUR = 4,3955 PLN. Kurs płatności może się różnić." [ref=e113]': ≈ 41 €
                - generic [ref=e114]: za osobę · w obie strony
              - generic [aria-hidden] [ref=e115]: ↗
          - generic [ref=e116]:
            - paragraph [ref=e117]:
              - text: "Czas zapisanej obserwacji:"
              - time [ref=e118]: 31.10.2026, 08:17
              - text: (czas w Polsce).
            - paragraph [ref=e119]: Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.
          - generic [ref=e120]:
            - note [ref=e121]:
              - strong [ref=e122]: Niepełne dane lotu
              - paragraph [ref=e123]: Część godzin przylotu jest obliczona, nie potwierdzona rozkładem.
              - group [ref=e124]:
                - generic "Jakich danych brakuje?" [ref=e125]
              - paragraph [ref=e126]: Kompletność danych nie potwierdza dostępności u sprzedawcy.
            - paragraph [ref=e127]:
              - strong [ref=e128]: Wylot
              - text: "· 30 lis: KTW 08:17 → BCN 10:17 · szac."
              - generic [ref=e129]: Bez przesiadek
            - paragraph [ref=e130]:
              - strong [ref=e131]: Powrót
              - text: "· 4 gru: BCN 08:17 → KTW 10:17 · szac."
              - generic [ref=e132]: Bez przesiadek
            - paragraph [ref=e133]: Godziny lokalne · Przylot szacowany
            - paragraph [ref=e134]: "Wylot: Ryanair (FR) · Powrót: Przewoźnik powrotny do sprawdzenia"
          - paragraph [ref=e135]: "Między przylotem a odlotem: 94 godz. 0 min (szac.)."
          - group [ref=e136]:
            - generic "Szczegóły lotu i ceny" [ref=e137] [cursor=pointer]
          - 'link "Jak porównujemy cenę? Wyjaśnij ocenę oferty cenowej 70/100: Barcelona" [ref=e138] [cursor=pointer]':
            - /url: /deals/short-KTW-1#score
            - generic [ref=e139]: Jak porównujemy cenę? ⓘ
      - paragraph [ref=e140]: Przedział między przylotem a odlotem obejmuje też sen, transfery i odprawę — to nie czas samego zwiedzania. Cena lotu za osobę. Dostępność, bagaż i rozkład potwierdź u partnera; nocleg osobno.
      - status [ref=e141]: "Liczba propozycji na 2–4 noce: 2."
      - paragraph [ref=e142]: Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.
      - paragraph [ref=e143]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione. Sprawdź godziny lotów i potrzebne dni urlopu.
      - paragraph [ref=e144]:
        - link "Zobacz wszystkie loty na 2–4 noce →" [ref=e145] [cursor=pointer]:
          - /url: /deals?origin=KTW&duration_min=2&duration_max=4
    - navigation "Pomysły na krótki wyjazd" [ref=e146]:
      - link "City break na 2–4 noce" [ref=e147] [cursor=pointer]:
        - /url: /city-break
      - link "Tanie loty na weekend" [ref=e148] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Warszawa — oba lotniska" [ref=e149] [cursor=pointer]:
        - /url: /from/warszawa
    - paragraph [ref=e150]:
      - link "Zobacz loty ze wszystkich lotnisk →" [ref=e151] [cursor=pointer]:
        - /url: /deals
      - text: ·
      - link "Jak oceniamy ofertę →" [ref=e152] [cursor=pointer]:
        - /url: /info/price-comparison
    - complementary "Budżet podróży" [ref=e153]:
      - paragraph [ref=e154]: "Zaplanuj cały wyjazd: loty, nocleg, dojazdy i atrakcje. Policz koszt dla siebie lub całej grupy."
      - link "Policz budżet podróży" [ref=e155] [cursor=pointer]:
        - /url: /info/trip-budget#calculator
    - generic [ref=e156]:
      - generic [ref=e157]:
        - paragraph [ref=e158]: 02 / Skąd wyruszasz
        - heading "Lotniska wylotu" [level=2] [ref=e159]
        - generic [ref=e160]:
          - link "Gdańsk — GDN" [ref=e161] [cursor=pointer]:
            - /url: /from/GDN
          - link "Katowice — KTW" [ref=e162] [cursor=pointer]:
            - /url: /from/KTW
          - link "Kraków — KRK" [ref=e163] [cursor=pointer]:
            - /url: /from/KRK
          - link "Warszawa-Chopin — WAW" [ref=e164] [cursor=pointer]:
            - /url: /from/WAW
          - link "Warszawa-Modlin — WMI" [ref=e165] [cursor=pointer]:
            - /url: /from/WMI
          - link "Wrocław — WRO" [ref=e166] [cursor=pointer]:
            - /url: /from/WRO
      - generic [ref=e167]:
        - paragraph [ref=e168]: 03 / Dokąd chcesz polecieć
        - heading "Kierunki" [level=2] [ref=e169]
        - generic [ref=e170]:
          - link "Barcelona" [ref=e171] [cursor=pointer]:
            - /url: /destinations/barcelona
          - link "Mediolan" [ref=e172] [cursor=pointer]:
            - /url: /destinations/milan
          - link "Rzym" [ref=e173] [cursor=pointer]:
            - /url: /destinations/rome
    - complementary [ref=e174]:
      - generic [aria-hidden] [ref=e175]: ↗
      - paragraph [ref=e176]: Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione.
      - link "Współpraca partnerska →" [ref=e177] [cursor=pointer]:
        - /url: /info/partners
  - contentinfo [ref=e178]:
    - generic [ref=e179]:
      - generic [ref=e180]: HopTrip.
      - paragraph [ref=e181]: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów."
    - navigation "Informacje o serwisie" [ref=e182]:
      - link "City break" [ref=e183] [cursor=pointer]:
        - /url: /city-break
      - link "Loty na weekend" [ref=e184] [cursor=pointer]:
        - /url: /tanie-loty-na-weekend
      - link "Loty z Warszawy" [ref=e185] [cursor=pointer]:
        - /url: /from/warszawa
      - link "Zapisane wyjazdy" [ref=e186] [cursor=pointer]:
        - /url: /saved
      - link "Subskrypcja lotów" [ref=e187] [cursor=pointer]:
        - /url: /alerts
      - link "O HopTrip" [ref=e188] [cursor=pointer]:
        - /url: /info/about
      - link "Kontakt" [ref=e189] [cursor=pointer]:
        - /url: /info/contact
      - link "Prywatność" [ref=e190] [cursor=pointer]:
        - /url: /info/privacy
      - link "Zasady korzystania" [ref=e191] [cursor=pointer]:
        - /url: /info/terms
      - link "Współpraca partnerska" [ref=e192] [cursor=pointer]:
        - /url: /info/partners
    - button "Ustawienia prywatności" [ref=e194] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e200] [cursor=pointer]
  - alert [ref=e204]: Tanie podróże zaczynają się tutaj.
```

# Test source

```ts
  1  | import {expect,type Page} from '@playwright/test';
  2  | 
  3  | export async function chooseOrigin(page:Page,code:string){
  4  |  const input=page.locator('#home-origin');
  5  |  await input.fill(code);
  6  |  if(code){await input.press('ArrowDown');await input.press('Enter');}
  7  |  else await input.press('Tab');
> 8  |  await expect.poll(()=>new URL(page.url()).searchParams.get('origin'),{timeout:15000}).toBe(code);
     |                                                                                        ^ Error: expect(received).toBe(expected) // Object.is equality
  9  |  await expect.poll(async()=>(await page.context().cookies()).find(c=>c.name==='hoptrip.origin.v1')?.value,{timeout:15000}).toBe(code || undefined);
  10 | }
  11 | 
```