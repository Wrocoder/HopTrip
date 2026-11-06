# H3-08a — серверный контекст аэропорта и города

Дата завершения: 2026-11-04 (Europe/Warsaw); проверка источников начата 2026-11-03. **H3-08a DONE; H3-08 IN_PROGRESS.** H3-08 разделена по §1.2 V3: эта часть — additive API-контракт, небольшой sourced registry и deterministic warning classifier; H3-08b — отображение card/detail и PL/EN/RU/UK. Новые предупреждения пока не отображаются; существующий returnAirportNotice сохранён.

## Аудит и выбранный объём

Airport/Destination уже хранят координаты и зоны, FlightFacts — независимые четыре аэропорта и реальные/расчётные timestamps. returnAirportNotice/FlightSchedule уже предупреждают о смене аэропорта на месте и дома. Это работающая функция, её не дублируем в UI. airport-guides.ts содержит editorial sources/reviewedAt, airport-transfers.ts — owner-confirmed affiliate links, но не структурированные данные расстояния/времени. Их verifiedAt не доказывает время трансфера и не переносится в новый реестр. flight-reference.json — snapshot IANA zones/airlines, не источник city distances.

Добавлен `DealRead.airport_context` (`airport-context-v1`) через общий catalog serializer. Входы: существующие FlightFacts, destination_slug, ROUND_TRIP и flight_quality.recommendation_eligible. Дополнительных SQL, сетевых запросов, геокодинга, стоимости API, DB migration/backfill и зависимостей нет. Registry JSON загружается один раз на процесс с lru_cache; Dockerfile уже копирует apps/api целиком. Изменение реестра требует перезапуска процесса. Package/wheel сборка отдельно не проверялась.

## Реестр и проверенные источники

Ключ — **точная пара airport IATA + destination_slug**, не только аэропорт. Опубликованное расстояние не является измеренным маршрутом и не переводится в минуты. У источников нет единой методики/конечной точки, поэтому `distance_basis=PUBLISHER_UNSPECIFIED` и явное ограничение не позволяют выдать число за road distance. Существующие seed slugs milan/paris совпадают с реестром; bergamo подготовлен как отдельная city association без добавления Destination в БД.

| Airport / target | Опубликованное расстояние | Источник | last_verified_at |
|---|---|---|---|
| BGY / milan | 45 км до Милана | [SACBO — Airport Infrastructure](https://www.milanbergamoairport.it/en/airport-infrastructure/) | 2026-11-03 |
| BGY / bergamo | 5 км до Бергамо | [SACBO — Airport Infrastructure](https://www.milanbergamoairport.it/en/airport-infrastructure/) | 2026-11-03 |
| BVA / paris | около 80 км к северу от Парижа | [Официальный туристический офис Paris je t’aime](https://parisjetaime.com/eng/article/from-paris-beauvais-airport-a540) | 2026-11-03 |

Для BVA не смешиваем встречающиеся у других сайтов 77/85 км с выбранной публикацией и не выдаём это за собственное геоизмерение. Число80 по смыслу приблизительное. Registry в этой части ограничен тремя отношениями; MXP/LCY/другие аэропорты и неизвестные city pairs возвращают UNKNOWN. Страница Malpensa from-to оказалась недоступной через browser tool; страница London City не раскрыла в извлечённом основном тексте distance из поискового snippet. Эти сведения не перенесены в runtime. При необходимости расширить покрытие — отдельно проверить доступный authoritative source и точный target, не брать число из affiliate registry или названия аэропорта.

## Контракт и правила

`arrival` и optional `return_departure` — отдельные AirportCityContext с airport, destination_slug, target_city, status KNOWN/STALE/UNKNOWN, distance_km/basis, source URL, last_verified_at и remote. Travel minutes в v1 строго **null**, travel_estimate_status строго UNKNOWN, включая известное расстояние. Fare/schedule/live transport data отсутствуют. H3-07 destination_time/city unknown/buffers и сортировка не менялись.

Freshness считается **на UTC-дату чтения**, не дату будущей поездки: возраст0–180 дней включительно → KNOWN; больше180 или future review → STALE. При STALE source/review date остаются для проверки, но distance/basis/remote скрыты как null; неизвестное не становится «близко» или нулём. Статус KNOWN означает допустимость редакционного snapshot, не гарантию на дату поездки.

Registry loader проверяет schema/version, HTTPS без embedded credentials, пропускает повреждённые строки. Недоступный/битый JSON → пустой реестр/UNKNOWN. Дубли одного ключа отклоняются целиком, не last-writer-wins. Типы Pydantic и nullable поля сохраняют явное unknown. Источник не опрашивается на каждый запрос; callback/переходов по URL нет.

Предупреждения — machine codes с явно опубликованными product assumptions:

- `remote_from_km=40`: remote=true от40 км **по выбранному опубликованному расстоянию**. Это выбранный product warning cutoff, не стандарт аэропортов, не реальный travel time и не гарантия центра города. Поэтому BGY для milan remote, а для bergamo — false; для непроверенной пары — null.
- DIFFERENT_DESTINATION_AIRPORTS сравнивает конечный outbound airport и фактический return-origin; DIFFERENT_HOME_AIRPORTS — исходный аэропорт и конечный return-destination. Неполные пары остаются null. Смена аэропорта не скрывается из-за отсутствия city metadata.
- Late arrival — local time >=22:00; early arrival — <06:00; early return departure — <08:00. Это продуктовые пороги напоминания проверить транспорт, **не часы работы транспорта/терминала**. Нужны aware instant и IANA zone соответствующего аэропорта, DST учитывается преобразованием instant. Missing/naive/unknown zone → *_TIME_UNKNOWN, без UTC guess. Расчётный arrival сохраняет arrival_time_estimated=true, чтобы UI не показывал его как точный.
- Дополнительные codes: REMOTE_ARRIVAL_AIRPORT/REMOTE_RETURN_AIRPORT, *_METADATA_UNKNOWN, STALE_AIRPORT_METADATA, TRANSFER_TIME_UNKNOWN. Длительность не вычисляется из расстояния; буфер не вычитается.
- При recommendation_eligible=false — UNVERIFIED_ITINERARY и неизвестный контекст, без выдуманной классификации маршрута. Поле `itinerary_verified` означает **только прохождение этого существующего source/context quality gate**; не полноту расписания, факт выполнения рейса, live availability или достоверное city time. Estimated/unknown clocks могут оставаться и при true.

## Совместимость и проверки

Схема additive для list/detail/общего serializer; old frontend допускает дополнительное поле и продолжает прежний UI. Existing warning copy, PL/EN/RU/UK, SEO/canonical/URL, saved v1/share/budget, analytics/consent и attribution не изменены. Новых пользовательских строк в08a нет; перевод machine codes и источников —08b. Реальные партнёрские переходы, рассылки, production/deploy/PR/commit не выполнялись.

- **35 новых API-сценариев**: source-specific pairs (BGY/Milan vs Bergamo, BVA/Paris); BGY↔MXP и смена дома; unknown LCY/invalid IATA/city mismatch; missing/one-way/unverified; свежесть0/180/181/future; local22:00/06:00/08:00 boundaries, midnight/DST folds/naive/unknown zone и estimated; missing/bad/duplicate registry/cache; strict null travel; public list/detail/sort и serializer parity.
- Targeted airport-context/destination-time/return-routes: **90 passed**, [JUnit](targeted.xml), [лог](targeted.txt). Полный API: **1092 passed /18 skipped**, [JUnit](api.xml), [лог](api.txt). PostgreSQL не проверен; 2 прежних Starlette/httpx и anyio deprecation warnings.
- Ruff apps/api pass, [лог](ruff.txt), initial auto-fix исправил2 import-order issues. Mypy **122 files, no issues**, [лог](mypy.txt). IDE build success с limited diagnostics.
- Frontend unit **247 passed**, [лог](node.txt). Web runtime не менялся: production frontend build/ESLint не повторялись. Последний frontend production build относится к07c, не новому прогону.
- Browser regression: **10 passed**, destination-time.spec.ts +local-flight-time.spec.ts, Chrome desktop/mobile, [JSON](browser.json), [лог](browser.txt). Это совместимость existing sort/card/detail/history/4locale/320px/axe и midnight/manual budget/share, а не новый UI airport-context. Изолированный dev runtime `.cache/aud05-h3-08a-20261104`, 3125/8125, fixture SQLite, PyCharm SDK Python3.12.10. Подготовка через prepare-e2e.ps1; **новый untracked registry JSON и weekend_browser_fixtures.py скопированы явно**, поскольку подготовщик берёт только code extensions для untracked файлов.

Команды после python-tools SDK preflight: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider apps/api/tests --junitxml=docs/h3-08a/api.xml`; `-m ruff check --no-cache apps/api`; `-m mypy apps/api/app --cache-dir .cache/h3-08a-mypy`. Node из apps/web: npm run test:unit. Browser из копии: `npm run test:e2e -- destination-time.spec.ts local-flight-time.spec.ts --reporter=json`, HOPTRIP_TEST_PYTHON из SDK, PLAYWRIGHT_CHANNEL=chrome, PLAYWRIGHT_JSON_OUTPUT_NAME в docs/h3-08a.

## Откат и следующий запуск

Удалить только schema/service/registry airport_context, поле/импорт в DealRead, вызов/импорт в catalog serializer и новые тесты/evidence. Сохранить все предыдущие H3-изменения в общих файлах; полного git reset/checkout не делать. Feature flag и DB rollback не требуются, данных БД эта часть не меняет.

H3-08b должна показать существенные machine warnings в card/detail, объединить с прежним returnAirportNotice без повторов, локализовать PL/EN/RU/UK, раскрыть source/review date/approximate distance и product thresholds, корректно обработать stale/unknown/estimated/старый API. Проверить BGY↔MXP, BVA/Paris, близкое и неизвестное отношение, overnight/early/DST, mobile/keyboard/axe. Если расширяется реестр — сначала подтвердить источник. Автоматически вычислять usable city time из текущего distance запрещено. После этой части — остановка перед08b.
