# H3-09a — контракт трёх подборок и согласованный поиск

Дата: 2026-11-04. **H3-09a DONE; H3-09 IN_PROGRESS.** Эта часть готовит общий загрузчик, preview/ошибки и корректные CTA query contracts; визуальное подключение на главной выделено в следующий отдельный запуск **H3-09b**. Главная пока показывает прежние карточки, три статические тематические ссылки и editorial destination images. Новый loader ещё не вызывается HomePage и не добавляет запросов текущей главной.

## Аудит

HomePage уже загружает до100 API rows на2–4 advertised nights, shortTripSelection применяет existing recommendation quality/origin/ROUND_TRIP gate и берёт6. HomeOrigin использует optimistic airport selection, cookie preference, URL/history и скрывает устаревшие основные offers до ответа нового origin. Статические collection links сами не выбирают предложения. DestinationCard и destination-imagery registry уже имеют3 локальных WebP, лицензии/авторов/источники,4locale alt, responsive sizes, lazy loading, native credit details и fallback. Это editorial изображения направлений, не отдельный источник inventory; новых assets/лицензий/источников не добавляли.

Нельзя просто прикрепить новые SSR cards снаружи HomeOrigin: при optimistic смене origin они могут остаться от прошлого аэропорта. Также нельзя подписывать список по отфильтрованной на клиенте странице как полный inventory. Поэтому сначала явный data contract и origin snapshot guard, затем UI09b.

## Три определения и существующий query engine

| ID | API-условия помимо selected origin | Порядок |
|---|---|---|
| calendar-weekend | round_trip=true, weekend_mode=calendar-v1 | price |
| under-300 | round_trip=true, budget=300, duration_min=2, duration_max=4 | price |
| upcoming-short | round_trip=true, duration_min=2, duration_max=4 | departure |

Weekend означает **календарный** режим H3-01, не no-leave/обещание Sunday home arrival.2–4 — существующие advertised duration filters, не новое определение usable city time или оплаченных ночёвок.300PLN — максимум flight per-person amount, не полного бюджета. Departure — существующий порядок по дате, не новый рейтинг точного времени. Новые unsupported direct/sea/sun filters, weather claims и альтернативный feed не добавлялись.

`loadHomeCollections(origin, now)` параллельно вызывает существующий validated getDeals ровно3 раза с limit100, без registry lookup/cache/другой БД. Порядок API сохраняется. Проверки preview: recommendationEligible, точное origin совпадение, ROUND_TRIP, будущий известный departure boundary, действующий offerDeadline; calendar assessment ELIGIBLE либо существующий shortTripSelection predicate; для300PLN — existing moneyInGrosz и inclusive30000грошей. Дубликаты ID/slug исключаются, максимум3 предложения в каждой коллекции. Одинаковая offers row может соответствовать разным intent collections; между коллекциями она не удаляется как будто непригодная.

## Preview state contract

READY/EMPTY/ERROR независимы для каждой коллекции: неудачный weekend cap не стирает budget/short results. Ошибка WEEKEND_QUERY_TOO_BROAD → QUERY_TOO_BROAD, остальные transport/timeout/malformed/unsupported errors → UNAVAILABLE; upstream exception message не попадает в result. ERROR не подменяется отсутствием inventory. EMPTY означает отсутствие eligible offers **в просмотренных максимум100 rows**, не доказательство, что их нет во всём каталоге. Нет поля total, more_in_preview относится только к просмотру100, не к оставшейся выдаче API. UI09b должен использовать честную подпись preview/ссылку на поиск или скрыть пустую коллекцию; нельзя писать глобальный0.

origin='' — явное «все аэропорты». Как у existing homepage preference, допускается один IATA, нормализованный normalizedOrigin; произвольная строка/metro union здесь не превращается в другой запрос. Definitions/filters создаются заново, async loads разных origin не используют общий mutable snapshot. `collectionsMatchOrigin` требует ровно3 уникальных известныхID одного выбранного origin; pending UI должен скрыть старый комплект целиком, не менять его подпись на новый аэропорт. `now` — время проверки snapshot;09b должно переиспользовать существующую expiry invalidation при дальнейшем отображении, не объявлять snapshot живой ценой.

## Найденный и исправленный query gap

API уже поддерживал round_trip, а web API client уже умел его передавать. Но search-policy не включала ключ в allowlist: ссылка на `/deals?round_trip=true` его теряла. Для достоверного CTA добавлен round_trip в search URL/read/canonical. False equivalents не создают отдельный canonical, truthy aliases нормализуются. FilterForm сохраняет hidden условие при apply, показывает active removable chip «Тип перелёта: туда и обратно», удаляет его отдельно без потери бюджета/origin и восстанавливает через browser Back. Единственная новая UI label локализована PL/EN/RU/UK; значение использует existing roundTrip messages. Checkbox/новый search engine не вводятся.

API/schema/DB/default sort остаются прежними. Existing URLs без параметра работают как прежде; URL с явным параметром теперь выполняет обещанное ограничение. consent/analytics taxonomy, saved v1/share/budget/affiliate attribution/SEO paths не менялись. Отфильтрованный round_trip=true URL остаётся noindex с собственным canonical. Новых dependencies, migrations, feature flags и внешних вызовов нет.

## Проверки

- **263 Node passed**, [лог](node.txt);11 новых cases: definitions/query URLs,1/0offers, concurrent reads, upstream order, per-person inclusive300.00/300.01, quality/expiry/origin/RT/nights, dedup, cap100, independent errors, unsupported API semantics, airport switching и canonical. Все прежние unit tests включены.
- ESLint pass, [лог](lint.txt); production build/TypeScript pass,61 static entries, [лог](build.txt). IDE build success с limited diagnostics.
- Первоначальная сборка прошла компиляцию/types/static generation, но остановилась на ENOSPC при final write, [лог](build-enospc.txt). На диске оставалось около10MB. После read-only проверки путей/размеров удалены **только generated .next** двух завершённых собственных snapshot copies H3-16/H3-08b; сначала удалены nested junctions как links без обхода targets, затем проверено отсутствие links и расположение строго внутри workspace .cache. Их source copies, docs/evidence, shared node_modules сохранены; free вырос до~420MB. Чистый повтор завершился успешно. Никакие пользовательские/production процессы или исходники не удалялись.
- Browser production regression: **18 passed**, home-collection-contract.spec.ts вызывает новый loader в Node против **настоящего локального fixture API**, проверяет READY дляWRO/EMPTY дляGDN и origin guard; ещё4locale×desktop/mobile проверяют реальные catalog CTA, сохранение/удаление round_trip, изменение бюджета, Back,320px и axe filter panel. Existing home-hierarchy проверяет прежнюю главную, SEO links,4locale/320px/axe. [JSON](browser.json), [лог](browser.txt). Это пока не visual acceptance новых коллекций/изображений; оно относится к09b.
- Backend runtime не менялся: API suite/Ruff/mypy не повторялись;1092/18 PostgreSQL skipped и mypy122 — historical08a evidence, не новый прогон. WebKit/CWV/полный сайт/production не проверялись; существующий first-price baseline issue H3-17b не изменялся.

Команды из apps/web: npm run test:unit/npm run lint. Copy `.cache/aud05-h3-09a-20261104`,3125/8125, SQLite, SDK Python3.12.10 после python-tools preflight, Chrome. prepare-e2e.ps1 +явная копия airport-city JSON и обоих untracked Python fixture modules. В копии npm run build с loopback API/site и fixture operator.json, затем config npm start; `npm run test:e2e -- home-collection-contract.spec.ts home-hierarchy.spec.ts --reporter=json`, HOPTRIP_TEST_PYTHON SDK, PLAYWRIGHT_CHANNEL=chrome, PLAYWRIGHT_JSON_OUTPUT_NAME docs/h3-09a/browser.json. Existing servers не останавливались/не переиспользовались.

## Следующий шаг и rollback

**H3-09b** должна подключить3 definitions к HomePage/HomeOrigin, отобразить4locale intent title/criteria и состояния независимо, скрыть old-origin snapshots при optimistic change, дать localized query CTAs. Переиспользовать licensed image registry/credit/lazy/fallback и общие offer components/essential warnings. Не выводить static editorial image как подтверждение наличия, не добавлять city/route без eligible offer, не обещать глобальные counts. Проверить actual airport switch/race/URL history, failure/empty/one offer,missing image/loading/credit, SSR links, keyboard/axe/320px и отсутствие нового LCP риска. До этого overall09 не DONE.

Rollback09a: удалить home-collections helper и новые unit/browser tests, вернуть только round_trip delta в search-policy/FilterForm/filter-copy, сохранив все предыдущие H3 mode/sort/labels. Миграция/DB rollback не нужны. Полные общие файлы не сбрасывать. Deployment/PR/commit/реальные партнёрские переходы/уведомления не выполнялись. Остановиться перед09b.
