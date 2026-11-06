# H3-17b1 — первый экран каталога/перелёта и достоверный production-стенд

2026-11-05. Часть L-задачи H3-17 по §1.2 V3. **H3-17b1 DONE; H3-17 IN_PROGRESS.** Здесь только first-screen layout, production runner/provenance и связанные регрессии. CLS/LCP/INP/RUM, источник cross-tab11a и полный release gate остаются17b2; H3-18/14 не начинаются.

## Исправление режима проверки

Обнаружена ошибка evidence: подготовленная копия наследовала `npm run dev`, хотя `npm run build` выполнялся отдельно. Следовательно, badge N и React `use()` diagnostic наблюдались на dev-стенде; предыдущие browser-прогоны H3-13/15 и первые b1 нельзя называть production. [Аудит команд/хэшей](runtime-mode-audit.json). H3-12c имел `npm start` и не переклассифицирован. Raw reports не удалены; [13](../h3-13/README.md), [15](../h3-15/README.md), их verification и progress/decisions получили явную поправку. Старые counts — dev functional evidence, не production gate.

`prepare-e2e.ps1` теперь поддерживает **-Production**: в новой копии `npm run start` и NODE_ENV=production, обычный default dev сохранён. Fresh invocation проверена, config byte-identical к использованному runner: [check](production-prepare-check.json). New layout spec при `HOPTRIP_H3_PRODUCTION=1` проверяет команду/env, читает `.next/BUILD_ID` и проверяет его присутствие в реально полученном SSR HTML. Runtime mode сохраняется attachment. На64 посещениях details дополнительно проверено отсутствие nextjs-portal.

Правильный baseline получен на before15 build **NA7w-XaBBu4PGJs0_XJ5K**; после — **XcgpuiIKweYr4QakgIavb**. Обе копии использовали одинаковые fixture ports/env/отказ optional consent. Это локальный Next production server, не deployment/production traffic и не Docker standalone smoke.

## Подтверждённые дефекты и минимальная правка

**CONFIRMED:** на1366×900 и1440×900 цена первой карточки при scrollY=0 выходила за экран во всех4locale; approved seller CTA была частично видна вRU/UK. Уточнение: прежний compact-card test уже прокручивал к карточке и его текущий контракт проходил. Новый тест сильнее — проверяет первоначальный viewport без scroll. В detail baseline измеряется восстановленный draft, а не короткая pre-hydration instruction.

Изменён **один runtime CSS file**, без business/locale/URL/schema changes:

- В desktop catalogue (>=1100) weekend selector и полное объяснение стоят рядом, work hours/assumption при выборе no-leave остаются на полной ширине. Убрана только визуальная копия legend: accessible group name сохранено, select label виден. Сортировка и основные поля получили достаточно ширины для переводов; пояснения не сокращались, DOM/tab order прежний.
- В desktop detail (>=1024) уменьшены вертикальные header/main paddings. Цены, расписание, source/quality/airport/baggage warnings, seller limitations, disclosures и planning sections не удалялись и не закрывались дополнительно. Touch controls остаются>=44px.
- В старом detail-layout spec добавлен явный Save→ID/ready Update navigation barrier, соответствующий H3-12c; поведение сохранения приложения не менялось.

| Locale | Первая цена до→после, bottom px | CTA до→после, bottom px |
|---|---|---|
| PL |1004.141→864.953 |895.828→849.828 |
| EN |1004.141→864.953 |895.828→849.828 |
| RU |1025.625→868.438 |920.141→874.141 |
| UK |1025.625→886.438 |920.141→874.141 |

Таблица одинакова на1366/1440 и в обоих browser projects. Цена стала выше на139.188–157.188px; CTA — на46px. [Raw comparison](geometry-comparison.json), [CSS diff](runtime-change.patch), [before CSS](globals-before.css). Это результат для default collapsed catalogue и указанного fixture/detail; открытые фильтры/extra warnings могут требовать scroll, mobile CTA проверяется после native booking anchor.

## Выполненные проверки

- [True production baseline4/4](baseline-production.json):48 page visits,6widths×4locale×2routes. [Before geometry/screens](baseline-production-artifacts). Первые dev baseline/trials сохранены отдельно как диагностика; первоначальные geometry файлы пришлось повторно собрать, поскольку Playwright очищает test-results. Для сравнения используется только сохранённый production baseline.
- [True production74/74](browser-production.json),0fail/skips/flaky/retries:8new layout cases +36related existing +14H3-13/16H3-15 production spot checks. [Итог](verification.json). До исправления runner был [dev44/44](browser-dev.json); его diagnostic не выдаётся за production issue.
- New matrix:320/375/390/768/1024/1100/1366/1440,height900,4locale, desktop+touch-emulated mobile.64 viewport pairs/128page visits,0overflow.32new axe scans; keyboard disclosure/open-close/group label, no-leave work hours/assumptions, control heights, first price+CTA and native anchor focus. Existing tests дополнительно покрывают critical/partial/complete warnings, long labels, filters/history/sort/reset/delayed origin, strict weekends/DST и Save/share/reload.
- [314Node](node.txt),[build](build.txt),[ESLint](lint.txt),[TypeScript](types.txt) PASS. IDE success с limited diagnostics; CLI даёт compiler evidence. Diff whitespace check PASS. API/Ruff/mypy повторно не запускались: production Python/test fixtures не менялись.
- [Parity](source-parity.json):one CSS runtime,7test sources совпадают с copy,24logic/consent/storage/SEO/API/dependency modules неизменны. Production helper — отдельная небольшая правка; прежнее включение untracked CSS в prepare было до b1 и сохраняется при rollback.

Финальные1366px UK catalogue/detail screenshots просмотрены: цена/CTA целиком в viewport, badge N отсутствует, тексты и target sizes читаемы. Все4locale screenshots и geometry находятся в [production-artifacts](production-artifacts). CSS исправление не является доказательством manual screen-reader/zoom/реальных устройств/Safari.

React `This library called use()` появился в dev delayed-origin сценарии. В74production cases такой diagnostic не зафиксирован, но его причина не исправлялась/не объявляется установленной. N соответствует dev runner; в64production detail visits portal отсутствовал. Никаких новых выводов о production deployed version или RUM из этого не делается.

## Повторение и rollback

1. `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-<unique> -Production`; дождаться completion. Copy прежних synthetic operator/airport registry/browser fixtures, включая guarded destination fixture; production app не импортирует E2E app.
2. В copy выставить build env API3125/8125 корректно: HOPTRIP_API_URL/NEXT_PUBLIC_API_URL=http://127.0.0.1:8125; NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125. `npm run build`.
3. Получить PyCharm SDK через python-tools; HOPTRIP_TEST_PYTHON на returned executable, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_H3_PRODUCTION=1.
4. `npm run test:e2e -- first-screen-layout.spec.ts detail-layout.spec.ts compact-cards.spec.ts filter-workflow.spec.ts weekend.spec.ts event-fit-filter.spec.ts destination-recovery.spec.ts --trace=off --reporter=line,json`.
5. До следующего CLI скопировать test-results/evidence. Build успех отдельно от browser mode; читать mode attachments/served build ID. `node .cache/h3-17b1-verify.mjs` сверяет текущий набор.

Без flag/dependencies/migration/deploy. Rollback только b1 CSS diff; сохранить предыдущие H3 styles и application state. Из helper можно отдельно убрать -Production switch/block, сохранив старый CSS-copy support. Исторические correction notes/evidence не удалять. Saved/shared/affiliate/consent/API contracts прежние.

Для места удалены только собственные completed `.next/dev` у before15(458.62MiB) и17b1(258.67MiB), после завершения runners и сохранения результатов. Exact paths/ancestors/reparse guards проверены; sources/production builds/dependencies/H3 evidence/прочие dirty changes сохранены, чужие процессы не останавливались. ИсходныйV3/current H3 и разрешённые прежние удаления не затронуты.

**Следующая отдельная часть — H3-17b2:** fresh production CLS/LCP и причины shifts, затем оставшиеся quality checks/cross-tab/manual SR/WebKit при доступности. Historical17a CLS0.137–0.292 остаётся открытым evidence; first-screen first-price/CTA geometry закрыта b1. H3-17 целиком не DONE. H3-14 externally blocked, H3-18 отдельно. Здесь остановка.
