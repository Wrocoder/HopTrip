# AUD-04 — baseline performance и SEO

Дата: 2026-10-30. Объект runtime-измерений: **публичный https://hoptrip.pl**. Только чтение; формы, consent, booking и outbound-переходы не активировались. Это фактические лабораторные наблюдения, не результаты реального трафика и не доказательство доступности оферт в будущем.

Отчёт: [HOPTRIP_AUDIT.md](../HOPTRIP_AUDIT.md), раздел AUD-04. Данные:

- [lighthouse-summary.json](lighthouse-summary.json) — настройки, баллы, метрики и замечания четырёх Lighthouse-прогонов.
- [home-mobile.json](home-mobile.json), [deals-mobile.json](deals-mobile.json), [home-desktop.json](home-desktop.json), [deals-desktop.json](deals-desktop.json) — исходные Lighthouse JSON.
- [seo-contract.json](seo-contract.json) — 244 URL, failures=[]; полный существующий контракт из scripts/audit-seo.mjs.
- [baseline.json](baseline.json) — 14 выборочных SEO-состояний, sitemap/robots, 4 no-JS страницы, 8 сетевых замеров, 3 API endpoint × 5 запросов и отдельный локальный JS build inventory.
- [collect.cjs](collect.cjs), [summarize.cjs](summarize.cjs) — воспроизводимые вспомогательные скрипты. Не часть production или обязательного CI.

## Окружение и метод

Windows 10.0.26300 x64, Intel Core i7-1355U, 12 logical CPUs, Node v24.13.0, Chrome 156.0.8078.48; Lighthouse 13.6.0 (axe-core 4.14.0). Сетевое расположение/RTT/VPN хоста не установлены; часовой пояс пользователя Europe/Warsaw, времена JSON — UTC. Версия работающего deployment по commit не установлена.

Четыре Lighthouse-запуска выполнены последовательно, по одному на сочетание URL/device. Default mobile: 412×823, DPR 1.75, simulated RTT 150 ms / throughput 1638.4 Kbps / CPU ×4. Desktop preset: 1350×940, DPR 1, simulated RTT 40 ms / throughput 10240 Kbps / CPU ×1. Полные settings и фактический User-Agent сохранены в отчётах. Состояние первого визита без принятого optional consent. Повторные медианы Lighthouse и field p75 не вычислялись.

После завершения Lighthouse выполнен существующий SEO-crawl. Финальный collect.cjs выполнен после crawl отдельно, без конкурирующего аудита с нашей стороны. Его network-замеры: свежий browser context и отключённый CDP cache на каждую страницу, 390/1440×900, DPR 1, без искусственного throttling. Окончание наблюдения — networkidle. CDP encodedDataLength учитывает фактически переданные закодированные данные; JSON сохраняет MIME/type/status и адрес без query. Это не размер распакованных ресурсов. Число responses не включает запросы, на которые вообще не получен response; поздние/lazy ресурсы после окна наблюдения не измерены. Эти числа не обязаны совпадать с Lighthouse.

API latency — GET до полного получения тела, 5 последовательных запросов на endpoint через один request context. Включает путь от клиента, HTTP/TLS и приложение; это не чистое серверное время БД. p95 по пяти наблюдениям здесь равен максимуму, а не устойчивой оценке хвоста.

INP и field CWV не измерены: нет RUM/CrUX/реальных пользовательских взаимодействий. TBT не подменяет INP. Лабораторные LCP/CLS не объявляются полевыми метриками.

## Команды повторения

Из корня репозитория, с установленными зависимостями apps/web и Google Chrome:

```powershell
$env:CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
npm exec --yes --package=lighthouse@13.6.0 -- lighthouse https://hoptrip.pl/ --chrome-flags=--headless --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=docs/aud04/home-mobile.json --no-enable-error-reporting --disable-full-page-screenshot --quiet
# Для каталога: URL https://hoptrip.pl/deals и другой output-path.
# Для desktop: добавить --preset=desktop и использовать *-desktop.json.
node docs/aud04/summarize.cjs
$env:PLAYWRIGHT_CHANNEL='chrome'
node apps/web/scripts/audit-seo.mjs https://hoptrip.pl https://hoptrip.pl > docs/aud04/seo-contract.json
node docs/aud04/collect.cjs
```

Реальный запуск npm exec использовал временный package=lighthouse; фактически полученная версия 13.6.0 зафиксирована в каждом raw report. В повторении версия закреплена. Новых зависимостей в package.json/lock не добавлено.

`collect.cjs` дополнительно читает уже существующую локальную `.next/static/chunks` и BUILD_ID. Перед повторением этой части нужна отдельная локальная `npm run build`, иначе bundle inventory относится к предыдущей сборке. Сумма всех chunks не равна загрузке одного маршрута.

## Локальная сборка и ограничения

Локально `npm run build` прошёл, включая TypeScript и генерацию 61 static/SSG страниц. Финальная сборка использовала HOPTRIP_API_URL/NEXT_PUBLIC_API_URL=http://127.0.0.1:8124 и NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3124, operator fixture. API fixture — e2e_app.py, временная SQLite, HOPTRIP_E2E=1, APP_ENV=test, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EVENTS_SYNC_ENABLED/EDITOR_ENABLED=false. SDK получен через python-tools. Порт 8100 оказался занят, поэтому использован отдельный 8124; занятые процессы не останавливались. Автогенерация next-env.d.ts при build возвращена к исходному состоянию.

Запуск локального `npm run start` на 3124 отклонён автоматической проверкой с причиной «blocked by policy»; он не повторялся обходным способом. Поэтому локальные build-size данные отделены от публичных runtime-измерений. Fixture backend остановлен. Локальная сборка не развёртывалась.

Проверки контракта: из apps/web `node --experimental-strip-types --test tests/seo-audit.test.mjs tests/search-policy.test.mjs tests/i18n.test.mjs` — **14 passed**. Первый collect-прогон остановился на строгом выборе main в no-JS stream; окончательный скрипт сохраняет все main regions с признаками видимости и завершился errors=[]. Вспомогательные скрипты прошли node --check. Исправления приложения не выполнялись.
