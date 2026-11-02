# DATA-03 — Flight Date, Airport, and Timezone Validation

Дата: 2026-10-30. Зависимость AUD-02 выполнена. Объём — валидация исходных flight records/route evidence, календарные дни фильтра поездки, formatter расписания и автоматические регрессии. Production, live provider APIs, SMTP и credentials не затрагивались.

## Проверенные находки и исправления

1. **Несвязанные пересадки.** validated_segments проверял время и крайние аэропорты, но принимал WRO → BER, CDG → STN как единый маршрут. Теперь соседние flight legs должны соединяться одним аэропортом; участки с одинаковыми origin/destination отклоняются. Неизвестный наземный трансфер между аэропортами не выдумывается. Invalid evidence не публикует legs; cached price и исходный payload сохраняются.
2. **Невозможные часы.** JavaScript Date превращал 2030-02-30 в 2 марта; Python принимал ISO week date и нормализовал offset +01:60. Общий backend offset_datetime и web validCalendarDate/clock bounds теперь отклоняют такие значения, 24:00, naive/date-only clocks и UTC overflow. Backend сохраняет исходный offset для fallback календарного дня, instant отдельно приводит валидное значение к UTC. Унаследованный utc() для naive SQLite columns не изменён.
3. **UTC-дни вместо дней вылета.** trip_duration сравнивал UTC dates: вылет 30 марта в 00:30 +01 и обратный вылет 31 марта считались двумя ночами. Теперь фильтр использует календарный день каждого вылета: известную IANA airport zone, иначе исходный offset; date-only сохраняется буквально. Return airport не получается перестановкой outbound airports.
4. **Маршрут не соответствовал запросу.** Нормализация принимала KRK вместо запрошенного WRO и MAD вместо BCN. Теперь код запроса должен совпасть с явно указанным городом или аэропортом ответа. LON и STN остаются различными валидными anchors одного подтверждённого payload. Также отклоняется совпадение аэропорта отправления и назначения. Нельзя доказать принадлежность произвольного аэропорта городу только по трём буквам; такая связь не выдумывается.

Сохранены независимые аэропорты возврата, включая STN → LTN и возврат домой через KRK вместо WRO. Прямой разворот outbound маршрута не становится доказательством return маршрута. Ticket identity, provider provenance, API schema, affiliate links и формула цены не менялись.

## Матрица требований

| Требование DATA-03 | Защита / автоматические сценарии |
|---|---|
| IATA codes | ASCII uppercase syntax в facts/legs; provider normalization и active DB origin/destination resolution. Новые Unicode, digit, whitespace, lower-case и non-string cases в test_flight_validation.py; существующие invalid_return_airports и provider_contract |
| Origin/destination consistency | Запрошенный city/airport anchor, distinct endpoints, последовательность аэропортов каждой пересадки; существующие alias ambiguity tests ingestion/lifecycle |
| Return route correctness | test_return_routes.py: тот же opaque ticket, независимые return airports, REST return departure против GraphQL arrival home, invalid/missing evidence, explicit open-jaw; новые broken connection cases в обоих направлениях |
| Local clocks / timezone conversions | Единый offset parser на backend, IANA reference без guessed zones; flight-facts.test.mjs, test_flight_facts.py; неизвестная зона явно отображается как UTC |
| Overnight flights | local-flight-time.spec.ts: 00:40 и +1 день при сохранении 7 hotel nights, checkout, ручных расходов и share; existing midnight API/unit cases |
| DST | Spring gap и autumn repeated hour по двум разным instants; test_trip_dates_follow_local_departure_dates_across_dst, existing IANA unit cases; hydration.spec.ts для winter GMT |
| Negative/implausible durations | Нулевые/отрицательные, bool/string/fraction, >10080 minutes отклоняются; segment span >7 days, reversed/overlapping legs и mismatch airborne/elapsed в existing/new backend tests. Лимит 7 дней существовал до задачи; это defensive bound, а не модель физически возможных рейсов |
| Date-only vs timestamps | DATE precision не превращает UTC midnight в часы аэропорта; date-only filter не сдвигается зоной; leap day допустим, 30 февраля/24:00 не нормализуются в другой день |

Проверка синтаксиса IATA не является полной online-сверкой мирового реестра аэропортов. Unsupported origin/destination не создаются в БД автоматически. Reference snapshot и его проверка наличия IANA zone сохранены. Для произвольных неизвестных аэропортов время не угадывается по городу или часовому поясу браузера.

## Проверки

Новый test_flight_validation.py содержит **41 параметризованный case**, web test добавляет одну проверку invalid calendar/clock со списком значений. До основных исправлений: **12 failed / 22 passed** — [before.xml](before.xml); до завершающего query guard: **2 failed / 2 passed** — [route-before.xml](route-before.xml). Остальные новые cases защищают уже корректное поведение. Web red phase воспроизвёл фактический rollover 30 февраля → 2 марта; исходный log сохранён в [web-before.txt](web-before.txt).

| Проверка | Результат / доказательство |
|---|---|
| Первоначальная целевая backend-выборка | 120 passed, 2 deprecation warnings, 7.33 s — [targeted.xml](targeted.xml); выполнена до трёх дополнительных duration cases и query guard |
| Backend non-PostgreSQL, финальный query guard | 696 passed, 11 deselected, 2 warnings, 67.26 s — [backend.xml](backend.xml) и [results.json](results.json) |
| PostgreSQL | 11 passed, 692 deselected, 2 warnings, 46.98 s — [postgres.xml](postgres.xml); выполнен до последующего provider query guard, который проверяется финальным non-PG suite |
| Ruff / mypy | Passed / no issues in 100 source files после финального query guard |
| Web unit | 111 passed, 0 failures; targeted flight/calendar subset 13 passed |
| ESLint / Next build | Passed / passed, включая TypeScript и 61 static/SSG pages |
| Browser desktop/mobile | 14 passed, unexpected=0, skipped=0, flaky=0, errors=[], 130.29 s — [e2e.json](e2e.json) |

E2E: flight-facts.spec.ts (10 cases), local-flight-time.spec.ts (2), hydration.spec.ts (2). Локальные fixtures, Chrome headless, fake mail, отдельная SQLite, 3125/8125, собственный .next; полные 436 cases и реальные устройства не запускались. Дополнительно UI/layout/локализации не переделывались; существующие PL/browser и PL/EN/RU/UK unit contracts прошли. Изменение formatter сохраняет существующее unknown state вместо новых непереведённых UI-строк.

При browser-прогоне [539 runtime-файлов совпадали с checkout](isolation-source-check.json); затем добавлен provider query guard, не используемый browser fixture. Frontend и flight facts/routes между E2E и финальным checkout не менялись. Этот guard отдельно проверен красным/зелёным backend-набором. Не утверждается, что browser проверял live upstream normalization.

Mypy сначала обнаружил несовместимость inferred datetime/optional datetime в новом parser branch; ветка переписана с ранним return, повтор прошёл. Эта промежуточная ошибка не оставлена в итоговом коде. Существующие deprecations TestClient/anyio и npm min-release-age остались предупреждениями; build/lint failures нет.

## Команды и изоляция

Перед каждым запуском Python получен SDK через PyCharm get_python_environment: .venv/Scripts/python.exe, Python 3.12.10. Для backend tests через PYTHONPATH подставлены pytest 9.0.3/certifi 2026.10.23 из отдельного .cache/sec01-updated; SDK пользователя не переустанавливался. APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false.

```powershell
# $sdk — executablePath, полученный из PyCharm; из корня checkout:
& $sdk -m pytest apps/api/tests/test_flight_validation.py apps/api/tests/test_flight_facts.py apps/api/tests/test_return_routes.py apps/api/tests/test_provider_contract.py -q
& $sdk -m pytest apps/api/tests -m 'not postgres' -q --junitxml=docs/data03/backend.xml
& $sdk -m ruff check apps/api
& $sdk -m mypy apps/api/app
# Из apps/web:
npm run test:unit
npm run lint
npm run build
# Из корня, только в новом каталоге:
./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-data03-new
# Из созданной копии apps/web, HOPTRIP_TEST_PYTHON=$sdk, PLAYWRIGHT_CHANNEL=chrome:
node node_modules/@playwright/test/cli.js test flight-facts.spec.ts local-flight-time.spec.ts hydration.spec.ts --reporter=json
```

PostgreSQL использовал отдельный postgres:16-alpine контейнер hoptrip-data03-20261030, label hoptrip.audit=DATA-03, hoptrip_test, random loopback port 61627, без host volumes. DATABASE_URL и TEST_DATABASE_URL были направлены только туда. Из apps/api выполнен alembic upgrade head до 0018_editorial_rehearsal, затем из корня pytest apps/api/tests -m postgres. После проверки label контейнер остановлен и удалён через --rm; production schema не менялась. Собственные browser-серверы завершены штатно, чужие 3100/8100 не использовались.

## Persistence / rollback / границы

Миграций и изменений API contract нет. Более строгая нормализация пропускает malformed provider records с увеличением existing rejected_items; invalid route evidence теряет только неподтверждённые public legs. Принятый payload и external_id не переписываются; массового backfill, удаления offers или изменения affiliate tracking нет. Новые проверки не исправляют автоматически старые database records.

При необходимости отката достаточно вернуть изменения **только DATA-03** в пяти runtime-файлах и двух test-файлах; не откатывать предыдущие SEC-01 fixes/lock и пользовательские изменения. Восстановление БД не требуется. Откат вернёт описанные ошибки валидации и календарного фильтра, поэтому предпочтительно исправление несовместимого provider record с регрессионным тестом.

Политика historical observation cohorts/scoring по departure month/duration не менялась: ingestion/statistics используют существующие UTC grouping keys; их согласование с календарными public trip dates и возможный безопасный backfill относятся к явному review DATA-02. Это ограничение не скрыто под заявлением, что все исторические данные пересчитаны. Freshness/expiry также не пересматривались в этой задаче (DATA-01).

Пользовательский master plan, предыдущие audit/security changes и IDE state сохранены. Generated next-env.d.ts возвращён к прежним dev imports после build. Следующая задача по roadmap — DATA-01; она не начата.
