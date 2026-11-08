# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-analytics.spec.ts >> product taxonomy follows real actions without private payloads in ru
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
  - link "Перейти к содержимому" [ref=f5e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f5e3]:
    - link "HopTrip — главная" [ref=f5e4] [cursor=pointer]:
      - /url: /ru
      - generic [aria-hidden] [ref=f5e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f5e6]: .
    - navigation "Основная навигация" [ref=f5e7]:
      - link "Недорогие перелёты" [ref=f5e8] [cursor=pointer]:
        - /url: /ru/deals
      - link "На выходные" [ref=f5e9] [cursor=pointer]:
        - /url: /ru/tanie-loty-na-weekend
      - link "Направления" [ref=f5e10] [cursor=pointer]:
        - /url: /ru/destinations
      - link "Сохранённое" [ref=f5e11] [cursor=pointer]:
        - /url: /ru/saved
      - link "Калькулятор бюджета" [ref=f5e12] [cursor=pointer]:
        - /url: /ru/info/trip-budget
    - navigation "Язык" [ref=f5e13]:
      - link "Polski" [ref=f5e14] [cursor=pointer]:
        - /url: /deals/browser-13
      - link "Русский" [ref=f5e15] [cursor=pointer]:
        - /url: /ru/deals/browser-13
      - link "English" [ref=f5e16] [cursor=pointer]:
        - /url: /en/deals/browser-13
      - link "Українська" [ref=f5e17] [cursor=pointer]:
        - /url: /uk/deals/browser-13
  - main [ref=f5e19]:
    - link "← Актуальные предложения" [ref=f5e20] [cursor=pointer]:
      - /url: /ru/deals
    - article [ref=f5e21]:
      - generic [ref=f5e22]:
        - paragraph [ref=f5e23]: Туда и обратно
        - heading [level=1] [ref=f5e24]:
          - text: Вроцлав (WRO) → Барселона
          - img "Испания" [ref=f5e25]
        - paragraph [ref=f5e26]: "Даты вылетов: вт, 8 дек. 2026 г. – пт, 11 дек. 2026 г."
        - paragraph [ref=f5e27]: "Ночей на месте: 3 (расчётно) планируемого пребывания — даты проживания проверьте отдельно."
      - navigation "Разделы плана поездки" [ref=f5e28]:
        - link "Перелёт и бронирование" [ref=f5e29] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "Жильё и досуг" [ref=f5e30] [cursor=pointer]:
          - /url: "#trip-stay"
        - link "Бюджет всей поездки" [ref=f5e31] [cursor=pointer]:
          - /url: "#calculator"
        - link "Сохранить и поделиться" [ref=f5e32] [cursor=pointer]:
          - /url: "#trip-save"
      - region "Перелёт и бронирование" [ref=f5e33]:
        - generic [ref=f5e34]:
          - region "Цена перелёта" [ref=f5e35]:
            - paragraph [ref=f5e36]: за человека · PLN
            - paragraph [ref=f5e37]:
              - text: 213,00 PLN
              - 'generic "Около 48 €. Средний курс NBP от пт, 6 нояб. 2026 г.: 1 EUR = 4,3925 PLN. Курс при оплате может отличаться." [ref=f5e38]':
                - generic [aria-hidden] [ref=f5e39]: ≈ 48 €
              - generic [ref=f5e41]: за человека · туда и обратно
            - generic [ref=f5e42]:
              - paragraph [ref=f5e43]:
                - text: "Время сохранённого наблюдения:"
                - time [ref=f5e44]: вс, 8 нояб. 2026 г., 18:25
                - text: (время в Польше).
              - paragraph [ref=f5e45]: Наличие мест и окончательную цену уточняйте у партнёра. Проверки в реальном времени нет.
              - group [ref=f5e46]:
                - generic "Происхождение цены и срок показа" [ref=f5e47] [cursor=pointer]
            - paragraph [ref=f5e48]:
              - strong [ref=f5e49]: Нет надёжного сравнения этой цены с историей.
            - heading "Детали перелёта" [level=2] [ref=f5e50]
            - generic [ref=f5e51]:
              - note [ref=f5e52]:
                - strong [ref=f5e53]: Неполные данные перелёта
                - paragraph [ref=f5e54]: Не все часы перелёта известны.
                - group [ref=f5e55]:
                  - generic "Какие данные нужно проверить?" [ref=f5e56]
                - paragraph [ref=f5e57]: Полнота данных не подтверждает наличие у продавца.
              - paragraph [ref=f5e58]:
                - strong [ref=f5e59]: Вылет
                - text: "· 8 дек.: WRO 11:00 → BCN 13:00 · расчёт."
                - generic [ref=f5e60]: Без пересадок
              - paragraph [ref=f5e61]:
                - strong [ref=f5e62]: Возвращение
                - text: "· 11 дек.: BCN 11:00 → WRO время неизвестно"
                - generic [ref=f5e63]: "Пересадок: 1"
              - paragraph [ref=f5e64]:
                - strong [ref=f5e65]: День и время обратного прилёта нужно уточнить.
              - paragraph [ref=f5e66]: "Необходимость отпуска: нужно уточнить"
              - paragraph [ref=f5e67]: "Индекс удобства поездки (модель): 17/100 · неполные данные"
              - generic [ref=f5e69]:
                - paragraph [ref=f5e70]:
                  - strong [ref=f5e71]: Пересадка на обратном пути
                - list [ref=f5e72]:
                  - listitem [ref=f5e73]: Детали пересадок не подтверждены. Уточни время, аэропорты и условия трансфера у партнёра.
              - paragraph [ref=f5e74]: "Между прилётом и обратным вылетом: 70 ч 0 мин (оценка) · BCN → BCN. Время в городе неизвестно."
              - paragraph [ref=f5e75]: Местное время · Расчётное время прилёта
              - paragraph [ref=f5e77]: Время и стоимость доезда неизвестны — проверьте транспорт на дату поездки.
              - paragraph [ref=f5e78]: "Вылет: Ryanair (FR) · Возвращение: Перевозчика обратно нужно уточнить"
            - paragraph [ref=f5e79]: Цена указана за перелёт. Проживание не включено. Багаж нужно уточнить
            - group [ref=f5e80]:
              - generic "Полные данные рейса и багаж" [ref=f5e81] [cursor=pointer]
          - region [ref=f5e82]:
            - heading "Переход к партнёру" [level=2] [ref=f5e83]
            - generic [ref=f5e84]: Партнёрство
            - generic [ref=f5e85]:
              - paragraph [ref=f5e86]:
                - text: 213,00 PLN
                - 'generic "Около 48 €. Средний курс NBP от пт, 6 нояб. 2026 г.: 1 EUR = 4,3925 PLN. Курс при оплате может отличаться." [ref=f5e87]':
                  - generic [aria-hidden] [ref=f5e88]: ≈ 48 €
                - generic [ref=f5e90]: за человека · туда и обратно
              - status [ref=f5e91]:
                - paragraph [ref=f5e92]: Ссылка для бронирования пока недоступна.
                - link "Перейти в каталог перелётов" [ref=f5e93] [cursor=pointer]:
                  - /url: /ru/deals
            - paragraph [ref=f5e94]: "Партнёрская ссылка: мы можем получить комиссию после бронирования. Мы не продаём билеты."
        - generic [ref=f5e95]:
          - heading "Цена на фоне истории" [level=2] [ref=f5e96]
          - generic [ref=f5e97]:
            - group "Цена на фоне истории" [ref=f5e98]:
              - paragraph [ref=f5e99]:
                - strong [ref=f5e100]: Нет надёжного сравнения этой цены с историей.
              - paragraph [ref=f5e101]: Число наблюдений неизвестно. Недостаточно сопоставимых данных.
              - paragraph [ref=f5e102]:
                - text: "Время сохранённого наблюдения:"
                - time [ref=f5e103]: вс, 8 нояб. 2026 г., 18:25
                - text: (время в Польше). Источник времени неизвестен.
              - paragraph [ref=f5e104]: Наличие мест и окончательную цену уточняйте у партнёра. Проверки в реальном времени нет.
            - paragraph [ref=f5e105]: Мы оцениваем ценовое предложение по сохранённым данным. Результат не оценивает авиакомпанию, комфорт или вероятность покупки.
            - paragraph [ref=f5e106]: Нет полных данных, согласованных с показанной ценой. Надёжно восстановить сравнение и баллы нельзя. Требуется пересчёт предложения.
            - link "Полная методика сравнения цен →" [ref=f5e107] [cursor=pointer]:
              - /url: /ru/info/price-comparison
      - region [ref=f5e108]:
        - heading "Жильё и досуг" [level=2] [ref=f5e109]
        - region [ref=f5e110]:
          - heading "Найти жильё — Барселона" [level=2] [ref=f5e111]
          - paragraph [ref=f5e112]: Жильё бронируется отдельно от перелёта. Даты проживания и взрослые общие с бюджетом; даты перелёта не меняются.
          - paragraph [ref=f5e113]: Даты проживания выбираются отдельно от дат перелёта. Проверьте местные даты прилёта и обратного вылета.
          - complementary "Местные даты по расписанию:" [ref=f5e114]:
            - paragraph [ref=f5e115]:
              - strong [ref=f5e116]: "Местные даты по расписанию:"
              - text: прилёт
              - time [ref=f5e117]: вт, 8 дек. 2026 г.
              - text: · обратный вылет
              - time [ref=f5e118]: пт, 11 дек. 2026 г.
            - paragraph [ref=f5e119]: Прилёт рассчитан по длительности рейса. Подтвердите дату и расписание у партнёра.
            - paragraph [ref=f5e120]: Даты можно изменить; проверьте трансфер и время заселения.
          - group [ref=f5e121]:
            - generic "Как согласовать даты проживания с перелётом?" [ref=f5e122] [cursor=pointer]
          - group "Даты проживания и взрослые" [ref=f5e123]:
            - generic [ref=f5e125]:
              - generic [ref=f5e126]:
                - generic [ref=f5e127]: Заезд
                - textbox "Заезд" [ref=f5e128]: 2026-12-08
              - generic [ref=f5e129]:
                - generic [ref=f5e130]: Выезд
                - textbox "Выезд" [ref=f5e131]: 2026-12-11
              - generic [ref=f5e132]:
                - generic [ref=f5e133]: Взрослые
                - spinbutton "Взрослые" [ref=f5e134]: "1"
          - generic [ref=f5e135]:
            - paragraph [ref=f5e136]:
              - strong [ref=f5e137]: Барселона
              - text: ": вт, 8 дек. 2026 г. – пт, 11 дек. 2026 г. · 3 ночи · взрослых: 1."
            - link "Найти жильё через Stay22 (новая вкладка)" [ref=f5e138] [cursor=pointer]:
              - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-12-08&checkout=2026-12-11&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
          - paragraph [ref=f5e139]: Цену и наличие жилья проверьте в Stay22. HopTrip не получает котировку; суммы в бюджете вводятся вручную.
          - paragraph [ref=f5e140]: Партнёрская ссылка — мы можем получить комиссию. Передаём только взрослых; детей и их возраст укажите у партнёра. Проверьте даты, гостей, цену и условия отмены.
          - group [ref=f5e141]:
            - generic "Как добавить стоимость жилья в план?" [ref=f5e142] [cursor=pointer]
          - link "Добавить стоимость жилья в бюджет поездки" [ref=f5e143] [cursor=pointer]:
            - /url: "#budget-hotel-basis"
        - region [ref=f5e144]:
          - paragraph [ref=f5e145]: Идеи для поездки · Барселона
          - heading "Музеи и достопримечательности" [level=2] [ref=f5e146]
          - paragraph [ref=f5e147]: Билеты покупают отдельно. Наличие на даты поездки проверь у продавца или на официальном сайте достопримечательности.
          - list [ref=f5e148]:
            - listitem [ref=f5e149]:
              - generic [ref=f5e150]: Архитектура
              - heading "Casa Batlló — билет Blue" [level=3] [ref=f5e151]
              - paragraph [ref=f5e152]: Интерьеры дома, спроектированного Гауди, аудиогид и пространство Gaudí Cube.
              - paragraph [ref=f5e153]:
                - strong [ref=f5e154]: "Для кого:"
                - text: Для тех, кто интересуется архитектурой Гауди и посещением с аудиогидом.
              - paragraph [ref=f5e155]:
                - strong [ref=f5e156]: "Время посещения:"
                - text: Около 1 часа для варианта Blue; без дороги и ожидания входа.
              - paragraph [ref=f5e157]: Вариант Blue не включает террасу на крыше, планшет VR или вход без очереди. Проверьте время входа и язык аудиогида.
              - generic [ref=f5e158]:
                - paragraph [ref=f5e159]: Цену нужно уточнить в Tiqets
                - paragraph [ref=f5e160]: Партнёрская ссылка — мы можем получить комиссию за покупку.
                - 'link "Уточнить даты и цену в Tiqets: Casa Batlló — билет Blue (новая вкладка)" [ref=f5e161] [cursor=pointer]':
                  - /url: https://tiqets.tpx.gr/JikjB3NX
                  - text: Уточнить даты и цену
                - paragraph [ref=f5e162]:
                  - link "Источник времени посещения (новая вкладка)" [ref=f5e163] [cursor=pointer]:
                    - /url: https://www.casabatllo.es/en/visit/faqs/
            - listitem [ref=f5e164]:
              - generic [ref=f5e165]: Океанариум
              - heading "Aquarium Barcelona — входной билет" [level=3] [ref=f5e166]
              - paragraph [ref=f5e167]: "Морской мир в Port Vell: аквариумы и выставки о жизни под водой."
              - paragraph [ref=f5e168]:
                - strong [ref=f5e169]: "Для кого:"
                - text: Для семей и тех, кто интересуется морской природой; вариант посещения в помещении.
              - paragraph [ref=f5e170]:
                - strong [ref=f5e171]: "Время посещения:"
                - text: Ориентировочно 1,5–2 часа на посещение; без дороги и очереди.
              - paragraph [ref=f5e172]: Проверьте дату посещения, часы работы и правила детских билетов.
              - generic [ref=f5e173]:
                - paragraph [ref=f5e174]: Цену нужно уточнить в Tiqets
                - paragraph [ref=f5e175]: Партнёрская ссылка — мы можем получить комиссию за покупку.
                - 'link "Уточнить даты и цену в Tiqets: Aquarium Barcelona — входной билет (новая вкладка)" [ref=f5e176] [cursor=pointer]':
                  - /url: https://tiqets.tpx.gr/ALlisode
                  - text: Уточнить даты и цену
                - paragraph [ref=f5e177]:
                  - link "Источник времени посещения (новая вкладка)" [ref=f5e178] [cursor=pointer]:
                    - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
            - listitem [ref=f5e179]:
              - generic [ref=f5e180]: Природа · бесплатный вход
              - heading "Hivernacle — оранжерея в парке Ciutadella" [level=3] [ref=f5e181]
              - paragraph [ref=f5e182]: Историческая оранжерея с коллекциями растений в парке Ciutadella.
              - paragraph [ref=f5e183]:
                - strong [ref=f5e184]: "Для кого:"
                - text: Для любителей растений и спокойной прогулки среди зелени.
              - paragraph [ref=f5e185]: Бесплатный вход относится к самостоятельному посещению. Проверьте часы и закрытия; экскурсии с гидом имеют отдельные правила и бронирование.
              - generic [ref=f5e186]:
                - paragraph [ref=f5e187]: "Самостоятельное посещение: по официальному сайту вход бесплатный."
                - 'link "Уточнить правила посещения: Hivernacle — оранжерея в парке Ciutadella (новая вкладка)" [ref=f5e188] [cursor=pointer]':
                  - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                  - text: Уточнить правила посещения
          - paragraph [ref=f5e189]: Достопримечательности не включены в стоимость перелёта. До покупки проверь состав билета, льготы и условия отмены. В дни поездки учти время перелётов и трансферов.
          - paragraph [ref=f5e190]: Изменения дат и состава группы в плане автоматически не передаются по этой ссылке. Проверьте дату, участников и цену у партнёра.
          - paragraph [ref=f5e191]: Описания и правила проверены пн, 12 окт. 2026 г.. Это обзор источников, а не подтверждение наличия билетов на даты поездки.
          - paragraph [ref=f5e192]: В калькуляторе укажи общую стоимость выбранных достопримечательностей в PLN на человека за всё проживание. Если цены билетов различаются, используй среднюю на человека. Бесплатный вход не означает, что дорога тоже бесплатна.
          - link "Учесть достопримечательности в бюджете" [ref=f5e193] [cursor=pointer]:
            - /url: "#calculator"
        - region [ref=f5e194]:
          - generic [ref=f5e195]:
            - generic [ref=f5e196]:
              - heading "События во время поездки" [level=2] [ref=f5e197]
              - paragraph [ref=f5e198]: Концерты, спорт и культура в городе назначения. Билеты на события покупаются отдельно.
            - generic [ref=f5e199]: Ticketmaster
          - paragraph [ref=f5e200]:
            - generic [ref=f5e201]: Ваша поездка · Барселона
            - strong [ref=f5e202]: 8 дек. 2026 г. – 11 дек. 2026 г.
          - generic [ref=f5e203]:
            - strong [ref=f5e204]: Даты поездки
            - button "Другие даты" [ref=f5e205] [cursor=pointer]
          - paragraph [ref=f5e206]: Даты общие с жильём и бюджетом. Изменения автоматически обновляют события. Это даты плана — проверьте их соответствие расписанию перелёта.
          - generic [ref=f5e207]:
            - generic [ref=f5e208]:
              - text: С
              - textbox "С" [ref=f5e209]: 2026-12-08
            - generic [ref=f5e210]:
              - text: По
              - textbox "По" [ref=f5e211]: 2026-12-11
            - generic [ref=f5e212]:
              - text: Категория
              - combobox "Категория" [ref=f5e213]:
                - option "Все" [selected]
                - option "Музыка"
                - option "Спорт"
                - option "Культура"
                - option "Другое"
            - button "Найти события" [ref=f5e214] [cursor=pointer]
          - generic [ref=f5e216]:
            - text: Совместимость с перелётом
            - combobox "Совместимость с перелётом" [ref=f5e217]:
              - option "Все события" [selected]
              - option "Может подойти к перелёту"
          - paragraph [ref=f5e218]: Этот режим скрывает только явные конфликты с перелётом. События с малым запасом или неполными данными остаются видимыми. Формальности в аэропорту и дорогу до места нужно проверить; посещение не гарантируется.
          - generic [ref=f5e219]:
            - generic [ref=f5e220]:
              - text: События по дням
              - combobox "События по дням" [ref=f5e221]:
                - option "Все дни" [selected]
                - option "вт, 8 дек."
                - option "ср, 9 дек."
                - option "чт, 10 дек."
                - option "пт, 11 дек."
            - button "Предыдущий день" [disabled] [ref=f5e222]: ←
            - button "Следующий день" [ref=f5e223] [cursor=pointer]: →
          - status [ref=f5e224]:
            - paragraph [ref=f5e225]:
              - text: "Показано событий:"
              - strong [ref=f5e226]: "3"
              - text: · Все дни · Местное время
          - group [ref=f5e227]:
            - generic "Совместимость с расписанием перелёта" [ref=f5e228] [cursor=pointer]
          - list [ref=f5e229]:
            - listitem [ref=f5e230]:
              - generic [ref=f5e231]:
                - generic [ref=f5e232]: Музыка
                - generic [aria-hidden] [ref=f5e233]: 8 дек.
              - heading "Synthetic concert" [level=3] [ref=f5e234]
              - paragraph [ref=f5e235]: Synthetic venue · Барселона
              - paragraph [ref=f5e236]:
                - time [ref=f5e237]: 8 дек. 2026 г.
                - text: · 20:00
              - paragraph [ref=f5e238]: "Часовой пояс события: Europe/Madrid"
              - paragraph [ref=f5e239]: По данным источника в продаже — наличие нужно проверить
              - note "Совместимость с расписанием перелёта" [ref=f5e240]:
                - paragraph [ref=f5e241]:
                  - strong [ref=f5e242]: Совместимость с перелётом не проверена
                - paragraph [ref=f5e243]: Длительность неизвестна.
              - paragraph [ref=f5e244]: Уточните цену у продавца
              - 'link "Проверить даты и цену: Synthetic concert. Откроется в новой вкладке" [active] [ref=f5e245] [cursor=pointer]':
                - /url: https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret
                - text: Проверить даты и цену
                - generic [aria-hidden] [ref=f5e246]: ↗
              - generic [ref=f5e247]:
                - 'button "Добавить в план: Synthetic concert" [disabled] [ref=f5e248]': Добавить в план
                - paragraph [ref=f5e249]: "Не удалось сохранить билет: данные неполные или ссылка требует проверки."
            - listitem [ref=f5e250]:
              - generic [ref=f5e251]:
                - generic [ref=f5e252]: Музыка
                - generic [aria-hidden] [ref=f5e253]: 8 дек.
              - heading "Synthetic variants" [level=3] [ref=f5e254]
              - paragraph [ref=f5e255]: Synthetic venue · Барселона
              - paragraph [ref=f5e256]:
                - time [ref=f5e257]: 8 дек. 2026 г.
                - text: · 20:00
              - paragraph [ref=f5e258]: "Часовой пояс события: Europe/Madrid"
              - paragraph [ref=f5e259]: По данным источника в продаже — наличие нужно проверить
              - paragraph [ref=f5e260]: Одинаковые дата и время начала. Оценка перелёта учитывает все варианты; проверьте, что входит в выбранный билет.
              - note "Совместимость с расписанием перелёта" [ref=f5e261]:
                - paragraph [ref=f5e262]:
                  - strong [ref=f5e263]: Совместимость с перелётом не проверена
                - paragraph [ref=f5e264]: Длительность неизвестна.
              - generic [ref=f5e265]:
                - heading "Варианты билетов" [level=4] [ref=f5e266]
                - list [ref=f5e267]:
                  - listitem [ref=f5e268]:
                    - paragraph [ref=f5e269]:
                      - strong [ref=f5e270]: Основное предложение
                    - paragraph [ref=f5e271]: Synthetic standard
                    - paragraph [ref=f5e272]: Уточните цену у продавца
                    - 'link "Проверить даты и цену: Synthetic standard (Основное предложение). Откроется в новой вкладке" [ref=f5e273] [cursor=pointer]':
                      - /url: https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret
                      - text: Проверить даты и цену
                      - generic [aria-hidden] [ref=f5e274]: ↗
                    - generic [ref=f5e275]:
                      - 'button "Добавить в план: Synthetic standard" [disabled] [ref=f5e276]': Добавить в план
                      - paragraph [ref=f5e277]: "Не удалось сохранить билет: данные неполные или ссылка требует проверки."
            - listitem [ref=f5e278]:
              - generic [ref=f5e279]:
                - generic [ref=f5e280]: Музыка
                - generic [aria-hidden] [ref=f5e281]: 8 дек.
              - heading "Synthetic cancelled" [level=3] [ref=f5e282]
              - paragraph [ref=f5e283]: Synthetic venue · Барселона
              - paragraph [ref=f5e284]:
                - time [ref=f5e285]: 8 дек. 2026 г.
                - text: · 20:00
              - paragraph [ref=f5e286]: "Часовой пояс события: Europe/Madrid"
              - paragraph [ref=f5e287]: Статус продажи неизвестен
              - note "Совместимость с расписанием перелёта" [ref=f5e288]:
                - paragraph [ref=f5e289]:
                  - strong [ref=f5e290]: Совместимость с перелётом не проверена
                - paragraph [ref=f5e291]: Длительность неизвестна.
              - paragraph [ref=f5e292]: Уточните цену у продавца
          - paragraph [ref=f5e293]: "Источник: Ticketmaster · Время проверки неизвестно"
          - paragraph [ref=f5e294]: Данные каталога, а не наличие в реальном времени. Статус продажи и цена от не гарантируют билетов; уточните у продавца. Неактивные или неизвестные продажи нельзя добавить из списка в план.
          - group [ref=f5e295]:
            - generic "Перед покупкой" [ref=f5e296] [cursor=pointer]
          - paragraph [ref=f5e297]: "Партнёрские ссылки: HopTrip может получить комиссию от покупки. Наличие билетов и правила входа уточняйте у продавца."
          - paragraph [ref=f5e298]: Изменения дат и состава группы в плане автоматически не передаются по этой ссылке. Проверьте дату, участников и цену у партнёра.
        - navigation "Спланировать пребывание" [ref=f5e299]:
          - heading "Спланировать пребывание" [level=2] [ref=f5e300]
          - list [ref=f5e301]:
            - listitem [ref=f5e302]:
              - 'link "Барселона: BCN, Жирона или Реус" [ref=f5e303] [cursor=pointer]':
                - /url: /ru/info/barcelona-airports
            - listitem [ref=f5e304]:
              - 'link "Барселона за 3 дня: план осмотра и бюджет поездки" [ref=f5e305] [cursor=pointer]':
                - /url: /ru/info/barcelona-3-days
      - region [ref=f5e306]:
        - heading "Калькулятор бюджета поездки" [level=2] [ref=f5e307]
        - paragraph [ref=f5e308]: Введите свои суммы в PLN. Пустое поле означает неизвестный расход; укажите 0, если расхода нет или он уже учтён в другой строке.
        - paragraph [ref=f5e309]: Известная цена перелёта копируется из предложения на человека и покрывает только его участки. Добавьте недостающий обратный билет к сумме перелётов, если его нет в предложении; не считайте его повторно, если он уже включён. Это наблюдавшаяся цена, а не подтверждение бронирования. Остальные суммы — ваши оценки или цены, введённые вручную; мы не проверяем их у продавцов.
        - group "Режим калькулятора" [ref=f5e310]:
          - button "Быстрый бюджет" [pressed] [ref=f5e311] [cursor=pointer]
          - button "Подробный бюджет" [ref=f5e312] [cursor=pointer]
        - paragraph [ref=f5e313]: Оба режима учитывают все введённые расходы и события. Переключение сохраняет суммы. Раскройте подробности, чтобы заполнить недостающие расходы.
        - group [ref=f5e314]:
          - generic "Как считаются расходы?" [ref=f5e315] [cursor=pointer]
        - paragraph [ref=f5e316]: Сохранённый черновик восстановлен. Дальнейшие изменения сохраняются автоматически.
        - group "Ваш план поездки" [ref=f5e317]:
          - generic [ref=f5e319]:
            - heading "Начните с основных расходов" [level=3] [ref=f5e320]
            - paragraph [ref=f5e321]: Укажите путешественников и длительность пребывания, затем перелёты, проживание, питание и трансферы. Профили и справочные тарифы находятся ниже.
            - paragraph [ref=f5e322]: "Основные расходы введены: 2/4. Это ещё не полный бюджет."
            - generic [ref=f5e323]:
              - 'button "Заполнить: Питание и ежедневные расходы" [ref=f5e324] [cursor=pointer]'
              - 'button "Заполнить: Трансферы и транспорт" [ref=f5e325] [cursor=pointer]'
          - generic [ref=f5e326]:
            - generic [ref=f5e327]:
              - generic [ref=f5e328]: Начало пребывания (необязательно)
              - textbox "Начало пребывания (необязательно)" [ref=f5e329]: 2026-12-08
            - generic [ref=f5e330]:
              - generic [ref=f5e331]: Конец пребывания (необязательно)
              - textbox "Конец пребывания (необязательно)" [ref=f5e332]: 2026-12-11
          - paragraph [ref=f5e333]: Даты пересчитывают ночи и дни расходов. Эти значения можно изменить вручную. Даты пребывания также используются при поиске жилья. Даты предложения перелёта не меняются.
          - generic [ref=f5e334]:
            - generic [ref=f5e335]:
              - generic [ref=f5e336]: Количество взрослых
              - generic [ref=f5e337]: От 1 до 50 человек
              - textbox "Количество взрослых" [ref=f5e338]: "1"
            - generic [ref=f5e339]:
              - generic [ref=f5e340]: Количество ночей
              - generic [ref=f5e341]: От 0 до 365 ночей
              - textbox "Количество ночей" [ref=f5e342]: "3"
            - generic [ref=f5e343]:
              - generic [ref=f5e344]: Количество дней расходов
              - generic [ref=f5e345]: От 1 до 365 дней, включая дни прилёта и вылета
              - textbox "Количество дней расходов" [ref=f5e346]: "4"
          - paragraph [ref=f5e347]:
            - generic [ref=f5e348]:
              - checkbox "Все путешественники — взрослые" [checked] [ref=f5e349]
              - text: Все путешественники — взрослые
          - heading "Основные расходы" [level=3] [ref=f5e350]
          - generic [ref=f5e351]:
            - generic [ref=f5e352]:
              - generic [ref=f5e353]: Перелёты (PLN)
              - generic [ref=f5e354]: На человека, за все запланированные участки
              - textbox "Перелёты (PLN)" [ref=f5e355]:
                - /placeholder: Неизвестно
                - text: "213.00"
              - generic [ref=f5e356]:
                - text: Скопированная запись цены перелёта — не цена в реальном времени
                - group [ref=f5e357]:
                  - generic "Происхождение суммы" [ref=f5e358] [cursor=pointer]
            - generic [ref=f5e359]:
              - generic [ref=f5e360]: Как указана цена проживания?
              - combobox "Как указана цена проживания?" [ref=f5e361]:
                - option "За ночь — вся группа" [selected]
                - option "За всё пребывание — вся группа"
              - generic [ref=f5e362]:
                - generic [ref=f5e363]: Проживание (PLN)
                - generic [ref=f5e364]: За ночь для всей группы (все номера)
                - textbox "Проживание (PLN)" [ref=f5e365]:
                  - /placeholder: Неизвестно
                  - text: "200"
                - generic [ref=f5e366]: Ваша сумма — требует проверки
              - generic [ref=f5e367]: Каждое поле сохраняет свою сумму. В итог входит только выбранный вариант; после изменения дат или числа гостей проверьте цену заново.
            - generic [ref=f5e368]:
              - generic [ref=f5e369]: Трансферы и транспорт (PLN)
              - generic [ref=f5e370]: "Всего для группы: оба аэропорта, обратные трансферы и поездки, не указанные отдельно"
              - textbox "Трансферы и транспорт (PLN)" [ref=f5e371]:
                - /placeholder: Неизвестно
              - generic [ref=f5e372]: Неизвестно
            - generic [ref=f5e373]:
              - generic [ref=f5e374]: Питание и ежедневные расходы (PLN)
              - generic [ref=f5e375]: На человека в день
              - textbox "Питание и ежедневные расходы (PLN)" [ref=f5e376]:
                - /placeholder: Неизвестно
              - generic [ref=f5e377]: Неизвестно
          - group [ref=f5e378]:
            - 'generic "Дополнительные расходы: багаж, городской транспорт, развлечения и резерв" [ref=f5e379] [cursor=pointer]'
        - status [ref=f5e380]:
          - heading "Сумма известных расходов · PLN" [level=3] [ref=f5e381]
          - paragraph [ref=f5e382]:
            - strong [ref=f5e383]: 813,00 PLN
          - paragraph [ref=f5e384]:
            - text: "На человека при равном делении (округлённо):"
            - strong [ref=f5e385]: 813,00 PLN
          - paragraph [ref=f5e386]: "Бюджет неполный. Осталось заполнить: Багаж и дополнения к перелёту, Трансферы и транспорт, Городской транспорт, Питание и ежедневные расходы, Развлечения и входные билеты, Другие расходы и резерв, Налоги и сборы, Аварийный резерв."
        - group "Сравнение личных профилей" [ref=f5e387]:
          - region [ref=f5e388]:
            - heading "Личные профили бюджета" [level=3] [ref=f5e389]
            - paragraph [ref=f5e390]: Это ваши допущения в PLN, а не средние цены города. Готовых цен в профилях нет. Введите диапазоны или перенесите свои суммы. Введённые расходы, включая 0, имеют приоритет.
            - group "Личные профили бюджета" [ref=f5e391]:
              - button "Экономно" [ref=f5e392] [cursor=pointer]
              - button "Стандартно" [ref=f5e393] [cursor=pointer]
              - button "Комфортно" [ref=f5e394] [cursor=pointer]
              - button "Без профиля" [pressed] [ref=f5e395] [cursor=pointer]
          - group [ref=f5e396]:
            - generic "Ориентировочные расходы на месте" [ref=f5e397] [cursor=pointer]
            - 'option "Барселона: T-casual, 10 поездок, 1 зона — 13,00 EUR" [selected]'
          - paragraph [ref=f5e398]:
            - link "Полное руководство по бюджету поездки" [ref=f5e399] [cursor=pointer]:
              - /url: /ru/info/trip-budget
        - group [ref=f5e400]:
          - generic "Расходы всей группы по категориям" [ref=f5e401] [cursor=pointer]
        - paragraph [ref=f5e402]: Это ваш план расходов, а не предложение или бронирование. Проверьте итоговые цены у продавцов. Черновик доступен только в этом браузере; удаление данных сайта удалит и черновики.
        - button "Очистить калькулятор" [ref=f5e403] [cursor=pointer]
      - region "Сохранить поездку и поделиться" [ref=f5e404]:
        - heading "Сохраните план поездки" [level=2] [ref=f5e405]
        - paragraph [ref=f5e406]: Сохранено только в этом профиле браузера на этом устройстве. Удаление данных сайта удалит планы. Сохраните ссылку, чтобы открыть копию в другом месте.
        - paragraph [ref=f5e407]: Сохранение открывает план из списка. Нажмите «Обновить план», чтобы сохранить в нём последующие правки. Отправка ссылки создаёт независимую копию.
        - paragraph [ref=f5e408]: Ссылка содержит маршрут, даты, число людей и введённый бюджет. Любой получатель может увидеть эти данные. Это копия плана, а не актуальное предложение продавца.
        - paragraph [ref=f5e409]: "Новые ссылки хранят план после # в адресе, вне запроса к сайту. Ссылка не зашифрована: любой получатель может прочитать план. Браузер и сервис, куда вы вставите ссылку, могут сохранить полный адрес."
        - paragraph [ref=f5e410]: Этот план сохранён.
        - generic [ref=f5e411]:
          - button "Сохранить поездку" [ref=f5e412] [cursor=pointer]
          - button "Поделиться" [ref=f5e413] [cursor=pointer]
          - link "Сохранённые поездки" [ref=f5e414] [cursor=pointer]:
            - /url: /ru/saved
        - paragraph
  - contentinfo [ref=f5e415]:
    - generic [ref=f5e416]:
      - generic [ref=f5e417]: HopTrip.
      - paragraph [ref=f5e418]: "Партнёрская ссылка: мы можем получить комиссию после бронирования. Мы не продаём билеты."
    - navigation "О сервисе" [ref=f5e419]:
      - link "Как работает HopTrip" [ref=f5e420] [cursor=pointer]:
        - /url: /ru/info
      - link "City break" [ref=f5e421] [cursor=pointer]:
        - /url: /ru/city-break
      - link "Перелёты на выходные" [ref=f5e422] [cursor=pointer]:
        - /url: /ru/tanie-loty-na-weekend
      - link "Перелёты из Варшавы" [ref=f5e423] [cursor=pointer]:
        - /url: /ru/from/warszawa
      - link "Сохранённые поездки" [ref=f5e424] [cursor=pointer]:
        - /url: /ru/saved
      - link "Уведомления о перелётах" [ref=f5e425] [cursor=pointer]:
        - /url: /ru/alerts
      - link "О HopTrip" [ref=f5e426] [cursor=pointer]:
        - /url: /ru/info/about
      - link "Контакты" [ref=f5e427] [cursor=pointer]:
        - /url: /ru/info/contact
      - link "Конфиденциальность" [ref=f5e428] [cursor=pointer]:
        - /url: /ru/info/privacy
      - link "Условия использования" [ref=f5e429] [cursor=pointer]:
        - /url: /ru/info/terms
      - link "Партнёрство" [ref=f5e430] [cursor=pointer]:
        - /url: /ru/info/partners
    - button "Настройки конфиденциальности" [ref=f5e432] [cursor=pointer]
  - alert [ref=f5e433]
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