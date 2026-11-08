**Обновление: незавершённость этого запуска устранена в следующем продолжении; V4-12 DONE локально. См. [итог](COMPLETION.md). Ниже сохранена история.**

# V4-12 — продолжение проверки 2026-11-08

Статус: **IN_PROGRESS**. Выполнена только следующая незавершённая задача V4-12. V4-13 не начиналась.

В рабочей копии уже были реализация аналитики и частичный отчёт. Повторно проверены bounded viewport metadata, optional API schema, cohort aggregation и dashboard. Новая подсистема не создавалась.

Изменён `apps/web/tests/viewport-analytics.spec.ts`: отсутствие Referer допускает undefined или пустую строку, без допуска непустого значения. Chrome возвращает пустую строку. До исправления проверка падала; после него 16/16 PASS на production runtime, desktop/mobile, PL/EN/RU/UK, пять ширин и axe.

Свежие проверки:
- API: 85 PASS, два прежних предупреждения Starlette/AnyIO. Файлы test_viewport_analytics.py, test_usage_dashboard.py, test_ordered_funnel.py, test_engagement_usage.py. Первый вызов с отсутствующим test_usage_metrics.py не собрал тесты; исправленный вызов завершён.
- Node: 379 PASS, 0 skipped.
- ESLint, typecheck, production build, Ruff для затронутого API, mypy всех 128 app-файлов: PASS.
- Viewport browser: 16 PASS, 0 skipped/flaky; `browser-viewport.json`.

Общая регрессия не завершена. `product-analytics.spec.ts` PL/EN/RU desktop воспроизводит timeout `flush` (строка 47, вызов 74 после save/navigation и EVENT_CLICK). Это сравнение количества отправленных запросов с видимыми Page ответами; причина и фактическая сохранность событий требуют отдельной проверки по event_id/серверу. Предположение о keepalive при смене документа не является доказанным диагнозом. Ошибки сохранены в regression-failures. Не ослаблялись проверки успешного ответа и не изменялся production transport.

Первый запуск без bundled Chromium не прошёл запуск браузера. Доступен установленный Chrome через PLAYWRIGHT_CHANNEL=chrome. Часть ранних запусков не имела HOPTRIP_H3_PRODUCTION=1 и была прервана; они не считаются полной приёмкой. Конфликт дочерних процессов после Ctrl-C устранён остановкой только процессов созданного тестового дерева. Последний общий прогон тоже прерван после воспроизведения ошибок; итоговый PASS ему не присваивается.

Повтор viewport: из apps/web, HOPTRIP_TEST_PYTHON указывает на SDK .venv/Scripts/python.exe, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_H3_PRODUCTION=1; `npx playwright test --config playwright.production.config.ts tests/viewport-analytics.spec.ts --reporter=json`.

Предыдущие цифры 1387 API/20 PG в README относятся к предыдущей работе, не к этому повтору. Production DB, deployment, рассылки и внешние сообщения не затрагивались. Реальные KPI остаются внешним follow-up по MEASUREMENT.md. До DONE требуется закончить общую browser-приёмку. Остановка после V4-12.
