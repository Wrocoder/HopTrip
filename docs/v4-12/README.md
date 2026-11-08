# V4-12 — продуктовая аналитика

**Актуальный статус: DONE локально.** Общая browser-приёмка завершена: 116/116 PASS без skipped/flaky. Исправлена проверка persistence по event_id после навигации. [Итог и границы](COMPLETION.md), [verification.json](verification.json). Ниже сохранена история реализации и ранних проверок.

Выполнение 2026-11-08 после V4-01–11. Выполняется только V4-12; V4-13 не начинается.

## Результат

Существующие 17 событий покрывают поиск, фильтры, просмотры, партнёрские переходы, сохранение/изменение плана, бюджет и email-подписки. Существующие consent/session/dedup и admin dashboard переиспользованы. Новая подсистема аналитики и идентификаторы не добавлялись.

Добавлен ограниченный разрез по **ширине окна**: `small`, `medium`, `large`, с `unknown` для старых/неполных записей. Только категория отправляется после согласия; точная ширина и сведения об устройстве не собираются. В dashboard на PL/EN/RU/UK появились две таблицы: последовательная воронка внутри группы и доли сессий с фильтрами, save, завершением бюджета, запросом и подтверждением email-alert.

Когорта фиксируется по первому полученному событию в окне, не меняется при последующих resize и не восстанавливается для старых записей. Группы не пересекаются и включают все наблюдаемые сессии. Воронка сохраняет порядок и привязку клика к ранее открытой той же оферте. Действия с подпиской не выдаются за точную конверсию «заявка → подтверждение».

Существующие метрики и их знаменатели сохранены. Legacy `device_funnel` остаётся недоступным: аппаратный тип устройства не измеряется. Новая ширина интерфейса — отдельное измерение. [Полный контракт и соответствие действий](CONTRACT.md).

API принимает новое поле необязательно; UsageReport получает необязательное дополнение. JSON metadata уже существует, поэтому миграций и новых пакетов нет. Публичные URL и SEO-политики не менялись. Admin auth, CSP, noindex и отсутствие raw IDs в агрегатах сохранены.

## Проверки

- Исходный профильный API-набор: **84 PASS**. Профильные проверки после реализации: **85 PASS** (другой состав: viewport + usage/funnel/engagement); профильный Node: **13 PASS**.
- Первый полный API: **1386 PASS / 1 FAIL**. В новом параметризованном тесте общий middleware bucket достиг лимита раньше проверки payload. Исправлена изоляция синтетического socket peer; рабочие лимиты и production-код не ослаблялись.
- Повтор полного API: **1387 PASS, 0 FAIL, 0 SKIP**, включая **20 PostgreSQL**-сценариев. Два прежних Starlette/AnyIO warnings сохранены. Ruff и mypy прошли.
- Полный Node: **379 PASS**, без skipped. ESLint и production build с TypeScript прошли. Сборка создана с loopback API/site URL и локальным operator fixture.
- Первый browser-run остановлен после обнаружения старых guards, читавших фиксированный config, и сценария save до текущей навигации в редактор. Артефакты ошибок сохранены; частичный запуск не считается полной приёмкой.
- Отдельный `playwright.production.config.ts` запускает свежий локальный production runtime, не переиспользует серверы. Guards читают выбранный CLI config и проверяют BUILD_ID. Save-сценарий ожидает редактор и проверяет повторное сохранение того же плана без дополнительного TRIP_SAVE; keepalive response при выгрузке документа не требуется от уже закрытого Page.
- Итоговые browser-результаты, typecheck и контроль совместимости будут записаны в [verification.json](verification.json).

Проверки охватывают отказы/истечение/отзыв согласия, отсутствие replay, full navigation и 30-минутную сессию, blocked storage/transport, дедупликацию, частные capability-страницы и payload без email/URL/token/плана. Для dashboard используются все четыре языка, пять ширин, axe и клавиатурная прокрутка таблиц. Синтетические отчёты явно отделены от настоящих KPI.

## PostgreSQL и границы

Полный API выполнен с отдельным cached PG16, БД `hoptrip_test`, tmpfs и loopback-портом 54967. [Параметры](postgres.json), [API summary](api-summary.json). Применены только существующие миграции к одноразовой БД; production DB и настройки не читались.

Реальных метрик до/после нет. [План сопоставимого измерения](MEASUREMENT.md) указывает существующие read-only endpoints, одинаковые окна/определения, unknown coverage и поля экспорта. Старые данные не используются как выдуманный viewport-baseline. H3-измерения, actual booking attribution, возвращающиеся люди, field CWV и независимая оценка роста конверсии не объявляются завершёнными.

Deploy, внешние трекеры, активация рассылок и реальные сообщения не выполнялись. WebKit, реальные устройства и ручной screen reader не заявляются.

## Изменённые исходники

- API: [metadata allowlist](../../apps/api/app/api/analytics.py), [analytics types](../../apps/api/app/schemas/analytics.py), [UsageReport](../../apps/api/app/schemas/usage.py), [агрегаты](../../apps/api/app/services/usage_metrics.py), [основной dashboard](../../apps/api/app/services/usage_dashboard.py), [viewport-таблицы](../../apps/api/app/services/viewport_dashboard.py).
- Web: [категории](../../apps/web/src/lib/analytics-context.ts), [существующий transport](../../apps/web/src/lib/session.ts).
- [API-проверки](../../apps/api/tests/test_viewport_analytics.py), [Node-проверки](../../apps/web/tests/viewport-analytics.test.mjs), [browser-приёмка](../../apps/web/tests/viewport-analytics.spec.ts), [production config](../../apps/web/playwright.production.config.ts).
- Existing browser specs: consent-session-navigation, product-analytics, budget-calculated-analytics, details-open-analytics, trip-update-analytics, locale-analytics — актуальные metadata и runtime/save-предпосылки.
- [Трекер](../HOPTRIP_V4_PROGRESS.md), отчёт и артефакты.

Следующая задача — **V4-13**, отдельным выполнением. Она не начиналась.

История предыдущего продолжения: **IN_PROGRESS**, общая browser-приёмка выявила ошибки; см. [результаты повторной проверки](CONTINUATION.md). Следующая работа остаётся V4-12, переход к V4-13 не разрешён статусом текущей задачи.
