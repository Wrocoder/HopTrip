# H3-15 — полезные страницы направлений при малом числе наблюдений

**Поправка H3-17b1, 2026-11-05:** исходные browser-прогоны этого отчёта использовали `next dev`, а не `next start`; прежняя пометка production-browser была ошибочной. Числа остаются валидными development functional evidence, успешный production build — отдельной проверкой. [Аудит режима](../h3-17b1/runtime-mode-audit.json). В новом [настоящем production-прогоне H3-17b1](../h3-17b1/browser-production.json) дополнительно прошли 16 новых feature cases этой задачи; это не перепроверка всего прежнего suite.


2026-11-05. Только H3-15. PR/commit/deploy не создавались. H3-14/17/18 не реализуются в этом запуске.

## Что уже было и что подтверждено

Гипотеза «пустая страница содержит только нет рейсов» **PARTIAL**: прежняя страница уже показывала city-specific guide summaries, airport/season planning, ссылки поиска и честное объяснение отсутствия наблюдений. [Read-only development baseline10/10](browser-baseline.json) подтверждает это на4locale и без JavaScript, а также прежние error/index states. Отсутствие offer-backed альтернатив других направлений **CONFIRMED**.

Добавлен один блок восстановления на существующей странице, когда её выборка содержит0 или1 наблюдение. При2+ основная страница остаётся прежней без дополнительных recovery-запросов. Новых посадочных страниц или SEO-клонов нет.

## Инвентаризация и решение об индексации

Search Console connector и локальный GSC export отсутствуют. Impressions/clicks оставлены **null**, трафик и production flight coverage не выводятся из fixture data. [Desktop inventory](destination-inventory-desktop.json), [mobile inventory](destination-inventory-mobile.json) и [индивидуальные решения](index-decisions.json) фиксируют текущий **synthetic local catalogue**, тексты/путеводители, canonical/robots и число наблюдений. `characters` — объём DOM text, включая cards/disclosures; это не измерение уникальности, видимой плотности или SEO-качества.

| Страница в локальном fixture | Наблюдения | City guides | Решение |
|---|---:|---:|---|
| Milan,4locale | 0 в normal;0/1/3 в отдельных сценариях | 2 | Сохранить index: reviewed landing, уникальные summaries и planning/season source. Нулевая цена не повод убирать страницу |
| Rome,PL | 0 | 2 | Сохранить прежний noindex: нет reviewed permanent landing entry. Полезные airport/stay guides доступны; новое решение не основано на отсутствии цены |
| Barcelona,PL | 14 в normal | 2 | Сохранить прежний noindex по тому же registry. Наличие14 наблюдений само по себе не открывает индексацию |

Индексируемость по-прежнему задаёт прежний reviewed `catalogPages`, независимо от offers. Canonical/hreflang/locale wrappers/sitemap/structured-data source не менялись. Промоутить остальные города без отдельной editorial/GSC проверки оснований нет; массовый noindex не применялся.

## Выбор альтернатив и полезные действия

Прежний API `getDeals({round_trip:true,sort:price,limit:100})` даёт bounded выборку доступного каталога; нового endpoint/provider/feed нет. Используются только active registry cities с совпадающими slug+ID, кроме исходного города, recommendationEligible round trips, известной ценой, будущим вылетом и неистёкшим offerDeadline. Старый API без quality evidence не становится источником рекомендаций. До3 разных городов; сначала та же подтверждённая страна, затем integer-grosz цена/date/ID. Повторы city/ID/slug отсекаются, входные данные не мутируются. Это preview выборки, не полный рынок и не live booking availability.

Блок повторно использует прежний DealGrid и его source/date/flight-only/baggage/timeline warnings. Смена источника или цен не переписывает бюджет/планы. Все строки PL/EN/RU/UK. Нативные ссылки ведут в реальную detail page выбранного наблюдения, поиск исходного города без навязанных дат/бюджета и существующий directory. Guides и season/airport planning сохранены.

Геоданных для честного ранжирования ближайших origin airports здесь нет. UI предлагает сравнить даты и доступные для пользователя аэропорты в существующем поиске, с учётом стоимости/времени доезда; расстояния и «ближайшие» порты не выдумываются. Прежний поиск нескольких аэропортов, включая Warsaw WAW/WMI, сохранён. Ссылка opt-in alerts появляется только при `enabled && delivery_enabled===true`; flags не включаются, автоматической регистрации или consent change нет.

## Ошибки, SSR и совместимость

Ошибка optional selection не ломает primary city content/search и не выдаётся за пустой каталог; есть отдельное сообщение и refresh. EMPTY/ERROR/expired различимы. Ошибка alerts status скрывает только opt-in link, не реальные альтернативы. При истечении earliest deadline в открытой подборке весь snapshot скрывает альтернативные цены до refresh — прежний useOfferExpired, без нового расчёта freshness. Страницы/API failure и unknown city сохраняют прежние error/404/noindex rules.

Links/cards рендерятся сервером и работают без JavaScript. JS нужен для refresh button и инвалидации уже открытого snapshot; SSR выборка проверяет deadline на сервере. Primary query/React request cache/metadata policy прежние; optional recovery не участвует в вычислении indexability. API schemas/DB/production Python, dependencies, affiliate/consent/analytics, saved v2/portable v1, calculator/provenance/profiles и публичные URLs не менялись.

## Проверки

- [314/314 Node](node.txt),5 новых cases: bounded selection/real active registry/unknown price/expiry/quality/dedup/country-price priority, optional source errors и strict alerts flags. Первый313/314 сохранён отдельно, guard исправлен.
- [13/13 fixture/SEO API checks](api-fixtures.txt)/[JUnit](api-fixtures.xml): guard lifecycle и прежние SEO/date/origin contracts. [Ruff](ruff.txt) нового fixture module PASS. Full API suite/mypy не повторялись — production Python/DB/contracts неизменны;2 прежних Starlette/httpx warnings сохранены.
- [36/36 development browser](browser.json) с первого запуска:16new+20regression, без retries/skips/flaky/fail.4locale0/1/many, real observation→detail, country priority/dedup, source EMPTY/ERROR/stale/retry, alert opt-in, open-snapshot expiry, no-consent analytics, axe/320px, no-JS search/detail/directory, inventory. Прежние destination/catalog/technical SEO tests проходят.
- Полный crawl **248 sitemap pages +54 editorial links на каждом viewport**: [desktop](sitemap-audit-desktop.json), [mobile](sitemap-audit-mobile.json). HTTP200, уникальные title/description, canonical/hreflang/robots/SSR headings, robots.txt и unavailable-page rules сохранены.
- [Build](build.txt), [ESLint](lint.txt), [TypeScript](types.txt) PASS; IDE build success с limited diagnostics, поэтому compiler evidence — CLI build/types. Diff whitespace check PASS. [Parity](source-parity.json):4web runtime/7test-fixture sources совпадают с copy (только fixture ports нормализованы),28 прежних core/SEO/API/dependency modules byte-identical, production API runtime без изменений. [Итог](verification.json).
- Первые320px screenshots после axe оставили focus на skip link: [desktop](axe-focus-desktop.png)/[mobile](axe-focus-mobile.png) сохранены. Focus переведён на нативную search link нового блока; [targeted2/2](browser-focus-recheck.json) на той же runtime-сборке и финальные [desktop](destination-recovery-320-desktop.png)/[mobile](destination-recovery-320-mobile.png) просмотрены. Initial anchored grep не выбрал tests; [журнал](browser-focus-no-match.txt) сохранён и не учитывается как успешный case.

На снимках виден прежний badge N: он присутствует и на [baseline13](baseline-planning-desktop.png), и на15 fixture. В H3-17b1 выяснено: это dev-стенд; badge отсутствует в проверенных production-страницах. Приложение ради screenshots не менялось. Проверка320px не объявляется устранением всех прежних layout/performance проблем.

Первый Node run313/314 обнаружил guard defect: `moneyInGrosz` может вернуть undefined, а проверка исключала только null. Исправлено на nullish check; [первый failure сохранён](node-initial.txt). Строгий API boundary и раньше отсекает malformed price, но отдельная selection функция теперь тоже сохраняет unknown semantics.

Runtime `.cache/aud05-h3-15-20261105`, next dev (Next16.4.3)/Chrome desktop+mobile, loopback3125/8125 и synthetic SQLite. Build/start env согласованы: public/server API8125, site3125. Python3.12.10 из PyCharm SDK. Test-only guarded app получил destination HTTP scenarios и synthetic observations; они не являются production рекомендациями. Дополнительно copied прежние airport registry,2 browser fixtures и synthetic operator JSON. Реальные продавцы, провайдеры, уведомления, платные API/аккаунты и production не вызывались.

На старте было257MiB свободного места. После baseline и проверки fixture ports удалена только собственная generated.next13(298.71MiB); перед новой сборкой — completed generated.next03(108.48MiB). Exact absolute paths/ancestors/reparse points проверены;2junctions удалены как links без обхода target. [Записи](cache-cleanup.json). Исходники, shared dependencies, H3 evidence, прежние пользовательские изменения/удаления сохранены; чужие процессы не останавливались.

## Rollback и следующий запуск

Без flag/migration: вернуть только4web runtime delta, оставив остальные H3 изменения. Test-only fixture hook/module можно удалить отдельно. Saved/shared data не мигрировались. API/dependencies/SEO policy и sitemap прежние, поэтому rollback store/URL или search indexing migration не требуется.

Known CLS0.137–0.292, first-price1004.14>900, RU/UK desktop CTA920.140625>900 и причина transient11a cross-tab остаются17b; весь сайт не объявляется green. GSC/production coverage/CWV, WebKit/real devices/manual screen reader и PostgreSQL здесь не проверены. Следующая отдельная незаблокированная часть — **H3-17b**; H3-14 зависит от внешних delivery/staging условий. Здесь остановка до следующей задачи.
