# Оценка flight-v2

Итог: round(0.35 × flight_price + 0.20 × historical_discount + 0.15 × convenience
+ 0.15 × freshness + 0.15 × confidence), затем ограничение 0–100.

Компоненты, sample_count и score_version сохраняются в Deal.score_components.
По сохранённым компонентам воспроизводится итоговая оценка. Исходные price/baseline,
confidence и last_verified также остаются в записи. UNKNOWN convenience = 50,
это не утверждение об удобном времени вылета. UI переводит explanation_codes через pl.ts.

Историческое сравнение: один data provider, origin/destination, FLIGHT, месяц вылета
и длительность. Для one-way длительность NULL и отдельный уникальный bucket.
При отсутствии baseline скидка 0, диапазон цены нейтрален. Это оценка flight-only,
отели и непроверенные дополнительные расходы не подмешиваются.

Модерация: GET /api/v1/admin/deals?q=...; PATCH /api/v1/admin/deals/{id}
с is_visible/is_featured. Все действия требуют X-Admin-Token.
Пересчёт не меняет редакторские флаги.
