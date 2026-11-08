# V4-02 — проблемные пересадки

Дата: 2026-11-07. **V4-02 DONE локально.** [Результаты проверок](verification.json). Deployment не выполнялся.

## Поведение и границы данных

Добавлен additive контракт `DealRead.connection_assessment` версии `connections-v1`. Он описывает пересадки отдельно от полноты `FlightQuality`, цены и оценки пригодности пребывания V4-01. Сортировки/ranking V4-03 не менялись.

Длительность — UTC-разница между фактическим прилётом предыдущего и вылетом следующего flight leg того же билета. Не используются airborne duration, различия календарных дат или обратные предположения об аэропортах. Outbound и return оцениваются отдельно; пребывание между ними не считается пересадкой. При неизвестной IANA-зоне длительность по явно заданным source offsets остаётся известной, а ночной характер остаётся неизвестным.

| Правило | Начальное значение / смысл |
|---|---|
| Длинная пересадка | ≥360 минут, включительно |
| Короткий интервал | <90 минут — потенциальный риск, не подтверждённое airport MCT |
| Ночная пересадка | Пересечение местной полуночи или положительный интервал, начинающийся в 00:00–06:00; граница 06:00 не включается |
| Смена аэропорта | Arrival airport предыдущего leg отличается от departure airport следующего; всегда требует проверки наземного трансфера |
| Защита/самостоятельный трансфер | UNKNOWN: текущий source contract не содержит подтверждения; номер билета/перевозчик/одна ссылка защиту не доказывают |

Ночное время считается в поясе **аэропорта прилёта**, включая случай смены аэропортов. DST не меняет UTC-длительность. Интервал 0 минут получает предупреждение о риске; он не объявляется осуществимым. `risky_transfer=false` не является подтверждением безопасности/стыкуемости.

`Settings.connection_policy` принимает JSON из env:

```text
CONNECTION_POLICY={"long_layover_minutes":360,"short_transfer_minutes":90}
```

Поля можно задавать частично; значения — 1–10080 минут. Применённые пороги возвращаются в API. Это продуктовые допущения предупреждений, не новые факты о расписании или правилах аэропортов. Production env не менялся.

## Смена аэропорта без ослабления проверки маршрута

Существующий `validated_segments` по-прежнему отвергает airport discontinuity. Внутренний общий валидатор переиспользован с отдельным входом `connection_warning_segments`: он сохраняет проверку источника, exact-ticket key, цены/валюты, outbound/return instants, endpoints, stops/duration и хронологии; разрешается только обнаружить gap между аэропортами для **предупреждения**.

Enrichment сохраняет такую source evidence для диагностики, увеличивая отдельный `warning_routes`, а не `enriched`. Повторный lookup уже известной evidence не выполняется. Цена, TTL и freshness не обновляются. `flight_facts`, `FlightQuality`, timeline и рекомендация выходных по-прежнему используют строгий вход: неподтверждённый наземный трансфер не делает маршрут полноценным. Физический переезд не придумывается. Новый persistence model/миграция не нужны — используется существующее JSON route_details.

Невалидная/чужая evidence не создаёт фактов пересадки. При заявленных stops без подтверждённых сегментов показывается неизвестность деталей. Если source contract не предоставляет сегменты для one-way, показывается такое же предупреждение, без выдуманной длительности. Конфликт контекста deal/offer не позволяет привязать к карточке чужую пересадку.

API возвращает KNOWN/PARTIAL/UNKNOWN для **данных пересадки**, не для защищённости или наличия билетов. Airport change и отсутствующие зоны дают PARTIAL. Direct legs не порождают пересадку; разные аэропорты прилёта и обратного вылета после пребывания не считаются сменой аэропорта в рамках connection.

## Интерфейс и совместимость

- Предупреждения показаны вне свёрнутых деталей на карточке и странице поездки: направление, аэропорт(ы), минуты, длинная/ночная пересадка, смена аэропорта, потенциальный риск и неизвестная защита.
- PL/EN/RU/UK; существующие warning design tokens, без нового UI framework. У неизвестных зон нет догадки о ночном времени. Наземный переезд и защита стыковки не обещаются.
- Неизвестные детали при заявленной пересадке заметны; direct flight без пересадки не получает ложного предупреждения.
- Старые payloads без additive поля остаются читаемыми. Присутствующие malformed данные/unsupported protection claims отвергаются клиентским контрактом.
- APIs/SEO URLs, DB models, existing affiliate tracking, weekend eligibility и историческая оценка цены сохранены. Реальные запросы к поставщикам, deployment, worker activation и уведомления не выполнялись.

## Файлы

Новые runtime:

- `apps/api/app/schemas/connection.py`, `apps/api/app/services/connections.py`.
- `apps/web/src/lib/connections.ts`, `apps/web/src/app/components/connection-warnings.tsx`, `connection-warnings.module.css`.

Изменённые runtime:

- `apps/api/app/config.py`, `schemas/deal.py`, `services/catalog.py`, `services/flight_routes.py`, `services/route_enrichment.py`.
- `apps/web/src/lib/api.ts`, `api-contract.ts`, `src/app/components/flight-schedule.tsx`.

Тесты:

- Новые `apps/api/tests/test_connections.py`, `connection_fixtures.py`, `connection_browser_fixtures.py`; test-only endpoint в `e2e_app.py`.
- Новые `apps/web/tests/connections.test.mjs`, `connections.spec.ts`; дополнен `api-response.test.mjs`.
- Уточнён старый `flight-quality.spec.ts`: assertions scoped к основной секции коротких поездок, PARTIAL REST arrivals не сертифицируют stay согласно V4-01; общий каталог проверяется с учётом pagination и query-контекста обратной ссылки. Наличие оферты в общем каталоге по-прежнему обязательно.
- Документы: этот отчёт, V4 progress, краткие результаты verification. Предшествующие пользовательские изменения сохранены; baseline затронутых существующих файлов — локальный `.cache/v4-02-before`.

## Проверки

| Проверка | Результат |
|---|---|
| Новые unit до реализации | 31 failure: assessment отсутствовала |
| Backend targeted | 66 PASS: 35 новых connection unit/integration + 31 existing return route checks |
| Полный API | 1294 PASS, 18 PostgreSQL SKIP; две существующие deprecation warnings |
| Node full suite | 349 PASS |
| Ruff | PASS, apps/api |
| mypy | PASS, 124 source files |
| ESLint | PASS |
| Production build/TypeScript | PASS, 61 static entries |
| Browser, первый прогон | 26 PASS / 10 FAIL из 36: 8 новых cases не ожидали перехода после клика; 2 старых quality cases имели устаревшие ожидания главной |
| Browser, повтор | 12 PASS / 2 FAIL из 14: все 10 новых cases и 2 critical quality PASS; оставшиеся 2 — старое предположение о первой странице/точном href каталога |
| Browser, последующие targeted | Промежуточный 0/2 подтвердил необходимость учитывать pagination; финальный **2/2 PASS** с проверкой реального индекса оферты в price-order и нужной страницы |
| Browser, последние результаты | **36 уникальных cases PASS**: новые connections, прежние flight-facts/quality/local-flight-time и V4-01. Это объединение последних результатов, не единый clean-run полного inventory |

Unit/integration: оба направления, 0/89/90/359/360/361 минут, DST spring/fall, локальная полночь/06:00, unknown zone, airport gap без ослабления validated route, чужой ticket/price/source/endpoints, naive/reversed times, stops mismatch, missing segments, one-way unknown, env validation, неподдерживаемые protection flags, real mocked enrichment/cache и сохранение prices/TTL, совпадение list/detail с custom policy.

В первом browser-run новые карточки/предупреждения/axe проходили до проверки detail: обнаружена недостающая синхронизация после клика (проверка ещё видела каталог). Добавлено ожидание конкретного detail URL, не произвольный timeout. Старый quality spec обнаружил устаревшие ожидания homepage количества/пригодности после V4-01, query-параметров обратной ссылки и pagination; исправлен только тестовый контракт. При проверке общего каталога тест сначала подтверждает наличие оферты в реальном API price-order, затем открывает её страницу из расчёта 12 результатов. Строгие production-фильтры не ослаблялись.

Подтверждены видимость предупреждений вне details, данные/переводы всех 6 synthetic сценариев, четыре локали, desktop/mobile, отсутствие overflow при 320px, axe без нарушений и предупреждения в серверном HTML без JavaScript. Скриншот EN320 страницы airport-change просмотрен. Последние правки только тестов дополнительно проверены targeted ESLint. Генерируемый `next-env.d.ts` восстановлен точно к состоянию перед задачей, fixture servers завершены.

Команды из корня (web — из `apps/web`):

```text
.venv/Scripts/python.exe -m pytest -q --tb=short -p no:cacheprovider --junitxml=.cache/v4-02-api.xml
.venv/Scripts/python.exe -m ruff check apps/api
.venv/Scripts/python.exe -m mypy
node --experimental-strip-types --test --test-reporter=dot tests/*.test.mjs
npm run lint
npm run build
```

Browser использует существующий Playwright и local-only fixture runtime, предварительно проверенный PyCharm Python 3.12.10 через HOPTRIP_TEST_PYTHON, PLAYWRIGHT_CHANNEL=chrome, desktop/mobile projects. Первый набор: `connections.spec.ts flight-facts.spec.ts flight-quality.spec.ts local-flight-time.spec.ts weekend-recommendations.spec.ts`; повтор: `connections.spec.ts flight-quality.spec.ts`; финальный targeted: `flight-quality.spec.ts --grep 'complete, partial'`. Полные локальные артефакты: `.cache/v4-02-api.xml`, `.cache/v4-02-browser.json`, `.cache/v4-02-browser-final.json`, `.cache/v4-02-browser-quality-final.json`, `.cache/v4-02-browser-quality-pagination.json`. Краткие результаты и последние статусы каждого case сохранены в verification.json. Полный inventory browser/WebKit/Lighthouse/field CWV/PG/live provider acceptance не проверялся.

## Откат и дальнейшая работа

Вернуть только перечисленные runtime/test-файлы к состоянию перед V4-02, сохранив V4-01 и пользовательские правки; миграция/DB downgrade не нужны. Добавленные diagnostic-only JSON данные старый строгий валидатор отвергает, не превращая их в достоверный маршрут.

Следующая отдельная задача после завершения V4-02 — **V4-03: отдельный рейтинг удобства**. В этом выполнении она не начинается.
