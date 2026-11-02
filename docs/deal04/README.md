# DEAL-04 — качество данных перелёта

Дата: 2026-10-30. Задача выбрана после DATA-02; зависимость AUD-02 выполнена. Изменения только в checkout и изолированных тестовых окружениях.

## Подтверждённое исходное состояние

`flight_facts` и `validated_segments` уже проверяли отдельные факты и provenance структурированных legs. Общей категории качества в Deal API не было. Отсутствующие return airports не восстанавливались автоматически, рассчитанные arrival times имели отдельные flags. Каталог/redirect проверяли freshness и affiliate policy независимо от полноты расписания. Главная и GuideFlights выбирали предложения без общего quality gate. Новая классификация переиспользует эти проверки.

## Контракт и политика

`services/flight_quality.py` вычисляет `DealRead.flight_quality` при сериализации: `version=flight-quality-v1`, `status`, allowlisted `reasons`, вычисляемый `recommendation_eligible`. Последний — только условие качества, а не booking availability или статистическая confidence. БД, source payload, historical observations, saved score и цены от чтения не меняются. Миграции/массовый backfill не нужны.

| Категория | Правило | Представление |
|---|---|---|
| COMPLETE | Поддерживаемый источник, согласованные обязательные аэропорты/даты, подтверждённые часы обеих сторон, известные timezone/stops/carrier | Обычная карточка; прежние freshness/link gates продолжают действовать |
| PARTIAL | Обязательный маршрут и календарь известны, но нет точных часов, arrival рассчитан, неизвестны timezone/stops/carrier | Видимое предупреждение, причина и дополнительные причины; допускается в подборки |
| CRITICAL_INCOMPLETE | Нет проверяемого источника/обязательного маршрута/дат, есть конфликт, неверные даты или недопустимый duration | Предупреждение в обычном каталоге/деталях/общем flight summary; исключение из автоматических подборок главной и GuideFlights |

Критическая категория имеет приоритет над PARTIAL. Истёкший COMPLETE не становится PARTIAL только из-за возраста: lifetime/visibility/CTA остаются отдельными проверками DATA-01/03. COMPLETE также не гарантирует багаж, тариф, наличие мест, неизменную цену или полноту данных обо всех возможных параметрах перелёта.

Стандартный каталог, total, detail и `/go` не получают нового quality exclusion. Они сохраняют свои прежние ограничения, а неполные записи не удаляются. API `is_featured` маскируется в false для critical, сохранённое поле Deal не изменяется. Цена, order/score formula, historical confidence и affiliate tracking не меняются. Email/editorial workflows этой задачей не переписывались и не запускались; публичный gate относится к названным web-подборкам, а не ко всем внутренним каналам рассылок.

Подборки фильтруют первые 100 результатов перед `.slice(0,6)` / `.slice(0,3)`. Это ограниченное окно, не исчерпывающая выборка всех подходящих records. При нехватке проверенных предложений карточки не выдумываются; пояснение направляет к полному каталогу. Старый/неизвестный API quality contract закрывает eligibility и показывает предупреждение до обновления backend.

## Точные границы проверки

- Поддерживаемый профиль сейчас — `travelpayouts_data`, FLIGHT, dict payload. Отсутствие связанного offer/неподдерживаемый источник/повреждённый payload даёт UNVERIFIED_SOURCE, а не обещание качества.
- Origin сверяется с canonical Airport, destination — с IATA и provider/wildcard DestinationAlias. Несколько FLIGHT components или заданные противоречащие FK считаются конфликтом. Отсутствующий FK сам по себе не опровергает явно заданные route codes.
- Для round-trip нужны явные return airports из REST или подтверждённых legs. Open-jaw допустим: return не обязан быть зеркалом outbound. Аэропорты не угадываются. Самоперелёт одного аэропорта и подтверждённые противоречия критичны.
- Offset datetime проверяется общим parser и сопоставляется с сохранённым UTC; строгая date-only дата может быть PARTIAL. Невозможная дата, naive timestamp, расхождение timestamps или return до outbound/arrival критичны. Подтверждённые structured legs могут заполнить отсутствие дублирующих REST дат/stops; raw payload остаётся прежним.
- Указанный duration должен быть integer (не bool), от 1 до 10080 минут включительно. Это существующий технический предел 7 суток, не оценка правдоподобия по географии. Structured legs проходят прежний validator с provenance/ticket/price/endpoints/times; supplied `segments`, не прошедшие его, считаются конфликтом.
- Local timezone/carrier reference ограничен имеющимся справочником. Нет полной проверки всемирного реестра IATA, live seller inventory или независимого подтверждения расписания. Даже корректный синтаксис кода не доказывает существование аэропорта.
- UI использует общую FlightQualityNotice внутри FlightSchedule и один reason dictionary на PL/EN/RU/UK. Сырые provider strings в предупреждение не выводятся. Причины сверх первой раскрываются через native details/summary.

## Изменённые области

- API: schema, pure classifier, catalog serializer; guarded malformed payload и использование подтверждённого outbound departure/stops в flight_facts.
- Web: общий тип/eligibility helper, localized quality copy, компонент предупреждения, scoped contrast style, home/guide selection.
- Tests: 28 новых backend cases, 3 Node tests, 2 browser scenarios на desktop/mobile; local-only synthetic quality endpoint.
- `docs/aud05/prepare-e2e.ps1` теперь копирует также nonignored untracked `.py/.ts/.tsx/.mjs` только из runtime/test source directories. Это позволяет проверять новые ещё не tracked модули; приватные env/operator files не добавляются по этой ветке. Копия имеет отдельные SQLite/.next, порты 3125/8125 и временный Turbopack root.

## Проверки

Backend запускался SDK PyCharm `.venv/Scripts/python.exe` (Python 3.12.10), с APP_ENV=test, DATABASE_URL=sqlite://, отключёнными alerts/digest/editor/events sync. PYTHONPATH добавлял `.cache/sec01-updated` и `apps/api`; это прежние изолированные pytest 9.0.3/certifi 2026.10.23, SDK packages не заменялись.

| Проверка | Результат / доказательство |
|---|---|
| `-m pytest apps/api/tests -m "not postgres" -q` | 761 passed, 15 deselected, 2 прежних deprecation warnings; 67.30 s; [backend.xml](backend.xml) |
| `-m pytest apps/api/tests -m postgres -q` | 15 passed, 761 deselected, 2 прежних warnings; 26.28 s; [postgres.xml](postgres.xml) |
| Targeted quality/route/provider/serializer tests | 84 passed, 2 warnings; [targeted.xml](targeted.xml); до добавления последнего structured redundancy case, не суммируется с full |
| `npm run test:unit` | 115 passed, 0 failed |
| Ruff / mypy | Passed; mypy 101 source files |
| `npm run lint` / `npm run build` | Passed; TypeScript и 61 static/SSG pages |
| Chrome Playwright, isolated copy | Final focused run: 8/8, unexpected=0, errors=[], 83.20 s; [e2e-final.json](e2e-final.json). Четыре новых quality cases, два open-jaw regression и два origin preference regression |

Итого 776 различных backend tests, включая 28 новых non-PG. Все девять областей master plan покрыты: missing origin/destination/return airport, estimated times, invalid dates, airport mismatch, unreasonable duration, expired quality independence, provider conflicts. API integration отдельно проверяет retention/list total/redirect, derived featured без DB mutation и COMPLETE без booking availability.

Сводка фактических outputs tooling и browser stats: [checks.json](checks.json). npm сообщил предупреждение об унаследованном env config `min-release-age`; ESLint/build завершились успешно, конфигурация окружения не менялась.

Первый небольшой API probe уже прошёл с новым полем: [before.xml](before.xml) не является доказательством красной фазы до реализации. В черновике unit case ошибочно трактовал допустимый open-jaw как конфликт; тест исправлен явным противоречащим REST return airport, логика продукта для этого не ужесточалась. Targeted/full результаты не складываются. Ruff выявил отсутствовавший test-only import ticket_key; mypy потребовал typed default factory и suppression документированного decorator-stack ограничения Pydantic. Финальные проверки прошли.

Первый E2E: 12 pass, 2 failure, [e2e-initial.json](e2e-initial.json). Axe нашёл реальный contrast defect: inherited светлый paragraph text на светлом warning background в featured detail. Добавлен scoped `.flight-quality.notice p` ink color; повтор проверяет обе категории с предупреждением. Initial failures не скрываются и не считаются пройденными.

После contrast fix полный выбранный `flight-quality.spec.ts flight-facts.spec.ts` run: 13/14 pass, 1 desktop open-jaw переход не нашёл detail return leg; [e2e-after-contrast.json](e2e-after-contrast.json), 124.48 s. Причина этого единичного отсутствия элемента не установлена; продукт/locator для обхода ошибки не менялись. Focused final command добавил origin regression и повторил open-jaw и оба quality scenarios на desktop/mobile: `node node_modules/@playwright/test/cli.js test flight-quality.spec.ts flight-facts.spec.ts roadmap-baseline.spec.ts --grep 'source data|critical warnings|different return airports|airport preference' --reporter=json`. Все 8 прошли; отдельные повторные результаты не суммируются. Остальные 8 flight-facts cases прошли в предыдущем run. Это выбранная browser regression, не полный E2E suite.

Проверены desktop/mobile, четыре языка на 320 px, отсутствие горизонтального overflow и axe в detail summary для трёх категорий. Нулевые axe violations в этой области не означают полную WCAG-сертификацию. Chrome headless использовал installed channel, HOPTRIP_TEST_PYTHON из SDK; реальные seller/booking данные не запрашивались.

543 runtime-файла изолированной копии побайтно совпадают с checkout, включая новые untracked modules: [source-parity.json](source-parity.json). Только собственные fixture servers 3125/8125 завершились после tests; другие серверы не останавливались. После build восстановлены исходные dev routes imports в generated next-env.d.ts, diff этого файла пуст.

PostgreSQL 16 — disposable container `hoptrip-deal04-20261030`, label DEAL-04, DB hoptrip_test, loopback 64327, без host volumes. Применены существующие миграции до 0020; новых миграций в DEAL-04 нет. После tests label проверен, контейнер остановлен и удалён через `--rm`. Production DB, секреты, рассылки, инфраструктура и deployment не затрагивались.

## Release / rollback

Сначала backend с additive quality contract, затем web с отображением/selection gate. Если web обновлён раньше, неизвестный contract даёт warning и пустые автоматические подборки; обычный каталог остаётся доступен. В этой задаче нет DB upgrade, но зависимости уже установленной версии DATA-01/02 по-прежнему действуют.

Rollback: согласованно вернуть только изменения DEAL-04 backend/web; сохранить прежние SEC/DATA исправления и БД. Не откатывать всё дерево или пользовательский master plan. Нет quality backfill/DB column для удаления; сохранённые source records не требуют восстановления. При возврате старого web автоматические подборки снова теряют quality gate.

Задача ограничена DEAL-04. Следующая по execution order — UX-01 (AUD-03 DONE); не начата.
