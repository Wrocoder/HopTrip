# H3-17b4 — разбор неопределённых результатов контрастности

2026-11-05. **H3-17b4 DONE в рамках проверки контраста; H3-17 IN_PROGRESS.** Изменён только новый `apps/web/tests/contrast-review.spec.ts` и документация. Цвета, CSS, тексты, API/схемы, SEO, consent/аналитика/Drive, бюджет, saved/share и зависимости приложения не менялись.

## Что установлено

28 посещений маршрутов с `color-contrast: incomplete` в17b3 не являлись 28 подтверждёнными нарушениями. [Первичный probe](contrast-probe.json) показал символы и фоновые изображения/градиенты. [RU/UK probe](locale-probe.json) дополнительно выявил однобуквенные подписи дат «С»/«З». Гипотеза о недостаточном контрасте этих элементов **NOT REPRODUCED в проверенных состояниях**.

Расширенная проверка:10маршрутов×4locale×desktop1440/mobile390,height900, **80 scans /936 review nodes**. Сохраняются все исходные axe incomplete/HTML/target/data; глобальных исключений axe и удаления проверяемых элементов нет.

| Причина axe | Nodes | Дополнительная проверка |
|---|---:|---|
| nonBmp |784 | Только `→`/`ⓘ`, aria-hidden=true; ближайшая ссылка/кнопка имеет доступное имя с буквами/цифрами |
| bgGradient |116 | Консервативная граница контраста для полностью непрозрачного двухцветного градиента и последующих rgba-подложек |
| bgImage |32 | SELECT:единственный SVG path,известная геометрия;стрелка12×8,right10px находится вне текстового content box с padding32px;проверка цвета текста на непрозрачном фоне |
| shortTextContent |4 | LABEL «С»/«З» связан с date input с тем же доступным именем;контраст считается как для обычного текста |

Для152текстовых случаев минимальная консервативная граница **5.8038:1**, порог **4.5:1**, в том числе для крупных заголовков. Для остальных784 декоративных символов проверяется наличие полноценной текстовой подписи управления. Неклассифицированных элементов0, axe violations0. Это разбор указанного набора, не обещание соответствия всех возможных состояний сайта WCAG.

Расчёт строит поканальные RGB bounds градиента, последовательно накладывает полупрозрачные подложки и использует диапазон относительной яркости sRGB. Он не выбирает несколько удобных точек градиента. Проверяется наличие непрозрачной подложки поверх текстуры body; неожиданные фоны, прозрачный foreground, opacity/filter/blend/pseudo overlays и неизвестные axe message keys останавливают тест. Сложные фоны не объявляются прошедшими автоматически.

Поддерживаемый текущий градиент задан двумя legacy hex-цветами, поэтому применяется интерполяция в gamma-encoded sRGB по [CSS Color 4 §13.3](https://www.w3.org/TR/2026/CRD-css-color-4-20261103/#interpolation-space). Явные другие color spaces и не-legacy функции не входят в поддерживаемый синтаксис checker.

## Проверки и доказательства

- **10 уникальных browser cases приняты**:8locale/project cases с80scans в [полном прогоне](browser.json);2negative-control cases в [целевом повторе](negative-controls.json). [Raw/default states/screens](browser-artifacts), [verification](verification.json), [source parity](source-parity.json).
- Отрицательные примеры проверяют, что намеренно светлый текст даёт ratio<4.5, opacity0.5 и несколько background layers отклоняются, исходный inline style восстанавливается. Расчёт и ограничения evaluator не ослаблялись для принятия результата.
- История сохранена:initial [4/8](browser-initial.json) не знал shortTextContent RU/UK;после разбора [8/8](browser-classified.json). В последнем полном прогоне8/10:оба negative controls ожидали конкретно gradient error, хотя более ранний guard правильно возвращал compositing error. Уточнено только ожидание категории ошибки;повторены2контрольных cases,80успешных scans не повторялись. Это не исправление приложения и не первый полностью зелёный прогон.
- Одна попытка прямого read-only подключения к уже завершённому runner получила ERR_CONNECTION_REFUSED;штатный fixture probe после запуска серверов прошёл. Это не дефект продукта.
- [314Node](node.txt),[ESLint](lint-final.txt),[TypeScript](types-final.txt) PASS. IDE build success с limited diagnostics. Fresh application build здесь **не выполнялся**:использована неизменённая production-сборка17b3 **B03jo9a_4GShaLeB8HAfD**, source parity635runtime/dependency/fixture files;served SSR BUILD_ID/next start/NODE_ENV проверены заново. [Исходный успешный build](../h3-17b3/build.txt).
- Opt-in guard сохраняет default dev workflow:без HOPTRIP_H3_PRODUCTION=1 тест skipped. [Отдельная проверка skip](default-skip.json). Отдельные API unit tests/Ruff/mypy не запускались:production Python и fixtures неизменны.
- Визуально просмотрены PL screenshots секции событий1440/390. Это не ручная оценка каждого пикселя/всех переводов и не проверка экранным диктором.

## Воспроизведение и rollback

Стенд — принадлежащая текущим H3 executions копия `.cache/aud05-h3-17b3-20261105`,собственные synthetic SQLite/API8125/web3125,reuseExistingServer=false. Серверы каждый раз запускаются заново;нет обращения к production,real partners,SMTP/Telegram/paid API или активации подписок. Предыдущие raw reports сохранены до очистки test-results следующим Playwright. Ничего из старой документации/изображений или чужих процессов не удалялось.

Перед CLI получен PyCharm SDK через python-tools:Python3.12.10,`.venv/Scripts/python.exe`. HOPTRIP_TEST_PYTHON=SDK executable,PLAYWRIGHT_CHANNEL=chrome,HOPTRIP_H3_PRODUCTION=1. Для свежей копии использовать прежний prepare-e2e -Production и fixture/build инструкции17b3.

```text
npm run test:e2e -- contrast-review.spec.ts --trace=off --reporter=line,json
npm run test:e2e -- contrast-review.spec.ts --grep "contrast bounds reject" --trace=off --reporter=line,json
npm run test:unit
npx --no-install eslint tests/contrast-review.spec.ts --max-warnings=0
npx --no-install tsc --noEmit --incremental false
```

Rollback — удалить только новый contrast-review.spec.ts. Application rollback/migration/feature flag не требуются. Не возвращать общие файлы из HEAD;накопленные H3/IDE изменения и исторические mode corrections сохранить. PR/commit/deploy/новых зависимостей нет.

**Ограничения:**default rendered states,не все hover/focus/zoom/forced-colors/open selects/themes;Chromium с touch emulation,не WebKit/физические устройства;computed-style bounds,не pixel OCR/manual screen-reader certification. 40locale-route visits соответствуют37уникальнымURL из-за существующего PL fallback Barcelona. Полевые CWV/RUM/INP/p75 и полная release/cross-cutting matrix не закрыты.

Следующая отдельная часть **H3-17b5 — оставшиеся локальные runtime-диагностики**, включая ранее наблюдавшийся React dev diagnostic. Historical cross-tab root cause не установлена. H3-14 externally blocked,H3-18 отдельно. Здесь остановка.
