# TRIP-03 — быстрый и подробный бюджет

Дата: 2026-10-31. Только TRIP-03, зависимость TRIP-01 DONE. Статус: DONE. TRIP-04 не начата.

## Проверено до изменений

Калькулятор уже считал integer grosz в PLN, копировал flight_price_pln через budgetForTrip, различал стоимость на человека/день/ночь/группу и пустое значение/явный ноль. Ночлег имел два независимых поля night/stay, в итог входил только выбранный вариант. TripDraftProvider сохранял общие даты/людей/расходы для accommodation, calculator, saved/share; выбранные события считались отдельно и сохранялись в snapshot. Эти механизмы переиспользованы.

Основные четыре поля уже были видны, дополнительные раскрывались через details. Не было явного выбора режимов, отдельных налогов/сборов и аварийного резерва. Версия v1 требовала все исходные поля: простое добавление новых обязательных ключей нарушило бы чтение старых планов. Изучены calculator/CSS, draft/parser, shared allowlist, события/reference fares, потребители detail/shared/info, unit/browser tests, установленная Next документация use-client/server-client components.

## Поведение

- Быстрый режим по умолчанию: перелёт, проживание, транспорт/трансферы, питание и общий ориентировочный итог. Подробный раскрывает багаж, городской транспорт, развлечения, прочие расходы, налоги/сборы и аварийный резерв. Основные поля общие. Transfer field не дублируется. Выбранные события остаются видимыми и редактируемыми в обоих режимах, чтобы ссылки на #planned-events продолжали работать.
- Переключение меняет только видимость дополнительных полей. Все строки и события всегда участвуют в том же calculateBudget. Скрытые неизвестные расходы остаются в списке недостающих; скрытая ошибка блокирует итог и получает кнопку раскрытия для исправления. Native details и кнопки aria-pressed/aria-controls синхронизированы; управление доступно клавиатурой.
- Налоги и аварийный резерв — суммы для всей группы за поездку, без умножения на людей/ночи. Подсказки требуют включать только ещё не учтённые суммы. Прежнее other сохраняет название и деньги, в том числе ранее записанный резерв: автоматически отделить его нельзя. Новый buffer не получает процент или цену по умолчанию.
- Цена перелёта по-прежнему копируется из оферты один раз на человека. Возврат учитывается только при наличии в оферте; недостающий билет пользователь добавляет к flight. One-way не получает выдуманного checkout. Изменение группы масштабирует per-person flight один раз, а stay-total не масштабирует. Пользовательские/restored/shared суммы имеют прежний приоритет.
- Источник и степень уверенности указаны явно: цена оферты — наблюдавшаяся, остальные суммы — оценки или вручную внесённые цены, требующие проверки. Пустое поле помечено неизвестным; ноль вводится явно. Ориентировочный итог и равное деление на человека имеют разные подписи. Подтверждённых покупок/фактически оплаченных цен в контракте нет: приложение их не выдумывает и не подтверждает manual amounts.
- Везде PLN; автоматического смешивания валют нет. ReferenceCosts сохраняет прежний FX механизм, заполняет только пустой local_transport и раскрывает подробный режим. Цены selected events по-прежнему вводятся в PLN; суммы events не копируются в attractions.

PL/EN/RU/UK обновлены. API/DB, flight score/freshness, affiliate URLs/attribution, согласие и analytics handlers не менялись. Новых зависимостей нет. TRIP-04/05 не реализовывались.

## Совместимость данных

Storage keys и version=1 сохранены. readBudgetDraft/readLocalBudgetDraft допускают отсутствие только новых taxes/buffer и восстанавливают их как пустую строку (unknown). Исходные обязательные поля, типы, длины, строгие даты shared links, allowlist, events/URL guards и size limits сохранены. Новый encoder автоматически включает дополнительные суммы через прежний allowlist input. Старые raw encoded/saved tokens проверяются без повторного кодирования новым encoder.

Date edits сохраняют все суммы. Reset очищает оба новых поля вместе с прежними. При обновлении структуры defaults старый context может вызвать прежнее предупреждение review; деньги не сбрасываются. Режим отображения после перехода/обновления возвращается к быстрому, расходы восстанавливаются независимо от режима. Совместимость чтения старых планов новой версией проверяется; старый bundle не умеет считать новые категории.

## Проверки

[Unit](unit.txt): 173 passed, пять новых cases для совместимости raw legacy drafts/shared/saved tokens, strict validation, group arithmetic/грошей, unknown/zero, переводов. [Первый unit run](unit-initial.txt): одна неверная ожидаемая сумма в новом тесте; исправлена арифметика ожидания с 2022.84 на 1922.84, формула продукта не менялась по этому поводу.

[Первый browser run](e2e-initial.json): 34/44 passed,10 failures,363.78s,errors=[],retries0. Восемь новых locale/project cases ожидали итог без checkout для one-way browser-deal: приложение правильно блокировало расчёт при неполных датах. Подготовка теста исправлена явными stay dates1–3May2030, без изменения validation продукта; [исходный context](initial-one-way-context.md) сохранён. Два прежних anchor cases после click не получали #calculator при незакрытом consent/раннем запуске: [context](initial-anchor-context.md). Test setup теперь явно отклоняет optional consent и ждёт enabled calculator; точная URL assertion сохранена. Причина исходной гонки отдельно не доказана, product navigation не менялась. Эти failures не объявляются исправлением API/cold-entry reliability.

[ESLint](lint.txt) и [Next build/TypeScript](build.txt) прошли. Backend runtime/fixture не менялись; полный backend/PostgreSQL/mypy/Ruff не запускались. Для запуска изолированной Python fixture SDK получен через python-tools/PyCharm get_python_environment; пакеты не устанавливались.

[Финальный основной browser run](e2e.json): 44/44 passed,307.48s,unexpected0,skipped0,flaky0,errors=[],retries0. Новые12 cases плюс прежние32: exact arithmetic, unknown/zero, quick/detailed сохранение всех строк, hotel night/stay, dates/people/adults, reference-fare no-overwrite, selected events/variants/unknown prices без double-counting, local invalid-date recovery, save/share/independent copy, locale/canonical/query/hash, consent-gated analytics, reset/storage failures. 4 языка,320px, Enter/pressed state/error focus, scoped axe без violations. Исходные failures сохранены и не суммируются с финальными passes.

Просмотрены [quick desktop320](quick-320-desktop.png), [detailed desktop320](detailed-320-desktop.png), [quick mobile320](quick-320-mobile.png), [detailed mobile320](detailed-320-mobile.png). DPR3 detailed capture получился864×17310 и содержал повтор фрагмента внизу. Для надёжной визуальной сверки screenshot option изменён на scale=css; отдельный [mobile repeat](e2e-visual.json):1/1 passed,21.97s,errors=[],retries0, сохраняет изображения в CSS pixels. Повторный detailed288×5770 просмотрен, повтор фрагмента отсутствует. Код продукта и assertions не менялись; повтор учитывается отдельно от44 cases. Native controls/dev indicator относятся к локальной среде.

[Source parity](source-parity.json) сопоставляет runtime apps/api/app + apps/web/src между checkout и isolated copy; tests/config используют только свои3125/8125. [Финальная сверка](verification.json) включает JSON reports, локальные Markdown links, whitespace относительно task snapshot, next-env.d.ts и закрытие [своих портов](ports.json).

## Воспроизведение и безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. После build создать новую копию: `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-trip03-new`. Существующий каталог не перезаписывать, build не запускать параллельно браузерному прогону. Исправить только generated next-env.d.ts обратно на прежний dev/types import, проверить отсутствие diff.

Перед fixture получить SDK через PyCharm get_python_environment. В isolated apps/web задать HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Playwright запускает guarded HOPTRIP_E2E=1 app с disposable SQLite/fake providers и отдельный .next на3125/8125, без reuse. Чужие3100/8100 не останавливать.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)budget-modes\.spec\.ts$' '(^|/)trip-budget\.spec\.ts$' '(^|/)trip-parameters\.spec\.ts$' '(^|/)planned-events\.spec\.ts$' '(^|/)localized-budget\.spec\.ts$' '(^|/)budget-recovery\.spec\.ts$' --reporter=json
```

Данные и цены в тестах синтетические. NBP request существующего reference-fare теста перехвачен fixture; реальные quote/бронирования/платные API/рассылки не запускались. Desktop Chrome и mobile emulation не подтверждают физические устройства, конверсию или полную WCAG сертификацию. Прежние cold-entry/API observations остаются открытыми.

## Release / rollback

Выпускать согласованным web bundle; миграций DB и cleanup drafts/cookies нет. Откатить только TRIP-03 calculator/CSS/copy, cost fields/defaults и additive draft reader, связанные тесты. Не восстанавливать весь HEAD с предыдущими задачами и пользовательскими правками.

При откате на старый bundle новые taxes/buffer в его расчёте не участвуют и при сохранении могут быть потеряны. Для безопасного отката сохранить additive reader/calculation новых полей до завершения перехода; при необходимости перенести их суммы в other явно, с проверкой отсутствия дублей и обновлением сохранённых snapshots. Автоматической записи/перераспределения данных пользователей не выполнялось. Совместимость нового reader со старыми планами не означает обратную совместимость старых writers с новыми суммами.

TRIP-03 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production/DB/credentials/affiliate configuration и пользовательские изменения master plan/IDE не затрагивались. TRIP-04 не начата; остановка после этой задачи.
