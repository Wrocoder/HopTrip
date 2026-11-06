# H3-01c — weekend-режимы в интерфейсе и URL, 2026-11-03

**DONE; общая H3-01 DONE (01a +01b +01c).** Следующий отдельный запуск — H3-03. Коммит и deployment не выполнялись.

## Изменение и совместимость

Форма каталога предлагает calendar-v1, flexible-v1 и no-leave-v1 с названиями и пояснениями PL/EN/RU/UK. Прежний boolean доступен как явно обозначенный старый фильтр; отсутствие фильтра на `/deals` и default `/tanie-loty-na-weekend` сохраняют прежнее поведение. Существующие SEO paths, locale routes и saved/share URLs не меняются.

Часы работы появляются только для no-leave и передаются в API. Допущение видно рядом: понедельник–пятница, default 09:00–17:00 в зоне аэропорта вылета; подтверждённый прилёт в тот же аэропорт до конца воскресенья. Дорога/регистрация/граница неизвестны, гарантии отсутствия отпуска нет. Неизвестные или расчётные времена не подтверждают no-leave. Пятничный утренний вылет и понедельничный прилёт исключаются этим режимом; flexible допускает обратный вылет в понедельник.

Выбранный mode/work hours передаются web API-клиентом, сохраняются в URL, reload, history/back, пагинации и canonical фильтрованных страниц (noindex). На weekend landing явный mode заменяет implicit legacy constraint; исходный URL без mode сохраняет boolean. Выбор «любые дни» на locked weekend landing открывает общий каталог с остальными условиями. Явный конфликт `weekend=true` + mode в вручную созданном URL остаётся API-ошибкой, применение формы нормализует выбор.

Чип mode удаляет вместе с собой work hours; удаление отдельного часа возвращает соответствующее default допущение. Reset сохраняет сортировку. Presets сохраняют выбранный mode и часы и меняют только собственные поля; старый weekend shortcut скрыт при явно выбранном mode и не заменяет ручной выбор. Recovery удаляет всю группу weekend/work hours, остальные условия сохраняет. Несвязанные date/duration/origin landing constraints сохранены.

FlightSchedule показывает might_require_leave/unknown и использованные часы/зону при известной оценке в card/detail/shared schedule. Отсутствие пересечения рабочих часов **не** тождественно no-leave eligibility: Monday 01:00 может не пересекать 09–17, но не проходит консервативный Sunday-return predicate. Фактическая дата прилёта/+1 остаётся видна отдельно через H3-02 formatter.

`WEEKEND_QUERY_TOO_BROAD` получает локализованный текст с предложением уточнить airport/destination/dates/price до 500 кандидатов; это ошибка, а не «0 предложений». API shape validator проверяет optional assessment v1. Старый API читается для обычных запросов; если он проигнорирует новый mode и вернёт неподтверждённые элементы, клиент отклонит ответ как INVALID_RESPONSE. Для no-leave проверяется также соответствие часов работы запросу. Empty result сам по себе не сертифицирует ни одного предложения.

Alerts пока не поддерживают новые modes: вместо ссылки с обещанием тех же условий показывается явное пояснение и переход к отдельной настройке. Alert schemas/matching/dispatch не менялись, реальные уведомления не отправлялись. Нового consent/analytics event нет; имеющиеся privacy semantics сохранены.

## Проверки

Изолированная копия `.cache/aud05-h3-01c-20261103`, loopback 3125/8125, существующие prepare-e2e/Playwright/axe. Chrome desktop/mobile. Browser запускался через `npm run start` после production build; рабочий Playwright config не менялся. Test-only endpoint создаёт явно синтетические known/unknown/DST itineraries, использует реальный API/predicate/serializer и удаляет fixtures после сценария. Too-broad transport code моделируется в fixture middleware; настоящий cap проверен H3-01b API tests.

| Проверка | Результат / evidence |
|---|---|
| `npm run test:unit` | **236 passed**, [вывод](node-complete.txt) |
| `npm run lint` | exit 0; [вывод](lint-complete.txt) |
| `npm run build` в изолированной копии | exit 0, TypeScript passed, 61 static entries; [вывод](build-complete.txt) |
| Полный API: SDK `-m pytest -q -p no:cacheprovider --junitxml=docs/h3-01c/api.xml` | **1001 passed /18 skipped**, 90.04s; [вывод](api.txt), [JUnit](api.xml) |
| SDK `-m ruff check apps/api --no-cache` | PASS, [вывод](ruff.txt) |
| SDK `-m mypy apps/api/app --cache-dir .cache/h3-01c-mypy` | PASS, 118 source files; [вывод](mypy.txt) |
| Первый browser: `npm run test:e2e -- weekend.spec.ts filter-workflow.spec.ts local-flight-time.spec.ts --reporter=json` | **16 passed /8 failed**, [JSON](browser.json), [вывод](browser.txt); существующие 14 сценариев и 2 новых too-broad/DST passed |
| Итоговый browser: `npm run test:e2e -- weekend.spec.ts --reporter=json` | **10 passed**, [JSON](browser-verified.json), [вывод](browser-verified.txt); итого подтверждены **24 уникальных** сценария, не один чистый full-suite rerun |
| IDE build_project изменённых файлов | isSuccess=true, limited diagnostics |

SDK перед Python-командами проверялся через PyCharm: Python 3.12.10 `.venv/Scripts/python.exe`, pip. Dependencies не устанавливались.

Новые Node tests: URL roundtrip general/landing/city-break/Warsaw, canonical noindex, legacy default, form conflict/hour cleanup, preset preservation, recovery, 4 locale copy; API query forwarding, distinct too-broad code и отказ неподтверждённого/несогласованного exact response. Browser matrix: 4 языка ×desktop/mobile, известный Monday arrival +1 и unknown notice, no-leave отбрасывает Friday AM/Monday/unknown, custom 06–07 допускает Friday 08:00, reload/back, night preset сохраняет 220 PLN и рабочие часы, flexible Monday, mode chip removal, legacy landing/default и переход «любые дни»; axe filter panel и отсутствие overflow 320px. DST и too-broad проверены отдельно на desktop/mobile. Существующие filter workflow дополнительно проверяют reset, manual overrides и историю; local-flight-time сохраняет бюджет после sharing.

## Найденные ошибки и ограничения

Первый browser обнаружил двойной вывод leaveNotice в компактном расписании. Сначала уточнён locator, второй прогон всё ещё видел два элемента (2 passed /8 failed): [JSON](browser-final.json). Исправлена сама разметка: один notice в compact и один в full branch. Отдельный PL desktop probe затем дошёл до chip removal и выявил гонку в новом тесте: синхронное чтение URL сразу после клика. Добавлено ожидание завершения навигации, исходный [probe](browser-complete.json) сохранён. Итоговые 10 cases прошли без ослабления продуктовых ожиданий.

Dev React use() diagnostic из H3-01b исследован повтором существующего delayed-search scenario в **production** runtime: оба desktop/mobile cases passed, этот diagnostic в логе не воспроизведён. Причина dev-only симптома не установлена и исправление не заявляется; дополнительный dev/React investigation остаётся H3-17b. Это не доказательство отсутствия всех console issues во всех окружениях.

18 PostgreSQL tests skipped; два прежних deprecation warnings Starlette/httpx и anyio. WebKit, полный site-wide axe/visual/performance sweep, production data distribution/capacity, реальные партнёры/рассылки и KPI не проверялись. Cap 500 кандидатов нового режима сохраняется. Work hours не учитывают праздничные дни, ночные смены, домашний адрес и commute. Production deploy не выполнялся.

## Файлы и rollback

Web: новый `src/lib/weekend.ts`; api.ts/api-contract.ts, search-policy.ts, trip-filters.ts, search-recovery.ts; filters.tsx, flight-schedule.tsx, deals/page.tsx, globals.css; weekend.test.mjs, weekend.spec.ts, api-client-contract.test.mjs. API только test fixtures: e2e_app.py и новый weekend_browser_fixtures.py. Документы H3 progress/decisions и этот каталог.

Rollback только delta 01c: убрать mode/work-hour UI, forwarding/guard/assessment validator, новую copy/notice/CSS, соответствующие tests/fixtures и вернуть prior URL/preset/recovery branch. Сохранить backend 01a/01b, H3-02 timeline и H3-04 ranking; те же файлы содержат предыдущие изменения, общий reset недопустим. Saved data и DB schema не изменялись, миграции/feature flag не нужны.

Acceptance H3-01 закрыт на локальных fixtures: Monday arrival явно видна, strict mode её не принимает, unknown не сертифицируется, legacy URL работает, mode/hours сохраняются при navigation. Следующая отдельная задача **H3-03**, в этом выполнении не начинается.
