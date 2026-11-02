# DATA-01 — Flight Freshness and Expiration

Дата: 2026-10-30. Зависимости AUD-01/AUD-02 выполнены. Объём: аудит восьми областей freshness, исправление lifetime наблюдения, совместимая миграция и регрессии. DATA-02 не реализовывалась. Машиночитаемые итоговые результаты — [results.json](results.json).

Статус DATA-01: DONE в checkout; production release не выполнялся.

## Подтверждённый дефект и исправление

Синтетическая последовательность: цена A=209 имеет expires_at через час; затем приходит B=220; через два часа exact-trip cache снова возвращает A, уже без старого expires_at или с более поздним. До исправления A сохраняла исходный observed_at, но получала новый effective expiry через 48 часов от него. История цен не содержала раннего deadline A; read-time gate мог снова пропустить уже истёкшую цену.

PriceObservation теперь хранит nullable expires_at — самый ранний effective deadline конкретного observation_key. При reappearance/duplicate ingestion используется минимум сохранённого deadline, policy и source expiry. В рамках существующей последовательности блокировок повторно читается observation FOR UPDATE. Цена, observed_at, identity и выбранный ticket не становятся новыми от одной доставки. В broad-feed protected snapshot разрешено только сокращение deadline **той же** observation_key; цена/URL остаются защищены, expiry другого наблюдения не применяется.

Миграция [0019_observation_expiry.py](../../apps/api/alembic/versions/0019_observation_expiry.py) добавляет nullable column без удаления или backfill истории. Для displaced legacy quote с NULL deadline достоверный старый expiry уже утрачен: повторная запись ограничивается deadline не позднее её observed_at и остаётся непригодной для fresh catalogue. Известный expiry legacy текущего offer сохраняется. Действительно новое source observation может создать новый lifetime. Решение зафиксировано в [HOPTRIP_DECISIONS.md](../HOPTRIP_DECISIONS.md).

## Явная политика stale / expired

| Время до отправления | Максимальный возраст цены | Интервал попытки exact-trip refresh |
|---|---|---|
| ≤7 дней | 6 часов | 1 час |
| >7 и ≤30 дней | 24 часа | 4 часа |
| >30 дней | 48 часов | 12 часов |

Это существующие правила price_lifetime.py/price_refresh.py; интервалы не менялись. hidden_after дополнительно учитывает source expiry, departure, linked offer и будущие переходы в более короткое окно. Ровно на границе цена уже скрыта. FIRST_SEEN — первое появление cached quote; SOURCE — supplied source observation time; fetched_at — доставка. Повторный fetched_at не продлевает срок. availability_checked_at остаётся NULL: cached REST/GQL данные не названы live-проверкой брони.

- Fresh offer может показываться только в пределах всех действующих bounds. Цена у продавца и наличие требуют проверки у партнёра.
- Stale/expired/departed/future-observation source исключается read-time query независимо от работы scheduler. Список/total, detail, departures/destinations и /go используют этот gate. Недоступный /go не создаёт AffiliateClick.
- Worker может перевести Deal в STALE/EXPIRED; безопасность read-time gate не зависит от своевременного persisted status.
- Ошибка/429/timeout/неполный snapshot не означает sold out и не продлевает observation age. Старый cache допустим до своего deadline; затем исчезает. Без новых достоверных данных оферта не «оживает» от каждой попытки refresh.
- PriceObservation сохраняется для статистики и после истечения offer; lifetime не служит основанием удаления исторической цены. Local budgets/plans остаются пользовательскими данными, но не подтверждением текущей цены.

## Восемь областей review

| Область | Проверенная реализация / вывод |
|---|---|
| Offer ingestion | Parameterized ingestion, provider/route resolution, source-observed или first-seen, price_deadline; fixed observation-level expiry при A → B → A. Invalid/future timestamps отклоняются, поздняя старая source observation не заменяет новую цену |
| Refresh intervals | Default pipeline interval 3600 s; exact refresh 1/4/12 h, bounded groups/pages/requests, manual offer_ids обходит scheduling interval, но не проверку ticket/route. Пропущенные scheduler slots не догоняются burst-запусками |
| Observation timestamps | source_observed_at, last_verified_at, fetched_at различаются; observation_key содержит provider, itinerary identity, price/currency, source time либо unknown; delivery time не превращается в observation time |
| Expiration | Общие price_deadline/fresh_price_clause, explicit source/offer bounds, departure, read-time SQL gates, price_freshness hidden_after, client timer/focus/visibility updates. Новый expiry bound переживает смену текущей цены |
| Duplicate handling | Повторная unknown-source цена сохраняет first-seen и earliest expiry; source-supplied новое наблюдение имеет отдельный ключ. Unique observation_key и row locks; добавлен PostgreSQL race test |
| Provider availability | Missing credentials и provider errors имеют явные diagnostics; unavailable/incomplete cache не продлевает lifetime и не доказывает sell-out. DataProvider.is_active сам по себе не является freshness clock или live-health доказательством; affiliate-provider approval проверяется отдельно |
| Cache invalidation | API SecurityMiddleware и redirects no-store, web fetch cache:no-store; read-time gates при каждом запросе. Открытая вкладка отключает partner link по hidden_after, включая возврат focus/visibility. Глобальная очистка caches/production CDN не выполнялась |
| History vs current | TravelOffer меняется, PriceObservation сохраняет цены/observed_at и теперь effective expiry. Statistics продолжает читать историю; нет удаления rows, изменения cohorts/scoring или пересчёта production history |

## Автоматические доказательства

Новые проверки test_freshness_history.py: A → B → A с отсутствующим/продлённым source expiry, legacy NULL history, actual list/total/detail/redirect gate до регенерации Deal, сохранение обеих цен и timestamps, новое source observation, protected snapshot bounds. PostgreSQL дополнительно проверяет concurrent quote reappearance и upgrade/downgrade/upgrade на непустой истории в своей generated schema.

Red phases: [исходный A → B → A](before.xml) — 2 failed; [protected snapshot](protected-before.xml) — 1 failed/1 passed; [legacy history](legacy-before.xml) — 2 failed. Неуспешный draft расширения теста содержал ошибочно перемещённые строки соседнего теста; исправлен до чистой red phase, [draft XML](protected-test-draft.xml) сохранён и не считается product regression.

Предварительная targeted выборка: [49 passed](targeted.xml). Первый PostgreSQL набор: [12 passed/1 failed](postgres-initial.xml) из-за оставшегося hardcoded head 0018 в существующем editor upgrade test; ожидание обновлено до 0019, semantic assertions сохранности каталога/editorial data не удалены. Промежуточные полные результаты и E2E не суммируются с финальными.

Итоговые gates и длительности находятся в [results.json](results.json): [non-PostgreSQL](backend.xml), [PostgreSQL](postgres.xml), [desktop/mobile E2E](e2e.json). Web unit: 111 passed. Ruff и mypy: passed, 100 source files. Frontend runtime не менялся; новые web lint/build не требовались и в DATA-01 не запускались. Это не утверждение о новом remote CI или полном 436-case browser suite.

| Финальный gate | Результат |
|---|---|
| Backend non-PostgreSQL | 703 passed, 13 deselected, 2 warnings, 87.33 s |
| PostgreSQL | 13 passed, 703 deselected, 2 warnings, 42.59 s |
| Различных backend tests | 716 по двум отдельным наборам; 9 новых cases |
| Web unit | 111 passed, 0 failed |
| Browser desktop/mobile | 4 passed, unexpected=0, skipped=0, errors=[], 47.06 s |
| Ruff / mypy | Passed / no issues in 100 source files |

E2E price-freshness.spec.ts проверяет source/first-seen caveat, отдельный fetched_at, сохранение наблюдения list → detail, axe без violations в выбранном layout, ширину 320 px, исчезновение partner CTA после deadline и кнопку refresh. Chrome desktop/mobile, fixture SQLite/fake mail, собственный .next и 3125/8125. Изменений UI/переводов нет; существующий PL/EN/RU/UK unit contract прошёл.

[Сверка изоляции](isolation-source-check.json): все 539 runtime-файлов apps/api/app и apps/web/src совпадают с финальным checkout. E2E fixture не применяет Alembic: SQLite schema создаётся из модели; саму миграцию проверяет отдельный PostgreSQL gate.

## Команды и изоляция

Python 3.12.10 SDK .venv/Scripts/python.exe получен через PyCharm get_python_environment. Backend tests используют pytest 9.0.3/certifi 2026.10.23 из ignored .cache/sec01-updated через PYTHONPATH; SDK не переустанавливался. APP_ENV=test, DATABASE_URL=sqlite://; ALERTS_ENABLED, ALERTS_DIGEST_ENABLED, EDITOR_ENABLED, EVENTS_SYNC_ENABLED=false.

```powershell
# $sdk = executablePath, полученный из PyCharm; из корня:
& $sdk -m pytest apps/api/tests -m 'not postgres' -q --junitxml=docs/data01/backend.xml
& $sdk -m pytest apps/api/tests -m postgres -q --junitxml=docs/data01/postgres.xml
& $sdk -m ruff check apps/api
& $sdk -m mypy apps/api/app
# Из apps/web:
npm run test:unit
# Новый isolated workspace, из корня:
./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-data01-new
# Из копии apps/web; HOPTRIP_TEST_PYTHON=$sdk, PLAYWRIGHT_CHANNEL=chrome:
node node_modules/@playwright/test/cli.js test price-freshness.spec.ts --reporter=json
```

PostgreSQL command требует TEST_DATABASE_URL и DATABASE_URL **одноразовой** hoptrip_test. Здесь использован postgres:16-alpine, контейнер hoptrip-data01-20261030, label hoptrip.audit=DATA-01, random loopback port 61606, без host volumes. Alembic upgrade head (из apps/api) выполнен только там. Migration/race tests используют отдельные generated schemas в этой же test DB, не production. Никаких live provider/SMTP requests: HTTPX MockTransport может выводить URL в test log, но сеть не вызывается.

После проверок контейнер остановлен с проверкой label и удалён --rm; собственные browser-серверы завершились штатно. Чужие 3100/8100 не использовались и не останавливались. Нет diff next-env.d.ts, поскольку frontend build не запускался.

## Release и rollback

- В checkout добавлены model field и миграция 0019; API response schema, affiliate tracking, history price/time и формула score не менялись.
- При отдельно разрешённом release сначала применить additive migration 0019 штатной deployment-процедурой, затем запустить новое приложение. Новая модель не должна запускаться на схеме 0018.
- Старое приложение совместимо с дополнительной nullable column. Предпочтительный rollback — прежняя версия приложения при сохранённой 0019/metadata; он возвращает прежний дефект lifetime, поэтому предпочтительно исправление вперёд. Не откатывать SEC-01 fixes/lock и пользовательские изменения.
- Alembic downgrade удалит только новую deadline column, а не цены/observed_at, но потеряет её защитные metadata. Такой downgrade проверен только на synthetic history в isolated schema. Production downgrade/backup restore/очистка БД не выполнялись.
- Старые утраченные source deadlines не восстанавливались массовым backfill. Консервативное legacy правило исключает возвращённую непроверенную цену, сохраняя её историю. Это deliberate change acceptance, а не заявление о восстановлении всех прежних upstream records.

Следующая задача — DATA-02; она не начата. Пользовательские и предыдущие изменения сохранены. Production deployment и реальные рассылки не выполнялись.
