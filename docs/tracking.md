# Сессии, события и метрики

Сессия — случайный UUID, 30 минут без событий. localStorage хранит только ID,
время активности и ограниченные source/campaign. При недоступном storage используется
память вкладки; после полной перезагрузки непрерывность такой сессии не гарантируется.
Маркетинговые source/campaign сохраняются на сессию и передаются в переход.
Не добавлять email, телефон и персональные идентификаторы в campaign/SubID.

PAGE_VIEW, видимый DEAL_IMPRESSION (IntersectionObserver), DEAL_VIEW и FILTER_USE
используют один session ID. Сервер создаёт AFFILIATE_CLICK только при разрешённом
редиректе. Клиент не может сообщить booking/conversion. Event UUID обеспечивает
повторяемость записи; browser effects подавляются в пределах короткого окна.
Сбой аналитического запроса не мешает интерфейсу.

GET /api/v1/admin/analytics/summary?start=<ISO timezone>&end=<ISO timezone>
использует полуоткрытый интервал [start,end). По умолчанию последние 90 дней
(ANALYTICS_RETENTION_DAYS). Сессия считается, если у неё есть событие в интервале;
переходящие через границу сессии могут присутствовать в двух отчётах.
Raw CTR = clicks/views; session CTR = viewed sessions with a click / viewed sessions.
Conversion period использует occurred_at, при отсутствии created_at. Это отчёт по
времени событий, не строгая когорта бронирований после кликов указанного периода.
Attributed значит известен click_id. Booking rate учитывает attributed confirmed.
PLN revenue не включает EUR и отменённые/отклонённые записи, FX не выдумывается.
1 PLN / 3000 sessions × 1000 округляется до 0.33 только в конце.

Защищённый JSON upsert: provider_code + provider_conversion_id; tracking_id разрешается
в click_id, provider/program проверяются. Обновление статуса без click/deal не стирает
известную атрибуцию. Исторический неатрибутированный импорт допускается явно без click.

maintenance удаляет raw events старше retention и стирает session/source/campaign
старых кликов, сохраняя click IDs, tracking IDs и финансовые связи. Финансовые данные
не удаляются автоматически. Отчёты за период вне сохранённых событий неполны.
Запускать maintenance ежедневно даже до включения price worker.
