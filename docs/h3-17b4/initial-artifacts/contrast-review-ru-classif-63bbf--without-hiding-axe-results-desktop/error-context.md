# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contrast-review.spec.ts >> ru: classify every contrast review item without hiding axe results
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
  - link "Перейти к содержимому" [ref=f6e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f6e3]:
    - link "HopTrip — главная" [ref=f6e4] [cursor=pointer]:
      - /url: /ru
      - generic [aria-hidden] [ref=f6e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f6e6]: .
    - navigation "Основная навигация" [ref=f6e7]:
      - link "Недорогие перелёты" [ref=f6e8] [cursor=pointer]:
        - /url: /ru/deals
      - link "На выходные" [ref=f6e9] [cursor=pointer]:
        - /url: /ru/tanie-loty-na-weekend
      - link "Направления" [ref=f6e10] [cursor=pointer]:
        - /url: /ru/destinations
      - link "Сохранённое" [ref=f6e11] [cursor=pointer]:
        - /url: /ru/saved
      - link "Калькулятор бюджета" [ref=f6e12] [cursor=pointer]:
        - /url: /ru/info/trip-budget
    - navigation "Язык" [ref=f6e13]:
      - link "Polski" [ref=f6e14] [cursor=pointer]:
        - /url: /deals/browser-deal
      - link "Русский" [ref=f6e15] [cursor=pointer]:
        - /url: /ru/deals/browser-deal
      - link "English" [ref=f6e16] [cursor=pointer]:
        - /url: /en/deals/browser-deal
      - link "Українська" [ref=f6e17] [cursor=pointer]:
        - /url: /uk/deals/browser-deal
  - main [ref=f6e19]:
    - link "← Актуальные предложения" [ref=f6e20] [cursor=pointer]:
      - /url: /ru/deals
    - article [ref=f6e21]:
      - generic [ref=f6e22]:
        - paragraph [ref=f6e23]: В одну сторону
        - heading [level=1] [ref=f6e24]:
          - text: Вроцлав (WRO) → Барселона
          - img "Испания" [ref=f6e25]
        - paragraph [ref=f6e26]: "Даты вылетов: сб, 5 дек. 2026 г."
      - navigation "Разделы плана поездки" [ref=f6e27]:
        - link "Перелёт" [ref=f6e28] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "К партнёру" [ref=f6e29] [cursor=pointer]:
          - /url: "#trip-booking"
        - link "Проживание" [ref=f6e30] [cursor=pointer]:
          - /url: "#accommodation"
        - link "Достопримечательности" [ref=f6e31] [cursor=pointer]:
          - /url: "#destination-activities"
        - link "События" [ref=f6e32] [cursor=pointer]:
          - /url: "#trip-events"
        - link "Бюджет" [ref=f6e33] [cursor=pointer]:
          - /url: "#calculator"
        - link "Сохранить" [ref=f6e34] [cursor=pointer]:
          - /url: "#trip-save"
        - link "Сравнение цены" [ref=f6e35] [cursor=pointer]:
          - /url: "#score"
      - generic [ref=f6e36]:
        - region "Цена перелёта" [ref=f6e37]:
          - paragraph [ref=f6e38]: за человека · PLN
          - paragraph [ref=f6e39]:
            - text: 200,25 PLN
            - 'generic "Около 46 €. Средний курс NBP от чт, 5 нояб. 2026 г.: 1 EUR = 4,3916 PLN. Курс при оплате может отличаться." [ref=f6e40]':
              - generic [aria-hidden] [ref=f6e41]: ≈ 46 €
            - generic [ref=f6e43]: за человека · в одну сторону
          - generic [ref=f6e44]:
            - paragraph [ref=f6e45]:
              - text: "Первая запись этой цены в HopTrip:"
              - time [ref=f6e46]: чт, 5 нояб. 2026 г., 14:15
              - text: (время в Польше).
            - paragraph [ref=f6e47]: Наличие мест и окончательную цену уточняйте у партнёра. Проверки в реальном времени нет.
            - group [ref=f6e48]:
              - generic "Происхождение цены и срок показа" [ref=f6e49] [cursor=pointer]
          - paragraph [ref=f6e50]:
            - strong [ref=f6e51]: Цена на 49,75 PLN ниже медианы выборки.
            - text: "Наблюдений: 24. Выборка направления, не одинаковых тарифов или всего рынка."
          - heading "Детали перелёта" [level=2] [ref=f6e52]
          - generic [ref=f6e53]:
            - note [ref=f6e54]:
              - strong [ref=f6e55]: Проверьте маршрут перед выбором
              - paragraph [ref=f6e56]: Данные маршрута источника не подтверждены.
              - list
              - paragraph [ref=f6e57]: Полнота данных не подтверждает наличие у продавца.
            - paragraph [ref=f6e58]:
              - strong [ref=f6e59]: Вылет
              - text: · аэропорт нужно уточнить → аэропорт нужно уточнить · время неизвестно
              - generic [ref=f6e60]: Пересадки уточняйте у партнёра
            - paragraph [ref=f6e62]: Время и стоимость доезда неизвестны — проверьте транспорт на дату поездки.
            - paragraph [ref=f6e63]: "Вылет: Уточните авиакомпанию"
          - paragraph [ref=f6e64]: Цена указана за перелёт. Проживание не включено.
          - paragraph [ref=f6e65]: Багаж нужно уточнить
          - group [ref=f6e66]:
            - generic "Полные данные рейса и багаж" [ref=f6e67] [cursor=pointer]
        - region [ref=f6e68]:
          - heading "Переход к партнёру" [level=2] [ref=f6e69]
          - generic [ref=f6e70]: Партнёрство
          - generic [ref=f6e71]:
            - paragraph [ref=f6e72]:
              - text: 200,25 PLN
              - 'generic "Около 46 €. Средний курс NBP от чт, 5 нояб. 2026 г.: 1 EUR = 4,3916 PLN. Курс при оплате может отличаться." [ref=f6e73]':
                - generic [aria-hidden] [ref=f6e74]: ≈ 46 €
              - generic [ref=f6e76]: за человека · в одну сторону
            - paragraph [ref=f6e77]:
              - strong [ref=f6e78]: Укажите у партнёра 1 взрослого.
              - text: Ссылка открывает предложение партнёра. Изменённые даты и число пассажиров из плана не передаются. Проверьте даты и цену у партнёра.
            - link "Посмотреть перелёт — Fixture program" [ref=f6e79] [cursor=pointer]:
              - /url: http://127.0.0.1:8125/go/browser-deal/flight
          - paragraph [ref=f6e80]: "Партнёрская ссылка: мы можем получить комиссию после бронирования. Мы не продаём билеты."
      - region [ref=f6e81]:
        - heading "Найти жильё — Барселона" [level=2] [ref=f6e82]
        - paragraph [ref=f6e83]: Жильё бронируется отдельно от перелёта. Даты проживания и взрослые общие с бюджетом; даты перелёта не меняются.
        - paragraph [ref=f6e84]: Даты проживания выбираются отдельно от дат перелёта. Проверьте местные даты прилёта и обратного вылета.
        - group [ref=f6e85]:
          - generic "Как согласовать даты проживания с перелётом?" [ref=f6e86] [cursor=pointer]
        - paragraph [ref=f6e87]: Это перелёт в одну сторону — укажите дату выезда.
        - group "Даты проживания и взрослые" [ref=f6e88]:
          - generic [ref=f6e90]:
            - generic [ref=f6e91]:
              - generic [ref=f6e92]: Заезд
              - textbox "Заезд" [invalid] [ref=f6e93]: 2026-12-05
            - generic [ref=f6e94]:
              - generic [ref=f6e95]: Выезд
              - textbox "Выезд" [invalid] [ref=f6e96]
              - status [ref=f6e97]: Выберите дату выезда позже даты заезда.
            - generic [ref=f6e98]:
              - generic [ref=f6e99]: Взрослые
              - spinbutton "Взрослые" [ref=f6e100]: "1"
        - paragraph [ref=f6e102]:
          - strong [ref=f6e103]: Барселона
          - text: ": сб, 5 дек. 2026 г. – Выберите дату · взрослых: 1."
        - paragraph [ref=f6e104]: Цену и наличие жилья проверьте в Stay22. HopTrip не получает котировку; суммы в бюджете вводятся вручную.
        - paragraph [ref=f6e105]: Партнёрская ссылка — мы можем получить комиссию. Передаём только взрослых; детей и их возраст укажите у партнёра. Проверьте даты, гостей, цену и условия отмены.
        - group [ref=f6e106]:
          - generic "Как добавить стоимость жилья в план?" [ref=f6e107] [cursor=pointer]
        - link "Добавить стоимость жилья в бюджет поездки" [ref=f6e108] [cursor=pointer]:
          - /url: "#budget-hotel-basis"
      - region [ref=f6e109]:
        - paragraph [ref=f6e110]: Идеи для поездки · Барселона
        - heading "Музеи и достопримечательности" [level=2] [ref=f6e111]
        - paragraph [ref=f6e112]: Билеты покупают отдельно. Наличие на даты поездки проверь у продавца или на официальном сайте достопримечательности.
        - list [ref=f6e113]:
          - listitem [ref=f6e114]:
            - generic [ref=f6e115]: Архитектура
            - heading "Casa Batlló — билет Blue" [level=3] [ref=f6e116]
            - paragraph [ref=f6e117]: Интерьеры дома, спроектированного Гауди, аудиогид и пространство Gaudí Cube.
            - paragraph [ref=f6e118]:
              - strong [ref=f6e119]: "Для кого:"
              - text: Для тех, кто интересуется архитектурой Гауди и посещением с аудиогидом.
            - paragraph [ref=f6e120]:
              - strong [ref=f6e121]: "Время посещения:"
              - text: Около 1 часа для варианта Blue; без дороги и ожидания входа.
            - paragraph [ref=f6e122]: Вариант Blue не включает террасу на крыше, планшет VR или вход без очереди. Проверьте время входа и язык аудиогида.
            - generic [ref=f6e123]:
              - paragraph [ref=f6e124]: Цену нужно уточнить в Tiqets
              - paragraph [ref=f6e125]: Партнёрская ссылка — мы можем получить комиссию за покупку.
              - 'link "Уточнить даты и цену в Tiqets: Casa Batlló — билет Blue (новая вкладка)" [ref=f6e126] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/JikjB3NX
                - text: Уточнить даты и цену
              - paragraph [ref=f6e127]:
                - link "Источник времени посещения (новая вкладка)" [ref=f6e128] [cursor=pointer]:
                  - /url: https://www.casabatllo.es/en/visit/faqs/
          - listitem [ref=f6e129]:
            - generic [ref=f6e130]: Океанариум
            - heading "Aquarium Barcelona — входной билет" [level=3] [ref=f6e131]
            - paragraph [ref=f6e132]: "Морской мир в Port Vell: аквариумы и выставки о жизни под водой."
            - paragraph [ref=f6e133]:
              - strong [ref=f6e134]: "Для кого:"
              - text: Для семей и тех, кто интересуется морской природой; вариант посещения в помещении.
            - paragraph [ref=f6e135]:
              - strong [ref=f6e136]: "Время посещения:"
              - text: Ориентировочно 1,5–2 часа на посещение; без дороги и очереди.
            - paragraph [ref=f6e137]: Проверьте дату посещения, часы работы и правила детских билетов.
            - generic [ref=f6e138]:
              - paragraph [ref=f6e139]: Цену нужно уточнить в Tiqets
              - paragraph [ref=f6e140]: Партнёрская ссылка — мы можем получить комиссию за покупку.
              - 'link "Уточнить даты и цену в Tiqets: Aquarium Barcelona — входной билет (новая вкладка)" [ref=f6e141] [cursor=pointer]':
                - /url: https://tiqets.tpx.gr/ALlisode
                - text: Уточнить даты и цену
              - paragraph [ref=f6e142]:
                - link "Источник времени посещения (новая вкладка)" [ref=f6e143] [cursor=pointer]:
                  - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
          - listitem [ref=f6e144]:
            - generic [ref=f6e145]: Природа · бесплатный вход
            - heading "Hivernacle — оранжерея в парке Ciutadella" [level=3] [ref=f6e146]
            - paragraph [ref=f6e147]: Историческая оранжерея с коллекциями растений в парке Ciutadella.
            - paragraph [ref=f6e148]:
              - strong [ref=f6e149]: "Для кого:"
              - text: Для любителей растений и спокойной прогулки среди зелени.
            - paragraph [ref=f6e150]: Бесплатный вход относится к самостоятельному посещению. Проверьте часы и закрытия; экскурсии с гидом имеют отдельные правила и бронирование.
            - generic [ref=f6e151]:
              - paragraph [ref=f6e152]: "Самостоятельное посещение: по официальному сайту вход бесплатный."
              - 'link "Уточнить правила посещения: Hivernacle — оранжерея в парке Ciutadella (новая вкладка)" [ref=f6e153] [cursor=pointer]':
                - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                - text: Уточнить правила посещения
        - paragraph [ref=f6e154]: Достопримечательности не включены в стоимость перелёта. До покупки проверь состав билета, льготы и условия отмены. В дни поездки учти время перелётов и трансферов.
        - paragraph [ref=f6e155]: Изменения дат и состава группы в плане автоматически не передаются по этой ссылке. Проверьте дату, участников и цену у партнёра.
        - paragraph [ref=f6e156]: Описания и правила проверены пн, 12 окт. 2026 г.. Это обзор источников, а не подтверждение наличия билетов на даты поездки.
        - paragraph [ref=f6e157]: В калькуляторе укажи общую стоимость выбранных достопримечательностей в PLN на человека за всё проживание. Если цены билетов различаются, используй среднюю на человека. Бесплатный вход не означает, что дорога тоже бесплатна.
        - link "Учесть достопримечательности в бюджете" [ref=f6e158] [cursor=pointer]:
          - /url: "#calculator"
      - region [ref=f6e159]:
        - generic [ref=f6e160]:
          - generic [ref=f6e161]:
            - heading "События во время поездки" [level=2] [ref=f6e162]
            - paragraph [ref=f6e163]: Концерты, спорт и культура в городе назначения. Билеты на события покупаются отдельно.
          - generic [ref=f6e164]: Ticketmaster
        - paragraph [ref=f6e165]:
          - generic [ref=f6e166]: Ваша поездка · Барселона
          - strong [ref=f6e167]: 5 дек. 2026 г. – Даты не заданы
        - generic [ref=f6e168]:
          - strong [ref=f6e169]: Даты поездки
          - button "Другие даты" [ref=f6e170] [cursor=pointer]
        - paragraph [ref=f6e171]: Даты общие с жильём и бюджетом. Изменения автоматически обновляют события. Это даты плана — проверьте их соответствие расписанию перелёта.
        - generic [ref=f6e172]:
          - generic [ref=f6e173]:
            - text: С
            - textbox "С" [invalid] [ref=f6e174]: 2026-12-05
          - generic [ref=f6e175]:
            - text: По
            - textbox "По" [invalid] [ref=f6e176]
          - generic [ref=f6e177]:
            - text: Категория
            - combobox "Категория" [ref=f6e178]:
              - option "Все" [selected]
              - option "Музыка"
              - option "Спорт"
              - option "Культура"
              - option "Другое"
          - button "Найти события" [ref=f6e179] [cursor=pointer]
        - generic [ref=f6e181]:
          - text: Совместимость с перелётом
          - combobox "Совместимость с перелётом" [ref=f6e182]:
            - option "Все события" [selected]
            - option "Может подойти к перелёту"
        - paragraph [ref=f6e183]: Этот режим скрывает только явные конфликты с перелётом. События с малым запасом или неполными данными остаются видимыми. Формальности в аэропорту и дорогу до места нужно проверить; посещение не гарантируется.
        - status [ref=f6e184]:
          - paragraph [ref=f6e185]: Выберите корректный период до 31 дня, не более чем на 365 дней вперёд.
        - group [ref=f6e186]:
          - generic "Перед покупкой" [ref=f6e187] [cursor=pointer]
        - paragraph [ref=f6e188]: "Партнёрские ссылки: HopTrip может получить комиссию от покупки. Наличие билетов и правила входа уточняйте у продавца."
        - paragraph [ref=f6e189]: Изменения дат и состава группы в плане автоматически не передаются по этой ссылке. Проверьте дату, участников и цену у партнёра.
      - navigation "Спланировать пребывание" [ref=f6e190]:
        - heading "Спланировать пребывание" [level=2] [ref=f6e191]
        - list [ref=f6e192]:
          - listitem [ref=f6e193]:
            - 'link "Барселона: BCN, Жирона или Реус" [ref=f6e194] [cursor=pointer]':
              - /url: /ru/info/barcelona-airports
          - listitem [ref=f6e195]:
            - 'link "Барселона за 3 дня: план осмотра и бюджет поездки" [ref=f6e196] [cursor=pointer]':
              - /url: /ru/info/barcelona-3-days
      - region [ref=f6e197]:
        - heading "Калькулятор бюджета поездки" [level=2] [ref=f6e198]
        - paragraph [ref=f6e199]: Введите свои суммы в PLN. Пустое поле означает неизвестный расход; укажите 0, если расхода нет или он уже учтён в другой строке.
        - paragraph [ref=f6e200]: Известная цена перелёта копируется из предложения на человека и покрывает только его участки. Добавьте недостающий обратный билет к сумме перелётов, если его нет в предложении; не считайте его повторно, если он уже включён. Это наблюдавшаяся цена, а не подтверждение бронирования. Остальные суммы — ваши оценки или цены, введённые вручную; мы не проверяем их у продавцов.
        - group "Режим калькулятора" [ref=f6e201]:
          - button "Быстрый бюджет" [pressed] [ref=f6e202] [cursor=pointer]
          - button "Подробный бюджет" [ref=f6e203] [cursor=pointer]
        - paragraph [ref=f6e204]: Оба режима учитывают все введённые расходы и события. Переключение сохраняет суммы. Раскройте подробности, чтобы заполнить недостающие расходы.
        - group [ref=f6e205]:
          - generic "Как считаются расходы?" [ref=f6e206] [cursor=pointer]
        - paragraph [ref=f6e207]: Изменения сохраняются автоматически в этом браузере, отдельно для каждого предложения.
        - group "Ваш план поездки" [ref=f6e208]:
          - generic [ref=f6e210]:
            - generic [ref=f6e211]:
              - generic [ref=f6e212]: Начало пребывания (необязательно)
              - textbox "Начало пребывания (необязательно)" [invalid] [ref=f6e213]: 2026-12-05
            - generic [ref=f6e214]:
              - generic [ref=f6e215]: Конец пребывания (необязательно)
              - textbox "Конец пребывания (необязательно)" [invalid] [ref=f6e216]
          - paragraph [ref=f6e217]: Даты пересчитывают ночи и дни расходов. Эти значения можно изменить вручную. Даты пребывания также используются при поиске жилья. Даты предложения перелёта не меняются.
          - paragraph [ref=f6e218]: "Укажите обе даты: конец не может быть раньше начала; пребывание — не более 365 дней."
          - generic [ref=f6e219]:
            - generic [ref=f6e220]:
              - generic [ref=f6e221]: Количество взрослых
              - generic [ref=f6e222]: От 1 до 50 человек
              - textbox "Количество взрослых" [ref=f6e223]: "1"
            - generic [ref=f6e224]:
              - generic [ref=f6e225]: Количество ночей
              - generic [ref=f6e226]: От 0 до 365 ночей
              - textbox "Количество ночей" [ref=f6e227]: "2"
            - generic [ref=f6e228]:
              - generic [ref=f6e229]: Количество дней расходов
              - generic [ref=f6e230]: От 1 до 365 дней, включая дни прилёта и вылета
              - textbox "Количество дней расходов" [ref=f6e231]: "3"
          - paragraph [ref=f6e232]:
            - generic [ref=f6e233]:
              - checkbox "Все путешественники — взрослые" [checked] [ref=f6e234]
              - text: Все путешественники — взрослые
          - region [ref=f6e235]:
            - heading "Личные профили бюджета" [level=3] [ref=f6e236]
            - paragraph [ref=f6e237]: Это ваши допущения в PLN, а не средние цены города. Готовых цен в профилях нет. Введите диапазоны или перенесите свои суммы. Введённые расходы, включая 0, имеют приоритет.
            - group "Личные профили бюджета" [ref=f6e238]:
              - button "Экономно" [ref=f6e239] [cursor=pointer]
              - button "Стандартно" [ref=f6e240] [cursor=pointer]
              - button "Комфортно" [ref=f6e241] [cursor=pointer]
              - button "Без профиля" [pressed] [ref=f6e242] [cursor=pointer]
          - group [ref=f6e243]:
            - generic "Ориентировочные расходы на месте" [ref=f6e244] [cursor=pointer]
            - 'option "Барселона: T-casual, 10 поездок, 1 зона — 13,00 EUR" [selected]'
          - paragraph [ref=f6e245]:
            - link "Полное руководство по бюджету поездки" [ref=f6e246] [cursor=pointer]:
              - /url: /ru/info/trip-budget
          - heading "Основные расходы" [level=3] [ref=f6e247]
          - generic [ref=f6e248]:
            - generic [ref=f6e249]:
              - generic [ref=f6e250]: Перелёты (PLN)
              - generic [ref=f6e251]: На человека, за все запланированные участки
              - textbox "Перелёты (PLN)" [ref=f6e252]:
                - /placeholder: Неизвестно
                - text: "200.25"
              - generic [ref=f6e253]:
                - text: Скопированная запись цены перелёта — не цена в реальном времени
                - group [ref=f6e254]:
                  - generic "Происхождение суммы" [ref=f6e255] [cursor=pointer]
            - generic [ref=f6e256]:
              - generic [ref=f6e257]: Как указана цена проживания?
              - combobox "Как указана цена проживания?" [ref=f6e258]:
                - option "За ночь — вся группа" [selected]
                - option "За всё пребывание — вся группа"
              - generic [ref=f6e259]:
                - generic [ref=f6e260]: Проживание (PLN)
                - generic [ref=f6e261]: За ночь для всей группы (все номера)
                - textbox "Проживание (PLN)" [ref=f6e262]:
                  - /placeholder: Неизвестно
                - generic [ref=f6e263]: Неизвестно
              - generic [ref=f6e264]: Каждое поле сохраняет свою сумму. В итог входит только выбранный вариант; после изменения дат или числа гостей проверьте цену заново.
            - generic [ref=f6e265]:
              - generic [ref=f6e266]: Трансферы и транспорт (PLN)
              - generic [ref=f6e267]: "Всего для группы: оба аэропорта, обратные трансферы и поездки, не указанные отдельно"
              - textbox "Трансферы и транспорт (PLN)" [ref=f6e268]:
                - /placeholder: Неизвестно
              - generic [ref=f6e269]: Неизвестно
            - generic [ref=f6e270]:
              - generic [ref=f6e271]: Питание и ежедневные расходы (PLN)
              - generic [ref=f6e272]: На человека в день
              - textbox "Питание и ежедневные расходы (PLN)" [ref=f6e273]:
                - /placeholder: Неизвестно
              - generic [ref=f6e274]: Неизвестно
          - group [ref=f6e275]:
            - 'generic "Дополнительные расходы: багаж, городской транспорт, развлечения и резерв" [ref=f6e276] [cursor=pointer]'
        - status [ref=f6e277]:
          - heading "Ориентировочный бюджет всей группы (PLN)" [level=3] [ref=f6e278]
          - paragraph [ref=f6e279]: Исправьте отмеченные поля и даты для расчёта бюджета.
        - paragraph [ref=f6e280]: Это ваш план расходов, а не предложение или бронирование. Проверьте итоговые цены у продавцов. Черновик доступен только в этом браузере; удаление данных сайта удалит и черновики.
        - button "Очистить калькулятор" [ref=f6e281] [cursor=pointer]
        - region "Сохранить поездку и поделиться" [ref=f6e282]:
          - heading "Сохраните план поездки" [level=3] [ref=f6e283]
          - paragraph [ref=f6e284]: Сохранено только в этом профиле браузера на этом устройстве. Удаление данных сайта удалит планы. Сохраните ссылку, чтобы открыть копию в другом месте.
          - paragraph [ref=f6e285]: Сохранение открывает план из списка. Нажмите «Обновить план», чтобы сохранить в нём последующие правки. Отправка ссылки создаёт независимую копию.
          - paragraph [ref=f6e286]: Ссылка содержит маршрут, даты, число людей и введённый бюджет. Любой получатель может увидеть эти данные. Это копия плана, а не актуальное предложение продавца.
          - paragraph [ref=f6e287]: "Новые ссылки хранят план после # в адресе, вне запроса к сайту. Ссылка не зашифрована: любой получатель может прочитать план. Браузер и сервис, куда вы вставите ссылку, могут сохранить полный адрес."
          - paragraph [ref=f6e288]: В этой версии есть несохранённые правки.
          - generic [ref=f6e289]:
            - button "Сохранить поездку" [ref=f6e290] [cursor=pointer]
            - button "Поделиться" [ref=f6e291] [cursor=pointer]
            - link "Сохранённые поездки" [ref=f6e292] [cursor=pointer]:
              - /url: /ru/saved
          - paragraph
      - generic [ref=f6e293]:
        - heading "Цена на фоне истории" [level=2] [ref=f6e295]
        - generic [ref=f6e296]:
          - group "Цена на фоне истории" [ref=f6e297]:
            - paragraph [ref=f6e298]:
              - strong [ref=f6e299]: Цена на 49,75 PLN ниже медианы выборки.
              - text: "Медиана: 250,00 PLN."
            - paragraph [ref=f6e300]: "Наблюдений: 24. Порог сравнения: 5; выборка не охватывает весь рынок."
            - paragraph [ref=f6e301]:
              - text: "Первая запись этой цены в HopTrip:"
              - time [ref=f6e302]: чт, 5 нояб. 2026 г., 14:15
              - text: (время в Польше).
            - paragraph [ref=f6e303]: Наличие мест и окончательную цену уточняйте у партнёра. Проверки в реальном времени нет.
          - paragraph [ref=f6e304]: Мы оцениваем ценовое предложение по сохранённым данным. Результат не оценивает авиакомпанию, комфорт или вероятность покупки.
          - group [ref=f6e305]:
            - generic "Как устроен вспомогательный балл сортировки?" [ref=f6e306] [cursor=pointer]
          - link "Полная методика сравнения цен →" [ref=f6e307] [cursor=pointer]:
            - /url: /ru/info/price-comparison
  - contentinfo [ref=f6e308]:
    - generic [ref=f6e309]:
      - generic [ref=f6e310]: HopTrip.
      - paragraph [ref=f6e311]: "Партнёрская ссылка: мы можем получить комиссию после бронирования. Мы не продаём билеты."
    - navigation "О сервисе" [ref=f6e312]:
      - link "Как работает HopTrip" [ref=f6e313] [cursor=pointer]:
        - /url: /ru/info
      - link "City break" [ref=f6e314] [cursor=pointer]:
        - /url: /ru/city-break
      - link "Перелёты на выходные" [ref=f6e315] [cursor=pointer]:
        - /url: /ru/tanie-loty-na-weekend
      - link "Перелёты из Варшавы" [ref=f6e316] [cursor=pointer]:
        - /url: /ru/from/warszawa
      - link "Сохранённые поездки" [ref=f6e317] [cursor=pointer]:
        - /url: /ru/saved
      - link "Уведомления о перелётах" [ref=f6e318] [cursor=pointer]:
        - /url: /ru/alerts
      - link "О HopTrip" [ref=f6e319] [cursor=pointer]:
        - /url: /ru/info/about
      - link "Контакты" [ref=f6e320] [cursor=pointer]:
        - /url: /ru/info/contact
      - link "Конфиденциальность" [ref=f6e321] [cursor=pointer]:
        - /url: /ru/info/privacy
      - link "Условия использования" [ref=f6e322] [cursor=pointer]:
        - /url: /ru/info/terms
      - link "Партнёрство" [ref=f6e323] [cursor=pointer]:
        - /url: /ru/info/partners
    - button "Настройки конфиденциальности" [ref=f6e325] [cursor=pointer]
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