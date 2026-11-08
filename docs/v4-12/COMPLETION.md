# V4-12 — завершение локальной приёмки

Дата: 2026-11-08. Статус: **DONE локально**. Выполнена только V4-12; V4-13 не начиналась.

## Причина отказа и исправление

В прежнем trace два запроса (TRIP_SAVE и PAGE_VIEW) имели ненаблюдаемый ответ после смены документа. Даже дополнительное ожидание счётчиков воспроизводило ошибку: [до исправления](save-repro-before.json). Отсутствие ответа в Playwright Page не доказывало отсутствие записи в API.

В `apps/api/tests/e2e_app.py` существующий `/__test__/tracking` дополнен event_id. Этот сервер требует HOPTRIP_E2E=1, не импортируется production entrypoint и использует одноразовую локальную БД. Production API, transport и модели не изменялись.

В `apps/web/tests/product-analytics.spec.ts` flush теперь ожидает запись каждого перехваченного event_id ровно один раз. Проверяется и TRIP_SAVE, который раньше исключался из сравнения. Для наблюдаемых Page-ответов сохранена проверка 202. После сохранения тест ждёт состояние редактора и проверяет persistence до следующего перехода. Это позволяет проверить реальную доставку keepalive без требования, чтобы уничтоженный документ наблюдал ответ.

Исходный польский сценарий после исправления: **1/1 PASS** ([результат](save-repro-after.json)). Затем весь согласованный browser-набор пройден одним чистым запуском без повторов: **116 PASS, 0 FAIL, 0 SKIP, 0 flaky** ([полный JSON](browser-acceptance.json)). Значит, в проверенных сценариях записи событий не потеряны и не дублируются. Это не гарантия доставки при произвольной реальной сетевой ошибке.

## Проверки этого продолжения

- API: **85 PASS**, два прежних Starlette/AnyIO предупреждения; viewport, usage dashboard, ordered funnel, engagement.
- Node: **379 PASS**, 0 skipped.
- ESLint, typecheck и Ruff для изменённого fixture: **PASS**.
- Browser: семь файлов (viewport-analytics, consent-session-navigation, product-analytics, budget-calculated-analytics, details-open-analytics, trip-update-analytics, locale-analytics); desktop/mobile, PL/EN/RU/UK, production runtime с установленным Chrome. В viewport dashboard дополнительно пять ширин и axe.
- Build/mypy успешно выполнены в предыдущем запуске. Переиспользована та же production-сборка; изменения этого продолжения затрагивают только тесты, test fixture и документацию, поэтому повторная сборка не требовалась.
- Полный API 1387/20 PG из первоначального README — исторический результат реализации, не свежий прогон этого продолжения.

Воспроизведение: из apps/web с HOPTRIP_TEST_PYTHON=полный путь к .venv/Scripts/python.exe, PLAYWRIGHT_CHANNEL=chrome и HOPTRIP_H3_PRODUCTION=1:

```text
npx playwright test --config playwright.production.config.ts tests/viewport-analytics.spec.ts tests/consent-session-navigation.spec.ts tests/product-analytics.spec.ts tests/budget-calculated-analytics.spec.ts tests/details-open-analytics.spec.ts tests/trip-update-analytics.spec.ts tests/locale-analytics.spec.ts --reporter=json
```

## Границы завершения

Локальная реализация и применимые проверки V4-12 завершены. Существующие 17 событий, consent/session/dedup, ordered funnel и bounded viewport dashboard проверены; новая аналитическая подсистема не создавалась. Синтетические данные не выдаются за продуктовые KPI. Реальное сопоставимое измерение эффекта остаётся внешним follow-up по MEASUREMENT.md. Аппаратный тип устройства и бронирования не выводятся из ширины окна/клика.

Production DB, deployment, уведомления и внешние сообщения не затрагивались. Следующая допустимая задача — V4-13 отдельным выполнением. Остановка после одной задачи.
