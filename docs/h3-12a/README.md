# H3-12a — ссылки без бюджета в запросе к сайту

2026-11-04. **H3-12a DONE; H3-12 IN_PROGRESS.** Часть L-задачи H3-12: аудит storage/share contract, новый переносимый формат ссылки и совместимое чтение. Постоянные ID и Save/Update/Duplicate/migration — следующий отдельный запуск12b. PR/commit не создавались.

## Исходное состояние и выбранный объём

Работали local v1 snapshots, autosaved per-offer/copy drafts, independent recipient edits, lost/missing/expired offer states, corruption/storage/clipboard guards, cross-tab reload и rollback removal. Но identity = полный encoded token: изменение бюджета создаёт новую копию. Update/Duplicate и постоянного ID пока нет. H3-11 уже сохраняет optional provenance/estimates; это основание сохранено.

[Baseline1/1](baseline.json) на прежней production11b воспроизвёл: сформированная `/trip?plan=<token>` отправляет token вместе с query в document request, а OpenGraph description содержит даты плана. Это подтверждение содержимого запроса и metadata, **не** утверждение, что production логи были просмотрены или сохраняли запрос. Сначала исправляется этот exposure, затем12b получает устойчивый storage/lifecycle contract. Остальные H3 в этом запуске не реализуются.

## Текущий storage contract

| Объект | Формат и ограничения | Поведение12a |
|---|---|---|
| Saved collection | `hoptrip.saved-trips.v1`, JSON array of base64url tokens;20 элементов, reader140000 chars | Формат, key, dedup/identity и mutation logic не меняются. Valid entries читаются при частичной порче; mutations блокируются при corrupt, чтобы не стереть неизвестное содержимое |
| Shared snapshot | JSON `{version:1,offer,draft}`, UTF-8/base64url, максимум6000 encoded chars | Token byte-identical прежней11b. Allowlist удаляет arbitrary extras/context/notes; dates/counts/costs/events/provenance/personal profiles публичны получателю ссылки. Не шифрование и не серверная запись |
| Working draft | `hoptrip.budget.v1:deal:<slug>`, `:standalone`, `:deal:copy:<token>`; BudgetDraft version1, local reader50000 chars | Inputs/events/provenance/estimates и invalid editing recovery прежние. Query и fragment одного token восстанавливают **тот же** local copy draft. Автосохранение черновика отдельно от saved snapshots |
| New URL | `/trip#plan=<same-v1-token>` и PL/EN/RU/UK wrappers; internal section `&section=<id>` | Payload читает браузер. Новый Share и ссылки SavedTrips используют fragment. Ключи storage и token identity не зависят от URL carrier |
| Legacy URL | `/trip?plan=<token>` | Продолжает открываться через прежний SSR path, включая при выключенном JavaScript. Неверные/повторные query values не декодируются как валидный план |

Миграции storage в12a нет: ничего не переписывается и не удаляется. Старый browser save сразу открывается через новый fragment carrier с прежним token/local draft. [Сравнение readers](v1-compatibility.json) проверяет byte identity, одинаковое чтение, неизменный saved key/removal и profiles. Старая версия приложения не понимает новые fragment URLs: reader и generator выпускаются вместе; ранее созданные query URLs поддерживаются новой версией.

## Поведение и privacy audit

`SharedTripView` переиспользует прежнее представление для server legacy и нового client reader. Fragment проверяется строго, с прежним decoder и guard6000/overall6200, один plan/не более одного section, без неизвестных параметров; malformed/duplicate/unknown не восстанавливают предыдущий token. Бюджет доступен сразу после локального декодирования. Асинхронная проверка каталога передаёт только public offer slug; pending/error/404/expired не стирают бюджет. Cleanup эффекта отбрасывает ответы для покинутой копии; key и storage context прежние.

Нативные `#calculator`, `#trip-flight`, skip link и hotel anchor сохраняются в том же history entry как `#plan=...&section=...`; работают reload/Back/Forward. LanguageSwitcher уже сохраняет hash; его код не менялся. Ошибки API не требуют аккаунта или cloud consent. Новые fragment URLs требуют JavaScript, явная подсказка присутствует в начальном SSR содержимом; legacy query links продолжают SSR render. Social preview намеренно общий для всех планов/locale, без маршрута/дат/token; noindex/nofollow, canonical `/trip`, empty OG/Twitter images и no-referrer сохранены.

| Поверхность | До12a | После12a / граница |
|---|---|---|
| HTTP document/RSC requests и referrer | Query token доступен серверу и потенциальному журналу запроса | Новый fragment не отправляется в URL/headers/body; проверяется capture requests с включённым analytics consent. Legacy query всё ещё отправляется: обратная совместимость не удаляет прошлые логи |
| Server HTML/social metadata | План SSR и personalized title/dates в OG | Fragment payload отсутствует в server HTML; metadata общая и для fragment, и для legacy. Legacy SSR по-прежнему содержит сам план для его просмотра |
| Analytics | Прежний consent gate, allowlisted metadata; raw plan не нужен | Код не менялся; network assertions проверяют отсутствие token и budget value в payload при consent=true. Opt-out остаётся прежним и проверяется regression |
| Сторонний JS/партнёры | Drive policy уже запрещает `/trip`/`/saved`, включая4locale; curated links noreferrer | Policy/attribution не менялись. Browser tests локальные, без production Drive и реальных партнёрских действий; отсутствие бюджета в local HTTP traffic не доказывает поведение неизвестного расширения/внешнего сервиса |
| Browser history/clipboard/получатель | Полная ссылка читается её владельцем | Так и остаётся. UI4locale явно говорит: не шифрование, любой получатель читает план, браузер или сервис вставки может сохранить весь адрес |

Repository Caddy config не задаёт отдельную политику redaction query/access-log retention; production config/logs не опрашивались. HTTP header `strict-origin-when-cross-origin` и более строгая page meta `no-referrer` прежние. Новых providers/API endpoints/DB/schema/migrations/dependencies/consent permissions/SEO public URLs нет.

## Проверки

- `npm run test:unit` из `apps/web`: **288/288**,0skip/fail, в том числе4new fragment/strict-validation/4locale/section/privacy cases; [вывод](node.txt).
- `npm run lint`, `npx tsc --noEmit` и production `npm run build`: **PASS** после последней правки. [Lint](lint-final.txt), [types](types-final.txt), [build](build-final.txt), [сводка](checks.json). IDE build isSuccess=true, diagnostics limited; он не подменяет реальные Next/tsc проверки.
- Первый `npm run test:e2e -- share-privacy.spec.ts --trace=off --reporter=json`: **14/16**. [JSON](browser-privacy.json), [вывод](browser-privacy.txt).2no-JavaScript cases выявили отсутствующую подсказку: Next/React не показал содержимое noscript внутри client component. Вместо неё оставлен явный обычный paragraph в initial SSR; приложение пересобрано. Никаких ослабленных assertions/timeouts для обхода ошибки.
- После fix `npm run test:e2e -- share-privacy.spec.ts shared-trip.spec.ts localized-trips.spec.ts budget-profiles.spec.ts budget-provenance.spec.ts budget-modes.spec.ts planned-events.spec.ts saved-trip-workflow.spec.ts budget-recovery.spec.ts --trace=off --reporter=json`: **98/100**. Все16new privacy cases прошли;2failures — один прежний detail canonical scenario на desktop/mobile: при повторном копировании spec в fixture сохранился ожидаемый порт3100 вместо изолированного3125. Runtime canonical корректен, fixture port normalization восстановлена. [JSON](browser-final.json), [вывод](browser-final.txt).
- `npm run test:e2e -- localized-trips.spec.ts -g 'flight detail languages expose' --trace=off --reporter=json`: **2/2** после нормализации портов, без дальнейших runtime/expectation изменений. [JSON](browser-recheck.json), [вывод](browser-recheck.txt). Исходные failures сохранены; весь первый regression run зелёным не объявляется.
- [Сводка latest results](browser-summary.json): **100 уникальных post-change cases подтверждены**, retries0; baseline1 отдельно. Покрытие:4locale requests URL/all headers/body без token, generic metadata/server HTML, consent=true analytics без бюджета; native sections/skip/reload/Back/Forward/language; malformed/duplicate/unknown fragment; API late/error/missing/expired; JS-disabled fragment hint и SSR legacy; прежние budget modes/provenance/ranges/events/saved/cross-tab/storage/clipboard/recipient independence. Source snapshots/схема consent не менялись. Axe calculator/main0violations,320px no-overflow; [desktop320](share-320-desktop.png), [mobile320](share-320-mobile.png). PL desktop визуально просмотрен.
- [Source parity](source-parity.json):7runtime files byte-for-byte совпадают с production copy;12test files совпадают после единственной loopback normalization; web runtime delta относительно11b ограничена этими7файлами,15core/privacy/API/dependency modules неизменны. `git diff --check` pass (только уведомления LF/CRLF). Один механически согласованный URL assertion в `mobile-workflow.spec.ts` включён в parity, но сам полный mobile-workflow suite здесь не запускался; это не подменяет выполненные100cases.

Изолированная production copy `.cache/aud05-h3-12a-20261104`, loopback3125/8125, Chrome desktop/mobile, synthetic SQLite API. PyCharm Python3.12.10/.venv выбран через python-tools перед Playwright. prepare-e2e.ps1 + явные airport JSON/две Python fixtures/прежняя synthetic operator fixture, только в copy `npm start` вместо dev. Существующие процессы не останавливали. API runtime не менялся, полный API suite/Ruff/mypy не повторялись. WebKit, реальные устройства, ручной screen reader, production usability/CWV/логи/доставка/партнёры не проверялись.

После baseline удалён только собственный generated `.cache/aud05-h3-11b-20261104/apps/web/.next`,112.63MiB, с проверкой точного абсолютного пути/ancestors и reparse points. Один junction удалён как ссылка без обхода target, source copy/shared dependencies/H3 evidence сохранены; запись `.cache/h3-12a-generated-cache-cleanup.json`.

## Rollback и следующий запуск

Без feature flag. Вернуть только delta12a в tripPath, SharedTripPage/TripActions; удалить FragmentTrip/SharedTripView/trip-fragment/privacy-copy и2new specs; согласованные проверки URL/metadata вернуть к предыдущему формату. Не возвращать общие файлы целиком изHEAD: там предшествующие H3/пользовательские изменения. Storage/token identity не меняются; старые query ссылки снова основной формат. Уже выданные fragment URLs после rollback перестанут открываться: для них нужно оставить fragment reader либо вручную заменить `#plan=` на `?plan=` с тем же token. Предпочтителен rollback generator с сохранением reader, чтобы не ломать новые ссылки.

H3-12 остаётся **IN_PROGRESS**. Следующая12b: постоянный local plan ID, Save/Update/Duplicate/Delete/Share semantics, явный статус несохранённых правок, защита конфликтующих updates нескольких tabs и совместимая миграция существующей collection без silent loss; сохранить обе URL формы и optional events/provenance/estimates. В этой части это не реализуется. Известные first-price/CLS и неустановленная причина cross-tab failure11a остаются17b.

После этой части остаются6 задач H3: **12 (12b)** → **13** → **15** → **14** после внешних staging/delivery blockers → **17b** → **18b**. Уведомления14 не включать без разрешения; production измерения не подменять локальными fixture тестами.
