# DEAL-01 — единая карточка перелёта

Дата: 2026-10-31. Только DEAL-01; AUD-02 и UX-03 DONE. DEAL-02 не начата.

## Проверенные находки и изменение

DealCard/DealGrid уже были общими для каталога, главной, landing и GuideFlights. Проблема — объём default UI: повторные пояснения, перевозчики и время на месте, крупные отступы; PL показывал score trigger, но PriceSummary был видим только в других языках. Новый параллельный card component не создавался.

В существующей карточке остаются направление/страна, origin IATA, даты предложения, число ночей, цена/валюта и basis per-person/one-way/round-trip. CTA «Посмотреть детали перелёта» теперь виден текстом рядом с ценой в том же Link. Сохранены slug/locale/returnTo, score anchor/dialog/new-tab и Impression tracking. PriceSummary выводится для всех четырёх языков через прежнюю проверенную политику: сохранённая сумма ниже/выше медианы либо честное provisional/legacy/missing comparison, без новых скидок или scoring formula.

Обычные часы, зоны/перевозчики/длительность на месте и методология доступны в прежних TripDetails/FlightFacts/PriceAssessment и на detail page. Краткий FlightSchedule card mode оставляет airports и stops отдельно по направлениям. Известный ноль пересадок отличается от unknown; return airports не копируются из outbound. Обычный detail schedule не получает card mode и сохраняет прежнее представление.

| Состояние | Видимо без раскрытия |
|---|---|
| Частичные данные | PARTIAL label; неизвестное/расчётное время, неизвестные stops и аэропорты остаются явными. Все причины PARTIAL перенесены в общие детали, без второго disclosure на карточке |
| Критические данные / старый API | Заголовок critical и **все** critical reasons; ничего не обрезается ради высоты |
| Разные аэропорты | Прежний returnAirportNotice, независимые outbound/return codes |
| Дата перелёта отличается от даты предложения | Дополнительная дата/время из расписания с local/UTC basis. Сдвиг дня прибытия и next-day home arrival остаются видимы |
| Неизвестное/расчётное время | Явные подписи; полный clock не выдумывается. Unknown zone обозначается UTC |
| Цена / свежесть | Observed/first-seen timestamp, прежний not-live caveat и live expiry warning. CTA ведёт к деталям, не обещает доступную бронь |
| Стоимость | Per-person/trip basis плюс короткое «без жилья, багаж уточнить»; полные ограничения в деталях |

Quality COMPLETE не означает confirmed live price. Recommendation eligibility и сохранение critical в обычном каталоге не менялись. Данные API/route facts/источники/исторические наблюдения не переписывались. Критическая карточка с несколькими предупреждениями может быть выше обычной — обязательная информация не clamp/скрыта.

Цена контракта — PLN (`price_per_person_pln`), с прежним optional приблизительным EUR по свежему NBP rate. Произвольные EUR/GBP amounts из original source не выводятся как PLN и не получают выдуманную конверсию: API нормализация и Price не менялись. При отсутствии цены форматтер показывает прежнее unknown. Изменение не вводит multi-currency checkout.

Две новые строки CTA/cost scope переведены PL/EN/RU/UK. CSS ограничен flight-offer-card: editorial cards не получают новый layout. Действия независимы: основной Link, native details и прежний score control; вложенных ссылок/кнопок нет. Height для нормального synthetic PARTIAL card проверяется прежним bound<730px; при200% text/320px допускается вертикальное увеличение без горизонтального overflow.

## Проверки и промежуточные результаты

- `npm --prefix apps/web run test:unit`:145 passed. Новых pure unit cases для JSX не добавлялось; действующие flight-facts, priceAssessment, currency/freshness и localization policies переиспользованы.
- `npm --prefix apps/web run lint`: passed.
- `npm --prefix apps/web run build`: passed, TypeScript,61 static/SSG pages. Generated next-env.d.ts восстановлен, diff пуст.
- Первый browser run: [23/26](e2e.json), errors=[],179.79s. Ошибка compact-height899.55px и две PL strict-selector failures: h2 внутри скрытого score dialog совпал с destination h2. Селектор ограничен .deal-card-link h2. Порог730 не ослаблен.
- Следующий [24/26](e2e-layout.json), errors=[],207.03s: height769.78px и один PL каталог без target card (API-error/cold-entry состояние). Источник API failure не исправлялся и не объявляется устранённым. История failures не скрыта.

Часы обычных отрезков перенесены в details; PARTIAL reason list перенесён в тот же disclosure, чтобы избежать нескольких controls. Все материальные предупреждения остаются снаружи. Existing compact-cards.spec теперь ищет полные known clocks/zones в открытых FlightFacts, сохраняя unknown/estimated/rollover/stops/keyboard/height/long-name assertions. Более широкие26 включали structured return, open-jaw, freshness provenance/expiry и score modal/new-tab return context; повторы не суммируются.

Финальная acceptance: `node node_modules/@playwright/test/cli.js test offer-card.spec.ts compact-cards.spec.ts flight-facts.spec.ts --grep 'card exposes|open card|compact cards|next-day|different return' --reporter=json`; [raw report](e2e-final.json): **16/16**, errors=[], unexpected=0, retries=0, 164.17s. Новые10 cases:4 locales×desktop/mobile с complete/partial/critical, все critical reasons visible, цена/CTA/scope/freshness, keyboard details, long names320 и переход к деталям; open-tab card expiry на desktop/mobile. Остальные cases сохраняют height730, ночной возврат, open-jaw и независимые аэропорты.

Изолированные copies .cache/aud05-deal01[-final/-acceptance/-card-final], SQLite, собственный.next, loopback3125/8125, Chrome headless; SDK PyCharm Python3.12.10. APP_ENV=test, DATABASE_URL=sqlite://, alerts/digest/editor/events sync выключены. Реальные email/provider campaigns не запускаются, synthetic fixture не менялась. [Source parity](source-parity.json):546 runtime files совпали с финальным checkout. Backend/PG/Ruff/mypy в DEAL-01 не запускались: API/Python/DB не менялись.

Это не production/device/WCAG certification, performance или conversion experiment. Полный E2E suite не заявляется пройденным; прежние pending-origin/API observations остаются открытыми. Новые fake real-world цены/маршруты не добавлялись; длинное название и clock advancement относятся только к browser test.

Просмотрены [complete](complete.png), [PARTIAL desktop](card-desktop.png), [mobile](card-mobile.png) и [critical320](critical-320.png). Focus/dev overlays на части снимков относятся к локальной fixture; скрытие существенных предупреждений не используется для красивой высоты. После последнего layout change заново прошли unit145, lint/build и final16. Собственные servers3125/8125 завершены, чужие3100/8100 не затрагивались. Сводка: [checks.json](checks.json). JSON/Markdown links/whitespace проверены, пользовательские изменения сохранены.

## Release / rollback

Выпускать согласованную web-сборку. Нет API migration, новых dependencies/storage/paid APIs/credentials/campaigns. Production не менялся. Rollback только DEAL-01 Catalog/FlightSchedule/FlightQuality/TripDetails/copy и appended flight-offer-card CSS/tests; сохранить предыдущие SEC/DATA/UX изменения и пользовательский master plan/IDE. DB/cookie cleanup не требуется, старые detail и returnTo links работают.

DEAL-01 DONE в checkout. Остановка после DEAL-01. DEAL-02 не начата.
