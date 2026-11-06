# H3-03 — однозначное включение проживания в цену, 2026-11-03

**DONE.** Следующая отдельная задача — H3-05. Коммит/deploy не выполнялись.

## Аудит и изменение

Найдено два runtime использования одной строки `Bez noclegu · bagaż do sprawdzenia`: общий DealCard и подробности рейса. Они относятся к цене перелёта, а не к отсутствию ночёвок в поездке. Английский вариант уже обозначал исключение проживания, PL/RU/UK допускали неоднозначное прочтение. Отдельные существующие price/flightOnly пояснения в подробностях и общий footer каталога уже раскрывают состав цены; новый дублирующий listing footer не добавляется.

Оба места используют существующий catalog-copy механизм и одинаковое явное пояснение. Багаж отделён самостоятельной строкой. Trip timeline/nights остаётся самостоятельным показателем выше цены/расписания, без зависимости подписи от числа ночей.

| Locale | Цена / проживание | Отдельно багаж |
|---|---|---|
| PL | Cena dotyczy lotu. Nocleg nie jest wliczony. | Bagaż do sprawdzenia |
| EN | The price covers the flight. Accommodation is not included. | Check baggage allowance |
| RU | Цена указана за перелёт. Проживание не включено. | Багаж нужно уточнить |
| UK | Ціну вказано за переліт. Проживання не включено. | Багаж слід уточнити |

Старый неоднозначный source key и его переводы удалены. Scoped search `rg -n 'Bez noclegu|Без жилья|Без житла|Accommodation excluded' apps/web/src` не вернул совпадений (exit 1 означает отсутствие результатов). Исторические docs не переписывались. Общий DealCard распространяет новую подпись на использующие его catalog/landing поверхности.

Ни стоимость, ни фактические ночи/даты, ни API/DB/URLs/saved budget, ни baggage inclusion не переопределяются. Для 0 ночей остаётся 0, а подпись означает только исключение стоимости проживания. Пересечение полуночи при возвращении домой может существовать отдельно от ночей на месте, как в H3-02. Не вводятся обещания конкретного тарифа/нормы багажа.

## Проверки

Изолированная копия `.cache/aud05-h3-03-20261103`, production build + `npm run start`, Chrome Playwright desktop/mobile, loopback 3125/8125. Чужие процессы не останавливались. Новый browser test проверяет **реально вычисленные** API timeline для синтетических 0/1/3 ночей; существующая test-only fixture расширена optional bounded nights parameter. Production backend не менялся. Реальных отправок/партнёрских запросов нет.

| Проверка | Результат / evidence |
|---|---|
| `npm run test:unit` | **236 passed**, [вывод](node.txt); существующие i18n/contract проверки |
| `npm run lint` | exit 0, [вывод](lint.txt) |
| `npm run build` в isolated copy | exit 0, TypeScript passed, 61 static entries; [вывод](build.txt) |
| `npm run test:e2e -- accommodation-inclusion.spec.ts price-labels.spec.ts --reporter=json` | **16 passed**, [JSON](browser.json), [вывод](browser.txt) |
| SDK `-m ruff check apps/api/tests/e2e_app.py apps/api/tests/weekend_browser_fixtures.py --fix --no-cache` | PASS, 1 import ordering issue автоматически исправлен, 0 remaining; [вывод](ruff.txt) |
| IDE build_project изменённых файлов | isSuccess=true, limited diagnostics |

8 новых cases (4 языка ×desktop/mobile) проверяют по 3 длительности: **24 card +24 detail проверки** состава цены, отдельного багажа, числа ночей и отсутствия старой подписи. На 3 ночах дополнительно axe deal grid и 320px overflow; подробности проверяют отсутствие overflow при каждой длительности. Остальные 8 cases — существующий price-labels regression: числовое сравнение/условия, keyboard/dialog/axe и 320px. Языковые ожидания записаны независимо от catalog-copy, поэтому случайный fallback/неверный перевод не превращается в самоподтверждающийся тест. Для обратимого copy change отдельные unit, повторяющие implementation, не добавлялись.

Сохранены и просмотрены narrow screenshots: [PL 320px](card-pl-320.png), [RU 320px](card-ru-320.png). Другие locale screenshots находятся в test-results изолированной копии; отсутствие переполнения автоматически проверено для всех четырёх языков.

Первоначальный before-run **не достиг проверки старой подписи**: fixture setup вернул 422 на numeric Literal в query. [Исходный JSON](browser-before.json), [вывод](browser-before.txt) сохранены. Test-only параметр заменён на bounded int 0–3. Поэтому исходная неоднозначная строка подтверждена кодом, а не этим неуспешным browser-run. Итоговый прогон после исправления fixture полностью прошёл. Эта ошибка не меняла production API.

SDK Python перед командами проверен через PyCharm: Python 3.12.10, `.venv/Scripts/python.exe`, pip. Полный API pytest/mypy повторно не запускались: runtime API/schema/model не менялись, изменённые Python файлы — browser-only fixtures, проверенные Ruff и реальным E2E. Production данные, WebKit, full-site accessibility/performance/CWV и KPI не проверялись; это локальное подтверждение H3-03, не общий release gate.

## Файлы и rollback

Runtime: `apps/web/src/lib/i18n/catalog-copy.ts`, `src/app/components/catalog.tsx`, `src/app/deals/[slug]/page.tsx`. Tests: новый `apps/web/tests/accommodation-inclusion.spec.ts`; optional nights в `apps/api/tests/e2e_app.py`, `weekend_browser_fixtures.py`. H3 progress/decisions и этот каталог. Dependencies/feature flags/migrations не добавлялись.

Rollback только delta H3-03: вернуть прежний ключ/переводы и две combined строки, убрать новую browser spec и optional nights extension в fixture. Сохранить H3-01 weekend functionality, H3-02 timeline и H3-04 ranking, включая изменения в тех же файлах. Общий reset к HEAD недопустим. Здесь остановка; H3-05 не начинается.
