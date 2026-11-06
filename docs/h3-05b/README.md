# H3-05b — поддержанный контекст и границы партнёрских ссылок, 2026-11-03

**DONE; общая H3-05 DONE (05a +05b) по локальным acceptance.** Следующая отдельная задача — H3-06. Deployment/коммит не выполнялись. Реальные внешние переходы и покупки не выполнялись; [manual smoke checklist и provider matrix](../h3-05a/README.md) сохраняют свои ограничения.

## Что обнаружено и изменено

Stay22 уже передавал выбранные checkin/checkout, Unicode city, подтверждённых взрослых и существующую атрибуцию. Однако предел продукта 1–50 взрослых соблюдался только UI: helper принимал большие safe integers. Теперь builder и форма используют `stay22MaxAdults=50`. Это согласование существующего ограничения продукта, не утверждение о новом контракте провайдера. Invalid/reversed/missing/same-day stay не создаёт link; children/rooms/return_arrival не добавляются. Language/currency/aid/campaign сохранены.

Для editorial activity/transfer ссылок введён общий `staticAffiliateUrl`. Он проверяет HTTPS, отсутствие credentials/control characters/backslash/нестандартного порта/fragment и известную форму адреса:

- Welcome Pickups: tpx.gr +opaque alphanumeric path, без query. Недопустимая registry link скрывает transfer card.
- Tiqets short links: tiqets.tpx.gr +opaque alphanumeric path, без query.
- Tiqets nested links: tp.media/r +единственный u на HTTPS tiqets.com/www.tiqets.com, с той же проверкой URL. Остальные opaque attribution parameters сохраняются.
- Неподдержанная affiliateHref активности не выдаётся за affiliate link; используется отдельный исходный official href. Известные reviewed ссылки проходят **без переписывания байтов URL**.

Это проверка форм, уже присутствующих в репозитории, а не расширение внешнего API. Новые параметры к short links не приписываются. Домен shortener не доказывает финальную destination correctness: она остаётся предметом разрешённого external smoke, здесь не заявляется.

Одинаковое пояснение на PL/EN/RU/UK добавлено рядом с links событий, активностей, трансферов и generic non-flight Outbound: изменения дат/состава группы в плане автоматически не передаются; срок, участников и цену надо проверить у партнёра. Flight-specific оговорка уточнена: ссылка открывает предложение партнёра, даты надо проверить; прежнее обещание открыть именно даты карточки было слишком сильным для generic stored URL. Stay22 использует собственное более точное пояснение о передаваемых взрослых/непередаваемых детях и независимых датах проживания. Outbound теперь имеет rel="sponsored noopener noreferrer", сохраняя текущую вкладку; links с target=_blank сохраняют прежние sponsored/noopener/noreferrer. Consent-controlled explicit tracking не меняется.

## Согласованный контракт по типам ссылок

| Тип | Поддержанный контекст | Что не обещаем |
|---|---|---|
| Aviasales | Exact source ticket +current marker/trs/placement sub_id, проверка H3-05a на чтении и /go | Изменённые planner dates/passengers не дописываются в opaque ticket, live price не подтверждена |
| Generic stored | Approved HTTPS host, исходный URL и configured tracking ID | Не угадываем provider-specific date/guest syntax. Существующий flight notice и новый non-flight notice явно отделяют planner changes |
| Stay22 | Выбранные даты проживания, destination city, 1–50 подтверждённых взрослых, существующие aid/campaign/PLN/lang | Children/age/rooms не передаются; hotel price вводится вручную; home arrival не заменяет checkout |
| Ticketmaster | Валидированная source event/variant URL, исходные event date/product identity | Search interval/group из плана не превращаются автоматически в выбранные tickets/participants; availability проверяется у продавца |
| Tiqets | Reviewed product/short link без изменения attribution, либо отдельный official URL | Никакого автоматического добавления planner dates/guests; static editorial snapshot, не live inventory |
| Welcome Pickups | Reviewed city link без изменения attribution | Нет выдуманных flight number/dates/guests, цены или длительности трансфера |

Existing StaySuggestion использует outbound destination-local arrival и return-origin-local departure, unknown zones не угадывает, изменения применяет явным действием и сохраняет ручные суммы. Это проверено существующими tests; алгоритм не переписывался. Разные airports/timezones и midnight return остаются частью H3-02/05a контракта. Отдельные expiry tests добавлены для Deal и связанного TravelOffer: даже matching ticket не даёт 307 после expiry; detail/go404, без AffiliateClick.

API/schema/DB, saved draft/share v1, публичные URLs, account flags и credentials не менялись. Нет новых dependencies, migrations, analytics events или реальных сообщений. Public marker/trs requirement H3-05a сохраняется; production env не проверялось.

## Проверки и evidence

Изолированная копия `.cache/aud05-h3-05b-20261103`, production web build/start, Chrome Playwright desktop/mobile, loopback 3125/8125. Исходные/чужие серверы не останавливались. External clicks существующих tests перехвачены/заменены loopback; новые tests только проверяют href и локальный UI.

| Проверка | Результат |
|---|---|
| `npm run test:unit` | **241 passed**, [вывод](node-complete.txt) |
| `npm run lint`, targeted ESLint | exit 0; [full](lint-verified.txt), [targeted](test-lint.txt) |
| `npm run build` | exit 0; TypeScript passed, 61 static entries; [вывод](build-complete.txt) |
| SDK pytest: flight_link_binding, affiliate, partner_links, activity_links, ticketmaster_smoke (`-q -p no:cacheprovider`) | **84 passed**, [вывод](api-final.txt), [JUnit](api-final.xml) |
| SDK Ruff изменённого Python test | PASS, [вывод](ruff.txt) |
| Browser initial: `npm run test:e2e -- partner-boundaries.spec.ts stay-context.spec.ts affiliate-context.spec.ts --reporter=json` | **26 passed /8 failed**, [JSON](browser.json), [вывод](browser.txt) |
| Browser final: `npm run test:e2e -- partner-boundaries.spec.ts --reporter=json` | **8 passed** до уточнения flight wording: [JSON](browser-verified.json). Заключительный повтор с проверкой нового wording: **8 passed**, [JSON](browser-complete.json), [вывод](browser-complete.txt). Итого подтверждены **34 unique cases**, не один чистый full-suite rerun |
| IDE build_project изменённых файлов | isSuccess=true, limited diagnostics |

Новые Node cases проверяют month-end/Unicode/encoding/max adults/unsupported params, весь registry без изменения URL/attribution, unsafe/ambiguous nested targets, чужие hosts/credentials/schemes/control characters, fallback и 4 locale copy. Первые два Node runs упали на test-only JSON import/interop loader; использован existing CommonJS test-loader convention с JSON/esModuleInterop. [Исходные выводы](node-first.txt), [промежуточный](node.txt) сохранены; runtime Next build JSON imports работает штатно.

8 новых browser cases (4 locale ×desktop/mobile): May31→June2, adults51 без href, adults2 с точными датами/aid, отсутствие неподдержанных keys, неизменный flight header, reload сохранённых дат, rel/target, локализованные ограничения событий/активностей/трансфера и 320px. 26 existing cases проверяют explicit local stay suggestion, unknown timezone/one-way/same-day, бюджет/людей, late arrival без лишней hotel night, event/activity variants/middle click/consent и analytics failure.

Initial browser failures были ошибкой выбора fixture для CTA: browser-13 не имеет approved booking program. Для rel assertion выбран browser-deal. Второй run дошёл до guide с двумя разными provider sections и выявил слишком широкий locator; ожидание ограничено aside трансфера. Продуктовые ожидания не ослаблены. [Промежуточный JSON](browser-final.json) сохранён. После этого все 8 новых cases прошли.

SDK перед Python-командами проверен через PyCharm: Python 3.12.10 `.venv/Scripts/python.exe`. Backend runtime не менялся; полный API suite/mypy повторно не запускались. Целевые provider/link/expiry tests прошли. Есть два прежних deprecation warnings Starlette/httpx/anyio. PostgreSQL, WebKit, full-site accessibility/performance, production data/configuration, реальные provider redirects/booking и KPI не проверялись.

## Файлы, rollback и граница DONE

Новые helpers: static-affiliate-url.ts, i18n/partner-context-copy.ts. Обновлены accommodation-links.ts, airport-transfers.ts, destination-activities.ts, i18n/trip-copy.ts; TripAccommodation, Outbound, TripEvents, DestinationActivities, AirportTransfer. Tests: accommodation-links.test.mjs, новые static-affiliate-url.test.mjs/partner-boundaries.spec.ts, два expiry cases в test_flight_link_binding.py. H3 docs.

Rollback только delta 05b: вернуть прежний builder/UI boundary, static link guards, новые notices/rel и соответствующие tests; сохранить 05a exact-ticket guard и остальные прежние изменения. Общий reset к HEAD недопустим; DB rollback не требуется.

H3-05 DONE означает локальное подтверждение генерируемых ссылок, сохранения поддержанных параметров/атрибуции и явного раскрытия неподдержанных полей. Это не live-подтверждение финального сайта партнёра. Manual smoke checklist уже подготовлен в 05a и не выполнялся без разрешения; покупок не было. Следующий отдельный запуск **H3-06**, здесь остановка.
