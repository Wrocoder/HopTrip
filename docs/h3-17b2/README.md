# H3-17b2 — CLS панели конфиденциальности

2026-11-05. Часть H3-17 по §1.2 V3. Изолированный локальный production server, синтетические fixtures; deployment и реальные партнёрские действия не выполнялись. H3-14/18 не начинаются. Полный H3-17 остаётся IN_PROGRESS.

## Воспроизведение и причина

Baseline — неизменённая production-сборка H3-17b1 `XcgpuiIKweYr4QakgIavb`, `next start`, NODE_ENV=production; BUILD_ID проверен в реально полученном SSR HTML. [Diagnostic spec](baseline-probe.spec.ts), [raw shifts](cls-baseline.json), [runner](baseline-browser.json), [screens](baseline-artifacts).

16 свежих контекстов: `/` и `/deals`, PL, 390/1440×900, unset/denied, два повторения. Скрипты задержаны на250ms, чтобы SSR успел отрисоваться; измерение начинается init-script до приложения, использует стандартное максимальное CLS session window (gap≤1s, duration≤5s), исключает hadRecentInput. После fonts.ready окно наблюдения1200ms. Это scoped lab navigation measurement, не lifetime/p75/RUM.

**CONFIRMED:** unset CLS 0.1253–0.2928 в обоих повторах; denied CLS0 во всех8 посещениях. Источники shifts включают `#content`, предыдущие/новые rects сохранены. Причина — portal после hydration вставляет `.consent-panel` в normal-flow `#privacy-panel` между header и content; высота панели221.39px desktop /333.77px mobile сдвигает содержимое. При denied панель не вставляется. Это подтверждение причины на текущем коде, а не предположение по историческому17a.

Независимый fresh Lighthouse13.6.0 подтвердил старые значения: home mobile0.291717/desktop0.136960; deals mobile0.289290/desktop0.155499. [Raw reports](lighthouse-before-artifacts), [run](lighthouse-before-run.json). Before LCP: home mobile975.5ms/desktop250.2ms; deals mobile1058.6ms/desktop271.8ms. HTTPS blocked, Chrome локальный, mobile simulated throttling/desktop preset; реальная сеть/production distribution неизвестны.

## Минимальная правка

Только два правила в `globals.css`: `#privacy-panel` закреплён снизу над страницей, `.consent-panel` ограничена70dvh и получает внутреннюю вертикальную прокрутку. Safe-area inset снизу сохранён; ширина min(viewport−24px,1160px), z-index15 ниже skip-link20/native dialog. Панель остаётся немодальной, без focus trap и автоматического opt-in; reject/accept/save, оба checkbox, подробности и ссылки доступны. На маленьком экране панель перекрывает нижнюю часть страницы до выбора, а не толкает весь документ; её можно прокручивать независимо. Это намеренное UX-изменение.

React/portal, DOM order, copy4locale, consent version/expiry/storage/clearSession, analytics/Drive gates, legal/managed-page protection, affiliate attribution, API/DB/schema/URLs/SEO/dependencies не менялись. SSR по-прежнему не читает localStorage и optional consent по умолчанию выключено. Сохранённые планы и бюджет не затронуты. Миграций/нового application flag нет.

## Проверки

**H3-17b2 DONE (локальный CLS scope); H3-17 IN_PROGRESS.** [Verification](verification.json), [source parity](source-parity.json), [CSS delta](runtime-change.patch). After build **46MXir80j9pCKG41zwfF5**, actual served BUILD_ID и production command/env проверены new spec. Только один runtime file изменён относительно17b1; все web/API runtime sources в tested copy совпадают с workspace. Consent/Drive/session/layout/saved/shared modules и dependencies unchanged по hash.

| Маршрут | Lighthouse режим | CLS до → после | LCP после, ms | Performance после |
|---|---|---|---:|---:|
| /deals | desktop | 0.1555 → 0.0000 | 267.5 | 100 |
| /deals | mobile | 0.2893 → 0.0000 | 937.0 | 98 |
| / | desktop | 0.1370 → 0.0000 | 264.1 | 100 |
| / | mobile | 0.2917 → 0.0000 | 960.2 | 98 |

4/4 Lighthouse collection без runtimeError; [after reports](lighthouse-after-artifacts), [runner](lighthouse-after-run.json), [comparison](lighthouse-comparison.json). CLI13.6.0 взят из существующего npm cache, install не выполнялся. LCP ниже2.5s в четырёх after lab samples; это не field CWV/INP/p75. Before Lighthouse запускался одновременно с after build: сравнивать LCP/TBT/общий performance как причинное улучшение нельзя. CLS причина отдельно подтверждена стабильными повторениями unset/denied и raw rects.

**64 navigation CLS samples** PL/EN/RU/UK, Chromium desktop1440×900 + iPhone13 touch emulation390×900, home/deals×unset/denied×2fresh contexts. Все CLS≤0.1, фактический max **0.0215**. Скрипты задержаны250ms, в каждом втором sample также local fonts250ms. Нет overflow/pageerror/external attempts/analytics requests/session before opt-in. При искусственной задержке шрифтов остаются небольшие shifts, включая #home-search; их точная причина отдельно не исследовалась. Обещания абсолютного нуля нет. [Metrics](browser-artifacts).

**40 short viewport checks**:320/375/390/768/1440×480,4locale×desktop/mobile; раскрытые длинные подробности, панель≤70vh, keyboard Tab до Save с полной видимостью, buttons≥44px,0horizontal overflow,40new axe scans. Reject/reopen/save/withdraw/reload и content document top неизменны. Проверены settings focus return и unset checkbox defaults. Скриншоты320/1440 сохранены;320×480 EN expanded+keyboard-scrolled screenshot просмотрен. Existing first-screen spec дополнительно32axe scans/8widths/128page visits; existing consent expiry/blocked storage/analytics withdrawal/managed Drive и detail warnings/save/share сохранились.

**40 unique browser scenarios приняты**:initial [39/40](browser.json), затем [10/10 affected detail file](detail-rerun.json) после test-only стабилизации. Initial UK desktop failure сохранён: smooth scroll остановился на2px вместо0 после native anchor; тест теперь ждёт budget-ready/fonts и использует instant scroll. Strict0/CTA assertions не ослаблены, application scrolling не менялся; причина отдельного браузерного transient не объявляется исправленной. Остальные39 не перезапускались. Final production-only opt-in guard new spec дополнительно проверен на2PL panel cases; [guard check](guard-check.json). В обычном dev suite CLS spec skipped, как opt-in Lighthouse; default dev runner не ломается.

[314Node](node.txt), [build](build.txt), [full lint](lint.txt), [final affected lint](lint-final.txt), [TypeScript](types-final.txt) PASS. IDE success с limited diagnostics; diff whitespace check PASS. API/Ruff/mypy не повторялись: Python runtime и fixtures не менялись. Реальная optional marketing/Drive загрузка и партнёрская атрибуция на внешнем сайте не выполнялись. Никаких PR/commit/deploy/уведомлений/новых dependencies.

## Повторение и rollback

1. Получить PyCharm SDK для `apps/api/tests/e2e_app.py` через python-tools; в этом запуске Python3.12.10, `.venv/Scripts/python.exe`.
2. `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-<unique> -Production`; дождаться completion. Скопировать synthetic operator.json/airport registry и guarded weekend/airport/destination browser fixtures, как в17b1. Default ports3125/8125, reuseExistingServer=false, только loopback.
3. Build env: HOPTRIP_API_URL/NEXT_PUBLIC_API_URL=http://127.0.0.1:8125, NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125, HOPTRIP_OPERATOR_FILE=absolute tests/fixtures/operator.json. `npm run build` в copy/apps/web.
4. HOPTRIP_TEST_PYTHON=SDK executable, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_H3_PRODUCTION=1. `npm run test:e2e -- layout-stability.spec.ts consent.spec.ts first-screen-layout.spec.ts detail-layout.spec.ts --trace=off --reporter=line,json`.
5. До следующего Playwright сохранить test-results. Lighthouse: явно передать уже установленный HOPTRIP_LIGHTHOUSE_CLI и CHROME_PATH; `npm run test:e2e -- h3-lighthouse.spec.ts --project=desktop --trace=off --reporter=line,json`. Тест не скачивает пакеты; package.json/lock не меняются.
6. `npm run test:unit`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`; production build — отдельная проверка от browser mode.

Rollback: убрать только два новых правила `#privacy-panel` / `#privacy-panel .consent-panel` и новый layout-stability spec. Не восстанавливать globals.css целиком из HEAD: накопленные H3/b1 styles должны остаться. Отчёты/provenance correction не удалять. Отдельного deployment rollback нет, deployment не выполнялся.

Остаются RUM/INP/field p75, WebKit/реальные устройства/manual screen-reader, полный release sweep, исторический cross-tab11a и dev conditional-use diagnosis. Лабораторный CLS fix сам по себе не закрывает H3-17 или KPI H3-18. Следующая отдельная часть17b3 — оставшийся quality gate.
