# H3-06 — компактная карточка с видимыми условиями, 2026-11-03

**DONE.** Следующая отдельная задача — H3-07. Коммит/deploy не выполнялись.

## Аудит и итоговое решение

Flight listings уже используют один DealCard/DealGrid: homepage, общий каталог, origin/destination pages, guide flights и scenario landing pages. Editorial info cards имеют другое назначение и не переопределялись. Основная структура, закрытые TripDetails и отдельный price dialog уже существовали. Новый UI framework/вторая карточка не добавлялись.

Перегрузка подтверждена rendered baseline: точное время наблюдения/полная подпись и timezone, длинный seller caveat, числовые рабочие часы/zone и дополнительный EUR рядом с основной PLN ценой увеличивали карточку. При этом количество наблюдений и методика уже доступны в подробностях, поэтому их не нужно дублировать снаружи.

Итоговые изменения:

- Карточка показывает PLN flight price/person и направление one-way/return; EUR убран только из карточки. На подробной странице сохранены конвертация, источник NBP и оговорка курса платежа.
- Видны короткая локализованная подпись наблюдения/первой записи/времени записи, дата и явное требование подтвердить цену/наличие у партнёра. First-seen не переименовывается в source observation. Точное время, fetch/deadline/rule доступны через существующие TripDetails, с переиспользуемым PriceMetadata; новый внешний disclosure-контрол не добавлен.
- Историческое сравнение остаётся видимым и использует прежний validated assessment. Число наблюдений раскрывается в подробностях; короткая visible scope предупреждает о разных тарифах и неполной рыночной выборке. Формула/пороги/сортировка не меняются.
- Оценка возможного отпуска/unknown остаётся снаружи; числовые часы/zone перенесены в подробности. Actual home arrival/+day, estimated/unknown, stops, airport-switch и все critical quality reasons видимы без раскрытия.
- Цена/CTA остаются рядом в исходном единственном title/price link. Это понятный следующий шаг без дополнительной строки/дублирования ссылки. Явные housing-exclusion/baggage строки H3-03 сохранены; интервалы, ночи, бюджет, API/URLs/saved v1 не меняются.

Первоначальный вариант с отдельными внешними строками CTA и price-origin disclosure отвергнут: он увеличивал размер карточки. Итог использует уже имеющееся раскрытие подробностей. Нет line clamp, обрезки warnings, фиксированной высоты или уменьшения интерактивной зоны ниже 44px. Expiry status остаётся вне закрытых подробностей и проверяется на открытой вкладке.

## Before/after

Синтетический стенд, один Chrome runtime/font/viewport для каждой пары. Перед каждым состоянием viewport восстанавливается. Baseline: 4 locale ×desktop/mobile ×complete/partial/critical = **24 измерения**; итоговый тест требует уменьшения высоты для каждой сопоставимой пары.

| PL | Before, px | After, px | Изменение |
|---|---:|---:|---:|
| desktop complete | 762.33 | 722.84 | −5.2% |
| desktop partial | 823.47 | 783.98 | −4.8% |
| desktop critical | 1020.39 | 1001.20 | −1.9% |
| mobile complete | 755.17 | 715.69 | −5.2% |
| mobile partial | 816.31 | 776.83 | −4.8% |
| mobile critical | 1013.23 | 994.05 | −1.9% |

Все 24 пары уменьшились, диапазон **1.9–9.7%**. Critical cards остаются высокими из-за обязательных предупреждений. Это геометрическое сравнение fixtures, не доказательство ускорения выбора/CTR/CWV или результата пользовательского исследования.

[Все пары](comparison.json), [before](before-metrics.json), [after](after-metrics.json). Примеры: [PL desktop before](before/pl-desktop/card.png) → [after](after/pl-desktop/card.png); [RU mobile before](before/ru-mobile/card.png) → [after](after/ru-mobile/card.png); [длинный заголовок/большая цена 320px](after/pl-desktop/long-320.png). Для всех четырёх языков desktop/mobile screenshots сохранены в before/after. В after виден keyboard focus на summary; измерение высоты от outline не зависит.

## Проверки и воспроизведение

Изолированная копия `.cache/aud05-h3-06-20261103`, loopback 3125/8125, production build/start, Chrome Playwright desktop/mobile. Старые серверы не останавливались, реальные партнёрские переходы/рассылки не выполнялись. Python для fixture server проверен через PyCharm: 3.12.10 `.venv/Scripts/python.exe`.

| Проверка | Результат / evidence |
|---|---|
| `npm run test:unit` | **241 passed**, [вывод](node-final.txt) |
| `npm run lint`, targeted lint после test fixes | exit 0; [full](lint-verified.txt), [tests](test-lint-final.txt) |
| `npm run build` | exit 0, TypeScript passed; [вывод](build-final.txt) |
| Baseline: `HOPTRIP_CARD_PHASE=before; npm run test:e2e -- h3-card.spec.ts --reporter=json` | **8 passed**, [JSON](browser-baseline.json), [вывод](browser-baseline.txt) |
| Regression: h3-card/offer-card/compact-cards/price-freshness/local-flight-time | Финальный layout: **18 passed /10 failed** из-за новых test locator scopes; [JSON](browser-final.json) |
| Повтор h3-card +price-freshness после scope fix | **4 passed /8 failed** (заголовок закрытого score dialog также попал в широкий h2 selector); [JSON](browser-verified.json) |
| Итоговый `HOPTRIP_CARD_PHASE=after; HOPTRIP_CARD_BASELINE=<absolute before-metrics.json>; npm run test:e2e -- h3-card.spec.ts --reporter=json` | **8 passed**, [JSON](browser-complete.json), [вывод](browser-complete.txt). Итого подтверждены **28 unique regression cases**, не один чистый полный rerun |
| IDE build_project изменённых файлов | isSuccess=true, limited diagnostics |

Новый h3-card suite проверяет 4 языка, три качества, видимость critical reasons/arrival/price/CTA/cost scope, отсутствие EUR в collapsed card, доступ к наблюдению/техническим данным через Enter, закрытие подробностей, axe deal grid, 320px long name/high digits и paired heights. Existing suites подтверждают estimated midnight return/+1, airport route/facts, unknown clocks, keyboard/price dialogue, сохранение manual budget и объявление expiry с закрытыми details. PriceFreshness full page сохраняет точные времена/правило дедлайна и снятие booking link при expiry.

Initial baseline run не находил browser-13 на первой странице после принятого price default H3-04: **0/8**, [JSON](browser-before.json). Fixture осталась прежней, адрес теста исправлен на offset=12. Тот же stale selector исправлен в offer/compact regression; href prefix учитывает returnTo.

Первый after layout дал 18/28: отдельные controls увеличивали карточку (legacy compact cap 730 не проходил), раздельное чтение координат после закрытия details зависело от scroll anchoring; один teardown завершился socket hang up. [Исходный JSON](browser.json) сохранён. Итоговый layout избавлен от новых controls, координаты читаются одним DOM evaluate. Legacy pixel cap 730 заменён no-clipping guard; отдельный H3 test вместо произвольного нового cap требует уменьшение **всех 24** измеренных locale/state pairs. Это локальный same-environment assertion через optional baseline env, не жёсткое межплатформенное ожидание CI.

Позднейшие failures относились к scopes новых тестов: вложенные summary и h2 закрытого price dialog, дублированная observation в dialog и TripDetails. Проверки ограничены нужными DOM sections без ослабления требований к видимости. Финальные source/expiry tests и восемь card cases прошли; все промежуточные отчёты сохранены.

Backend runtime/schema/dependencies не менялись, полный API pytest/mypy заново не запускались. Не выполнены WebKit, full-site visual/accessibility/performance sweep, screen-reader/manual usability study, production RUM/KPI. H3-07 сортировка/usable-time и H3-17b performance остаются отдельными задачами.

## Файлы и rollback

Новый i18n/card-copy.ts; catalog.tsx, Price/PriceSummary/PriceFreshness/FlightSchedule/TripDetails, globals.css; новый h3-card.spec.ts и согласованные offer-card/compact-cards/price-freshness tests; docs/h3-06 и H3 tracker/decisions.

Rollback только delta H3-06: вернуть card EUR/default summary/freshness labels и положение work-hour metadata, убрать PriceMetadata extraction/card copy/CSS и новые measurement tests; сохранить H3-01/02/03/04/05 и пользовательские изменения в тех же файлах. API/DB/saved data rollback не нужен, feature flag не вводился. Общий reset недопустим. Следующий запуск **H3-07**, здесь остановка.
