# H3-18b4 — просмотр полного расчёта бюджета

2026-11-06. **H3-18b4 DONE локально; H3-18 IN_PROGRESS.** Одна часть §1.2 V3: определить `budget_calculated` и добавить `BUDGET_CALCULATED` через существующую аналитику. Дополнительные метрики dashboard/разрезы/реальные before-after остаются отдельными частями.

## Что уже было и какое действие выбрано

Калькулятор уже реактивно считает целые grosz, различает unknown/0, поддерживает две базы проживания, events, личные диапазоны, dates/review, draft recovery и share. Поэтому валидная реактивная сумма не означает завершение: она может быть лишь subtotal известных расходов. Старый `BUDGET_USE` — первая валидная правка, не полный бюджет.

Переиспользовано явное открытие прежнего **«Rozbicie kosztów całej grupy»**. Событие означает просмотр полного расчёта по личным введённым данным, не подтверждение рыночных цен/броней/фактических расходов. Новая кнопка, обязательные даты и новые суммы по умолчанию не нужны. UI strings/CSS/переводы PL/EN/RU/UK не менялись.

До правки [новый API-тест](api-before.txt) воспроизвёл422 literal_error для имени события. Текущая [taxonomy v4](taxonomy.json) содержит17 wire names; историческиеv1–v3 сохранены. Все12 понятий roadmap теперь имеют описанное mapping/proxy, но это не завершение всей H3-18 и не гарантия полноты наблюдений.

## Определение v4 и приватность

`BUDGET_CALCULATED` отправляется только при собственном native toggle в open после `ready`, когда:

- `calculateBudget(input, events).valid` и `missing.length===0`;
- `review===false`;
- даты либо обе отсутствуют (ручные nights/days остаются допустимыми), либо `budgetDateCounts` валидны.

Все активные строки требуют явной суммы, включая0. Blank остаётся unknown даже при0ночей; неактивное поле другого hotel_basis игнорируется по прежнему расчёту. Unknown/invalid ticket amounts/quantity препятствуют completion. Личные projected ranges не заполняют точные ручные расходы и сами completion не дают.

Никакой отправки из effect/mount/restore, reactive totals или valid edit нет. Если breakdown уже открыт, заполнение последнего поля, снятие review либо grant consent сами не отправляют событие: нужно закрыть и открыть подходящую разбивку. Guard отсекает nested target. Это наблюдаемый toggle после hydration: программное открытие тоже может его вызвать, ранние действия до hydration могут потеряться. Согласие проверяется прежним `track` при отправке; denied/revoked не мешают расчёту или native disclosure.

Событие включено в прежний `viewEvents`: **один раз на наблюдаемое URL visit/анонимную сессию**, без различения draft/plan/revision; hash сам не сбрасывает visit. После reload/нового посещения явное подходящее открытие может учитываться снова. Best-effort/no retry: заблокированный send остаётся дедуплицированным в этом посещении.

Payload: только прежние random event/session IDs, имя и bounded page_type/source/campaign. Нет slug, total, complete flag, сумм/дат/people/profile/events/плана/ID/revision/token/URL/query/hash. API-тест проверяет stripping подложенных private fields, event_id uniqueness, unrelated-context rejection и отсутствие lowercase wire alias. Публичный POST не доказывает согласие или клиентскую полноту: приватный бюджет на сервер не передаётся.

Protected `summary.by_event.BUDGET_CALCULATED` переиспользован. Usage `budget_usage` остаётся `BUDGET_USE`, существующий search funnel не меняется. Новый event увеличивает received events/sessions; для сравнений нужны одинаковые taxonomy/coverage. Completion после восстановления возможен без BUDGET_USE в этом окне, поэтому независимые счётчики нельзя автоматически делить как conversion rate.

## Минимальное изменение и совместимость

Четыре существующих runtime-файла: API analytics schema, web analytics-context/session и trip-budget-calculator; новый чистый `budget-completion.ts` переиспользует прежние расчёт и date validation. [Delta существующих файлов](runtime-delta.patch), [hashes/parity](source-parity.json). Формулы, cost defaults, storage/shared schemas/writer и consent identities не менялись. Новых API полей, миграций БД, зависимостей и SaaS нет.

Новый web требует API с additive allowlist. Старый API вернёт422 только аналитике, калькулятор продолжит работать. При будущем разрешённом rollout сначала API, затем web; откат web перед сужением API allowlist. Реальный rollout здесь не выполнялся.

## Проверки

| Проверка | Итог | Evidence |
|---|---|---|
| API / Node baseline | 87 / 325 passed | [API](api-baseline.txt), [Node](node-baseline.txt) |
| Analytics/usage/funnel + новые6 API cases | **93 passed**, 2 warnings | [лог](api.txt), [JUnit](api.xml) |
| Все Node tests | **331 passed**, 0 skipped | [лог](node.txt) |
| Final completion subset после уточнения profile fixture | **6 passed** | [лог](node-completion-final.txt) |
| Production Chromium desktop/mobile | **32/32 first-run**, retries0:16 feature +16 regression | [JSON](browser.json), [лог](browser.txt), [verification](verification.json) |
| Fresh production build / TypeScript | PASS / PASS | [build](build.txt), [types](types.txt) |
| Full ESLint / Ruff / mypy | PASS / PASS / 122 source files PASS | [lint](lint.txt), [Ruff](ruff.txt), [mypy](mypy.txt) |
| Полный API suite | **1138 passed / 1 failed / 18 PostgreSQL skipped**, 2 warnings | [лог](full-api.txt), [JUnit](full-api.xml) |

API before-test намеренно красный: неизвестное имя до расширения allowlist. После изменения новых product failures не выявлено. В Node profile fixture уточнена до настоящего валидного `BudgetEstimates`, дополнительно проверено, что projection уже без missing, а точный личный бюджет ещё incomplete; повторён затронутый6-test файл, runtime не менялся.

Feature покрывает4locale: explicit complete open/POST202, отсутствие auto event при вводе/reload/restore, once-per-visit reopening, минимальный payload, separate BUDGET_USE, keyboard/axe calculator/320px. Дополнительные случаи: partial-open→complete без auto send; invalid money/date и review-required plan; review acknowledgement при открытой разбивке; denied/grant/revoke/no backfill; ad blocker не ломает расчёт; восстановленный shared plan с неизвестной ticket price остаётся incomplete, ручной0 затем допускает event без plan/token/event contents.

Regression — весь прежний `trip-budget.spec.ts`,8case×2projects: суммы/валидация/reset/axe; per-offer drafts/reload; dates/party/review/whole-stay; corrupt/unavailable storage; changed source metadata; section link/focus; NBP reference/manual priority; lodging basis без double count. Только синтетические пользовательские суммы0 в новых feature fixtures; defaults приложения остались unknown. [RU desktop320](complete-budget-ru-desktop.png) / [RU mobile320](complete-budget-ru-mobile.png) сохранены как full-element screenshots, не как сравнительный visual audit.

Полный API **не зелёный**: прежний `test_real_api_to_queue_to_mock_telegram_journey` использует вылет2026-11-06T09:00Z, уже прошедший во время запуска. Before/current/future-departure controls сохранены [в H3-18b2](../h3-18b2/README.md). Telegram runtime/test в этой задаче не изменены, самостоятельное исправление fixture clock остаётся. Два warnings — прежние Starlette/httpx и anyio deprecation. Предсуществующие duplicate landmarks при двух open offer cards остаются H3-17; новая проверка axe касается calculator, не всего сайта.

## Окружение и воспроизведение

Изолированная `.cache/aud05-h3-18b4-20261106`, свежая сборка **tX41skKr_3OJY_fpf8cjU**, API8125/site3125, SQLite/mock delivery, PyCharm Python3.12.10 и Chrome desktop/mobile emulation. Runner проверяет next start/NODE_ENV=production/no reuse/served BUILD_ID. Build/start API/site env совпадают. [Паритет677 source/dependency/public файлов](source-parity.json),3 web test sources совпадают после нормализации test ports/BOM/newlines. Временный Next config только добавляет workspace turbopack.root. Runtime после build не менялся.

Команды из корня с настроенным SDK после Python preflight:

```powershell
.venv/Scripts/python.exe -m pytest apps/api/tests/test_budget_calculated_analytics.py apps/api/tests/test_details_open_analytics.py apps/api/tests/test_trip_update_analytics.py apps/api/tests/test_product_analytics.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py apps/api/tests/test_funnel_analytics.py -q
.venv/Scripts/python.exe -m pytest -q
.venv/Scripts/python.exe -m ruff check apps/api/app/schemas/analytics.py apps/api/tests/test_budget_calculated_analytics.py
.venv/Scripts/python.exe -m mypy apps/api/app
node docs/h3-18b4/verify.mjs
```

Web: `npm run test:unit`, `npm run lint`; isolated copy: `npm run build`, `npm run typecheck`. Browser с `HOPTRIP_TEST_PYTHON=<SDK>`, `PLAYWRIGHT_CHANNEL=chrome`, `HOPTRIP_H3_PRODUCTION=1`: `npm run test:e2e -- budget-calculated-analytics.spec.ts trip-budget.spec.ts --trace=off --reporter=line,json`. Подготовка — прежний prepare-e2e.ps1 -Production плюс3 imported test fixtures/airport JSON/synthetic operator. IDE result — `ide-build.json` с limited diagnostics; compiler proof дают CLI build/types.

## Откат и следующий запуск

Без нового feature flag. Откат — только additions в4existing runtime-файлах и новый helper; новые API/Node/browser tests и текущую parity assertion вернуть согласованно с allowlist. Не возвращать общие файлы целиком из HEAD: предыдущие H3/IDE/разрешённая очистка сохранены. Исторические analytics rows можно оставить, retention/storage не менялись.

Production data/deploy, реальные уведомления/партнёрские транзакции/платные API не использовались. Реальные KPI/uplift, WebKit/manualSR/physical devices/field CWV/full E2E не измерены/не проверены. **Далее отдельная H3-18b5 — добавить engagement метрики новых событий в защищённый usage-report с явными знаменателями**, затем privacy-safe разрезы/save-revisit/сравнимые реальные периоды. H3-18 и H3-17 остаются IN_PROGRESS, H3-14 BLOCKED внешними условиями. Здесь остановка до следующей задачи.
