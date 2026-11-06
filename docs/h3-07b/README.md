# H3-07b — серверная сортировка по аэропортовому интервалу

Дата: 2026-11-03. **H3-07b DONE** в границах API по §1.2 V3: сортировка с достоверностью, точным total и пагинацией. Подключение select, compact display и PL/EN/RU/UK — следующий отдельный запуск **H3-07c**. Общая H3-07 остаётся IN_PROGRESS. Первоначально 07b предполагала и UI; объём разделён перед реализацией, поскольку новый порядок требует проверки общего bounded query engine с weekend modes.

## Найдено и изменено

В API уже существовали три SQL sort и точный weekend gate: один ограниченный metadata join, фильтрация до offset/limit/total, явный cap 500. Нельзя сортировать только возвращённую страницу или объявлять усечённый scan полным результатом.

`GET /api/v1/deals?sort=destination_time` теперь использует тот же snapshot. `itinerary_matches` в существующем weekend_catalog.py вычисляет weekend assessment и destination_time v1 по одинаковым facts/quality/context; wrapper weekend_matches сохраняет прежнюю сигнатуру. Отдельный query engine, миграция и DB-кеш не добавлены. Только запрошенная страница сериализуется в полный DealRead; metadata для определения порядка загружается одним SQL независимо от количества предложений. Alias/component fanout не расходует лимит отдельных deals.

Порядок:

1. `sort_eligible=true`: airport_interval_minutes по убыванию.
2. При одинаковом интервале: цена PLN на человека, дата вылета, ID по возрастанию.
3. UNKNOWN/ESTIMATED и критический source context идут после всех достоверных интервалов; между собой — цена, дата, ID. Даже большая расчётная длительность не обгоняет известный нулевой интервал. Когда все интервалы недостоверны, весь список использует price fallback, без удаления предложений.

SQL-фильтры и availability применяются до snapshot. Exact weekend mode проверяется до сортировки; выбранные work hours сохраняются в assessment ответа. Total относится ко всему подходящему набору; пустая страница за концом выдачи сохраняет total. List без include_total использует тот же порядок. При более 500 кандидатах **после обычных SQL-фильтров, до exact weekend predicate** — HTTP422 `detail.code=DESTINATION_TIME_QUERY_TOO_BROAD`, включая сочетание с weekend_mode. Клиент должен предложить сузить поиск; это не частичная выдача и не тихий переход на иной порядок. Существующие weekend-запросы без новой сортировки сохраняют WEEKEND_QUERY_TOO_BROAD и тот же cap.

Новый enum описан в OpenAPI основного `/deals`. Scoped legacy endpoints `/departures/{iata}/deals` и `/destinations/{slug}/deals` сохраняют три старых sort; web wrappers уже используют общий `/deals` с origin/destination filters. Default price, явные score/departure, прежние URL и response envelopes сохранены. DestinationTime v1 не меняется: city time UNKNOWN, буферы не применяются, смена аэропорта раскрыта. Это ранжирование аэропортового интервала, не времени прогулки или отсутствия отпуска. Сохранённые планы, consent, affiliate, отправки и зависимости не менялись.

## Проверки

- Добавлены **14 API-сценариев**: порядок всего набора с limit1/offset и точным total/list; calendar/no-leave; известный zero против огромной оценки; all-unknown fallback; tie price/date/id; multiple flight/source/origin/destination conflicts; bounded scan и SQL narrowing с weekend/legacy filters; один metadata SQL и parity с public serializer, включая alias fanout.
- Первый targeted прогон: 65 passed /1 failed из-за повторного external_id фикстуры в новом tie-тесте, до проверки ранжирования. Артефакты [initial JUnit](targeted-initial.xml), [лог](targeted-initial.txt) сохранены. Исправлены только уникальные тестовые timestamps при одинаковом elapsed.
- После исправления полный API: **1057 passed /18 skipped**, [JUnit](api.xml), [лог](api.txt). Все новые и существующие weekend/default/time tests вошли в этот чистый прогон. PostgreSQL не проверен, 2 прежних Starlette/httpx и anyio warnings.
- Frontend unit: **241 passed**, [лог](node.txt). Web runtime не менялся; production frontend build/ESLint не повторялись.
- Ruff apps/api pass, [лог](ruff.txt). Mypy **120 files, no issues**, [лог](mypy.txt). IDE build success с limited diagnostics.
- Browser regression: **10 passed**, sorting.spec.ts и local-flight-time.spec.ts в изолированной копии `.cache/aud05-h3-07b-20261103`, Chrome desktop/mobile, 3125/8125, fixture SQLite; [результаты](browser.json), [лог](browser.txt). PL/EN/RU/UK прежних sort, pagination/history/drafts/back-link, 320px и axe filter panel; midnight/budget/share. Это проверка существующих UI sort/time/share, не будущего select destination_time. WebKit/full-site/CWV/production не проверялись.

Воспроизведение после SDK preflight: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider apps/api/tests --junitxml=docs/h3-07b/api.xml`; `-m ruff check --no-cache apps/api`; `-m mypy apps/api/app --cache-dir .cache/h3-07b-mypy`. Node в apps/web: `npm run test:unit`. Browser в копии, подготовленной docs/aud05/prepare-e2e.ps1, с HOPTRIP_TEST_PYTHON из PyCharm SDK 3.12.10, PLAYWRIGHT_CHANNEL=chrome и PLAYWRIGHT_JSON_OUTPUT_NAME: `npm run test:e2e -- sorting.spec.ts local-flight-time.spec.ts --reporter=json`.

## Следующий шаг и откат

**H3-07c**: optional select `Najwięcej czasu na miejscu`, точное пояснение airport interval + city time unknown/estimated, compact card/detail без дублирования старой строки. Локализовать PL/EN/RU/UK; API type/validator, обработка too-broad, URL/history/canonical, старый API, сохранённые планы и mobile/axe. Не доверять legacy destination_interval_minutes как достоверному ключу.

Для rollback вернуть только delta этой части в api/catalog.py и services/weekend_catalog.py, удалить test_destination_time_sort.py и её evidence. Сохранить H3-07a schema/service/serializer и предыдущие weekend/default sort изменения: сброс общих файлов целиком недопустим. Feature flag/migration не нужны; PR/commit/deploy и реальные внешние операции не выполнялись. После этой части — остановка перед H3-07c.
