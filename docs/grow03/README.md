# GROW-03 — Affiliate Conversion Improvements

Дата: 2026-11-02. Только GROW-03; TRIP-01/ANALYTICS-01 DONE. Проверены8 требований. Исправлены только измерение локализованных attraction clicks и middle-click ticket events. Партнёрские URL/параметры/цены/availability policy не изменены. Рост conversion и live seller availability не измерялись.

## Проверенные области

| Требование | Проверка и результат |
|---|---|
| Affiliate destinations | Flight: approved stored HTTPS link, для Travelpayouts tp.media/r→точный Aviasales source URL. Stay22: existing allez/roam. Attractions: статический каталог69 cities/78items,40 affiliate/38 official-only,7 duration sources; все URLs HTTPS. Это записи каталога, не число опубликованных страниц/доступных билетов. Events: existing Ticketmaster wrapper/target allowlist. Production DB/export и живое разрешение всех shortlinks не выполнялись |
| URL parameters | partner_links.py проверяет marker/trs/fixed sub_id и exact decoded u; stored adapter меняет только разрешённый tracking_param. source_url сохраняет source path/ticket/query, отдельно нормализует display currency=pln и сохраняет expected_price_currency. Stay22 aid=hoptrip/campaign/lang/currency прежние. Existing API/unit tests подтверждают эти контракты; новые параметры/affiliate IDs не добавлены |
| Date propagation | Flight сохраняет provider source URL; изменения дат плана в него не подставляются, это уже явно сказано перед flight CTA. Stay22 получает явно выбранные/применённые местные checkin/checkout; invalid/reversed/same-day dates не создают searchable link. Event search date window относится к поездке, ticket URL остаётся provider URL; museum dates пользователь выбирает у продавца |
| Destination/passengers | Stay22 address сохраняет город, подтверждённые adults1–50 и изменённые даты; children/ages вручную у партнёра, unknown не превращается в adults. Flight сохраняет исходную идентичность source link, не обещает передачи изменённой группы. Attraction selection привязана к destination slug; EVENT_CLICK сохраняет связанный deal_slug. Семантика чужого encoded flight path/реальный passenger selection у продавца заново не подтверждались |
| External redirects | Existing named flight CTA/plan limitation, Stay22 new-tab label/summary/price note, attraction new-tab labels и ticket new-tab labels объясняют внешнюю проверку. Нативные href/target/rel не менялись в продукте; synthetic target подменяется только во время browser tests |
| Affiliate disclosures | Existing footer/service page и adjacent Stay22/attraction/event disclosures, sponsored/noopener/noreferrer policies сохранены. Нет искусственной срочности, скидок или price guarantees; новые тексты/переводы не понадобились |
| Consent and click tracking | Confirmed defect: localized ActivityLink передавал /en|ru|uk/... в API с bounded /info|deals path и терял deal_slug. Теперь existing localizedHref(path,'pl') нормализует только analytics context; API schema не ослаблена. Personal query/hash не отправляются. Single и variant ticket links теперь также учитывают auxclick button1, как existing attraction/Stay22 links; right auxclick игнорируется. Existing consent/dedupe/best-effort pipeline reused, никаких новых event names |
| Unavailable/expired URLs | available_deals_query проверяет visibility/status/departure/freshness/source expiry даже без worker; /go повторно проверяет approved program/HTTPS host и возвращает404/503 без успешного outbound journal при отказе. Старый source link очищается до неудачной refresh. Client expiry/unavailable panel и invalid stay fields сохраняются; cancelled ticket links скрыты. Потеря доступности на внешнем сайте после перехода не гарантируется и не маскируется |

[Статический inventory](link-inventory.json) хранит записи и исходный hash. Его URLs не менялись. Источники: local affiliate.py/stored.py/partner_links.py/catalog.py/availability.py, accommodation-links.ts/TripAccommodation, DestinationActivities/ActivityLink, TripEvents, provider safe_ticket_url. Это code/fixture review; условий договоров и текущих страниц всех партнёров задача не подтверждает.

## Реализация

- activity-link.tsx: один normalized source path для ACTIVITY_CLICK и извлечения deal_slug в PARTNER_CLICK. URL самой attraction link прежний. Strict API format и поля city/activity_id/link_kind прежние.
- trip-events.tsx: общий record callback для primary и middle-click обеих ticket branches. Native default action не отменяется, error/consent handling остаётся в track.
- affiliate-context.spec.ts:4 locales×deal/guide, primary/middle official/affiliate, actual API202/context/attribution/privacy,2 ticket-variant aux cases, refusal/withdrawal/network failure. Никаких real booking actions.
- funnel-analytics.spec.ts: existing intent collector теперь слушает request; response status проверяется отдельно. Это соответствует PARTNER_CLICK intent и не требует сохранения response event при уходе со страницы. Assertions categories/consent/privacy сохранены.
- Guarded e2e_app.py: fixed HTML capture endpoint и opt-in HOPTRIP_E2E_LOCAL_PARTNERS=1 middleware, который после настоящей local /go policy/journal заменяет Location на loopback. Работает только в test fixture с existing HOPTRIP_E2E=1 guard; production entrypoint не импортирует этот модуль.

[Task patch](changes.patch) отделяет эти изменения от большого исходного dirty tree. Snapshot2188 baseline files; existing config/dependencies/migrations/backend app/provider/adapter/attribution IDs/service content/предыдущие задачи/master plan сохранены.

## Результаты и ограничения проверки

- [API](api.txt), [JUnit](api.xml):55/55 passed; existing affiliate/partner-links/presentation/activity/funnel cases, SQLite/MockTransport/no live conversion API.2 existing TestClient/httpx/anyio warnings. Backend runtime не менялся; полный backend suite/PostgreSQL/mypy/Docker не запускались.
- [Unit](unit.txt):215/215, [ESLint](lint.txt), [TypeScript](typecheck.txt), [Ruff fixture](ruff.txt), [production-mode build](build.txt) passed. npm external env warning min-release-age сохранён; config/packages не менялись. Unit count прежний; новые regression cases находятся в браузере.
- [Before с корректной изоляцией](e2e-before.json):0pass/1fail,11.16s. В EN исходный ActivityLink дал [202,422], строгое ожидание [202,202] не прошло. Это подтверждённый product defect, исправленный normalized analytics path. Assertions не ослаблены.
- [Final desktop](e2e-desktop.json):14/14,62.67s; [final mobile](e2e-mobile.json):14/14,68.93s; unexpected/skipped/flaky0,errors=[],retries0.28unique project/scenario,16new+12existing. Desktop использовал предыдущий response collector старого funnel test; [follow-up этого1 desktop test](e2e-funnel-desktop.json) на final request collector также passed,16.57s, не добавляется к28. Product source одинаков во всех финальных runs.
- [Initial mobile](e2e-mobile-initial.json):8pass/1fail/5not-run,49.44s. Все новые cases прошли; старый funnel collector не увидел flight analytics response после ухода со страницы. Request collector измеряет исходное intent без delivery guarantee; полученные statuses по-прежнему проверяются. Runtime/URLs/async navigation не менялись ради этого failure.
-16 новых scoped axe scans +8 existing stay scans без violations;4 locales,320px stay controls, edited local dates/adults/money/share/reload/unknown-zone/one-way/same-day и original flight dates сохранены. [Один selected320px capture](stay-320.png) просмотрен. Это Chromium mobile emulation, не physical-device/full-site WCAG/full-suite certification.
- [Pre-guard repeat14/14](e2e-desktop-pre-guard.json) не суммируется. [Verification](verification.json)/[script](verify.cjs): source/test/fixture parity, snapshot task scope, local links/JSON/added whitespace, master plan hash и [свои ports closed](ports.json). Global diff --check содержит прежние97 trailing spaces только user master plan; он не редактировался.

## Ошибки изоляции — сохранены отдельно

[Incident record](isolation-incident.json). Первый [before-isolation](e2e-before-isolation.json),0pass/1fail,16.41s, открыл реальную Tiqets product page вместо synthetic destination: https://** не перехватил короткую ссылку. Один пользовательский переход мог учитываться партнёром; redirects/resources могли создать дополнительные requests, точное число/атрибуция не установлены. Покупки не выполнялись; production DB/credentials/infra не менялись. Исходный временный trace не архивирован; raw reporter error сохранён.

Ещё один [desktop popup diagnostic](e2e-desktop-popup-isolation.json),0/1/13,13.97s, получил WAF403 вместо фикстуры. Нативные popup requests в этом окружении могут обходить routing. Не утверждаем отсутствие внешнего запроса/следа этого запуска. Затем [loopback diagnostic](e2e-desktop-loopback-initial.json),0/1/13,14.33s, получил только local Next404: перехват тоже был обойдён, но уже без внешнего назначения.

Итоговая схема не полагается на interception как единственную защиту: проверяет исходный href и параметры, перед native click временно заменяет target на реальный guarded API loopback endpoint, после восстанавливает original href. Existing legacy specs получают такие же isolated-only targets. /go дополнительно удерживается fixture middleware на сервере; собственная policy/journal исполняется, external Location в браузер не попадает. Browser tests поэтому подтверждают href contract/handlers/context/consent, **не** живое прохождение shortlink/покупку. Два ранних внешних эпизода не скрыты; нельзя утверждать, что весь GROW-03 прошёл без real partner traffic.

## Воспроизведение и rollback

Из apps/web: npm run test:unit; npm run lint; node node_modules/typescript/bin/tsc --noEmit. Python55 cases перечислены в api.xml: запуск через SDK PyCharm после python-tools/get_python_environment, APP_ENV=test/DATABASE_URL=sqlite://. Ruff только apps/api/tests/e2e_app.py. Никаких installs.

Isolated workspace aud05-grow03 подготовлен prepare-e2e.ps1 и7 прежними untracked CSS/public/script assets; own SQLite/.next/public operator fixture/3125/8125/reuse=false, Next build/start, SDK3.12.10, обе mail boundaries in-memory. SMTP/digest/Telegram/editor/event-sync flags disabled. Root Playwright config unchanged; только isolated legacy specs содержат target substitution/network boundary/serviceWorkers block. Final fixture source содержит test endpoint/middleware; root production app/affiliate adapters/providers и все URL data прежние.

Rollback: вернуть только2 runtime components по patch, сохранив ANALYTICS-01 producers; отдельно можно убрать новый test fixture endpoint/flag и regression tests. DB migrations/credential changes/affiliate parameter rollback не нужны. Не делать общий reset предыдущих задач. Existing 1s action dedupe/context-menu loss и best-effort delivery остаются ограничениями метрик. Нет claims о revenue/conversion uplift, правильности фактической seller price или согласованности пользовательского черновика с продавцом без его проверки.

GROW-03 DONE; roadmap docs обновлены. Следующая eligible ANALYTICS-02; она не начата. Остановка.
