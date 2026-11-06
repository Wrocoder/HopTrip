# H3-18b6 — когорты по первому контексту аэропорта вылета

2026-11-06. **H3-18b6 DONE локально; H3-18 IN_PROGRESS.** Одна часть §1.2 V3: ограниченный origin-разрез в существующих protected usage API/admin HTML, на уже собираемых событиях. Новый трекинг/атрибуция/visitor identity не добавляются.

## Что уже есть и выбранное определение

Клиентский `analyticsFilters` уже сохраняет canonical airport code или WAW,WMI в `search.filters.origin` у SEARCH/SEARCH_RESULT. API валидирует формат и проверяет одиночный код по Airport; WAW,WMI — прежняя отдельная допустимая группа. В usage-отчёте origin-разреза не было: [before-test](api-before.txt) подтвердил отсутствие поля.

Добавлено optional **`origin_cohorts`**, version **`first-search-origin-cohorts-v1`**. [Машинное определение](definition.json), [fixture JSON](usage-populated.json). Правила:

- Берётся origin **первого полученного SEARCH или SEARCH_RESULT** сессии внутри `[start,end)`, по прежнему server created_at, затем DB id. Это не первое валидное значение и не порядок действий на клиенте. Результат может быть пустым/ошибочным; outcome не переопределяет выбор контекста.
- Если первый контекст отсутствует/некорректен/неподдерживаем, сессия остаётся `unknown`; поздний валидный поиск её не переносит. Нет SEARCH/SEARCH_RESULT — тоже unknown. Из PAGE_VIEW, URL, deal_id, IP или данных рейса аэропорт не выводится.
- Поддерживаются15 кодов из прежнего Polish AIRPORT_ALIASES и отдельная группа WAW,WMI. Публичный OriginKey enum закрепляет этот ограниченный набор, parity-test сверяет реестр. Произвольные трёхбуквенные значения/foreign codes/городские aliases/строки с пробелами/неправильным регистром не выводятся. Это не все мировые IATA и не справочник текущих доступных рейсов; новые коды требуют явного review. WAW,WMI не делится и не сливается с одиночными WAW/WMI.
- Каждая прежняя observed product session входит ровно в одну когорту, включая сессии без PAGE_VIEW/поиска. Сумма cohort.sessions равна observed_sessions. Строки сортируются по canonical key.
- `percent` строки = sessions когорты / observed_sessions. Вложенные detail_disclosure/budget_completion/trip_update используют прежние события, но **знаменатель — sessions этой когорты**. Сессия один раз на показатель; сумма cohort numerators совпадает с global engagement numerator. Округлённые доли могут не суммироваться ровно в100%.
- Учитываются действия во всём окне, в том числе **до** выбранного поискового контекста. Это описательная сегментация сессий, не атрибуция конкретному поиску/плану/аэропорту клика, не step conversion, returning-person или causal uplift.

**Только синтетический пример:**11events/4sessions. WAW,WMI→1session/25%; WRO→1/25%; unknown→2/50%. В WRO есть budget completion **до** первого поиска; поздний переходWRO→KRK не переносит сессию. Первая private/invalid origin, затемWRO остаётся unknown; session без поиска тоже unknown. Повторный disclosure не увеличивает счётчик. Матрица трёх engagement numerators: `[0,0,1] / [1,1,0] / [0,0,1]`. Это не реальные KPI.

## API, dashboard и совместимость

```json
{"origin_cohorts":{"version":"first-search-origin-cohorts-v1","rows":[
  {"origin":"WRO","sessions":1,"percent":"25.00","metrics":[
    {"key":"detail_disclosure","status":"available","numerator":1,"denominator":1,"percent":"100.00"},
    {"key":"budget_completion","status":"available","numerator":1,"denominator":1,"percent":"100.00"},
    {"key":"trip_update","status":"available","numerator":0,"denominator":1,"percent":"0.00"}
  ]}
]}}
```

Фрагмент из synthetic fixture, не весь ответ. Старые11metrics, page_cohorts, ordered-session-funnel-v1 и received-session-engagement-v1 сохраняют версии/определения. Общий ENGAGEMENT_EVENTS mapping используется для global/cohort агрегатов, чтобы события не расходились. Отсутствующее origin_cohorts допускается старым конструктором/JSON, renderer пропускает секцию. Внешние JSON readers должны допускать дополнительное поле.

HTML4locale показывает число сессий, их долю и три действия с numerator/denominator/percent в каждой строке. `unknown` и группа локализованы; canonical codes — фиксированные публичные значения. При0sessions rows=[] и прежнее localized no_data, без пустой таблицы. На320/390px есть внутренний scroll region с accessible name/tabindex и рабочим ArrowRight; page overflow нет. Old page-type cohorts/funnel/engagement не переименованы.

Нулевое действие означает0полученных действий в наблюдаемой когорте, не отсутствие использования/полное покрытие. Сравнивать можно только сопоставимые taxonomy/collection windows. Согласие и доставка ограничивают выборку; публичный POST не доказывает consent/реальность действия. Device/locale/returning visitor остаются unavailable.

Изменены только3runtime Python-файла — usage schema/service/dashboard: [delta](runtime-delta.patch). Данные берутся из прежней filtered/sorted выборки; дополнительных SQL-запросов/записей/миграций/зависимостей нет. Старые UTC default7/max31days, cap20000 и413 без усечения прежние. No raw session/plan/offer IDs, arbitrary metadata, airport names, prices, dates, tokens или labels в новом блоке. Auth/noindex/no-store/no-referrer/CSP/script-free сохранены. Никаких новых event fields, session IDs или consent semantics.

## Проверки

| Проверка | Итог | Evidence |
|---|---|---|
| Usage/analytics baseline |111passed|[лог](api-baseline.txt), [JUnit](api-baseline.xml)|
| Новый31case + usage/engagement/funnel/analytics |**142passed**,2warnings|[лог](api.txt), [JUnit](api.xml)|
| После уточнения Polish header |**99passed** affected usage/origin/engagement/funnel|[лог](api-final.txt), [JUnit](api-final.xml)|
| Chromium4locale×3states×4widths |**48/48 first-run**,0violations/incomplete/overflow/pageerror/HTTP requests;16horizontal keyboard checks|[JSON](browser.json), [лог](browser.txt), [verification](verification.json)|
| Ruff / mypy |PASS /122source files PASS|[Ruff](ruff.txt), [mypy](mypy.txt)|
| Полный API после финальной runtime правки |**1187passed /1failed /18PostgreSQL skipped**,2warnings|[лог](full-api.txt), [JUnit](full-api.xml)|

New API coverage: frozen first origin, first-invalid/no later backfill (14malformed/unsupported shapes), no inference from unrelated events, before-search actions, repeats/sum invariants, same timestamp/DB id, `[start,end)`/placeholder exclusions, empty/legacy report, bounded-registry parity,12localized populated/unknown/empty HTML/privacy variants. Existing auth/limits/SELECT-only/CSP/no-store/old metrics tests остаются успешными. После изменения только Polish column label повторён99-test affected набор, затем full API; численные определения не менялись.

Полный API **не зелёный**: прежний `test_real_api_to_queue_to_mock_telegram_journey` использует уже прошедший вылет2026-11-06T09:00Z. Before/current/future fixture controls — [H3-18b2](../h3-18b2/README.md). Telegram runtime/test не менялись. Warnings — прежние Starlette/httpx и anyio deprecation. Предсуществующие H3-17 duplicate landmarks/operational/manual/field gates остаются.

Browser открывал file:// HTML от настоящего TestClient endpoint на synthetic SQLite с действующим meta CSP. Auth/API/headers отдельно pytest; это не live browser login. HTTP-запросов и pageerrors не было; browser helper проверяет их отсутствие. Глобальные исключения axe/bypassCSP не использовались. [RU320](origins-ru-320.png) и [EN1440](origins-en-1440.png) просмотрены, не полный visual audit. WebKit/manualSR/physical devices/field CWV не проверялись.

IDE result — `ide-build.json`, limited diagnostics. Next build/Node suite не запускались: web source/bundle не менялись, HTML формирует Python. Backend imports/rendering подтверждены pytest, типы — mypy. No new background servers, dependencies/install/deploy.

## Воспроизведение и откат

Из корня, Python через настроенный PyCharm SDK3.12.10 после preflight:

```powershell
$env:HOPTRIP_18B6_EVIDENCE = (Resolve-Path docs/h3-18b6).Path
.venv/Scripts/python.exe -m pytest apps/api/tests/test_origin_cohorts.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_engagement_usage.py apps/api/tests/test_ordered_funnel.py -q
.venv/Scripts/python.exe -m ruff check apps/api/app/schemas/usage.py apps/api/app/services/usage_metrics.py apps/api/app/services/usage_dashboard.py apps/api/tests/test_origin_cohorts.py
.venv/Scripts/python.exe -m mypy apps/api/app
node docs/h3-18b6/browser.mjs
node docs/h3-18b6/verify.mjs
```

Без нового flag. Rollback — additions в3usage runtime-файлах/newtest и новый shared engagement mapping вернуть согласованно с прежними definitions. Не заменять общие dirty файлы целиком изHEAD; предыдущие H3/IDE/разрешённая очистка сохранены. DB/retention reversals не нужны.

Production не опрашивался/не менялся; реальные notifications/affiliate transactions/paid APIs/deploy не выполнялись. Uplift/real baseline не измерялись. **Далее отдельная H3-18b7 — аудит измеримости save/revisit на существующих событиях**, без подмены открытия после Save возвращением человека. Затем остальные privacy-safe cohorts и сопоставимые реальные периоды. H3-18/H3-17 IN_PROGRESS, H3-14 BLOCKED внешними условиями. Здесь остановка до следующей задачи.
