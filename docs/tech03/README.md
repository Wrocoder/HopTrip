# TECH-03 — Performance Optimization

Дата:2026-11-01. Зависимость AUD-04 DONE. Область: измеренная стоимость autocomplete, только TECH-03. Статус DONE.

В аэропортах и направлениях suggestions делали filter по всему registry с построением/нормализацией многоязычных terms, затем slice(0,12). Теперь обход останавливается на12 совпадениях; для пустого запроса не вычисляются terms. Не вводятся кеши, которые могли бы устареть после смены registry/locale, и не меняются matching/normalization/порядок/объекты результата. Изменены только [airports.ts](../../apps/web/src/lib/airports.ts) и [destinations.ts](../../apps/web/src/lib/destinations.ts).

## Метод и результаты

[bench.mjs](bench.mjs) запускается из корня через Node24.13.0 с --experimental-strip-types. Локальный Windows/i7-1355U; CPU модель/дата в [before.json](before.json) и [after.json](after.json). Две synthetic registry sizes4/500, airport/destination, empty/high-match/missing queries. Это тестовые строки, не реальные аэропорты/цены/availability. 10 warmup операций,7 batches×10 операций, медиана длительности batch. Все12 массивов IDs до/после совпадают: [comparison.json](comparison.json).

Первоначальный collector100×100 был слишком долгим и остановлен только по проверенному PID Node с точной benchmark command line; файлов результата от него нет. Итоговые before/after используют одинаковые7×10 и10 warmup. В metadata этих JSON осталась ошибочная подпись100 warmup, фактический loop уже был10; в воспроизводимом script подпись исправлена. Raw times не менялись.

На500 записях before high-match: airport970.76ms/batch, destination424.32ms/batch. После — точные значения в comparison.json; работа ограничена первыми12 совпадениями вместо полного прохода500. Empty path исключает все label/term normalization calls. Near-zero empty timings близки к разрешению таймера: огромные speedup ratios для них не интерпретируются. No-match по-прежнему проходит всю выборку, ускорения не обещается.

Это локальный microbenchmark, не browser INP. Хостовая нагрузка/GC не контролировались: первый [after-concurrent.json](after-concurrent.json) пересекался с build/unit/lint; итоговый after собран после build/unit/lint, первые секунды могли пересекаться с TypeScript. Контрольный алгоритмический эффект и эквивалентность результатов подтверждены; точные коэффициенты не гарантируются на других устройствах. Не заявляется достижение75p LCP≤2.5s/INP≤200ms/CLS≤0.1 или улучшение field CWV. Baseline AUD-04 остаётся отдельным lab/public snapshot.

## Проверки и границы

- [Unit](unit.txt):211/211, включая2 новых [equivalence tests](../../apps/web/tests/suggestion-results.test.mjs). Oracle повторяет прежнюю full-scan семантику: активность, все locales/aliases/IATA/diacritics/whitespace, порядок и object identity; замороженные записи не мутируются.
- [ESLint](lint.txt), [build](build.txt), [TypeScript](typecheck.txt):passed. Standard npm min-release-age и Node module-type warnings не скрыты, зависимости не менялись. Static61 pages; next-env восстановлен.
- Browser: combobox-contract/mobile-picker/airport-search desktop/mobile,4 locales. Результат записывается после завершения; это выбранные regressions, не полный suite.

Критический rendering/layout/CSS, изображения UI-02/reserved aspect/lazy loading, bundle dependencies, API call/cache policies TECH-02, timers/expiry/consent/prices/budget/saved/affiliate/localization/SEO URLs не менялись. Новых re-render effects, caching framework или сети не добавлено. Оптимизирован конкретный измеренный input hot path; full-site performance audit/production RUM не выполнялись.

## Изоляция / воспроизведение / rollback

Benchmark не вызывает сеть. Browser copy .cache/aud05-tech03 подготовлена docs/aud05/prepare-e2e.ps1 с явным копированием untracked CSS/public, own .next/SQLite/3125/8125,reuseExistingServer=false. Новых test-control POST/жёстких API URL нет. SDK получен через get_python_environment: Python3.12.10 из .venv, без installs. Guarded fixture/consent off/campaign flags false/mail sink; production/credentials/paid API/реальные отправки не менялись.

```powershell
node --experimental-strip-types docs/tech03/bench.mjs docs/tech03/repeat.json
# isolated apps/web, SDK/Chrome/test flags как в предыдущих задачах:
node node_modules/@playwright/test/cli.js test '(^|/)combobox-contract\.spec\.ts$' '(^|/)mobile-picker\.spec\.ts$' '(^|/)airport-search\.spec\.ts$' --max-failures=1 --output=test-results-tech03 --reporter=json
```

Backend/pytest/PG/Ruff/mypy/Docker не запускались: соответствующие app/fixtures/config/assets/dependencies неизменны. Browser emulation не является physical device/Safari/screen-reader validation. Rollback только двух suggestion functions, сохраняя TECH-01/02 и другие изменения; API/DB/storage/cookie migrations нет. Следующая по порядку SEO-01 не начата.

## Итог

Node211/ESLint/TypeScript/build passed; E2E24/24,161.74s,unexpected0,skipped0,flaky0,errors=[],retries0. Before/after paired high-match airport227.61→5.64ms, destination67.77→2.08ms за3 operations; no-match216.22→216.30 /66.36→66.28ms. Synthetic500 rows, не field CWV.

Окончательный [paired.mjs](paired.mjs)/[paired.json](paired.json) выполняет old source snapshots и новые функции в одном процессе:3 warmups,5 alternating batches×3 operations, без параллельных собственных проверок. Исходники old functions сохранены в airports-before.txt/destinations-before.txt. Этот парный результат предпочтительнее раздельных замеров с неконтролируемой нагрузкой.

[Первый E2E](e2e-initial.json):8passed/1failed/15not-run,83.45s, short-viewport active-option visibility. Причина не установлена. [Повтор](e2e.json):24/24 без изменения app/tests/assertions между runs; не суммируются. [Verification](verification.json) подтверждает569 runtime/public/Docker parity, master/next-env, [порты](ports.json). [Desktop](picker-desktop.png)/[mobile](picker-mobile.png) captures просмотрены.

TECH-03 DONE; SEO-01 не начата. Production unchanged.
