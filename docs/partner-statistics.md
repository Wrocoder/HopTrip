# Проверка статистики Travelpayouts

Команда проверяет доступ к отчётности Aviasales и возвращает только агрегаты
аккаунта. Она не создаёт клики, не меняет ссылки или БД, не импортирует конверсии
и не доказывает атрибуцию отдельного посетителя HopTrip.

Контракт проверен 2026-09-28:
[официальный Statistics API](https://support.travelpayouts.com/hc/en-us/articles/360019864079-API-of-affiliate-programs-booking-statistics).
POST execute_query — запрос отчёта, не запись. campaign_id=100; даты включительные,
максимум 31 день. Поля подтверждены get_fields_list для данного аккаунта.

## На действующей VM

Из `/opt/hoptrip`, без пересборки контейнера:

```sh
sudo docker exec -i hoptrip-api-1 /usr/local/bin/python - \
  --date-from 2026-09-24 --date-to 2026-09-28 \
  < apps/api/app/jobs/check_partner_statistics.py
```

Исходник установлен на VM 2026-09-28. Python и httpx берутся из API-контейнера;
токен уже присутствует в его окружении. Не передавать токен аргументом команды.
После будущей пересборки API-образа с этим файлом доступен обычный запуск:

```sh
sudo docker exec hoptrip-api-1 /usr/local/bin/python -m app.jobs.check_partner_statistics \
  --date-from 2026-09-24 --date-to 2026-09-28
```

## Результат

JSON содержит scope=AVIASALES_ACCOUNT, campaign_id, период и status.
При OK counts содержит clicks/redirects/searches/actions и paid/processing/cancelled
actions. Для каждого отчёта click_attribution_verified и conversion_attribution_verified
равны false: счётчики аккаунта не позволяют подтвердить отдельный клик HopTrip.

NO_DATA означает отсутствие строк, counts=null; это не подставленные нули.
Код выхода 0 означает корректный ответ OK/NO_DATA, а не наличие бронирований.
Код 1: NOT_CONFIGURED, INVALID_PERIOD, ACCESS_DENIED, RATE_LIMITED, HTTP_ERROR,
UNREACHABLE или INVALID_RESPONSE. Ошибка CLI даёт код 2.
Ответы ограничены 64 KiB; перенаправления отключены, host фиксирован,
proxy-переменные окружения не используются. Автоматических повторов и расписания нет.

Проверка 2026-09-28 за 24–28 сентября: status=OK, clicks=1, redirects=7,
searches=6, actions/paid/processing/cancelled=0. Эти показатели могут меняться
при задержке отчётности. Нулевые бронирования не означают неисправность ссылок.

Следующий этап атрибуции: подтвердить поддерживаемый SubID для конкретного
инструмента и сопоставить реальную запись партнёра с сохранённым кликом.
Не добавлять выдуманный параметр к ссылкам и не покупать билет ради проверки.
