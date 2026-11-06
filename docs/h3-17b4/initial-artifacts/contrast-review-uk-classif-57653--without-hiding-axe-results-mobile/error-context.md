# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contrast-review.spec.ts >> uk: classify every contrast review item without hiding axe results
- Location: tests\contrast-review.spec.ts:19:56

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=f6e1]:
  - link "Перейти до вмісту" [ref=f6e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f6e3]:
    - link "HopTrip — головна" [ref=f6e4] [cursor=pointer]:
      - /url: /uk
      - generic [aria-hidden] [ref=f6e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f6e6]: .
    - navigation "Основна навігація" [ref=f6e7]:
      - link "Недорогі перельоти" [ref=f6e8] [cursor=pointer]:
        - /url: /uk/deals
      - link "На вихідні" [ref=f6e9] [cursor=pointer]:
        - /url: /uk/tanie-loty-na-weekend
      - link "Напрямки" [ref=f6e10] [cursor=pointer]:
        - /url: /uk/destinations
      - link "Збережене" [ref=f6e11] [cursor=pointer]:
        - /url: /uk/saved
      - link "Калькулятор бюджету" [ref=f6e12] [cursor=pointer]:
        - /url: /uk/info/trip-budget
    - navigation "Мова" [ref=f6e13]:
      - link "Polski" [ref=f6e14] [cursor=pointer]:
        - /url: /deals/browser-deal
      - link "Русский" [ref=f6e15] [cursor=pointer]:
        - /url: /ru/deals/browser-deal
      - link "English" [ref=f6e16] [cursor=pointer]:
        - /url: /en/deals/browser-deal
      - link "Українська" [ref=f6e17] [cursor=pointer]:
        - /url: /uk/deals/browser-deal
  - main [ref=f6e19]:
    - link "← Актуальні пропозиції" [ref=f6e20] [cursor=pointer]:
      - /url: /uk/deals
    - article [ref=f6e21]:
      - generic [ref=f6e22]:
        - paragraph [ref=f6e23]: В один бік
        - heading [level=1] [ref=f6e24]:
          - text: Вроцлав (WRO) → Барселона
          - img "Іспанія" [ref=f6e25]
        - paragraph [ref=f6e26]: "Дати вильотів: сб, 5 груд. 2026 р."
      - navigation "Розділи плану подорожі" [ref=f6e27]:
        - link "Переліт" [ref=f6e28] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "До партнера" [ref=f6e29] [cursor=pointer]:
          - /url: "#trip-booking"
        - link "Проживання" [ref=f6e30] [cursor=pointer]:
          - /url: "#accommodation"
        - link "Пам’ятки" [ref=f6e31] [cursor=pointer]:
          - /url: "#destination-activities"
        - link "Події" [ref=f6e32] [cursor=pointer]:
          - /url: "#trip-events"
        - link "Бюджет" [ref=f6e33] [cursor=pointer]:
          - /url: "#calculator"
        - link "Зберегти" [ref=f6e34] [cursor=pointer]:
          - /url: "#trip-save"
        - link "Порівняння ціни" [ref=f6e35] [cursor=pointer]:
          - /url: "#score"
      - generic [ref=f6e36]:
        - region "Ціна перельоту" [ref=f6e37]:
          - paragraph [ref=f6e38]: за особу · PLN
          - paragraph [ref=f6e39]:
            - text: 200,25 PLN
            - 'generic "Приблизно 46 EUR. Середній курс NBP від чт, 5 лист. 2026 р.: 1 EUR = 4,3916 PLN. Курс під час оплати може відрізнятися." [ref=f6e40]':
              - generic [aria-hidden] [ref=f6e41]: ≈ 46 EUR
            - generic [ref=f6e43]: за особу · в один бік
          - generic [ref=f6e44]:
            - paragraph [ref=f6e45]:
              - text: "Перший запис цієї ціни в HopTrip:"
              - time [ref=f6e46]: чт, 5 лист. 2026 р., 14:15
              - text: (час у Польщі).
            - paragraph [ref=f6e47]: Наявність місць і остаточну ціну уточнюйте в партнера. Перевірки в реальному часі немає.
            - group [ref=f6e48]:
              - generic "Походження ціни та строк показу" [ref=f6e49] [cursor=pointer]
          - paragraph [ref=f6e50]:
            - strong [ref=f6e51]: Ціна на 49,75 PLN нижча за медіану вибірки.
            - text: "Спостережень: 24. Вибірка напрямку, не однакових тарифів або всього ринку."
          - heading "Деталі перельоту" [level=2] [ref=f6e52]
          - generic [ref=f6e53]:
            - note [ref=f6e54]:
              - strong [ref=f6e55]: Перевірте маршрут перед вибором
              - paragraph [ref=f6e56]: Дані маршруту джерела не підтверджені.
              - list
              - paragraph [ref=f6e57]: Повнота даних не підтверджує наявність у продавця.
            - paragraph [ref=f6e58]:
              - strong [ref=f6e59]: Виліт
              - text: · аеропорт потрібно уточнити → аеропорт потрібно уточнити · час невідомий
              - generic [ref=f6e60]: Пересадки уточнюйте в партнера
            - paragraph [ref=f6e62]: Час і вартість доїзду невідомі — перевірте транспорт на дату подорожі.
            - paragraph [ref=f6e63]: "Виліт: Уточніть авіакомпанію"
          - paragraph [ref=f6e64]: Ціну вказано за переліт. Проживання не включено.
          - paragraph [ref=f6e65]: Багаж слід уточнити
          - group [ref=f6e66]:
            - generic "Повні дані рейсу та багаж" [ref=f6e67] [cursor=pointer]
        - region [ref=f6e68]:
          - heading "Перехід до партнера" [level=2] [ref=f6e69]
          - generic [ref=f6e70]: Партнерство
          - generic [ref=f6e71]:
            - paragraph [ref=f6e72]:
              - text: 200,25 PLN
              - 'generic "Приблизно 46 EUR. Середній курс NBP від чт, 5 лист. 2026 р.: 1 EUR = 4,3916 PLN. Курс під час оплати може відрізнятися." [ref=f6e73]':
                - generic [aria-hidden] [ref=f6e74]: ≈ 46 EUR
              - generic [ref=f6e76]: за особу · в один бік
            - paragraph [ref=f6e77]:
              - strong [ref=f6e78]: Вкажіть у партнера 1 дорослого.
              - text: Посилання відкриває пропозицію партнера. Змінені дати й кількість пасажирів із плану не передаються. Перевірте дати й ціну в партнера.
            - link "Переглянути переліт — Fixture program" [ref=f6e79] [cursor=pointer]:
              - /url: http://127.0.0.1:8125/go/browser-deal/flight
          - paragraph [ref=f6e80]: "Партнерське посилання: ми можемо отримати комісію після бронювання. Ми не продаємо квитки."
      - region [ref=f6e81]:
        - heading "Знайти житло — Барселона" [level=2] [ref=f6e82]
        - paragraph [ref=f6e83]: Житло бронюється окремо від перельоту. Дати проживання та дорослі спільні з бюджетом; дати перельоту не змінюються.
        - paragraph [ref=f6e84]: Дати проживання обираються окремо від дат перельоту. Перевірте місцеві дати прильоту та зворотного вильоту.
        - group [ref=f6e85]:
          - generic "Як узгодити дати проживання з перельотом?" [ref=f6e86] [cursor=pointer]
        - paragraph [ref=f6e87]: Це переліт в один бік — вкажіть дату виїзду.
        - group "Дати проживання та дорослі" [ref=f6e88]:
          - generic [ref=f6e90]:
            - generic [ref=f6e91]:
              - generic [ref=f6e92]: Заїзд
              - textbox "Заїзд" [invalid] [ref=f6e93]: 2026-12-05
            - generic [ref=f6e94]:
              - generic [ref=f6e95]: Виїзд
              - textbox "Виїзд" [invalid] [ref=f6e96]
              - status [ref=f6e97]: Виберіть дату виїзду пізніше дати заїзду.
            - generic [ref=f6e98]:
              - generic [ref=f6e99]: Дорослі
              - spinbutton "Дорослі" [ref=f6e100]: "1"
        - paragraph [ref=f6e102]:
          - strong [ref=f6e103]: Барселона
          - text: ": сб, 5 груд. 2026 р. – Оберіть дату · дорослих: 1."
        - paragraph [ref=f6e104]: Ціну й наявність житла перевірте у Stay22. HopTrip не отримує котирування; суми в бюджеті вводяться вручну.
        - paragraph [ref=f6e105]: Партнерське посилання — ми можемо отримати комісію. Передаємо лише дорослих; дітей та їхній вік вкажіть у партнера. Перевірте дати, гостей, ціну й умови скасування.
        - group [ref=f6e106]:
          - generic "Як додати вартість житла до плану?" [ref=f6e107] [cursor=pointer]
        - link "Додати вартість житла до бюджету подорожі" [ref=f6e108] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=f6e109]:
        - paragraph [ref=f6e110]: Ідеї для подорожі · Барселона
        - heading "Музеї та пам’ятки" [level=2] [ref=f6e111]
        - paragraph [ref=f6e112]: Квитки купують окремо. Наявність на дати подорожі перевір у продавця або на офіційному сайті пам’ятки.
        - list [ref=f6e113]:
          - listitem [ref=f6e114]:
            - generic [ref=f6e115]: Архітектура
            - heading "Casa Batlló — квиток Blue" [level=3] [ref=f6e116]
            - paragraph [ref=f6e117]: Інтер’єри будинку, спроєктованого Гауді, аудіогід і простір Gaudí Cube.
            - paragraph [ref=f6e118]:
              - strong [ref=f6e119]: "Для кого:"
              - text: Для тих, хто цікавиться архітектурою Гауді та відвідуванням з аудіогідом.
            - paragraph [ref=f6e120]:
              - strong [ref=f6e121]: "Тривалість відвідування:"
              - text: Приблизно 1 година для варіанта Blue; без дороги й очікування входу.
            - paragraph [ref=f6e122]: Варіант Blue не включає терасу на даху, планшет VR або вхід без черги. Перевірте час входу й мову аудіогіда.
            - generic [ref=f6e123]:
              - paragraph [ref=f6e124]: Ціну потрібно уточнити в Tiqets
              - paragraph [ref=f6e125]: Партнерське посилання — ми можемо отримати комісію за купівлю.
              - 'link "Уточнити дати й ціну в Tiqets: Casa Batlló — квиток Blue (нова вкладка)" [ref=f6e126] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Уточнити дати й ціну
              - paragraph [ref=f6e127]:
                - link "Джерело тривалості відвідування (нова вкладка)" [ref=f6e128] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=f6e129]:
            - generic [ref=f6e130]: Океанаріум
            - heading "Aquarium Barcelona — вхідний квиток" [level=3] [ref=f6e131]
            - paragraph [ref=f6e132]: "Морський світ у Port Vell: акваріуми й виставки про життя під водою."
            - paragraph [ref=f6e133]:
              - strong [ref=f6e134]: "Для кого:"
              - text: Для родин і тих, хто цікавиться морською природою; варіант відвідування в приміщенні.
            - paragraph [ref=f6e135]:
              - strong [ref=f6e136]: "Тривалість відвідування:"
              - text: Орієнтовно 1,5–2 години на відвідування; без дороги й черги.
            - paragraph [ref=f6e137]: Перевірте дату відвідування, години роботи й правила дитячих квитків.
            - generic [ref=f6e138]:
              - paragraph [ref=f6e139]: Ціну потрібно уточнити в Tiqets
              - paragraph [ref=f6e140]: Партнерське посилання — ми можемо отримати комісію за купівлю.
              - 'link "Уточнити дати й ціну в Tiqets: Aquarium Barcelona — вхідний квиток (нова вкладка)" [ref=f6e141] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Уточнити дати й ціну
              - paragraph [ref=f6e142]:
                - link "Джерело тривалості відвідування (нова вкладка)" [ref=f6e143] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=f6e144]:
            - generic [ref=f6e145]: Природа · безкоштовний вхід
            - heading "Hivernacle — оранжерея в парку Ciutadella" [level=3] [ref=f6e146]
            - paragraph [ref=f6e147]: Історична оранжерея з колекціями рослин у парку Ciutadella.
            - paragraph [ref=f6e148]:
              - strong [ref=f6e149]: "Для кого:"
              - text: Для любителів рослин і спокійної прогулянки серед зелені.
            - paragraph [ref=f6e150]: Безкоштовний вхід стосується самостійного відвідування. Перевірте години й закриття; екскурсії з гідом мають окремі правила та бронювання.
            - generic [ref=f6e151]:
              - paragraph [ref=f6e152]: "Самостійне відвідування: за офіційним сайтом вхід безкоштовний."
              - 'link "Уточнити правила відвідування: Hivernacle — оранжерея в парку Ciutadella (нова вкладка)" [ref=f6e153] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Уточнити правила відвідування
        - paragraph [ref=f6e154]: Пам’ятки не включені у вартість перельоту. До купівлі перевір склад квитка, пільги й умови скасування. У дні подорожі врахуй час перельотів і трансферів.
        - paragraph [ref=f6e155]: Зміни дат і складу групи в плані автоматично не передаються за цим посиланням. Перевірте дату, учасників і ціну в партнера.
        - paragraph [ref=f6e156]: Описи й правила перевірені пн, 12 жовт. 2026 р.. Це огляд джерел, а не підтвердження наявності квитків на дати подорожі.
        - paragraph [ref=f6e157]: У калькуляторі зазнач загальну вартість вибраних пам’яток у PLN на людину за весь час проживання. Якщо ціни квитків різняться, використовуй середню на людину. Безкоштовний вхід не означає, що дорога теж безкоштовна.
        - link "Урахувати пам’ятки в бюджеті" [ref=f6e158] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=f6e159]:
        - generic [ref=f6e160]:
          - generic [ref=f6e161]:
            - heading "Події під час подорожі" [level=2] [ref=f6e162]
            - paragraph [ref=f6e163]: Концерти, спорт і культура в місті призначення. Квитки на події купуються окремо.
          - generic [ref=f6e164]: Ticketmaster
        - paragraph [ref=f6e165]:
          - generic [ref=f6e166]: Ваша подорож · Барселона
          - strong [ref=f6e167]: 5 груд. 2026 р. – Дати не задано
        - generic [ref=f6e168]:
          - strong [ref=f6e169]: Дати подорожі
          - button "Інші дати" [ref=f6e170] [cursor=pointer]
        - paragraph [ref=f6e171]: Дати спільні з житлом і бюджетом. Зміни автоматично оновлюють події. Це дати плану — перевірте їх відповідність розкладу перельоту.
        - generic [ref=f6e172]:
          - generic [ref=f6e173]:
            - text: З
            - textbox "З" [invalid] [ref=f6e174]: 2026-12-05
          - generic [ref=f6e175]:
            - text: До
            - textbox "До" [invalid] [ref=f6e176]
          - generic [ref=f6e177]:
            - text: Категорія
            - combobox "Категорія" [ref=f6e178]:
              - option "Усі" [selected]
              - option "Музика"
              - option "Спорт"
              - option "Культура"
              - option "Інше"
          - button "Знайти події" [ref=f6e179] [cursor=pointer]
        - generic [ref=f6e181]:
          - text: Сумісність із перельотом
          - combobox "Сумісність із перельотом" [ref=f6e182]:
            - option "Усі події" [selected]
            - option "Може підійти до перельоту"
        - paragraph [ref=f6e183]: Цей режим приховує лише явні конфлікти з перельотом. Події з малим запасом чи неповними даними залишаються видимими. Формальності в аеропорту та дорогу до місця потрібно перевірити; відвідування не гарантується.
        - status [ref=f6e184]:
          - paragraph [ref=f6e185]: Виберіть коректний період до 31 дня, не більш ніж на 365 днів уперед.
        - group [ref=f6e186]:
          - generic "Перед покупкою" [ref=f6e187] [cursor=pointer]
        - paragraph [ref=f6e188]: "Партнерські посилання: HopTrip може отримати комісію від покупки. Наявність квитків і правила входу уточнюйте у продавця."
        - paragraph [ref=f6e189]: Зміни дат і складу групи в плані автоматично не передаються за цим посиланням. Перевірте дату, учасників і ціну в партнера.
      - navigation "Спланувати перебування" [ref=f6e190]:
        - heading "Спланувати перебування" [level=2] [ref=f6e191]
        - list [ref=f6e192]:
          - listitem [ref=f6e193]:
            - 'link "Барселона: BCN, Жирона чи Реус" [ref=f6e194] [cursor=pointer]':
              - /url: /uk/info/barcelona-airports
          - listitem [ref=f6e195]:
            - 'link "Барселона за 3 дні: план огляду й бюджет подорожі" [ref=f6e196] [cursor=pointer]':
              - /url: /uk/info/barcelona-3-days
      - region [ref=f6e197]:
        - heading "Калькулятор бюджету подорожі" [level=2] [ref=f6e198]
        - paragraph [ref=f6e199]: Введіть власні суми в PLN. Порожнє поле означає невідомі витрати; вкажіть 0, якщо витрат немає або їх уже враховано в іншому рядку.
        - paragraph [ref=f6e200]: Відома ціна перельоту копіюється з пропозиції на особу та покриває лише її ділянки. Додайте відсутній зворотний квиток до суми перельотів, якщо його немає у пропозиції; не рахуйте його повторно, якщо він уже включений. Це спостережена ціна, а не підтвердження бронювання. Решта сум — ваші оцінки або ціни, введені вручну; ми не перевіряємо їх у продавців.
        - group "Режим калькулятора" [ref=f6e201]:
          - button "Швидкий бюджет" [pressed] [ref=f6e202] [cursor=pointer]
          - button "Детальний бюджет" [ref=f6e203] [cursor=pointer]
        - paragraph [ref=f6e204]: Обидва режими враховують усі введені витрати та події. Перемикання зберігає суми. Розгорніть подробиці, щоб заповнити відсутні витрати.
        - group [ref=f6e205]:
          - generic "Як розраховуються витрати?" [ref=f6e206] [cursor=pointer]
        - paragraph [ref=f6e207]: Зміни зберігаються автоматично в цьому браузері, окремо для кожної пропозиції.
        - group "Ваш план подорожі" [ref=f6e208]:
          - generic [ref=f6e210]:
            - generic [ref=f6e211]:
              - generic [ref=f6e212]: Початок перебування (необов’язково)
              - textbox "Початок перебування (необов’язково)" [invalid] [ref=f6e213]: 2026-12-05
            - generic [ref=f6e214]:
              - generic [ref=f6e215]: Кінець перебування (необов’язково)
              - textbox "Кінець перебування (необов’язково)" [invalid] [ref=f6e216]
          - paragraph [ref=f6e217]: Дати перераховують ночі та дні витрат. Ці значення можна змінити вручну. Дати перебування також використовуються для пошуку житла. Дати пропозиції перельоту не змінюються.
          - paragraph [ref=f6e218]: "Укажіть обидві дати: кінець не може бути раніше початку; перебування — не більше 365 днів."
          - generic [ref=f6e219]:
            - generic [ref=f6e220]:
              - generic [ref=f6e221]: Кількість дорослих
              - generic [ref=f6e222]: Від 1 до 50 осіб
              - textbox "Кількість дорослих" [ref=f6e223]: "1"
            - generic [ref=f6e224]:
              - generic [ref=f6e225]: Кількість ночей
              - generic [ref=f6e226]: Від 0 до 365 ночей
              - textbox "Кількість ночей" [ref=f6e227]: "2"
            - generic [ref=f6e228]:
              - generic [ref=f6e229]: Кількість днів витрат
              - generic [ref=f6e230]: Від 1 до 365 днів, включно з днями прильоту та вильоту
              - textbox "Кількість днів витрат" [ref=f6e231]: "3"
          - paragraph [ref=f6e232]:
            - generic [ref=f6e233]:
              - checkbox "Усі мандрівники — дорослі" [checked] [ref=f6e234]
              - text: Усі мандрівники — дорослі
          - region [ref=f6e235]:
            - heading "Особисті профілі бюджету" [level=3] [ref=f6e236]
            - paragraph [ref=f6e237]: Це ваші припущення в PLN, а не середні ціни міста. Готових цін у профілях немає. Введіть діапазони або перенесіть свої суми. Введені витрати, зокрема 0, мають пріоритет.
            - group "Особисті профілі бюджету" [ref=f6e238]:
              - button "Ощадливо" [ref=f6e239] [cursor=pointer]
              - button "Стандартно" [ref=f6e240] [cursor=pointer]
              - button "Комфортно" [ref=f6e241] [cursor=pointer]
              - button "Без профілю" [pressed] [ref=f6e242] [cursor=pointer]
          - group [ref=f6e243]:
            - generic "Орієнтовні витрати на місці" [ref=f6e244] [cursor=pointer]
            - 'option "Барселона: T-casual, 10 поїздок, 1 зона — 13,00 EUR" [selected]'
          - paragraph [ref=f6e245]:
            - link "Повний посібник із бюджету подорожі" [ref=f6e246] [cursor=pointer]:
              - /url: /uk/info/trip-budget
          - heading "Основні витрати" [level=3] [ref=f6e247]
          - generic [ref=f6e248]:
            - generic [ref=f6e249]:
              - generic [ref=f6e250]: Перельоти (PLN)
              - generic [ref=f6e251]: На особу, за всі заплановані ділянки
              - textbox "Перельоти (PLN)" [ref=f6e252]:
                - /placeholder: Невідомо
                - text: "200.25"
              - generic [ref=f6e253]:
                - text: Скопійований запис ціни перельоту — не ціна в реальному часі
                - group [ref=f6e254]:
                  - generic "Походження суми" [ref=f6e255] [cursor=pointer]
            - generic [ref=f6e256]:
              - generic [ref=f6e257]: Як указано ціну проживання?
              - combobox "Як указано ціну проживання?" [ref=f6e258]:
                - option "За ніч — уся група" [selected]
                - option "За все перебування — уся група"
              - generic [ref=f6e259]:
                - generic [ref=f6e260]: Проживання (PLN)
                - generic [ref=f6e261]: За ніч для всієї групи (усі номери)
                - textbox "Проживання (PLN)" [ref=f6e262]:
                  - /placeholder: Невідомо
                - generic [ref=f6e263]: Невідомо
              - generic [ref=f6e264]: Кожне поле зберігає свою суму. До підсумку входить лише вибраний варіант; після зміни дат або кількості гостей перевірте ціну знову.
            - generic [ref=f6e265]:
              - generic [ref=f6e266]: Трансфери та транспорт (PLN)
              - generic [ref=f6e267]: "Усього для групи: обидва аеропорти, зворотні трансфери та поїздки, не вказані окремо"
              - textbox "Трансфери та транспорт (PLN)" [ref=f6e268]:
                - /placeholder: Невідомо
              - generic [ref=f6e269]: Невідомо
            - generic [ref=f6e270]:
              - generic [ref=f6e271]: Харчування та щоденні витрати (PLN)
              - generic [ref=f6e272]: На особу за день
              - textbox "Харчування та щоденні витрати (PLN)" [ref=f6e273]:
                - /placeholder: Невідомо
              - generic [ref=f6e274]: Невідомо
          - group [ref=f6e275]:
            - 'generic "Додаткові витрати: багаж, міський транспорт, розваги та резерв" [ref=f6e276] [cursor=pointer]'
        - status [ref=f6e277]:
          - heading "Орієнтовний бюджет усієї групи (PLN)" [level=3] [ref=f6e278]
          - paragraph [ref=f6e279]: Виправте позначені поля та дати для розрахунку бюджету.
        - paragraph [ref=f6e280]: Це ваш план витрат, а не пропозиція чи бронювання. Перевірте остаточні ціни у продавців. Чернетка доступна лише в цьому браузері; видалення даних сайту видалить і чернетки.
        - button "Очистити калькулятор" [ref=f6e281] [cursor=pointer]
        - region "Зберегти подорож і поділитися" [ref=f6e282]:
          - heading "Збережіть план подорожі" [level=3] [ref=f6e283]
          - paragraph [ref=f6e284]: Збережено лише в цьому профілі браузера на цьому пристрої. Видалення даних сайту видалить плани. Збережіть посилання, щоб відкрити копію в іншому місці.
          - paragraph [ref=f6e285]: Збереження відкриває план зі списку. Натисніть «Оновити план», щоб зберегти в ньому подальші правки. Надсилання посилання створює незалежну копію.
          - paragraph [ref=f6e286]: Посилання містить маршрут, дати, кількість людей і введений бюджет. Будь-який отримувач може побачити ці дані. Це копія плану, а не актуальна пропозиція продавця.
          - paragraph [ref=f6e287]: "Нові посилання зберігають план після # в адресі, поза запитом до сайту. Посилання не зашифроване: кожен отримувач може прочитати план. Браузер і сервіс, куди ви вставите посилання, можуть зберегти повну адресу."
          - paragraph [ref=f6e288]: У цій версії є незбережені правки.
          - generic [ref=f6e289]:
            - button "Зберегти подорож" [ref=f6e290] [cursor=pointer]
            - button "Поділитися" [ref=f6e291] [cursor=pointer]
            - link "Збережені подорожі" [ref=f6e292] [cursor=pointer]:
              - /url: /uk/saved
          - paragraph
      - generic [ref=f6e293]:
        - heading "Ціна на тлі історії" [level=2] [ref=f6e295]
        - generic [ref=f6e296]:
          - group "Ціна на тлі історії" [ref=f6e297]:
            - paragraph [ref=f6e298]:
              - strong [ref=f6e299]: Ціна на 49,75 PLN нижча за медіану вибірки.
              - text: "Медіана: 250,00 PLN."
            - paragraph [ref=f6e300]: "Спостережень: 24. Поріг порівняння: 5; вибірка не охоплює весь ринок."
            - paragraph [ref=f6e301]:
              - text: "Перший запис цієї ціни в HopTrip:"
              - time [ref=f6e302]: чт, 5 лист. 2026 р., 14:15
              - text: (час у Польщі).
            - paragraph [ref=f6e303]: Наявність місць і остаточну ціну уточнюйте в партнера. Перевірки в реальному часі немає.
          - paragraph [ref=f6e304]: Ми оцінюємо цінову пропозицію за збереженими даними. Результат не оцінює авіакомпанію, комфорт чи ймовірність купівлі.
          - group [ref=f6e305]:
            - generic "Як працює допоміжний бал сортування?" [ref=f6e306] [cursor=pointer]
          - link "Повна методика порівняння цін →" [ref=f6e307] [cursor=pointer]:
            - /url: /uk/info/price-comparison
  - contentinfo [ref=f6e308]:
    - generic [ref=f6e309]:
      - generic [ref=f6e310]: HopTrip.
      - paragraph [ref=f6e311]: "Партнерське посилання: ми можемо отримати комісію після бронювання. Ми не продаємо квитки."
    - navigation "Про сервіс" [ref=f6e312]:
      - link "Як працює HopTrip" [ref=f6e313] [cursor=pointer]:
        - /url: /uk/info
      - link "City break" [ref=f6e314] [cursor=pointer]:
        - /url: /uk/city-break
      - link "Перельоти на вихідні" [ref=f6e315] [cursor=pointer]:
        - /url: /uk/tanie-loty-na-weekend
      - link "Перельоти з Варшави" [ref=f6e316] [cursor=pointer]:
        - /url: /uk/from/warszawa
      - link "Збережені подорожі" [ref=f6e317] [cursor=pointer]:
        - /url: /uk/saved
      - link "Сповіщення про перельоти" [ref=f6e318] [cursor=pointer]:
        - /url: /uk/alerts
      - link "Про HopTrip" [ref=f6e319] [cursor=pointer]:
        - /url: /uk/info/about
      - link "Контакти" [ref=f6e320] [cursor=pointer]:
        - /url: /uk/info/contact
      - link "Конфіденційність" [ref=f6e321] [cursor=pointer]:
        - /url: /uk/info/privacy
      - link "Умови використання" [ref=f6e322] [cursor=pointer]:
        - /url: /uk/info/terms
      - link "Партнерство" [ref=f6e323] [cursor=pointer]:
        - /url: /uk/info/partners
    - button "Налаштування конфіденційності" [ref=f6e325] [cursor=pointer]
  - alert [ref=f6e326]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import {readFileSync,writeFileSync} from 'node:fs';
  4  | import config from '../playwright.config';
  5  | import {availableHref} from '../src/lib/i18n/routing';
  6  | 
  7  | test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Contrast review requires the isolated production runner.');
  8  | const paths=['/','/deals','/tanie-loty-na-weekend','/city-break','/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved','/info/trip-budget','/alerts'];
  9  | 
  10 | test.beforeEach(async({page,request},info)=>{
  11 |  const servers=config.webServer;if(!Array.isArray(servers))throw Error('Expected fixture servers');
  12 |  expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
  13 |  const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await(await request.get('/deals')).text()).toContain(build);
  14 |  await info.attach('execution-mode',{body:JSON.stringify({command:servers[1].command,nodeEnv:servers[1].env?.NODE_ENV,build}),contentType:'application/json'});
  15 |  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  16 |  await page.route('**/*',route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
  17 | });
  18 | 
  19 | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: classify every contrast review item without hiding axe results`,async({page},info)=>{
  20 |  test.setTimeout(240000);
  21 |  const width=info.project.name==='mobile'?390:1440;await page.setViewportSize({width,height:900});
  22 |  const records:unknown[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  23 |  try{
  24 |   for(const path of paths){
  25 |    const href=availableHref(path,locale);expect((await page.goto(href))?.status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
  26 |    const audit=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
  27 |    const reviews:unknown[]=[];
  28 |    for(const rule of audit.incomplete)for(const node of rule.nodes){
  29 |     expect(node.target).toHaveLength(1);expect(typeof node.target[0]).toBe('string');
  30 |     const target=String(node.target[0]),element=page.locator(target);await expect(element).toHaveCount(1);
  31 |     const keys=node.any.map(check=>(check.data as {messageKey?:string}|null)?.messageKey);
  32 |     if(keys.every(key=>key==='nonBmp')){
  33 |      await expect(element).toHaveAttribute('aria-hidden','true');expect((await element.textContent())?.trim()).toMatch(/^[→ⓘ]$/u);
  34 |      const control=element.locator('xpath=ancestor::*[self::a or self::button][1]');await expect(control).toHaveCount(1);await expect(control).toHaveAccessibleName(/\S/);
  35 |      reviews.push({target,classification:'DECORATIVE_WITH_NAMED_CONTROL',keys,html:node.html});
  36 |      continue;
  37 |     }
> 38 |     expect(keys.every(key=>key==='bgGradient'||key==='bgImage')).toBe(true);
     |                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  39 |     const bound=await element.evaluate(el=>{
  40 |      type Color=[number,number,number,number];
  41 |      const parse=(value:string):Color=>{
  42 |       const match=value.match(/^rgba?\(([^)]+)\)$/);if(!match)throw Error('Unsupported color:'+value);
  43 |       const channels=match[1].split(',').map(Number);if(channels.length===3)channels.push(1);
  44 |       if(channels.length!==4||channels.some(value=>!Number.isFinite(value)))throw Error('Invalid color:'+value);
  45 |       return channels as Color;
  46 |      };
  47 |      const layers:Element[]=[];for(let current:Element|null=el;current;current=current.parentElement)layers.unshift(current);
  48 |      let low:number[]|null=null,high:number[]|null=null;const evidence:unknown[]=[];
  49 |      for(const layer of layers){
  50 |       const style=getComputedStyle(layer);
  51 |       if(style.opacity!=='1'||style.filter!=='none'||style.mixBlendMode!=='normal'||style.textShadow!=='none')throw Error('Unsupported compositing:'+layer.tagName);
  52 |       const color=parse(style.backgroundColor);
  53 |       if(color[3]===1){low=color.slice(0,3);high=color.slice(0,3);}
  54 |       else if(color[3]>0){if(!low||!high)throw Error('No opaque canvas');low=low.map((value,i)=>color[i]*color[3]+value*(1-color[3]));high=high.map((value,i)=>color[i]*color[3]+value*(1-color[3]));}
  55 |       if(style.backgroundImage!=='none'){
  56 |        if(style.backgroundImage.startsWith('linear-gradient(')){
  57 |         const colors=[...style.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(match=>parse(match[0]));
  58 |         if(colors.length!==2||colors.some(color=>color[3]!==1)||style.backgroundImage.includes('in '))throw Error('Unsupported gradient:'+style.backgroundImage);
  59 |         low=[0,1,2].map(i=>Math.min(...colors.map(color=>color[i])));high=[0,1,2].map(i=>Math.max(...colors.map(color=>color[i])));
  60 |         evidence.push({kind:'OPAQUE_TWO_STOP_GRADIENT',image:style.backgroundImage});
  61 |        }else if(layer===el&&el.tagName==='SELECT'){
  62 |         const match=style.backgroundImage.match(/^url\("(data:image\/svg\+xml,[^"]+)"\)$/);if(!match)throw Error('Unsupported select image');
  63 |         const svg=new DOMParser().parseFromString(decodeURIComponent(match[1].split(',').slice(1).join(',')),'image/svg+xml').documentElement;
  64 |         const size=[Number(svg.getAttribute('width')),Number(svg.getAttribute('height'))];
  65 |         const right=style.backgroundPositionX.match(/^calc\(100% - ([\d.]+)px\)$/);
  66 |         const painted=style.backgroundSize.match(/^([\d.]+)px ([\d.]+)px$/);
  67 |         if(!right||!painted||style.appearance!=='none'||style.backgroundRepeat!=='no-repeat'||!size.every(value=>value>0)||svg.querySelectorAll('*').length!==1||svg.firstElementChild?.tagName!=='path')throw Error('Unsupported select arrow geometry');
  68 |         const reserved=Number.parseFloat(style.paddingRight),imageEnd=Number(right[1])+Number(painted[1]);if(reserved<imageEnd)throw Error('Arrow overlaps text content box');
  69 |         evidence.push({kind:'SVG_OUTSIDE_TEXT_CONTENT',intrinsicSize:size,paintedSize:[Number(painted[1]),Number(painted[2])],rightInset:Number(right[1]),reserved});
  70 |        }else if(layer===document.body){
  71 |         throw Error('Unsupported body image');
  72 |        }else throw Error('Unsupported background image:'+style.backgroundImage);
  73 |       }
  74 |      }
  75 |      if(!low||!high)throw Error('No opaque background bound');
  76 |      const foreground=parse(getComputedStyle(el).color);if(foreground[3]!==1)throw Error('Unsupported translucent foreground');
  77 |      const lum=(color:number[])=>color.slice(0,3).map(value=>{const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;}).reduce((value,channel,i)=>value+channel*[.2126,.7152,.0722][i],0);
  78 |      const fg=lum(foreground),lo=lum(low),hi=lum(high);const minimum=fg>=lo&&fg<=hi?1:Math.min((Math.max(fg,lo)+.05)/(Math.min(fg,lo)+.05),(Math.max(fg,hi)+.05)/(Math.min(fg,hi)+.05));
  79 |      return {foreground,low,high,minimum,evidence};
  80 |     });
  81 |     // Use the normal-text threshold even for large headings.
  82 |     expect(bound.minimum,target).toBeGreaterThanOrEqual(4.5);
  83 |     reviews.push({target,classification:'CONSERVATIVE_CONTRAST_BOUND',keys,...bound,html:node.html});
  84 |    }
  85 |    records.push({path,href,width,project:info.project.name,violations:audit.violations,incomplete:audit.incomplete,reviews});
  86 |    expect(audit.violations).toEqual([]);
  87 |    if(locale==='pl'&&path==='/deals/browser-deal')await page.locator('#trip-events').screenshot({path:info.outputPath('event-gradient.png'),animations:'disabled'});
  88 |   }
  89 |   expect(errors).toEqual([]);
  90 |  }finally{writeFileSync(info.outputPath('contrast-review.json'),JSON.stringify({locale,width,project:info.project.name,records,errors},null,2)+'\n');}
  91 | });
  92 | 
```