# H3-18b1 — последовательная воронка сессий

2026-11-06. **H3-18b1 DONE локально; H3-18 IN_PROGRESS.** Одна часть H3-18b по §1.2 плана: воспроизводимая воронка в существующем защищённом usage API и административном HTML-отчёте. Сбор событий, публичный интерфейс и production не менялись.

## Основание и изменение

H3-18a уже проверила 14 wire events, согласие, session/dedup и защищённый dashboard. Прежние независимые показатели и пары `(сессия, предложение)` не составляли последовательную воронку. Переиспользованы те же модели, отфильтрованные события, auth, лимиты и SQL-запрос; отдельного провайдера аналитики нет.

`GET /api/v1/admin/analytics/usage` получает дополнительное поле `ordered_funnel` с `version=ordered-session-funnel-v1` и пятью `steps`. Каждый шаг содержит `key`, `sessions`, `previous_sessions`, `percent`, `status`. Decimal передаётся строкой, отсутствие доли — `null`. Поле optional при создании `UsageReport`, поэтому прежние вызовы конструктора совместимы. Старые поля и их определения сохранены; потребители JSON должны допускать дополнительные поля.

`GET /api/v1/admin/analytics/dashboard?locale=pl|en|ru|uk` показывает локализованную таблицу и ограничения. Сохранены script-free HTML, noindex, no-referrer, CSP и существующая проверка admin token. Идентификаторы сессий и токен в вывод не попадают.

## Определение v1

Последовательность: `PAGE_VIEW → SEARCH → SEARCH_RESULT(count>0) → DEAL_VIEW → PARTNER_CLICK`.

- Берутся только полученные события внутри `[start,end)`; сортировка по серверному `created_at`, затем DB `id`. Нет восстановления начала сессии за границей окна или порядка действий на клиенте.
- Одна сессия учитывается максимум один раз на этапе. На первом этапе только сессии с `PAGE_VIEW`, поэтому его население может отличаться от прежнего `observed_sessions`.
- Результат допустим только при целом `result_count` от 1 до 100 и `error=null`. Boolean, malformed, пустые результаты и ошибки не продвигают этап.
- Открытие и последующий партнёрский клик должны иметь один `deal_id`; учитывается любое подходящее предложение, просмотренное после результатов. Другая оферта, клик до просмотра и отсутствующий ID не завершают путь.
- Это существование упорядоченной последовательности внутри сессии, без привязки к конкретному поиску. Следующий поиск с ошибкой или пустым результатом не отменяет уже достигнутый этап. Нет `search_id`, доказательства причинности, брони или комиссии.
- Доля — количество сессий этапа / количество предыдущего этапа, округление до двух знаков. У первого этапа нет знаменателя/доли. Нулевой знаменатель означает `no_data/null`; положительный знаменатель и ноль переходов означают `available/0.00`.

Прежние ограничения: окно максимум 31 день; при превышении 20000 событий — 413 с предложением сузить период, без обрезания выборки. Consent, блокировщики и сеть ограничивают наблюдения; сессия не равна человеку. Новых идентификаторов, метаданных, трекинга, consent/session/transport изменений, миграций и зависимостей нет.

## Проверки и evidence

Только синтетические SQLite-фикстуры. Базовая фикстура: **17 событий / 4 наблюдаемые сессии**, новая воронка **3 → 2 → 1 → 1 → 1**, доли **— / 66.67% / 50.00% / 100.00% / 100.00%**. Четвёртая сессия с отдельным кликом не входит в воронку. Старый search initiation остаётся **2/4=50%**. Эти числа не являются реальными KPI.

| Проверка | Результат | Артефакт |
|---|---|---|
| Новые + usage/product/funnel API tests | 75 passed, 2 warnings | [api.txt](api.txt), [JUnit](api.xml) |
| Полный API suite | 1121 passed, 18 PostgreSQL skipped, 2 warnings | [full-api.txt](full-api.txt), [JUnit](full-api.xml) |
| После финальной HTML-правки | 18 passed, 2 warnings | [final-targeted.txt](final-targeted.txt), [JUnit](final-targeted.xml) |
| Chromium: 4 языка × 320/390/768/1440 | 16/16, axe violations/incomplete 0, skip-link работает, page overflow/pageerror 0 | [browser.json](browser.json), [browser.txt](browser.txt) |
| Ruff / mypy | PASS / 122 source files PASS | [ruff.txt](ruff.txt), [mypy.txt](mypy.txt) |

Полный API suite выполнен до последней HTML-правки: убрано дублирующее имя landmark у внешнего `section`, именованный внутренний scroll region сохранён. После неё заново выполнены 18 целевых тестов и весь указанный browser sweep. Два предупреждения — существующие deprecation в Starlette/httpx и anyio BlockingPortal.

Первый browser helper ошибочно использовал удобный `browser.newPage()`; axe потребовал явный `newContext()` ([первый лог](browser-initial.txt)). Следующая попытка обнаружила настоящее замечание `landmark-unique` ([лог до исправления](browser-landmark-before.txt)); исправлена разметка. Финальный результат не скрывает первые неудачи.

Браузер открывал `file://` HTML, полученный настоящим Python-renderer через TestClient, с активным CSP; это не live login/API-интеграция. API/auth/лимиты проверены отдельно pytest. Ручной просмотр: [RU 320](funnel-ru-320.png), [UK 320](funnel-uk-320.png), [EN 1440](funnel-en-1440.png). Таблица на узком экране имеет внутреннюю горизонтальную прокрутку; страница не переполняется. Manual screen reader, WebKit и реальные устройства этим прогоном не сертифицируются.

Воспроизведение из корня, используя настроенный PyCharm SDK (в этом выполнении `.venv/Scripts/python.exe`):

```powershell
$env:HOPTRIP_18B_EVIDENCE = (Resolve-Path docs/h3-18b1).Path
.venv/Scripts/python.exe -m pytest apps/api/tests/test_ordered_funnel.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_product_analytics.py apps/api/tests/test_funnel_analytics.py -q --junitxml=docs/h3-18b1/api.xml
.venv/Scripts/python.exe -m pytest -q --junitxml=docs/h3-18b1/full-api.xml
.venv/Scripts/python.exe -m ruff check apps/api/app/schemas/usage.py apps/api/app/services/usage_metrics.py apps/api/app/services/usage_dashboard.py apps/api/tests/test_ordered_funnel.py
.venv/Scripts/python.exe -m mypy apps/api/app
node docs/h3-18b1/browser.mjs
```

IDE build result сохранён в `ide-build.json`; его диагностика ограничена. Новый Next build не требуется: изменён Python-rendered admin HTML, frontend bundle не менялся. Backend imports, типы и HTTP rendering проверены pytest/mypy.

## Rollout, откат и остаток

Новый feature flag не нужен: дополнительный агрегат доступен только через существующий защищённый read-only endpoint. Deployment, реальные данные, письма, Telegram, партнёрские переходы и production запросы не выполнялись. Откат — убрать только добавления в `schemas/usage.py`, `services/usage_metrics.py`, `services/usage_dashboard.py` и новый `test_ordered_funnel.py`. Не откатывать целиком dirty checkout: предыдущие H3, IDE-изменения и ранее разрешённая очистка сохранены.

**Следующая отдельная часть — H3-18b2:** минимальное расширение покрытия недостающих событий после проверки taxonomy/consent/дедупликации. Не выполнены `offer_details_opened`, завершённый бюджет, `trip_updated`, privacy-safe разрезы, save/revisit, реальные сравнимые baseline/after и controlled experiments. Device/returning остаются unavailable. H3-17 ожидает staging/activation и оставшиеся release checks; H3-14 BLOCKED внешними delivery/activation условиями. Никакого заявления об uplift; следующая задача здесь не начинается.
