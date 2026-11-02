# AUD-03: доказательства локального UX/UI-аудита

Дата: 2026-10-30. Только синтетические fixtures; цены и даты на изображениях не являются реальными предложениями. Итоговые результаты: [evidence.json](evidence.json). Анализ и серьёзность замечаний: [HOPTRIP_AUDIT.md](../HOPTRIP_AUDIT.md), раздел AUD-03.

Google Chrome headless через Playwright, Next dev; viewports 320/390/768/1440 × 900 CSS px, deviceScaleFactor=1. Это изменение размера окна desktop-браузера; отдельный существующий E2E-suite также использует mobile project/iPhone 13 emulation. Снимки без согласия на опциональную аналитику; consent-390 показывает исходную панель. Native date controls зависят от locale браузера/ОС. Ориентировочный EUR-компонент может обращаться к публичному NBP; flight/event API и отправка писем заменены fixtures.

## Как воспроизвести

1. Из корня запустить настроенным SDK Python `-m uvicorn e2e_app:app --app-dir apps/api/tests --host 127.0.0.1 --port 8100 --no-access-log`. Перед Python-командой получить SDK через python-tools. Задать HOPTRIP_E2E=1, PYTHONPATH=<repo>/apps/api, APP_ENV=test, CORS_ORIGINS=http://127.0.0.1:3100, PUBLIC_RATE_LIMIT=10000; ALERTS_ENABLED, ALERTS_DIGEST_ENABLED, EVENTS_SYNC_ENABLED, EDITOR_ENABLED=false. Fixture app создаёт отдельную временную SQLite БД и подменяет события.
2. В apps/web запустить `npm run dev -- --hostname 127.0.0.1 --port 3100` с HOPTRIP_API_URL и NEXT_PUBLIC_API_URL=http://127.0.0.1:8100, NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100, HOPTRIP_OPERATOR_FILE=<repo>/apps/web/tests/fixtures/operator.json.
3. Из корня: `node docs/aud03/run-audit.cjs`. Нужны установленные зависимости apps/web и Google Chrome. Скрипт делает снимки и обновляет evidence.json; запускается только против указанных localhost-адресов. После проверки остановить оба локальных сервера.

## Состав

- `home-*`, `catalog-*`, `deal-*`, `budget-*`, `saved-*`, `empty-*`: снимки viewport, не полная страница.
- `stay-*`: весь блок проживания. `consent-390.png`: первый визит; небольшой значок Next dev — артефакт среды разработки.
- `evidence.json`: 24 набора DOM-метрик, 12 axe scans с incomplete для ручной проверки, результаты навигации/фокуса/состояний. Размеры страницы относятся только к fixture data; это не performance baseline.
- `run-audit.cjs`: вспомогательный скрипт сбора доказательств, не production-код и не новый обязательный CI-тест. Он фиксирует UX-наблюдения, не исправляя их.

Дополнительно выполнены существующие catalog-results/consent/shared-trip specs: 16 passed. Их временные traces/screenshots находятся в игнорируемом apps/web/test-results; данный каталог хранит независимые итоговые доказательства.
