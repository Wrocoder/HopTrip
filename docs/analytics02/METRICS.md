# Определения ANALYTICS-02

Версия1,2026-11-02. Единица session — существующий anonymous_session_id, не человек. Dataset: только14 product EventName, без server AFFILIATE_CLICK/unknown и exact placeholders empty/anonymous/not-provided. Только полученные records в UTC [start,end). Defaults7days/max31days/20000rows; при превышении413, без частичной выборки. Retention и существующий event_id dedupe не меняются.

| Рекомендованная метрика | Реальный расчёт / предел |
|---|---|
| Search initiation | distinct sessions с SEARCH / все observed product sessions. Не доля всех посетителей сайта |
| Search success | SEARCH_RESULT с count>0 / все valid outcomes positive+empty+error. Это proxy по received result events: direct entry/pagination тоже присутствуют, search_id нет |
| Empty results | count=0 / positive+empty. Error не zero. Валидно только int0..100 (bool исключён), либо known error с отсутствующим count; mixed/invalid legacy fields → invalid_results |
| Detail opening | sessions с DEAL_VIEW / все observed sessions. Не card-impression CTR |
| Affiliate CTR | distinct (session,deal_id) с PARTNER_CLICK после DEAL_VIEW этого же deal_id / все viewed pairs с известным deal_id. Другой deal/ранний click не конвертируют; repeats не увеличивают numerator. Equal timestamps упорядочены DB id, не клиентским временем |
| Save-trip | sessions с TRIP_SAVE / все sessions; успешный save intent, не размер local collection |
| Budget usage | sessions с BUDGET_USE / все sessions; first valid edit, не полнота/сумма бюджета |
| Event engagement | union sessions с EVENT_CLICK или ACTIVITY_CLICK / все sessions; повтор одного session не удваивает numerator |
| Returning visitors | unavailable/null: persistent visitor identity отсутствует. Не выводить из timeout/session/IP |
| Mobile vs desktop | unavailable/null: device class не собирается. Никакого silent UA/fingerprint collection |
| Landing conversion | Таблица proxy: первый received PAGE_VIEW внутри окна → fixed page_type; later PARTNER_CLICK sessions / cohort sessions. Это не landing URL/полное начало сессии; ранние события могли быть до окна/утеряны. Без PAGE_VIEW — not_observed и null conversion; unknown type — unclassified, raw metadata не выводится |

Дополнительно result error rate = valid errors / all valid outcomes. Для denominator0 status=no_data и percent=null; при positive denominator numerator0 — честные0.00%. Unsupported status=unavailable, counts/percent=null независимо от наличия других events. Decimal HALF_UP2places. Показаны числитель/знаменатель; population/definitions нельзя незаметно менять между сравнениями.

First observed page cohort и same-offer ordered pairs — разные группировки; их не складывать. Нельзя сложить SEARCH+FILTER_USE или ACTIVITY_CLICK+PARTNER_CLICK как независимые переходы. Existing AFFILIATE_CLICK/AffiliateConversion financial summary остаётся отдельной метрикой; browser intent не бронирование/доход. Alert explicit events входят в product sessions, Telegram chat identities не импортируются.

Coverage ограничена analytics consent, blockers/network/best effort/retention; public ingestion не доказывает настоящего пользователя или согласия. Same session после timeout может стать новой; cross-device/cross-search/cohort attribution не обеспечена. Report не заявляет causal uplift или production baseline. Административная модель не включает raw IDs, URLs, source/campaign arbitrary fields, plan/email/token и не расширяет сбор данных.
