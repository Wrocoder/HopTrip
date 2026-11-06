# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: detail-layout.spec.ts >> uk: flight decision precedes planning without hiding critical warnings or losing the shared plan
- Location: tests\detail-layout.spec.ts:18:56

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 2

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f3e1]:
  - link "Перейти до вмісту" [ref=f3e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f3e3]:
    - link "HopTrip — головна" [ref=f3e4] [cursor=pointer]:
      - /url: /uk
      - generic [aria-hidden] [ref=f3e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f3e6]: .
    - navigation "Основна навігація" [ref=f3e7]:
      - link "Недорогі перельоти" [ref=f3e8] [cursor=pointer]:
        - /url: /uk/deals
      - link "На вихідні" [ref=f3e9] [cursor=pointer]:
        - /url: /uk/tanie-loty-na-weekend
      - link "Напрямки" [ref=f3e10] [cursor=pointer]:
        - /url: /uk/destinations
      - link "Збережене" [ref=f3e11] [cursor=pointer]:
        - /url: /uk/saved
      - link "Калькулятор бюджету" [ref=f3e12] [cursor=pointer]:
        - /url: /uk/info/trip-budget
    - navigation "Мова" [ref=f3e13]:
      - link "Polski" [ref=f3e14] [cursor=pointer]:
        - /url: /deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
      - link "Русский" [ref=f3e15] [cursor=pointer]:
        - /url: /ru/deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
      - link "English" [ref=f3e16] [cursor=pointer]:
        - /url: /en/deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
      - link "Українська" [ref=f3e17] [cursor=pointer]:
        - /url: /uk/deals/browser-deal?returnTo=%2Fdeals%3Forigin%3DWRO%26sort%3Dprice%26offset%3D12
  - main [ref=f3e19]:
    - link "← Актуальні пропозиції" [ref=f3e20] [cursor=pointer]:
      - /url: /uk/deals?origin=WRO&offset=12&sort=price
    - article [ref=f3e21]:
      - generic [ref=f3e22]:
        - paragraph [ref=f3e23]: В один бік
        - heading [level=1] [ref=f3e24]:
          - text: Вроцлав (WRO) → Барселона
          - img "Іспанія" [ref=f3e25]
        - paragraph [ref=f3e26]: "Дати вильотів: сб, 5 груд. 2026 р."
      - navigation "Розділи плану подорожі" [ref=f3e27]:
        - link "Переліт" [ref=f3e28] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "До партнера" [ref=f3e29] [cursor=pointer]:
          - /url: "#trip-booking"
        - link "Проживання" [ref=f3e30] [cursor=pointer]:
          - /url: "#accommodation"
        - link "Пам’ятки" [ref=f3e31] [cursor=pointer]:
          - /url: "#destination-activities"
        - link "Події" [ref=f3e32] [cursor=pointer]:
          - /url: "#trip-events"
        - link "Бюджет" [ref=f3e33] [cursor=pointer]:
          - /url: "#calculator"
        - link "Зберегти" [ref=f3e34] [cursor=pointer]:
          - /url: "#trip-save"
        - link "Порівняння ціни" [ref=f3e35] [cursor=pointer]:
          - /url: "#score"
      - generic [ref=f3e36]:
        - region "Ціна перельоту" [ref=f3e37]:
          - paragraph [ref=f3e38]: за особу · PLN
          - paragraph [ref=f3e39]:
            - text: 200,25 PLN
            - 'generic "Приблизно 46 EUR. Середній курс NBP від чт, 5 лист. 2026 р.: 1 EUR = 4,3916 PLN. Курс під час оплати може відрізнятися." [ref=f3e40]':
              - generic [aria-hidden] [ref=f3e41]: ≈ 46 EUR
            - generic [ref=f3e43]: за особу · в один бік
          - generic [ref=f3e44]:
            - paragraph [ref=f3e45]:
              - text: "Перший запис цієї ціни в HopTrip:"
              - time [ref=f3e46]: чт, 5 лист. 2026 р., 08:54
              - text: (час у Польщі).
            - paragraph [ref=f3e47]: Наявність місць і остаточну ціну уточнюйте в партнера. Перевірки в реальному часі немає.
            - group [ref=f3e48]:
              - generic "Походження ціни та строк показу" [ref=f3e49] [cursor=pointer]
          - paragraph [ref=f3e50]:
            - strong [ref=f3e51]: Ціна на 49,75 PLN нижча за медіану вибірки.
            - text: "Спостережень: 24. Вибірка напрямку, не однакових тарифів або всього ринку."
          - heading "Деталі перельоту" [level=2] [ref=f3e52]
          - generic [ref=f3e53]:
            - note [ref=f3e54]:
              - strong [ref=f3e55]: Перевірте маршрут перед вибором
              - paragraph [ref=f3e56]: Дані маршруту джерела не підтверджені.
              - list
              - paragraph [ref=f3e57]: Повнота даних не підтверджує наявність у продавця.
            - paragraph [ref=f3e58]:
              - strong [ref=f3e59]: Виліт
              - text: · аеропорт потрібно уточнити → аеропорт потрібно уточнити · час невідомий
              - generic [ref=f3e60]: Пересадки уточнюйте в партнера
            - paragraph [ref=f3e62]: Час і вартість доїзду невідомі — перевірте транспорт на дату подорожі.
            - paragraph [ref=f3e63]: "Виліт: Уточніть авіакомпанію"
          - paragraph [ref=f3e64]: Ціну вказано за переліт. Проживання не включено.
          - paragraph [ref=f3e65]: Багаж слід уточнити
          - group [ref=f3e66]:
            - generic "Повні дані рейсу та багаж" [ref=f3e67] [cursor=pointer]
        - region [active] [ref=f3e68]:
          - heading "Перехід до партнера" [level=2] [ref=f3e69]
          - generic [ref=f3e70]: Партнерство
          - generic [ref=f3e71]:
            - paragraph [ref=f3e72]:
              - text: 200,25 PLN
              - 'generic "Приблизно 46 EUR. Середній курс NBP від чт, 5 лист. 2026 р.: 1 EUR = 4,3916 PLN. Курс під час оплати може відрізнятися." [ref=f3e73]':
                - generic [aria-hidden] [ref=f3e74]: ≈ 46 EUR
              - generic [ref=f3e76]: за особу · в один бік
            - paragraph [ref=f3e77]:
              - strong [ref=f3e78]: Вкажіть у партнера 1 дорослого.
              - text: Посилання відкриває пропозицію партнера. Змінені дати й кількість пасажирів із плану не передаються. Перевірте дати й ціну в партнера.
            - link "Переглянути переліт — Fixture program" [ref=f3e79] [cursor=pointer]:
              - /url: http://127.0.0.1:8125/go/browser-deal/flight
          - paragraph [ref=f3e80]: "Партнерське посилання: ми можемо отримати комісію після бронювання. Ми не продаємо квитки."
      - region [ref=f3e81]:
        - heading "Знайти житло — Барселона" [level=2] [ref=f3e82]
        - paragraph [ref=f3e83]: Житло бронюється окремо від перельоту. Дати проживання та дорослі спільні з бюджетом; дати перельоту не змінюються.
        - paragraph [ref=f3e84]: Дати проживання обираються окремо від дат перельоту. Перевірте місцеві дати прильоту та зворотного вильоту.
        - group [ref=f3e85]:
          - generic "Як узгодити дати проживання з перельотом?" [ref=f3e86] [cursor=pointer]
        - paragraph [ref=f3e87]: Це переліт в один бік — вкажіть дату виїзду.
        - group "Дати проживання та дорослі" [ref=f3e88]:
          - generic [ref=f3e90]:
            - generic [ref=f3e91]:
              - generic [ref=f3e92]: Заїзд
              - textbox "Заїзд" [invalid] [ref=f3e93]: 2026-12-05
            - generic [ref=f3e94]:
              - generic [ref=f3e95]: Виїзд
              - textbox "Виїзд" [invalid] [ref=f3e96]
              - status [ref=f3e97]: Виберіть дату виїзду пізніше дати заїзду.
            - generic [ref=f3e98]:
              - generic [ref=f3e99]: Дорослі
              - spinbutton "Дорослі" [ref=f3e100]: "1"
        - paragraph [ref=f3e102]:
          - strong [ref=f3e103]: Барселона
          - text: ": сб, 5 груд. 2026 р. – Оберіть дату · дорослих: 1."
        - paragraph [ref=f3e104]: Ціну й наявність житла перевірте у Stay22. HopTrip не отримує котирування; суми в бюджеті вводяться вручну.
        - paragraph [ref=f3e105]: Партнерське посилання — ми можемо отримати комісію. Передаємо лише дорослих; дітей та їхній вік вкажіть у партнера. Перевірте дати, гостей, ціну й умови скасування.
        - group [ref=f3e106]:
          - generic "Як додати вартість житла до плану?" [ref=f3e107] [cursor=pointer]
        - link "Додати вартість житла до бюджету подорожі" [ref=f3e108] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=f3e109]:
        - paragraph [ref=f3e110]: Ідеї для подорожі · Барселона
        - heading "Музеї та пам’ятки" [level=2] [ref=f3e111]
        - paragraph [ref=f3e112]: Квитки купують окремо. Наявність на дати подорожі перевір у продавця або на офіційному сайті пам’ятки.
        - list [ref=f3e113]:
          - listitem [ref=f3e114]:
            - generic [ref=f3e115]: Архітектура
            - heading "Casa Batlló — квиток Blue" [level=3] [ref=f3e116]
            - paragraph [ref=f3e117]: Інтер’єри будинку, спроєктованого Гауді, аудіогід і простір Gaudí Cube.
            - paragraph [ref=f3e118]:
              - strong [ref=f3e119]: "Для кого:"
              - text: Для тих, хто цікавиться архітектурою Гауді та відвідуванням з аудіогідом.
            - paragraph [ref=f3e120]:
              - strong [ref=f3e121]: "Тривалість відвідування:"
              - text: Приблизно 1 година для варіанта Blue; без дороги й очікування входу.
            - paragraph [ref=f3e122]: Варіант Blue не включає терасу на даху, планшет VR або вхід без черги. Перевірте час входу й мову аудіогіда.
            - generic [ref=f3e123]:
              - paragraph [ref=f3e124]: Ціну потрібно уточнити в Tiqets
              - paragraph [ref=f3e125]: Партнерське посилання — ми можемо отримати комісію за купівлю.
              - 'link "Уточнити дати й ціну в Tiqets: Casa Batlló — квиток Blue (нова вкладка)" [ref=f3e126] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Уточнити дати й ціну
              - paragraph [ref=f3e127]:
                - link "Джерело тривалості відвідування (нова вкладка)" [ref=f3e128] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=f3e129]:
            - generic [ref=f3e130]: Океанаріум
            - heading "Aquarium Barcelona — вхідний квиток" [level=3] [ref=f3e131]
            - paragraph [ref=f3e132]: "Морський світ у Port Vell: акваріуми й виставки про життя під водою."
            - paragraph [ref=f3e133]:
              - strong [ref=f3e134]: "Для кого:"
              - text: Для родин і тих, хто цікавиться морською природою; варіант відвідування в приміщенні.
            - paragraph [ref=f3e135]:
              - strong [ref=f3e136]: "Тривалість відвідування:"
              - text: Орієнтовно 1,5–2 години на відвідування; без дороги й черги.
            - paragraph [ref=f3e137]: Перевірте дату відвідування, години роботи й правила дитячих квитків.
            - generic [ref=f3e138]:
              - paragraph [ref=f3e139]: Ціну потрібно уточнити в Tiqets
              - paragraph [ref=f3e140]: Партнерське посилання — ми можемо отримати комісію за купівлю.
              - 'link "Уточнити дати й ціну в Tiqets: Aquarium Barcelona — вхідний квиток (нова вкладка)" [ref=f3e141] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Уточнити дати й ціну
              - paragraph [ref=f3e142]:
                - link "Джерело тривалості відвідування (нова вкладка)" [ref=f3e143] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=f3e144]:
            - generic [ref=f3e145]: Природа · безкоштовний вхід
            - heading "Hivernacle — оранжерея в парку Ciutadella" [level=3] [ref=f3e146]
            - paragraph [ref=f3e147]: Історична оранжерея з колекціями рослин у парку Ciutadella.
            - paragraph [ref=f3e148]:
              - strong [ref=f3e149]: "Для кого:"
              - text: Для любителів рослин і спокійної прогулянки серед зелені.
            - paragraph [ref=f3e150]: Безкоштовний вхід стосується самостійного відвідування. Перевірте години й закриття; екскурсії з гідом мають окремі правила та бронювання.
            - generic [ref=f3e151]:
              - paragraph [ref=f3e152]: "Самостійне відвідування: за офіційним сайтом вхід безкоштовний."
              - 'link "Уточнити правила відвідування: Hivernacle — оранжерея в парку Ciutadella (нова вкладка)" [ref=f3e153] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Уточнити правила відвідування
        - paragraph [ref=f3e154]: Пам’ятки не включені у вартість перельоту. До купівлі перевір склад квитка, пільги й умови скасування. У дні подорожі врахуй час перельотів і трансферів.
        - paragraph [ref=f3e155]: Зміни дат і складу групи в плані автоматично не передаються за цим посиланням. Перевірте дату, учасників і ціну в партнера.
        - paragraph [ref=f3e156]: Описи й правила перевірені пн, 12 жовт. 2026 р.. Це огляд джерел, а не підтвердження наявності квитків на дати подорожі.
        - paragraph [ref=f3e157]: У калькуляторі зазнач загальну вартість вибраних пам’яток у PLN на людину за весь час проживання. Якщо ціни квитків різняться, використовуй середню на людину. Безкоштовний вхід не означає, що дорога теж безкоштовна.
        - link "Урахувати пам’ятки в бюджеті" [ref=f3e158] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=f3e159]:
        - generic [ref=f3e160]:
          - generic [ref=f3e161]:
            - heading "Події під час подорожі" [level=2] [ref=f3e162]
            - paragraph [ref=f3e163]: Концерти, спорт і культура в місті призначення. Квитки на події купуються окремо.
          - generic [ref=f3e164]: Ticketmaster
        - paragraph [ref=f3e165]:
          - generic [ref=f3e166]: Ваша подорож · Барселона
          - strong [ref=f3e167]: 5 груд. 2026 р. – Дати не задано
        - generic [ref=f3e168]:
          - strong [ref=f3e169]: Дати подорожі
          - button "Інші дати" [ref=f3e170] [cursor=pointer]
        - paragraph [ref=f3e171]: Дати спільні з житлом і бюджетом. Зміни автоматично оновлюють події. Це дати плану — перевірте їх відповідність розкладу перельоту.
        - generic [ref=f3e172]:
          - generic [ref=f3e173]:
            - text: З
            - textbox "З" [invalid] [ref=f3e174]: 2026-12-05
          - generic [ref=f3e175]:
            - text: До
            - textbox "До" [invalid] [ref=f3e176]
          - generic [ref=f3e177]:
            - text: Категорія
            - combobox "Категорія" [ref=f3e178]:
              - option "Усі" [selected]
              - option "Музика"
              - option "Спорт"
              - option "Культура"
              - option "Інше"
          - button "Знайти події" [ref=f3e179] [cursor=pointer]
        - generic [ref=f3e181]:
          - text: Сумісність із перельотом
          - combobox "Сумісність із перельотом" [ref=f3e182]:
            - option "Усі події" [selected]
            - option "Може підійти до перельоту"
        - paragraph [ref=f3e183]: Цей режим приховує лише явні конфлікти з перельотом. Події з малим запасом чи неповними даними залишаються видимими. Формальності в аеропорту та дорогу до місця потрібно перевірити; відвідування не гарантується.
        - status [ref=f3e184]:
          - paragraph [ref=f3e185]: Виберіть коректний період до 31 дня, не більш ніж на 365 днів уперед.
        - group [ref=f3e186]:
          - generic "Перед покупкою" [ref=f3e187] [cursor=pointer]
        - paragraph [ref=f3e188]: "Партнерські посилання: HopTrip може отримати комісію від покупки. Наявність квитків і правила входу уточнюйте у продавця."
        - paragraph [ref=f3e189]: Зміни дат і складу групи в плані автоматично не передаються за цим посиланням. Перевірте дату, учасників і ціну в партнера.
      - navigation "Спланувати перебування" [ref=f3e190]:
        - heading "Спланувати перебування" [level=2] [ref=f3e191]
        - list [ref=f3e192]:
          - listitem [ref=f3e193]:
            - 'link "Барселона: BCN, Жирона чи Реус" [ref=f3e194] [cursor=pointer]':
              - /url: /uk/info/barcelona-airports
          - listitem [ref=f3e195]:
            - 'link "Барселона за 3 дні: план огляду й бюджет подорожі" [ref=f3e196] [cursor=pointer]':
              - /url: /uk/info/barcelona-3-days
      - region [ref=f3e197]:
        - heading "Калькулятор бюджету подорожі" [level=2] [ref=f3e198]
        - paragraph [ref=f3e199]: Введіть власні суми в PLN. Порожнє поле означає невідомі витрати; вкажіть 0, якщо витрат немає або їх уже враховано в іншому рядку.
        - paragraph [ref=f3e200]: Відома ціна перельоту копіюється з пропозиції на особу та покриває лише її ділянки. Додайте відсутній зворотний квиток до суми перельотів, якщо його немає у пропозиції; не рахуйте його повторно, якщо він уже включений. Це спостережена ціна, а не підтвердження бронювання. Решта сум — ваші оцінки або ціни, введені вручну; ми не перевіряємо їх у продавців.
        - group "Режим калькулятора" [ref=f3e201]:
          - button "Швидкий бюджет" [pressed] [ref=f3e202] [cursor=pointer]
          - button "Детальний бюджет" [ref=f3e203] [cursor=pointer]
        - paragraph [ref=f3e204]: Обидва режими враховують усі введені витрати та події. Перемикання зберігає суми. Розгорніть подробиці, щоб заповнити відсутні витрати.
        - group [ref=f3e205]:
          - generic "Як розраховуються витрати?" [ref=f3e206] [cursor=pointer]
        - paragraph [ref=f3e207]: Зміни зберігаються автоматично в цьому браузері, окремо для кожної пропозиції.
        - group "Ваш план подорожі" [ref=f3e208]:
          - generic [ref=f3e210]:
            - generic [ref=f3e211]:
              - generic [ref=f3e212]: Початок перебування (необов’язково)
              - textbox "Початок перебування (необов’язково)" [invalid] [ref=f3e213]: 2026-12-05
            - generic [ref=f3e214]:
              - generic [ref=f3e215]: Кінець перебування (необов’язково)
              - textbox "Кінець перебування (необов’язково)" [invalid] [ref=f3e216]
          - paragraph [ref=f3e217]: Дати перераховують ночі та дні витрат. Ці значення можна змінити вручну. Дати перебування також використовуються для пошуку житла. Дати пропозиції перельоту не змінюються.
          - paragraph [ref=f3e218]: "Укажіть обидві дати: кінець не може бути раніше початку; перебування — не більше 365 днів."
          - generic [ref=f3e219]:
            - generic [ref=f3e220]:
              - generic [ref=f3e221]: Кількість дорослих
              - generic [ref=f3e222]: Від 1 до 50 осіб
              - textbox "Кількість дорослих" [ref=f3e223]: "1"
            - generic [ref=f3e224]:
              - generic [ref=f3e225]: Кількість ночей
              - generic [ref=f3e226]: Від 0 до 365 ночей
              - textbox "Кількість ночей" [ref=f3e227]: "2"
            - generic [ref=f3e228]:
              - generic [ref=f3e229]: Кількість днів витрат
              - generic [ref=f3e230]: Від 1 до 365 днів, включно з днями прильоту та вильоту
              - textbox "Кількість днів витрат" [ref=f3e231]: "3"
          - paragraph [ref=f3e232]:
            - generic [ref=f3e233]:
              - checkbox "Усі мандрівники — дорослі" [checked] [ref=f3e234]
              - text: Усі мандрівники — дорослі
          - region [ref=f3e235]:
            - heading "Особисті профілі бюджету" [level=3] [ref=f3e236]
            - paragraph [ref=f3e237]: Це ваші припущення в PLN, а не середні ціни міста. Готових цін у профілях немає. Введіть діапазони або перенесіть свої суми. Введені витрати, зокрема 0, мають пріоритет.
            - group "Особисті профілі бюджету" [ref=f3e238]:
              - button "Ощадливо" [ref=f3e239] [cursor=pointer]
              - button "Стандартно" [ref=f3e240] [cursor=pointer]
              - button "Комфортно" [ref=f3e241] [cursor=pointer]
              - button "Без профілю" [pressed] [ref=f3e242] [cursor=pointer]
          - group [ref=f3e243]:
            - generic "Орієнтовні витрати на місці" [ref=f3e244] [cursor=pointer]
            - 'option "Барселона: T-casual, 10 поїздок, 1 зона — 13,00 EUR" [selected]'
          - paragraph [ref=f3e245]:
            - link "Повний посібник із бюджету подорожі" [ref=f3e246] [cursor=pointer]:
              - /url: /uk/info/trip-budget
          - heading "Основні витрати" [level=3] [ref=f3e247]
          - generic [ref=f3e248]:
            - generic [ref=f3e249]:
              - generic [ref=f3e250]: Перельоти (PLN)
              - generic [ref=f3e251]: На особу, за всі заплановані ділянки
              - textbox "Перельоти (PLN)" [ref=f3e252]:
                - /placeholder: Невідомо
                - text: "200.25"
              - generic [ref=f3e253]:
                - text: Скопійований запис ціни перельоту — не ціна в реальному часі
                - group [ref=f3e254]:
                  - generic "Походження суми" [ref=f3e255] [cursor=pointer]
            - generic [ref=f3e256]:
              - generic [ref=f3e257]: Як указано ціну проживання?
              - combobox "Як указано ціну проживання?" [ref=f3e258]:
                - option "За ніч — уся група" [selected]
                - option "За все перебування — уся група"
              - generic [ref=f3e259]:
                - generic [ref=f3e260]: Проживання (PLN)
                - generic [ref=f3e261]: За ніч для всієї групи (усі номери)
                - textbox "Проживання (PLN)" [ref=f3e262]:
                  - /placeholder: Невідомо
                - generic [ref=f3e263]: Невідомо
              - generic [ref=f3e264]: Кожне поле зберігає свою суму. До підсумку входить лише вибраний варіант; після зміни дат або кількості гостей перевірте ціну знову.
            - generic [ref=f3e265]:
              - generic [ref=f3e266]: Трансфери та транспорт (PLN)
              - generic [ref=f3e267]: "Усього для групи: обидва аеропорти, зворотні трансфери та поїздки, не вказані окремо"
              - textbox "Трансфери та транспорт (PLN)" [ref=f3e268]:
                - /placeholder: Невідомо
              - generic [ref=f3e269]: Невідомо
            - generic [ref=f3e270]:
              - generic [ref=f3e271]: Харчування та щоденні витрати (PLN)
              - generic [ref=f3e272]: На особу за день
              - textbox "Харчування та щоденні витрати (PLN)" [ref=f3e273]:
                - /placeholder: Невідомо
              - generic [ref=f3e274]: Невідомо
          - group [ref=f3e275]:
            - 'generic "Додаткові витрати: багаж, міський транспорт, розваги та резерв" [ref=f3e276] [cursor=pointer]'
        - status [ref=f3e277]:
          - heading "Орієнтовний бюджет усієї групи (PLN)" [level=3] [ref=f3e278]
          - paragraph [ref=f3e279]: Виправте позначені поля та дати для розрахунку бюджету.
        - paragraph [ref=f3e280]: Це ваш план витрат, а не пропозиція чи бронювання. Перевірте остаточні ціни у продавців. Чернетка доступна лише в цьому браузері; видалення даних сайту видалить і чернетки.
        - button "Очистити калькулятор" [ref=f3e281] [cursor=pointer]
        - region "Зберегти подорож і поділитися" [ref=f3e282]:
          - heading "Збережіть план подорожі" [level=3] [ref=f3e283]
          - paragraph [ref=f3e284]: Збережено лише в цьому профілі браузера на цьому пристрої. Видалення даних сайту видалить плани. Збережіть посилання, щоб відкрити копію в іншому місці.
          - paragraph [ref=f3e285]: Збереження відкриває план зі списку. Натисніть «Оновити план», щоб зберегти в ньому подальші правки. Надсилання посилання створює незалежну копію.
          - paragraph [ref=f3e286]: Посилання містить маршрут, дати, кількість людей і введений бюджет. Будь-який отримувач може побачити ці дані. Це копія плану, а не актуальна пропозиція продавця.
          - paragraph [ref=f3e287]: "Нові посилання зберігають план після # в адресі, поза запитом до сайту. Посилання не зашифроване: кожен отримувач може прочитати план. Браузер і сервіс, куди ви вставите посилання, можуть зберегти повну адресу."
          - paragraph [ref=f3e288]: У цій версії є незбережені правки.
          - generic [ref=f3e289]:
            - button "Зберегти подорож" [ref=f3e290] [cursor=pointer]
            - button "Поділитися" [ref=f3e291] [cursor=pointer]
            - link "Збережені подорожі" [ref=f3e292] [cursor=pointer]:
              - /url: /uk/saved
          - paragraph
      - generic [ref=f3e293]:
        - heading "Ціна на тлі історії" [level=2] [ref=f3e295]
        - generic [ref=f3e296]:
          - group "Ціна на тлі історії" [ref=f3e297]:
            - paragraph [ref=f3e298]:
              - strong [ref=f3e299]: Ціна на 49,75 PLN нижча за медіану вибірки.
              - text: "Медіана: 250,00 PLN."
            - paragraph [ref=f3e300]: "Спостережень: 24. Поріг порівняння: 5; вибірка не охоплює весь ринок."
            - paragraph [ref=f3e301]:
              - text: "Перший запис цієї ціни в HopTrip:"
              - time [ref=f3e302]: чт, 5 лист. 2026 р., 08:54
              - text: (час у Польщі).
            - paragraph [ref=f3e303]: Наявність місць і остаточну ціну уточнюйте в партнера. Перевірки в реальному часі немає.
          - paragraph [ref=f3e304]: Ми оцінюємо цінову пропозицію за збереженими даними. Результат не оцінює авіакомпанію, комфорт чи ймовірність купівлі.
          - group [ref=f3e305]:
            - generic "Як працює допоміжний бал сортування?" [ref=f3e306] [cursor=pointer]
          - link "Повна методика порівняння цін →" [ref=f3e307] [cursor=pointer]:
            - /url: /uk/info/price-comparison
  - contentinfo [ref=f3e308]:
    - generic [ref=f3e309]:
      - generic [ref=f3e310]: HopTrip.
      - paragraph [ref=f3e311]: "Партнерське посилання: ми можемо отримати комісію після бронювання. Ми не продаємо квитки."
    - navigation "Про сервіс" [ref=f3e312]:
      - link "Як працює HopTrip" [ref=f3e313] [cursor=pointer]:
        - /url: /uk/info
      - link "City break" [ref=f3e314] [cursor=pointer]:
        - /url: /uk/city-break
      - link "Перельоти на вихідні" [ref=f3e315] [cursor=pointer]:
        - /url: /uk/tanie-loty-na-weekend
      - link "Перельоти з Варшави" [ref=f3e316] [cursor=pointer]:
        - /url: /uk/from/warszawa
      - link "Збережені подорожі" [ref=f3e317] [cursor=pointer]:
        - /url: /uk/saved
      - link "Сповіщення про перельоти" [ref=f3e318] [cursor=pointer]:
        - /url: /uk/alerts
      - link "Про HopTrip" [ref=f3e319] [cursor=pointer]:
        - /url: /uk/info/about
      - link "Контакти" [ref=f3e320] [cursor=pointer]:
        - /url: /uk/info/contact
      - link "Конфіденційність" [ref=f3e321] [cursor=pointer]:
        - /url: /uk/info/privacy
      - link "Умови використання" [ref=f3e322] [cursor=pointer]:
        - /url: /uk/info/terms
      - link "Партнерство" [ref=f3e323] [cursor=pointer]:
        - /url: /uk/info/partners
    - button "Налаштування конфіденційності" [ref=f3e325] [cursor=pointer]
  - alert [ref=f3e326]
```

# Test source

```ts
  1   | import {test,expect} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {localizedHref} from '../src/lib/i18n/routing';
  4   | import {tripText} from '../src/lib/i18n/trip-copy';
  5   | import {qualityReasonText} from '../src/lib/i18n/quality-copy';
  6   | import {savedPlansKey as savedTripsKey} from '../src/lib/saved-plans';
  7   | import {searchReturnPath} from '../src/lib/search-context';
  8   | import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
  9   | 
  10  | test.beforeEach(async({page})=>{
  11  |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  12  | });
  13  | test.afterEach(async({request})=>{
  14  |  await request.post('http://127.0.0.1:8125/__test__/quality?scenario=reset');
  15  |  await request.post('http://127.0.0.1:8125/__test__/compact-card?scenario=normal');
  16  | });
  17  | 
  18  | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: flight decision precedes planning without hiding critical warnings or losing the shared plan`,async({page,request},info)=>{
  19  |  test.setTimeout(180000);
  20  |  await page.setViewportSize(info.project.name==='desktop'?{width:1366,height:900}:{width:390,height:844});
  21  |  const t=(key:Parameters<typeof tripText>[1])=>tripText(locale,key);
  22  |  const nav=page.locator('.trip-navigation'),summary=page.locator('.detail-summary'),booking=page.locator('#trip-booking');
  23  |  for(const scenario of ['complete','partial','critical']){
  24  |   const response=await request.post(`http://127.0.0.1:8125/__test__/quality?scenario=${scenario}`);
  25  |   expect(response.ok()).toBe(true);const {quality}=await response.json();
  26  |   await page.goto(localizedHref('/deals/browser-13?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
  27  |   await expect(page.locator('h1')).toHaveCount(1);
  28  |   await expect(summary.locator('.deal-price')).toBeVisible();
  29  |   await expect(summary.locator('h2')).toHaveText(t('Szczegóły lotu'));
  30  |   await expect(booking.getByRole('heading',{level:2})).toHaveText(t('Przejście do partnera'));
  31  |   await expect(summary.locator('.trip-details')).not.toHaveAttribute('open','');
  32  |   await expect(summary.locator('.price-assessment')).toHaveCount(0);
  33  |   await expect(summary.locator('.price-freshness')).toHaveCount(1);
  34  |   await expect(page.locator('.price-assessment')).toHaveCount(1);
  35  |   const warning=summary.locator('.flight-quality');
  36  |   if(scenario==='complete')await expect(warning).toHaveCount(0);
  37  |   else await expect(warning).toHaveAttribute('data-quality',quality.status);
  38  |   if(scenario==='critical'){
  39  |    await expect(warning.locator('details')).toHaveCount(0);
  40  |    for(const reason of quality.reasons)await expect(warning.getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  41  |   }
  42  |   const ids=['trip-flight','trip-booking','accommodation'];
  43  |   if(await page.locator('#destination-activities').count())ids.push('destination-activities');
  44  |   if(await page.locator('#trip-events').count())ids.push('trip-events');
  45  |   ids.push('calculator','trip-save','score');
  46  |   expect(await page.locator(ids.map(id=>'#'+id).join(',')).evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(ids);
  47  |   await expect(page.locator('.offer-detail > section').last()).toHaveAttribute('id','score');
  48  |   const targets=await nav.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href')!));
  49  |   for(const target of targets){await expect(page.locator(target)).toHaveCount(1);await expect(page.locator(target)).toHaveAttribute('tabindex','-1');}
  50  |   await nav.locator('a[href="#trip-booking"]').focus();await page.keyboard.press('Enter');
  51  |   await expect(booking).toBeFocused();
  52  |   await expect(booking.locator('a.cta')).toHaveCount(0);
  53  |   await expect(booking.locator('.partner-unavailable a')).toBeInViewport();
  54  |   expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  55  |   if(locale==='pl'&&scenario==='complete'){
  56  |    await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
  57  |    await page.screenshot({path:info.outputPath('detail-first-screen.png'),scale:'css'});
  58  |    await page.locator('.detail-layout').screenshot({path:info.outputPath('flight-decision.png'),scale:'css'});
  59  |   }
  60  |   if(locale==='pl'&&scenario==='critical')await warning.screenshot({path:info.outputPath('critical-warnings.png'),scale:'css'});
  61  |  }
  62  |  // The schedule fixture has no approved seller link. Use the approved flight
  63  |  // fixture for CTA visibility and the existing planning/share journey.
  64  |  await page.goto(localizedHref('/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));
  65  |  await nav.locator('a[href="#trip-booking"]').focus();await page.keyboard.press('Enter');
  66  |  await expect(booking).toBeFocused();await expect(booking.locator('a.cta')).toBeInViewport();
  67  |  await page.evaluate(()=>scrollTo(0,0));
> 68  |  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
      |                                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  69  |  if(locale==='pl')await expect(summary.locator('.deal-price')).toBeInViewport({ratio:1});
  70  |  if(info.project.name==='desktop')await expect(booking.locator('a.cta')).toBeInViewport({ratio:1});
  71  |  if(locale==='pl'){
  72  |   await page.screenshot({path:info.outputPath('available-first-screen.png'),scale:'css'});
  73  |   await page.locator('.detail-layout').screenshot({path:info.outputPath('available-flight-decision.png'),scale:'css'});
  74  |  }
  75  |  // Native anchor focus and existing detail disclosure are still usable by keyboard.
  76  |  await nav.locator('a[href="#trip-flight"]').focus();await page.keyboard.press('Enter');
  77  |  await expect(page.locator('#trip-flight')).toBeFocused();
  78  |  await summary.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');
  79  |  await expect(summary.locator('.flight-facts')).toBeVisible();
  80  |  await nav.locator('a[href="#score"]').focus();await page.keyboard.press('Enter');
  81  |  await expect(page.locator('#score')).toBeFocused();
  82  |  await expect(page.locator('#score .score-sum')).not.toBeVisible();
  83  |  await expect(page.locator('.back-link')).toHaveAttribute('href',localizedHref(searchReturnPath('/deals?origin=WRO&sort=price&offset=12'),locale));
  84  |  // These are existing planning functions, exercised after their sections move.
  85  |  const flight=booking.locator('a.cta'),original=await flight.getAttribute('href');
  86  |  await page.locator('#stay-checkin').fill('2030-05-01');await page.locator('#stay-checkout').fill('2030-05-04');
  87  |  await page.locator('#stay-adults').fill('2');
  88  |  await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('1000');
  89  |  await expect(page.locator('#budget-people')).toHaveValue('2');await expect(page.locator('#budget-nights')).toHaveValue('3');
  90  |  const stay=page.locator('#accommodation a[rel*="sponsored"]');
  91  |  expect(Object.fromEntries(new URL((await stay.getAttribute('href'))!).searchParams)).toMatchObject({adults:'2',checkin:'2030-05-01',checkout:'2030-05-04',aid:'hoptrip',campaign:'hoptrip_accommodation'});
  92  |  await expect(flight).toHaveAttribute('href',original!);
  93  |  await nav.locator('a[href="#trip-save"]').focus();await page.keyboard.press('Enter');
  94  |  await expect(page.locator('#trip-save')).toBeFocused();
  95  |  await page.getByRole('button',{name:t('Zapisz wyjazd'),exact:true}).click();
  96  |   await expect(page).toHaveURL(/\/trip#local=[0-9a-f-]{36}$/);
  97  |   await expect(page.getByRole('button',{name:planEditorCopy[locale].update,exact:true})).toBeDisabled();
  98  |  await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'null')?.plans.length??0,savedTripsKey)).toBe(1);
  99  |  await page.getByRole('button',{name:t('Udostępnij'),exact:true}).click();
  100 |  const shared=await page.locator('#trip-share-link').inputValue();
  101 |  await page.goto(shared);await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
  102 |  await expect(page.locator('#stay-adults')).toHaveValue('2');
  103 |  await expect(page.locator('.trip-navigation a[href="#trip-booking"],.trip-navigation a[href="#score"]')).toHaveCount(0);
  104 |  await page.reload();await expect(page.locator('#budget-hotel_total')).toHaveValue('1000');
  105 |  await page.setViewportSize({width:320,height:844});
  106 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  107 | });
  108 | 
  109 | test('critical flight detail and navigation fit 320px in every locale',async({page,request},info)=>{
  110 |  test.setTimeout(120000);
  111 |  await page.setViewportSize({width:320,height:844});
  112 |  const response=await request.post('http://127.0.0.1:8125/__test__/quality?scenario=critical');
  113 |  expect(response.ok()).toBe(true);const {quality}=await response.json();
  114 |  for(const locale of ['pl','en','ru','uk'] as const){
  115 |   await page.goto(localizedHref('/deals/browser-13',locale));
  116 |   const warning=page.locator('.detail-summary .flight-quality');
  117 |   await expect(warning.locator('details')).toHaveCount(0);
  118 |   for(const reason of quality.reasons)await expect(warning.getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  119 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  120 |   const sizes=await page.locator('.trip-navigation a').evaluateAll(links=>links.map(link=>link.getBoundingClientRect().height));
  121 |   expect(sizes.every(height=>height>=44)).toBe(true);
  122 |   expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  123 |   if(locale==='pl')await page.locator('.detail-layout').screenshot({path:info.outputPath('critical-detail-320.png'),scale:'css'});
  124 |  }
  125 | });
  126 | 
```