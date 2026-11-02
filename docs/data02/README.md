# DATA-02 — Historical Price and Scoring Validation

Дата: 2026-10-30. Зависимость AUD-02 выполнена. Объём: восемь требований DATA-02, statistics cache, scoring/explanation, UTC cohort contract и публичное пояснение PL/EN/RU/UK. Следующая DEAL-04 не начиналась. Production DB, live providers, SMTP и affiliate tracking не менялись.

Статус DATA-02: DONE в checkout; deployment и production recalculation не выполнялись.

## Проверенные дефекты и изменения

1. Statistics включала нулевые/отрицательные и будущие observations, могла упасть на missing route и оставляла старый sample после исчезновения eligible cohort. Теперь конечная положительная цена PLN, route IDs, nonnegative/NULL duration и observed_at ≤ calculated_at проверяются перед aggregation. Неподходящая history сохраняется; derived cache пустой группы получает count/confidence=0.
2. PROVISIONAL score уже имел нейтральные price points, но scalar discount_percent и breakdown percentage могли рекламировать большой процент при sample_count<5. Новая методика выдаёт 0 в генерации и NULL percentage; публичный serializer не возвращает discount claim для не-CURRENT explanation.
3. Stored score проверял только weights/сумму и целое значение, поэтому согласованные по сумме, но неверные points, percentage, sample/status или snapshot price могли считаться CURRENT. Теперь flight-v4 воспроизводит формулу по сохранённым inputs/calculated_at и сверяет parts/status/percentage/basis и доступные Deal price/median/count. Read-time clock не меняет сохранённую оценку.
4. Входной datetime с offset на границе месяца мог дать иной cohort в SQLite и PostgreSQL. Ingestion сохраняет timestamps в UTC; observation departure_date/duration и lookup Deal используют те же UTC-правила. Исходный provider payload/identity не переписываются.
5. Старый cache не должен автоматически объявляться проверенным после обновления кода. Additive [0020_statistics_method](../../apps/api/alembic/versions/0020_statistics_method.py) вводит nullable methodology_version, без backfill. route-utc-v1 присваивается только пересчётом. NULL/empty/future cache не используется как baseline. Старые flight-v3 snapshots до regeneration не дают CURRENT comparison; v2 сохраняет явно LEGACY объяснение старых weights.

Решение и rollout contract: [DATA-02-01](../HOPTRIP_DECISIONS.md). Миграция не меняет keys/unique constraints и не удаляет history или cache rows.

## Точная методология

| Требование | Реализация и проверка |
|---|---|
| Median | Сортировка Decimal prices; линейная интерполяция по позиции (n−1)×q для q=0.25/0.5/0.75; monetary result округляется до 0.01 HALF_UP. Проверены n=1, odd/even, повторные цены, unsorted input, grosz tie |
| Comparable route grouping | Отдельные provider, origin airport, destination, product type, departure YYYY-MM, UTC duration. Восемь parameter cases не позволяют взять цену из соседней группы; NULL/0/3/4 durations различаются |
| Date / itinerary comparability | Это recorded UTC-month/date-interval cohort, а не local hotel-night group или exact itinerary. Проверена граница local October 1 / UTC September 30: один и тот же UTC key при сохранении и lookup. Airport/fare/carrier/stops/return-airport differences не замалчиваются в UI |
| Sample size | Minimum comparison count=5; history contribution/confidence saturates at 30. Count — число eligible recorded observations, не независимых продавцов или разных itineraries. Current quote может входить в median; отдельные записи одного рейса зависимы |
| Missing / bad data | Missing route, nonpositive/nonfinite price, negative duration и future observation исключаются из aggregation без удаления. PostgreSQL Numeric NaN проверен отдельно. Invalid/NULL-version/future cache не выдаётся за проверенный baseline |
| Percentage | Signed (median−current)/median×100; above-median сохраняет отрицательный знак. Breakdown percentage — Decimal quantize 0.01 с существующим default HALF_EVEN. scalar discount ограничен снизу 0 и только sufficient history. UI показывает signed PLN difference по grosz, <1 PLN нейтрально; это не seller discount |
| Freshness contribution | 15×clamp(1−age/48h,0,1), 0 при отсутствующем/будущем observation time или истечении к calculation time. Fetched_at не используется. Отдельные 6/24/48 h publication lifetimes DATA-01 могут скрыть цену раньше; этот score описывает момент расчёта, не срок бронирования |
| Ranking formulas | Price: 0.6×clamp(50+difference_percent,0,100), иначе нейтральные 30 points. History: 25×min(n/30,1). Каждая часть HALF_UP до 0.1, сумма частей HALF_UP до integer 0–100. Весов за baggage/convenience/carrier/commission нет. Stored score сортирует каталог; read path не пересчитывает его «на сегодня» |

Пример исключительно расчётный: price 330 / median 400 / n=24 / age=24h → 40.5+20+7.5=68. Это synthetic arithmetic, не реальная оферта. При price=median price part=30; выше медианы points снижаются. Neutral 30 при недостатке history не доказывает выгодность. confidence=min(n,30)/30 — индекс покрытия, не вероятность и не confidence interval.

History window по observed_at не ограничен прошлым N дней: используется вся сохранённая eligible история для departure year/month/duration. Истёкшие offers не удаляют историю. Повторная доставка одной observation_key не создаёт новый sample (защита ingestion DATA-01); legacy observations без ключей не объявляются независимыми или дедуплицированными задним числом.

## Что изменилось для пользователя

Карточка, score details и полная /info/price-comparison используют общий scope text: UTC interval может отличаться от местных дат/ночёвок, sample может включать текущую цену/несколько observations одного рейса/разные arrival airports и fares. Все четыре языка сохраняются. Price summary не выдаёт unavailable/provisional/legacy baseline за подтверждённую экономию.

UTC cohort сохранён намеренно: PriceObservation не хранит полные route payload/airport timezones каждого прошлого наблюдения, поэтому корректный local-date backfill всей истории невозможен из имеющихся полей. Новый version marker подтверждает правила eligibility/cohort, а не полное равенство тарифов или достоверность мирового рынка. Local trip dates и hotel nights DATA-03 остаются отдельным контрактом.

## Доказательства и ограничения

Первый [red phase](before.xml): 13 failed / 5 passed — ошибки eligibility/cache/discount/snapshot, при уже проходящих median cases. Отдельная [UTC red phase](utc-before.xml): 1 failed. Targeted промежуточная выборка [50 passed](targeted.xml); позднее добавленные grouping/version/boundary cases входят в полный backend результат. Неполная history не исправлялась созданием fake samples.

Итоговые данные: [results.json](results.json), [backend](backend.xml), [PostgreSQL](postgres.xml), [E2E](e2e.json), [source isolation](isolation-source-check.json).

| Проверка | Финальный результат |
|---|---|
| Non-PostgreSQL backend | 733 passed, 15 deselected, 2 warnings; 102.06 s |
| PostgreSQL | 15 passed, 733 deselected, 2 warnings; 62.83 s |
| Distinct backend tests | 748 по двум отдельным наборам; 30 новых non-PG и 2 PG |
| Web unit | 112 passed; 1 новая проверка UTC/PLN во всех locales |
| Ruff / mypy | Passed / no issues in 100 source files |
| ESLint / build | Passed, включая TypeScript и 61 static/SSG pages; final changed spec отдельно lint passed |
| Chrome E2E desktop/mobile | 6 passed, unexpected=0, skipped=0, flaky=0, errors=[]; 85.85 s |

E2E включает comparison details/parts/сохранение snapshot/axe checks, отсутствие advantages у missing/provisional/legacy data и страницы полной методологии на PL/EN/RU/UK при 320 px. Headless Chrome и mobile emulation, synthetic local fixture, не реальные устройства/market data. Все 539 runtime-файлов apps/api/app и apps/web/src совпали с финальным checkout.

Первый [E2E](e2e-initial.json): 2 pass / 2 unexpected — desktop показал штатную ошибку загрузки каталога (причина fetch failure не установлена), mobile обнаружил слишком широкий locator двух paragraphs в новой проверке. Locator уточнён до UTC paragraph. Старое hardcoded arithmetic ожидание также обновлено к действующей общей fixture: возраст 3h даёт freshness 14.1 и total 76; прежний 24h example 69.4 не описывал эту fixture. Product formula для прохождения теста не менялась. [Промежуточный repeat](e2e-recheck-intermediate.json): 4/4 pass, затем добавлены localized methodology cases, финальные 6/6 pass. Начальный failure не скрыт и не назван доказанным product defect.

После reuse текста guide unit harness выявил extensionless import при native Node TypeScript loading; runtime import сделан с .ts, unit/lint/build повторены и прошли. Initial Ruff import ordering устранён. Существующие TestClient/anyio deprecations, npm min-release-age и Node module type warnings не приводят к необъяснённым итоговым failures. Повторные наборы не суммируются с финальными, весь 436-case E2E suite не запускался.

## Воспроизводимость и безопасность

Python 3.12.10 SDK .venv/Scripts/python.exe получен PyCharm get_python_environment. Тесты используют pytest 9.0.3/certifi 2026.10.23 из ignored .cache/sec01-updated через PYTHONPATH; SDK не переустанавливался. APP_ENV=test, DATABASE_URL=sqlite://; реальные alerts/digest/editor/events-sync flags выключены. Provider responses — HTTPX fixtures, реальные SMTP/API не вызывались.

```powershell
# $sdk — executablePath из PyCharm; корень checkout:
& $sdk -m pytest apps/api/tests -m 'not postgres' -q --junitxml=docs/data02/backend.xml
& $sdk -m pytest apps/api/tests -m postgres -q --junitxml=docs/data02/postgres.xml
& $sdk -m ruff check apps/api
& $sdk -m mypy apps/api/app
# apps/web:
npm run test:unit
npm run lint
npm run build
# Корень, только новый isolated workspace:
./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-data02-new
# Копия apps/web, HOPTRIP_TEST_PYTHON=$sdk, PLAYWRIGHT_CHANNEL=chrome:
node node_modules/@playwright/test/cli.js test price-assessment.spec.ts --reporter=json
```

PostgreSQL требует TEST_DATABASE_URL/DATABASE_URL на disposable hoptrip_test. Здесь: postgres:16-alpine, контейнер hoptrip-data02-20261030, label hoptrip.audit=DATA-02, loopback port 58940, без host volumes. Alembic до 0020 выполнен только там; upgrade/downgrade/upgrade cache migration — только в generated test schema с sentinel row. Ряд cache сохранил sample/median и NULL marker после upgrade. History observations не удалялись; NaN/future test сохранил все пять rows при одном eligible sample. Контейнер остановлен с проверкой label и удалён --rm. Собственные browser-серверы завершились штатно; чужие 3100/8100 не останавливались.

## Release / rollback

1. При отдельно разрешённом release применить additive 0020 перед новым приложением. Новая модель не запускается на схеме 0019. Старый app совместим с дополнительной nullable column.
2. Выполнить штатный ограниченный пересчёт route statistics и generation свежих deals, затем проверить CURRENT/provisional cases. Версия cache не проставляется массовым UPDATE: это выдало бы непроверенную history за прошедшую validation. В этой задаче production recalculation не выполнялся.
3. До regeneration старые v3 snapshots не получают CURRENT comparison; discovery/цены доступны по прежним freshness gates, но новые claims не конструируются из старых breakdowns. Ранжирование сохранённых rows меняется только при generation, не при чтении.
4. Предпочтительный rollback — прежний app при сохранённой nullable column/data. Он вернёт прежние gaps validation/claim gating; исправление вперёд предпочтительно. Downgrade удалит только methodology marker, потеряв trust metadata, но не historical prices/cache rows. Проверен только на synthetic data; production downgrade не выполнялся.

Нет изменения observation_key, affiliate attribution, source prices или observed_at. Новый UTC storage нормализует представление datetime для последующих ingestion; старые rows не переписывались. DECISIONS, AUDIT, TEST_PLAN и progress обновлены; пользовательский master plan/предыдущие изменения сохранены. Generated next-env.d.ts восстановлен к прежним dev imports. Следующая DEAL-04 не начата.
