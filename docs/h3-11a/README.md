# H3-11a — происхождение сумм бюджета

Дата: 2026-11-04. **H3-11a DONE; H3-11 IN_PROGRESS.** Первая часть завершена: источники сумм и совместимое сохранение. Пресеты и projected ranges остаются H3-11b. H3-12 identity/update/copy lifecycle не начиналась; здесь остановка перед11b.

## Аудит и основание разделения

Текущий calculateBudget уже различает неизвестное и ноль, считает integer grosz, person/group/day/night/stay, хранит обе lodging amounts, учитывает planned events отдельно, показывает known subtotal/неполный бюджет. Эти функции не дублируются. В существующем ReferenceCosts есть только три датированных transport fares и NBP conversion; источника city-specific hotel/food ranges для эконом/стандарт/комфорт нет. Новые рыночные суммы не придумываются. Сначала источники, безопасное сохранение и ручные overrides, затем отдельная часть с прозрачными профилями/диапазонами.

[Baseline](baseline.json), [лог](baseline.txt), [наблюдение](baseline-observation.json): до изменений скопированные200.25PLN на человека подписывались как введённая вручную сумма. Неизвестный hotel и0 не давали ложный полный бюджет. Первый [harness run](baseline-initial.json), [лог](baseline-initial.txt) ожидал subtotal до ввода end date у one-way fixture и остановился; после явного задания stay dates baseline прошёл. Это не воспроизведение ошибки арифметики: отказ считать неполные даты — существующее корректное поведение.

## Состояния и контракт

Опциональная `BudgetDraft.provenance` имеет собственный discriminator `budget-provenance-v1` и allowlisted fields. BudgetDraft/SharedTrip/key/URL остаются version1; миграции storage и API/DB не нужны. До этого поля legacy input не меняется: числовое совпадение с текущим offer не делает старую сумму наблюдавшейся ценой.

| UI state | Основание |
|---|---|
| OFFER | Новый calculator seed из страницы предложения: copied per-person flight price, public offer slug и recorded timestamp. Не live quote/booking guarantee |
| REFERENCE | Пользователь явно применил существующий dated reference fare; сохранились ID, EUR cents, review date, выбранное число билетов на человека и EUR/PLN rate/date. Это assumption, не текущая цена поставщика |
| MANUAL | Любая иная известная сумма, включая явный0 и legacy inputs; последующая ручная правка снимает прежнее происхождение |
| UNKNOWN | Пустое поле; источник/цена не выдумываются |
| INVALID | Ошибочная сумма; прежние validation/отсутствие total сохраняются |

Источник связан с текущей денежной суммой в grosz; OFFER разрешён только дляflight, REFERENCE — только дляlocal_transport. Reference проверяется по allowlist датированных fares, quantity1–365, числовому rate и тому же rounding, что existing converter. Произвольные URL, notes, nested fields и неизвестные версии не сериализуются. Повреждённая/неподходящая аннотация удаляется отдельно отinput: числа и весь старый план не теряются. При будущем обновлении reference registry несовпавшая старая аннотация станет MANUAL, сохранив сумму. Историческая аннотация не получает статус свежей по времени просмотра.

Источник в полученной копии — заявление в плане, не доказательство подлинности или live availability; это явно раскрыто в4locale. OFFER details дают обычную ссылку на public source offer и recorded date. REFERENCE details — allowlisted official source, checked date, EUR fare/quantity/rate/date. Ручной ввод, очистка и reset снимают отметку, изменение dates/party сохраняет unit amounts и прежний review flag. Оба hotel bases и события считаются прежним движком; flight не добавляется второй строкой.

Краткая отметка связана с input через aria-describedby, подробности доступны нативным summary с клавиатуры. В новых текстах PL/EN/RU/UK не обещаются verified/current quotes. Новых profile prices/ranges/forecasts здесь ещё нет.

## Гонка conversion

Статический аудит показал: прежний async ReferenceCosts.apply удерживал старый onApply, а guard проверял захваченный input до ожидания NBP. Поэтому поздний ответ мог перезаписать последующую ручную правку. Pre-change browser reproduction именно этой гонки не выполнялось; добавлены post-change deterministic delayed-response cases.

TripDraftProvider теперь предлагает saveIfCurrent для этого async action: сравнивает исходный draft с последним реально сохранённым object, обновляемым синхронно при save, и сбрасывает live reference при cleanup. Ручная правка любого поля, reset или размонтирование отменяют late application. Значение не записывается, выводится локализованное предложение проверить план и повторить. Это не новый auto-save/storage manager, остальные consumers сохраняют прежний save API.

## Проверки и воспроизведение

- [Node](node.txt): **275 passed**, 0 failed/skipped. Шесть новых cases: classification/zero/total, legacy без inference, date/manual edits, tariff/rate/rounding binding, malformed annotation recovery, v1 save/share allowlist/privacy.
- [ESLint](lint.txt), [production build/TypeScript](build.txt): pass; отдельный tsc --noEmit завершился с кодом0 без stdout, [лог](types.txt). IDE build success с limited diagnostics.
- Новые production browser cases: **16/16 passed**, [JSON](browser-new.json), [лог](browser-new.txt). PL/EN/RU/UK×desktop/mobile: copied flight иreference fare, source/date/quantity/rate details, locale-aware internal source link, reload, same-value/manual edits, explicit0/unknown/invalid, reset, legacy/corrupt metadata, share/copy/save и независимость оригинала. Два delayed-NBP scenarios проверяют ручную правку иreset без перезаписи. Keyboard summary/aria-describedby/axe/320px и отсутствие analytics/events при opt-out проверены. NBP synthetic rate4; городские цены не добавлялись.
- Существующая budget/storage/event regression: **63/64 passed**, [JSON](browser-regression.json), [лог](browser-regression.txt). Один desktop cross-tab test не дождался пустого списка в первой вкладке после удаления во второй. Причина не установлена; consumer hook/list и сам тест не менялись, это не доказательство pre-existing или исправленной ошибки. Целевой повтор исходных cross-tab и storage/clipboard tests в обеих проектах: **4/4 passed**, [JSON](browser-recheck.json), [лог](browser-recheck.txt), без изменения assertions или увеличения timeout. Риск нестабильности наблюдения/синхронизации оставлен H3-17b; исходное падение сохранено и не объявляется PASS.
- [Сводка](verification.json): **80 уникальных browser cases подтверждены последними успешными результатами**; baseline1 отдельно. Это не утверждение, что весь первый regression run был зелёным или причина cross-tab failure устранена. В Playwright retries=0.
- [Совместимость двух readers](v1-compatibility.json): исходный H3-10 и новый reader открывают аннотированный v1 token с теми же input amounts; старый игнорирует дополнительные источники. Legacy encoded token не меняется. Оба сохраняют исходную token identity и успешно удаляют token из list. [Хеши неизменённых core modules](unchanged-core.json): arithmetic/shared serializer/reference registry/useSavedTrips/SavedTrips/cross-tab spec.
- [Source parity](source-parity.json): 9 runtime files и9 test files совпадают с production copy после единственной нормализации loopback ports. [Desktop screenshot](provenance-320-desktop.png), [mobile screenshot](provenance-320-mobile.png); PL desktop визуально просмотрен. WebKit, реальные устройства, manual screen reader и production CWV не проверены; axe не подменяет эти проверки.

Локальная production copy `.cache/aud05-h3-11a-20261104`,3125/8125, Chrome desktop/mobile, synthetic SQLite, PyCharm Python3.12.10 после python-tools preflight. prepare-e2e.ps1 + явная копия airport-city JSON и двух untracked Python fixtures; только в copy npm start вместо dev. NBP в новых browser tests перехвачен synthetic rate; цены жилья/еды, платные поставщики, реальные партнёрские переходы и уведомления не запрашивались. Производственный backend не менялся: API suite/Ruff/mypy не повторялись. Существующие процессы не останавливались и не переиспользовались. Миграций, dependencies, deployment, PR/commit нет.

Для места под новую сборку после baseline удалён только собственный generated `.cache/aud05-h3-10-20261104/apps/web/.next` (114.14MiB). Точный absolute path/ancestors проверены; один junction удалён как ссылка без обхода target, затем проверено отсутствие reparse points. Source copy, shared node_modules и все H3 evidence сохранены; запись `.cache/h3-11a-generated-cache-cleanup.json`.

## Rollback и следующий шаг

Вернуть только delta11a в draft/provider/calculator/reference/deal/shared pages и удалить новые provenance helper/copy/component/tests. Новые optional annotations можно игнорировать: прежние version1 inputs читаются старым reader без потери amounts. При обратном сохранении старый reader опустит metadata; числа сохранятся. Полные общие файлы из HEAD не возвращать: там предыдущие H3/пользовательские изменения. Shared6000/local50000 и saved20 limits не расширялись; большие snapshots по-прежнему могут требовать сокращения, metadata не обходит этот guard.

H3-11b: editable эконом/стандарт/комфорт и transparent ranges/projections, с явным основанием assumptions и без неподтверждённых market defaults; не перезаписывать ручные суммы. H3-12 plan identity/share privacy остаётся отдельной задачей. После завершения11a остановиться.
