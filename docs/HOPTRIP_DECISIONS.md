# HopTrip — решения мастер-плана

## UI-02-IMAGES-01 — Commons с пофайловой атрибуцией

Дата:2026-11-02. По запросу владельца выбраны 31 CC BY/BY-SA фотографии с Commons,
вместо копирования найденных в Pinterest изображений. Публичные автор/лицензия,
название/источник/дополнительное attribution и пометка обработки обязательны;
ShareAlike сохраняется для адаптированной фотографии, сайт целиком не перелицензируется.
Явный mapping только редакционных маршрутов, изображения локальные, подбор не
делается по пользовательскому query. 1200×750 WebP, <=360kB каждый, next/image,
reserved ratio, lazy inline и читаемый fallback. Историческая иллюстрация не
обещает актуальные условия/наличие. [Реестр/проверки/риски/откат](article-imagery/README.md).
Новых API/DB/dependencies/affiliate/consent изменений нет; персональная доставка выключена.

## DATA-01-01 — Deadline принадлежит наблюдению цены

Дата: 2026-10-30. Статус: принято в checkout; production deployment не выполнялся.

**Причина.** TravelOffer — изменяемая текущая запись. После A → B → A она уже не хранит ранний expiry цены A. При точном cached refresh исчезновение expires_at у источника могло продлить прежний deadline A, сохранив её старый first-seen timestamp.

**Решение.** Nullable PriceObservation.expires_at хранит самый ранний известный effective deadline конкретного observation_key: policy lifetime, source expiry и уже сохранённые ограничения. Повторная доставка может только сократить этот deadline. Блокировки offer/observation сохраняют правило при конкурирующих writes. Защита exact-trip snapshot от broad-feed overwrite сохраняет цену/ticket URL, но принимает более ранний expiry той же observation_key; expiry другой цены к нему не применяется.

**Legacy.** Миграция 0019 добавляет поле без массового backfill. NULL означает отсутствие сохранённого deadline. Если legacy-наблюдение всё ещё является текущим, его известный TravelOffer.expires_at сохраняется при следующей доставке. Если оно возвращается после другой цены и старый deadline утрачен, применяем conservative effective deadline не позднее observed_at: запись остаётся историей и не становится fresh/bookable. Новое source observation с отдельным ключом может установить новый lifetime. Утраченный source expiry не выдумывается.

**Последствия.** Исторические цены/время наблюдения сохраняются, statistics grouping/formula не меняются. Новое приложение требует upgrade до 0019 перед запуском; старое приложение совместимо с добавленной nullable column. Для rollback предпочтительно откатить приложение, оставив column/data; downgrade удалит deadline metadata и вернёт уязвимую логику старой версии. Подробные границы и доказательства — [DATA-01](data01/README.md). Это решение не вводит live inventory verification или новый SLA источника.

## DATA-02-01 — Проверенный кэш и честная область сравнения

Дата: 2026-10-30. Статус: принято в checkout; production не пересчитывался.

**Область выборки.** Сохраняем исторический ключ provider + origin airport + destination + product type + departure year/month + return-departure date interval, по записанным UTC-датам. NULL duration означает one-way, 0 — отдельную группу поездки с возвратом в тот же UTC-день. Это выборка направления, не идентичных тарифов; текущая цена и повторные наблюдения одного рейса могут входить в неё. Местные даты/ночёвки, конкретные destination/return airports, baggage/carrier/stops не реконструируются из старой истории и не объявляются равными. Новые timestamps на входе ingestion приводятся к UTC; source payload остаётся исходным. Полная методология и карточки используют общий текст на четырёх языках.

**Eligibility и cache trust.** Только конечные положительные PLN observations с заданным route, допустимым duration и observed_at не позднее расчёта входят в выборку. Истёкшая цена остаётся пригодной для истории. Неподходящие observations не удаляются; пустой derived cohort получает count/confidence=0. Nullable RouteStatistics.methodology_version добавлена миграцией 0020; только реальный пересчёт присваивает route-utc-v1. Старый NULL cache и cache из будущего не становятся baseline от вызова generation.

**Score.** flight-v4 сохраняет веса/формулу 60/25/15, пороги 5/30 и 48-hour freshness decay. Версия отделяет проверенную методологию от прежних snapshots. При малой выборке нет percentage/discount claim. CURRENT explanation проверяется воспроизведением snapshot в сохранённый calculated_at, включая цену/медиану/parts/сумму. Старые flight-v3 snapshots до regeneration не объясняются как текущая проверенная методика; v2 остаётся явно LEGACY. Неподтверждённый discount в API равен NULL. Это не гарантированная экономия или независимая репрезентативная выборка.

**Release.** 0020 → штатный пересчёт route statistics → generation свежих deals → запуск/проверка нового приложения. Никакого выдуманного UTC-to-local backfill или изменения исторических prices/observed_at. При rollback приложения оставлять additive column; подробности, ограничения и tests — [DATA-02](data02/README.md).

## DEAL-04-01 — Полнота маршрута отдельно от availability и score

Дата: 2026-10-30. Статус: принято в checkout; deployment не выполнялся.

**Решение.** Централизованный read-only classifier присваивает COMPLETE/PARTIAL/CRITICAL_INCOMPLETE на основании существующих FlightFacts/validated_segments и canonical route context. Additive API `flight_quality` версионирован; quality eligibility вычисляется из категории. Нет DB quality column/backfill, удаления истории, исправления raw payload или переоценки historical score при чтении. Прежние freshness/affiliate gates сохраняются независимо от качества расписания.

**Публичная политика.** PARTIAL показывается с локализованным предупреждением. Critical сохраняется в стандартном каталоге/detail и проходит прежнюю redirect policy, но исключается из автоматических home/guide selections; API featured=false, DB flag прежний. Старый/неизвестный quality contract не допускает automatic recommendation. Эти gates не переопределяют email/editorial workflows и не гарантируют live inventory. Подборки ограничены первыми 100 найденными records.

**Доказательства и ограничения.** Return airports задаются явно, допустимый open-jaw не приравнивается к ошибке. Подтверждённые structured legs могут заполнить отсутствующее дублирующее REST поле без изменения source. Unknown source/конфликт/недопустимые даты критичны; estimates и неизвестные noncritical facts частичны. COMPLETE относится к текущему проверяемому route/timing profile, не тарифу/багажу/полной IATA registry verification. Backend-first release, согласованный rollback только этой задачи, полная политика/tests — [DEAL-04](deal04/README.md).

## UX-01-01 — Общая форма и явный контекст возврата

Дата: 2026-10-30. Статус: принято в checkout; deployment не выполнялся.

**Hero.** Переиспользуем FilterForm и прежние API departure bounds, а не вводим второй search widget или отдельную flex-date модель. Даты видимы сразу, пустой destination имеет явный Anywhere option, бюджет необязателен, длина пребывания раскрывается дополнительно. В hero одна submit-кнопка; catalog presets продолжают работать в каталоге. На коротком mobile viewport допустима вертикальная прокрутка формы при сохранении размеров controls; initial-above-fold для всех полей и CTA не обещается.

**Навигация.** Фильтрованный каталог передаёт encoded returnTo только с search keys. Детали повторно ограничивают target `/deals` и allowlisted query, current locale накладывается отдельно. Context переживает reload без нового browser storage и не попадает в canonical. Специализированный landing возвращается в общий каталог с теми же условиями. Seller/shared-trip links не получают search context.

**Предпочтение.** Cookie origin сохраняется в прежнем формате/сроке; searchWithOrigin проверяет route по catalog registry и выполняет save+redirect в одной server action. Redirect не перехватывается client catch; вызов проходит через React transition. Сбой optional preference не блокирует сам поиск. Client form не перемонтируется только из-за cookie write. Это исправление search navigation, а не унификация всех airport selectors UX-02.

**Release.** Целая web-сборка с согласованными client/server actions; API/DB upgrade не требуется этой задачей. Rollback только UX-01, сохраняя прежние SEC/DATA/DEAL изменения. [Политика, evidence и ограничения](ux01/README.md).

## UX-02-01 — URL как выбранный origin и один home control

Дата: 2026-10-31. Статус: принято в checkout; deployment не выполнялся.

Главная использует один AirportSelect общей FilterForm; ссылка-кнопка подборки фокусирует его. URL имеет приоритет над cookie, включая явный пустой origin. Cookie остаётся optional fallback на новом входе, прежнего формата/срока. Невалидный/неоднозначный ввод — локальный draft до успешного выбора/валидации; прочие поля не сбрасываются при origin changes.

Cookie action завершается до router.push: иначе её RSC snapshot способен вернуть старые links при уже обновлённом URL. useOptimistic показывает committed выбор во время операции; только последний выбор запускает навигацию. Серверный DealGrid передаётся children, с прежними price/score/quality widgets. Snapshot с другим origin скрыт до загрузки; Back при необходимости refresh. Исходный fallback материализуется в history перед первой сменой, чтобы Back к пустому выбору не восстанавливал новую cookie.

Catalog URL и alert subscription criteria сохраняют собственный смысл: bare catalog — все аэропорты, alert — параметры конкретной подписки. Cookie не вводится в root layout. Без новых зависимостей, storage, API или миграций. Согласованный web release и rollback только UX-02: [отчёт](ux02/README.md).

## UX-03-01 — одна подборка и отдельные нижние разделы

Дата: 2026-10-31. Принято в checkout, deployment не выполнялся. После hero и существующей подборки 2–4 ночи размещены коллекции, направления, планирование, три шага работы и справочные ссылки. Дополнительные похожие flight grids не создаются. Airport directory остаётся SSR в native details. Направления не ранжируются по неподтверждённой популярности. Прежние SEO routes и locale fallbacks сохранены.

Нижние разделы серверные, используют уже загруженный registry и Link prefetch=false; новых запросов, клиентских библиотек и изображений нет. Дубли нижних пояснений сокращены, card warnings и shared widgets не менялись. [Обоснование, проверки и rollback](ux03/README.md).

## UX-04-01 — primary journeys и отдельная справка

Дата: 2026-10-31. Принято в checkout, без deployment. Primary navigation ведёт в общий каталог, weekend collection, существующий home directions anchor, saved и budget calculator. Последний сохраняет точное название: отдельного общего planner entry flow нет, /trip остаётся маршрутом конкретного плана. Нового directions index не создаём. /info перенесён в footer; все legal/secondary links сохранены.

Пять ссылок видимы, без nested menus, с wrapping/44px targets. Locale paths прежние. Active policy отделяет exact page от location; направления учитывают hashchange/popstate через native anchor/useSyncExternalStore и пустой server hash snapshot. Информационные страницы не выделяют несвязанный primary раздел. [Evidence и rollback](ux04/README.md).

## DEAL-01-01 — общий card и progressive disclosure

Дата:2026-10-31, checkout, без deployment. Сохранён единый DealCard/DealGrid для home/catalog/landings/guides. PriceSummary виден во всех языках; CTA текстом рядом с ценой, прежние detail/returnTo/score/Impression сохранены. Краткий card schedule показывает route/stops и material timing/airport warnings, полные часы/перевозчики/методология — в details/detail. PARTIAL label остаётся видимым, reasons в общих details; critical reasons все видны без раскрытия. Нет clipping для критических состояний.

PLN contract, optional approximate EUR и quality/freshness/history policies не меняются. Critical не скрывается из каталога, expiry не становится обещанием брони. Scoped CSS исключает editorial cards. [Решение, тесты и rollback](deal01/README.md).

## DEAL-02-01 — applied search, draft presets и navigation handoff

Дата:2026-10-31, checkout, без deployment. В каталоге default-open date/night fields, правила preset/sort рядом с controls, applied chips/count/empty и reset-sort semantics явны. Presets используют общий ownership registry, reflect current draft values и синхронизируют owned inputs при same-selection redirect; unrelated manual fields не заменяются. Неподдерживаемые API direct/stops/time filters не имитируются на текущей странице.

Full validated search отменяет токен более раннего origin-only push и подавляет home refresh: навигацией владеет атомарный searchWithOrigin. Invalid search не отменяет выбранный origin. Controlled delayed-response before0/2 и acceptance22/22 документируют закрытый UX-03-F01 scenario, не общую API reliability. Query/cookie/landing/sort policies сохранены. [Evidence и rollback](deal02/README.md).

## DEAL-05-01 — recovery сохраняет намерение поиска

Дата:2026-10-31, checkout, без deployment. OfferState объединяет loading/empty/error/unavailable presentation и actions. Empty recovery показывает первые3 активные группы budget/date/destination/weekend/stay/origin; выбранное действие снимает только свою группу и offset, сохраняет sort/остальные критерии. Нет promises matching offers; budget/date bounds можно снять без выдуманного значения. Existing Reset All/cookie/landing policies не меняются.

Detail fetch outcome разделён между metadata/body только в рамках request через React.cache. API failure даёт noindex без цены, обычный retry anchor и validated returnTo;404 остаётся notFound вне catch. Новые recovery Links без prefetch. Initial catalog Suspense сохранён; глобальный loading.tsx отклонён после проверки200 вместо404. Expiry и blocked program продолжают запрещать seller link, добавлен каталог. [Evidence, release/rollback](deal05/README.md).

## DEAL-06-01 — точное сравнение без неподтверждённых категорий выгодности

Дата:2026-10-31, checkout, без deployment. По read-only public snapshot100/221 offers:77 CURRENT,23 PROVISIONAL; n для CURRENT5–107, median15. Это ранжированные опубликованные offers, не route observation distributions. Quartiles signed differences между offers не дают оснований назвать отдельную цену «значительно ниже» или определить statistically near диапазон. Новые thresholds не вводим; сохраняем точный signed PLN difference и существующее <1PLN display precision, minimum5 current consistent observations. Это решение по оценённому варианту шкалы, не новая формула.

Число наблюдений и sample/fare/market limits видимы. Numeric score убран из accessible entry и collapsed calculation heading; точный сохранённый breakdown остаётся внутри. Shared localized modal теперь одинаков на4 языках, native href/modifier navigation/returnTo и focus preserved. Score/statistics/SQL/SEO/affiliate policies неизменны. [Public aggregates, проверки и rollback](deal06/README.md).

## DEAL-03-01 — сортировка называет фактический критерий

Дата:2026-10-31, checkout, без deployment. Сохраняем существующие SQL orders до pagination: score DESC/date ASC/id ASC; price-per-person PLN ASC/date ASC/id ASC; date ASC/price ASC/id ASC. Price/date/score обязательны, missing clock/nights не получают zero или скрытый бонус. Устойчивость относится к неизменной выборке; offset requests не являются общей транзакцией во время ingestion/expiry.

UI кратко называет критерий, а связанный aria-describedby текст описывает применённый URL order, direction и ties; drafts/pending не переименовывают applied rule раньше успешного перехода. Score — сохранённый составной показатель разных возможных версий, не отдельная разница с median и не quality ranking; link ведёт к прежней методологии. Full journey duration/usable time не добавляем без единого проверенного показателя для всей выборки. nights, date interval, estimated legs и destination elapsed interval не подменяют их. Никакой client-side сортировки текущей страницы. [Проверки, ограничения, rollback](deal03/README.md).

## TRIP-01-01 — flight decision, затем planning

Дата:2026-10-31, checkout, без deployment. Detail использует прежние widgets в одном TripDraftProvider: flight price/freshness/brief comparison, schedule/source warnings, partner, accommodation, activities/events/guides, budget/save-share, затем methodology. Booking и methodology получили native focusable anchors; attractions/events links условны. Shared-plan defaults не получают отсутствующие anchors.

Полный PriceAssessment исключён только из detail TripDetails через optional includePrice=false: timestamp/availability не повторяются перед booking, full explanation остаётся в #score, видимые PriceSummary/PriceFreshness сохранены. Card default unchanged. Все critical quality reasons на detail раскрыты постоянно; PARTIAL/card/shared policies прежние. Light panel/compact spacing не обрезают warnings и сохраняют44px navigation targets. Outbound gates/tracking, provider/storage/serialization, stay/budget/events calculations, API/score/metadata unchanged. [Evidence, ограничения и rollback](trip01/README.md).

## TRIP-02-01 — местные даты как явный выбор путешественника

Дата:2026-10-31, checkout, без deployment. Сохраняем исходный общий draft и affiliate contract Stay22. Ночные/местные arrival и return-departure dates показываются отдельно с optional apply action; не переопределяют автоматически manual/restored/shared plan. Ранний прилёт не определяет, с какой ночи нужна комната, поэтому автоматической миграции defaults нет. Применение использует прежний changeStayDate: сохраняет суммы/people/adultsOnly/events/context, обновляет nights/days/review.

Calendar helper требует aware instant и известную зону своего аэропорта; unknown zone не заменяется UTC, return zone независима. Critical/legacy source quality не получает подсказку. Estimated arrival помечен. One-way checkout не выдумывается; перенос same-day не добавляет ночь, Stay22 guard прежний. Selected context виден при неполном вводе, неподтверждённые adults явно invalid; manual budget amounts не объявляются provider quote. [Evidence, ограничения и rollback](trip02/README.md).

## TRIP-03-01 — два представления одного расчёта и additive v1 costs

Дата: 2026-10-31, checkout, без deployment. Быстрый и подробный режимы используют один input/draft и прежний integer-grosz calculateBudget. Видимость не исключает расходы/events из итога. Неизвестные категории остаются unknown, ошибки скрытых полей блокируют итог и получают раскрытие с фокусом. Selected events видны в обоих режимах для сохранения редактирования и anchor navigation; без новой логики TRIP-04.

Налоги/сборы и аварийный резерв — отдельные group totals только для ещё не учтённых сумм. Прежний other и ранее записанный резерв не перераспределяются. Только отсутствие новых taxes/buffer допускается v1 reader и становится пустой строкой; null/wrong types и отсутствие исходных обязательных полей отклоняются. Storage keys/version/share allowlist/size limits сохранены. Старые raw shared/saved tokens читаются новой версией, но старый writer не понимает новые категории: rollback должен сохранить additive reader/calculation до завершения перехода. [Обоснование, проверки и ограничения](trip03/README.md).

Нет подтверждённых оплаченных сумм в контракте. UI различает наблюдавшуюся цену оферты, вручную внесённые оценки/цены к проверке и unknown, не присваивая фактическую оплату. One-way требует самостоятельного учёта недостающих участков. Общие money/date/adults/events сохраняются при mode/navigation/reload, сам режим после новой загрузки возвращается к быстрому. API/DB/affiliate/tracking contract не меняется.

## TRIP-04-01 — context из каталога, без выдуманного inventory

Дата:2026-10-31, checkout, без deployment. Сохраняем существующие local EventService, normalization/grouping, общие stay dates и независимый search mode, pagination и selected-event draft/budget/share. OTHER добавляется в query enum/UI; CULTURE остаётся широкой категорией источника, отдельная классификация выставок не выдумывается. Отсутствие изображений решается прежней текстовой карточкой без внешних image requests; curated attractions и их source links не переписываются.

Sale status показывается как сведения источника, onsale не означает подтверждённых мест; offsale не объявляется sold out. Inactive/unknown parent или ticket option не получает purchase/add actions. Старый option без status наследует только допуск родителя; новые unsupported статусы не разрешаются. Нормализатор по-прежнему исключает unavailable/cancelled/postponed/offsale rows из provider, defensive UI не меняет эту ingestion policy. Selected saved event остаётся независимым snapshot с просьбой проверки у продавца, без изменения storage schema и TRIP-05.

Проверка exact end_at извлечена из flight-fit в общий event_end_instant без смены её условий и используется также в API eligibility до grouping/count/page/flight_fit. Валидный aware конец <= now исключает законченный multi-day; missing/naive/contradictory конец не угадывается. Отображаем event timezone/unknown, source check timestamp/unknown и ограничения inventory. API выпускать перед web, additive OTHER не удалять до завершения rollback старых/cached clients. DB migrations не нужны. [Доказательства, границы и rollback](trip04/README.md).

## TRIP-05-01 — локальные immutable snapshots и отдельные editable drafts

Дата:2026-11-01, checkout, без deployment. Сохраняем существующие v1 share tokens, hoptrip.saved-trips.v1 array,20/6000 limits и copy:token draft identity. Save создаёт отдельную версию по exact token; не заменяет все планы того же slug и не изменяет уже отправленную ссылку. Duplicate tokens убираются при read без миграции. readSavedTripsState отличает empty от corrupted/unsupported, changeSavedTrips запрещает mutation повреждённой коллекции; валидные доступные записи можно открыть без автоматического cleanup/overwrite.

useSavedTrips читает fresh collection перед каждым write, обновляется по собственному событию, storage/focus/pageshow. Сериализованный fresh read-modify-write защищает от записи устаревшего UI array, но не обещает атомарную транзакцию одновременно пишущих вкладок. Cloud/CAS/Web Locks/account не добавлены. Remove не удаляет drafts и не отзывает links; undo только последнего удаления в текущем instance, fresh collection/capacity guards сохраняются. UI state и feedback относятся к текущему snapshot, clipboard message имеет operation guard, устаревшая share link явно обозначена.

Карточка — saved snapshot, открытие по-прежнему восстанавливает local draft этой копии, если есть; различие пояснено, несохранённые правки не объявляются обновлённой карточкой. Past source flight по прежнему UTC-day правилу, не заменяется edited stay dates; no live availability claim. Нет server/storage schema migrations. При rollback UI сохранять fail-closed writer guard; старые вкладки со старым bundle остаются в старом поведении. [Проверки, ограничения и rollback](trip05/README.md).

## UI-01-01 — semantic CSS tokens поверх существующего бренда

Дата:2026-11-01, checkout, без deployment. Сохраняем green HopTrip, локальные DM Sans/Fraunces и existing native components. Suggested blue palette в плане условна existing branding; ребрендинг не требуется. Canonical design-tokens.css импортируется globals, старые имена остаются compatibility aliases. Modules используют semantic colors/control/card/focus roles; новые dependencies/обязательные component wrappers не нужны. [Спецификация](HOPTRIP_DESIGN_SYSTEM.md) задаёт правила повторного использования, feature geometry и отдельные editorial sizes остаются scoped.

Primary/secondary variants должны различаться, disabled остаётся native; pressed state не подменяет focus outline. 48px для обычных controls,44px compact target,10px control radius/16px card/24px panel. Decorative border не используется вместо выбранной control boundary. Contrast14 text≥4.5 и7 control/focus≥3 проверяется без округления; это selected-pair policy, не полная WCAG certification.

Native dialog background isolation/keyboard/Escape/return focus сохраняются. Browser UI boundary не заменяется custom trap ради test assumption: probe фиксирует document.hasFocus=false/BODY, следующий Shift+Tab возвращает dialog link. Focus на select/textarea/tabindex унифицирован; skip-link fixed top скрывает ссылку без transform/transition, прежние href/content handler сохранены. Состояния видны текстом/aria, CSS не меняет pricing/quality/availability/деньги.

Release согласованным web CSS bundle, rollback только UI-01 delta, не всего dirty checkout; сохранить TRIP-05 saved CSS и более ранние guards. Нет API/DB/storage/consent migration. [Проверки, ранние test failures, ограничения и rollback](ui01/README.md).

## UI-02-01 — ограниченная local photo allowlist для discovery

Дата:2026-11-01, без deployment. Фото только в существующем homepage directions block, максимум3 и только если city record присутствует в API. Выбор editorial, не статистика популярности или оферта. У остальных городов прежние текстовые links, без случайного placeholder photo/нового источника данных. Destination-vs-localized catalog URL guards и все SEO links сохраняются; dense flight cards/hero не утяжеляются фотографиями.

Source/title/author/license verified на страницах Commons, CC BY3.0/2.5 выбраны явно из предложенных лицензий; attribution и crop/resize notice сохраняются в native details/public credits. Три локальных960×600WebP, responsive Next Image/native lazy/reserved aspect8:5. Ошибка загрузки не удаляет название/ссылку и не вызывает внешний fallback/retry. Нет remotePatterns/нового image vendor/запросов visitors к media hosts. Descriptive alt/fallback/credits notice на4 языках.

Docker runner должен содержать public, поэтому добавлен COPY, проверенный реальным standalone smoke с image optimizer. BuildKit CA mount использует public trust roots, не отключает TLS и не попадает в image. Deployment включает code/styles/registry/assets/credits согласованно; rollback только UI-02 delta, без migrations/storage/cookie cleanup. Performance bounded responses/held-image readiness/layout проверены, field CWV/zero JS overhead не обещаются. [Источники, результаты, ограничения и rollback](ui02/README.md).

## UI-03-01 — активная подсказка видна без переноса DOM focus

Дата:2026-11-01, без deployment. Переиспользуем responsive layouts и existing native controls; baseline5 widths не показал горизонтального overflow и не доказывает clipping date picker. Перестройка всех форм не требуется. Подтверждены35px language targets и offscreen active airport option на коротком375×400 viewport.

Оба combobox используют один useActiveOption: expanded/active option прокручивается instant/nearest, aria-activedescendant и DOM focus остаются на прежнем input. CSS ограничивает list height=min(260px,40dvh) и задаёт overscroll containment/scroll padding. Не добавляем новые selection rules, keyboard bindings, таймеры или fixed scroll offsets; onBlur/submit ownership/cookie/URL policy прежние. Language links44×44, back/help disclosure≥44px в existing UI-01 role.

Viewport400 проверяет уменьшенное видимое пространство; не выдаётся за реальную OS keyboard/Safari/physical-device validation. Тест сначала раскрывает advanced fields перед hit-test, не требует доступности скрытых inputs. Release/rollback согласованным web bundle только UI-03 delta, без API/DB/storage/consent migrations. [Проверки, baseline, ограничения и rollback](ui03/README.md).

## UI-04-01 — предсказуемый removal focus и поддерживаемая ценовая семантика

Дата:2026-11-01, без deployment. Локальное planned-event removal помечается ref; после React commit focus переходит к planned-events при оставшихся элементах, иначе к calculator. Обычные cost edits/storage restore не запускают переход. Не меняем hash/history, не вводим новый undo или feedback copy в рамках UI-04.

Generic small/div не получают произвольное accessible name через unsupported aria-label. EUR пояснение сохраняется доступным текстом с visually-hidden helper, а сокращённая видимая сумма декоративно дублирует тот же смысл. Существующий tooltip/localized explanation, источник/дата/rounding/unknown-rate policy прежние. PriceAssessment — именуемая group, без нового landmark/disclosure или числовой интерпретации. Caption CSS ограничен direct children, чтобы не менять inline EUR presentation.

Axe violations иincomplete оцениваются отдельно. Decorative symbols/SVG background/gradients/overlap требуют разбора, ане exclusions ради зелёного результата. Selected computed contrast проверяется без округления; parser поддерживает minified short hex иsanity anchors. Target24pxAA/исключения не подменяются blanket44px standard. Node/server markup/accessibility-tree/keyboard/visual checks продвигают к WCAG2.2AA, но не являются полной сертификацией или проверкой реального screen-reader speech. Согласованный web rollback только UI-04 delta, без DB/storage/consent migrations. [Отчёт иevidence](ui04/README.md).

## UI-05-01 — feedback принадлежит действию и версии плана

Дата:2026-11-01, checkout, без deployment. Используем существующие inline/live regions, native disabled и прежние copy/save/remove/filter/error статусы. Общий toast framework, новые таймеры или анимации не вводим. Сохраняем reduced-motion policy и PL/EN/RU/UK.

Share публикует pending text сразу, блокирует свою кнопку только для текущего token, сохраняет доступное read-only поле ссылки. Operation counter защищает новый save/share feedback от старого completion; token ограничивает сообщения соответствующей копией. Новый pending сбрасывается guarded finally либо save. Denied/missing clipboard сохраняет прежний manual-copy fallback; по timeout успех не выдумывается.

TripDraftProvider.save получает optional internal action='reset'. Action-specific success показывается только после успешной записи; storage failure остаётся прежним warning и не объявляется сохранённой очисткой. In-memory reset, payloads/keys/version и обычные autosave callers прежние. Saved snapshots и уже отправленные links независимы и не удаляются. Согласованный web release/rollback только пяти runtime-файлов UI-05 delta, без API/DB/storage/cookie/affiliate migrations. [Проверки, исходники и ограничения](ui05/README.md).

## TECH-01-01 — общая combobox interaction, отдельные domain adapters

Дата:2026-11-01, checkout, без deployment. useCombobox централизует open/active/focus/change/close/choose, ArrowUp/Down wrap, Enter/Escape, input ARIA и существующий useActiveOption. ComboboxOptions централизует ul/li roles/IDs/hidden/selection/pointer-focus behavior. Только два фактических consumers, без async registry loader, form schema, portal или нового UI framework.

AirportSelect остаётся владельцем origin draft/dirty/locale/normalization/onSelect/optional preference и blur guard, который не запускает competing navigation при submit. DestinationSelect владеет selectedSlug/text, matching on blur и nullable Anywhere. Все callbacks остаются внутри client boundary. Native input props, IDs/labels/hints, dictionary/CSS и data contracts прежние; no business logic переносится в generic layer.

Остальные7 областей проанализированы в [inventory](tech01/README.md); уже shared компоненты и разные сущности не переписываются ради единообразия. Test registry cleanup способен менять состав airports между projects: comparator использует отдельную fresh fixture с той же исходной выборкой, не исключает assertions и не скрывает main evidence. Release/rollback согласованным web bundle только двух consumers+общего module, без API/DB/storage/cookie migrations и без отката предыдущих задач.


## TECH-02-01 — consumer guards без подмены неизвестных данных

Дата:2026-11-01, checkout, без deployment. JSON рассматривается как unknown до структурной проверки нужных полей. Additive fields принимаются, absent optional остаются absent; malformed required/render-critical data ведут в существующую unavailable/retry UI. Optional display-only checked_at может быть нечитаемой строкой: eventCheckedAt уже показывает unknown; не блокируем валидные события. Нет default fabricated prices/inventory или нового backend envelope.

Stable ApiError отделяет transport/deadline/invalid response от реального HTTP404. Catalog pagination проверяет границы/согласованность, сохраняя empty page beyond total. Landing loaders используют React.cache по route value только в request, включая failed outcome; retries получают новый request. Таймауты8/15/20s и отсутствие automatic mutation retry сохраняются. ApiUnavailable переиспользует OfferState/готовые переводы. Release/rollback согласованным web bundle, без API/DB/storage migrations. [Evidence/risks](tech02/README.md). Test control URL берётся из isolated configuration и проверяется ok после зафиксированного port incident404.


## TECH-03-01 — ранний выход вместо кеша registry

Используем исходный порядок и current registry на каждом вызове. Останавливаем обход после12 active matches; empty query не требует term normalization. Не кешируем mutable registry/locale и не меняем exact matching. Paired CPU benchmark сравнивает source snapshot и новый код в одном процессе, alternating batches; empty timings у timer floor не интерпретируются как большой реальный speedup. No-match сохраняет full scan. Release/rollback только двух функций; [evidence](tech03/README.md).

## SEO-01-01 — готовый initial catalog без JS activation

Дата:2026-11-01. Удаляем только локальный Suspense в DealsPage; async results формируют initial response. Сохраняем query-based key на DealResultsPage и existing FilterForm transition feedback. Отказ от начального loading panel намеренный: каталог доступен без JS, но ответ ждёт bounded API requests и может приходить позже. Новый глобальный loading.tsx/UA branching не вводим; streaming остальных страниц прежний.

Существующие SEO URL inventory/metadata/query/noindex/hreflang policies переиспользуем после проверки. Не добавляем рейтинги/наличие или schema ради разметки. Release/rollback только SEO-01 web delta; возвращение локального Suspense вернёт loading/JS activation зависимость. API/DB/storage migrations отсутствуют, production rollout не выполнялся. [Проверки и ограничения](seo01/README.md).

## SEO-02-01 — направления из показанной выборки, прежний airport context

Дата:2026-11-01. AirportContext — server component без fetch/state, два consumers: отдельные airports и Warszawa catalog. Airport facts из registry; destination navigation из того же окна offers, без нового route/recommendation inventory. Существующие уникальные тексты и contextual weekend/guide links сохраняются. Search links сохраняют текущий origin/filters, сбрасывают offset при новой выборке; обычный href работает без JS. Missing observations и API failure не смешиваются. Никакой новой publication/index/noindex/metadata policy.

Полный browser SEO audit теперь имеет300s общий бюджет для244 URL и editorial links после двух180s timeout stages. Functional assertions и per-page/API deadlines сохраняются; это не performance SLA. Не маскируем обнаруженные mobile API outages: root API client не меняется, sanitized instrumentation только в isolated copy удалён до final acceptance. Release/rollback только SEO-02 web delta, без migrations/storage/consent/affiliate changes и без отката SEO-01. [Evidence,scope и ограничения](seo02/README.md).

## SEO-03-01 — полезный destination без выдуманного inventory

Дата:2026-11-02. Рендерим registry facts, published guide descriptions и honest empty search recovery независимо от наличия offers при успешной загрузке registry/catalog. DestinationPlanning не делает fetch; DestinationGuides summaries opt-in только для destination route. Destination.iata_codes подписаны как коды направления, без утверждения, что каждый является отдельным аэропортом; конкретный порт проверяется по билету. Metadata/body outcome и API error/noindex/404 contracts прежние. Не выводим nearby связи из страны, не публикуем недатированные события без существующего deal/date/support context. Existing guide activity section доступен по native anchor и при0 offers.

Поддерживаем analytics/consent contract размещением affiliate UI на прежних guide pages. ActivityContext.page не расширяется на destinations ради SEO-задачи; нет новых партнёрных URLs/payloads или migrations. Seasonal statements качественные, с primary source links, без forecast/цен/event calendar. Publication/indexation не расширяются без Search Console/evidence для конкретных страниц. Новый content дополняет существующий Milan landing и city guides.

Acceptance использует собранный isolated Next production-mode bundle на3125/8125 и guarded SQLite. Это исключает dev compilation из данного прогона, но не доказывает production latency/CWV/API reliability improvement. Release обычной web сборкой с production environment, rollback только двух consumers+двух modules SEO-03 delta. [Evidence/ограничения/rollback](seo03/README.md).

## SEO-04-01 — исправление primary CTA по существующему city mapping

Дата:2026-11-02. Меняем URL literals в existing editorial data, без нового renderer/routing helper и без изменения translated text/source hashes. Primary link guide о городе сохраняет destination; явно обозначенный общий catalog alternative остаётся общим. Поэтому Rome/Lisbon с готовым city link и второй общей ссылкой не входят в final change set. Direct Vienna notice улучшает source navigation; даты полного review не меняются после выборочного source check.

Demand evidence отделён от unknown query metrics. Word count/возраст review date/общий checklist не являются сами по себе доказательством ошибки. Существующие полезные вступления и инструкции сохраняются после triage. Инвентаризационный TypeScript runner использует ES2022 для корректной обработки Set, исходный diagnostic не принимается за app defect. Release/rollback только12 URL literals в2 modules, без API/DB/storage/metadata/indexation/affiliate migrations и без отката previous tasks. [Inventory/evidence/риски](seo04/README.md).

## SEO-05-01 — стратегия по доступным свидетельствам, без выдуманных query metrics

Дата: 2026-11-02. Требование «where available» выполняется проверкой доступности GSC/Trends/Keyword Planner и использованием ограниченного публичного Google demand proxy. Отсутствие private exports/недоступный Drive/Trends tool не превращаются в нулевой спрос. Все неизвестные объёмы, позиции, CTR/CPC/difficulty остаются null; наличие competitor page не является demand indicator. [Источники и ограничения](seo05/README.md).

12 candidate phrases приоритизированы для исследования, не обязательного rewrite: C1 — исторический destination signal плюс существующая статья, C2 — прямой готовый product intent, C3 — условная гипотеза. Числового прогноза трафика/денег нет. Для всех строк выбран существующий URL; новая страница требует самостоятельного intent, отсутствия покрытия и проверенного полезного материала. Текущие filter/noindex/locale/price/event/affiliate/consent contracts сохраняются. Польские приоритеты не экстраполируются на EN/RU/UK. Это documentation-only task, без deployment/кампаний/новой аналитики; отмена только SEO-05 additions, без reset previous tasks. GROW-01 не начата.

## GROW-01-01 — повторная проверка зарезервированных рекомендаций и независимый retention

Дата:2026-11-02. Alert digest — рекомендация, поэтому использует existing flight_quality.recommendation_eligible вместе с availability/freshness. Не меняем public catalog visibility и не приравниваем completeness к booking availability. Перед SMTP повторно проверяется только набор RESERVED IDs: own reservation исключается из dedup history этого чтения, прочая история остаётся. Если хоть один лот перестал подходить, отменяется весь digest; новых лотов вместо него не подставляем. PARTIAL остаётся допустимым с unknown warnings, CRITICAL_INCOMPLETE исключён. Письмо формируется по revalidated observations. Реальный clock обновляется по ходу worker, injected now замораживает только тесты.

At-most-once attempt сохраняет existing journal semantics: RESERVED/UNCERTAIN/CANCELLED не очищаются ради retry и занимают frequency slot. Это допускает пропуск письма при гонке/аварии, зато не запускает автоматическую повторную отправку. Проверка последнего чтения не гарантирует неизменность данных во время SMTP. Lifecycle logs фиксируют только названия операций/cancel reasons без адресов/IDs/tokens/filters/provider replies.

--cleanup-only переиспользует existing7/30-day cleanup с active history retention, не зависит от включения digest и не запускает SMTP. Расписание/production cleanup/real delivery не внедряются без отдельной operational/privacy проверки. API/schema/UI/4 locales/config defaults/affiliate/consent/indexation unchanged; rollback только GROW-01 delta, journal сохраняется. [Отчёт/проверки/ограничения](grow01/README.md). GROW-02 не начата.

## GROW-02-01 — отдельный персональный бот, durable outbox и shared flight selection

Дата:2026-11-02. Новый канал управляется полностью в личном Telegram chat. Не переносим получателей/credentials operational monitor и не переключаем его getUpdates на webhook. Собственный webhook secret и separate bot config, оба flags false; public webhook только authenticates/validates/persists, не отправляет HTTP к Telegram. Управление привязано к Telegram private identity, произвольный chat_id не является параметром подписки. Flight opt-in только отдельный /confirm с version/time; requested help/preferences replies допускаются без flight opt-in и явно отличаются от digest.

Вынесен единственный общий candidate_deals: прежние email rules сохраняются. Дедупликация каналов раздельная; Telegram max_connections требует known values у обоих flights. Durable outbox сохраняет RESERVED перед network, terminal text очищается; ambiguous outcome не повторяется. Known429 допускает максимум3retry с persisted global cooldown, включая последнюю отмену;403stop. Rate/pacing и command ordering координируются PG advisory transaction lock, SQLite только isolated tests без claims о multi-process locking. Telegram может reset update_id после недели; expired receipts/previous activity window принимают свежую новую последовательность, current-order и24h message age ограничивают replay.

Migration0021 additive3tables, explicit parent flush нужен без ORM relationship и сохраняет одну транзакцию. Для rollback предпочтительны disabled worker/flags и возврат coherent consumer/helper/router delta с сохранением журналов; drop0021 не штатный production rollback. Retention cleanup отдельным --cleanup-only, без новых cron/infra changes. Live bot/schema/SMTP/vendor/privacy activation остаётся отдельным решением. [Проверки/источники/риски](grow02/README.md). Следующая eligible GROW-04, GROW-03 требует ещё ANALYTICS-01; обе не начаты.

## GROW-04-01 — фактические обещания и общий service navigation

Дата:2026-11-02. Переиспользуем существующие About/contact/privacy и service URLs, без новой landing page или сигналов доверия без доказательств. About объясняет источник cached prices/current score и последовательность выбора/планирования/проверки у продавца. Contact intro условный; server-only validated email/no-snippet/noindex/unavailable behavior сохраняется. Общий ServiceLinks извлечён из текущего ServiceInfo и подключён отдельно к PL service renderer, сохраняя PL guides, breadcrumbs и metadata.

Privacy обновляется только по фактическому notification behavior: conditional email, capability link, personal Telegram identifiers/preferences/consent/commands/delivery, отдельный /confirm и /stop, recipient/retention limitations. Operational count notice не описывает personal bot. Исходная дата notice и legal bases/rights/provider assertions прежние; отдельно помечена дата technical description. Не выдаём это за legal certification и не включаем delivery. Activation gates GROW-01/02 остаются обязательными.

Rollback: вернуть только6 runtime deltas по [changes.patch](grow04/changes.patch), согласованно оба consumers ServiceLinks; не сбрасывать dirty tree или предыдущие задачи. Backend/schema/credentials/dependencies/affiliate/contracts не меняются. [Отчёт/проверки/ограничения](grow04/README.md). GROW-04 завершена; следующая eligible ANALYTICS-01, GROW-03 зависит от неё. Ни одна не начата.

## ANALYTICS-01-01 — совместимый словарь поверх first-party pipeline

Дата:2026-11-02. Сохраняем existing11 wire names и first-party transport вместо новой библиотеки/дублирующих lower_case events. Три недостающих действия получают TRIP_REMOVE/EVENT_CLICK/ALERT_STARTED; reset выделяется optional filter.action у FILTER_USE. Optional context/новые names/saved page type additive, existing schema/JSON/event_id uniqueness/admin by_event достаточны. Old clients с FILTER_USE без action продолжают работать; историю не переписываем.

TRIP_REMOVE только после successful local write; EVENT_CLICK не изменяет ссылки/rel/partner атрибуцию; ALERT_STARTED — один explicit browser-valid submit за visit независимо от API outcome, без email/preferences/token. Explicit start разрешён на signup при analytics consent, не на capability pages. BUDGET_USE/DEAL_VIEW/ALERT_CONFIRMED сохраняют прежнюю семантику, описанную как proxy там, где название плана шире фактического сигнала. Не вводим plan/event IDs, cross-device identity или search_id ради связывания; документируем ограничения точной воронки/fast dedupe/best-effort доставки.

Existing tests ожидают START→CONFIRMED; assertions приватности сохранены. Диагностические failures не скрыты: новый тест ожидает202 перед полной навигацией. В existing city-break UI scenario подтверждены stale details/empty selector и ещё один sort navigation failure с неустановленной причиной. Временные UI-test corrections отменены; первые3 SEO cases исходные, не объявлены passed. Application behavior из-за диагностики не менялся. [Словарь/метрики/compatibility/rollback](analytics01/TAXONOMY.md), [evidence](analytics01/README.md). Для rollback сначала убрать новые web producers, затем API allowlist либо выпустить coherent bundle; данные не удалять/не переименовывать. Ни deployment/migration/real campaigns, ни GROW-03/ANALYTICS-02 не выполнялись.

## GROW-03-01 — нормализация контекста без переписывания партнёрских ссылок

Дата:2026-11-02. Existing localizedHref(...,'pl') используется только для ACTIVITY_CLICK.page и PARTNER_CLICK deal_slug. Не расширяем API path regex и не отправляем query/hash/персональные поля. Existing URL/target/rel/affiliate IDs остаются источником истины; cached flight URL не переписываем под draft dates/people. Добавлен auxclick button1 для single/variant ticket links с existing EVENT_CLICK/consent/dedupe, без новых metrics.

После двух ошибочных external popup attempts не полагаемся только на browser interception: source href проверяется, native target временно loopback; guarded e2e fixture содержит реальную capture page и optional server-only /go Location containment. Product redirect policy/journal не меняются. Тесты подтверждают local contract/intent/API202, а не живое прохождение партнёра. Нельзя заявлять отсутствие real partner traffic за всю задачу; incident описан. [Review/tests/limitations/rollback](grow03/README.md). Откатить только2 runtime handlers и при необходимости test fixtures; не сбрасывать ANALYTICS-01/прочие dirty changes. GROW-03 DONE, ANALYTICS-02 не начата.

## ANALYTICS-02-01 — закрытая read-only панель без нового tracking

Дата:2026-11-02. Dashboard размещён в existing admin analytics API (JSON+standalone HTML) с X-Admin-Token, без нового public frontend/login/token storage. Actual AnalyticsEvent source, bounded31days/20000rows; никаких придуманных baseline/доходов. Empty denominator→null, возвращаемость/device unsupported, landing entry-type proxy и ordered same-deal affiliate pairs описаны явно. Product events не смешиваются с server technical click journal/financial summary.

Raw IDs/metadata не выходят в report, page types bounded; onlySELECT без writes/commit. Script-free localized HTML с CSP/noindex/no-store, auth/privacy/input/limits tests. Отдельная release операция; rollback удаляет2routes/helper и3modules, без data/schema changes. [Tests/metrics/scope](analytics02/README.md). Все43formal tasks DONE по tracker; [дальнейшие проверки](analytics02/REMAINING.md) не являются выполненным deployment или новыми автоматически начатыми задачами.
