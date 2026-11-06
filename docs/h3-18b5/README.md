# H3-18b5 — показатели новых действий в защищённом отчёте

2026-11-06. **H3-18b5 DONE локально; H3-18 IN_PROGRESS.** Scope §1.2 V3: агрегаты трёх существующих событий в прежних защищённых usage API/admin HTML. Нового сбора данных нет; cohorts/save-revisit/реальные сравнения — следующие отдельные части.

## Основание и контракт

H3-18b2–b4 уже добавили TRIP_UPDATE, DEAL_DETAILS_OPEN, BUDGET_CALCULATED и счётчики `summary.by_event`. В usage-отчёте были11 прежних метрик и ordered-session-funnel-v1; отдельного engagement-блока не было. [Before-test](api-before.txt) подтвердил отсутствие поля.

`GET /api/v1/admin/analytics/usage` получает **дополнительное optional поле `engagement`**:

```json
{"version":"received-session-engagement-v1","metrics":[
  {"key":"detail_disclosure","status":"available","numerator":1,"denominator":4,"percent":"25.00"},
  {"key":"budget_completion","status":"available","numerator":2,"denominator":4,"percent":"50.00"},
  {"key":"trip_update","status":"available","numerator":2,"denominator":4,"percent":"50.00"}
]}
```

**Пример исключительно синтетический:**13 событий /4 сессии, повторные действия, восстановленный бюджет без BUDGET_USE и Update без TRIP_SAVE. Это не production KPI. [Машинные определения](metrics.json), [actual fixture JSON](usage-populated.json).

| Ключ | Числитель | Знаменатель |
|---|---|---|
| detail_disclosure | Сессии с DEAL_DETAILS_OPEN | Все наблюдаемые продуктовые сессии окна |
| budget_completion | Сессии с BUDGET_CALCULATED | Тот же |
| trip_update | Сессии с TRIP_UPDATE | Тот же |

Сессия учитывается один раз на показатель независимо от повторов/числа предложений или планов. Population — прежние17 allowed product events без placeholder sessions, UTC `[start,end)`, включая сессии без PAGE_VIEW. Это **доли наблюдаемых сессий с полученными действиями**, не межэтапная конверсия, оценка всех людей, bookings или returning visitor. Порядок действий здесь не связывается в путь.

В fixture BUDGET_USE и TRIP_SAVE имеют по1сессии, completion/update — по2. Наивное деление дало бы200%; правильные received-session доли —50%. Данные не содержат plan/search identity для точного пути. Отсутствие событий при denominator>0 даёт `available/0.00`, то есть ноль полученных действий, **не доказательство отсутствия использования или полного покрытия трекингом**. Denominator0 даёт `no_data/null`, не нулевую конверсию. Сравнивать можно только одинаковые taxonomy/collection windows.

## Совместимость и отображение

Старые `metrics` (11 записей), `page_cohorts` и `ordered_funnel` сохранены вместе с определениями и порядком. `engagement=None` по умолчанию допускает старый конструктор/JSON при локальной валидации; renderer тогда не выводит новую секцию. Внешние JSON readers должны допускать дополнительные поля. Версия фиксирует определения новых показателей, не меняет wire taxonomy v4.

`GET /api/v1/admin/analytics/dashboard?locale=pl|en|ru|uk` показывает отдельную секцию с тремя карточками, явными числителями/знаменателями и ограничениями. Используется прежний renderer/стили карточек; новая секция имеетh2, карточкиh3. Сохранены admin auth, script-free/noindex/no-store/no-referrer/CSP и отсутствие raw IDs/metadata/токена. Новые строки локализованы во всех4языках.

В пустом состоянии прежняя cohort-таблица без строк заменена существующим локализованным `no_data` сообщением. API `page_cohorts=[]` не менялся. Начальный browser run остановился после8 успешных проверок на `th-has-data-cells` **incomplete**, не подтверждённом axe violation: [первый лог](browser-initial.txt), [частичные проверки](browser-initial.json). В [сохранённом pre-change renderer HTML](empty-before-pl.html) также есть пустая таблица; [actual before axe](empty-before-axe.json) содержит0violations и тот же incomplete. Первый probe ошибочно ожидал violation и упал ([лог](browser-before-probe-initial.txt)); probe исправлен, чтобы фиксировать реальную классификацию и структуру. Правила axe не выключались, элементы не исключались. После исправления empty state все48 текущих проверок имеют0violations/0incomplete.

Изменены только3 runtime Python-файла: usage schema, usage_metrics, usage_dashboard. [Delta относительно начала выполнения](runtime-delta.patch). Новых запросов БД, миграций, event fields, identifiers, consent/session/transport/frontend bundle changes, SaaS или зависимостей нет. Агрегаты используют уже выбранные и отфильтрованные events/by_name; старый предел20000rows иmax31days/413 без усечения сохраняются. SQL-only SELECT и privacy regression проходят.

## Проверки

| Проверка | Результат | Evidence |
|---|---|---|
| API baseline | 93 passed | [лог](api-baseline.txt), [JUnit](api-baseline.xml) |
| Usage/new18cases + analytics/funnel | **111 passed**, 2 warnings | [лог](api.txt), [JUnit](api.xml) |
| После финальных HTML empty-state/copy правок | **68 passed** usage/new/ordered-funnel | [лог](api-final.txt), [JUnit](api-final.xml) |
| Browser4locale ×3states ×4widths | **48/48 final**,0violations/incomplete/overflow/pageerror/HTTP requests; skip-link работает | [JSON](browser.json), [лог](browser.txt) |
| Ruff / mypy | PASS / 122 source files PASS | [Ruff](ruff-final.txt), [mypy](mypy-final.txt) |
| Полный API suite до финальных HTML-only правок | **1156 passed /1 failed /18 PostgreSQL skipped**,2warnings | [лог](full-api.txt), [JUnit](full-api.xml) |

API tests проверяют duplicate sessions, orphan completion/update без ложной конверсии,0/null, UTC boundaries/placeholder exclusion, прежние показатели/воронку, legacy constructor и12localized populated/zero/empty HTML variants без raw metadata. Existing auth/limit/no-store/CSP/SELECT tests входят в прошедшие наборы. Rendered HTML fixtures созданы настоящим TestClient endpoint на синтетической SQLite, затем browser открывал **file://** с действующим meta CSP. Это не live browser login/API integration: auth/headers проверены отдельно pytest. HTTP requests при просмотре файлов запрещены assertions, глобальный bypassCSP не включался.

Полный API **не зелёный**: прежний `test_real_api_to_queue_to_mock_telegram_journey` с вылетом2026-11-06T09:00Z уже в прошлом. Before/current/future fixture controls сохранены [в H3-18b2](../h3-18b2/README.md). Его код и runtime не менялись. Warnings — прежние Starlette/httpx и anyio deprecation. [RU320](engagement-ru-320.png) / [EN1440](engagement-en-1440.png) просмотрены; это не полный visual audit, WebKit/manualSR/physical devices не проверялись.

IDE result — `ide-build.json` с limited diagnostics. Новый Next build/Node suite не запускались: изменён Python-rendered admin report, web source/bundle не менялись. Backend imports/HTTP rendering проверены pytest, типы — mypy. После финальной HTML/copy правки повторён затронутый68-test набор и весь48-check browser sweep; полный API suite повторно не запускался.

## Воспроизведение и откат

Из корня, Python через настроенный PyCharm SDK3.12.10 после preflight:

```powershell
$env:HOPTRIP_18B5_EVIDENCE = (Resolve-Path docs/h3-18b5).Path
.venv/Scripts/python.exe -m pytest apps/api/tests/test_engagement_usage.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py -q
.venv/Scripts/python.exe -m ruff check apps/api/app/schemas/usage.py apps/api/app/services/usage_metrics.py apps/api/app/services/usage_dashboard.py apps/api/tests/test_engagement_usage.py
.venv/Scripts/python.exe -m mypy apps/api/app
node docs/h3-18b5/browser.mjs
node docs/h3-18b5/verify.mjs
```

Browser helper использует уже установленные Playwright/axe/Chrome. Для before diagnostic: `PYTHONPATH=apps/api`, SDK command `docs/h3-18b5/empty-before.py`, читает только snapshot `.cache/h3-18b5-before/.../usage_dashboard.py` и synthetic JSON, не БД. Новых фоновых серверов здесь не запускалось.

Без нового flag. Откат — только additions в3usage runtime-модулях и новом `test_engagement_usage.py`; не восстанавливать общие файлы целиком из HEAD. Предыдущие H3/IDE изменения и ранее разрешённая очистка сохранены. Новых rows/идентификаторов/пользовательских данных для отката нет.

Production не опрашивался и не менялся; deploy/реальные уведомления/партнёрские транзакции не выполнялись; uplift/реальные baseline не измерялись. **Далее отдельная H3-18b6 — проверить и добавить ограниченный origin-разрез по уже собираемому search.filters.origin**, с честным unknown и определением наблюдаемой выборки. Locale/device/returning остаются unavailable; save/revisit и реальные сравнимые периоды остаются. H3-17 operational/manual/field/duplicate-landmark gates открыты, H3-14 BLOCKED внешними условиями. Здесь остановка до следующей задачи.
