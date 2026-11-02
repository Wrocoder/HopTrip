# SEO-03 — Destination Landing Pages

Начато:2026-11-01, завершено:2026-11-02 (Europe/Warsaw). SEO-03 DONE, SEO-01 DONE. Только SEO-03. SEO-04 не начата.

## Проверенное состояние и изменение

В [destination route](../../apps/web/src/app/destinations/[slug]/page.tsx) уже есть request-scoped metadata/body outcome, getDestinations/getDeals, DealGrid, related guide links, city-break/weekend searches и уникальная reviewed landing copy для Milan. Индексируется только reviewed Milan на PL/EN/RU/UK; остальные registry destinations сохраняют noindex/follow. При пустом массиве offers раньше рендерилась пустая сетка без объяснения. [Before](e2e-before.json):0/1,26.33s — `[data-state="empty"]` отсутствует; errors содержит остановку max-failures=1. Before copy содержала слово «ниже», впоследствии убранное для точности расположения; исходный failure — отсутствие самой панели.

Добавлены:

- Явное localized empty observations state на existing OfferState: отсутствие наблюдений не выдаётся за отсутствие рейсов у перевозчиков. CTA в общий поиск с destination сохраняет город без ограничений по ночам/weekend, другая CTA позволяет выбрать другой город. Никакого автоматического ослабления current search или выдуманной доступности.
- [DestinationPlanning](../../apps/web/src/app/components/destination-planning.tsx): фактическая country/code и известные IATA codes из registry, напоминание о конкретном порте/трансфере, seasonal/date planning и объяснение событий с конкретными датами. Компонент server-only, без новых fetch/caches/state.
- [DestinationGuides](../../apps/web/src/app/components/destination-guides.tsx) получает optional summaries=true только на destination route. Descriptions из existing published editorialCard дают city-specific overview и travel context, переводы/marked Polish fallback прежние. Другие consumers сохраняют краткий вид.
- Переход к уже существующей city-specific подборке достопримечательностей в первом опубликованном guide, только если guide mapping и activity selection существуют. Сохраняются existing tracked partner links, consent/target/rel и budget actions в guide.
- Existing flight observations показываются с прежними quality/freshness cards и явной observation notice. Flight error/unknown destination остаются existing ApiUnavailable/noindex и404; empty success не смешивается с outage.

Новый [словарь](../../apps/web/src/lib/i18n/destination-copy.ts) PL/EN/RU/UK. Existing rationale/text-link/related-reason styles и native href/headings/lists переиспользованы; новых библиотек и локальных routes нет.

## Контент, источники и границы

| Требование | Реализация / ограничение |
|---|---|
| Overview и советы | Existing unique Milan catalog copy и published city guide descriptions для mapped destinations; registry country/IATA только из API, аэропорты не выводятся из названия города |
| Seasonal context | Качественные notes для Milan/Barcelona и общий checklist своих дат, погоды, праздничных исключений и indoor plan. Без температур, live forecast, цен или «лучшего месяца» |
| Offers | Existing getDeals фильтрует destination, DealGrid и source/freshness semantics сохранены; активные карточки и пустая выборка различаются |
| Alternative searches | Тот же destination без ограничений короткого/выходного выезда и общий catalog для другого города. Nearby relationship в проверенных registry/contracts отсутствует — соседние города и транспорт между ними не угадываются |
| Related guides/attractions | Existing guide-destinations publication filter + editorial descriptions + existing city-specific activity anchor. Unsupported city не получает чужую подборку |
| Events | Существующий `/api/v1/deals/{slug}/events` требует действительный deal и date context/support; landing без дат не вызывает provider и не выдаёт недатированные события за доступные. Есть пояснение и translated concert-trip guide |
| Indexation | Milan имеет unique copy/2 city guides/planning и полезен при empty offers. Остальные города не открываются массово к indexing. Metadata/canonical/hreflang/sitemap policy сохранена. Доступного Search Console connector/export не обнаружено; live indexing/search demand не заявляются |

Новые сезонные notes опираются на [Comune di Milano: summer heat](https://www2.comune.milano.it/en/web/milano-cambia-aria/-/caldo-estremo-e-notti-tropicali-a-milano) и [Turisme de Barcelona: climate](https://bid.barcelonaturisme.com/wv3/en/page/5125/climate-in-barcelona.html). Barcelona описывает жаркое лето и более дождливые весну/осень; municipal Milan source — летнюю жару. Предложения сократить прогулку/иметь indoor вариант — редакционные рекомендации, не прогноз. Barcelona full page прочитана; Milan source подтверждён индексированным фрагментом первичного источника, direct web fetch403, полная HTTP-доступность не подтверждена. YesMilano seasonal page также403 и не используется для нового текста. Датированные event calendars/спорные numeric tables не переносились. Existing guide facts/reviewedAt и activity selections в этой задаче не обновлялись.

Проверка analytics schema выявила ActivityContext.page, допускающий `/info/` и `/deals/`, но не `/destinations/`. Поэтому доступ к подборке организован через guide anchor, где уже работают учёт/consent и партнёрные ссылки. Inline DestinationActivities на новый route не переносится, backend analytics contract не расширяется. Ранее существующая обработка локализованных activity page values не объявляется исправленной.

Registry-only destinations без editorial mapping получают честные registry/search/empty controls, но не выдуманный city guide. Они сохраняют прежний noindex. Полное создание контента для всех будущих/неподдерживаемых городов не заявляется.

## Проверки и воспроизведение

- [Unit](unit.txt):211/211; [ESLint](lint.txt), [TypeScript](typecheck.txt), [initial build](build.txt) и [final build](build-final.txt) passed. Build выполнялся в isolated copy с site/API URLs3125/8125; frontend runtime source совпал с checkout. Root next-env.d.ts не менялся.
- [destination-landings.spec.ts](../../apps/web/tests/destination-landings.spec.ts):4 locales×desktop/mobile320, empty Milan/guide summaries/seasonal source/native searches/meta/axe/overflow, API outage/noindex/recovery. Отдельный ordinary-UA/no-JS сценарий:Milan empty, Barcelona offers, Rome empty, actual city guide/attraction anchor и обратно в поиск с destination. Реальные partner navigation не выполняются.
- [Desktop](e2e-desktop.json):14/14,124.77s; [mobile](e2e-mobile.json):5/5,21.57s.19 уникальных scenarios,unexpected0,skipped0,flaky0,errors=[],retries0.10 новых destination cases и9 прежних catalog/technical/no-JS cases.8 новых scoped axe scans по planning/guides/empty без violations; main mobile явно320px. Before regression не суммируется.
- Visual QA уточнил подпись registry `iata_codes`: поле направления не гарантирует список конкретных аэропортов. Вместо «коды аэропортов» теперь «коды направления (IATA)» во всех4 локалях; значения и напоминание проверить порт на билете прежние. После уточнения bundle пересобран, lint/tsc повторены, [acceptance10/10](e2e-acceptance.json),44.41s,errors=[],retries0 на обоих projects. Повтор10 destination cases не прибавляется к19; старые captures сохранены как `*-before-label.png`, финальные captures просмотрены повторно.
- [Crawl](sitemap-audit.json):244/244 pages и51 editorial link HTTP200; canonical/robots/unique metadata/headings/language и реальные404/recovery сохранены. Два [viewport captures](mobile-planning.png) нового planning блока просмотрены; это не full-page/physical-device certification.
- [Verification](verification.json):573 runtime/public/Docker файла совпали с isolated copy; selected tests/fixture отличаются только необходимой test-port normalization. Master plan/root next-env unchanged, JSON/links/added whitespace checked, свои3125/8125 закрыты. Пользовательские/IDE/предыдущие изменения сохранены.

Подготовка `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-seo03`, явное включение прежних untracked CSS/public assets. SDK PyCharm/Python3.12.10, без installs. Guarded HOPTRIP_E2E/SQLite/.next/3125/8125,reuseExistingServer=false,APP_ENV=test,DATABASE_URL=sqlite://; alerts/digests/editor/event-sync disabled, consent false. Control URL из isolated config, каждый POST обязан быть ok. Чужие3100/8100 не используются.

В isolated playwright.config.ts только test ports и второй server command изменены: `next start` использует собранный bundle вместо dev compilation; root config не меняется. Это локальный production-mode test, не deployment и не доказательство улучшения надёжности API/CWV. Никаких paid APIs/real campaigns/credentials/production writes.

```powershell
npm run test:unit
npm run lint
npx tsc --noEmit
# isolated apps/web:
$env:NEXT_PUBLIC_SITE_URL='http://127.0.0.1:3125'
$env:NEXT_PUBLIC_API_URL='http://127.0.0.1:8125'
$env:HOPTRIP_API_URL='http://127.0.0.1:8125'
$env:HOPTRIP_OPERATOR_FILE=[IO.Path]::GetFullPath('tests/fixtures/operator.json')
npm run build
node node_modules/@playwright/test/cli.js test '(^|/)destination-landings\.spec\.ts$' '(^|/)catalog-seo\.spec\.ts$' '(^|/)technical-seo\.spec\.ts$' '(^|/)seo-rendering\.spec\.ts$' --project=desktop --max-failures=1 --output=test-results-seo03-desktop --reporter=json
node node_modules/@playwright/test/cli.js test '(^|/)destination-landings\.spec\.ts$' --project=mobile --max-failures=1 --output=test-results-seo03-mobile --reporter=json
```

Backend/fixtures/API/schema/DB/config/dependencies/affiliate URLs/consent/storage/score unchanged: pytest/PG/Ruff/mypy/Docker build не запускались. Full product E2E/physical devices/full WCAG/Search Console/field CWV не заявляются.

## Release / rollback

Согласованный web bundle двух modified consumers (destination page/DestinationGuides) и двух новых modules (DestinationPlanning/destination-copy), обычная release-сборка с production environment. Для rollback вернуть два consumers к SEO-03 snapshot и удалить два новых modules; связанный browser spec убрать/восстановить. Остальные изменения checkout, включая SEO-01/SEO-02, сохраняются. Нет API/DB/storage migrations, backfill, cookie cleanup или affiliate tracking changes. SEO-04 не начата.
