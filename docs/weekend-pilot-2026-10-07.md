# Маршруты на 48 часов: Малага, Аликанте, Прага

Опубликовано 2026-10-07 после явного разрешения владельца передать архив на
ubuntu@141.144.246.78. Предыдущий отказ автоматической проверки разрешений устранён.

## Что готово

- /info/malaga-weekend: центр и Alcazaba, затем Picasso, парк и Malagueta.
- /info/alicante-weekend: Santa Bárbara и Santa Cruz, затем MARQ и Postiguet.
- /info/prague-weekend: Старый город, Карлов мост и Kampa; затем Град и Malá Strana.

В каждой статье: порядок мест, две ссылки на пешие карты Google Maps,
варианты без входных билетов и на дождь, подготовка багажа, ссылка на статью
об аэропорте с опубликованными трансферами и калькулятор бюджета.
Порядок прогулок — редакционная рекомендация для двух полных дней, не
подтверждение расписания или доступности билетов. Цены поездок не выдумываются.
На страницах автоматически выводятся существующие подборки: Tiqets для
музея Пикассо и Пражского Града, официальный MARQ для Аликанте.

Добавлены обратные ссылки из аэропортовых статей и общего руководства,
привязка к направлениям и страницам предложений. Каталог статей: 44 страницы,
sitemap: 46 URL. Встроенных карт и дополнительных сторонних скриптов нет.

## Источники

Проверены официальные страницы; ссылки и дата проверки размещены в статьях:

- https://alcazabaygibralfaro.malaga.eu/es/index.html
- https://www.museopicassomalaga.org/en/visita
- https://www.alicante.es/es/equipamientos/castillo-santa-barbara
- https://www.marqalicante.com/en/organiza-tu-visita/
- https://prague.eu/en/objevujte/charles-bridge-karluv-most/
- https://www.hrad.cz/en/prague-castle-for-visitors
- https://prague.eu/en/objevujte/museum-kampa/

Файл events-coverage-2026-09-30.json не используется как источник актуальных
часов работы или наличия билетов. CJ/жильё и Ticketmaster остаются вне выпуска.

## Проверки и выпуск

Прошли TypeScript, ESLint и 10 целевых Playwright-проверок в Edge
(desktop/mobile): реестр источников, метаданные, страницы трёх маршрутов,
каталог, sitemap и отсутствие переполнения на 320 px. Локальная production-сборка
Next.js также прошла. Серверная ARM64-сборка прошла; обновлён только web.
API readiness: ready. В 09:09 UTC Edge проверил три опубликованные статьи:
HTTP 200, canonical, две карты на каждый маршрут, якоря достопримечательностей,
ссылки на аэропорты и обратные ссылки, наличие блока трансферов, axe без
нарушений, отсутствие переполнения на 320/390/1280 px и ошибок JavaScript.
В sitemap 46 URL. Отчёт: weekends-production-check-2026-10-07.json.

Архив: backups/weekends-release-20261007.tar.
SHA256: 65651dbb9f491c478166be9e3dd1827dfd7bd1669c3d21cf6ef66b0f9a75e234.
Он содержит шесть файлов:

- apps/web/src/app/info/[slug]/page.tsx
- apps/web/src/lib/info-types.ts
- apps/web/src/lib/content.ts
- apps/web/src/lib/guide-destinations.ts
- apps/web/src/lib/city-break-guides.ts
- apps/web/src/lib/weekend-pilot-guides.ts

Архив передан в /tmp/hoptrip-weekends-release-20261007.tar; SHA256 совпал.
Сборка и пересоздание web выполнены через production + domain Compose
с --no-deps --no-build на этапе запуска. БД, API и worker не обновлялись.

Откат: image hoptrip-web:before-weekends-20261007 и архив пяти предыдущих
файлов /opt/hoptrip/backups/web-source-before-weekends-20261007.tar.
Восстановить файлы, присвоить сохранённому образу тег hoptrip-web:latest
и пересоздать только web тем же Compose с --no-deps --no-build.
Новый weekend-pilot-guides.ts после восстановления content.ts не импортируется.
