# DEAL-06 — сравнение цены вместо заметной балльной оценки

Дата:2026-10-31. Только DEAL-06, зависимости AUD-02/DATA-02 DONE. DEAL-03 не начата.

## Проверенные исходные условия

Карточки уже показывали точную разницу в PLN относительно медианы, равенство или «близко» при разнице менее1PLN; крупного видимого score badge не было. Но польское accessible name включало `76/100`, collapsed calculation summary показывал число, а остальные языки вели сразу на detail вместо общего диалога. Число наблюдений было внутри дополнительного раскрытия. Эти различия устранены без изменения расчёта.

Изучены backend score/statistics contracts и snapshot validation, PriceSummary/PriceAssessment/ScoreTrigger/ScoreDetails, существующие unit/browser tests и установленная Next документация Server/Client Components. Разбивка60/25/15, minimum5 observations, history saturation30 и expiry policies остаются прежними. Detailed methodology и сохранённые point parts не переписывались.

## Почему нет новых границ «значительно дешевле»

[Read-only public review](public-distribution-review.json): один GET публичного catalog API вернул100 из221 опубликованных offers;77 CURRENT и23 PROVISIONAL. Для77 CURRENT размер сохранённых samples: min5, Q1=9, median15, Q3=28, max107. Signed difference percentages: min−24.07, Q1−2.52, median0, Q3=7.60, max64.29. Это snapshot первых100 результатов ранжированной выдачи, а не вся история и не распределение рынка. Percentiles вычислены линейно по позиции(n−1)×q, только для описания этого snapshot.

API не раскрывает распределения observations внутри каждой route cohort, их независимость или confidence intervals. Перенос квартилей ранжированных offers в «значительность» отдельной цены был бы неподтверждённым. Пятиуровневая шкала оценена и отклонена в пользу нейтральной точной разницы: ниже/на уровне/выше медианы и явно недостаточных данных. Новых процентных порогов выгодности нет. Существующее «разница менее1PLN после округления до grosz» — точность сообщения, не статистический интервал «обычной» цены. Minimum5 — действующее правило методики, не доказательство репрезентативности или независимости наблюдений.

Production DB не открывалась. Публичный GET не запускал ingestion, продавцов, paid APIs, cookies или кампании; сохранены только count/percentage aggregates без affiliate URLs, пользовательских данных и credentials. Сам endpoint читает опубликованные данные; deployment state не изменялся.

## Изменения для пользователя

- Card и detail PriceSummary сохраняют точную разницу. Для согласованного CURRENT comparison видны число наблюдений и ограничение: выборка направления, не одинаковых тарифов или всего рынка. Scope получает count через тот же validated helper; PROVISIONAL/LEGACY/UNAVAILABLE и несовпадающая цена не получают current sample label.
- Предварительная summary теперь прямо говорит о недостатке данных для сравнения цены. Legacy summary говорит об обновлении прежней методики, без формулировки «оценка поездки». Статусы и полное объяснение старого/предварительного score сохранены.
- Число наблюдений и sufficiency в PriceAssessment видно до раскрытия scope. Подробный UTC cohort, repeated/current observations, fare/airport differences, freshness и ограничения остаются доступны.
- Общий ScoreTrigger работает на PL/EN/RU/UK: локализованные label/title/dialog/close, без балла в accessible name. Обычный click/Enter открывает explanation на месте; Escape/close возвращает focus. Ctrl/Meta/Shift/Alt сохраняют native link behavior; настоящий localized href включает прежний returnTo и #score.
- Collapsed calculation summary называет вспомогательный результат сортировки без числа. Сам `76/100`, exact parts, rounding, saved calculation time и legacy explanation остаются внутри раскрытия. Явное пояснение, что score не оценивает airline/comfort/purchase probability, сохранено.

API/DB/schema, statistics/score formulas, stored ordering, sorting options, цены/observation provenance, affiliate click handler, SEO metadata и search/cookie/navigation handoff не менялись. CSS и dependencies не добавлялись.

## Проверки

- [Node unit](unit.txt):156 passed,3 новых cases: validated visible sample scope на4 языках/разных n; отсутствие current label для неподтверждённой базы; отсутствие numeric rating во входе и collapsed heading.
- Первый [unit run](unit-initial.txt):155/156. Existing translation harness не передавал новый destination placeholder. Он дополнен значением destination; проверки чисел/placeholder parity/полноты методологии сохранены, финальные156/156 passed. Это не red phase формулы.
- [ESLint](lint.txt) и [build](build.txt):passed, TypeScript и61 static/SSG pages. Backend/PG/Ruff/mypy не запускались: Python/API/fixture не менялись.
- Основной [browser набор](e2e.json):20/20 passed, unexpected0, errors=[], retries0,129.70s. Новые8 cases — четыре языка×desktop/mobile, visible scope, optional unchanged arithmetic, keyboard/focus, localized native new-tab returnTo, no advantage for insufficient/legacy/missing data, axe и320px. Existing scoring/insufficient/full methodology/actual affiliate session-sub_id flows также прошли.
- Дополнительный [card набор](e2e-cards.json):15/16, unexpected1, errors=[],170.04s. [Desktop compact case](initial-compact-desktop-error.md) получил API error до dimensions; причина не установлена. Остальные card quality/expiry/midnight/long names/trip-details scenarios прошли, full suite pass не заявляется.
- [Первый focused repeat](e2e-final.json):1/2,19.22s. Новый comparison case прошёл; compact case дошёл до проверки цены и получил1210.22px вместо<900: над выдачей раскрыты date/stay filters DEAL-02. [Контекст](compact-before-scroll-error.md). Test setup теперь достигает первой карточки перед проверкой её viewport content, без изменения900/730 bounds или assertions. Legacy PriceSummary count0 expectation также обновлён под существующий DEAL-01 visible summary. Это адаптация setup, не исправление API reliability.
- Финальный [targeted repeat](e2e-acceptance.json):2/2 passed, unexpected0, errors=[], retries0,19.88s. Compact desktop с<900 viewport/<730 height, unchanged warning/keyboard/long-name/axe assertions и PL comparison case прошли. Все ранние failed cases перепроверены; общая API reliability не объявляется исправленной. Повторы не суммируются. Screenshot-only дополнение нового spec и изменённый compact setup отдельно прошли ESLint.
- [Source parity](source-parity.json):549 runtime-файлов apps/api/app + apps/web/src isolated copy совпали с checkout. Собственные SQLite/.next,3125/8125, PyCharm SDK, disabled real delivery/editor/sync. Existing fixture не менялась. [Финальная сверка](verification.json): JSON/links/whitespace passed, next-env.d.ts без diff, guide/CSS побайтно совпадают с pre-task snapshot.

Static команды из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. После окончания build подготовить новую копию: `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-deal06-new`. Перед Python toolchain/fixture invocation получить SDK через PyCharm get_python_environment. В копии apps/web задать HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite:// и ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Не запускать build одновременно с browser. Cases выбираются точными regex имён файлов; полный suite не запускался.

Просмотрены [карточка](comparison-card.png) и [диалог320px](comparison-320.png): count/scope читаются, numeric calculation виден после раскрытия; content прокручивается внутри dialog.

## Release / откат / ограничения

Release согласованным web bundle; прежние backend prerequisites roadmap сохраняются. Откат только DEAL-06 изменений в catalog/PriceAssessment/ScoreTrigger/ScoreDetails, price-assessment helper, score-copy и соответствующих tests. Не восстанавливать весь HEAD: checkout содержит предыдущие задачи и пользовательские изменения. DB/cookie/localStorage cleanup не нужен; миграций и пересчёта нет.

Headless Chrome/mobile emulation с synthetic data не подтверждает реальное понимание пользователей, conversion или полное WCAG соответствие. Проверены доступность explanation и честность сообщения; usability research не проводилось. Публичная выборка не является статистической калибровкой категории «значительно». Предыдущие API/cold-entry observations остаются открытыми. Production/credentials/реальные campaigns не менялись.

DEAL-06 DONE. Progress/Audit/Decisions/Test Plan обновлены. JSON/links/whitespace и source parity проверены; next-env.d.ts без diff, свои3125/8125 завершены. Чужие3100/8100, пользовательские master plan/IDE и предыдущие задачи сохранены. DEAL-03 не начата; остановка.
