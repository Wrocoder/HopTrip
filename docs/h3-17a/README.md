# H3-17a — изолированный браузерный baseline

2026-11-02, исходный HEAD `d928246561da713c4dd1f2a4c7fbdafb39a305ab`. **H3-17a DONE**, общий H3-17 **IN_PROGRESS**: замеры получены, performance gate не пройден из-за CLS. Следующая задача — H3-18a, не начата.

## Объём и результат

Использован существующий Playwright/axe и `docs/aud05/prepare-e2e.ps1`. Две отдельные копии в `.cache`: `aud05-h3-17a-20261102` (dev, 3125/8125) и `aud05-h3-17a-perf-20261102` (production build, 3126/8126). Собственные SQLite fixtures, тестовый operator, local-only partner redirects; исходные серверы 3100/8100 не переиспользовались и не останавливались. Fixture workers не отправляют реальные уведомления и не обращаются к event provider.

Добавлены только два тестовых файла: `apps/web/tests/h3-baseline.spec.ts` и `h3-lighthouse.spec.ts`. Первый записывает HTTP, canonical, h1, карточки, overflow, axe/incomplete, JS errors и screenshots; сохраняет диагностику даже при soft assertion failures. Второй запускает только явно переданный локальный Lighthouse CLI, по умолчанию skipped; требует loopback baseURL и `HOPTRIP_H3_PRODUCTION=1`. Пакеты из тестов не скачиваются. Lighthouse 13.6.0 был отдельно получен через npm exec cache, package.json/lock не менялись.

| Проверка | Итог | Доказательство |
|---|---|---|
| Existing E2E: local-flight-time, price-labels, roadmap-baseline | 14/14, desktop + mobile, 342.4s | [selected.json](selected.json) |
| Новая матрица, production build | 4/4 locale cases, 40 page visits, 200 width checks, 88.4s | [matrix-run.json](matrix-run.json), [summary.json](summary.json) |
| axe WCAG 2 A/AA, 2.1 AA, 2.2 AA | 40 scans на 390px, 0 violations; есть incomplete color-contrast | `baseline-*.json` в каталогах ниже |
| Overflow / runtime / внешняя сеть матрицы | 0 overflow на пяти ширинах; 0 pageerror; 0 external attempts | summary.json |
| Lighthouse | 4/4 отчёта без runtimeError/runWarnings, 48.3s; **не performance PASS** | [lighthouse-run.json](lighthouse-run.json), raw reports |
| Build/TypeScript | `npm run build` exit 0; 61 static entries. После добавления второго spec: `npx --no-install tsc --noEmit --incremental false` exit 0 | Локальная production-копия, без deploy |
| Lint | `npx --no-install eslint tests/h3-baseline.spec.ts tests/h3-lighthouse.spec.ts --max-warnings=0` exit 0 | Только изменённые tests |
| IDE build | success, но limited build diagnostics | Не заменяет реальные build/tsc выше |

Маршруты: `/`, `/deals`, `/tanie-loty-na-weekend`, `/city-break`, `/destinations/barcelona` (14 fixture offers), `/destinations/milan` (0 offers), `/deals/browser-deal`, `/saved` (пустое local storage), `/info/trip-budget`, `/alerts`. PL/EN/RU/UK. Barcelona не опубликована в переводах: `availableHref` сохраняет PL URL в трёх остальных locale cases; это **37 уникальных URL**, а не 40 переводных страниц. Weekend fixture выдача пустая — наличие успешного weekend-поиска этим sweep не проверено.

Ширины: 320/375/390/768/1440, height 900. Матрица выполняется один раз в desktop Chromium с изменением viewport; реальные touch emulation journeys — отдельные 7 mobile cases первого прогона. Это не проверка физических устройств или Safari. Скриншоты: 26 обзорных + 2 local-return. Примеры: [главная 320px](h3-baseline-H3-baseline-pages-and-widths-pl-desktop/pl-0-320.png), [детали desktop](h3-baseline-H3-baseline-pages-and-widths-pl-desktop/pl-6-1440.png). Эти два изображения просмотрены вручную: CTA и блоки доступны, горизонтального выхода нет; страница деталей длинная. Offscreen lazy images на full-page снимке не считаются доказательством сломанной загрузки.

Первый E2E-прогон подтвердил видимый `+1 dzień`, сохранение ручных сумм через reload/share, expired shared-plan warning, keyboard open/close/focus score dialog, 4 locale copy, 320px dialog overflow, history/origin persistence и detail back-link. Это scoped baseline, не весь suite.

## Производительность: установленный дефект, а не регрессия H3

Lighthouse 13.6.0 / HeadlessChrome 156, локальная production-сборка, synthetic SQLite, один прогон на комбинацию; standard mobile simulated throttling и desktop preset. UI согласия в начальном состоянии, без принятия optional consent. HTTPS-ресурсы блокированы в lab; матрица также ограничена loopback. Это не реальная CDN/production latency и не реальная частота проблемы.

| Страница | Режим | Performance | Accessibility | LCP, с | CLS | TBT, мс |
|---|---|---:|---:|---:|---:|---:|
| / | mobile | 85 | 100 | 0.944 | **0.292** | 107.5 |
| / | desktop | 95 | 100 | 0.308 | **0.137** | 7 |
| /deals | mobile | 84 | 100 | 0.922 | **0.289** | 124 |
| /deals | desktop | 94 | 100 | 0.301 | **0.155** | 0 |

**H3-17-F01 / CONFIRMED / P1:** CLS выше 0.1 во всех четырёх lab reports. `audits.layout-shifts` указывает `body > div#content`. Возможная связь с появлением consent UI после hydration — гипотеза, не установленная причина. H3-17b должна локализовать shift по trace и сравнить denied/unset consent, загрузку шрифтов и SSR/hydration, затем исправить минимально и измерить до/после. В этой baseline-подзадаче CSS/consent/rendering не менялись. LCP ниже 2.5s в данном lab не доказывает полевые CWV; INP и p75 не измерялись.

Raw reports: [home mobile](h3-lighthouse-H3-Lighthouse-mobile-desktop/lighthouse.json), [home desktop](h3-lighthouse-H3-Lighthouse-desktop-desktop/lighthouse.json), [deals mobile](h3-lighthouse-H3-Lighthouse-deals-mobile-desktop/lighthouse.json), [deals desktop](h3-lighthouse-H3-Lighthouse-deals-desktop-desktop/lighthouse.json). JSON содержит настройки throttling, даты, сетевую диагностику и причины оценок.

## Повторение

1. Получить Python SDK через `python-tools/get_python_environment`; задать `HOPTRIP_TEST_PYTHON` абсолютным путём. В этом запуске `.venv/Scripts/python.exe`, Python 3.12.10. Chrome через `PLAYWRIGHT_CHANNEL=chrome`.
2. Из корня выполнить `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-<unique-name>` и **дождаться завершения**. Скрипт не перезаписывает существующий каталог. В копии заменить 3125/8125 на свободные loopback порты в config/fixture/specs, если нужно. Default reuseExistingServer=false сохранить.
3. В копии `apps/web`: `npm run test:e2e -- local-flight-time.spec.ts price-labels.spec.ts roadmap-baseline.spec.ts --reporter=json`. `PLAYWRIGHT_JSON_OUTPUT_NAME` задаёт отдельный output. До нового прогона сохранить нужные test-results: Playwright очищает эту папку.
4. Для production-проверок в отдельной копии задать HOPTRIP_API_URL/NEXT_PUBLIC_API_URL на fixture API, NEXT_PUBLIC_SITE_URL на web, HOPTRIP_OPERATOR_FILE на `tests/fixtures/operator.json`. Выполнить `npm run build`. Только в копии config заменить `npm run dev --` на `npm run start --`. Next выводит warning о standalone: замер здесь сделан через `next start`, не deployment Docker/standalone runtime; это явное ограничение воспроизводимости.
5. `npm run test:e2e -- h3-baseline.spec.ts --project=desktop --reporter=json`. Сохранить test-results и JSON reporter.
6. Отдельно установить/получить CLI через `npm exec --yes --package=lighthouse@13.6.0 -- lighthouse --version`, затем задать `HOPTRIP_LIGHTHOUSE_CLI` на его `cli/index.js`, `CHROME_PATH` на Chrome и `HOPTRIP_H3_PRODUCTION=1`. `npm run test:e2e -- h3-lighthouse.spec.ts --project=desktop --reporter=json`. Тест сам не делает install. Все четыре замера последовательны, после окончания matrix, без параллельного build.
7. Скопировать JSON/PNG в новый каталог evidence с теми же относительными именами; `node docs/h3-17a/summarize.mjs` пересчитывает summary текущего набора. Для нового набора скопировать summarize рядом, не перезаписывать исторический baseline.

## Ограничения и первоначальные неудачи

- Первая попытка build performance-копии стартовала до завершения prepare: operator fixture и next ещё отсутствовали. После завершения копирования повторная сборка прошла; первая попытка не считается успешной.
- Одна попытка команды build не стартовала из-за таймаута automatic approval review; разрешённый повтор прошёл. Никакого обхода ограничений или запуска чужих процессов не было.
- Ошибка Copy-Item с относительным путём из apps/web исправлена повторным копированием из корня до запуска Lighthouse. Исходники приложения не затронуты.
- Не проверены весь E2E suite, WebKit, физическая клавиатура/экранный диктор, ручная оценка всех color-contrast incomplete, реальные provider redirects/notifications, production PostgreSQL/нагрузка, RUM/INP, GSC и полная H3 cross-cutting matrix.
- `/saved` здесь пустой; полноценный Save/Update/Duplicate lifecycle остаётся H3-12. Existing local-flight-time проверяет share/reload, но не весь saved lifecycle. Alerts проверяются на fixtures; результат не разрешает production signup/delivery.
- API, DB schema/migrations, URL/SEO/локализация, dependencies и бизнес-поведение не менялись. Deployment не выполнялся. Rollback: удалить два новых test spec и H3-17a evidence; production откат не требуется. Существующие IDE и пользовательские документы сохранены.

Остановка после H3-17a. H3-17b остаётся открытой, H3-18a — следующая отдельная задача.
