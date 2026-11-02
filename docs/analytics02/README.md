# ANALYTICS-02 — Conversion and Usage Dashboard

Дата: 2026-11-02. Только ANALYTICS-02; ANALYTICS-01 DONE. Добавлен read-only dashboard поверх сохранённых AnalyticsEvent. Существующие ingestion/consent/affiliate/financial summary не меняются. Production DB/credentials не читались, реальных baseline values нет. [Определения](METRICS.md), [что осталось](REMAINING.md), [проверки](verification.json), [task patch](changes.patch).

## Доступ и поведение

- GET /api/v1/admin/analytics/usage — агрегированный JSON; GET /api/v1/admin/analytics/dashboard — самостоятельный HTML. Оба используют существующий require_admin / X-Admin-Token. Публичного link/login/token-in-URL/browser storage не добавлено.
- Параметры start/end — timezone-aware даты, UTC [start,end), default7days, максимум31days. HTML также принимает locale=pl/en/ru/uk. Calendar overflow, naive/reversed/oversized periods получают422. Более20000 rows в окне дают413 с просьбой сузить период; усечённые metrics не выдаются.
- 11 карточек (включая quality error rate и2 unavailable signals) плюс first-observed-page-type cohort table. У каждой доли числитель/знаменатель и определение. Нулевая выборка → null/«нет данных», не выдуманная0% baseline. Поиск/выдачи/детали/partner intent/save/budget/events измеряются из actual stored rows.
- Returning people и mobile/desktop недоступны: нет visitor/device fields. Persistent ID, fingerprint/UA/device collection не добавляются. First PAGE_VIEW in period — явно proxy первого наблюдаемого типа страницы, не истинный landing URL и не полный session entry.
- Только SELECT, без commits/updates. Сессии-заглушки и неизвестные/technical event names исключены с quality counter; legacy malformed result outcomes не становятся empty. Исторический financial summary остаётся прежним; clicks не объявляются bookings/commission.
- HTML без scripts/images/external resources, с CSP default-src none, noindex/nofollow/nosnippet, meta no-referrer и existing no-store. Все4 локали,320px/1280px, semantic headings/table/caption, keyboard skip link и focusable scroll region. В response нет session/deal IDs, raw metadata, email/token/admin key.

Токен передаётся в header существующим доверенным admin client. Для просмотра можно сохранить авторизованный HTML локально; обычный ввод URL в адресную строку без header даст401. Ни нового публичного admin frontend, ни автоматической пересылки секретов нет.

Пример чтения собственного локального API (порт8000 заменить своим; команда здесь не выполнялась):

```powershell
$usageHeaders = @{ 'X-Admin-Token' = $env:ADMIN_TOKEN }
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/v1/admin/analytics/dashboard?locale=ru' -Headers $usageHeaders -OutFile './usage-dashboard.html'
```

Не вставлять token в URL или report. Файл — снимок выбранного периода; для другого окна выполнить новый авторизованный запрос. Trend comparison требует одинаковых определений/состава данных; автоматические выводы о росте не строятся.

## Проверки

- [Focused](focused.txt):30/30 initial cases. После добавления2 calendar-boundary cases [final API](api.txt)/[JUnit](api.xml):68/68,32new+36existing analytics/activity/funnel/product/metrics-security/conversion tests,3.74s,2existing TestClient/httpx/anyio warnings. Повторы/initial66 не суммируются. Проверены auth401 на обоих routes, actual SQLite data, denominators/order/same-offer/repeats, empty/missing/malformed, caps/date normalization/overflow, no writes/PII и4locale HTML/security headers.
- [Ruff](ruff.txt)5files passed; [mypy113](mypy.txt) passed. [Initial mypy](mypy-initial.txt):6 call-arg errors для Pydantic optional Field(None); исправлены named default=None, runtime defaults не менялись. Нет необъяснённых type/lint failures.
- [Browser](browser.json)/[script](browser.cjs):9/9 render cases,9 full-page axe scans без violations,4locales×1280/320 плюсempty320, keyboard/overflow/static metadata,0network requests в locale journeys. Два снимка [PL1280](fixture-pl-1280.png)/[RU320](fixture-ru-320.png) просмотрены. Данные [fixtures](fixtures/README.md) явно синтетические, не production baseline.
- Browser использует setContent точных TestClient HTML bodies. Авторизация/headers/data path проверены API tests, не browser HTTP. Test-only bypassCSP нужен для axe injection; production policy не ослаблялась. Последний API repeat добавил только calendar-negative cases; renderer с момента browser проверки не менялся. Physical Safari/full-site WCAG certification/full regression suite не заявляются.
- API Python интерпретируемый: новые модули импортированы и обслужены через настоящий ASGI app в tests. Отдельных web/Next build/lint/tsc/Node unit/Docker/PG checks не запускали: public web/config/dependencies и схема БД неизменны. Ни install, ни миграции, ни новый tracker/внешний API не нужны.

## Scope, воспроизведение и rollback

Snapshot2226 baseline files. Меняется только existing analytics.py (два новых protected GET + helper/imports) и5 docs; добавлены3 runtime modules/1API test/docs artifacts. Старые summary/POST event blocks должны совпадать с before. [Verifier](verify.cjs) проверяет hashes/scope/preserved old bodies/JSON/local links/added whitespace/43 tasks; master plan и previous changes не редактируются. Global git diff --check содержит прежние97 trailing spaces только user master plan, hash прежний.

SDK получен через python-tools/get_python_environment: Python3.12.10, existing venv/pip, без installs. APP_ENV=test/DATABASE_URL=sqlite://, synthetic admin token, выключенные SMTP/digest/Telegram/editor/event-sync. Все fixtures локальные, ASGI client не подключался к production/provider endpoints. Browser только about:blank+HTML, без web/API servers/ports и внешних переходов.

Команды: SDK -m pytest apps/api/tests/test_usage_dashboard.py и6 связанных test files (перечислены в api.xml); SDK -m ruff check для4runtime files+test; SDK -m mypy apps/api/app; node docs/analytics02/browser.cjs после fixture export через HOPTRIP_USAGE_EVIDENCE_DIR. Перед каждым Python invocation требуется SDK preflight. node docs/analytics02/verify.cjs проверяет итоговые evidence и task boundary.

Rollback: убрать2 GET routes/helper/imports и3 новых modules согласованно. Tables/events/retention/consent/affiliate parameters не меняются; historic data не удалять. Обычный backend release отдельно, здесь публикации не было.

ANALYTICS-02 DONE. По master IDs все43 задачи имеют DONE в progress; следующей незавершённой задачи нет. Это итог локальных задач, а не доказательство rollout/всех production guarantees. [Remaining release/validation work](REMAINING.md) не выполняется автоматически.
