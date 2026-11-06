# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: consent-session-navigation.spec.ts >> uk: accepted session survives reload, Save auto-open and full navigation
- Location: tests\consent-session-navigation.spec.ts:50:56

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
- generic [active] [ref=f2e1]:
  - link "Перейти до вмісту" [ref=f2e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f2e3]:
    - link "HopTrip — головна" [ref=f2e4] [cursor=pointer]:
      - /url: /uk
      - generic [aria-hidden] [ref=f2e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f2e6]: .
    - navigation "Основна навігація" [ref=f2e7]:
      - link "Недорогі перельоти" [ref=f2e8] [cursor=pointer]:
        - /url: /uk/deals
      - link "На вихідні" [ref=f2e9] [cursor=pointer]:
        - /url: /uk/tanie-loty-na-weekend
      - link "Напрямки" [ref=f2e10] [cursor=pointer]:
        - /url: /uk/destinations
      - link "Збережене" [ref=f2e11] [cursor=pointer]:
        - /url: /uk/saved
      - link "Калькулятор бюджету" [ref=f2e12] [cursor=pointer]:
        - /url: /uk/info/trip-budget
    - navigation "Мова" [ref=f2e13]:
      - link "Polski" [ref=f2e14] [cursor=pointer]:
        - /url: /trip
      - link "Русский" [ref=f2e15] [cursor=pointer]:
        - /url: /ru/trip
      - link "English" [ref=f2e16] [cursor=pointer]:
        - /url: /en/trip
      - link "Українська" [ref=f2e17] [cursor=pointer]:
        - /url: /uk/trip
  - main [ref=f2e19]:
    - heading "Вроцлав → Барселона" [level=1] [ref=f2e20]
    - navigation "Розділи плану подорожі" [ref=f2e21]:
      - link "Переліт" [ref=f2e22] [cursor=pointer]:
        - /url: "#trip-flight"
      - link "Проживання" [ref=f2e23] [cursor=pointer]:
        - /url: "#accommodation"
      - link "Події" [ref=f2e24] [cursor=pointer]:
        - /url: "#trip-events"
      - link "Бюджет" [ref=f2e25] [cursor=pointer]:
        - /url: "#calculator"
      - link "Зберегти" [ref=f2e26] [cursor=pointer]:
        - /url: "#trip-save"
    - region "Переліт зі збереженого плану" [ref=f2e27]:
      - paragraph [ref=f2e28]: Ви редагуєте план із цього браузера. Оновлення змінює цей план; дублювання створює окремий. Надсилання посилання передає незалежну копію.
      - paragraph [ref=f2e29]: "Перебування у збереженому плані: ср, 1 трав. 2030 р. – пт, 3 трав. 2030 р.. Мандрівники в плані 1. Внесіть свої зміни в калькуляторі нижче."
      - paragraph [ref=f2e30]: "Збережена ціна перельоту за особу: 200,25 PLN. Дати збереженої пропозиції: нд, 6 груд. 2026 р.."
      - group [ref=f2e31]:
        - generic "Походження збереженої ціни" [ref=f2e32]
      - status [ref=f2e33]: Пропозиція є в каталозі, але збережені ціни й дати можуть відрізнятися. Уточніть поточні умови в партнера.
      - link "Переглянути пропозицію в каталозі" [ref=f2e34] [cursor=pointer]:
        - /url: /uk/deals/browser-deal
      - region "Розклад поточної пропозиції" [ref=f2e35]:
        - heading "Розклад поточної пропозиції" [level=2] [ref=f2e36]
        - paragraph [ref=f2e37]: Це розклад пропозиції в каталозі, а не підтвердження змінених дат вашого плану. Він не змінює дати проживання та збережені суми.
        - generic [ref=f2e38]:
          - note [ref=f2e39]:
            - strong [ref=f2e40]: Перевірте маршрут перед вибором
            - paragraph [ref=f2e41]: Дані маршруту джерела не підтверджені.
            - paragraph [ref=f2e42]: Повнота даних не підтверджує наявність у продавця.
          - paragraph [ref=f2e43]:
            - strong [ref=f2e44]: Виліт
            - text: · аеропорт потрібно уточнити → аеропорт потрібно уточнити · час невідомий
            - generic [ref=f2e45]: Пересадки уточнюйте в партнера
          - paragraph [ref=f2e47]: Час і вартість доїзду невідомі — перевірте транспорт на дату подорожі.
          - paragraph [ref=f2e48]: "Виліт: Уточніть авіакомпанію"
        - group [ref=f2e49]:
          - generic "Повний розклад і часові пояси" [ref=f2e50]
    - region [ref=f2e51]:
      - heading "Знайти житло — Барселона" [level=2] [ref=f2e52]
      - paragraph [ref=f2e53]: Житло бронюється окремо від перельоту. Дати проживання та дорослі спільні з бюджетом; дати перельоту не змінюються.
      - paragraph [ref=f2e54]: Дати проживання обираються окремо від дат перельоту. Перевірте місцеві дати прильоту та зворотного вильоту.
      - group [ref=f2e55]:
        - generic "Як узгодити дати проживання з перельотом?" [ref=f2e56] [cursor=pointer]
      - paragraph [ref=f2e57]: Це переліт в один бік — вкажіть дату виїзду.
      - group "Дати проживання та дорослі" [ref=f2e58]:
        - generic [ref=f2e60]:
          - generic [ref=f2e61]:
            - generic [ref=f2e62]: Заїзд
            - textbox "Заїзд" [ref=f2e63]: 2030-05-01
          - generic [ref=f2e64]:
            - generic [ref=f2e65]: Виїзд
            - textbox "Виїзд" [ref=f2e66]: 2030-05-03
          - generic [ref=f2e67]:
            - generic [ref=f2e68]: Дорослі
            - spinbutton "Дорослі" [ref=f2e69]: "1"
      - paragraph [ref=f2e70]: Перевірте знову ціни житла й перельоту для зміненого плану. Введені суми залишаються в бюджеті.
      - generic [ref=f2e71]:
        - paragraph [ref=f2e72]:
          - strong [ref=f2e73]: Барселона
          - text: ": ср, 1 трав. 2030 р. – пт, 3 трав. 2030 р. · 2 ночі · дорослих: 1."
        - link "Знайти житло через Stay22 (нова вкладка)" [ref=f2e74] [cursor=pointer]:
          - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2030-05-01&checkout=2030-05-03&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
      - paragraph [ref=f2e75]: Ціну й наявність житла перевірте у Stay22. HopTrip не отримує котирування; суми в бюджеті вводяться вручну.
      - paragraph [ref=f2e76]: Партнерське посилання — ми можемо отримати комісію. Передаємо лише дорослих; дітей та їхній вік вкажіть у партнера. Перевірте дати, гостей, ціну й умови скасування.
      - group [ref=f2e77]:
        - generic "Як додати вартість житла до плану?" [ref=f2e78] [cursor=pointer]
      - link "Додати вартість житла до бюджету подорожі" [ref=f2e79] [cursor=pointer]:
        - /url: "#budget-hotel-basis"
    - region [ref=f2e80]:
      - heading "Калькулятор бюджету подорожі" [level=2] [ref=f2e81]
      - paragraph [ref=f2e82]: Введіть власні суми в PLN. Порожнє поле означає невідомі витрати; вкажіть 0, якщо витрат немає або їх уже враховано в іншому рядку.
      - paragraph [ref=f2e83]: Відома ціна перельоту копіюється з пропозиції на особу та покриває лише її ділянки. Додайте відсутній зворотний квиток до суми перельотів, якщо його немає у пропозиції; не рахуйте його повторно, якщо він уже включений. Це спостережена ціна, а не підтвердження бронювання. Решта сум — ваші оцінки або ціни, введені вручну; ми не перевіряємо їх у продавців.
      - group "Режим калькулятора" [ref=f2e84]:
        - button "Швидкий бюджет" [pressed] [ref=f2e85] [cursor=pointer]
        - button "Детальний бюджет" [ref=f2e86] [cursor=pointer]
      - paragraph [ref=f2e87]: Обидва режими враховують усі введені витрати та події. Перемикання зберігає суми. Розгорніть подробиці, щоб заповнити відсутні витрати.
      - group [ref=f2e88]:
        - generic "Як розраховуються витрати?" [ref=f2e89] [cursor=pointer]
      - paragraph [ref=f2e90]: Чернетку відновлено в цій вкладці. Оновіть план, щоб змінити збережену версію.
      - group "Ваш план подорожі" [ref=f2e91]:
        - generic [ref=f2e93]:
          - generic [ref=f2e94]:
            - generic [ref=f2e95]: Початок перебування (необов’язково)
            - textbox "Початок перебування (необов’язково)" [ref=f2e96]: 2030-05-01
          - generic [ref=f2e97]:
            - generic [ref=f2e98]: Кінець перебування (необов’язково)
            - textbox "Кінець перебування (необов’язково)" [ref=f2e99]: 2030-05-03
        - paragraph [ref=f2e100]: Дати перераховують ночі та дні витрат. Ці значення можна змінити вручну. Дати перебування також використовуються для пошуку житла. Дати пропозиції перельоту не змінюються.
        - generic [ref=f2e101]:
          - generic [ref=f2e102]:
            - generic [ref=f2e103]: Кількість дорослих
            - generic [ref=f2e104]: Від 1 до 50 осіб
            - textbox "Кількість дорослих" [ref=f2e105]: "1"
          - generic [ref=f2e106]:
            - generic [ref=f2e107]: Кількість ночей
            - generic [ref=f2e108]: Від 0 до 365 ночей
            - textbox "Кількість ночей" [ref=f2e109]: "2"
          - generic [ref=f2e110]:
            - generic [ref=f2e111]: Кількість днів витрат
            - generic [ref=f2e112]: Від 1 до 365 днів, включно з днями прильоту та вильоту
            - textbox "Кількість днів витрат" [ref=f2e113]: "3"
        - paragraph [ref=f2e114]:
          - generic [ref=f2e115]:
            - checkbox "Усі мандрівники — дорослі" [checked] [ref=f2e116]
            - text: Усі мандрівники — дорослі
        - generic [ref=f2e117]:
          - paragraph [ref=f2e118]: Змінено дати, тривалість перебування, кількість людей або дані пропозиції. Перевірте перельоти, проживання, трансфери та решту сум. Перерахунок підсумку не підтверджує ціни продавців.
          - button "Суми перевірено для цього плану" [ref=f2e119] [cursor=pointer]
        - region [ref=f2e120]:
          - heading "Особисті профілі бюджету" [level=3] [ref=f2e121]
          - paragraph [ref=f2e122]: Це ваші припущення в PLN, а не середні ціни міста. Готових цін у профілях немає. Введіть діапазони або перенесіть свої суми. Введені витрати, зокрема 0, мають пріоритет.
          - group "Особисті профілі бюджету" [ref=f2e123]:
            - button "Ощадливо" [ref=f2e124] [cursor=pointer]
            - button "Стандартно" [ref=f2e125] [cursor=pointer]
            - button "Комфортно" [ref=f2e126] [cursor=pointer]
            - button "Без профілю" [pressed] [ref=f2e127] [cursor=pointer]
        - group [ref=f2e128]:
          - generic "Орієнтовні витрати на місці" [ref=f2e129] [cursor=pointer]
          - 'option "Мілан: квиток ATM на 24 години — 7,60 EUR" [selected]'
          - 'option "Мілан: квиток ATM на 3 дні — 15,50 EUR"'
          - 'option "Барселона: T-casual, 10 поїздок, 1 зона — 13,00 EUR"'
        - heading "Основні витрати" [level=3] [ref=f2e130]
        - generic [ref=f2e131]:
          - generic [ref=f2e132]:
            - generic [ref=f2e133]: Перельоти (PLN)
            - generic [ref=f2e134]: На особу, за всі заплановані ділянки
            - textbox "Перельоти (PLN)" [ref=f2e135]:
              - /placeholder: Невідомо
              - text: "200.25"
            - generic [ref=f2e136]:
              - text: Скопійований запис ціни перельоту — не ціна в реальному часі
              - group [ref=f2e137]:
                - generic "Походження суми" [ref=f2e138] [cursor=pointer]
          - generic [ref=f2e139]:
            - generic [ref=f2e140]: Як указано ціну проживання?
            - combobox "Як указано ціну проживання?" [ref=f2e141]:
              - option "За ніч — уся група" [selected]
              - option "За все перебування — уся група"
            - generic [ref=f2e142]:
              - generic [ref=f2e143]: Проживання (PLN)
              - generic [ref=f2e144]: За ніч для всієї групи (усі номери)
              - textbox "Проживання (PLN)" [ref=f2e145]:
                - /placeholder: Невідомо
              - generic [ref=f2e146]: Невідомо
            - generic [ref=f2e147]: Кожне поле зберігає свою суму. До підсумку входить лише вибраний варіант; після зміни дат або кількості гостей перевірте ціну знову.
          - generic [ref=f2e148]:
            - generic [ref=f2e149]: Трансфери та транспорт (PLN)
            - generic [ref=f2e150]: "Усього для групи: обидва аеропорти, зворотні трансфери та поїздки, не вказані окремо"
            - textbox "Трансфери та транспорт (PLN)" [ref=f2e151]:
              - /placeholder: Невідомо
            - generic [ref=f2e152]: Невідомо
          - generic [ref=f2e153]:
            - generic [ref=f2e154]: Харчування та щоденні витрати (PLN)
            - generic [ref=f2e155]: На особу за день
            - textbox "Харчування та щоденні витрати (PLN)" [ref=f2e156]:
              - /placeholder: Невідомо
            - generic [ref=f2e157]: Невідомо
        - group [ref=f2e158]:
          - 'generic "Додаткові витрати: багаж, міський транспорт, розваги та резерв" [ref=f2e159] [cursor=pointer]'
      - status [ref=f2e160]:
        - heading "Орієнтовний бюджет усієї групи (PLN)" [level=3] [ref=f2e161]
        - paragraph [ref=f2e162]:
          - text: "Сума відомих витрат:"
          - strong [ref=f2e163]: 200,25 PLN
        - paragraph [ref=f2e164]:
          - text: "На особу за рівного розподілу (округлено):"
          - strong [ref=f2e165]: 200,25 PLN
        - paragraph [ref=f2e166]: "Бюджет неповний. Залишилося заповнити: Багаж і доповнення до перельоту, Проживання, Трансфери та транспорт, Міський транспорт, Харчування та щоденні витрати, Розваги та вхідні квитки, Інші витрати та резерв, Податки та збори, Аварійний резерв."
      - group [ref=f2e167]:
        - generic "Витрати всієї групи за категоріями" [ref=f2e168] [cursor=pointer]
      - paragraph [ref=f2e169]: Це ваш план витрат, а не пропозиція чи бронювання. Перевірте остаточні ціни у продавців. Чернетка доступна лише в цьому браузері; видалення даних сайту видалить і чернетки.
      - button "Очистити калькулятор" [ref=f2e170] [cursor=pointer]
      - region "Зберегти подорож і поділитися" [ref=f2e171]:
        - heading "Збережений план подорожі" [level=3] [ref=f2e172]
        - paragraph [ref=f2e173]: Збережено лише в цьому профілі браузера на цьому пристрої. Видалення даних сайту видалить плани. Збережіть посилання, щоб відкрити копію в іншому місці.
        - paragraph [ref=f2e174]: Незбережені правки залишаються в цій вкладці до її закриття. Оновлення зберігає їх у списку на цьому пристрої.
        - paragraph [ref=f2e175]: Посилання містить маршрут, дати, кількість людей і введений бюджет. Будь-який отримувач може побачити ці дані. Це копія плану, а не актуальна пропозиція продавця.
        - paragraph [ref=f2e176]: "Нові посилання зберігають план після # в адресі, поза запитом до сайту. Посилання не зашифроване: кожен отримувач може прочитати план. Браузер і сервіс, куди ви вставите посилання, можуть зберегти повну адресу."
        - paragraph [ref=f2e177]: Цей план збережено.
        - generic [ref=f2e178]:
          - button "Оновити план" [disabled] [ref=f2e179]
          - button "Дублювати план" [ref=f2e180] [cursor=pointer]
          - button "Видалити збережений план" [ref=f2e181] [cursor=pointer]
          - button "Поділитися" [ref=f2e182] [cursor=pointer]
          - link "Збережені подорожі" [ref=f2e183] [cursor=pointer]:
            - /url: /uk/saved
        - paragraph
    - region [ref=f2e184]:
      - generic [ref=f2e185]:
        - generic [ref=f2e186]:
          - heading "Події під час подорожі" [level=2] [ref=f2e187]
          - paragraph [ref=f2e188]: Концерти, спорт і культура в місті призначення. Квитки на події купуються окремо.
        - generic [ref=f2e189]: Ticketmaster
      - paragraph [ref=f2e190]:
        - generic [ref=f2e191]: Ваша подорож · Барселона
        - strong [ref=f2e192]: 1 трав. 2030 р. – 3 трав. 2030 р.
      - generic [ref=f2e193]:
        - strong [ref=f2e194]: Дати подорожі
        - button "Інші дати" [ref=f2e195] [cursor=pointer]
      - paragraph [ref=f2e196]: Дати спільні з житлом і бюджетом. Зміни автоматично оновлюють події. Це дати плану — перевірте їх відповідність розкладу перельоту.
      - generic [ref=f2e197]:
        - generic [ref=f2e198]:
          - text: З
          - textbox "З" [ref=f2e199]: 2030-05-01
        - generic [ref=f2e200]:
          - text: До
          - textbox "До" [ref=f2e201]: 2030-05-03
        - generic [ref=f2e202]:
          - text: Категорія
          - combobox "Категорія" [ref=f2e203]:
            - option "Усі" [selected]
            - option "Музика"
            - option "Спорт"
            - option "Культура"
            - option "Інше"
        - button "Знайти події" [ref=f2e204] [cursor=pointer]
      - generic [ref=f2e206]:
        - text: Сумісність із перельотом
        - combobox "Сумісність із перельотом" [ref=f2e207]:
          - option "Усі події" [selected]
          - option "Може підійти до перельоту"
      - paragraph [ref=f2e208]: Цей режим приховує лише явні конфлікти з перельотом. Події з малим запасом чи неповними даними залишаються видимими. Формальності в аеропорту та дорогу до місця потрібно перевірити; відвідування не гарантується.
      - generic [ref=f2e209]:
        - generic [ref=f2e210]:
          - text: Події за днями
          - combobox "Події за днями" [ref=f2e211]:
            - option "Усі дні" [selected]
            - option "ср, 1 трав."
            - option "чт, 2 трав."
            - option "пт, 3 трав."
        - button "Попередній день" [disabled] [ref=f2e212]: ←
        - button "Наступний день" [ref=f2e213] [cursor=pointer]: →
      - status [ref=f2e214]:
        - paragraph [ref=f2e215]: Виберіть коректний період до 31 дня, не більш ніж на 365 днів уперед.
      - group [ref=f2e216]:
        - generic "Перед покупкою" [ref=f2e217] [cursor=pointer]
      - paragraph [ref=f2e218]: "Партнерські посилання: HopTrip може отримати комісію від покупки. Наявність квитків і правила входу уточнюйте у продавця."
      - paragraph [ref=f2e219]: Зміни дат і складу групи в плані автоматично не передаються за цим посиланням. Перевірте дату, учасників і ціну в партнера.
    - link "Збережені подорожі" [ref=f2e220] [cursor=pointer]:
      - /url: /uk/saved
  - contentinfo [ref=f2e221]:
    - generic [ref=f2e222]:
      - generic [ref=f2e223]: HopTrip.
      - paragraph [ref=f2e224]: "Партнерське посилання: ми можемо отримати комісію після бронювання. Ми не продаємо квитки."
    - navigation "Про сервіс" [ref=f2e225]:
      - link "Як працює HopTrip" [ref=f2e226] [cursor=pointer]:
        - /url: /uk/info
      - link "City break" [ref=f2e227] [cursor=pointer]:
        - /url: /uk/city-break
      - link "Перельоти на вихідні" [ref=f2e228] [cursor=pointer]:
        - /url: /uk/tanie-loty-na-weekend
      - link "Перельоти з Варшави" [ref=f2e229] [cursor=pointer]:
        - /url: /uk/from/warszawa
      - link "Збережені подорожі" [ref=f2e230] [cursor=pointer]:
        - /url: /uk/saved
      - link "Сповіщення про перельоти" [ref=f2e231] [cursor=pointer]:
        - /url: /uk/alerts
      - link "Про HopTrip" [ref=f2e232] [cursor=pointer]:
        - /url: /uk/info/about
      - link "Контакти" [ref=f2e233] [cursor=pointer]:
        - /url: /uk/info/contact
      - link "Конфіденційність" [ref=f2e234] [cursor=pointer]:
        - /url: /uk/info/privacy
      - link "Умови використання" [ref=f2e235] [cursor=pointer]:
        - /url: /uk/info/terms
      - link "Партнерство" [ref=f2e236] [cursor=pointer]:
        - /url: /uk/info/partners
    - button "Налаштування конфіденційності" [ref=f2e238] [cursor=pointer]
  - alert [ref=f2e239]
```

# Test source

```ts
  1   | import {test,expect,type Page} from '@playwright/test';
  2   | import {readFileSync,writeFileSync} from 'node:fs';
  3   | import {localizedHref} from '../src/lib/i18n/routing';
  4   | import {navigation} from '../src/lib/i18n/navigation';
  5   | import {tripText} from '../src/lib/i18n/trip-copy';
  6   | import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
  7   | 
  8   | type Event={event_name:string;anonymous_session_id:string;source?:string;metadata:{page_type?:string;campaign?:string}};
  9   | type Initial='allow'|'deny'|'absent'|'expired'|'future'|'malformed';
  10  | const consentKey='hoptrip.consent.v1',sessionKey='hoptrip.session.v2';
  11  | const staleId='00000000-0000-4000-8000-000000000088';
  12  | test.setTimeout(60000);
  13  | test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Session hydration regression requires the isolated production build');
  14  | test.beforeAll(async({request})=>{
  15  |  const config=readFileSync('playwright.config.ts','utf8');expect(config).toContain('command:"npm run start --');expect(config).toContain('NODE_ENV:"production"');expect(config).not.toContain('reuseExistingServer:true');
  16  |  expect(await (await request.get('/saved')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
  17  | });
  18  | async function setup(page:Page,initial:Initial='allow',stale=false,storage?:'session-only'|'all'){
  19  |  await page.addInitScript(({initial,stale,consentKey,sessionKey,staleId,storage})=>{
  20  |   (window as typeof window&{h3Document:string}).h3Document=crypto.randomUUID();
  21  |   if(!sessionStorage.getItem('h3.session.fixture.initialized')){
  22  |    sessionStorage.setItem('h3.session.fixture.initialized','1');
  23  |    if(initial!=='absent')localStorage.setItem(consentKey,initial==='malformed'?'broken-json':JSON.stringify({version:1,analytics:initial!=='deny',marketing:false,at:Date.now()-(initial==='expired'?181*86400000:initial==='future'?-86400000:0)}));
  24  |    if(stale)localStorage.setItem(sessionKey,JSON.stringify({id:staleId,touched:Date.now()}));
  25  |   }
  26  |   if(storage==='all')Object.defineProperty(window,'localStorage',{get(){throw Error('Synthetic blocked storage');}});
  27  |   if(storage==='session-only')for(const method of ['getItem','setItem','removeItem'] as const){
  28  |    const original=Storage.prototype[method];Object.defineProperty(Storage.prototype,method,{value:function(key:string,value?:string){if(this===localStorage&&key===sessionKey)throw Error('Synthetic blocked session store');return Reflect.apply(original,this,method==='setItem'?[key,value]:[key]);}});
  29  |   }
  30  |  },{initial,stale,consentKey,sessionKey,staleId,storage});
  31  |  const events:Event[]=[],statuses:number[]=[],errors:string[]=[];
  32  |  page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.method()==='POST')events.push(r.postDataJSON());});
  33  |  page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.request().method()==='POST')statuses.push(r.status());});
  34  |  page.on('pageerror',error=>errors.push(error.message));
  35  |  const views=()=>events.filter(e=>e.event_name==='PAGE_VIEW');
> 36  |  const flush=async()=>{await expect.poll(()=>statuses.length===events.length).toBe(true);expect(statuses.every(s=>s===202)).toBe(true);expect(errors).toEqual([]);};
      |                                                                               ^ Error: expect(received).toBe(expected) // Object.is equality
  37  |  return {events,views,flush,errors};
  38  | }
  39  | const storedId=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null')?.id,sessionKey);
  40  | const documentId=(page:Page)=>page.evaluate(()=>(window as typeof window&{h3Document:string}).h3Document);
  41  | async function grant(page:Page){
  42  |  if(!await page.locator('.consent-panel').count())await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
  43  |  await page.locator('.consent-panel input[type="checkbox"]').first().check();
  44  |  await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);
  45  | }
  46  | async function revoke(page:Page){
  47  |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);
  48  | }
  49  | 
  50  | for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: accepted session survives reload, Save auto-open and full navigation`,async({page},info)=>{
  51  |  const {events,views,flush}=await setup(page);
  52  |  await page.goto(localizedHref('/deals/browser-deal?utm_source=newsletter&utm_campaign=test',locale));await expect(page.locator('#budget-start')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);await flush();
  53  |  const first=views()[0].anonymous_session_id,document=await documentId(page);
  54  |  await page.reload();await expect(page.locator('#budget-start')).toBeEnabled();await expect.poll(()=>views().length).toBe(2);await flush();
  55  |  expect(await documentId(page)).not.toBe(document);expect(await storedId(page)).toBe(first);expect(views()[1].anonymous_session_id).toBe(first);
  56  |  await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');
  57  |  await page.locator('#trip-save').getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
  58  |  await expect(page).toHaveURL(/\/trip#local=[a-f0-9-]{36}$/);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);await expect.poll(()=>views().length).toBe(3);await flush();
  59  |  expect(events.filter(e=>e.event_name==='TRIP_SAVE')).toHaveLength(1);
  60  |  await page.goto(localizedHref('/saved',locale));await expect.poll(()=>views().length).toBe(4);await expect(page.locator('.consent-panel')).toHaveCount(0);await flush();
  61  |  expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));
  62  |  expect(events.every(e=>e.source==='newsletter'&&e.metadata.campaign==='test')).toBe(true);
  63  |  expect(views().map(e=>e.metadata.page_type)).toEqual(['deal','deal','saved_trip','saved']);
  64  |  writeFileSync(info.outputPath('navigation.json'),JSON.stringify({locale,views:4,distinctSessions:1,saveAutoOpenRetainsSession:true,sourceCampaignRetained:true},null,2));
  65  | });
  66  | 
  67  | test('client navigation and real language-switcher full navigations keep one session',async({page},info)=>{
  68  |  const {events,views,flush}=await setup(page);await page.goto('/saved?utm_source=newsletter&utm_campaign=test');await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id,document=await documentId(page);
  69  |  await page.getByRole('navigation',{name:navigation.pl.main,exact:true}).getByRole('link',{name:navigation.pl.budget,exact:true}).click();await expect(page).toHaveURL(/\/info\/trip-budget$/);await expect.poll(()=>views().length).toBe(2);await flush();expect(await documentId(page)).toBe(document);
  70  |  let previous=document;
  71  |  for(const [index,locale] of (['en','ru','uk','pl'] as const).entries()){
  72  |   await page.locator(`.language-switcher a[lang="${locale}"]`).click();await expect(page).toHaveURL(new RegExp(localizedHref('/info/trip-budget',locale)+'$'));await expect.poll(()=>views().length).toBe(index+3);await flush();
  73  |   expect(await documentId(page)).not.toBe(previous);previous=await documentId(page);
  74  |  }
  75  |  expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));expect(events.every(e=>e.source==='newsletter'&&e.metadata.campaign==='test')).toBe(true);
  76  |  writeFileSync(info.outputPath('client-locale.json'),JSON.stringify({clientNavigationWithoutDocumentReload:true,languageSwitches:4,views:6,distinctSessions:1},null,2));
  77  | });
  78  | 
  79  | test('denial, grant, revocation and regrant clear old identity without replaying actions',async({page},info)=>{
  80  |  const {events,views,flush}=await setup(page,'deny',true);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>storedId(page)).toBeUndefined();
  81  |  await page.locator('#budget-hotel').fill('10');expect(events).toEqual([]);
  82  |  await grant(page);await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;expect(first).not.toBe(staleId);expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
  83  |  await page.locator('#budget-hotel').fill('20');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);await flush();
  84  |  await revoke(page);await expect.poll(()=>storedId(page)).toBeUndefined();const before=events.length;
  85  |  await page.locator('#budget-hotel').fill('30');await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();expect(events).toHaveLength(before);expect(await storedId(page)).toBeUndefined();
  86  |  await grant(page);await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(1);
  87  |  writeFileSync(info.outputPath('revocation.json'),JSON.stringify({staleIdentityCleared:true,noPreGrantOrRevokedReplay:true,regrantStartsNewSession:true},null,2));
  88  | });
  89  | 
  90  | for(const initial of ['absent','expired','future','malformed'] as const)test(`${initial} consent clears an existing session and sends nothing`,async({page})=>{
  91  |  const {events,flush}=await setup(page,initial,true);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect(page.locator('.consent-panel')).toBeVisible();await expect.poll(()=>storedId(page)).toBeUndefined();
  92  |  await page.locator('#budget-hotel').fill('10');await flush();expect(events).toEqual([]);
  93  | });
  94  | 
  95  | test('idle expiry rotates at thirty minutes while a twenty-nine-minute session survives hydration',async({page},info)=>{
  96  |  const {views,flush}=await setup(page);await page.goto('/saved');await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
  97  |  for(const [minutes,count] of [[29,2],[30,3]]){
  98  |   await page.evaluate(({key,minutes})=>{const session=JSON.parse(localStorage.getItem(key)!);session.touched=Date.now()-minutes*60000;localStorage.setItem(key,JSON.stringify(session));},{key:sessionKey,minutes});
  99  |   await page.reload();await expect.poll(()=>views().length).toBe(count);await flush();
  100 |   if(minutes===29)expect(views()[count-1].anonymous_session_id).toBe(first);else expect(views()[count-1].anonymous_session_id).not.toBe(first);
  101 |  }
  102 |  writeFileSync(info.outputPath('expiry.json'),JSON.stringify({at29MinutesSameSession:true,at30MinutesNewSession:true,views:3},null,2));
  103 | });
  104 | 
  105 | test('consent storage events from another tab revoke tracking and clear shared identity',async({page,context})=>{
  106 |  const {events,views,flush}=await setup(page);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
  107 |  const other=await context.newPage();try{
  108 |   await other.goto('/saved');await expect.poll(()=>storedId(other)).toBe(first);await revoke(other);
  109 |   await expect.poll(()=>storedId(page)).toBeUndefined();const before=events.length;await page.locator('#budget-hotel').fill('15');await flush();expect(events).toHaveLength(before);
  110 |   await grant(other);await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);expect(await storedId(page)).toBe(await storedId(other));expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
  111 |  }finally{await other.close();}
  112 | });
  113 | 
  114 | for(const storage of ['session-only','all'] as const)test(`${storage} blocked storage keeps analytics optional and the calculator usable`,async({page},info)=>{
  115 |  const {events,views,flush}=await setup(page,'allow',false,storage);
  116 |  await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();
  117 |  if(storage==='all'){await expect(page.locator('.consent-panel')).toBeVisible();expect(events).toEqual([]);await grant(page);}
  118 |  await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
  119 |  await page.locator('#budget-hotel').fill('15');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);await flush();expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));
  120 |  const before=events.length;await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();
  121 |  if(storage==='all'){await expect(page.locator('.consent-panel')).toBeVisible();expect(events).toHaveLength(before);}
  122 |  else{await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);}
  123 |  writeFileSync(info.outputPath('storage.json'),JSON.stringify({storage,calculatorUsable:true,inDocumentMemorySession:true,crossDocumentPersistenceAvailable:false},null,2));
  124 | });
  125 | 
  126 | test('blocked transport does not retry or reset a valid session',async({page},info)=>{
  127 |  const {events,views,errors}=await setup(page);await page.route('**/api/v1/analytics/events',route=>route.abort('failed'));
  128 |  await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);const first=views()[0].anonymous_session_id;
  129 |  await page.locator('#budget-hotel').fill('15');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);
  130 |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);expect(views()).toHaveLength(1);
  131 |  await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(2);expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));expect(errors).toEqual([]);
  132 |  writeFileSync(info.outputPath('blocked.json'),JSON.stringify({attemptedViews:2,documents:2,distinctSessions:1,noRetryFromConsentRerender:true,calculatorUsable:true},null,2));
  133 | });
  134 | 
```