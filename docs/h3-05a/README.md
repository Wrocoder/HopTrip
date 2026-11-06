# H3-05a — привязка сохранённой Aviasales-ссылки к текущему билету, 2026-11-03

**DONE; общая H3-05 IN_PROGRESS.** Следующий отдельный запуск — **H3-05b**: остальные provider/date/guest boundaries и end-to-end контракты по матрице ниже. Коммит/deploy не выполнялись.

## Подтверждённая проблема

`sync_partner_links` уже проверяет nested `u` относительно текущего source URL и очищает старую ссылку перед повторной конвертацией. Однако `component_policy` раньше проверяла только onboarding/capability/HTTPS/allowed host. Между изменением raw ticket и следующим sync сохранённая ссылка продолжала считаться доступной. Её дата/аэропорт/opaque ticket могли относиться к прежней source observation. Общая host allowlist не подтверждает совпадение билета.

До исправления новый тестовый набор дал **12 failed /1 passed**: 11 проверок подтвердили отсутствие read-time контроля source/attribution/type binding, ещё один failure был ошибкой положительной fixture (mock converter переставлял повторяющиеся query values). Это не 12 независимых продуктовых дефектов. [Исходный вывод](before.txt), [JUnit](before.xml). Catalog действительно объявлял устаревший component available. Старый `/go` использовал ту же policy, но первый red test останавливался на catalog assertion; отдельный успешный stale redirect до fix этим тестом не заявляется.

## Реализация и совместимость

Для пары **provider=travelpayouts / program=aviasales** существующая policy теперь на чтении и в `/go`:

- допускает только FLIGHT (case-insensitive, как существующий `/go`), отклоняет HOTEL/ACTIVITY;
- требует `tracking_param=None`, сохраняя converter placement sub_id вместо подмены per-click ID;
- получает связанный текущий TravelOffer source=travelpayouts_data с object payload/link;
- переиспользует существующие `source_url` и `valid_partner`: nested target обязан совпасть с текущим source URL, включая opaque ticket/query context; marker/trs/sub_id/u проверяются строго;
- сверяет marker/trs с **существующими публичными настройками проекта в API runtime**. Отсутствующие или изменённые IDs делают ссылку недоступной до согласования/sync. API token и включённый refresh для чтения не требуются.

При расхождении — existing unavailable component (`ITINERARY_LINK_MISMATCH`, redirect_path=null), `/go` возвращает 503 без Location и без успешного AffiliateClick/AnalyticsEvent. Неверный тип/override tracking получают существующие UNSUPPORTED_CAPABILITY/UNSUPPORTED_TRACKING. UI использует прежний локализованный noLink state PL/EN/RU/UK. Новых пользовательских строк и API fields нет.

Проверка read-only: не чинит БД, не синхронизирует ссылки и не обращается к провайдеру. Generic stored programs, onboarding gates, expiry и consent semantics сохранены. `source_url` по-прежнему меняет только display currency на PLN, сохраняя expected_price_currency и остальные параметры. Порядок разных query keys не влияет на идентичность, порядок повторяющихся значений сохраняется. Ничего не дописывается к opaque flight ticket из ручных дат/числа пассажиров плана.

**Риск rollout:** public marker/project должны быть заданы и согласованы в API runtime, а не только у worker конвертации. Иначе ранее разрешённая Aviasales-ссылка станет unavailable. Это намеренное условие достоверности атрибуции; production environment не проверялось и не менялось. При ротации IDs устаревшие ссылки требуют штатного sync, который в этом запуске на реальных провайдерах не выполнялся. Не отключать проверку ради видимого CTA без подтверждённого контракта.

Проверка подтверждает совпадение с текущим source ticket; она **не декодирует** opaque provider path в доказанные даты/тариф/пересадки, не подтверждает live availability и не решает внешнюю потерю контекста после перехода на сайт партнёра. Это остаётся границей H3-05b/manual smoke.

## Матрица найденных link paths и контрактов

Это инвентаризация текущего кода и локальных документов, **не** перечень активных production аккаунтов и не новая внешняя проверка provider API.

| Path / provider | Что сейчас строится и передаётся | Ограничения / остаток |
|---|---|---|
| Travelpayouts → Aviasales (`partner_links.py`, stored adapter, `/go`) | Source `/search/…` целиком в nested `u`, currency=pln; outer tp.media/r marker/trs/placement sub_id. Approved provider/program, host/capability/expiry checks, optional internal consent context | 05a закрывает stale source/attribution read-time hole. Source opaque path не разбирается как новый API. Даты/группа, изменённые в плане, не передаются; существующий UI это раскрывает. Direct/connecting/open-jaw identity не переписывается |
| Generic DB-configured stored programs (`affiliate_adapters/stored.py`) | Только готовый HTTPS URL на approved exact host; configured tracking_param меняется на internal tracking ID | Provider-specific даты/guests из неизвестного opaque URL не угадываются. Нет универсального typed itinerary builder. Реестр production DB не читался; 05b должна явно отделить поддержанные контракты от generic ручных ссылок |
| Stay22 (`accommodation-links.ts`, TripAccommodation) | Фиксированный HTTPS allez/roam: aid=hoptrip, address (raw city, URL encoded), checkin/checkout, adults, campaign=hoptrip_accommodation, lang=pl, currency=PLN | Календарные даты валидируются, checkout>checkin, integer adults; UI требует подтверждённых взрослых и 1–50. План меняется явно; source arrival/return departure предлагаются через StaySuggestion. Home arrival не добавляет hotel night. Дети/возраст/rooms не передаются, UI раскрывает ограничения. Builder/UI boundary, month-end/Unicode/late-arrival cases — 05b |
| Ticketmaster events (`providers/ticketmaster.py`, events service, TripEvents) | Cached ticket/variant URL; `safe_ticket_url` проверяет affiliate host/path и единственный nested official target, исключает credentials/unsafe redirect params; ссылки не строятся из произвольных пользовательских дат | Search dates не гарантируют ticket date/availability, passenger counts не добавляются. Сохраняются source event/variant URLs. Проверить продуктовый смысл dates/variants/expired/missing в 05b; live redirect здесь не выполнялся |
| Tiqets activities (`destination-activities.ts`, activity-expansion.json, DestinationActivities) | Reviewed static product affiliateHref или отдельный official href, исходные attribution URLs сохраняются | Editorial snapshot, не live inventory. Даты/guests из плана не добавляются к неподдержанному URL. `target=_blank`, sponsored noopener noreferrer; official links без sponsored. 05b — completeness disclosure/encoding matrix |
| Welcome Pickups transfers (`airport-transfers.ts`) | Три owner-confirmed tpx.gr ссылки, registry slug/verifiedAt gate, HTTPS без credentials | Static opaque links для Malaga/Alicante/Prague, не вычисляют flight date/guests или transfer duration/price. Внешняя верификация датирована в registry, свежей здесь не считается. Передачу неподдержанных параметров не изобретать |

Flight Outbound сейчас открывается в текущей вкладке, rel=sponsored noopener; Stay22/Tiqets/event links в новой вкладке с sponsored noopener noreferrer (official без sponsored). H3-05b должна проверить referrer/target policy для каждого пути, не объявлять все ссылки одинаковыми. Click journal ≠ booking/conversion. Существующие analytics flags и bounded events не расширены.

## Проверки

SDK: PyCharm Python 3.12.10 `.venv/Scripts/python.exe`; dependencies не менялись. Внешние HTTP calls конвертера заменены `httpx.MockTransport`. Browser — изолированная копия `.cache/aud05-h3-05a-20261103`, production web server, Chrome desktop/mobile, loopback 3125/8125. Public fixture IDs 123/456 заданы только дочернему процессу тестового runtime; production env не читался.

| Проверка | Результат / evidence |
|---|---|
| Targeted pytest binding +partner_links +affiliate | **54 passed** до последних 3 type/case cases; [вывод](targeted-final.txt), [JUnit](targeted-final.xml). Последние cases включены в полный финальный прогон |
| Полный `-m pytest -q -p no:cacheprovider --junitxml=docs/h3-05a/api-final.xml` | **1017 passed /18 skipped**, 35.46s; [вывод](api-final.txt), [JUnit](api-final.xml) |
| `-m ruff check apps/api --no-cache` | PASS; [вывод](ruff-final.txt) |
| `-m mypy apps/api/app --cache-dir .cache/h3-05a-mypy` | PASS, 118 source files; [вывод](mypy-final.txt) |
| `npm run test:unit` | **236 passed**, [вывод](node.txt) |
| `npm run lint` | exit 0, [вывод](lint.txt) |
| `npm run build` в isolated copy | exit 0, TypeScript passed; [вывод](build.txt) |
| `npm run test:e2e -- flight-link-binding.spec.ts affiliate-context.spec.ts --reporter=json` | **24 passed**, [JSON](browser.json), [вывод](browser.txt) |
| IDE build_project изменённых файлов | isSuccess=true, limited diagnostics |

Новые API tests проверяют изменение routes/ticket query, missing/non-object source, catalog unavailable +go503 без journal, public ID mismatch/missing, запрет tracking override, missing source, query ordering, lowercase flight/type mismatch. Положительный native redirect сохраняет Unicode/repeated opaque values и public attribution без API token/refresh, без consent AnalyticsEvent. Синтетические adults/ticket values в тесте — проверка непрозрачного сохранения source, не утверждение о новых поддерживаемых provider fields.

Первый положительный mock сортировал повторяющиеся t-values и потому не проходил уже существующую exact URL validation; исправлен mock, не ослаблен production validator. Исходные targeted failures сохранены. Full API до последних type cases также прошёл 1014/18; финальный 1017/18 отражает окончательный код.

8 новых browser cases (4 locale ×desktop/mobile) проверяют доступный CTA, реальный Location с правильным nested ticket через HTTP **maxRedirects=0**, затем изменение source, go503/no Location и скрытый CTA +локализованный noLink. 16 существующих cases покрывают Tiqets/event URL/context, middle click, consent и analytics failure; внешняя навигация перехвачена или заменена loopback destination. Настоящие партнёрские переходы не совершались. Browser прогон предшествует последнему расширению type guard; обычная uppercase FLIGHT branch не изменилась, новые case/type ветви проверены итоговым API suite.

Ограничения: PostgreSQL 18 skipped, прежние два deprecation warnings Starlette/httpx/anyio; реальная partner destination correctness, production credential deployment/capacity, WebKit и полный accessibility/performance sweep не проверялись. Общая H3-05 пока не DONE.

## Контролируемый manual smoke — только отдельное разрешённое выполнение

Чеклист подготовлен, **не выполнен**. Перед реальным external transition нужно явное разрешение согласно §1.3 V3; local mock/fixture проверки выше его не требуют.

1. В согласованной среде подтвердить approval/capability/hosts и public IDs API/worker; не выводить токены, личные данные, opaque ticket или raw affiliate URLs в публичный отчёт.
2. Для разрешённых synthetic/canary direct/connecting/open-jaw и midnight-return cases записать ожидаемые исходные аэропорты/локальные даты, отдельно stay checkin/out и adults-only. Не переносить home arrival в hotel checkout автоматически.
3. Проверить финальный href/Location/attribution локально до внешнего перехода, запретить unsafe schemes/credentials/duplicate redirect targets. Не снимать trace с credentials/PII.
4. Только по разрешению открыть партнёра desktop/mobile; сверить итоговые dates/airports/adults или явно увидеть, что это самостоятельный поиск/нужен ручной выбор. Missing/unsupported parameter — disclosed limitation, не основание придумывать URL syntax.
5. Не покупать/не бронировать/не подтверждать платёж/не отправлять реальную подписку. Click не отмечать как booking. Закрыть переход и зафиксировать только обезличенный pass/fail, дату и ограничения.
6. Отдельно проверить expired/revoked/unconfigured states без внешнего перехода; при несоответствии остановить доступность конкретной ссылки штатным механизмом, не отключать глобальную валидацию.

## Файлы, rollback и следующий запуск

Runtime: только `apps/api/app/services/affiliate.py`. Tests: новый `test_flight_link_binding.py`, test-only endpoint в `e2e_app.py`, новый web `flight-link-binding.spec.ts`. H3 docs. Миграций, DB backfill, новых dependencies/feature flags, production jobs и реальных отправок нет.

Rollback: вернуть только import/get_settings/source-binding delta в affiliate.py, удалить новые tests/fixture endpoint и соответствующую H3 запись. Сохранить все прежние 01/02/03/04 изменения и пользовательские IDE файлы; общего reset не делать. Rollback вернёт возможность устаревшего перехода, поэтому лучше штатно восстановить актуальную binding/configuration.

Следующая отдельная задача **H3-05b**: по матрице завершить supported/unsupported parameter contract tests для hotel/event/activity/transfer и generic stored paths, late-return/open-jaw/month-end/missing/expired/mobile cases; проверить disclosure/target/referrer и границы детей/rooms/manual planner dates. Реальный smoke остаётся отдельным действием с разрешением, его отсутствие не заменять фиктивным PASS. Здесь остановка; H3-06 не начинается.
