# DEAL-02 — предсказуемые фильтры перелётов

Дата:2026-10-31. Только DEAL-02; UX-02 и DEAL-01 DONE. Следующая по execution order DEAL-05 не начата.

## Проверенные возможности

Общая FilterForm, URL serialization, individual chips/Reset All, три пресета и server validation уже существовали. В каталоге даты и длительность по умолчанию были свёрнуты; правила замены находились в отдельном раскрытии. aria-pressed вычислялся только из применённого URL, хотя пользователь мог уже изменить поле вручную. Пресет мог получить прежний URL, поэтому перемонтирование формы не гарантировало обновление отредактированного поля.

Публичная сигнатура apps/api/app/api/catalog.py:list_deals поддерживает origin/destination, departure_from/to, budget, duration_min/max, weekend и sort=score|price|departure. Внутренний round_trip используется city-break и не означает direct flights. Фильтров количества пересадок, прямого рейса, времени суток или максимальных минут перелёта нет. Новые неработающие controls и client-only фильтрация только текущих12 records не добавлялись: они исказили бы totals/pagination. Airport constraints сохраняются в existing airport/locked landing/Warsaw group flows.

## Реализованное поведение

- В каталоге/landing даты и длительность раскрыты по умолчанию и стоят перед sorting/presets. Пользователь может свернуть их; применённые значения остаются в chips. Hero сохраняет UX-01: видимые даты, дополнительная длина пребывания, одна search action; presets/sorting остаются в каталоге.
- Preset hint виден рядом с кнопками. Weekend,2–3 nights,flight≤300PLN/person сохраняют прежние точные rules. Пресет заменяет только свои поля и сразу отправляет весь введённый form; повторное нажатие удаляет свои условия, не восстанавливает прежние ручные значения. Presets не создают скрытой истории undo.
- aria-pressed отражает текущие введённые budget/duration/weekend значения. Chips отдельно показывают применённый URL. При same-selection/same-URL preset его owned values проектируются в uncontrolled inputs: поле150 при уже применённом URLbudget300 становится300, даже без remount. При изменении search selection старые поля не перезаписываются перед переходом, сохраняя корректную историю.
- Preset ownership вынесен в общий presetValues, используемый и togglePreset, и проекцией формы; unrelated fields/sort не затрагиваются. offset по-прежнему удаляется при новом поиске. Unit invariants дополнены сохранением sort.
- Рядом с sorting явно сказано, что он применяет и введённые фильтры. Сами три сортировки, SQL/order и их смысл не менялись — DEAL-03 не выполнялась.
- Applied section показывает количество активных полей/chips и явное отсутствие дополнительных фильтров. Удаление chip работает с применённым поиском; unsubmitted drafts не переносятся им в новый URL. Reset All очищает applied criteria/cookie origin, выходит из fixed landing в общий каталог, сохраняет sort — это прежнее поведение теперь пояснено. При нулевых applied criteria лишней reset-ссылки и пустого nav нет.
- Existing validation/invalid focus/pending disabling сохранены. Нативные ограничения и инверсия дат/ночей проверяются до server action; отклонённая форма не передаёт управление навигацией. Locked filters/Warsaw group и их removal-to-generic semantics сохранены.

Все4 новые подсказки переведены PL/EN/RU/UK. CSS, API keys/query contract, SEO canonical/indexing, deal cards, prices/scoring/affiliate tracking и DB не менялись.

## Исправленная гонка origin → full search

Наблюдение UX-03-F01 подтверждено отдельно: [before](e2e-before.json),0/2, errors=[],48.83s. Для этого в изолированной копии восстановлены pre-DEAL-02 FilterForm, HomeOrigin и origin-preference из .cache/deal02-before; остальные файлы соответствовали checkout на момент копирования. Baseline не выдаётся за финальный source-parity snapshot. Оба проекта после задержанного origin preference response оставались на `/?origin=WRO` вместо `/deals?origin=WRO&destination=milan&budget=300`.

Теперь после успешной validation FilterForm сообщает HomeOrigin о полном поиске через optional onSearch. Токен незавершённого origin-only перехода становится устаревшим; его push и home refresh подавляются, пока навигацией владеет searchWithOrigin. Save+redirect прежней search action остаются атомарными. Следующий явный выбор аэропорта возвращает origin navigation управление. Данные формы собираются до transition, optional cookie failure не блокирует поиск. Новый browser case проверяет задержанный response, полный URL со всеми полями и Back к готовой home selection. Это закрывает воспроизведённый сценарий; общая API/cold-entry reliability и все возможные сетевые interleavings не объявляются исправленными.

## Проверки

- `npm --prefix apps/web run test:unit`:145 passed; новых pure cases нет, существующие preset tests усилены проверкой sort preservation.
- `npm --prefix apps/web run lint`:passed.
- `npm --prefix apps/web run build`:passed,TypeScript,61 static/SSG pages. Generated next-env.d.ts восстановлен к прежним dev imports, diff пуст.
- Первый широкий запуск прерван из-за test-harness wait: response headers server action получены, но `response.finished()` не завершился и следующие UI assertions не начались. [Interrupted record](e2e-interrupted.json), [context](initial-errors/filter-workflow-pl-visible-48e56-history-and-reset-semantics-desktop.md). Ему не присваиваются итоговые passes. Проверено и завершено только дерево собственного runner; чужие процессы не трогали. Helper теперь ждёт response headers и aria-busy=false, сохраняя все проверки значений/URL.
- Acceptance: `node node_modules/@playwright/test/cli.js test filter-workflow.spec.ts trip-filters.spec.ts ui.spec.ts hero-search.spec.ts --grep 'visible primary filters|full search wins|fixed landing|trip presets combine|home search carries|advanced fields|origin-only|invalid routes' --reporter=json`. [Raw report](e2e.json): **22/22**, errors=[],unexpected=0,retries=0,178.01s.

Новые12 cases:4 locales×desktop/mobile — visible fields, same-URL budget preset, manual bounds/budget, preset activation/deactivation, reload/Back/Forward, sorting with draft fields, individual removal, empty results, reset preserving sort/cookie clear, axe/overflow320. Плюс held-origin/search/Back и fixed landing removal в обоих проектах. Existing cases проверяют combined weekend/nights/budget/date filters, inverted-date/native validation/keyboard, home search и held POST/pending controls. Старый home-presets test был устаревшим после UX-01; обновлён на фактический hero search с датой и бюджетом, не возвращая удалённые hero preset buttons. Existing ui keyboard test теперь сначала закрывает и вновь открывает default-open dates, остальные assertions сохранены.

Просмотрены [desktop](filters-desktop.png) и [320px](filters-320.png). На narrow нужны вертикальная прокрутка и browser-native date controls; Dev indicator относится к test environment. Это не реальные устройства/WCAG certification/user-conversion study, full suite не заявляется пройденным. Повторы и before не суммируются с22.

Изоляция: .cache/aud05-deal02[-before/-final], SQLite, собственный.next, loopback3125/8125, Chrome headless; PyCharm SDK Python3.12.10. APP_ENV=test,DATABASE_URL=sqlite://; real alerts/digest/editor/events sync выключены. Backend/Python/fixture не менялись, backend/PG/Ruff/mypy не запускались, старые результаты не переносятся. [546 runtime files](source-parity.json) совпали с финальной копией. Собственные servers закрыты, чужие3100/8100 не трогали.

Машиночитаемая сводка: [checks.json](checks.json). JSON, локальные Markdown links и whitespace проверены; прежние пользовательские изменения сохранены.

## Release / rollback

Обычный согласованный web release, без DB/API migration, новых dependencies/storage, paid APIs, credentials или campaigns. Production не затрагивался. Rollback только DEAL-02 FilterForm/HomeOrigin/OriginSelection hook, preset ownership registry и новые copy/tests; сохранить прежние UX/SEC/DATA/DEAL изменения, пользовательские master plan/IDE. При rollback вернётся прежний origin/full-search race и свёрнутые по умолчанию даты каталога. DB/cookie cleanup не требуется.

DEAL-02 DONE в checkout. Остановка после DEAL-02. DEAL-05 не начата.
