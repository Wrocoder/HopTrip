# H3-17b6 — SSR, кеширование и смена сборки

2026-11-06. **H3-17b6 DONE в диагностическом scope; H3-17 IN_PROGRESS.** Добавлен только `apps/web/tests/ssr-cache.spec.ts` и этот пакет доказательств. Поведение приложения, API/схемы, локализация, SEO policy, consent/аналитика, saved/budget и зависимости не менялись. Обнаружен открытый риск H3-17-F03; rollout gate не объявляется пройденным.

## Проверенные контракты

Существующие главная/каталог force-dynamic, API fetch использует no-store. Proxy перезаписывает x-hoptrip-locale по URL. Это уже было в приложении; новые проверки проверяют ответы, а не строки исходника.

- **6/6 production cases PASS**, дополнительно1/1 capture предыдущего release. Четыре locale cases проверяют40посещений/37уникальныхURL с JavaScript полностью выключенным:главная,каталог,weekend,city-break,Barcelona/Milan,detail,saved,budget,alerts. Виден server-rendered main h1,согласованы lang/canonical;каталог содержит ссылки реальных fixture offers. Barcelona сохраняет прежний PL fallback.
- HTML всех40ответов содержит текущий BUILD_ID и `private, no-cache, no-store, max-age=0, must-revalidate`. Проверены25уникальных текущих script/CSS/font ресурсов:HTTP200,ненулевой body,immutable cache policy;MIME JS/CSS проверен. [Инвентарь](current-assets.json),[raw](browser-artifacts),[reporter](browser.json).
- Три отдельных cookie contexts WRO/KRK/безcookie получают разные ожидаемые origin values;query origin=GDN переопределяет cookie. Поддельный x-hoptrip-locale=ru не меняет язык `/en`. Это реальные SSR ответы при отключённом JS,без доступа к production данным.
- Получен snapshot сборки A **B03jo9a_4GShaLeB8HAfD**,затем создана свежая production-сборка B **r0GcPxhHoaf0i7WcFdlMD**. Условный GET кB возвращает200/новыйBUILD_ID/no-store,безA-ID. УA **нетETag**:использован явно синтетический If-None-Match validator. Это не проверка настоящего304/cache hit старого документа или очисткиCDN.
- После добавления snapshot-precondition skip и ограничения old-asset URL на /_next/static/ целевой release case повторён1/1PASS;остальные5passed cases не повторялись. Без production flag весь spec skipped;без предыдущегоsnapshot только cross-release case skipped. [Повтор](release-recheck.json).

## H3-17-F03 — OPEN/P1: доступность ресурсов старого HTML

В новой локальной сборке **7из13asset URLs старого snapshot вернули404**. Новые25ресурсов доступны;их PASS не означает доступность старых chunks. Полная таблица before/after/status сохранена в release-switch.json внутри [browser-artifacts](browser-artifacts) и [verification](verification.json).

**CONFIRMED локально:**два production build в разных изолированных workspace,после переключения старыеURL частично отсутствуют. **NEEDS EVIDENCE на deployed site:**действующие server/CDN overrides не опрашивались. Количество7/13 не переносится на настоящий deployment. Вкладка со старым JS не переживала реальный restart в этом тесте;автоматическое восстановление ChunkLoadError/полная перезагрузка/пользовательский ущерб не установлены.

В [Dockerfile](../../apps/web/Dockerfile) runner копирует только текущую `.next/static`. В [production compose](../../docker-compose.production.yml) нет общего хранилища старых static;[Caddyfile](../../infrastructure/Caddyfile) проксирует web,без старого asset fallback. [deploy-production.sh](../../scripts/deploy-production.sh) сохраняет rollback images,но postflight проверяет readiness/root/preview,не старыеchunk URLs. Это аргументы по текущему репозиторию,не доказательство фактически установленной конфигурации хоста. Ничего из deploy/containers/продакшена в этом выполнении не менялось.

Открытый следующий шаг **H3-17b7 — защита от несовпадения ресурсов при смене релиза и её postflight-проверка**. Решение retention/CDN/восстановления требует отдельной реализации и проверки;SSR no-store само по себе не гарантирует работу уже открытой старой вкладки.

## Стенд и проверки

Old A — прежняя H3копия17b3;B — fresh `.cache/aud05-h3-17b6-20261106`,prepare-e2e -Production,synthetic operator/airport/weekend/destination fixtures. Loopback3125/8125,собственнаяSQLite,reuseExistingServer=false,серверы последовательно закрываютсяrunner. Пакеты/браузеры не устанавливались. Previous reports сохранены до очисткиtest-results.

Перед каждым fixture CLI получен PyCharm SDK:Python3.12.10,`.venv/Scripts/python.exe`. HOPTRIP_TEST_PYTHON=SDK,PLAYWRIGHT_CHANNEL=chrome,HOPTRIP_H3_PRODUCTION=1. ДляA HOPTRIP_SSR_CAPTURE=1;дляB HOPTRIP_OLD_RELEASE=absolute old-release.json. Buildenv API8125/site3125,operator synthetic file.

```text
npm run build
npm run test:e2e -- ssr-cache.spec.ts --project=desktop --trace=off --reporter=line,json
npm run test:unit
npx --no-install eslint tests/ssr-cache.spec.ts --max-warnings=0
npx --no-install tsc --noEmit --incremental false
```

[Build](build.txt),[314Node](node.txt),[lint](lint.txt),[types](types.txt) PASS;IDE build success with limited diagnostics. Исходники вcopy/root совпадают,кроме прежней prepare-adaptation turbopack.root для linked dependencies;test ports нормализованы прежнимprepare. [Verification](verification.json). ОтдельныеAPI unit/Ruff/mypy не запускались:production Python/fixtures не менялись. No deployment,notifications,real partner transactions,credentials changes,DB migrations,удаленийстарыхдоков/картинок,PR/commit. СуществующиеH3/IDE changes сохранены.

Rollback — удалить только новый ssr-cache.spec.ts. Runtime rollback/feature flag/migration не нужны;сохранить историческиеevidence. Ограничения:локальныйnext start,неDocker standalone/CDN;no fullsitemapcrawl/fullE2E/WebKit/manualSR/physicaldevices/fieldCWV. Dev diagnosticF02 остаётсяopen;H3-14externallyblocked,H3-18отдельно. После обновлениятрекера остановка.
