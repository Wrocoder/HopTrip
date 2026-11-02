# UX-02 — единый выбор аэропорта

Дата: 2026-10-31. Объём: только UX-02, зависимость UX-01 выполнена. Production не менялся.

## Проверенное устройство и изменение

До изменения на главной были два независимых controls: AirportSelect общей FilterForm и отдельный select коротких поездок с chooseHomeOrigin. Cookie `hoptrip.origin.v1` уже сохранялся при поиске/выборе, HttpOnly, SameSite=Lax, path=/, 180 дней, Secure в production. Повторный выбор требовал отдельного submit и мог расходиться с черновиком поиска.

Теперь на главной один AirportSelect. Кнопка «Изменить аэропорт» в подборке переводит фокус в него. Активный origin берётся из URL; при отсутствии параметра сервер использует проверенное сохранённое предпочтение. Явный пустой origin перекрывает cookie. Доступный registry отбрасывает устаревшую cookie; при ошибке registry синтаксически допустимый сохранённый код не считается доказанно устаревшим. Явный неизвестный IATA остаётся для обычной валидации, а не расширяет поиск молча.

Выбор option клавиатурой/мышью, однозначное имя при blur и очистка фиксируют выбор сразу. Невалидный или неоднозначный текст остаётся черновиком с прежней валидацией поиска. Если подсказки недоступны, допускается ручной IATA. URL и видимый origin подборки обновляются вместе; cookie сохраняется прежней server action. Сбой optional persistence не блокирует выбор.

Переход Next сохраняет остальные черновики формы. Перед первой сменой исходный выбор записывается в текущий history entry: Back к прежнему пустому выбору не подменяется последней cookie. Ключ формы исключает origin; destination/date/budget drafts не перемонтируются от смены аэропорта или cookie refresh. Ошибка предыдущего airport draft не переносится на новый committed выбор.

Карточки остаются Server Components, включая существующий курс EUR и price/score/tracking widgets. HomeOrigin получает их через children; После optional cookie action router.push получает серверную подборку нового URL. Оптимистичный origin сразу меняет поле и подпись; переход выполняется только последним выбором. Поздний предыдущий выбор не запускает навигацию. При Back/Forward несовпавший cached snapshot обновляется router.refresh. Пока origin серверного snapshot отличается от текущего, прежние карточки скрыты и показана загрузка. Пустое состояние, API-error и retry явные. Quality/ROUND_TRIP/2–4 ночи/максимум 6 из первых 100 records сохранены в shortTripSelection; новые источники и рекомендации не добавлялись.

Инвентаризация остальных controls: общий каталог и специализированные landing используют FilterForm и URL как условия запроса; Warsaw group WAW,WMI сохранена. Каталог без origin по-прежнему показывает все аэропорты. Airport landing links — навигация, не дополнительный home selector. AlertForm signup/manage редактирует отдельные критерии подписки; они не меняют глобальную cookie и не переписываются выбором главной. Layout не получает глобального cookie dependency. Иных persistence layers не добавлено. Старый export chooseHomeOrigin оставлен для совместимости, UI его больше не вызывает.

Новые тексты переведены PL/EN/RU/UK. UX-03, иерархия остальных секций, API runtime, DB models, миграции и affiliate configuration не менялись.

## Проверки

Web unit: 130/130, включая 10 новых cases; npm --prefix apps/web run test:unit. ESLint и production build/TypeScript прошли, 61 static/SSG pages; npm --prefix apps/web run lint; npm --prefix apps/web run build. Исходная красная проверка общего выбора на прежнем UI: [e2e-before.json](e2e-before.json), 0/2, URL не обновлялся при выборе в hero; это ожидаемое воспроизведение, не итог.

Synthetic short-trip fixture раньше использовала неизвестный source и пустой payload: после DEAL-04 эти offers корректно считались critical и не могли проверять recommendations. Только тестовый fixture получил явно синтетические подтверждённые route/date/duration/airline/stops facts с поддержанным source. Quality gate не обходится, production data не создаются. Ruff для fixture прошёл; полный backend/PG suite не запускался, API runtime не менялся.

Первая сборка выявила ошибочный импорт server-only Price через клиентский DealGrid. Исправлено передачей серверных карточек через children. Финальная сборка после исправления blur/submit прошла; ранняя ошибка не скрывается.

Изолированная копия: docs/aud05/prepare-e2e.ps1, .cache/aud05-ux02[-final/-acceptance/-submit], SQLite, собственный .next, loopback 3125/8125, Chrome headless, SDK PyCharm Python 3.12.10. APP_ENV=test, DATABASE_URL=sqlite://; alerts/digest/editor/events sync выключены. Чужие 3100/8100 не используются. Browser fixtures не доказывают production reliability, WCAG certification или conversion uplift; известное ограничение cold direct catalog entry из UX-01 не объявляется исправленным.

Первый широкий запуск прерван после обнаружения гонки cookie/links; итоговый JSON не сформирован, общего числа passes ему не присваиваем. Сохранены [исходные error contexts](initial-errors/localized-home-en-home-sea-abc4d--language-draft-and-consent-desktop.md). При остановке shell дочерние fixture servers оставались живы; следующий старт корректно отказался переиспользовать 8125: [startup report](e2e-startup.json). Проверено дерево собственного runner и завершено только оно, чужие процессы не трогали.

Промежуточный [focused run](e2e-origin-initial.json): 4/8, 122.64 s. Две ошибки — label при Back, исправлена привязка draft к целевому коду. Ещё две — test ожидал финальный commit GDN до release задержанного KTW; React entangles transitions. Gate теперь отпускается перед ожиданием завершения, а запрет чужих карточек под новым heading проверяется и до, и после release.

Следующий [широкий run](e2e.json): 40 pass / 8 failures, errors=[], 368.31 s. Все 8 origin-selection cases и локализованные journeys прошли. Шесть failures выявили competing blur navigation при немедленном submit, включая clear; исправлено: blur к submit-кнопке не запускает отдельную action, searchWithOrigin сохраняет и перенаправляет атомарно. Две desktop failures — city/alias catalog и invalid editing при отсутствующем registry/API-error, совпадающее наблюдаемое состояние с известным UX-01 cold direct-entry issue. Причина не установлена; не объявляется исправленной. Повторы не суммируются и весь browser suite не объявляется пройденным.

Финальный целевой повтор после blur fix: команда `node node_modules/@playwright/test/cli.js test origin-selection.spec.ts short-trips.spec.ts roadmap-baseline.spec.ts hero-search.spec.ts airport-search.spec.ts --grep 'one origin|origin changes|a delayed|an invalid|city, alias|editing a selected|airport preference|first visit has|stale preferences|origin-only|invalid routes' --reporter=json`. Результат: [e2e-final.json](e2e-final.json), **22/22**, unexpected=0, errors=[], 142.75 s, retries=0. Все восемь cases предыдущего run, завершившиеся ошибкой, вошли в этот повтор с сохранёнными assertions и прошли; это не доказательство исправления нестабильности cold direct entry.

Просмотрены [форма 320 px](hero-320.png) и [подборка desktop](selection-desktop.png); эти снимки из широкого run до изменения blur guard, которое layout не меняет. Scoped axe hero/recommendations и отсутствие horizontal overflow проверяются browser specs. Dev indicator и synthetic prices относятся к fixture. [Source parity](source-parity.json): 546 runtime-файлов из финальной копии совпали с checkout, включая новые modules. Generated next-env.d.ts восстановлен после build, diff пуст. Собственные fixture servers завершены, listeners 3125/8125 отсутствуют. Машиночитаемая сводка: [checks.json](checks.json).

## Release и rollback

Выпускать web целиком, чтобы client/server actions принадлежали одной сборке. API/DB release этой задачей не требуется; прежние SEC/DATA release prerequisites сохраняются. Cookie формат и срок совместимы. Откатить только UX-02 web changes и тестовую fixture, сохранив предыдущие задачи и пользовательские изменения. Удалять cookies, history или DB данные не требуется; прежняя версия снова покажет два home controls. Production, campaigns, paid API и credentials не затрагивались.

UX-02 DONE в checkout. Следующая задача UX-03 не начата. Остановка после UX-02.
