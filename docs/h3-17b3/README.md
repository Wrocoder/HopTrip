# H3-17b3 — автоматизированная проверка маршрутов и критических сценариев

2026-11-05. Часть H3-17 по §1.2 V3; H3-14/18 не начинаются. Scope: свежая production-матрица маршрутов, ресурсов/изображений/версии сборки, axe/keyboard и существующие Chromium desktop/mobile journeys. Поведение приложения не меняется. WebKit/manual screen reader/физические устройства и полевые CWV проверяются только при фактической доступности.

## Изменение тестов и первичная диагностика

Расширен существующий `apps/web/tests/h3-baseline.spec.ts`, без нового фреймворка или дублирующего route suite. Сохранены 10 маршрутов×4locale и320/375/390/768/1440px,height900. Добавлены production command/NODE_ENV/served SSR BUILD_ID guards, успешная загрузка выбранных lazy images до/после responsive resize, их размеры/alt/loading/sizes/srcset, сетевые ошибки и ResourceTiming, published locale и keyboard skip-link→#content. Данные записываются и при failures. В default dev режиме production guard не включается; прежний baseline остаётся доступен.

Первый прогон [3/4](matrix-initial.json) остановился на новом asset assertion: `/info/trip-budget`, `/_next/image`, `net::ERR_ABORTED`. [Raw данные и screenshots](matrix-initial-artifacts), [лог](matrix-initial.txt). Browser отменил прежний responsive image request при смене viewport; выбранное изображение успешно загрузилось, HTTP errors/pageerrors/axe/overflow отсутствовали. Это диагностическая классификация сетевого события, не исправление приложения. Тест теперь сохраняет только image ERR_ABORTED в отдельном assetCancellations, не исключает отмены scripts/fonts/styles, требует complete+naturalWidth>0 для выбранных изображений в обоих размерах. Ошибки HTTP/остальные failures по-прежнему проваливают тест. Повтор всего изменённого baseline файла оправдан новой проверкой загрузки после resize.

## Результаты

**H3-17b3 DONE (автоматизированный scope); H3-17 IN_PROGRESS.** [Verification](verification.json), [source parity](source-parity.json). Новая production-сборка **B03jo9a_4GShaLeB8HAfD**; served SSR ID проверен4mode attachments. Runtime delta против17b2 **0**, 635 runtime/dependency/fixture files совпадают с workspace/copy и предыдущим runtime;6test files совпадают после единственной нормализации test ports. Единственный изменённый test source — существующийh3-baseline.

| Проверка | Итог | Evidence |
|---|---|---|
| Production route matrix |4/4locale cases,40route visits/37unique URLs,200width checks,40axe scans,40keyboard skip-link checks;0overflow/violations/pageerror/external attempts/HTTP errors/failed assets |[run](matrix.json),[raw/screens/resources](matrix-artifacts) |
| Lazy/responsive images |148observations,selected images complete+naturalWidth>0;dimensions/loading/sizes/srcset сохранены;after resize повторная проверка загрузки. Final image cancellations:0 |raw records |
| Critical journeys |38/38first-run,desktop+mobile:midnight itinerary/manual budget/reload/share;price sample/keyboard dialog focus/Escape;origin/history/back;4locale Save/Update/Duplicate/Delete/Undo/Share;conflicts/locks/concurrent edits/expiry/storage/capacity/recovery |[run](journeys.json),[log](journeys.txt),[artifacts](journey-artifacts) |
| Historical cross-tab scenario |2/2first-run,desktop/mobile,unchanged test/timeout/retries;Delete/Undo/another-tab Save и синхронизация. Это успешная перепроверка текущей версии, не установленная причина11a |[run](cross-tab.json),[log](cross-tab.txt) |
| Node/lint/types/build |314/314Node,new build/full lint/final affected lint/final TypeScript PASS;IDE success with limited diagnostics |[Node](node.txt),[build](build.txt),[lint](lint.txt),[final lint](lint-final.txt),[types](types-final.txt) |
| WebKit |UNAVAILABLE,executable absent;probe executed,no browser download |[probe](browser-availability.json) |

Итого **44 уникальных production browser cases PASS**,retries/skips/flaky0 в принятых runs. Initial matrix3/4 и classification correction сохранены отдельно, не переписаны в PASS. API/Ruff/mypy не повторялись:Python production/test fixtures не менялись. Git diff whitespace проверен для delta spec;нет runtime/API/schema/DB/SEO/copy/consent/analytics/affiliate/storage/dependency изменений.

На28route visits axe оставил color-contrast incomplete;это ручная оценка,не нарушение и не подтверждённый PASS. Визуально просмотреныPL Milan320px иflight detail1440px full-page screenshots:нет горизонтального выхода,основные секции/материальные warnings/partner CTA сохранены;это не полное visual diff всех состояний.

[Asset inventory](asset-inventory.json):29JS/4CSS/2WOFF2,1796977bytes на диске (не compressed wire). ResourceTiming для каждого route сохранён;это не измерение field CWV/INP/cache policy или доказательство ускорения. Поиск production logs не обнаружил прежний conditional-use diagnostic в текущих scoped runs;dev cause не исследовалась.

## Стенд, команды и воспроизведение

Свежая `.cache/aud05-h3-17b3-20261105`, `prepare-e2e.ps1 -WorkspaceName aud05-h3-17b3-20261105 -Production`, fixtures и synthetic operator из17b2; собственный SQLite/API8125/web3125, reuseExistingServer=false. Внешняя сеть route matrix блокируется и записывается. Production API/данные/флаги и существующие серверы не изменялись.

Получен PyCharm SDK через python-tools: Python3.12.10, `.venv/Scripts/python.exe`. Перед каждым CLI с Python fixture — повторный preflight. Build env HOPTRIP_API_URL/NEXT_PUBLIC_API_URL=http://127.0.0.1:8125, NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125, HOPTRIP_OPERATOR_FILE=absolute tests/fixtures/operator.json.

```text
npm run build
# HOPTRIP_TEST_PYTHON=<SDK executable>, PLAYWRIGHT_CHANNEL=chrome,
# HOPTRIP_H3_PRODUCTION=1; PLAYWRIGHT_JSON_OUTPUT_NAME=<unique report>
npm run test:e2e -- h3-baseline.spec.ts --project=desktop --trace=off --reporter=line,json
npm run test:e2e -- local-flight-time.spec.ts price-labels.spec.ts roadmap-baseline.spec.ts plan-lifecycle.spec.ts --trace=off --reporter=line,json
npm run test:e2e -- saved-trip-workflow.spec.ts --grep "storage events keep two tabs" --trace=off --reporter=line,json
npm run test:unit
npm run lint
npx --no-install eslint tests/h3-baseline.spec.ts --max-warnings=0
npx --no-install tsc --noEmit --incremental false
```

До каждого следующего Playwright сохранены test-results в отдельный каталог. Пакеты/браузеры не скачивались. Build и browser mode проверяются отдельно. Логи lint/types без ошибок могут быть пустыми; exit codes проверены.

## Границы результата и следующий шаг

- Matrix — четыре desktop Chromium контекста с изменением viewport; отдельные journeys используют desktop и iPhone13 touch emulation. Это не Safari/физическая клавиатура/экранный диктор.
- WebKit launch выполнен, отсутствует `webkit-2359/Playwright.exe`; [probe](browser-availability.json). Никакого WebKit PASS и установки бинарника нет.
- axe color-contrast incomplete сохранены в raw records; они не считаются успешной ручной проверкой. Полный E2E suite и вся cross-cutting матрица §5 не запускались.
- ResourceTiming/размеры .next/static — диагностические локальные значения, не CDN/production waterfall или доказательство ускорения. Политика cache headers повторными посещениями отдельно не измерялась. Это свежий production build, но не Docker standalone smoke/deployed-version audit.
- `/saved` в route matrix пустой; наполненное хранилище проверяют lifecycle/cross-tab journeys. Weekend route в стандартном fixture пустой; успешные strict/no-leave/DST поиски покрывались предыдущими H3-01/17b1, здесь не перепроверялись.
- 40 locale-route visits —37уникальныхURL: Barcelona fallback остаётся PL в EN/RU/UK, существующие locale/SEO правила не менялись.
- Успешный cross-tab повтор не устанавливает причину исторического11a transient. Dev conditional-use cause не исследовалась. Новые RUM/INP/field p75/реальные KPI не измерялись; Lighthouse17b2 остаётся историческим lab evidence.
- Настоящие partner redirects, SMTP/Telegram dispatch, signup/активация рассылок/production deployment/GSC не выполнялись.

Rollback: вернуть только тестовый delta `h3-baseline.spec.ts` по [предыдущему spec](baseline-spec-before.ts). Runtime rollback не требуется. Не восстанавливать общие файлы из HEAD и не трогать накопленные H3/IDE изменения, старые разрешённые удаления и текущий H3. Новых dependencies/feature flags/DB migrations/PR/commit нет.

Следующая отдельная часть — **H3-17b4: оставшиеся локальные диагностики и незакрытые пункты release gate**. Общий H3-17 остаётся IN_PROGRESS;14 externally blocked,18 отдельно. После этого выполнения остановка.
