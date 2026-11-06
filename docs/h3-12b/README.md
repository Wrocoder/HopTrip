# H3-12b — постоянные ID, явная миграция и безопасные записи между вкладками

2026-11-04. **H3-12b DONE; H3-12 IN_PROGRESS.** Часть L-задачи H3-12: коллекция v2 и операции хранения. Подключение Update/Duplicate и открытия редактора по ID — отдельная12c. PR/commit не создавались.

## Аудит и границы части

До12b сохранялся JSON array of encoded snapshots в `hoptrip.saved-trips.v1`: identity равнялась token, другой бюджет создавал другую копию. Хук перечитывал localStorage перед mutation, но get/set без межвкладочной блокировки могли потерять параллельное сохранение. Уже работали independent shared copies, partial/unknown/zero, profiles/provenance, autosaved drafts,20limit/corruption/undo, fragment URLs и legacy SSR query. [Baseline1/1](baseline.json) воспроизвёл два token после Save→edit→Save и отсутствие ID; это не browser reproduction редкой lost-write гонки.

Объём12b: стабильный local UUID/revision, строгий reader, явная миграция без записи в старый ключ, атомарный driver с Web Locks, сохранение/удаление/undo через новый store, импорт добавлений старой вкладки, UI states/4locale. Операции update/duplicate реализованы и проверены в слое хранения, **не** как новые кнопки редактора. UI пока сохраняет snapshots; H3-12 целиком не закрыта, новая autosave/update семантика не обещается.

## Контракт и совместимость

| Данные | Формат / поведение |
|---|---|
| Legacy source | `hoptrip.saved-trips.v1`: прежний JSON array,20tokens, reader140000chars. Новый код **никогда не пишет и не удаляет этот ключ** |
| Active collection | `hoptrip.saved-plans.v2`: `{version:2,revision,plans,legacyBackup,legacySource}`. Когда существует, это единственная активная коллекция; старый ключ — источник импорта, не второе редактируемое представление |
| SavedPlan | `{id,revision,token}`. ID — UUIDv4, revision — positive safe integer. Payload — прежний v1 snapshot≤6000chars; максимум20plans. ID не содержит маршрут/бюджет и не отправляется в analytics |
| Backups | `legacyBackup` — точный исходный raw source при переходе, неизменный. `legacySource` — последний явно учтённый raw source; позволяет заметить поздние записи старого frontend и импортировать только новые token |
| Size guard | V2 raw≤700000chars:20прежних payloads + две bounded140000char копии legacy raw с JSON escaping. Лимиты payload/local draft/saved count не расширены; предел относится к контейнеру и резервным копиям |
| New user | При первом успешном Save создаётся v2. Пустой legacy list также безопасно преобразуется при Save; нечего мигрировать вручную |
| Existing user | Старые plans читаются и открываются, Share работает. Save/remove заблокированы с понятным объяснением до кнопки «Przekształć zapisane plany» на Saved. Миграция проверяет captured legacyRaw под lock и сохраняет exact token/order/raw backup; новый ID не меняет содержимое |
| URL / working draft | `/trip#plan=` и legacy `?plan=`/4locale неизменны, query SSR сохранён. Старые copy-token draft keys, budgets/events/provenance/estimates не меняются. Открытие по постоянному ID и связанный с ID working draft —12c |

V2 reader не подменяет испорченную/unsupported коллекцию старым списком: partial valid records можно открыть, mutations блокируются, bytes не стираются. Duplicate IDs/invalid revisions/unknown fields/bad backup/token/oversize fail closed. Испорченный legacy source до миграции не переписывается. После перехода порча old source не стирает valid v2: появляется предупреждение, импорт запрещён, текущие планы доступны.

[Compatibility probe](v1-compatibility.json): прежний и новый encoder дают identical v1 bytes и fragment paths; миграция сохраняет source annotations/profiles/manual0/exact raw; update в модуле сохраняет ID и backup. Старый frontend продолжает читать старый список, но не видит subsequent v2 edits. Это намеренное ограничение backward compatibility, не синхронизация двух редакторов.

## Записи и конфликты

`commitPlanOperation` берёт один exclusive `hoptrip:saved-plans.v2` Web Lock, **затем** перечитывает оба ключа, валидирует transition и выполняет один atomic localStorage.setItem только v2. Новый код сотрудничает по этому lock; старые вкладки могут писать лишь в свой v1 key и не могут перезаписать v2. Их изменения становятся заметным pending import. Наличие lock проверяется: без поддержки изменения запрещены, чтение/редактирование local budget/Share остаются доступны, небезопасного fallback get/set нет. Native storage quota/read/lock failures возвращают error и не объявляются успешным сохранением.

- Save dedup по exact token возвращает существующий plan; distinct snapshot получает новый ID.
- Duplicate в модуле создаёт отдельный ID, даже при одинаковом token;20limit без eviction.
- Update в модуле сохраняет ID, меняет token и увеличивает record+collection revisions. Сравнение expectedRevision выполняется под lock; старые update/remove дают conflict, удалённый ID — absent. No-op update не пишет ничего.
- Remove действует по ID/revision, не по token. Undo восстанавливает тот же ID с revision+1, поэтому старый editor не получает ABA совпадение версии после delete→undo. Другие планы сохраняются; совпавший ID/full collection не перезаписываются.
- Migration/import сравнивает expectedLegacyRaw после получения lock. Другой source — conflict, исходные данные остаются. Import только добавляет token, которых не было в последнем учтённом legacySource, и не копирует старые удаления. Неизменённый ранее удалённый или обновлённый snapshot не воскресает. Relative order source additions и existing plans сохранён. Full/corrupt/conflicting import не пишет частичный результат.

UI показывает pending/error/migration/unsupported/conflict, использует прежние local-only/privacy messages и native accessible buttons. Storage/focus/pageshow events обновляют список и saved indicator. Новых analytics events/cloud permissions/аккаунтов нет, прежние consent-gated TRIP_SAVE/TRIP_REMOVE только при успешной операции. API/DB schema/DB migrations/dependencies/SEO/affiliate/fragment privacy не менялись.

## Проверки

- `npm run test:unit`: **299/299**,0skip/fail;11new cases проверяют ID/revision/update/duplicate/delete/undo, stale/ABA conflicts,20limit, strict corruption/backup, concurrent driver, unsupported/denied/quota, old-source import и порядок нескольких additions. [Финальный вывод](node-final.txt); initial298 pass сохранён в [node.txt](node.txt).
- `npm run lint`, `npx tsc --noEmit`, production `npm run build`: **PASS** на последней версии. [Lint](lint-final.txt), [types](types-final.txt), [build](build-final.txt), [checks](checks.json). IDE isSuccess=true, diagnostics limited; не подменяет Next/tsc. Git diff check pass, только LF/CRLF informational warnings.
- Первый `npm run test:e2e -- saved-plan-identity.spec.ts --trace=off --reporter=json`: **10/18**. [JSON](browser-identity.json), [вывод](browser-identity.txt).8locale cases неверно ожидали identical duplicate save у синтетического legacy token без adultsOnly: прежний editor добавляет explicit false. Уточнена fixture для repeat-save проверки, без изменения runtime canonicalization или миграции exact token. Повтор прошёл18/18 ([JSON](browser-identity-final.json)); после отдельной import-order правки новый прогон на final production также **18/18** ([JSON](browser-identity-latest.json), [вывод](browser-identity-latest.txt)).
- Новый browser suite:4locale explicit migration/raw backup/ID reload/legacy opening, fresh v2-only save, identity-preserving delete/undo, old-tab import без resurrection, queued migration conflict под native lock, parallel saves, quota и missing lock fallback. Legacy source bytes не меняются, исходные budgets/ручной0 открываются, corrupted old source не стирает v2. Axe main0violations и320px no overflow; [desktop320](identity-320-desktop.png), [mobile320](identity-320-mobile.png), PL desktop визуально просмотрен.
- Regression `npm run test:e2e -- shared-trip.spec.ts localized-trips.spec.ts budget-profiles.spec.ts budget-provenance.spec.ts budget-modes.spec.ts planned-events.spec.ts saved-trip-workflow.spec.ts budget-recovery.spec.ts share-privacy.spec.ts interaction-feedback.spec.ts detail-layout.spec.ts --trace=off --reporter=json`: **128/134**. [JSON](browser-regression.json), [вывод](browser-regression.txt).4failures сохраняли raw storage до завершения intentional async Save (ожидали null), затем проверяли неизменность после reset. Добавлены ожидание saved indicator и non-null assertion перед capture; проверка byte-exact unchanged-after-reset сохранена. Ещё2failures — desktop RU/UK full-viewport CTA; они не исправлялись в12b.
- На final build: `npm run test:e2e -- interaction-feedback.spec.ts h3-12b-layout-probe.spec.ts -g 'calculator reset confirmation|measure the reported' --trace=off --reporter=json`: **12/12**, из них8reset cases и4diagnostic probes с принудительным1366×900 в desktop/mobile contexts. [JSON](browser-recheck.json), [вывод](browser-recheck.txt). Диагностика утверждает наличие clipping, **не** успешный full-viewport acceptance. Подходящие reset assertions не ослаблялись, timeout не повышался.
- [Сводка](browser-summary.json): **152 уникальных post-change cases,150 подтверждены latest PASS,2known layout failures остаются**. Новые18cases прошли, regression latest132/134; retries0. Baseline1 и6diagnostic measurements отдельно, не прибавлены к150pass. Основной regression был выполнен до последней правки только порядка legacy import; финальное правило и все migration paths проверены299 Node и18browser на final production. Не заявляется, что весь site/full suite зелёный. `mobile-workflow.spec.ts` механически согласован с новым active key, но полный этот suite здесь не запускался.
- [Source parity](source-parity.json):5runtime и14test files совпадают с final production copy (для tests только loopback normalization); web runtime delta относительно12a ограничена этими5files,16core/privacy/API/dependency modules неизменны. V1 payload/fragment/budget draft source не менялись.

### Отдельное подтверждение существующего H3-17b layout issue

Для проверки причинности заново собрана **предыдущая12a production copy**, выполнен [diagnostic probe](layout-probe.spec.ts): `npm run test:e2e -- h3-12b-layout-probe.spec.ts --project=desktop --trace=off --reporter=json`,2/2 проверок воспроизведения дефекта. [Before JSON](layout-before.json), [build](layout-baseline-build.txt), [геометрия](layout-before-geometry.json). На финальной12b тот же probe повторён; [after geometry](layout-after-geometry.json).

| Locale / окно | До12b: CTA bottom / visible ratio | После12b | Delta bottom |
|---|---|---|---|
| RU,1366×900, fonts ready | 920.140625px /0.5804036458 | 920.140625px /0.5804036458 | 0px |
| UK,1366×900, fonts ready | 920.140625px /0.5804036458 | 920.140625px /0.5804036458 | 0px |

[RU before](layout-before-ru.png), [RU after](layout-after-ru-desktop.png), [UK before](layout-before-uk.png), [UK after](layout-after-uk-desktop.png). Source/test viewport assertion не ослаблены, UI выше fold/CSS не менялся. Это новое подтверждённое наблюдение в **H3-17b**, рядом с уже открытыми first-price/CLS и неизвестной причиной cross-tab11a; причина clipping отдельно не исследовалась и исправление не объявляется выполненным.

Изолированная production copy `.cache/aud05-h3-12b-20261104`, loopback3125/8125, Chrome desktop/mobile, synthetic SQLite API. PyCharm Python3.12.10/.venv выбран через python-tools перед Playwright; prepare-e2e.ps1 + прежние untracked airport JSON/две fixtures/synthetic operator fixture. В copy `npm start`, ports в test sources нормализованы до collection. Production/API providers/партнёры/уведомления/deploy не вызывались; существующие процессы не останавливали. Полный API suite/Ruff/mypy не повторялись, Python runtime не менялся. WebKit/реальные устройства/manual SR/CWV/production usability не проверены. Отсутствие lock имеет явный read-only путь; полная поддержка всех браузеров не заявляется.

После baseline очищен только собственный generated `.cache/aud05-h3-12a-20261104/apps/web/.next`,113.51MiB: exact resolved path/ancestors проверены,1junction удалён как ссылка без обхода target, затем проверено отсутствие reparse points. Source copy/shared node_modules/H3 evidence сохранены; запись `.cache/h3-12b-generated-cache-cleanup.json`.

Для controlled before/after на ограниченном диске после завершения соответствующих собственных серверов дополнительно очищены intermediate12b.next114.30MiB и заново созданный baseline12a.next113.99MiB тем же проверенным механизмом. Финальная12b production затем собрана заново. Записи `.cache/h3-12b-intermediate-build-cleanup.json` и `.cache/h3-12b-layout-baseline-cleanup.json`; source copies/все отчёты/прочие процессы сохранены.

## Rollback и следующий шаг

Без feature flag и DB migration. Не удалять v2 key и не перезаписывать v1 ради отката. Старый frontend видит только архив v1; новые v2 plans/edits остаются в storage, но без нового reader не отображаются. Предпочтительный rollback — оставить v2 reader и открыть его read-only, отключив mutations. Полный откат UI требует explicit export/recovery v2, поскольку старый формат не представляет постоянные ID/duplicate identity; исходный legacy backup доступен в контейнере. Вернуть только delta12b hook/actions/list и новые saved-plans/copy/tests, сохранив12a fragment reader и все предыдущие H3/пользовательские изменения. Общие файлы целиком изHEAD не заменять.

Следующий отдельный запуск **H3-12c**: открытие по ID, local draft с baseRevision, Save/Update/Duplicate/Delete/Share UX, явное восстановление актуальной версии при конфликте без потери local edits; сохранение profiles/provenance/events/обоих URL forms, проверка changed/expired offer. Update/Duplicate module APIs готовы, editor revision handling ещё не реализован. ОбщаяH3-12 IN_PROGRESS; first-price/CLS и причина transient cross-tab11a остаются17b. На этом остановиться.
