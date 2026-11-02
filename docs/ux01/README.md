# UX-01 — главный поисковый блок

Дата: 2026-10-30. Выбрана следующей после DEAL-04 по execution order; AUD-03 DONE. Выполнялась только UX-01. Production/deployment/рассылки не затрагивались.

## Исходное состояние и изменения

Hero уже использовал общий FilterForm, combobox выбора аэропорта/направления, серверное предпочтение аэропорта, native input bounds и проверку интервалов. Однако даты скрывались в disclosure, быстрые пресеты сразу запускали дополнительные поиски, пустое направление обозначалось только подсказкой, а три вводных текста конкурировали за место. На главной из URL восстанавливался только origin. Подтверждённый AUD-03 F01: ссылка из деталей вела на `/deals` и теряла исходные фильтры.

Сохранён общий FilterForm, без второй формы или новых зависимостей. Hero получил короткие headline/supporting copy, явный Anywhere option в том же destination combobox, видимый диапазон возможного **вылета**, необязательный бюджет на перелёт на человека в PLN и одну submit-кнопку. Незаполненные даты означают отсутствие ограничений; одна граница задаёт открытый интервал. Это прежние `departure_from`/`departure_to` включительно, не даты возврата и не новый API поиска ±N дней.

Пресеты и объяснения их календарной семантики остаются в каталоге; в hero они больше не создают дополнительные действия поиска. Длина пребывания доступна через «Ещё параметры». Date fields не дублируются внутри этого disclosure. Hero восстанавливает допустимые search filters из URL, сохраняет sort при submit и начинает новый поиск без прежнего pagination offset. Для выбора «Куда угодно» передаётся отсутствие destination, а не выдуманный город/код. Поддержаны мышь и Arrow/Enter/Escape.

PL/EN/RU/UK обновлены в существующих словарях. Canonical/SEO metadata, indexed paths, API filters, flight-quality policy DEAL-04, scoring, affiliate tracking, consent и нижние секции главной сохраняют прежнее назначение. Отдельный выбор origin для коротких поездок не объединялся с основным: это UX-02. Перестановка нижних секций — UX-03, она не выполнялась.

## Сохранение поиска при навигации

Фильтрованный каталог добавляет к ссылке оферты encoded `returnTo=/deals?...`. Этот же URL используют ссылки полного объяснения оценки, включая открытие в отдельной вкладке; обычный PL dialog не меняет поведение. Включаются только существующие search keys, включая sort/offset; в деталях `searchReturnPath` снова применяет allowlist и принимает только внутренний `/deals`. Внешние адреса, другие routes, control characters, backslashes, array/oversized values получают безопасный fallback `/deals`. Unknown query keys удаляются. Locale выбирается текущей страницей, а canonical оферты не включает returnTo. Прямые ссылки без контекста работают как раньше.

Для специализированных catalog landings обратный переход ведёт в общий каталог с их действующими условиями; адрес landing не сохраняется как произвольный redirect target. Фильтры нормализуются штатной search policy, поэтому сохранение относится к условиям, а не произвольному порядку/написанию query string. Контекст переживает reload оферты и не требует нового localStorage/cookie. Общие планы и seller links по-прежнему используют собственные идентификаторы, а не этот служебный параметр.

Сохранение origin и переход выполняются одной server action `searchWithOrigin`: допустимы только локальные пути из существующего catalog registry, внешний URL отвергается до cookie write. Optional preference failure не отменяет redirect к поиску. Сам `redirect` остаётся вне catch; client вызывает action в React transition. Это учитывает документированное поведение Next: cookie write повторно рендерит текущий server tree, а redirect является framework control flow. На время отправки controls отключены native disabled fieldset/attributes, форма отмечена aria-busy. Валидация и чтение FormData происходят **до** transition: неверный ввод не блокируется и сохраняет focus/error description. Hero key зависит от URL, поэтому запись cookie сама по себе не перемонтирует вводимую форму. Формат/срок/HttpOnly/SameSite/Secure политики существующего origin cookie не изменены.

## Проверки и доказательства

Использованы installed Next 16.4.3 guides Server/Client Components, Mutating Data и Playwright, как требует apps/web/AGENTS.md. Python для synthetic E2E fixture выбран через PyCharm get_python_environment: `.venv/Scripts/python.exe`, Python 3.12.10. APP_ENV=test, DATABASE_URL=sqlite://, alerts/digest/editor/events sync выключены. API runtime и schema в UX-01 не менялись; backend/PG suites этой задачей не запускались и прежние результаты DEAL-04 здесь не суммируются.

| Проверка | Результат |
|---|---|
| `npm run test:unit` | 120 passed, 0 failed: 115 прежних + 2 return-context + 3 server-action cases |
| `npm run lint` | Passed |
| `npm run build` | Passed, TypeScript и 61 static/SSG pages |
| Chrome Playwright, основной acceptance run | 24/24, unexpected=0, errors=[], 161.72 s; [e2e-final.json](e2e-final.json) |
| Mobile follow-up после 16 px date input fix | 3 passed, 1 expected desktop skip, 54.11 s; [e2e-mobile.json](e2e-mobile.json) |
| После финального narrow-layout/score-link изменения | 6 passed, 1 expected skip, 1 cold-entry failure, 105.19 s; [e2e-navigation.json](e2e-navigation.json). Подробности ниже |
| Score link через основной home → search flow | 2/2 desktop/mobile, unexpected=0, errors=[], 29.06 s; [e2e-score-final.json](e2e-score-final.json) |

Два новых pure context tests проверяют сохранение всех условий и pagination, нормализацию origin, удаление unknown keys и unsafe inputs. Три action tests исполняют настоящий серверный код с mock только request-bound cookies/redirect: locale/query сохранены, cookie attrs прежние, clear работает, external/unrelated URL не пишет cookie, synthetic cookie failure всё равно позволяет поиск.

Новый `hero-search.spec.ts` содержит пять сценариев на desktop/mobile: одна primary action/Anywhere/видимые даты/axe/320 px; origin-only и destination+budget; departure range+sort через detail/reload/back; invalid airport/date/budget; четыре языка с возвратом в каталог и чистым canonical. В origin-only case тест задерживает настоящий test-server POST до проверки disabled controls/aria-busy, затем явно отпускает запрос; arbitrary sleep не используется. Дополнительно выбраны airport-search, roadmap-baseline, home-layout и localized-home. Старые selectors обновлены только под намеренно изменённые copy/layout/returnTo contracts. Expected-fail annotation F01 удалена: прежнее assertion сохранения поиска теперь обязано проходить. Старое требование first-card-above-fold заменено проверкой primary CTA: quality policy может законно оставить home selection пустой.

До реализации title acceptance был красным на обоих viewport: [e2e-before.json](e2e-before.json), 0 pass/2 failure; [desktop](before-desktop.png), [mobile](before-mobile.png). Это целевой probe, не полный исходный regression baseline.

Первый полный выбранный run: 27 pass/5 failure, [e2e-initial.json](e2e-initial.json), 352.67 s. Два mobile failures — primary CTA вне viewport, после чего уплотнено расположение полей. На mobile подсказки combobox визуально скрыты с сохранением aria-description; controls доступны с вертикальной прокруткой. На стандартном iPhone fixture viewport 390×664 кнопка может находиться ниже fold: тест проверяет её видимость/доступность **после прокрутки**, а не прежнее положение при скрытых датах. Это намеренное изменение layout contract, не доказательство исходной проверки above-fold. Три navigation failures включали origin-only submit, первый detail transition и reset. Trace первого submit содержал успешный cookie POST без завершившегося перехода. Для первого detail request при 5-second assertion оставался pending; новый scenario использует 15-second ожидание, как существующая localized suite. Не все эти сбои приписываются одной доказанной причине.

Промежуточный run с server redirect и client catch: 28 pass/4 failure, [e2e-intermediate.json](e2e-intermediate.json), 563.36 s. Trace показал `x-action-redirect` и повторный GET; catch/последующий client push убраны, framework redirect передан transition. Среди failures также был mobile alias request; причина этого отдельного сбоя не установлена. Промежуточная подготовка включала copy, завершившийся уже после старта runner, и некоторые проверки совмещались со сборкой: это не используются как доказательство причин ошибок. Окончательный source sync и build завершены перед итоговым runner, parity проверен отдельно.

Следующий targeted run: 20 pass/2 failure, [e2e-transition.json](e2e-transition.json), 192.87 s. Оба failures — editing после Enter на **том же URL**: прежнее URL assertion уже было истинным до завершения операции. Добавлены ожидание aria-busy=false и блокировка pending controls, чтобы поздний refresh не терял последующий ввод. Первый вариант блокировки дал 16 pass/6 failure, [e2e-pending.json](e2e-pending.json), 222.24 s: transition начинался до validation и снимал focus с ошибочного поля. Валидация перенесена перед transition, focus assertions сохранены. Финальные результаты не складываются с этими повторами и не скрывают regressions промежуточных вариантов.

После исправления validation/pending основной command `node node_modules/@playwright/test/cli.js test hero-search.spec.ts airport-search.spec.ts roadmap-baseline.spec.ts home-layout.spec.ts --reporter=json` прошёл 24/24. Он проверяет primary navigation, invalid focus, controlled delayed POST, сохранение/сброс origin, возврат с фильтрами, четыре языка, axe и layout. Затем сохранён прежний mobile input font minimum 16 px; визуальная проверка обнаружила тесный native year segment в двух колонках на 320 px, поэтому при ширине ≤360 px даты расположены вертикально. Fields ≥44 px, без горизонтального overflow. Более высокая форма требует вертикальной прокрутки; above-fold CTA на 390×664 не гарантируется. Основной 24-case run был до этих последних CSS и score-link changes; они проверены отдельными target runs, а не объявлены повтором всех 24.

Последний grouped command: `node node_modules/@playwright/test/cli.js test hero-search.spec.ts mobile-journey.spec.ts catalog.spec.ts scoring.spec.ts --grep 'one primary search|complete journey at 320px|airport to deal to partner|score link can open' --reporter=json`. Прошли hero desktop/mobile, полный 320 px journey (filters → flight → stay/events/budget → save/reload/share/copy → synthetic partner), affiliate/session/click tracking desktop/mobile и mobile score new-tab. Desktop 320 journey пропущен намеренно по существующему test.skip; 320 проверяется в mobile project.

Desktop score case при **прямом холодном** входе в фильтрованный каталог получил API-error state до появления cards: airports/destinations также были недоступны, отсутствовал сам target link. Повтор [e2e-score-repeat.json](e2e-score-repeat.json): 1 pass/1 failure, 46.72 s, с тем же desktop состоянием. Причина не установлена и не объявляется исправленной. Финальный сценарий целенаправленно использует путь UX-01 home → search → score new tab, сохраняя assertions exact filter return/score points; он прошёл 2/2. Это изменение setup не является доказательством исправления cold direct entry. Полный browser suite, cold-entry reliability и production performance не заявляются проверенными без ошибок.

Последние screenshots: [desktop](after-desktop.png), [mobile viewport](after-mobile.png), [320 px viewport](after-320.png), [вся форма на 320 px](after-320-form.png). Просмотрены локально; dev indicator в снимках относится к Next dev environment. Повторные cases между reports не суммируются. [checks.json](checks.json) сохраняет фактические tooling outputs и browser stats.

Synthetic SQLite и собственный `.next` находятся в `.cache/aud05-ux01[-final]`, используются порты 3125/8125; пользовательские 3100/8100 не переиспользуются. Все 544 runtime-файла совпали с checkout, включая untracked modules: [source-parity.json](source-parity.json). Screenshots/axe относятся к local fixture/Chrome headless, не к production, реальным устройствам или WCAG-сертификации. Lab before/after здесь не доказывает рост conversion или более быстрое выполнение поиска пользователями. После build восстановлены прежние dev routes imports в next-env.d.ts, diff пуст; test servers завершены.

## Release / rollback

Нет DB migration, paid API, новых credentials или кампаний. Выпускать web целиком: client form и server actions должны принадлежать одной сборке. Backend API этой задачи не требует обновления; прежние DATA/SEC release prerequisites сохраняются.

Rollback только UX-01 web changes, сохранив предыдущие SEC/DATA/DEAL изменения и пользовательское дерево. Удалять cookie/историю/DB данные не нужно. Старые detail URL с returnTo остаются открываемыми, но прежний web не сможет восстановить поиск по новой обратной ссылке. Backend/affiliate config для rollback не менять.

UX-01 DONE в checkout. Следующая задача по порядку — UX-02. Не начата; остановка после UX-01.
