# H3-18a — проверка аналитики и baseline-контракт

Дата: 2026-11-02. **H3-18a DONE; H3-18 IN_PROGRESS.** Исходный HEAD `d928246561da713c4dd1f2a4c7fbdafb39a305ab`. Объём: проверить текущие analytics/consent, определить baseline taxonomy и воспроизводимость существующих метрик. Расширение сбора, новые dashboards/experiments и production before/after относятся к H3-18b.

## Что реализовано в этой части

- [taxonomy.json](taxonomy.json): **h3-analytics-baseline-v1**, версионированное соответствие 12 понятий H3 существующим 14 wire events. Это версия документа-контракта, не новое поле API. Никакого переименования или двойной отправки событий.
- [capture.py](capture.py): сверяет taxonomy с Python EventName/OpenAPI и получает существующий usage report на явно синтетической базе `sqlite://`, используя fixture из `test_usage_dashboard.py`. Нет подключения к production DB.
- [verify-contract.mjs](verify-contract.mjs): сверяет frontend `analyticsEvents` с taxonomy и сохранённой API schema. Успешно: 14 совпадающих wire events, 12 уникальных понятий H3, 3 missing.
- `apps/web/tests/analytics-lifecycle.test.mjs`: три новые проверки реального transport/session кода — некорректное/просроченное/будущее согласие, граница 30 минут бездействия, rejected Promise от сети/блокировщика без retry и блокировки последующих посещений.
- `apps/web/tests/product-analytics.spec.ts`: исправлена гонка в test helper `flush`: оба счётчика запросов/ответов теперь сравниваются внутри poll, а не с числом запросов, зафиксированным до ожидания. Проверка всех HTTP 202 сохранена.

Runtime приложения, UI/copy PL/EN/RU/UK, API, миграции, dependencies, consent storage и event ingestion не изменены. Нового tracker/SaaS/идентификатора нет. Rollback — удалить новый test и документацию H3-18a; deployment не выполнялся.

Для полного отката test-only delta также вернуть прежний helper `flush` в product-analytics.spec.ts. Это вернёт его нестабильное ожидание и не изменит приложение.

## Карта событий

| Понятие H3 | Существующий wire event | Семантика и ограничение |
|---|---|---|
| search_submitted | SEARCH | Явная валидная отправка поиска |
| results_viewed | SEARCH_RESULT | Proxy полученного результата страницы, включая direct entry/pagination/error; не визуальное внимание |
| filter_applied | FILTER_USE | Только action=apply; remove/reset отдельно |
| offer_viewed | DEAL_VIEW | Открытие страницы предложения |
| offer_details_opened | **missing** | Открытие details/score dialog не равно посещению страницы |
| affiliate_clicked | PARTNER_CLICK | Намерение перехода по flight/stay/activity; не гарантированный redirect/booking |
| budget_started | BUDGET_USE | Proxy первого корректного изменения непустого поля за посещение, не показ калькулятора |
| budget_calculated | **missing** | Автоматическая частичная сумма не означает завершённый бюджет |
| trip_saved | TRIP_SAVE | Успешная запись нового локального снимка; повтор/ошибка не считаются |
| trip_updated | **missing** | Сначала определить постоянную identity/Update в H3-12 |
| event_clicked | EVENT_CLICK | Ticket interaction; ACTIVITY_CLICK — отдельная достопримечательность |
| alert_opt_in | ALERT_CONFIRMED | Успешное email confirmation при analytics consent; не signup attempt и не Telegram opt-in |

Дополнительные события сохраняются: PAGE_VIEW, DEAL_IMPRESSION, ACTIVITY_CLICK, TRIP_REMOVE, ALERT_STARTED. Нельзя суммировать ACTIVITY_CLICK и PARTNER_CLICK как независимые клики одного действия или SEARCH и FILTER_USE как разные поиски.

## Consent, timestamps и качество данных

Проверены `consent.ts`, `session.ts`, `consent-controls.tsx`, `analytics-context.ts`, `deal-view-tracker.tsx`, `search-result-tracker.tsx`, `outbound.tsx`, `schemas/analytics.py`, `api/analytics.py`, `models/analytics.py`, `services/usage_metrics.py`.

- Отсутствующее, invalid, future или старше/равно 180 суток consent v1 не разрешает отправку. Marketing=true отдельно аналитику не разрешает. UI отзыва прекращает будущие запросы и вызывает clearSession; уже принятые сервером записи не удаляет. Сбой storage обрабатывается существующим fallback, не разрешением по умолчанию.
- Browser session: случайный UUID, обновление touched, новый UUID после 30 минут бездействия. Не постоянный visitor ID, не человек; UTM source/campaign только allowlist. Текущий URL может участвовать в локальном dedupe key, но query/hash/email/plan не включаются в payload. Аналитический fetch — no-referrer.
- View-like события dedupe по URL visit/event/context/session; действие — 1s suppression. Reload/возврат — новое посещение. Rejected fetch не блокирует интерфейс и не повторяется: неуспешный view остаётся deduped в этом посещении. Это намеренное best effort, не exactly-once delivery.
- Сервер dedupe по unique event_id; поля event_id legacy optional. created_at — серверное время приёма, не время пользовательского действия. Same-time ordering в usage определяется DB id. Нет search_id и достоверного time-to-decision.
- Browser gating не делает публичный ingestion доказательством согласия/человека. Серверные session/component — bounded strings, а не гарантия отсутствия произвольного текста от стороннего клиента. No-PII assertions относятся к штатным producers и allowlisted metadata. Финансовый журнал и AffiliateConversion отдельны.
- DEAL_IMPRESSION наблюдает intersection и отключает observer после первого пересечения даже без consent. Позднее принятие consent не гарантирует переотправку уже увиденной карточки. Это ограничивает знаменатель impression CTR; текущий usage dashboard считает view→partner pairs, а не impression CTR. Перед метрикой H3-06 необходимо отдельное тестовое решение.
- Locale/device не передаются, page_type нормализован без locale. Origin доступен только в нормализованном search context, не сквозной cohort всех событий. Возвращаемость между сессиями, device/locale split и полная search→booking attribution пока unavailable.

## Что именно означает baseline

[synthetic-baseline.json](synthetic-baseline.json) содержит **17 synthetic events / 4 synthetic sessions**, а не реальные KPI. Воспроизведены существующие определения из METRICS.md (`docs/analytics02/METRICS.md`; исторический файл удалён): search initiation 2/4, result success 1/3, empty outcomes 1/2, errors 1/3, detail opening 2/4, ordered same-deal affiliate pairs 1/2, save 1/4, budget 1/4, events 2/4. Returning/device остаются unavailable/null. Нулевая выборка — no_data/null, не 0%.

Production baseline **не получен**, uplift не заявляется. Read-only workflow для уполномоченного доступа:

1. Использовать существующий `GET /api/v1/admin/analytics/usage?start=<UTC ISO>&end=<UTC ISO>` с текущим X-Admin-Token из защищённого окружения. Не вставлять токен в URL/отчёт. HTML-представление — `/api/v1/admin/analytics/dashboard` с теми же bounds и locale.
2. Брать непересекающиеся сопоставимые окна `[start,end)` по 7 дней с одинаковыми днями недели; API допускает максимум 31 день, 20000 строк, иначе 413 без усечения. Сохранять только агрегатный ответ, версию taxonomy, deployment SHA и UTC bounds.
3. Сравнивать одинаковые определения/consenting population. Учитывать сезонность, доступность предложений, изменение источников трафика, consent coverage и best-effort loss. Не выдавать маленькую выборку или сезонный сдвиг за causal uplift.
4. Проверять excluded_events, invalid_results, unlinked_detail_views и знаменатели. Не смешивать usage PARTNER_CLICK с серверными /go/AffiliateClick и подтверждёнными conversion/revenue. Default retention 90 дней ограничивает ретроспективу.

## Метрики будущих H3-задач

| Задача | Что можно использовать сейчас | Что ещё требуется |
|---|---|---|
| H3-01 | result-success/empty/error proxy | Versioned weekend mode и eligibility cohort после нового filter contract |
| H3-06 | Ordered same-deal view→partner CTR | Details-open event, определение корректного impression denominator; time-to-decision unavailable |
| H3-07 | Общие received outcomes | Контекст нового sort, известность interval; сейчас такого sort нет |
| H3-09 | Page-type cohort только proxy | Collection source/eligibility context; не выводить атрибуцию из общего PAGE_VIEW |
| H3-11 | BUDGET_USE distinct sessions | Отдельное осмысленное completion, не сумма каждой реактивной перерисовки |
| H3-12 | TRIP_SAVE/TRIP_REMOVE | Update semantics, privacy-safe revisit definition; не постоянный user fingerprint |
| H3-14 | ALERT_STARTED и ALERT_CONFIRMED | Channel-aware lifecycle и реальные delivery gates; ratio без общей identity не exact funnel |

Это спецификация пробелов для H3-18b и соответствующих продуктовых задач, не разрешение собирать новые данные в этом запуске.

## Проверки и воспроизведение

- `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider apps/api/tests/test_analytics.py apps/api/tests/test_activity_analytics.py apps/api/tests/test_funnel_analytics.py apps/api/tests/test_product_analytics.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_metrics_security.py apps/api/tests/test_retention.py --junitxml=docs/h3-18a/api-tests.xml` — **67 passed**, 2 прежних deprecation warnings; [JUnit](api-tests.xml). SQLite, не PostgreSQL.
- В `apps/web`: `node --experimental-strip-types --test tests/analytics-context.test.mjs tests/product-analytics.test.mjs tests/analytics-lifecycle.test.mjs tests/drive-policy.test.mjs` — **11 passed**, включая 3 новых. MODULE_TYPELESS_PACKAGE_JSON warning.
- ESLint нового lifecycle test и изменённого product-analytics.spec.ts — pass; `python -m ruff check docs/h3-18a/capture.py --no-cache` — pass. TypeScript `tsc --noEmit --incremental false` в изолированной web-копии — pass. IDE build success с limited diagnostics.
- Для capture получить SDK через python-tools; задать `PYTHONPATH=apps/api;apps/api/tests`, `PYTHONDONTWRITEBYTECODE=1`; выполнить `.venv/Scripts/python.exe docs/h3-18a/capture.py`, затем `node --experimental-strip-types docs/h3-18a/verify-contract.mjs`. Оба прошли; первоначальная неверная относительная ссылка в verify исправлена до успешной проверки.
- Browser: existing `consent.spec.ts`, `funnel-analytics.spec.ts`, `product-analytics.spec.ts`; Chrome desktop/mobile, 4 locale product flows. [JSON результата](browser.json). Изолированная копия через `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-h3-18a-20261102`, порты 3125/8125, fixture SQLite, local partner boundary; в копии config dev заменён на start после production build. NEXT_PUBLIC_API_URL/HOPTRIP_API_URL указывают 8125, NEXT_PUBLIC_SITE_URL — 3125, operator — tests/fixtures/operator.json. Следующий прогон требует нового имени копии. `HOPTRIP_TEST_PYTHON` — проверенный SDK, `PLAYWRIGHT_CHANNEL=chrome`, `PLAYWRIGHT_JSON_OUTPUT_NAME` — отдельный report path.
- Первый browser-прогон: **22 passed / 2 failed** из-за гонки в helper flush (EN desktop/mobile); [исходный JSON](browser.json) и trace сохранены. После исправления повторены все 8 product taxonomy cases (PL/EN/RU/UK × desktop/mobile): **8 passed**, [итоговый JSON](browser-final.json). В сумме приняты 24 уникальных сценария: 16 остальных успешных из первого прогона и 8 повторно проверенных product cases. Это не новый полный прогон всех 24 после изменения helper.
- Повтор: из изолированной web-копии `npm run test:e2e -- product-analytics.spec.ts --grep 'product taxonomy follows' --reporter=json`, с теми же env и отдельным browser-final.json.
- Production artifact был собран и успешно обслуживает tests. После прерывания инструмента исходный process exit сборки недоступен, поэтому отдельный build PASS по этому exit не заявляется. Next start предупреждает об output:standalone; Docker/runtime production deployment не проверен.

Проверка разрешений ранее прервала команду из-за usage limit; после команды пользователя штатный повтор разрешён. Ограничение не обходилось. Browser mail — fixture transport; реальные подписчики/отправки/покупки/production reads не затронуты. Полный E2E suite, Safari, production dataset, PostgreSQL concurrency и внешняя доставляемость не проверялись. Следующая отдельная задача после закрытия H3-18a — H3-04; общий H3-18 остаётся IN_PROGRESS до H3-18b.
