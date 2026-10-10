# Stay22 + Viator + EVENTIM: подключение HopTrip

Подготовлено 2026-10-10. Регистрации и отправка заявки не подтверждены.
Сайт: https://hoptrip.pl. Ниже — инструкции и готовый текст для владельца.

## Stay22

Регистрация: https://hub.stay22.com/en/auth/signup
После регистрации получить Affiliate ID (AID) и подтвердить доступ к Allez.
Начать с переходов на жильё по городу и датам поездки.

Описание для анкеты:
> HopTrip is a Polish-language travel discovery website focused on affordable
> flights from Poland and destination guides. We would like to add accommodation
> affiliate links matching the destination and dates of each trip. Visitors would
> complete their bookings on the accommodation provider's website.

Технический первый этап — в feature/accommodation по текущей карте веток.
Параметры Allez: aid, address (город и страна), checkin, checkout, adults,
campaign=hoptrip_accommodation, lang=pl, currency=PLN. Даты и гости должны
соответствовать выбору пользователя. Allez не является API гостиничных цен.
Проверить одну ссылку и атрибуцию в кабинете до включения на сайте.

Документация: https://dev.stay22.com/docs/allez/parameters

## Viator

Кабинет: https://partners.viator.com/
Выбрать Affiliate с завершением покупки на Viator.
После подтверждения email: Tools → Affiliate API → Start your development
(названия по официальной инструкции; фактический кабинет может отличаться).
Получить ключ и проверить уровень Basic. Ключ хранить вне Git;
разработчику передать путь к локальному файлу, а не значение в чате.

Описание для анкеты:
> HopTrip helps Polish-speaking travellers discover affordable flights from
> Poland and plan city breaks. We would like to use the Viator Basic Affiliate
> API to show relevant tours and activities on destination pages, with customers
> redirected to Viator to complete their bookings. We plan to start with a small
> selection of destinations and expand after validating the integration.

Пилот: три направления из актуального каталога, поиск продуктов и проверка
партнёрского productUrl. Цену «от» не считать подтверждённой ценой на дату поездки.
Basic не даёт всех возможностей Full: bulk ingestion и real-time availability
не считать доступными без проверки уровня аккаунта.
В проекте уже есть ссылки Tiqets; Viator добавляется отдельным источником.

Источники:
- https://partnerresources.viator.com/travel-commerce/levels-of-access/
- https://partnerresources.viator.com/travel-commerce/affiliate/basic-access/golden-path/
- https://docs.viator.com/partner-api/technical/

## EVENTIM

Основной маршрут — Publisher в Awin → eventim DE, advertiser ID 11388:
https://ui.awin.com/merchant-profile/11388

Прямая форма для индивидуального сотрудничества:
https://www.eventim.de/campaign/eventim-partner/bewerbung-kooperation

Форма требует: Firmierung, имя, email, отрасль, сайт, желаемый старт,
эксклюзивность, месячных Unique Users, аудиторию и USP. Требуется полная
информация об операторе сайта (Impressum). Ввести реальные сведения владельца.
Если посещаемость ещё не измерена, указать это, не придумывать число.
Предлагаемый ответ об эксклюзивности: Nein; обязательств пока не принято.
Это программа DE, доступ ко всей сети EVENTIM не подтверждён.
Комиссия в публичном профиле — 20% net presale fee, не стоимости билета.
В профиле есть одновременно cookie 1 день и session-based tracking;
условия атрибуции уточнить у менеджера.

### Готовый текст обращения

Subject: HopTrip.pl — affiliate partnership and event catalogue access

Hello EVENTIM Partnerships Team,

I represent HopTrip (https://hoptrip.pl), a Polish-language travel discovery
website focused on affordable flights from Poland and destination guides.

We would like to add relevant concerts, cultural events and sports events to
our travel planning experience, initially focusing on German destinations.
Visitors would follow tracked links and complete ticket purchases on EVENTIM.

We are interested in your eventim DE affiliate programme on Awin (ID 11388).
Could you confirm whether a Poland-focused publisher is eligible and whether
approved publishers can access a product feed or API with event titles, venues,
dates, images, available price information and affiliate deep links?

Please also let us know the permitted caching and refresh rules, content usage
requirements, and whether other EVENTIM country programmes require separate
applications. We are looking for a non-exclusive affiliate partnership.

Contact name: [owner's name]
Contact email: [owner's email]
Monthly unique visitors and measurement period: [actual figure and period,
or explain that reliable audience measurements are not yet available]
Awin publisher ID: [if already registered]

Kind regards,
[owner's name]
HopTrip

### Ответы для немецкой формы

Zielgruppe:
> Polnischsprachige Reisende, die günstige Flüge ab Polen und Kurzreisen in
> europäische Städte suchen und passende Veranstaltungen am Reiseziel entdecken möchten.

USP:
> HopTrip verbindet die Suche nach günstigen Flügen ab Polen mit Reiseführern.
> Geplant ist, passende Veranstaltungen nach Reiseziel und Reisedatum anzuzeigen
> und Nutzer zum Ticketkauf direkt zu EVENTIM weiterzuleiten.

## Следующий шаг

Нужны статус аккаунтов, Stay22 AID, путь к файлу ключа Viator и уровень API;
для EVENTIM — сведения владельца, email, фактическая аудитория и период.
После отправки записать дату и номер обращения/статус Awin.
Не отмечать заявку отправленной или провайдера одобренным без подтверждения.

## Обновление 2026-10-10: Stay22

Владелец подтвердил создание аккаунта и AID `hoptrip` (stay22.md).
Локальная интеграция подготовлена в worktree `backups/branch-worktrees/accommodation`,
ветка `feature/accommodation`: изменяемые даты и взрослые, направление из предложения.
2 unit-теста, TypeScript и ESLint прошли. Публикация и атрибуция не проверены.
Viator и EVENTIM по-прежнему ожидают сведений об аккаунтах/заявке.

## Проверка перехода Stay22 — 2026-10-10

Один автоматический переход через Playwright / Edge headless:
AID hoptrip, Malaga Spain, 2026-11-10 → 2026-11-13, 2 взрослых,
campaign=hoptrip_accommodation_check, lang=pl, currency=PLN.
Ответ https://www.stay22.com/allez/roam: HTTP 403, тело Blocked.
До провайдера бронирования переход не состоялся. Причина 403 неизвестна;
валидность AID и работоспособность в обычном браузере этим не установлены.
Учёт клика не подтверждён. Требуется один переход владельца в обычном браузере
и сверка кампании hoptrip_accommodation_check в Stay22 Hub.
Сайт HopTrip не публиковался и не изменялся на production.

## Результат ручной проверки — 2026-10-10

Владелец предоставил два скриншота после тестового перехода.
Booking.com показывает Málaga, 10–13 ноября 2026 (год виден в URL),
2 взрослых, 0 детей, 1 комнату и валюту PLN. Параметры назначения, дат и взрослых
переданы корректно. Интерфейс Booking открыт на английском: lang=pl не обеспечил
польский интерфейс у конечного провайдера в этом переходе.
Stay22 Hub / Performance показывает Clicks Total = 1, Transactions Total = 0.
Фильтр Campaign ID не выбран: конкретная кампания по скриншоту не установлена.
Это подтверждает наличие клика в кабинете, но не атрибуцию бронирования/комиссии.
Ранее полученный автоматическим браузером 403 не воспроизвёлся у владельца.
Проверка production-публикации и интерфейса HopTrip остаётся отдельным шагом.

## Интеграция в main — 2026-10-10

Блок перенесён из worktree feature/accommodation в рабочее дерево main и подключён
к странице /deals/[slug]. Добавлены unit- и браузерные тесты. Проверены desktop и
mobile, редактирование дат/гостей, некорректный срок, новая вкладка и отсутствие
горизонтального переполнения. Партнёрский переход в E2E перехватывается локально.
19 unit-тестов и 2 браузерных сценария прошли; ESLint прошёл.
Изменения пока локальные, production не обновлён.
