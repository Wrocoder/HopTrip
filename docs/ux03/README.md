# UX-03 — иерархия главной страницы

Дата: 2026-10-31. Выполняется только UX-03, зависимость UX-01 DONE. UX-02 сохранена, UX-04 не начата.

## Проверенные находки и изменение

До изменения после поиска и подборки 2–4 ночи шли коллекции без заголовка, повторные пояснения, бюджетная плашка, параллельные списки аэропортов/направлений и ещё одна flight-only плашка. Поиск и рекомендации уже были реализованы UX-01/02; второй поток похожих карточек не нужен.

Порядок теперь: основной поиск → текущая подборка перелётов на 2–4 ночи → коллекции → направления → планирование → три шага работы сервиса → руководства. Airport directory сохранён в раскрываемом списке после основных разделов. Коллекции ведут в отдельные существующие каталоги, а не дублируют карточки. Тип текущей подборки явно обозначен; рекомендации других длительностей не добавлялись. Направления не названы популярными: подтверждённых метрик для такого ранжирования не обнаружено, используются прежние данные/порядок registry.

Все прежние внутренние ссылки сохранены: city-break, weekend, Warsaw group, общий каталог, каждый airport/destination landing либо прежний locale-aware catalog fallback, калькулятор, price comparison, partners. Добавлены ссылки на saved, freshness и общий индекс руководств — существующие локализованные маршруты. Canonical, sitemap, API и routing policy не менялись. Flight-only предупреждение остаётся в рекомендациях, дублирующая нижняя плашка убрана. Описание планирования сохранено в одном разделе, образовательный текст сокращён до трёх шагов без обещания live availability.

Использованы прежние route-link-grid, Link, DealGrid и HomeOrigin. Нижние разделы остаются Server Components, без новых клиентских модулей, изображений или API-запросов: registry переиспользуется. У нижних Link отключён prefetch, аэропорты раскрываются нативным details. Это не lazy fetching: ссылки уже присутствуют в SSR HTML. Ускорение загрузки по метрикам не измерялось и не заявляется.

10 новых строк переведены PL/EN/RU/UK. Заголовки разделов связаны aria-labelledby; порядок DOM совпадает с визуальным, без CSS order. Клавиатурное раскрытие аэропортов сохраняет доступ к каждому маршруту. Новые стили ограничены home-page. Shared card internals, навигация сайта и данные не переписывались.

## Проверки

- `npm --prefix apps/web run test:unit`: 130 passed; unit cases для простой перестановки JSX не добавлялись.
- `npm --prefix apps/web run lint`: passed.
- `npm --prefix apps/web run build`: passed, TypeScript, 61 static/SSG pages. Generated next-env.d.ts возвращён к прежним dev imports; diff пуст.
- Первый browser run: 31/36, errors=[], 372.75 s. Команда: `node node_modules/@playwright/test/cli.js test home-hierarchy.spec.ts home-layout.spec.ts hero-search.spec.ts origin-selection.spec.ts localized-home.spec.ts --reporter=json`; [raw report](e2e.json).

Две PL failures нового spec были ошибкой теста: main содержит также price-comparison links внутри карточек. Счётчик ограничен нижними .home-section, сохранив все ссылки карточек. Две home-layout failures получили home URL с origin вместо перехода поиска при быстром заполнении; setup теперь явно ждёт завершённого выбора через существующий chooseOrigin. Это не исправление runtime race: быстрый ввод/submit во время незавершённого origin transition остаётся открытым наблюдением, причина в UX-03 не исследовалась. HomeOrigin/FilterForm не менялись. Ещё один desktop hero locale case не нашёл card в каталоге и достиг120s timeout; исправление cold-entry/API reliability не заявляется. Assertions search/filter/detail сохранены.

Финальный повтор: `node node_modules/@playwright/test/cli.js test home-hierarchy.spec.ts home-layout.spec.ts hero-search.spec.ts --grep 'search, offers|home layout comparison|all four languages' --reporter=json`; [результат](e2e-final.json). Итог: **12/12**, errors=[], unexpected=0, retries=0, 106.50 s. Включены все5 прежних failed cases; они прошли, но это не доказательство исправления API reliability или pending-origin race. Повторы не суммируются. После первого run в PL test добавлен только дополнительный screenshot обычной ширины; runtime во втором run тот же.

Новый home-hierarchy.spec проверяет четыре языка на desktop/mobile: порядок search/recommendations/collections/destinations/planning/how/guides, единственную подборку, все airport/destination SEO links по реальному synthetic registry, прежние важные routes, раскрытие клавиатурой, axe main, overflow320 и переход в работающий калькулятор. Остальные specs проверяют search/validation/pending, origin/cookie/Back/reload/drafts, locale/canonical/consent и layout.

Тесты — изолированная SQLite fixture и собственный .next в .cache/aud05-ux03[-final], Chrome headless, порты3125/8125; SDK PyCharm Python3.12.10. APP_ENV=test, DATABASE_URL=sqlite://, alerts/digest/editor/events sync выключены. Чужие3100/8100 не используются. [Source parity](source-parity.json): все546 runtime files совпали с checkout. Backend/PG/Ruff/mypy в UX-03 не запускались: Python/API runtime и fixture не менялись. Старые результаты этим проверкам не приписываются.

Это не production/device/WCAG certification, пользовательское исследование или доказательство роста conversion. Известная нестабильность cold direct catalog entry из UX-01/02 не является исправлением UX-03. Полный browser suite не заявляется проверенным.

Финальный visual repeat после явного scroll-to-top перед снимками: [2/2](e2e-visual.json), errors=[], 20.61s; повторяет PL desktop/mobile, не добавляет2 уникальных cases к12. Начальная попытка с anchored grep не выбрала тестов, фильтр исправлен. [Desktop](desktop.png) просмотрен. [Mobile](mobile.png) и [320px](narrow-320.png) fullPage captures содержат внизу повтор viewport-фрагмента; происхождение не установлено. Эти mobile артефакты не используются как доказательство корректного полного render. DOM/order/single-grid/320px overflow/axe/links/navigation assertions прошли. Это ограничение локального визуального evidence сохранено явно.

Финальные источники совпадают с isolated copy, собственные servers3125/8125 завершены; next-env.d.ts diff пуст. Сводка: [checks.json](checks.json). Пользовательские и прежние изменения сохранены.

## Release / rollback

Обычная согласованная web-сборка. Нет DB/API migration, новых dependencies, cookies, credentials, paid API или campaigns. Production не затрагивался. Rollback: вернуть только UX-03 page.tsx, home-copy.ts, scoped CSS и test setup/cases; сохранить UX-01/02 и предыдущие SEC/DATA/DEAL изменения. Удаление данных или cookie не требуется. Пользовательский master plan и IDE changes не изменялись.

UX-03 DONE в checkout. Остановка после UX-03; UX-04 не начата.
