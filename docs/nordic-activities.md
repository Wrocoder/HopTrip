# Экскурсии Норвегии и Исландии — 2026-10-18

Статус: реализовано и проверено локально; не опубликовано.

Переиспользован DestinationActivities: подбор по точному slug города на странице
перелёта и в связанных городских руководствах. Существующие официальные варианты
сохранены. Цены, доступность и отзывы не скопированы: пользователь проверяет их у
организатора на свои даты. Стоимость экскурсии не включена в цену перелёта.

| Город | Добавлено | Проверенный продукт Tiqets |
|---|---|---|
| Oslo | Двухчасовой Oslofjord | [1041446](https://www.tiqets.com/en/oslo-attractions-c75084/tickets-for-oslofjord-sightseeing-p1041446/) |
| Bergen | Alversund, прогулка по городу и Fløibanen, около 7 часов | [1097659](https://www.tiqets.com/en/bergen-attractions-c75102/tickets-for-full-day-tour-of-bergen-fjord-cruise-historic-city-tour-and-floien-funicular-p1097659/) |
| Reykjavik | Наблюдение за китами, 3–3,5 часа | [976255](https://www.tiqets.com/en/reykjavik-attractions-c22/tickets-for-whale-watching-classic-tour-from-reykjavik-p976255/) |
| Reykjavik | Golden Circle: гейзеры, Gullfoss, Þingvellir, около 6 часов | [977170](https://www.tiqets.com/en/reykjavik-attractions-c22/tickets-for-golden-circle-direct-roundtrip-from-reykjavik-p977170/) |
| Reykjavik | Ледниковая лагуна Jökulsárlón, около 14,5 часа | [1109840](https://www.tiqets.com/en/reykjavik-attractions-c22/tickets-for-jokulsarlon-glacier-lagoon-full-day-guided-tour-from-reykjavik-p1109840/) |

Все пять партнёрских ссылок успешно созданы официальным Travelpayouts Links API
для существующего проекта HopTrip. Публичный ответ без токена:
[nordic-activity-partner-links.json](nordic-activity-partner-links.json).
Сохранены sponsored, раскрытие комиссии и аналитика с согласием пользователя.
Бронирования и начисление комиссии не проверялись.

Для Tromsø добавлена [официальная информация о китах](https://www.visittromso.no/whale-watching),
без партнёрской комиссии: подходящий партнёрский продукт не подтверждён.
Указаны сезонность, переезд к Skjervøy и отсутствие гарантии встречи с китами.
Jökulsárlón явно описан как поездка к лагуне, не треккинг по леднику и не ледяная
пещера. Места отправления и ограничения указаны по продуктам.

Публичный каталог API на дату проверки содержит Oslo, Bergen, Tromsø и Ålesund,
но не содержит направления Исландии. Поэтому блок Reykjavik сейчас добавлен в
существующую статью `/info/islandia-wieloryby-lodowce-atrakcje` с явным местом старта.
Он готов для перелётов с destination.slug `reykjavik`; если будущий источник
использует другой slug, потребуется согласовать соответствие. Рейсы не выдуманы,
общестрановая статья не привязана к произвольному аэропорту. Для Ålesund туры из
другого города не подставляются.

Проверки: ESLint и production build/TypeScript прошли; Playwright activities.spec.ts:
18 passed на desktop/mobile. Проверены реестр городов и продуктов, структура
партнёрских URL, согласие/отзыв согласия, доступность блока, отсутствие обращений
к провайдеру до клика, раскрытие комиссии, бюджет, отсутствие переполнения на 320px.
Регрессия страницы перелёта проверена на существующей Barcelona fixture;
живое бронирование и production-показ новых северных карточек не проверялись.

После выкладки: открыть предложения Oslo/Bergen/Tromsø и статью Исландии, проверить
карточки и исходящие ссылки. Сравнивать ACTIVITY_CLICK и PARTNER_CLICK только в
рамках существующей модели согласия; сверять продажи в Travelpayouts отдельно.
Новые URL страниц не созданы, отдельная отправка sitemap не требуется.
