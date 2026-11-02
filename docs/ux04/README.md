# UX-04 — упрощение навигации

Дата: 2026-10-31. Только UX-04, зависимость AUD-03 DONE. Предыдущие UX-01/02/03 сохранены, DEAL-01 не начата.

## Проверенные маршруты и решение

До изменения в primary nav были актуальные предложения, сохранённое, калькулятор и справка; weekend и направления находились в нижних разделах. Информационный индекс смешивался с основными действиями. Активность определялась только pathname, destinations относились к generic offers.

Теперь пять видимых ссылок без вложенного меню:

| PL label | Существующая цель | Семантика |
|---|---|---|
| Tanie loty | /deals | Общий каталог; active также для offer/from/routes/city-break |
| Na weekend | /tanie-loty-na-weekend | Существующая weekend collection |
| Kierunki | /#home-destinations | Существующий раздел направлений главной UX-03; active также на destination landing |
| Zapisane | /saved | Сохранённые поездки |
| Kalkulator budżetu | /info/trip-budget | Существующий калькулятор, без обещания нового универсального планера |

Для generic planner нет готового самостоятельного index flow: /trip открывает конкретный план из данных. Его не переименовываем и не подменяем обещанием новой функции. Suggested roadmap labels адаптированы к проверенным маршрутам. Новый /destinations index не создаётся. Весь original public routing/metadata/sitemap остаётся прежним.

Справка /info перенесена в существующий footer nav. Все прежние footer links — city-break, weekend, Warsaw, saved, alerts, about/contact/privacy/terms/partners — сохранены; privacy controls остаются. Юридические страницы доступны независимо от primary nav. На информационных страницах primary links не получают ложного active state.

Primary nav отделён строкой от brand/languages и от secondary footer information. Ссылки остаются видимыми на desktop/mobile, переносятся по строкам, без hamburger/nested menus. Controls имеют minimum44px height, доступен обычный Tab. New labels переведены PL/EN/RU/UK, calculator/saved/main labels переиспользованы. Старые labels в словаре сохранены для совместимости.

Активный раздел один: aria-current=page для exact primary page, location для семейства/anchor. Для направлений используется обычный anchor и hashchange/popstate subscription через useSyncExternalStore с пустым server snapshot: same-page hash, Back/Forward обновляют выделение без hydration mismatch из server hash. Pathname нормализуется существующим localizedHref. Границы /deals-extra и /info/trip-budget-extra не считаются совпадением. Query фильтров не влияет на раздел. Переходы primary menu намеренно открывают общий раздел, а не переносят текущие search filters; search/detail return context UX-01 не менялся.

## Проверки

- `npm --prefix apps/web run test:unit`: **145 passed**, 15 новых boundary cases. Это regression active-state policy, включая hash, unrelated prefixes и secondary info.
- `npm --prefix apps/web run lint`: passed.
- `npm --prefix apps/web run build`: passed, TypeScript,61 static/SSG pages; next-env.d.ts dev imports восстановлены, diff пуст.
- Browser: `node node_modules/@playwright/test/cli.js test navigation.spec.ts ui.spec.ts --grep 'primary journeys|advanced fields' --reporter=json`; [raw report](e2e.json): **10/10**, errors=[], unexpected=0, retries=0, 163.60s.

navigation.spec.ts проходит все5 целей, направление/якорь/Back/Forward/same-page hash, точную единственность aria-current, ссылку справки и footer/legal href, четыре языка × desktop/mobile, keyboard order, controls44px, overflow320 и axe header/footer. Existing ui active-section case обновлён под deliberate label/info grouping: form validation, numeric filters, old from/offer routes и info navigation assertions сохранены. Полный ui/E2E suite не заявляется пройденным.

Тесты запускаются с PyCharm SDK Python3.12.10 в isolated .cache/aud05-ux04, SQLite, собственном .next, loopback3125/8125, Chrome headless. APP_ENV=test, DATABASE_URL=sqlite://; alerts/digest/editor/events sync выключены. [546 runtime files](source-parity.json) совпали с checkout. Никаких backend/fixture changes; backend/PG/Ruff/mypy не запускались и их прошлые результаты этой задаче не приписываются.

Это synthetic Chrome fixture, не реальные устройства, WCAG certification или user/conversion study. Старые pending-origin race и API/cold-entry observations UX-03 не объявляются исправленными; код выбора аэропорта, поиск и cards не менялись.

Просмотрены [desktop](header-desktop.png) и [320px](header-320.png) screenshots. Собственные fixture servers завершены, listeners3125/8125 отсутствуют; чужие3100/8100 не трогали. JSON/Markdown links/whitespace проверены. Сводка: [checks.json](checks.json).

## Release / rollback

Обычная web-сборка, без миграций и API release этой задачи. Нет новых dependencies, paid APIs, credentials, campaigns или storage. Production не затрагивался. Rollback только UX-04 SiteNav, navigation dictionary/policy, footer info link, appended scoped header CSS и related tests, сохранив предыдущие задачи и пользовательские изменения. Данные/cookies удалять не требуется; прежние indexed routes продолжают работать.

UX-04 DONE в checkout. Остановка после UX-04. DEAL-01 не начата.
