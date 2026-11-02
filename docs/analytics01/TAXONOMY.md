# ANALYTICS-01 — словарь продуктовых событий

Дата: 2026-11-02. Версия документа: 2. Используется существующая first-party аналитика: `session.ts` → `POST /api/v1/analytics/events` → `AnalyticsEvent`. Новый SDK, внешний провайдер, dashboard и миграция не нужны. Имена на проводе остаются UPPER_CASE; предложенные в мастер-плане lower_case — названия понятий для этой таблицы, не дополнительные события. [Предыдущий контракт и метрики](../hoptrip-analytics-contract.md) сохраняют действие с уточнениями ниже.

## Соответствие мастер-плану

| Понятие | Реальное событие / условие | Свойства и предел измерения |
|---|---|---|
| search_submitted | `SEARCH` после валидной отправки FilterForm, включая preset/sort | `search.filters` из allowlist; заблокированный ввод не считается. Это действие формы, не каждый прямой вход в каталог |
| search_results_viewed | `SEARCH_RESULT` при отрисовке текущей выдачи | `search.filters` и ровно одно из `result_count` / `error`. Count — текущая страница, не total. Нулевая выдача отличается от ошибки; прямой вход и pagination тоже считаются |
| filter_applied | `FILTER_USE`, `filter.action=apply` | Валидная отправка формы, включая sort/preset; отдельное событие `SEARCH` описывает тот же submit. Не складывать их как два поиска |
| filter_reset | `FILTER_USE`, `filter.action=reset` | Активация «очистить все»; `remove` — удаление одного chip. Это намерение навигации, не гарантия загрузки новых результатов |
| offer_viewed | `DEAL_IMPRESSION` | В viewport попал marker карточки; `deal_slug` разрешается сервером в deal_id. Это не доказательство просмотра всей карточки/внимания пользователя |
| offer_details_opened | `DEAL_VIEW` | Отрисована detail page; `deal_slug`. Повторный render не добавляет просмотр. Не создаём второй alias для того же открытия |
| affiliate_clicked | `PARTNER_CLICK` | `partner.category=flight/stay/activity`, `provider=catalog/stay22/tiqets`, deal_slug при наличии. Намерение перейти, не продажа и не доказательство успешной навигации |
| trip_saved | `TRIP_SAVE` | Успешно сохранён новый снимок в браузере. Повтор того же снимка и failed write не считаются. Без plan token, маршрута, дат, людей и сумм из плана |
| trip_removed | **`TRIP_REMOVE`** | Успешный результат `removed` из saved store. Absent/corrupt/failed write не считаются. `metadata.page_type=saved`; без идентификатора/содержимого плана. Undo остаётся локальным действием, без дополнительного TRIP_SAVE |
| budget_calculated | `BUDGET_USE` | Первое валидное непустое изменение поля расчёта за посещение. Это использование калькулятора, а не подтверждение полноты/сохранения бюджета. Суммы не отправляются |
| event_clicked | **`EVENT_CLICK`** для ticket links TripEvents; existing `ACTIVITY_CLICK` для отдельных attractions | EVENT_CLICK содержит только связанный deal_slug и общий контекст страницы. Одинаковое событие для single и ticket-option links; нет ticket URL/event ID/name/date/price. Cancelled/disallowed ticket link не отображается. ACTIVITY_CLICK — другой поток с прежними bounded city/activity/page/link_kind; не смешивать без указания типа |
| alert_subscription_started | **`ALERT_STARTED`** | Явная отправка signup-формы, прошедшая browser validation; один раз за посещение. Считается и если API отверг заявку/почта недоступна. Без email/preferences/token. Открытие формы, failed HTML validation и manage/confirm действия не считаются |
| alert_subscription_completed | `ALERT_CONFIRMED` | Успешный confirmation response email API; не signup POST/письмо/страница подтверждения. Только при текущем согласии аналитики. Нельзя связывать с началом по email/token |

Existing `PAGE_VIEW` остаётся просмотром страницы; PageTracker следит за route/query, ConsentControls добавляет событие после opt-in. Client visit dedupe не позволяет двум точкам отправки удвоить один просмотр. На personal alert pages автоматические просмотры запрещены.

## Общий envelope и контекст

Browser отправляет случайные UUID `event_id` и `anonymous_session_id`, `event_name`, optional внутренний `deal_slug`, фиксированные `source` и `metadata.campaign/page_type`, а также только предусмотренный для события structured context. Сервер разрешает slug в внутренний ID; неизвестное предложение даёт404. Existing event ID uniqueness сохраняет повторный POST один раз; без event_id legacy clients такой гарантии не имеют.

- Source: homepage/google/facebook/instagram/newsletter/direct/test. Campaign: hoptrip-launch/wro-weekend/test. Это разрешённые метки, не свидетельство запуска кампаний. Неизвестные UTM не записываются.
- Page type: home/catalog/city_break/weekend/origin/destination/route/deal/budget/saved_trip/**saved**/alerts/guide; locale prefixes нормализуются. Полные path/query/hash не включаются. Сессия не является человеком; нового locale/device/user fingerprint нет.
- Новый `filter` — только `{action: apply|remove|reset}`. Сервер допускает его только у FILTER_USE и отбрасывает лишние поля. Старый FILTER_USE без action всё ещё принимается: считать отдельно как unclassified, не угадывать исторический reset. Single chip removal сохраняет прежнюю логику FILTER_USE, добавляется лишь action.
- Search filters по прежнему контракту: registry origin/destination, bounded calendar dates/budget/duration/offset/weekend. `sort` не добавляется, свободного поискового текста нет. PARTNER_CLICK/ACTIVITY_CLICK contracts и tracking URLs прежние.
- Для новых событий TRIP_REMOVE/ALERT_STARTED нет дополнительных контекстов; EVENT_CLICK получает только deal_slug. Прямой ticket URL, event name/provider record ID, plan content, email, alert ID и capability не передаются из UI. Search/partner/activity contexts для новых событий API отвергает по существующим правилам.

## Согласие, приватные страницы и доставка

Каждый вызов `track` заново проверяет действующее analytics consent. Отсутствие/истечение/отказ блокирует отправку; маркетинговое согласие отдельно и не заменяет analytics. Отзыв очищает session storage/memory/dedupe; уже отправленные события автоматически не удаляются. Новые события не отправляются задним числом после opt-in. Consent duration180days и session idle timeout30min прежние.

На `/alerts` (включая4 locale variants) разрешён явный ALERT_STARTED при submit; на `/alerts/confirm` и `/alerts/manage` он запрещён. Existing explicit ALERT_CONFIRMED exception сохраняется; PAGE_VIEW/SEARCH/partner и прочие действия на alert pages подавляются. Tokens в hash/query/управляющие ссылки и email не читаются для аналитики. POST использует no-referrer. Marketing Drive suppression на personal pages не меняется.

Просмотры/SEARCH_RESULT/BUDGET_USE/ALERT_CONFIRMED/ALERT_STARTED отправляются один раз на context за visit. Visit определяется текущими pathname+search внутри клиента; смена URL и возврат/полная перезагрузка — новое посещение. ALERT_STARTED не сбрасывается обычным rerender или повторным submit на той же странице. Быстрые одинаковые action events объединяются на1секунду; разные filter.action имеют разные ключи. Поэтому два разных удалённых плана или ticket clicks на той же странице за эту секунду могут дать одно событие. Идентификаторы планов/билетов ради различения не добавляются.

Отправка best effort keepalive fetch, без blind retry. Сеть, blockers, закрытие вкладки и rate limits могут терять события; analytics failure не блокирует сохранение/удаление/поиск/переход/подписку. Публичный API не доказывает реальное согласие, действие или уникального человека. Legacy свободные `component`/session strings от сторонних клиентов не объявляются криптографически доверенными; UI их из персональных полей не строит. Existing retention maintenance90days не меняется; реальная частота jobs этой задачей не подтверждена.

## Метрики и ограничения воронки

- SEARCH→SEARCH_RESULT: сравнивать по anonymous session, периоду и нормализованному filter context. Result включает direct/pagination, отдельного search_id нет: простое деление count(result)/count(search) не является точной конверсией.
- DEAL_IMPRESSION→DEAL_VIEW→PARTNER_CLICK: сопоставлять ту же сессию и deal_id в правильном временном порядке. Одна session может изучать несколько предложений; это сессионный путь, не точная причинная атрибуция поиска.
- PLAN: отдельно число успешных TRIP_SAVE/TRIP_REMOVE и сессий с ними. Не вычислять размер сохранённой коллекции как save−remove: повторы/undo/несколько устройств/невидимые opt-out/дедупликация это нарушают.
- Budget: BUDGET_USE измеряет начало работы с калькулятором, не полную сумму и не точность результата. Ticket EVENT_CLICK — намерение перейти; официальный attraction ACTIVITY_CLICK не партнёрская продажа.
- Email: считать starts и successful confirmations отдельно. Confirmation может произойти позже в другой session/device/после opt-in; start может окончиться отказом API. Отношение confirmed/started за период — описательный proxy, не cohort conversion и не гарантированная доставка письма. Telegram subscriptions этим browser funnel не измеряются; chat/user IDs не импортируются.
- Новый filter action доступен только после публикации этой версии. Исторические FILTER_USE не переклассифицируются; FILTER_USE+SEARCH и ACTIVITY_CLICK+PARTNER_CLICK одного действия не суммируются.
- Existing admin `by_event` автоматически включает три новых имени. `total_affiliate_clicks`, CTR/commission используют прежний AffiliateClick/AffiliateConversion, не новые browser events. Подтверждённая комиссия берётся только из подтверждённой conversion; ни один click не объявляется покупкой.

Выборка ограничена согласившимися браузерами; нет полного охвата, cross-device identity или доказательства роста conversion. В этой задаче не создаются dashboard/эксперимент, не включается production analytics и не выполняется следующая GROW-03/ANALYTICS-02.

## Откат и совместимость

Изменения additive: три строковых event names, необязательный filter context и saved page type помещаются в existing table/JSON; migration не требуется. Старые event names/payloads и admin summary сохраняются. Чтобы откатить, сначала вернуть web producers и затем API allowlist/context обработку либо выпустить согласованный bundle; старый API отвергнет новые события422, но основное действие останется рабочим. Уже сохранённые новые names можно оставить в таблице; ничего не удалять и не переименовывать задним числом. Не изменять affiliate URLs/consent/storage contents или email/Telegram flags ради отката аналитики.
