# H3-13 — события и фактическое расписание перелёта

**Поправка H3-17b1, 2026-11-05:** исходные browser-прогоны этого отчёта использовали `next dev`, а не `next start`; прежняя пометка production-browser была ошибочной. Числа остаются валидными development functional evidence, успешный production build — отдельной проверкой. [Аудит режима](../h3-17b1/runtime-mode-audit.json). В новом [настоящем production-прогоне H3-17b1](../h3-17b1/browser-production.json) дополнительно прошли 14 новых feature cases этой задачи; это не перепроверка всего прежнего suite.


2026-11-04. Только H3-13. PR/commit/deploy не создавались; H3-14/15/17/18 здесь не реализуются.

## Reconciliation и выбранный объём

Гипотеза «совпадение календарных дат всегда считается совместимостью» **NOT REPRODUCED**: прежние `event_flight_fit.py`/`combined_flight_fit` уже различают CONFLICT/TIGHT/CHECK/NO_KNOWN_CONFLICT. Учитываются aware timestamps прилёта и обратного **вылета**, event zone, конец/неизвестная длительность, DST gaps/folds, one-way/unknown flight clocks, worst-case ticket options. Буфер180мин — продуктовый порог, не рассчитанный трансфер. Эти алгоритмы, FlightFacts/H3-02/H3-07 и grouping не переписаны. До изменений [60 API cases](api-baseline.txt) PASS; [development baseline2/2](browser-baseline.json) показал видимые конфликты/unknowns и отсутствие fit filter (только category/day selects).

**CONFIRMED**: переключателя «все / может подойти» не было; даже NO_KNOWN_CONFLICT не подтверждает дорогу до venue. Добавлен opt-in фильтр и более осторожный label «может подойти — проверьте дорогу» на4locale. Default All сохраняет прежний набор; неопределённости не скрываются по умолчанию и остаются даже в possible. Новая классификация или гарантии attendance/ticket availability не вводятся.

## Источник и время

Источник — прежний Ticketmaster Discovery. Нормализатор принимает только reviewed city/country/zone, отсекает mismatched zone и malformed/inconsistent timestamps. Если provider zone отсутствует, используется reviewed city fallback; UI показывает zone, не часовой пояс зрителя. TBA/noSpecificTime остаются unknown, end time не выдумывается. Provider сохраняет onsale/rescheduled, offsale/sold-out не превращаются в доступные билеты; если клиент всё же получает offsale/unknown status, прежний `eventTicketsAllowed` скрывает покупки/добавление. Price floor и время проверки не подтверждают live ticket inventory.

Public endpoint читает локальный каталог, не вызывает Ticketmaster. Прежние freshness cutoff `events_max_age_hours` (default30h, допустимо6–48), checked_at, partial coverage и1000-row cap не менялись; partial остаётся явным, «все» относится только к текущей поисковой выборке. Filter работает по исходному flight schedule и не сертифицирует изменённые даты проживания; stay/other search window по-прежнему независим от дат перелёта. Airport/venue route не рассчитывается. H3-05 attribution, partner URL allowlist/consent и analytics прежние.

## API/UI и совместимость

- Прежний `GET /api/v1/deals/{slug}/events` получает optional `fit_mode=all|possible`, default all. Ответ добавляет одноимённое поле; новый DB/model/shared-payload format не требуется. Unknown modes422; прежний default `date_mode=flight` и его bounds/eligibility сохранены, UI как прежде запрашивает stay/other.
- Possible исключает **только CONFLICT**, сохраняя CHECK/TIGHT/NO_KNOWN_CONFLICT. Оценка worst ticket option выполняется после grouping и до total/page slicing. Default all не получает дополнительный full-catalog fit pass. Идентичности, порядок вариантов, URL, checked_at/partial и данные общего каталога не изменяются.
- UI4locale: explicit all/possible, видимое пояснение об uncertainty/ground travel, возврат к all из filtered-empty, прежние retry/error/partial/day/category/pagination. Смена filter сбрасывает day/page, не меняет stay/budget. Other dates требуют explicit Search, смена filter не применяет ещё не отправленные даты автоматически. Filter не входит в saved/shared plan и после reload начинается с all.
- Старый API без echo fit_mode читается в all; possible не выдаётся за выполненную фильтрацию, показывает объяснение и кнопку All. Строгий клиент отклоняет possible с отсутствующей assessment или явным CONFLICT. Late response покинутого filter не подменяет текущий результат. Ввод и независимые сохранённые планы не меняются.
- Public SEO URLs/canonical/hreflang/metadata, saved v2 ID/revisions/session drafts, portable/legacy v1 links, provenance/profiles/selected events и analytics taxonomy не менялись. Миграций, пакетов, cloud consent или аккаунтов нет.

## Проверки

- [Полный API suite](api.txt)/[JUnit](api.xml):1103passed,18PostgreSQL skipped,0fail;11 новых filter cases. [Focused71](api-focused.txt) PASS. Прежние DST gaps/folds, timezone/arrival/return/missing end/multi-day/late-night/one-way/grouped-ticket tests сохранены и проходят.2 прежних Starlette/httpx deprecation warnings не скрыты.
- [309 Node](node.txt),0fail/skip;3 новых cases проверяют old API/all compatibility, strict possible response и copy4locale.
- [66/66 development browser](browser.json):14new+52regression, desktop/mobile, первый запуск без retries/skips/flaky/fail.4locale filter/empty recovery/keyboard/uncertainty/offsale/consent; page/day reset; explicit other-dates search; unsupported old API и inconsistent assessments/retry; late response ignoring abort. Прежние event context/date sync/grouped results/selection/budget/share/reload/legacy links/offline states сохранены. [Итог](verification.json).
- [Build](build.txt),[ESLint](lint.txt),[TypeScript](types.txt),[Ruff](ruff.txt),[mypy122files](mypy.txt) PASS. IDE build success с limited diagnostics; CLI build/types дают compiler evidence. Git diff whitespace check PASS.
- [Source parity](source-parity.json):6runtime/11web-test sources совпадают с изолированным runtime (только loopback test ports нормализованы), ровно ожидаемые2API+4web runtime delta.20 прежних classifier/provider/grouping/freshness/storage/budget/SEO/dependency modules byte-identical с12c. Новые API tests выполнены в корне на тех же runtime bytes. [Desktop](event-fit-filter-320-desktop.png)/[mobile](event-fit-filter-320-mobile.png)320px просмотрены; axe и horizontal overflow assertions проходят.

Runtime `.cache/aud05-h3-13-20261104`: next dev (Next16.4.3)/Chrome desktop+mobile, loopback3125/8125, synthetic SQLite API. Build/start согласованы с `NEXT_PUBLIC_API_URL=http://127.0.0.1:8125`, `HOPTRIP_API_URL` тем же и site3125. PyCharm SDK Python3.12.10; provider responses/partner boundaries только fixtures/mocks, реальных продавцов/платных API/уведомлений нет. Prepare-e2e + прежние untracked airport registry,2 browser fixtures и synthetic operator JSON. IDE limited diagnostics не заменяет CLI build/type checks. PostgreSQL/WebKit/real devices/manual screen reader/production CWV/GSC/deliverability не проверялись.

На старте было69MiB свободного места. После проверки exact absolute paths/ancestors/reparse points удалены **только собственные completed generated.next**:08a169.58MiB; после baseline12c122MiB (1junction удалена как link без обхода target); во время проверки07b162.73MiB и07a113.35MiB. [Записи](cache-cleanup.json). Source copies/shared dependencies/H3 evidence/чужие dirty changes сохранены; активная13-сборка и чужие процессы не останавливались.

## Rollback и следующий шаг

Feature flag не нужен: all — default и прежнее поведение. UI filter можно убрать отдельно; старый frontend игнорирует additive response field. При backend rollback новый UI распознаёт отсутствие подтверждения possible и предлагает all; не делать silent client-only filtering одной страницы. Вернуть только6runtime delta, сохранив прочие H3 changes. DB/saved/share rollback/migration не требуется.

Известные CLS0.137–0.292, first-price1004.14>900, RU/UK desktop CTA920.140625>900 и неизвестная причина transient11a cross-tab остаются H3-17b. Этот прогон не объявляет сайт целиком green. Следующая отдельная задача — **H3-15**; H3-14 по-прежнему externally blocked. Остановка до следующей задачи.
