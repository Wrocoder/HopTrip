# TRIP-04 — контекст и достоверность событий поездки

Дата: 2026-10-31. Только TRIP-04; зависимость TRIP-01 DONE. Статус: DONE. TRIP-05 не начата.

## Проверено до изменений

Существующий TripEvents уже запрашивал локальный каталог по destination и общим stay dates, поддерживал независимые даты, категории MUSIC/SPORTS/CULTURE, day navigation/pagination, grouping standard/premium без объединения разных сеансов, flight-fit warnings, состояния loading/empty/error и сохранение выбранных событий в общем draft/budget/share. Повторная реализация этих функций не нужна.

API public read не обращается к Ticketmaster: EventService читает fresh active LocalEvent и coverage windows. Sync получает данные отдельно, проверяет город/страну/зону/affiliate URL, ограничивает запросы и скрывает исчезнувшие записи только после успешного обновления. Provider исключает dateTBA/dateTBD, cancelled/postponed/offsale/unknown и test events. Эти правила не менялись. Каталог не знает количества свободных мест и не подтверждает покупки.

Payload уже имел категорию OTHER, но UI и query enum не позволяли её выбрать. Карточки уже показывали venue/city/date/local time и rescheduled, но не называли зону; при отсутствии checked_at не было явного unknown check time. В API single-day start clocks проверялись на прошлое, а известный end_at многодневного события не исключал уже закончившуюся запись в текущий день.

EventRead не содержит изображений. Текстовые карточки уже обходятся без img/fetch/placeholders, не теряют название/дату/место при отсутствии иллюстрации. DestinationActivities уже показывает категории, редакционные описания, официальные/партнёрские ссылки, provenance/duration source, дату проверки и переход к бюджету. Там не заявляется доступность на выбранные даты. Это сохранено; новые изображения, цены, геоданные и travel times не выдумываются.

Изучены runtime schemas/provider/service/sync/grouping/API/flight-fit, TripEvents/shared draft/PlannedEvents/budget, DestinationActivities, связанные unit/API/browser tests и установленная Next документация use-client/server-client components.

## Изменения

- Фильтр OTHER доступен на PL/EN/RU/UK и читается тем же category SQL условием локального каталога. Day/page сбрасываются по прежнему query ownership, stay/budget/selected events не меняются. CULTURE сохраняет широкий смысл источника; узкий фильтр «выставки» без отдельной классификации не придуман.
- Рядом с местным временем видна проверенная Intl timezone события; неизвестная зона не заменяется UTC. Пустые venue/city и время явно отмечены. Переводы source данных не придумываются, native title/venue/date остаются исходными.
- Sale state виден на карточке. onsale — запись источника с просьбой проверить наличие, rescheduled — прежнее предупреждение, offsale — неактивные продажи, без вывода о причине или «sold out». Unknown не превращается в доступность. Для offsale/unknown нет ticket CTA и AddEventToPlan; у вариантов билетов проверяется также их собственный статус. Legacy option без status наследует допуск родительского события. Parent offsale не обходится активным option.
- Источник Ticketmaster и время проверки показываются и при отсутствии timestamp. Для malformed/naive timestamp выводится unknown; недопустимая дата не форматируется как реальная. Видимый текст отличает catalogue check и price-from от live inventory. Известные unavailable statuses по-прежнему исключаются provider до каталога; defensive UI guard не расширяет ingestion policy.
- API исключает любое событие с валидным точным end_at <= now, в том числе многодневное, до grouping/total/pagination/flight_fit. Переиспользован event_end_instant с теми же проверками, что раньше были внутри event_flight_fit: aware instant, соответствие end_date, конец после возможных начал. Naive, противоречивый или отсутствующий конец не служит доказательством завершения; их не угадываем. Ongoing multi-day остаётся, date-only unknown time не превращается в полночь.

Все прежние формулы flight-fit/budget, grouping/link URLs/affiliate attribution, max-age/coverage/quota/sync, consent/tracking, shared/local storage schema и SEO сохранены. Нет новых dependencies, DB migrations/backfill, provider/image запросов или новой логики TRIP-05.

## Проверки

[До исправления API](backend-before.txt):3 failed,5 passed — два ended multi-day случая и OTHER422. [После](backend.txt), [JUnit](backend.xml):118 passed,2 прежних deprecation warnings. Восемь новых cases: before/equal/after now, missing/naive/contradictory end, OTHER реальный local read со stale/inactive suppression, pagination и rejected unsupported category. Прежние event provider/grouping/flight-fit/sync/scheduler cases прошли.

[Node unit](unit.txt):177 passed,4 новых cases — sale/option gates без выдуманного inventory, valid/missing zones, строгий aware check time,4 locale confidence/missing copy. [Ruff](ruff.txt), [mypy](mypy.txt):passed,101 source files. [ESLint](lint.txt) / [Next build/TypeScript](build.txt):passed,61 static/SSG pages. Full backend/PostgreSQL не запускались; DB schema/indexes/locking не менялись.

Первый прогон прерван после повторяющегося timeout нового exact-label локатора категории. [Исходный context](initial-locator-context.md) и [метаданные прерывания](e2e-interrupted.json) сохранены; полного JSON summary у прерванного runner нет, число прошедших cases ему не приписывается. Role combobox с прежним точным accessible name соответствует DOM snapshot. Query/category/date/cost assertions сохранены, код продукта из-за этого timeout не менялся. Повтор использует новую isolated copy; отдельно включены прежние activities.spec.ts. Остановлены только runner и его18 потомков после проверки PID/creation/command line/дерева; чужие порты не трогались.

[Финальный browser JSON](e2e.json):64/64 passed,397.50s,unexpected0,skipped0,flaky0,errors=[],retries0. Новые10 cases и прежние54 проверили4 locales, OTHER/query context, date/party/flight/event amounts, sale/option gates, venue/city/zone/time/check unknowns, отсутствие image requests, source/affiliate URL/rel и mocked new-tab. Прежние sync/other dates/day/page/late-response/long-stay/restoration/flight-fit, independent ticket sessions/variants/costs/save/share/locale, attractions registry/links/no-flight-price-change и consent tracking прошли. Full E2E suite не заявляется; число прерванного запуска не суммируется.

Просмотрены [desktop320](events-320-desktop.png) и [mobile320](events-320-mobile.png): карточка без изображения содержит local zone, unknown time, sale provenance и source/check disclaimer; поля/кнопки и текст без horizontal overflow. Screenshots в CSS pixels, выбранное состояние в двух Chrome emulation проектах имеет одинаковый bitmap. Scoped axe в выбранных состояниях не выявил violations.

[Source parity](source-parity.json):553 runtime files apps/api/app + apps/web/src совпали с checkout. Test/config ports только3125/8125. [Финальная сверка](verification.json): JSON reports/Markdown links/whitespace, unchanged master plan и next-env.d.ts, [свои порты](ports.json) закрыты. Пользовательские master plan/IDE и предыдущие задачи сохранены.

Python toolchain использовал SDK модуля из PyCharm, Python3.12.10/.venv, без installs. Тесты API используют in-memory SQLite, dependency override, synthetic events и provider mocks. Новые unindexed files не являются источником выбора другого SDK: configured module определялся по существующему test_events.py.

## Файлы

- API: [schemas/event.py](../../apps/api/app/schemas/event.py), [api/events.py](../../apps/api/app/api/events.py), [services/event_flight_fit.py](../../apps/api/app/services/event_flight_fit.py).
- Web: [TripEvents](../../apps/web/src/app/components/trip-events.tsx), [CSS](../../apps/web/src/app/components/trip-events.module.css), [presentation helpers](../../apps/web/src/lib/event-presentation.ts), [4 locale copy](../../apps/web/src/lib/i18n/event-context-copy.ts).
- Новые проверки: [API](../../apps/api/tests/test_trip_event_relevance.py), [Node](../../apps/web/tests/event-presentation.test.mjs), [browser](../../apps/web/tests/event-context.spec.ts).
- Отчёт/artifacts этой папки, HOPTRIP_PROGRESS/AUDIT/DECISIONS/TEST_PLAN. Master plan и предыдущие пользовательские изменения сохранены.

## Воспроизведение и безопасность

Перед каждой Python toolchain командой получить SDK через PyCharm get_python_environment для существующего файла модуля. Задать APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Использовать точный executablePath:

```powershell
SDK -m pytest apps/api/tests/test_trip_event_relevance.py apps/api/tests/test_events.py apps/api/tests/test_event_browsing.py apps/api/tests/test_event_grouping.py apps/api/tests/test_event_flight_fit.py apps/api/tests/test_event_sync.py apps/api/tests/test_event_scheduler.py -m 'not postgres' -q
SDK -m ruff check apps/api/app/schemas/event.py apps/api/app/api/events.py apps/api/app/services/event_flight_fit.py apps/api/tests/test_trip_event_relevance.py
SDK -m mypy
npm --prefix apps/web run test:unit
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

После build создать новую изолированную копию `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-trip04-new`; существующие каталоги не перезаписывать. Build не запускать параллельно browser. Восстановить только generated next-env.d.ts к прежнему dev/types import и проверить отсутствие diff. Собственные3125/8125, guarded HOPTRIP_E2E=1 fixture, disposable SQLite/fake providers/отдельный .next, reuse=false. Чужие3100/8100 не останавливать.

В isolated apps/web задать HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome и безопасные env выше:

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)event-context\.spec\.ts$' '(^|/)events\.spec\.ts$' '(^|/)events-sync\.spec\.ts$' '(^|/)event-browsing\.spec\.ts$' '(^|/)event-results\.spec\.ts$' '(^|/)planned-events\.spec\.ts$' '(^|/)localized-events\.spec\.ts$' '(^|/)event-flight-fit\.spec\.ts$' '(^|/)activities\.spec\.ts$' --reporter=json
```

Ticketmaster new-tab переход нового теста перехватывается локальным HTML; реальная продажа/availability/fulfillment не проверяются. Production/credentials/DB/реальные кампании и платные API не затрагиваются. Внешние изображения не загружаются. Headless Chrome/mobile emulation и scoped axe не являются проверкой физических устройств, конверсии или полной WCAG сертификацией.

## Release / rollback / ограничения

Изменение API additive: новый допустимый query OTHER, response/storage schema прежние. Выпускать API перед web или согласованно, чтобы новый фильтр не получил422 от старого API. При rollback сначала убрать новый web filter; серверный OTHER лучше оставить до завершения перехода cached clients. При откате UI сохранить исправление ended-event guard. При необходимости отката общего end-time helper менять его и call sites вместе; удаление guard вернёт выявленный дефект с завершившимися multi-day events. Откатывать только TRIP-04 TripEvents/CSS/presentation/copy и связанные tests, не весь HEAD с предыдущими задачами и пользовательскими правками.

Миграции/cleanup local drafts/cookies не нужны; новые бюджетные/storage функции не вводились. Сохранённый selected event остаётся snapshot с ручной PLN стоимостью и требует повторной проверки у продавца, не превращается в live ticket inventory. Свежесть каталога ограничена существующим max-age и источником, не является обещанием наличия; непрерывный live monitoring открытой вкладки не добавлялся. Неизвестный конец/время/наличие помечаются, не реконструируются. Проверки travel time без координат и новых venue маршрутов не выполняются. Прежние API/cold-entry observations остаются открытыми.

TRIP-04 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production не менялся. Следующая доступная задача — TRIP-05; она не начата. Остановка после этой задачи.
