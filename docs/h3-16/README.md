# H3-16 — общая методика без повторов в каждом предложении

Дата: 2026-11-04. **H3-16 DONE** по локальным acceptance. Задача ограничена подтверждёнными повторами общей методики цены; API, аэропортовые правила и планирование не меняются. Следующий отдельный запуск — H3-09. H3-16 не используется как разрешение на общий редизайн или скрытие существенных ограничений.

## Что подтвердилось до изменения

Rendered baseline: четыре locale ×desktop/mobile, по1 и12 предложений; [8 browser cases](baseline.json), [лог](baseline.txt), [before screenshots/metrics](before/). Число1 получено реальным API-фильтром budget200.25; baseline и after сняты в одинаковом dev runtime/viewport, с document.fonts.ready и одинаковыми fixtures.

Гипотеза «длинные определения загромождают закрытую карточку» **NOT REPRODUCED**: все длинные grouping paragraphs скрыты details/dialog. При этом реальное раскрытие подтверждает повтор: одно общее определение в TripDetails, ещё одно в PriceAssessment диалога и ещё одно в его scope disclosure. В выдаче из12 карточек —36 экземпляров одного длинного определения в DOM, не36 видимых абзацев. В диалоге — два разных дополнительных disclosure для одной общей методики. Эти определения не являются уникальными данными предложения.

Скриншоты раскрытой карточки и диалога просмотрены до выбора изменения. Медиана, sample count/threshold, observation timestamp, expiry/source metadata и предупреждения — конкретные данные/условия; их не переносим на общую страницу. Материальные airport/estimated/unknown/price inclusion/availability warnings остаются видимыми по существующим правилам.

## Изменение

- PriceAssessment сохраняет все per-offer данные; длинное встроенное grouping раскрытие заменено обычной локализованной ссылкой «Полная методика сравнения цен» на существующий `/info/price-comparison`.
- ScoreDetails сохраняет summary/samples/observation, индивидуальный расчёт и cautions. Повторный scope/grouping/exclusions disclosure удалён. Внутренний PriceAssessment получает includeMethodologyLink=false, поскольку тот же ScoreDetails уже имеет одну общую ссылку на методику. В диалоге/секции остаётся один доступ к ней.
- Общий exclusions paragraph перенесён в первую секцию уже существующей страницы методики PL/EN/RU/UK через прежний scoreText; grouping/currency/example/weights/history/freshness текст сохранён. Обновлена review date этой изменённой страницы на2026-11-04. Ни смысл исключений, ни фраза о независимости оценки от affiliate commission не потеряны. Новых пользовательских переводов/терминов не понадобилось.

Native details для индивидуального расчёта и TripDetails, dialog keyboard/Escape/focus-return, fallback href на detail#score и стандартные help links сохранены. Общие airport method/source descriptions не трогались: они объясняют новые ограничения H3-08, а не подтверждённый повтор median method. Provider/source timestamps и material warnings не сокращались. Existing Card/Grid/ScoreTrigger/guide reused, новых tooltip/dialog/state managers нет.

## Измерения и границы

[16 пар before/after](comparison.json), каждая4locale×2device×1/12offers:

- Collapsed card height delta **0px** во всех парах: не заявляется улучшение уже компактного первого экрана H3-06.
- Expanded card delta **−209.5…−254.3px** после удаления встроенного общего определения, которое пользователь мог раскрыть. Before показывал раскрытую inline methodology; after — ссылку на полную методику. Это сравнение размещения объяснения, а не потери самого текста.
- Dialog initial height delta **−105.1…0px**. Ноль на ограниченных viewport объясняется существующим max-height; это не гарантия сокращения высоты везде. Два method disclosures заменены одним link. Индивидуальный calculation disclosure отдельно сохранён.
- Grouping copies внутри .deal-grid: **3→0** для1card, **36→0** для12cards. Определение остаётся SSR-текстом страницы методики. Это счётчик конкретного повторяющегося абзаца, не общее число технических текстов.

Это локальная геометрия/DOM и проверки взаимодействий, не production KPI/CWV или доказанное улучшение конверсии. Фильтры, prices/sort, API contracts, источники/thresholds, saved v1/share/budgets, consent/events/affiliate/SEO URLs не менялись; новых зависимостей/миграций/feature flags нет. Общая страница сохраняет index/follow, locale canonical/hreflang и уникальный контент предложения остаётся SSR.

## Проверки

- **252 Node passed**, [лог](node.txt), включая общий price-guide, score rules/translations и API contracts. Test section counts updated3→4 из-за сохранённого exclusions paragraph; numeric rules/examples intact.
- ESLint pass, [лог](lint.txt); production npm build/TypeScript pass, [лог](build.txt),61 static entries. IDE build success с limited diagnostics. Backend runtime не менялся: API suite/Ruff/mypy не повторялись, последний backend evidence1092/18skip/mypy122 относится к08a.
- Baseline **8 passed**, after **8 passed**, [after JSON](after.json), [лог](after.txt). Keyboard native disclosures, actual visible state before classification, one/many offers, dialog focus/Escape/calculation, method help navigation,4locale/320px, axe dialog, guide index/canonical. Screenshots и per-case metrics сохранены в before/after directories.
- Production: initial **31 passed /9 failed** из40, [JSON](production.json), [лог](production.txt). Восемь новых SSR tests сначала имели тот же scope конфликт hidden dialog/TripDetails. После исправления1/8 прошёл, остальные остановились на pointer stability при прокрутке к#score ([повтор](ssr-repeat.json)); заменено тестовое pointer взаимодействие на проверяемые native keyboard focus/Enter. **Финальный SSR/no-JS набор8/8 passed**, [JSON](ssr-final.json), [лог](ssr-final.txt). Это test harness fixes, приложение ради них не менялось. Проверены native details, trigger fallback на detail#score, индивидуальный расчёт, help link и полный grouping/exclusions в реальном HTTP HTML ответа.
- Принимаются **39 уникальных production cases** из40 после исправления harness; material warnings/airport source context, прежние dialogs/price states и translated guide/score успешны. Оставшийся desktop first-price geometry test — подтверждённый pre-existing failure, отдельно ниже. Manual screen reader hardware/software session, WebKit, весь сайт, CWV и production usability не проверялись; axe/семантика/focus не выдаются за ручную SR-проверку.

[8 SSR HTML snapshots](ssr/) извлечены из attachments финального JSON, сохранены отдельно для проверки индексируемого текста без доступа к cache runtime.

### Сохранённый pre-existing failure, H3-17b

compact-catalog desktop требует нижнюю границу первой цены <900px на1366×900; получено **1004.140625px**. Это не замалчивается и не заменяется более слабым assertion. Отдельный запуск того же неизменённого теста на **неизменённой production-сборке H3-08b до текущей задачи**, в изолированных3126/8126, дал **точно1004.140625px**. [Baseline JSON](price-layout-baseline.json), [лог](price-layout-baseline.txt), [build IDs/hashes](known-layout-baseline.json), [два исходных компонента до H3-16](before-runtime/). Никакие старые исходники/серверы для этого probe не переписывались; создан отдельный Playwright config с заменой только портов. Browser snapshot before/after также показывает collapsed delta0. Это открытый вопрос первого экрана каталога H3-17b, не новая регрессия H3-16 и не выполненное исправление. H3-16 не требует менять общий layout фильтров/первого экрана.

Первые два baseline запуска выявили ошибки нового test harness, не приложения: budget200 исключал fixture200.25, затем локаторы не различали PriceAssessment внутри TripDetails и скрытого dialog. [Initial](baseline-initial.json), [scope](baseline-scope.json) сохранены. Исправлены точная цена фильтра и scope локаторов; чистый baseline8/8 снят **до изменения runtime копии**. Не скрываем промежуточные failures и не считаем их подтверждёнными product defects.

Existing price-labels assertions согласованы с compact label H3-06, без изменения runtime ради теста. Localized-editorial tests теперь проверяют exclusions на методике и актуальную review date, вместо прежнего repeated scope. Все новые тексты — прежние переводы.

## Воспроизведение и откат

Изолированная `.cache/aud05-h3-16-20261104`,3125/8125, SQLite, SDK Python3.12.10 после python-tools preflight, Chrome. Подготовка prepare-e2e.ps1 с явной копией airport-city registry JSON и двух untracked Python fixture modules. App/runtime для baseline скопирован до edits; после8/8 в копию перенесены только изменённые файлы. Pair runs используют `HOPTRIP_EXPLANATIONS_PHASE=before/after`, `npm run test:e2e -- h3-explanations.spec.ts --reporter=json`. В корневом apps/web — npm run test:unit/npm run lint. После pair runs в копии npm run build и config npm start вместо dev для production regression. JSON outputs указываются через PLAYWRIGHT_JSON_OUTPUT_NAME; HOPTRIP_TEST_PYTHON SDK, PLAYWRIGHT_CHANNEL=chrome. Старые серверы/порты не переиспользованы и не остановлены.

Откат — вернуть только H3-16 delta двух price components, additions exclusions/review date в content/price-guide и связанные test changes/evidence. Сохранить предыдущие H3-04 price/currency/ranking paragraphs, H3-06 compact cards и H3-07/08 данные/предупреждения. Не сбрасывать общие файлы целиком. Production, реальные affiliate transitions/отправки, PR/commit/deploy не выполнялись. После обновления progress/decisions — остановиться перед H3-09.
