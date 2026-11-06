# Контракт аналитики HopTrip (HT-04)

H3-18b4, 2026-11-06: текущая [taxonomy v4](h3-18b4/taxonomy.json) добавляет `BUDGET_CALCULATED`; [проверки и ограничения](h3-18b4/README.md). Предыдущие [DEAL_DETAILS_OPEN / v3](h3-18b3/README.md), [TRIP_UPDATE / v2](h3-18b2/README.md) и baseline v1 сохранены как история.

H3-18a, 2026-11-02: [версионированная карта H3 и baseline-проверки](h3-18a/README.md), [machine-readable taxonomy](h3-18a/taxonomy.json). Имена wire events и runtime-контракт не менялись; отсутствующие события не подменяются существующими proxy. Production KPI по-прежнему не получены.

Статус: локальная реализация. Установка событий не означает наличие статистики,
покупок или подтверждённой комиссии. Все браузерные события требуют действующего
согласия на аналитику. Маркетинговое согласие отдельно и для этих событий не нужно.

Обновление 2026-10-16: добавлены события бюджета, сохранения и подтверждённой подписки; определения и приёмка — [seo-growth-plan.md](seo-growth-plan.md).

Обновление 2026-11-02 (ANALYTICS-01): текущий словарь и соответствие мастер-плану (`docs/analytics01/TAXONOMY.md`; исторический файл удалён). Добавлены TRIP_REMOVE, EVENT_CLICK, ALERT_STARTED и необязательный filter.action у FILTER_USE. Existing имена/партнёрские параметры сохранены; новый словарь уточняет семантику и ограничения, старые события без action остаются unclassified.

## События и определения

| Событие | Когда | Контекст |
| --- | --- | --- |
| PAGE_VIEW | Открытие страницы, включая принятие согласия на текущей странице | Анонимная сессия, разрешённые метки |
| DEAL_IMPRESSION | Карточка попала в область просмотра | deal_slug → серверный deal_id |
| DEAL_VIEW | Открыта страница предложения | deal_slug → deal_id |
| DEAL_DETAILS_OPEN | Раскрыт TripDetails/расчёт оценки либо успешно открыт диалог сравнения цены | deal_slug → deal_id; прежний page_type, один раз на предложение за посещение |
| SEARCH | Валидная отправка формы поиска или применение пресета | search.filters |
| SEARCH_RESULT | Отображена выдача каталога или постоянной подборки | search.filters и либо result_count, либо error |
| FILTER_USE | Применение/удаление/сброс фильтров | filter.action=apply/remove/reset для новых клиентов; legacy без action допустим. Не суммировать с SEARCH как отдельные поиски |
| PARTNER_CLICK | Активация партнёрской ссылки | partner.category, partner.provider, deal_slug при наличии |
| BUDGET_USE | Первое валидное непустое изменение поля расчёта за посещение | page_type; без сумм |
| BUDGET_CALCULATED | Открыта разбивка полного валидного пользовательского расчёта без review-флага | page_type; без slug, сумм, дат, состава бюджета или плана |
| TRIP_SAVE | Новый снимок плана успешно записан локально | page_type; без содержимого плана |
| TRIP_UPDATE | Изменённый план успешно записан явным Update в существующий ID | page_type=saved_trip; без ID/revision/token/полей плана |
| ALERT_CONFIRMED | Успешный ответ подтверждения email, при согласии аналитики | page_type=alerts; без email/token |
| ACTIVITY_CLICK | Существующая детализация кликов по достопримечательностям | city, activity_id, page без query, link_kind |
| TRIP_REMOVE | Успешное удаление сохранённого снимка из браузера | page_type=saved; без токена или содержимого плана |
| EVENT_CLICK | Активация доступной ticket link в TripEvents, включая вариант билета | Только связанный deal_slug и общий контекст; без URL/event ID/name/date/price |
| ALERT_STARTED | Явная browser-valid отправка signup-формы, один раз за посещение | page_type=alerts; без email/preferences/token; API failure тоже считается началом |

SEARCH не регистрирует заблокированный клиентской валидацией ввод. SEARCH_RESULT
также возникает при прямом открытии /deals и пагинации, поэтому его количество
не равно числу SEARCH. result_count — число предложений на показанной странице
(сейчас максимум 12), **не общее число совпадений**. Ноль — успешная пустая выдача.
Ошибки: invalid_filters (HTTP 404/422), unavailable (прочие ошибки загрузки).
При ошибке result_count отсутствует. Не отправляются исходные тексты ошибок.

Категории PARTNER_CLICK: flight / stay / activity. Провайдеры: catalog (ссылка
через существующий /go, реальный продавец определяется серверной интеграцией),
stay22, tiqets. Неизвестные типы компонента не выдаются за перелёт. Официальная
непартнёрская ссылка достопримечательности даёт только ACTIVITY_CLICK.
PARTNER_CLICK фиксирует намерение перейти, а не завершение перехода/бронирование.
ACTIVITY_CLICK и PARTNER_CLICK для одной партнёрской достопримечательности —
разные представления одного действия, их нельзя складывать.

## Поля и приватность

- event_id: случайный UUID; повтор с тем же ID сохраняется сервером один раз.
- anonymous_session_id: существующая случайная сессия, срок бездействия 30 минут.
- deal_slug: внутренний slug; API разрешает его в deal_id, неизвестный возвращает 404.
- search.filters: только origin, destination, departure_from/to, budget,
  duration_min/max, offset, weekend. Города и аэропорты передаются только из
  справочника; сервер повторно проверяет их существование. Числа/даты ограничены.
  Нераспознанный свободный ввод исключается, а не записывается как поисковый текст.
- source: homepage, google, facebook, instagram, newsletter, direct, test.
- metadata.page_type: фиксированный тип страницы из allowlist, без URL/query/hash.
- search.filters.origin также допускает единственную группу WAW,WMI.
- metadata.campaign: hoptrip-launch, wro-weekend, test. Это разрешённые обозначения,
  а не утверждение, что кампании уже запускались. Новую метку сначала добавлять
  одновременно в frontend analytics-context.ts и серверный allowlist.
- Неизвестные source/campaign отбрасываются и при чтении старой сессии.
  Произвольные metadata, email, токены, полные URL и query в payload не попадают.
  POST аналитики использует referrerPolicy=no-referrer.

Отказ/отзыв согласия прекращает отправку браузерной аналитики и очищает идентификатор
сессии. На signup /alerts разрешён явный ALERT_STARTED, а existing ALERT_CONFIRMED остаётся после успешного подтверждения. ALERT_STARTED запрещён на confirm/manage; автоматические и остальные события на alert pages исключены. Исторические записи при отзыве не удаляются.
Публичный endpoint не является доказательством браузерного согласия: он принимает
валидные запросы, а проверка согласия выполняется в клиенте. Не использовать
клиентскую аналитику как доверенный журнал финансовых операций.

## Дедупликация и доставка

Просмотры и результат с одинаковым контекстом отправляются один раз за посещение
URL; повторный React-рендер не создаёт событие. Переход на другой URL и возврат
или полная перезагрузка считаются новым посещением. У действий есть защита от
повтора за 1 секунду, поэтому очень быстрые одинаковые клики могут объединиться.
У категорий партнёров отдельные ключи. Сбой аналитики не блокирует переход.
Доставка best effort через keepalive fetch, без гарантированных повторов.

## Как считать метрики

- Поиски: число SEARCH; уникальные ищущие — distinct anonymous_session_id в SEARCH.
- Пустые выдачи: SEARCH_RESULT с result_count=0 / успешные SEARCH_RESULT.
- Ошибки выдачи: SEARCH_RESULT с error / все SEARCH_RESULT.
- Открытия предложений: DEAL_VIEW; показы карточек: DEAL_IMPRESSION.
- Намерения перейти к партнёрам: PARTNER_CLICK отдельно по category/provider.
- Сессионная конверсия просмотра в переход: сессии с DEAL_VIEW и PARTNER_CLICK
  для одного deal_id / сессии с DEAL_VIEW этого предложения за тот же период.
- Существующий admin summary возвращает новые события в by_event. Его прежний
  total_affiliate_clicks/CTR основан на AffiliateClick (серверные /go), а не на
  новом PARTNER_CLICK. Он не включает все прямые Stay22/Tiqets клики.
- Доход/бронирования берутся только из подтверждённых AffiliateConversion.

Не смешивать эти знаменатели, не считать click событие комиссией. Выборка охватывает
только согласившихся пользователей, может терять запросы из-за блокировщиков/сети;
сессия не равна человеку. Сквозного search_id пока нет: точную атрибуцию отдельного
поиска последующей покупке эти поля не обеспечивают.

## События сохранения и подтверждения — реализованы локально 2026-10-16

TRIP_SAVE отправляется только после успешной записи нового снимка поездки
в localStorage. Повторное сохранение того же снимка и ошибка записи не дают событие;
содержимое бюджета и личных заметок не передаётся.

ALERT_CONFIRMED отправляется после успешного подтверждения подписки API,
а не при открытии формы или отправке письма. Это используемое имя вместо
ранее запланированного SUBSCRIPTION_CONFIRMED. Email, confirmation token,
unsubscribe token и персональные ссылки запрещены. Маркетинговое согласие не
заменяет согласие на аналитику; отсутствие последнего не мешает самой подписке.

TRIP_SAVE и ALERT_CONFIRMED разрешены API. Вместе с BUDGET_USE они проверены
локально в SEO-цикле; публикация и получение production-событий не подтверждены.

## Локальная проверка

API: test_funnel_analytics.py, test_analytics.py, test_activity_analytics.py.
Unit: analytics-context.test.mjs — приватность, согласие, повторные рендеры,
смена URL и независимые категории партнёров.
E2E: funnel-analytics.spec.ts — поиск, пустая выдача, ошибка, открытие предложения,
три категории, отказ и отзыв согласия. Внешние переходы перехватываются локально;
реальные бронирования и партнёрские клики тест не создаёт.

ANALYTICS-01: test_product_analytics.py, product-analytics.test.mjs и product-analytics.spec.ts добавляют новые actions, bounded filter.action, consent/дедупликацию/ошибки записи/варианты билетов/failed signup. Существующие localized-alerts и seo-growth assertions учитывают намеренно добавленный START до CONFIRMED; privacy/token/negative assertions сохранены. Результаты и ограничения (`docs/analytics01/README.md`; исторический файл удалён). Это локальная реализация; production activation и поступление реальных событий не подтверждены.

## Уточнение GROW-03 — 2026-11-02

ActivityLink нормализует locale prefix только в analytics page/deal association через existing localizedHref(path,'pl'); actual affiliate/official href не меняется. ACTIVITY_CLICK по-прежнему содержит bounded /info|deals path без query/hash, PARTNER_CLICK на локализованном detail получает правильный deal_slug. EVENT_CLICK также отправляется для middle auxclick1 обеих ticket branches; right aux ignored, consent/dedupe прежние. Flight/context-menu и best-effort ограничения захвата не превращаются в гарантию полного учёта. Review/actual tests/два isolation incidents (`docs/grow03/README.md`; исторический файл удалён).

## ANALYTICS-02 — usage dashboard, 2026-11-02

Историческое основание ANALYTICS-02 — 14 событий. В H3-18b2 allowlist расширен до15 событий, включая TRIP_UPDATE; текущие17 определены в taxonomy v4. received-session население usage может расшириться. Сравнивать периоды нужно с одинаковой taxonomy и покрытием.


Protected GET /api/v1/admin/analytics/usage и /dashboard переиспользуют X-Admin-Token. Actual stored14 product event names, без server AFFILIATE_CLICK/unknown/placeholders. Default7/max31days UTC start,end), более20000rows→413 без усечения. [Все определения/знаменатели (`docs/analytics02/METRICS.md`; исторический файл удалён):ordered same-deal CTR, received result success proxy, empty≠error, distinct session usage; denominator0→null, returning/device unavailable, first-observed-page-type landing proxy. Никаких новых fields/tracking/IDs, revenue/booking metrics не переопределены. HTML4locales/script-free/noindex/CSP/no raw identifiers; POST и существующий summary прежние. Проверки/доступ/rollback (`docs/analytics02/README.md`; исторический файл удалён), что осталось (`docs/analytics02/REMAINING.md`; исторический файл удалён). Production baseline не получен.

## H3-18b2 — явное обновление постоянного плана, 2026-11-06

TRIP_UPDATE отправляется только при PlanResult.status=updated после успешного commit изменённого snapshot в существующий ID. Save/Duplicate дают прежний TRIP_SAVE, не Update; opening, reactive draft changes, Share, already/no-op, pending, conflict, absent, quota/error, Delete/Undo не дают TRIP_UPDATE. В payload нет plan ID/revision/token/budget/date/notes или привязки к другому событию. Время — server received, сессия — прежняя анонимная, page_type=saved_trip.

Проверка действующего analytics consent выполняется после ожидания Web Lock, непосредственно в прежнем track. Отказ/отзыв запрещает отправку, принятие согласия не воспроизводит прошлые записи. Сбой аналитики не отменяет успешную локальную запись. Действуют прежние best-effort/no-retry и секундная дедупликация одинаковых действий: два быстрых независимых Update могут объединиться, поскольку ID плана не отправляется. Это ограничение наблюдаемого счётчика, не достоверный журнал всех изменений.

Protected summary.by_event возвращает TRIP_UPDATE отдельно; legacy TRIP_SAVE не переопределён. Usage PRODUCT_EVENTS автоматически включает новый wire event в received events/sessions; это не returning-visitor метрика и не новая стадия search funnel. Повтор POST с одним event_id сохраняется один раз. Публичный POST по-прежнему не доказывает consent и не подтверждает реальность локальной записи. Новые клиенты требуют API с additive allowlist TRIP_UPDATE; старый API ответит422 без влияния на локальный Update. Предпочтителен rollout API перед web. Новых зависимостей, миграций, постоянных ID аналитики и внешних сервисов нет.

## H3-18b3 — открытие дополнительных сведений, 2026-11-06

Текущий allowlist —16 wire events. DEAL_DETAILS_OPEN отделён от DEAL_VIEW: нативный TripDetails на карточке/странице, успешный showModal ScoreTrigger и нативное раскрытие score-calculation в ScoreDetails. Закрытие/первичный рендер/перерисовка не создают событие. Вложенные toggle не считаются внешним раскрытием. Бюджет, события, проживание и privacy-details в этот scope не входят. Modified-click сохраняет обычную навигацию, сам по себе не создаёт modal-open event.

Событие относится к существующему классу viewEvents: один раз на deal_slug/URL visit/анонимную сессию, включая все три поверхности вместе. Повторное открытие не добавляет запись; другой slug и новое наблюдаемое посещение могут добавить. Hash не меняет visit. Нет метки поверхности/label/content/URL/query/hash/plan payload; только public slug и прежний bounded контекст. Consent проверяется прежним track при отправке; открытый до принятия согласия блок не воспроизводится ретроспективно. После отказа аналитика не отправляется; native HTML и modal остаются рабочими. No retry: заблокированное событие остаётся дедуплицированным в этом посещении.

Это наблюдаемый toggle/showModal после hydration, не доказательство чтения или прямого пользовательского намерения: программное раскрытие тоже может вызвать native toggle, ранние действия до hydration могут быть потеряны. Без JavaScript доступны прежние native details и ссылка на #score, события не отправляются. Никакой автоматической отправки при создании нового client wrapper нет; содержимое остаётся SSR children.

Protected summary.by_event.DEAL_DETAILS_OPEN переиспользован. Прежние usage detail_opening и ordered-session-funnel-v1 по-прежнему используют DEAL_VIEW, чтобы определения исторических метрик не изменились молча. PRODUCT_EVENTS включает новое имя в received events/sessions; для before/after нужны сопоставимые taxonomy/consent окна. Новая шкала disclosure→partner не добавлена в этой части. API лучше обновлять до web, откат web до сужения API allowlist; старый API вернёт422 аналитике без изменения раскрытия. DB migrations, внешние сервисы, зависимости и новые visitor IDs не требуются.

## H3-18b4 — просмотр полного пользовательского расчёта, 2026-11-06

Текущий allowlist —17 wire events. BUDGET_CALCULATED отправляется при явном открытии прежнего «Rozbicie kosztów całej grupy» после ready, если calculateBudget(input, events) valid и missing.length=0, review=false, а даты либо обе пустые (ручные nights/days), либо budgetDateCounts валидны. Это просмотр полного результата по введённым данным, не подтверждение цен, бронирования или фактических расходов. Все активные строки должны иметь явные суммы, включая0; пустое поле остаётся неизвестным, даже при0ночей. Используется только активная hotel_basis, неизвестные/некорректные цены билетов сохраняют incomplete/invalid. Диапазоны личных профилей не подменяют точные ручные строки.

Первичный render/restore/shared snapshot, реактивный subtotal, valid edit/BUDGET_USE, подтверждение review при уже открытой разбивке, исправление последнего поля при уже открытой разбивке, закрытие и grant consent не дают completion сами. Нужно закрыть и явно открыть подходящую разбивку. Собственный target защищает от вложенных toggle. Программное открытие тоже может вызвать toggle; ранние действия до hydration могут теряться. Новых UI strings/кнопок/полей или supplier defaults нет.

Прежний viewEvents dedup: один раз на URL visit/анонимную сессию, без plan/input revision, hash сам не сбрасывает. Consent/no-referrer/session expiry/revocation/best effort/no retry прежние. Блокировка аналитики не меняет totals, native disclosure или сохранение. В payload только существующие random IDs/имя/page_type/source/campaign; нет deal_slug/сумм/дат/total/profile/event contents/plan ID/revision/token/URL/query/hash. Сервер сохраняет ограниченный контекст и дедуплицирует event_id, но публичный POST не подтверждает согласие/полноту клиентского расчёта.

Protected summary.by_event.BUDGET_CALCULATED переиспользован. Usage budget_usage остаётся BUDGET_USE, search funnel не меняется. Новый event включается в received events/sessions; сравнение периодов требует одинаковой taxonomy/coverage. Completion после restore может быть без BUDGET_USE в том же окне: нельзя автоматически делить независимые счётчики как conversion rate. Дополнительные метрики/воронки — следующая отдельная часть. API перед web при будущем разрешённом rollout; старый API ответит422 только аналитике, UI продолжит работать. Миграций, зависимостей, нового visitor ID или внешнего сервиса нет.

## H3-18b5 — received-session engagement usage report, 2026-11-06

Protected usage API добавляет optional engagement={version:received-session-engagement-v1,metrics:[detail_disclosure,budget_completion,trip_update]}; определения и synthetic verification — docs/h3-18b5/metrics.json и README.md. Числители: distinct sessions с DEAL_DETAILS_OPEN/BUDGET_CALCULATED/TRIP_UPDATE, знаменатель: все прежние observed_sessions в [start,end), включая без PAGE_VIEW. Сессия один раз на показатель независимо от повторов/планов/оферт. Это доли наблюдаемых сессий с действиями, не step conversion, все люди, бронь, returning или causal uplift. Restore/update могут не иметь BUDGET_USE/TRIP_SAVE в окне; независимые counters не делятся друг на друга.

Denominator0→no_data/null; при положительном denominator отсутствие received event→available/0.00, не доказательство отсутствия использования/включённого сбора. Сопоставимы только одинаковые taxonomy/coverage периоды. Старые11metrics/page_cohorts/ordered_funnel не переопределены; legacy constructor без engagement поддержан. Dashboard4locale показывает отдельную секцию с пояснениями; empty cohort table заменена существующим no_data сообщением, API cohorts=[] сохранён. Нового сбора, metadata/IDs, consent/session/transport/DB query/migration/deps/SaaS нет; старые auth/noindex/no-store/CSP/limits/privacy прежние. JSON readers должны допускать дополнительное поле.

## H3-18b6 — first-search origin cohorts, 2026-11-06

Protected usage API получает optional origin_cohorts={version:first-search-origin-cohorts-v1,rows:[origin,sessions,percent,metrics]}. Источник — только metadata.search.filters.origin первого SEARCH/SEARCH_RESULT сессии в UTC [start,end), server created_at/DBid order. Первый missing/invalid/unsupported остаётсяunknown, later valid не backfill; no search тожеunknown. Не выводим origin из URL/PAGE_VIEW/deal/IP. OriginKey закрепляет15кодов прежнего AIRPORT_ALIASES + WAW,WMI иunknown, paritytest контролирует соответствие. Это ограниченный Polish split, не все мировые аэропорты. Warsaw group не делится/не сливается с одиночными кодами.

Каждая observed product session в одной когорте, включая без PAGE_VIEW. Row percent = cohort sessions / all observed sessions. Три engagement metrics используют cohort sessions как denominator; считаются все действия окна, включая до первого поиска. Суммы cohort session counts/global engagement numerators совпадают. Это описательный session split, не search/plan attribution, actual airport at click, step conversion, booking, returning visitor или causal uplift.0action означает0received, не доказанное0usage. Окна должны иметь одинаковые collection coverage/taxonomy.

Dashboard4locale показывает counts/доли/numerator-denominator-percent, неизвестные значения локализованы, canonical codes ограничены enum. Empty rows=[]→existing no_data без пустой таблицы; mobile table-scroll доступен клавиатуре. Old11metrics/page_cohorts/funnel/engagement versions и определения сохранены, legacy model/render без origin_cohorts поддержан. Дополнительных DB queries/записей/migrations/deps/tracking fields/IDs/consent changes нет. [Полное определение и evidence](h3-18b6/README.md), [machine definition](h3-18b6/definition.json).


## H3-18b7 — аудит Save/revisit, 2026-11-06

Контракт не расширен. TRIP_SAVE вызывает автоматическое открытие /trip и PAGE_VIEW(saved_trip); эта последовательность не доказывает возврат. PAGE_VIEW не содержит plan identity/local-shared kind/navigation cause, hash-only смена плана может не учитываться. Reload, разные local plans и shared copy имеют одинаковые смысловые поля; random IDs не дают plan attribution. Denied analytics допускает реальный Save/reopen без событий. returning_visitors остаётся unavailable/null; нет нового visitor ID/revisit tracker.

В production fixture подтверждён **P1 hydration session churn**: ConsentControls initial empty server snapshot приводит к clearSession при действующем stored consent;8/8 Save→auto-open разрывают session ID до30мин. Cross-page consistency/funnel/cohort denominators требуют исправления и повторной проверки; b7 это поведение не меняет. Даже после session fix true same-plan/person retention из прежнего payload не выводится. [Аудит/evidence/следующая b8](h3-18b7/README.md). Реальный масштаб/KPI не измерены.

## H3-18b8 — исправление consent hydration, 2026-11-06

ConsentControls effect теперь сверяется с текущим analyticsAllowed(), а не принимает промежуточный пустой server snapshot за отказ. При действующем согласии сессия не очищается при загрузке документа. Актуальный отказ/отзыв/invalid/expired consent по-прежнему очищает ID и запрещает отправку; track независимо повторяет boundary check. Grant не воспроизводит прошлые действия. Прежние session key/UUID/30-minute sliding timeout/180-day consent lifetime/dedup/no-referrer/no-retry/source-campaign allowlists и маркетинговый effect не изменены.

Изменение только в web, новых payload fields/events/IDs/API/schema/DB/dependencies нет. При доступном хранилище ID сохраняется на проверенных reload/full/client/locale/Save journeys; при блокировке session storage возможен только in-document memory fallback, без обещания связи между документами. Старые разорванные сессии не восстанавливаются; при сравнении периодов учитывать границу исправления. Stable session не означает человека/тот же план/полноту сбора. returning_visitors остаётся unavailable/null, hash-only gap и отсутствие plan/cause прежние. [Проверки/совместимость/rollback](h3-18b8/README.md). Deployment и реальные KPI не выполнялись.


## H3-18b9 — metadata.locale и language cohorts, 2026-11-06

[Taxonomyv5](h3-18b9/taxonomy.json) сохраняет17event names и triggers. Новый optional metadata.locale — только pl/en/ru/uk из existing pathLocale(location.pathname) после consent. Server сохраняет точные bounded strings, invalid values отбрасывает; navigator language, Accept-Language, IP, full URL/query/hash или новый identifier не добавляются. Consent/no-replay/dedup/no-referrer/no-retry/30min session/b8 hydration fix прежние. Public POST не доказывает consent/реальность заявленного locale.

UsageReport.locale_cohorts optional, version first-received-locale-cohorts-v1: одна строка на session по locale первого received product event в [start,end), server created_at/DB id; PAGE_VIEW не требуется. First missing/invalid/legacy→unknown без backfill; поздняя смена языка не переносит/не делит session. Share denominator все observed sessions,3engagement metric denominators sessions когорты, actions всё окно. Это описательная сегментация, не language of person/browser/action/locale-specific ordered funnel/search-plan attribution/returning visitor. Empty rows=[]/no_data; old constructor/render без блока допустим.4locale admin UI не меняет locale данных. Старые11metrics/funnel/engagement/origin versions/definitions сохраняются, device/returning unavailable.

API до web при будущем разрешённом rollout; old API drops locale, old client unknown. Сопоставимые периоды требуют одинаковой collection coverage и учёта b8 session boundary, старые языки не восстанавливаются. DB schema/deps/identifiers/retention без изменений; report использует прежнюю выборку без дополнительных SQL queries. [Полные правила/проверки/совместимость/rollback](h3-18b9/README.md), [definition](h3-18b9/definition.json). Deployment/real KPI не выполнялись.
