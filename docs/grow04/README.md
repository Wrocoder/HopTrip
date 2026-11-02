# GROW-04 — Trust and Conversion Improvements

Дата: 2026-11-02. Только GROW-04. TRIP-01/SEC-01 DONE; GROW-03 пока ожидает ANALYTICS-01. Проверены все девять областей задачи. Изменены фактические объяснения и доступность существующих поясняющих страниц; formulas, data, alert delivery, affiliate parameters и юридические основания не менялись. Production не публиковался.

## Подтверждённые находки и изменения

| Область мастер-плана | Проверка / решение |
|---|---|
| About | Старое объяснение обещало нейтральную оценку неизвестного удобства, хотя current flight-v4 содержит только price/history/freshness. Исправлено на PL/EN/RU/UK: текущая методика не оценивает удобство/багаж/перевозчика и не гарантирует минимум рынка. Исторические legacy explanations не удалялись |
| How HopTrip works | Существующий About дополнен понятным порядком airport/dates→compare→detail→plan→seller verification. Указано: flight price на человека, accommodation/transfers отдельно, пользовательские calculator amounts — план, unknown не zero; сайт не принимает оплату/не выдаёт билеты. Новый URL/landing не создавался |
| Price source | Теперь About явно называет Travelpayouts cache и отличает получение данных/открытие карточки от проверки цены/места у продавца. Сверено с `jobs/pipeline.py`, `providers/travelpayouts.py` и существующей price-freshness guide. Provider credentials не использовались |
| Freshness | Existing guide корректно описывает6/24/48h windows, source expiry, preserved observation и first-seen fallback; сверено с `price_lifetime.py`/`availability.py`/price data guides. Новых обещаний live availability и изменений TTL нет |
| External booking disclosures | `partners`, terms, Outbound и detail copy уже объясняют комиссию/внешнего продавца, отдельные data/link integrations, unavailable button и seller-side verification. Outbound сохраняет warning о непередаваемых изменениях дат/people из draft, sponsored link/consent/tracking policy. Эти тексты/параметры/handlers не менялись; GROW-03 не выполнялась |
| Privacy | Static «подборки пока не отправляются» не соответствует configurable email delivery. Заменено условным описанием actual status в форме/new matches. Добавлены technical disclosures для Telegram: chat/user IDs, locale/preferences/consent/records, отдельный /confirm, management/stop, Telegram как получатель команд/ответов, chat history не удаляется отключением alert. Retention описана как cleanup eligibility7/30days, не immediate deletion. Operational count notification отделено от personal bot. Все4 локали |
| Contact | `readOperator` уже безопасно показывает только validated runtime email либо honest unavailable alert, без identity/address fallback. Intro на4 языках теперь учитывает отсутствие адреса. Проверяется отдельный isolated Next process с отсутствующим test operator file; реальный operator config не менялся |
| Error handling | Existing readOperator missing/invalid-file catch не пишет содержимое/PII и не выдумывает email. Existing OfferState/Outbound/expiry/API recovery разделяют unavailable/empty/error и не обещают реальную цену при failure. Runtime error handlers не переписывались. Новый missing-contact acceptance проверяет4 locales/320px без identity/email invention |
| Consistency of claims/navigation | Польский generic InfoPage не показывал общий service navigation, в отличие от EN/RU/UK ServiceInfo. Первым E2E это выявлено на About. Existing block вынесен в ServiceLinks и переиспользован для8 PL service pages; shared localized DOM прежний. Method/freshness/privacy/contact доступны в main, breadcrumbs/metadata/guide rendering сохраняются |

**Точный content scope:** [inventory.json](inventory.json) сравнивает текущие модули с проверенной before copy.54 PL info records:51 unchanged, изменены только about/contact/privacy.32 service locale records:12 changed/20 unchanged. Titles, draft/noindex flags и reviewedAt всех32 сохранены. Terms/partners/price-comparison/price-freshness/price-history не переписаны. Guides/API/DB/dependencies/affiliate/consent/storage/alerts unchanged. Календарная дата исходной privacy notice25.09.2026 сохранена; отдельно обозначено обновление именно описания уведомлений02.11.2026. Полного legal/infrastructure review этим не заявляем.

## Реализация и файлы

- `content.ts` и `i18n/service-content.ts`: About source/flow/current score/planned costs, conditional contact intro.
- `legal-content.ts` и `i18n/legal-translations.ts`: email state/capability caution, conditional Telegram scope/recipient/consent/stop, retention, specific technical update date; новые юридические основания/права/terms/effective dates не устанавливаются.
- `components/service-info.tsx`: существующий service nav выделен в общий ServiceLinks с теми же localized targets/labels. `info/[slug]/page.tsx`: подключает его только для service slugs. Guide-only functions/related routes/activities/calculator/breadcrumb JSON-LD и metadata policies прежние.
- [trust-content.spec.ts](../../apps/web/tests/trust-content.spec.ts):4 locale journeys×2 viewports; [trust-contact-fallback.spec.ts](../../apps/web/tests/trust-contact-fallback.spec.ts): отдельный missing/configured operator mode без изменения реальных настроек.
- Эти evidence и четыре roadmap documents. Master plan и previous tasks сохранены. [Changeset](changes.patch) содержит только6 runtime files и2 новых tests, отделяя task delta от большого исходного dirty tree.

## Источники и границы privacy review

Фактическое поведение сверено с локальными `models/alert.py`, `models/telegram.py`, `services/alerts.py`, `alert_digests.py`, `telegram_subscriptions.py`, `telegram_delivery.py`, `telegram_text.py` и `operator.ts`. Retention описывает именно code conditions: pending7days от последнего subscription request, stopped30days от stop; Telegram receipts/replies7days; terminal reply text clears, active digest history сохраняется для dedup. Task не создаёт cron и не подтверждает реальную частоту maintenance в production.

В `scripts/notify-activity.py` operational mail notice содержит счётчик новых сообщений и адрес самого mailbox, но не subjects/content/sender addresses; INBOX открывается readonly. Скрипты не запускались и не менялись. Персональные bot commands — другой поток; новая privacy copy больше не распространяет обещание о непередаче содержимого operational notice на личные alerts.

[Telegram Privacy Policy, §5.1/§6](https://telegram.org/privacy) прочитана02.11.2026: это внешний канал сообщений, взаимодействие с bot передаёт данные его разработчику. В продукт не добавлены обещания end-to-end encryption, анонимности, фиксированного места хранения Telegram или удаления данных Telegram по /stop. Existing link на политику Telegram сохранён. Новые формулировки о том, что именно хранит HopTrip, основаны на собственном коде, а не на предположениях о провайдере.

Два обращения к [официальному GDPR на EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) и [CELEX](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679) вернули anti-bot page; текст закона в этой сессии не получен. Старые legal bases/rights/terms не пересматривались и не объявлены юридически подтверждёнными. Actual controller identity, hosting region, vendor contracts/transfers, backups/ACL и обязательства ответа требуют отдельного профессионального/операторского review. Existing statements на эти темы сохранены как прежняя информация, а не выданы за проверенные live facts этой задачи. Новые factual disclosures не разрешают включение email/Telegram delivery: прежние GROW-01/02 activation gates сохраняются.

## Проверки

Изменения application logic ограничены service navigation; новые заявления проверяются в настоящем browser render. Данные fixtures явно синтетические; внешние partner/Telegram URLs не открывались ради отправки/покупки. Backend/Python unit/PG/Ruff/mypy/Docker не запускаются для web content/navigation task: соответствующий код/config/schema не меняется. SDK PyCharm используется только для guarded isolated API fixture без installs.

Результаты и сырые отчёты:

- [Unit211](unit-acceptance.txt), [ESLint](lint-acceptance.txt), [TypeScript](typecheck-acceptance.txt), [final isolated production build](build.txt). npm предупреждает о внешней env option min-release-age; ESLint warning/error нет, npm/env config не менялся.
- [Initial desktop](e2e-desktop-initial.json):6passed/1failed/3not-run,123.06s, max-failures stop. Новый test предполагал наличие main nav в PL. DOM snapshot подтвердил отсутствие этого existing block у отдельного PL renderer. Добавлен shared ServiceLinks, test не ослаблен ради допуска отсутствующей ссылки. Locator privacy sections уточнён для двух существующих renderers: PL не имеет .legal-section class; product class ради теста не добавлялся.
- [Второй desktop](e2e-desktop.json):6 existing scenarios passed/1 new failed/3 not-run,107.89s. Product canonical правильно содержал isolated port3125; новый тест ошибочно ожидал3100. Исправлена только привязка origin к текущему test server; точное ожидание localized path сохранено. Runtime после этого не менялся. Эти6 успешных existing scenarios относятся к итоговому bundle.
- [Focused trust desktop](e2e-trust-desktop.json):4/4 passed,16.93s; [mobile](e2e-mobile.json):7/7,40.24s; [missing-contact desktop](e2e-fallback-desktop.json):1/1,8.25s; [missing-contact mobile](e2e-fallback-mobile.json):1/1,8.52s. В каждом из этих четырёх прогонов unexpected/skipped/flaky0, errors=[], retries0. Итого **19 уникальных успешных project/scenario**, включая6 existing desktop из второго прогона:10 новых и9 existing. Это составной acceptance, а не один полностью зелёный10-case desktop run. Initial/повторы не суммируются; оба диагностических сбоя сохранены.
- [Sitemap audit](sitemap-audit.json):244/244 pages и54 editorial links HTTP200; успешный technical-seo test проверяет каждую ссылку до создания attachment. В evidence editorialLinks — список URL, а не объекты со status. [Unavailable statuses](unavailable-statuses.json):6 actual404, без bookable price/canonical. Раньше было51 editorial link; общий service nav добавил3 PL legal links. Новых indexable URLs нет.
- 24 новых scoped axe scans без violations:16 в8 trust journeys и8 в2 missing-contact cases по4 locales. Выборочно визуально просмотрены4 captures: [About PL desktop](about-pl-desktop.png), [Telegram EN desktop](telegram-en-desktop.png), [About RU mobile](about-ru-mobile.png), [Telegram UK mobile](telegram-uk-mobile.png). Это Chromium mobile emulation/element captures, не physical Safari/full-site accessibility certification.
- Итоговые counts/errors/retries и проверка границ — [verification.json](verification.json), [скрипт](verify.cjs), [закрытие собственных портов](ports.json).
- `trust-content`: source Travelpayouts/current score/no unknown-zero promise, native links к method/freshness/privacy/contact, conditional email/Telegram/cleanup copy, explicit dated technical update, noindex/contact nosnippet, valid runtime email только из public test fixture,4 locales/no overflow/scoped axe/no external tracker/Telegram/analytics requests при отказе.
- Missing operator: отдельный runtime mode указывает на nonexistent **test** file; truthful localized alert/no mailto/no invented name/address/320px/axe. Тест в обычном configured mode также имеет корректное положительное ожидание; полный suite не ломается из-за предположения об отсутствующем operator.
- Existing localized-service suite: все8 service pages на EN/RU/UK, legal sources/canonical/hreflang/noindex/privacy/consent withdrawal/operator isolation. Existing technical-seo: полный local sitemap и editorial links, expired/error/publication boundaries. Это local production-mode проверка, не deployment или production crawl.

## Воспроизведение

Из `apps/web`:

```powershell
npm run test:unit
npm run lint
node node_modules/typescript/bin/tsc --noEmit
```

Isolated copy подготовлена `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-grow04`, дополнительно7 untracked CSS/public/script files. Own SQLite/.next/3125/8125,reuseExistingServer=false, Next start после build, локальные site/API URLs и public operator fixture. Installed Next16.4.3 App Router/Playwright guides прочитаны до кода. API запускается на SDK из python-tools; Telegram/digest/editor/event-sync disabled, обе mail boundaries только в memory fixture. Настройки пользователя3100/8100 не используются.

Обычные browser phases выбирают trust-content + localized-service; technical-seo добавлен только на desktop. Отдельные contact-fallback phases используют тот же bundle, но другой process env `HOPTRIP_TEST_OPERATOR_MODE=missing`: isolated config подставляет несуществующий fixture path. Root operator file и root Playwright config неизменны. Этим проверяется настоящий readOperator failure path, а не mock текста в браузере.

## Release / rollback / ограничения

Проверена локальная production-mode web сборка с изолированной test-конфигурацией; публикация не выполнялась. Откатить только GROW-04 literals и согласованно два ServiceLinks consumers; не делать общий reset previous tasks/dirty tree. API/DB/storage/cookies/affiliate/provider credentials/migrations менять не требуется. Контактные сведения остаются server-only/runtime/no-snippet; личные данные не помещаются в source/metadata/build fixtures.

Не заявляются live seller prices/guaranteed savings/availability, реальный канал доставки, legal certification, полная проверка infrastructure/vendor policies или physical-device/full-site WCAG. Guarded browser checks относятся к текущей локальной сборке. Точечное описание privacy не заменяет прежний activation review GROW-01/02.

Следующая eligible задача — ANALYTICS-01 (AUD-02/SEC-01 DONE). GROW-03 до неё остаётся TODO по зависимости. Ни одна не начата; остановка.
