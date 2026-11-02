# DEAL-03 — понятная и устойчивая сортировка

Дата:2026-10-31. Только DEAL-03; зависимости DEAL-01/DATA-01 DONE. TRIP-01 не начата.

## Проверено до изменений

API уже принимает только `score`, `price`, `departure`. Полная отфильтрованная выборка упорядочивается SQL до limit/offset, с одинаковым порядком для legacy list и include_total envelope. Count/page вычисляются одним SQL snapshot каждого запроса. Все три варианта уже имеют уникальный id в конце tie-break sequence. На UI подписи не поясняли, что score составной, price использует PLN, а departure — дату без сортировки по часам.

Проверены list_deals/_deal_order, available_deals_query, модели Deal/TravelOffer/FlightFacts, генерация flight-only Deal, score explanation, FormData/URL/returnTo/SEO policies, существующие tests. Изучена установленная Next документация Server Actions. Правила availability/freshness и source quality не переписывались.

## Фактические правила

| URL sort | Primary / последующие ключи | Подпись и смысл |
|---|---|---|
| score, default | deal_score DESC, trip_start ASC, id ASC | Вспомогательный составной результат, по убыванию |
| price | price_per_person_pln ASC, trip_start ASC, id ASC | Цена на человека в PLN, по возрастанию |
| departure | trip_start ASC, price_per_person_pln ASC, id ASC | Показанная на карточке дата вылета, сначала ближайшая; часы порядок не определяют |

ID — технический последний ключ, пользователю объясняется как постоянный порядок при равенстве остальных значений. Price/date/score в Deal обязательны; отсутствующие часы или nights не становятся нулём сортируемого показателя. При одинаковых именованных ключах используется тот же id независимо от этих полей. Нет скрытой надбавки за неизвестные flight details.

`score` не является отдельной сортировкой по проценту ниже медианы. Current flight-v4 сохраняет существующий состав: цена относительно истории до60 points, наблюдения до25, freshness до15; neutral price points при недостатке истории не доказывают выгодность. В выдаче также возможны прежние версии/неполные explanations с сохранённым score. Поэтому название «лучшее историческое сравнение» было бы неверным. Link из пояснения ведёт к прежней полной методологии; per-offer calculation раскрывает именно сохранённую версию. Ни formula, ни regeneration, ни stored score/order не менялись.

## Что улучшено

- Короткие подписи PL/EN/RU/UK уточняют supporting score, PLN/person и дату. Стрелки показывают направление; полный текст рядом описывает его словами, включая ties.
- Пояснение явно названо применённой сортировкой. Оно строится из URL props, связано с select через aria-describedby и сохраняет прежнее значение во время pending transition или при неотправленных/невалидных drafts. После успешного перехода соответствует новому URL.
- Invalid/unsupported sort получает нейтральное «выберите допустимую сортировку», без выдуманного default explanation. API по-прежнему отвечает422. Hero не получил дополнительных controls.
- Сохранены применение всех введённых полей при смене sort, удаление offset, disable/pending/invalid focus, Back/Forward/reload, Reset retaining sort, локализованный returnTo и noindex/canonical policies. Все API keys и URL values прежние.

Предлагаемые roadmap варианты оценены до добавления. Единого нормализованного проверенного elapsed journey duration для всей SQL-выборки нет: `nights` — проживание, `trip_duration_days` — интервал дат, source legs/arrival могут отсутствовать или быть estimated. `destination_interval_minutes` включает сон, трансферы и другие ограничения и не является «полезным временем на месте». Не подменяем missing нулём, не ранжируем только текущие12 карточек и не выдаём эти поля за новые параметры. Новые unsupported варианты не добавлены. Это осознанный выбор доступных критериев, а не незавершённая client-side сортировка.

## Проверки

- [API](catalog.xml), [вывод](catalog.txt):14 passed,2 прежних TestClient/anyio deprecation warnings,1.14s. Девять новых parameter cases: ties на4 records с nights=None/0/3 и отсутствующим/известным depart_at, pagination limit1/full list/envelope/repeat; unsupported duration/usable_time/historical_comparison422 в двух response modes. Прежний тест проверяет все3 независимых comparator tuples на17 eligible records, full filtered pagination/count, hidden/expired rules и422. Test data только в isolated SQLite.
- [Node unit](unit.txt):158 passed,2 новых cases для applied URL explanation/aria-describedby на4 языках, honest invalid state и отсутствия sorter в hero. Existing translation/form/preset/returnTo checks сохранены.
- [ESLint](lint.txt), [build](build.txt):passed, TypeScript и61 static/SSG pages. [Ruff](ruff.txt) изменённого backend test passed. Python через PyCharm SDK, без installs; pytest9 из ранее подготовленного .cache/sec01-updated. Production Python/SQL/schema не менялись, PostgreSQL/full backend/mypy не запускались.
- [Browser](e2e.json):26/26 passed, unexpected0, errors=[], retries0,310.57s. Новые8 cases проверяют4 locales×desktop/mobile, полный API order, pagination/reload, held sort action/draft budget/applied explanation, reset offset, history, returnTo, invalid recovery, axe и320px. Existing catalog-results, manual filter workflows, localized states/SEO и actual affiliate session/sub_id journey также прошли. Full suite не запускался.
- [Source parity](source-parity.json):549 runtime-файлов изолированной копии совпали с checkout. Собственные SQLite/.next/3125/8125, real delivery/editor/sync выключены, existing E2E fixture неизменна. [Финальная сверка](verification.json): JSON/Markdown links/whitespace passed, next-env.d.ts без diff, fixture ports закрыты.

Воспроизведение: из корня `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. Перед каждой Python toolchain/fixture invocation получить SDK через PyCharm get_python_environment; для API tests задать APP_ENV=test, DATABASE_URL=sqlite://, PYTHONPATH=.cache/sec01-updated;apps/api, выключенные ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED. Выполнить `SDK -m pytest apps/api/tests/test_catalog_results.py apps/api/tests/test_catalog.py -q`, `SDK -m ruff check apps/api/tests/test_catalog_results.py`.

После окончания build подготовить новый workspace `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-deal03-new`. В его apps/web задать HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome и те же безопасные test flags. Не запускать build одновременно с browser. Выполнена следующая выборка (26 cases):

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)sorting\.spec\.ts$' '(^|/)catalog-results\.spec\.ts$' '(^|/)filter-workflow\.spec\.ts$' '(^|/)localized-catalog\.spec\.ts$' '(^|/)catalog\.spec\.ts$' --grep 'applied sorting matches|total, sorting|empty, invalid|manual|filter workflow|catalog canonical|airport to deal to partner' --reporter=json
```

Просмотрены снимки320 CSS px: [desktop](sorting-320-desktop.png), [mobile](sorting-320-mobile.png). Browser-native date controls и Dev indicator относятся к локальной среде.

## Release / откат / ограничения

Release согласованным web bundle. Backend-first deploy, миграции и пересчёт не нужны: API и SQL прежние. Откат только DEAL-03 FilterForm/sort-copy/scoped CSS и соответствующих tests; не восстанавливать весь HEAD с предыдущими задачами и пользовательскими изменениями. DB/cookie/localStorage cleanup не нужен.

Stable означает детерминированный порядок при неизменной выборке. Offset pages — отдельные свежие запросы: одновременный ingestion/expiry может изменить состав и границы страниц. Межстраничный snapshot/cursor этой задачей не вводился. Source quality warnings и freshness guards остаются отдельно; сортировка по цене не обещает достоверности недостающего расписания, а supporting score — рейтинга поездки.

Headless Chrome/mobile emulation и fixtures не подтверждают production availability, реальные устройства, usability research или полное WCAG соответствие. Предыдущие API/cold-entry observations остаются открытыми. Production/paid APIs/credentials/реальные campaigns не затрагивались. DEAL-03 DONE. Progress/Audit/Decisions/Test Plan обновлены; next-env.d.ts без diff, свои3125/8125 завершены, чужие3100/8100 не трогали. Пользовательские master plan/IDE и предыдущие задачи сохранены. TRIP-01 не начата; остановка.
