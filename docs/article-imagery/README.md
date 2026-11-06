# Фотографии в статьях HopTrip

Дата: 2026-11-02. Дополнение к UI-02 по прямому запросу владельца. Статус: DONE / DEPLOYED, acceptance и production smoke пройдены.

## Что добавлено

31 фотография Wikimedia Commons: обложки для 49 редакционных материалов на PL/EN/RU/UK — 196 языковых страниц. Это 46 путеводителей и три статьи о сравнении, свежести и истории цен. В материалы о Норвегии и Исландии добавлены также фотографии Nigardsbreen и Sólheimajökull непосредственно после соответствующих разделов о ледниках.

Раньше UI-02 добавлял только три изображения направлений на главной; обложек в самих статьях не было. Теперь используется общий компонент с локализованными alt/подписями, годом съёмки при наличии, видимыми автором и лицензией. Источник, название оригинала, дополнительная атрибуция и описание обработки доступны через обычный раскрывающийся блок, работающий без JavaScript. Юридические и служебные страницы, неизвестные URL и черновики не получают случайных фотографий.

Фотографии иллюстрируют место или тему; они не подтверждают нынешнее состояние достопримечательности, наличие экскурсии или рейса. Для статей об аэропортах отдельно поясняется, что показан город, а не терминал. Даты публикации/проверки текста не обновлялись ради добавления фото.

## Источники и условия использования

- Pinterest не используется как источник изображений или разрешений. Все выбранные оригиналы получены непосредственно с Wikimedia Commons.
- [Реестр 31 файла](assets.json) содержит Commons page ID, автора и его ссылку, название, источник/оригинальный URL, выбранную лицензию, время проверки, SHA-1 оригинала по Commons API, SHA-256 оригинала и адаптации, размеры, объём и параметры обработки.
- Для каждого файла проверены `imageinfo/extmetadata`: `LicenseShortName`, `LicenseUrl`, `UsageTerms`, `AttributionRequired`, `Copyrighted`, `Restrictions` и авторство. Используются CC BY и CC BY-SA 2.0/3.0/4.0. Поле Restrictions у выбранных 31 записей пустое; это свойство метаданных, а не юридическая гарантия отсутствия любых других прав.
- Автор, название, ссылка на оригинал и лицензию сохранены. Дополнительное требуемое attribution из метаданных показано в раскрывающихся подробностях. [Публичный сводный список](../../apps/web/public/media/articles/CREDITS.md) поставляется вместе с файлами.
- Обработка: автоориентация, центральное кадрирование 16:10, размер 1200×750, WebP с quality 76/70/64/58/52 до заданного бюджета; EXIF/XMP удалены. Генеративных изменений нет. На странице явно указана обработка HopTrip; адаптированный снимок сохраняет выбранную лицензию оригинала, включая ShareAlike. Эти лицензии относятся к фотографиям, а не ко всему сайту.
- Кандидат с Миланским собором и явным ограничением `ita-mibac` исключён. Вместо него выбран вид Naviglio Grande; для Рима — улица Трастевере. Неудачные по кадрированию панорамы/фотосферы также заменены до финальной проверки.
- Исходные файлы сверены с официальным SHA-1 Commons API до обработки. Подмена одноимённого кешированного кандидата исключена проверкой page ID и хеша. Оригиналы и временные исходные HTML метаданные в Git/public не включены.
- Полученный Commons HTTP429 соблюдён: запросы приостановлены, добавлена задержка и повторное использование уже полученных метаданных. Обхода лимитов нет.

Правила: [Commons: Reusing content outside Wikimedia](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia), [Commons API](https://commons.wikimedia.org/wiki/Commons:API), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Commons не даёт гарантии прав: отдельные ограничения на изображённые объекты, персональные права и местные нормы могут действовать независимо от авторской лицензии. Спорный файл следует снять с показа и заменить после проверки; наличие записи в Commons не заменяет разрешение там, где оно требуется отдельно.

## Оформление и загрузка

Все файлы: 1200×750 WebP, каждый ≤360000 байт; суммарно 4043902 байта (~4,04 MB). `next/image` выдаёт адаптивный `srcset`; обложка preload, иллюстрации ниже по тексту lazy. Соотношение сторон и размеры резервируются до загрузки; при 404 остаются рамка, локализованное сообщение и атрибуция. Скругления, цвет и типографика используют существующие токены; ссылки и summary имеют видимый keyboard focus, основные credit targets ≥44px.

Существующие URL/canonical/hreflang/OG previews, текст статей, API, база, аналитика/consent и партнёрские адреса сохранены. Новых зависимостей и внешних runtime запросов к Commons нет: фотографии раздаются с собственного домена.

## Проверки

- Node: 218/218, включая три новых проверки покрытия всех 49 slug ×4 локали, неизвестных/служебных маршрутов, SHA-256 фактических WebP, размеров/бюджета/метаданных и лицензий.
- ESLint и изолированная production-сборка Next/TypeScript прошли.
- Новые Playwright: 14/14, desktop/mobile, 0 skipped/flaky/unexpected, errors=[], retries=0, 191,16s. Реальная загрузка обложек в четырёх локалях, 40 scoped axe scans без violations, 320px без горизонтального overflow, keyboard credits, 31 local asset HTTP200, lazy inline, 404 fallback и вариант без JS.
- Все 31 финальные кадра просмотрены на контактных листах; desktop/mobile PL/RU captures просмотрены отдельно.
- Первый запуск старых editorial/SEO specs остановился на не связанном с фото registry assertion: допустимые routes не учитывают существующие query-based CTA после SEO-04 (`editorial.spec.ts:81`). Результат 0 passed/1 failed/111 not run, 14,55s сохранён; этот статический тест импортирует только неизменённые content/catalog modules. Assertions не ослаблялись, исправление этого старого теста не включено в задачу.
- Прежние targeted editorial rendering/guide CTA/technical SEO: desktop46/46,295,92s; mobile6/6,51,68s. Оба runs errors=[],0skipped/flaky/unexpected,retries=0. Проверены 40 существующих PL article rendering cases, CTA во всех четырёх локалях и без JS, narrow localized editorial index;244 sitemap pages и54 editorial links HTTP200, unique metadata/canonical/robots assertions сохранены. Итого66 уникальных успешных browser cases с новыми14; первый failed registry run не суммируется и не объявляется passed.

Локальные raw logs: `.cache/article-imagery/{unit.txt,lint-final.txt,build.txt,browser.json,regression.json,editorial-regression.json,mobile-regression.json}`. Сводка проверок (`docs/article-imagery/verification.json`; исторический файл удалён). Скриншоты/браузерные traces и SQLite temp находятся на отдельном диске F:. Полный 800-case suite и юридическая/WCAG сертификация не заявляются. Backend и схема не менялись; отдельный локальный pytest/PG прогон для этой задачи не запускался. При публикации требуется штатный CI API/web/checks.

Воспроизведение: `npm run test:unit`, `npm run lint`, `npm run build` из `apps/web`; новый spec — `tests/article-imagery.spec.ts` с штатным Playwright config и PyCharm SDK для guarded fixture. В текущем запуске использована отдельная копия `.cache/aud05-article-imagery`, production bundle, собственные порты 3125/8125, Chrome, синтетическая SQLite fixture, оба mail transport fake, delivery/editor/events flags false. Внешние переходы в новом spec запрещены; реальные партнёрские ссылки не открывались.

## Публикация и откат

Опубликован и задеплоен `5a04ffa00f12ddeabaeb45adb20c58bed2194b05` штатным pinned-SHA script. [CI API/web/checks](https://github.com/Wrocoder/HopTrip/actions/runs/41517645708): все три jobs success. Production source: `/opt/hoptrip/releases/5a04ffa00f12ddeabaeb45adb20c58bed2194b05-20261102T201841Z`; фактический deployed-sha/current проверен. Все12 monitor checks true. Caddy config не менялся, его пересоздание не требовалось.

Backup: `/opt/hoptrip/backups/deploy-20261102T201841Z-5a04ffa00f12ddeabaeb45adb20c58bed2194b05/database.dump`,5266215bytes,mode600; штатный `pg_restore --list` прошёл до миграционного шага. Новых миграций в этой задаче нет. Сохранены предыдущие application images для штатного rollback.

Production smoke (`docs/article-imagery/production.json`; исторический файл удалён):196/196 языковых страниц HTTP200 с обложкой/лицензией/прежним canonical;31/31 WebP HTTP200 с точным SHA-256. В браузере24 сочетания (четыре локали×два viewport×Париж/Норвегия/Исландия): actual optimized image load, inline lazy load, keyboard attribution/source, без overflow; no-JS credit дополнительно проверен. JS errors=[], CSP violations=[], external attempts=[]; desktop/mobile production captures просмотрены. Для воспроизведения: `node docs/article-imagery/verify-production.cjs` из корня, с браузерным temp на отдельном диске.

Все четыре runtime flags `alerts_enabled`, `alerts_digest_enabled`, `telegram_enabled`, `telegram_delivery_enabled` проверены и равны false; оба public status endpoints также enabled=false/delivery_enabled=false. Email, digest и персональный Telegram не включались. Operational monitoring сохранён.

Для отката достаточно восстановить предыдущий web image/source штатным application rollback. Изменений схемы/данных/миграций в этой задаче нет; database downgrade и удаление данных не нужны. При отзыве конкретного фото удалить его mapping до проверки замены, сохранив запись происхождения в истории Git.
