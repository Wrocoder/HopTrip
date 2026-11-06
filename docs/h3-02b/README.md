# H3-02b — отображение хронологии, 2026-11-03

Статус: **DONE**. Вместе с H3-02a закрывает H3-02. Следующая отдельная задача — H3-01; в этом запуске она не начинается. Коммит и deployment не выполнялись.

## Подтверждённая проблема и изменение

Карточка и подробности выводили длительность из дат вылетов через tripNights, email/Telegram — из Deal.nights. Эти значения не подтверждают число ночей после фактического прилёта в пункт назначения. Обратный прилёт в компактном расписании выделялся только при известном смещении дня; при неизвестном времени явного предупреждения не было.

Теперь card/detail и актуальное расписание открытого saved/shared плана используют `timelineView` и `flight_facts.timeline` v1. Ночи на месте, дата обратного вылета и дата обратного прилёта имеют разный смысл. Даты заголовка подписаны как даты вылетов. Прилёт показан в фактический return-destination airport, включая отличие от аэропорта отправления, с локальной датой, signed day offset и отметкой estimated. При неизвестном прилёте явно требуется уточнить день и время. PL/EN/RU/UK используют один frontend formatter.

Email и Telegram используют общий Python `timeline_text` поверх того же вычисленного timeline. Между Python и TypeScript общий контракт, а не исполняемый модуль: Python формирует дату ISO, web — локализованную дату; смысл ночей/unknown/estimated/offset одинаков. Email сохраняет существующий польский язык; Telegram поддерживает четыре языка. Доставка в проверках подменена, реальных сообщений нет.

## Совместимость и границы

- Новое поле optional для web-клиента: старый API читается через проверенные timestamps и airport timezones. Явные null нового timeline сохраняют unknown; значения Deal.nights и даты заголовка не служат fallback. Повреждённый присутствующий timeline отклоняется существующим API validator, как остальные malformed поля.
- Signed offset форматируется отдельно от ночей; нулевой offset не выводится. Наивные времена и неизвестные зоны не превращаются в известные локальные даты.
- Модель H3-02a, Deal.nights, фильтры, saved snapshot/draft v1, URLs и вручную введённые даты/суммы бюджета сохранены. План проживания сам по себе не подтверждает даты рейса. Просроченный/недоступный shared план сохраняет существующее предупреждение вместо актуального расписания.
- Journey elapsed остаётся отдельным полем API H3-02a; новый ranking удобства и no-leave режим относятся к последующим задачам. Миграций, backfill, dependencies и feature flags нет.

## Проверки

SDK: PyCharm Python 3.12.10, `.venv/Scripts/python.exe`. Browser: Chrome через существующий Playwright, desktop и mobile. Изолированная копия `.cache/aud05-h3-02b-20261103`, loopback 3125/8125; чужие серверы не останавливались. В копии для browser используется `npm run start` после production build; рабочий конфиг не менялся.

| Проверка | Результат / evidence |
|---|---|
| Полный API: `-m pytest -q -p no:cacheprovider --junitxml=docs/h3-02b/api-final.xml` | **948 passed, 18 skipped**, 94.13s; [вывод](api-final.txt), [JUnit](api-final.xml) |
| Полный frontend: `npm run test:unit` | **226 passed, 0 failed**; [вывод](node-final.txt) |
| Browser: `npm run test:e2e -- trip-timeline.spec.ts local-flight-time.spec.ts shared-trip.spec.ts --reporter=json` | **16 passed**; [JSON](browser.json), [вывод](browser.txt) |
| Ruff: `-m ruff check apps/api --no-cache` | PASS; [вывод](ruff.txt) |
| mypy: `-m mypy apps/api/app --cache-dir .cache/h3-02b-mypy` | PASS, 115 source files; [вывод](mypy.txt) |
| Web ESLint: `npm run lint` | exit 0; [вывод](lint.txt) |
| Production build/TypeScript: `npm run build` в изолированной копии | exit 0; [вывод](build-final.txt) |

Новые unit cases: четыре языка, одинаковые данные legacy/new API, authoritative unknown, отсутствующая зона, actual KRK, +1 день, one-way; Python formatter проверяет estimated и unknown. Browser matrix проверяет одинаковый неизвестный прилёт card/detail/shared, ручные 123 PLN и дату 2090-01-15, отсутствие overflow при 320px. Существующие browser cases проверяют ночной прилёт 25 октября (+1 день), estimated, сохранение сумм и независимость копий плана; shared-flow содержит axe-проверку. Это не полный accessibility/performance audit.

Первый API-прогон: 947 passed /1 failed /18 skipped — старое ожидание `liczba nocy: 2` в email fixture без подтверждённого прилёта. Тест обновлён на честный unknown и отсутствие прежнего утверждения; итоговый полный прогон зелёный. [Исходный JUnit](api.xml) сохранён. Первый build выявил TS18048 для optional flight facts; добавлена явная проверка наличия facts, итоговая сборка успешна. [Исходный build](build.txt) сохранён.

Ограничения: 18 PostgreSQL tests skipped, два прежних deprecation warnings Starlette/httpx и anyio. Production данные, реальная доставка, WebKit, полный визуальный sweep и CWV не проверялись; улучшение KPI не заявляется.

## Изменённые файлы и rollback

Web: `src/lib/trip-timeline.ts`, `flight-facts.ts`, `api.ts`, `api-contract.ts`; `components/catalog.tsx`, `flight-schedule.tsx`, `deals/[slug]/page.tsx`; `tests/trip-timeline.test.mjs`, `trip-timeline.spec.ts`. API: `services/trip_timeline_text.py`, `alert_digests.py`, `telegram_delivery.py`; `tests/test_trip_timeline_text.py`, `test_alert_digests.py`. Документы: этот каталог, H3 progress/decisions.

Rollback только delta H3-02b: вернуть прежнее отображение/шаблоны уведомлений, убрать новый TS formatter/тип/validator и Python renderer, соответствующие новые tests и строку ожидания email. Сохранить additive API timeline и timezone fix H3-02a, H3-04 и все предыдущие пользовательские изменения. Нельзя делать общий reset к HEAD: в checkout накоплены отдельные предыдущие задачи. DB rollback не требуется.
