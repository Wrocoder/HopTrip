# TRIP-02 — местные даты и понятный контекст поиска жилья

Дата:2026-10-31. Только TRIP-02, зависимость TRIP-01 DONE. TRIP-03 не начата.

## Проверено до изменений

Stay22 уже получал original destination city, editable checkin/checkout/adults, aid=hoptrip, campaign=hoptrip_accommodation, lang=pl, currency=PLN. Даты и взрослые уже общие с budget через TripDraftProvider, расходы сохраняются в local draft/share snapshot. Same-day/reversed/invalid stay не получает ссылку, дети не превращаются автоматически во взрослых. Full clock hints уже находились в #stay-schedule.

Даты формы первоначально равны датам предложения, что не обязательно совпадает с местным прилётом. Перенести local schedule dates можно было только вручную; выбранный summary скрывался при неполном вводе, а отсутствие автоматической hotel quote пояснялось в раскрытии. Эти места улучшены. Условия подключения и attribution провайдера не менялись.

Изучены TripAccommodation, Stay22 URL helper, shared draft/date counts, budget/saved/share flows, flightLegs/clock validation, quality contract, unit/browser tests и установленная Next документация server/client components.

## Поведение

- Видимая подсказка показывает местные даты прилёта и обратного вылета при известной зоне соответствующего аэропорта и поддерживаемой source quality COMPLETE/PARTIAL. Для CRITICAL_INCOMPLETE/legacy/unknown quality автоматического предложения нет.
- Кнопка переносит эти даты в общий stay/budget draft только по явному нажатию. Это planning hint: ранний прилёт не гарантирует доступного check-in, estimated arrival явно помечен. Пользователь может выбрать прежнюю ночь/другую дату, учитывая трансфер и условия жилья.
- Предложение использует arrival at destination и return departure at its own origin airport. Home arrival after midnight не добавляет hotel night. Unknown zones не заменяются UTC-днём, return zone не копируется из outbound. Для one-way checkout не выдумывается; существующий manual checkout сохраняется. При переносе same-day dates не добавляется ночь и по-прежнему не создаёт Stay22 link.
- Применение сохраняет все введённые суммы, people/adultsOnly, events/context. nights/days пересчитываются существующим changeStayDate, review=true. Defaults провайдера, source flight dates/URL, restored drafts и snapshots автоматически не переписываются. Новых budget modes/formulas нет.
- Выбранные city/date/adult summary видны и при неполном вводе: неизвестная дата или неподтверждённые взрослые обозначены явно. Unconfirmed adults имеют aria-invalid/error, численность группы остаётся в budget; конвертации детей нет.
- Рядом с CTA явно указано, что цену/наличие проверяют в Stay22, HopTrip не получает hotel quote, а budget amounts вводятся вручную. Это относится и к скопированной пользователем цене, и к его оценке; приложение не помечает сумму подтверждённой котировкой. Accessible description CTA включает выбранный context и price note.

Все новые строки PL/EN/RU/UK. Исходные CTA name, destination/guest/date params, provider URL, tracking/consent/target/rel сохраняются. Один набор дат/взрослых по-прежнему синхронизирован с budget, без обязательного повторного ввода. API runtime/DB/schema/freshness/score и affiliate configuration не менялись.

## Даты и доверие к данным

flightLocalCalendarDate переиспользует строгий parser aware instants и validFlightZone. Calendar parts берутся в зоне аэропорта через Intl/Gregorian/latn, проверяются validCalendarDate0001–9999; BCE/10000 не превращаются в допустимую дату. Это отдельный helper, прежние flightTime/day-shift функции не пересчитывались.

Выбор optional action намеренный: местная дата прилёта не определяет, с какой ночи путешественнику нужна комната. Сохранённый manual plan остаётся главным; при изменении schedule hint повторное нажатие — решение пользователя. Нет неявной миграции дат или денег. Для неизвестного/сомнительного расписания остаются поля и просьба проверить local dates.

[Read-only fixture probe](fixture-probe.json) подтверждает synthetic overnight case: departure1May, local arrival2May, return departure4May, home arrival5May. Предлагается2–4May. Дополнительные unknown-zone/one-way/same-day views сериализуются через existing test app; source rows не меняются. Это не реальные fares/quotes.

## Проверки

- [Unit](unit.txt):168 passed,8 новых cases — overnight/home-after-midnight, DST/date line, missing/naive/invalid clock/zone/year boundary, independent return zone/quality gate, immutable apply preserving costs/people/events, one-way checkout, same-day no-search,4 locale copy.
- [ESLint](lint.txt) / [Next build](build.txt):passed, TypeScript и61 static/SSG pages.
- [Ruff](ruff.txt) test-only e2e_app.py:passed. Python через PyCharm SDK, без installs. Backend runtime не менялся; full backend/PostgreSQL/mypy не запускались.
- [Browser](e2e.json):30/30 passed, unexpected0, errors=[], retries0,157.50s. Новые10 cases:4 locales×desktop/mobile с explicit date apply, original defaults до нажатия, original flight dates, edited amounts/adults, full Stay22 params/quote note, manual reload/share, mocked new-tab click/axe/320px; edge cases unknown-zone/one-way/same-day в обоих проектах. Existing accommodation6/trip-parameters4/flight-facts10 также прошли без ослабления assertions.
- [Source parity](source-parity.json):551 runtime files apps/api/app + apps/web/src isolated copy совпали с checkout. Fixture/test URLs в копии заменены только на собственные3125/8125. [Финальная сверка](verification.json): JSON/Markdown links/whitespace прошли, test guard сохранён, next-env.d.ts без diff, fixture ports закрыты.

## Воспроизведение и безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. После окончания build создать новый isolated workspace: `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-trip02-new`. Существующие каталоги не перезаписывать, build параллельно browser не запускать.

Перед Python toolchain/fixture вызовом получить SDK через PyCharm get_python_environment. `SDK -m ruff check apps/api/tests/e2e_app.py`. В isolated apps/web: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. E2E app требует HOPTRIP_E2E=1, использует disposable SQLite, fake providers и свой .next. Новый fixture — read-only serialized views, не production route.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)stay-context\.spec\.ts$' '(^|/)accommodation\.spec\.ts$' '(^|/)trip-parameters\.spec\.ts$' '(^|/)flight-facts\.spec\.ts$' --reporter=json
```

Stay22 new-tab clicks перехватываются локальным HTML fixture, реальный provider не открывается. Unit/browser проверки подтверждают сформированный URL, сохранение его исходных параметров и контекста; live provider availability/quotes/fulfillment не проверялись. Прежний lang=pl/provider contract не расширялся неподтверждёнными параметрами. Paid API/email/campaign не активировались.

Просмотрены [desktop320px](local-stay-320-desktop.png) и [mobile320px](local-stay-320-mobile.png): selected dates рядом с CTA, quote note виден, поля/ссылки без horizontal overflow. Native date controls и Dev indicator относятся к локальной среде.

## Release / rollback / ограничения

Release согласованным web bundle, без новых dependencies, API migrations или DB backfill. Откатить только TRIP-02 TripAccommodation/module CSS, new stay helpers/copy, добавленную flight calendar function и tests/fixture branch. Не восстанавливать весь HEAD с предыдущими задачами и пользовательскими изменениями. Storage keys/schema прежние, cleanup drafts/cookies не нужен; выбранные пользователем даты — обычные editable drafts.

Headless Chrome/mobile emulation не являются проверкой физических устройств, conversion/usability или полной WCAG сертификацией. Calendar hint не бронирует жильё и не подтверждает расписание/доступность/тариф; quotes не выдумывались. Unknown-zone и critical-quality cases требуют ручной проверки, early check-in/late checkout — решения у жилья. Предыдущие API/cold-entry observations остаются открытыми. Full suite не заявляется.

TRIP-02 DONE. Progress/Audit/Decisions/Test Plan обновлены; next-env.d.ts без diff, свои3125/8125 завершены, чужие3100/8100 не трогали. Production/credentials/платные интеграции и реальные кампании не затрагивались. Пользовательские master plan/IDE и предыдущие задачи сохранены. TRIP-03 не начата; остановка.
