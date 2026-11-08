# V4-13 — мобильная и accessibility-приёмка

Дата: 2026-11-08. **DONE локально**. Выполнена только V4-13; V4-14 не начиналась.

## Результат

Проверена текущая рабочая копия после V4-01–12, включая существующие изменения. Новых подтверждённых дефектов интерфейса, требующих изменения приложения, не найдено. Production-код, API, модели, маршруты и зависимости в этой задаче не менялись.

- Responsive baseline: 10 маршрутов × PL/EN/RU/UK × **320, 375, 390, 768, 1440 px** = **200 проверок геометрии**, 40 страниц с axe на исходной ширине 390. Нет overflow, ошибок ресурсов/HTTP/runtime и axe-нарушений. Опубликованные PL-only destination URLs сохраняются.
- Новый `v4-responsive.spec.ts`: **20 сценариев**, три состояния в каждом — фильтры и открытый диалог, бюджет, сохранённый редактор. Все пять ширин и четыре языка, **60 axe/overflow-проверок**. Проверены Escape, возврат фокуса, отправка формы и готовность сохранённого плана.
- Accessibility review: desktop и mobile 320px; имена/описания контролов, размеры кнопок, ссылки ARIA, modal и фокус, reduced motion, forced colors, валидация, планирование и удаление событий, сохранение; ARIA snapshots и targets сохранены в a11y/.
- Contrast review: 10 маршрутов × 4 локали. Сохранены все axe incomplete и отдельная оценка допустимых случаев; градиенты оцениваются консервативно. Негативные контроли обнаруживают плохой контраст и неподдержанное смешивание.
- Layout stability: **64 замера** (4 локали, desktop/mobile, home/catalog, consent unset/denied, два повтора с задержками скриптов и шрифтов). Максимальный CLS **0,021541**, ниже 0,1. Панель согласия проверена также при высоте 480px на пяти ширинах, с клавиатурой и axe. Планирование/shared/local navigation покрыто trip-sections.

## Изменения и история отказов

1. `h3-baseline.spec.ts`, `layout-stability.spec.ts`, `contrast-review.spec.ts`: production guard читает реально выбранный CLI config через TestInfo, проверяет start/production и BUILD_ID. Раньше он импортировал основной dev-config и мог отвергать правильный изолированный production runner. В evidence сохраняются путь и текст выбранного config.
2. `accessibility-review.spec.ts`: после сохранения ожидаются URL редактора и локализованное saved state перед переходом к списку. Старый сценарий на UK desktop воспроизвёл ERR_ABORTED из-за конкурирующих переходов. Повтор всех четырёх локалей на desktop — **4/4 PASS**.
3. В mobile UK каталог один раз показал штатное состояние недоступности данных, поэтому тест карточки упал. Health API после этого — 200. Изолированный повтор того же теста — **1/1 PASS**. Причина временной недоступности не установлена; дефект приложения не объявляется исправленным. Ошибка и повтор сохранены. Это ограничение стабильности локального тестового окружения, а не скрытый успешный первый прогон.
4. Добавлен `v4-responsive.spec.ts`; существующие сценарии переиспользованы. Редизайн не потребовался.

История прогонов:

| Прогон | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| Baseline + исходный Lighthouse, desktop | 8 | 0 | 0 |
| Desktop интерактивный, первый | 40 | 1 | 0 |
| Desktop accessibility после исправления | 4 | 0 | 0 |
| Mobile интерактивный, первый | 15 | 1 | 0 |
| Mobile UK, изолированный повтор | 1 | 0 | 0 |
| Финальный Lighthouse | 4 | 0 | 0 |

По последним результатам каждого случая — **65 уникальных PASS**. Это итог нескольких явно перечисленных прогонов, а не один чистый прогон 65/65. Автоматические retries выключены; ручные повторы не скрываются значением flaky=0 в Playwright JSON.

## Lighthouse и Core Web Vitals

Уже установленный Lighthouse 13.6.0, Chrome headless, локальный production runtime, loopback API с синтетическими данными. Внешние HTTPS запросы блокированы. Четыре последовательных замера до и после приёмки; финальные — после свежей сборки. App sources между ними не менялись. Сравнение показывает вариативность лабораторного запуска, не эффект исправления приложения.

| Страница / профиль | Performance до → после | LCP, мс до → после | CLS до → после | TBT, мс до → после |
|---|---|---|---|---|
| Главная / mobile | 100 → 98 | 856 → 1175 | 0 → 0 | 45 → 149 |
| Главная / desktop | 100 → 100 | 246 → 265 | 0,02569 → 0 | 0 → 8 |
| Каталог / mobile | 98 → 99 | 1087 → 1074 | 0 → 0 | 73 → 100 |
| Каталог / desktop | 100 → 100 | 383 → 399 | 0 → 0 | 10 → 2 |

Accessibility — **100** во всех восьми Lighthouse-замерах. Точные значения/предупреждения — lighthouse-comparison.json; полные отчёты — lighthouse/.

LCP/CLS проверены лабораторно. TBT не называется INP. Полевые CWV/INP, WebKit (не установлен), физические устройства и ручная сессия со screen reader не выполнялись и остаются внешней проверкой при наличии окружения/данных. Автоматические axe/ARIA/keyboard проверки не являются сертификатом WCAG или пользовательским исследованием V4-14.

## Проверки и воспроизведение

**Node 379 PASS**, 0 skipped; ESLint, TypeScript и свежий production build — PASS. API/Python тесты не запускались: исходники API не менялись. Перед запуском fixture-сервера SDK получен через get_python_environment. Пакеты и браузеры не устанавливались.

Из apps/web: HOPTRIP_TEST_PYTHON — полный путь SDK .venv/Scripts/python.exe, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_H3_PRODUCTION=1. Все browser-команды используют `--config playwright.production.config.ts --reporter=json` и отдельный --output:

```text
npx playwright test --config playwright.production.config.ts tests/h3-baseline.spec.ts tests/h3-lighthouse.spec.ts --project=desktop
npx playwright test --config playwright.production.config.ts tests/v4-responsive.spec.ts tests/accessibility-review.spec.ts tests/layout-stability.spec.ts tests/contrast-review.spec.ts tests/trip-sections.spec.ts --project=desktop
npx playwright test --config playwright.production.config.ts tests/accessibility-review.spec.ts tests/layout-stability.spec.ts tests/trip-sections.spec.ts --project=mobile
```

Lighthouse дополнительно требует HOPTRIP_LIGHTHOUSE_CLI и CHROME_PATH; test не скачивает CLI. Build выполнялся с loopback API/site URL и tests/fixtures/operator.json. Серверы изолированы, reuseExistingServer=false.

Evidence: verification.json, browser-*.json, responsive-baseline.json, responsive-states.json, layout-metrics.json, a11y/, lighthouse-comparison.json, lighthouse/, node.txt, lint.txt, typecheck.txt, build.txt, saved-320.png и saved-1440.png. Производственная БД, deployment, уведомления и внешние сообщения не затрагивались. Остановка после одной задачи; следующая — V4-14 отдельным выполнением.
