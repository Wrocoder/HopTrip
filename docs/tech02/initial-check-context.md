# Первый browser smoke

0/1,36.24s. Тест пытался дождаться event API failure на one-way browser-deal без даты конца. UI корректно показывал ошибку периода и не выполнял запрос: malformed response ещё не был испытан. В тест добавлено заполнение конца побytu текущей датой начала после readiness; production/date validation не менялись. Assertions обработки API не ослаблялись. Raw e2e-smoke.json сохранён.

Первый ESLint: error @next/next/no-assign-module-variable в новом VM test loader. Local binding module переименован в loaded; raw lint-initial.txt сохранён. Изменения только тестовые.

# Ошибка test-port setup

Первый broad run:6 passed/1 failed/43 not-run,49.00s,max-failures1. После правки dates новый test был скопирован из root поверх изолированного spec без повторной port substitution. В нём оставались два control POST на8100. Offline trace подтверждает404 для unavailable=true и unavailable=false; тестовый catalog-state handler на этом адресе не сработал. Чужой процесс не останавливался, production/infrastructure/credentials не менялись. У middleware могли остаться обычные request logs/rate counters этих двух запросов; blanket «порт8100 не затрагивался» для TECH-02 не утверждается.

Исправление: test теперь импортирует изолированную Playwright configuration и берёт origin из первого webServer.url, без жёсткого API address. Control responses обязаны быть ok перед утверждением результата. Isolated config по-прежнему8125/3125,reuseExistingServer=false; source совпадает byte-for-byte без port rewrite. Root production API и fixture runtime ради этого не изменялись. Новый runtime/frontend build уже был зелёным; данная правка только test setup. Raw broad result сохранён как e2e-port-setup.json; evidence не суммируется с final.

# Locale setup

Следующий broad attempt:7 passed/1 failed/42 not-run,65.51s. PL новый scenario прошёл; EN запросил /en/destinations/barcelona, у которого нет опубликованного перевода. Тест должен использовать существующий /destinations/milan (в translatedPaths на всех4 языках). Исправлен только путь test case; не добавлялись новые страницы/locale rewrites и не ослаблялась проверка error/noindex. Raw e2e-locales-setup.json сохранён. Правильные control POST уже идут на isolated8125 и проверяют ok.

Optional metadata regression:14 passed/1 failed/35 not-run,105.03s. Existing event-context intentionally supplies checked_at='invalid' and expects unknown-check wording while retaining valid events/sale guards. Consumer already handles this through eventCheckedAt. Guard now accepts nullable string for this optional display-only field; events/prices/pagination validation unchanged. Existing test unchanged.
