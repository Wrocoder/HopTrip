# UI-02 — Destination Imagery

Дата:2026-11-01. UI-02 DONE; зависимости UX-03/UI-01 DONE. Production не менялся, UI-03 не начата.

## Аудит и выбранный объём

На главной уже существовали отдельный блок направлений, все SEO/catalog links и4 языка. DestinationGuides — текстовая навигация; dense flight cards показывают факты/цены и небольшие country flags. Каталога public photos не было; текущий web Docker runner копировал standalone/static, но не public. Изучены homepage/registry/routes/localization, shared styles, Next Image installed docs, Docker/ignore rules, Node и browser regressions.

Добавлены максимум3 визуальные карточки в существующий блок направлений на главной: Barcelona/Rome/Budapest, только если соответствующие records пришли из существующего API. Это editorial allowlist, не новые оферты, popularity ranking или обещание availability. API order внутри выбранного набора сохраняется; остальные направления остаются прежними текстовыми ссылками, каждая ссылка представлена один раз. Dense flight cards/hero/search/collections/detail/SEO registry не получают фотографии и не перестраиваются.

## Фотографии и атрибуция

Три настоящие фотографии с проверенными страницами источников:

| Файл / название оригинала | Автор / дата | Выбранная лицензия |
|---|---|---|
| barcelona.webp — Parc guell - panoramio.jpg | essetefano,29Aug2010 | [CC BY3.0](https://creativecommons.org/licenses/by/3.0/), [источник](https://commons.wikimedia.org/wiki/File:Parc_guell_-_panoramio.jpg) |
| rome.webp — Panorama Kolosseum in Rom (Originalgröße).jpg | Sebastian Straub,13Jul2008 | [CC BY3.0](https://creativecommons.org/licenses/by/3.0/), [источник](https://commons.wikimedia.org/wiki/File:Panorama_Kolosseum_in_Rom_(Originalgr%C3%B6%C3%9Fe).jpg) |
| budapest.webp — Budapest.Parliament.jpg | Padrag,3Oct2006 по Exif | [CC BY2.5](https://creativecommons.org/licenses/by/2.5/), [источник](https://commons.wikimedia.org/wiki/File:Budapest.Parliament.jpg) |

Для Budapest Commons указывает Padrag как assumed author по copyright claim; это отражено в [публичных credits](../../apps/web/public/media/destinations/CREDITS.md). Для Rome/Budapest выбрана указанная CC BY лицензия из нескольких предложенных на странице; GFDL/CC BY-SA не выбраны. CC BY допускает переработку и коммерческое использование при соблюдении условий; author/title/source/license и отметка изменений сохранены на странице в доступном native details и в публичном файле. Основание: [CC BY3.0 deed](https://creativecommons.org/licenses/by/3.0/), [CC BY2.5 deed](https://creativecommons.org/licenses/by/2.5/). Авторство сайта или endorsement фотографами не заявляется. Полные тексты внешних страниц не копировались.

Оригиналы и итоговые crop просмотрены. Sharp из уже установленного Next dependency tree: auto-orient → centre crop8:5 →960×600 →WebP quality76/effort6, strip metadata. Генеративных правок/подмен достопримечательностей нет. Photo dates не выдаются за текущий вид города. [Размеры, hashes и processing](assets.json):101370/86780/56548 bytes, всего244698 bytes; оригиналы только в task cache, в runtime не включены.

## Реализация

- [Registry и4 locale alt/copy](../../apps/web/src/lib/destination-imagery.ts): own-property allowlist, только фиксированные local asset paths, descriptive alt для каждого места. Неизвестные города не получают случайную фотографию.
- [DestinationCard](../../apps/web/src/app/components/destination-card.tsx) / [CSS](../../apps/web/src/app/components/destination-card.module.css): Next Image width960/height600 + responsive sizes/srcset/native lazy. Без preload/eager/remote image hosts или новой зависимости. Цвета/радиусы/focus — UI-01 tokens; 3/2/1 columns в пределах этого блока. Название/ссылка остаются вне визуальной зависимости от картинки.
- При onError картинка заменяется локализованным neutral fallback в том же8:5 frame, без повторных запросов/другого внешнего поставщика; href/название/credits сохраняются. Непокрытые фото направления остаются текстовыми links.
- [Homepage](../../apps/web/src/app/page.tsx) сохраняет прежний pageLocales/locale destination-vs-catalog URL выбор и все остальные разделы. [Dockerfile](../../apps/web/Dockerfile) копирует public в standalone runner; без этого assets отсутствовали бы в production image.

Не менялись API/Python/fixtures/DB/данные цен/score/расчёты/affiliate/consent/storage/SEO metadata/indexability/языковая публикация. Внешние media hosts не запрашиваются посетителем; source/license links открываются только явно. Это не UI-03 overhaul и не новый hero/LCP image.

## Проверки

Node (`docs/ui02/unit.txt`; исторический файл удалён):188 passed,2 новых cases — strict allowlist/4-language descriptions, actual WebP decoding/dimensions/per-file110KB/total260KB budgets и on-disk attribution. ESLint (`docs/ui02/lint.txt`; исторический файл удалён), build (`docs/ui02/build.txt`; исторический файл удалён), TypeScript (`docs/ui02/typecheck.txt`; исторический файл удалён) прошли. Generated next-env.d.ts восстановлен к dev/types imports.

Финальный browser run (`docs/ui02/e2e-final.json`; исторический файл удалён):26/26 passed,114.46s,unexpected0,skipped0,flaky0,errors=[],retries0. Новые12 cases:4 locales×desktop/mobile — прежние destination-vs-catalog URLs/все ссылки ровно1 раз, hero/search готовы при удержании image requests, descriptive alt/lazy/no preload/srcset/sizes, identical reserved geometry до/после загрузки, keyboard credits/source/license/crop notice, scoped axe/no overflow320, keyboard destination navigation и отсутствие photos в dense cards. Ещё4 cases (2×projects): реальный onError fallback без потери ссылки/пропорции, все3 local WebP/credits/384px+640px optimizer responses. Прежние home-hierarchy8/consent6 прошли: порядок разделов/SEO links/locale budget navigation и прежние privacy/session/affiliate checks. API/Python/fixture source не менялся.

Первый browser run остановлен после подтверждённого test locator timeout: вложенный has повторял outer section внутри li. Failure context (`docs/ui02/initial-locator-context.md`; исторический файл удалён), interruption metadata (`docs/ui02/e2e-interrupted.json`; исторический файл удалён), сырой незавершённый output (`docs/ui02/e2e-interrupted-output.txt`; исторический файл удалён). Изображение уже загрузилось с reserved frame; test не дошёл до credits. Исправлен только relative locator, assertions не ослаблены, runtime после build неизменен. Полного summary у прерванного запуска нет, его частичные результаты не приписываются финальным26.

Восемь layout measurements (`docs/ui02/layout.json`; исторический файл удалён): ширина/высота рамки не меняются при загрузке,errors=[]/external media requests=[]. Ответы desktop (`docs/ui02/response-sizes-desktop.json`; исторический файл удалён)/mobile (`docs/ui02/response-sizes-mobile.json`; исторический файл удалён):384px —10770–19294 bytes,640px —25136–46376 bytes. Native lazy может начать загрузку до попадания в viewport по эвристике браузера; не заявляется zero image bytes до scroll. Held-image check показывает доступность hero/search до загрузки фото; bounded bytes/no eager/preload/reserved aspect защищают выбранный сценарий. Это не before/after Lighthouse/field LCP/INP benchmark и не обещание нулевого client JS overhead.

Просмотрены оригиналы/crops, 1440 (`docs/ui02/destinations-1440.png`; исторический файл удалён), 768 (`docs/ui02/destinations-768.png`; исторический файл удалён), desktop320 (`docs/ui02/destinations-320-desktop.png`; исторический файл удалён)/mobile320 (`docs/ui02/destinations-320-mobile.png`; исторический файл удалён), fallback desktop (`docs/ui02/fallback-320-desktop.png`; исторический файл удалён)/mobile (`docs/ui02/fallback-320-mobile.png`; исторический файл удалён). Фото, title, credits/focus читаемы; horizontal overflow отсутствует в выбранных случаях. Fixture содержит Barcelona/Rome/Milan: Budapest asset проверен декодированием/просмотром и actual HTTP/optimizer; город не добавлялся искусственно в продуктовые API. Dev indicator — локальная среда, не production UI.

Первый Docker build (`docs/ui02/docker-build-initial.txt`; исторический файл удалён) не прошёл npm ci с «Exit handler never called». Повтор (`docs/ui02/docker-build.txt`; исторический файл удалён) с существующим публичным экспортом Windows trust roots через предусмотренный BuildKit npm_ca secret прошёл, TLS verification не отключалась; единственная причина первого generic npm failure отдельно не доказана. CA не добавлялся в образ/репозиторий. Production standalone smoke (`docs/ui02/docker-smoke.json`; исторический файл удалён) в task-owned --network none контейнере:3 public photos/credits200, SHA-256 совпадают с checkout,3 optimizer responses200/WebP,384px10770–19294 bytes. Контейнер остановлен по проверенной task label, host ports/production не использовались.

Source parity (`docs/ui02/source-parity.json`; исторический файл удалён), сверка (`docs/ui02/verification.json`; исторический файл удалён): runtime/4public assets/Dockerfile совпали с isolated copy, asset hashes совпали с production image, master-plan hash сохранён, next-env.d.ts без diff, JSON/Markdown links/whitespace проверены. Свои порты/контейнеры (`docs/ui02/ports.json`; исторический файл удалён) закрыты; чужие3100/8100/IDE/предыдущие изменения сохранены. Full suite/полевая производительность не заявляются.

## Воспроизведение / безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`; затем `npx tsc --noEmit` в apps/web. Root build закончить до подготовки копии/E2E; вернуть generated next-env.d.ts к исходным dev/types imports, проверить diff. Docker build использует свой изолированный .next, не root/browser caches.

Свежая isolated copy: `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-ui02-new`. Helper не копирует untracked CSS/public media. Явно скопировать design-tokens.css, saved-trips.module.css, destination-card.module.css и4 публичных файла media/destinations (3WebP+CREDITS.md) в соответствующие paths. Private/env allowlist не расширять, runtime/asset hashes сопоставить.

Для fixture сначала get_python_environment по apps/api/tests/e2e_app.py: использован SDK .venv/Python3.12.10, pip, без installs. В isolated apps/web: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Guarded HOPTRIP_E2E synthetic fixture/disposable SQLite, свои3125/8125/.next, reuse=false; чужие3100/8100 не трогать.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)destination-imagery\.spec\.ts$' '(^|/)home-hierarchy\.spec\.ts$' '(^|/)consent\.spec\.ts$' --reporter=json
docker build --tag hoptrip-ui02-local --file apps/web/Dockerfile apps/web
```

В этой среде успешный Docker repeat добавляет `--secret id=npm_ca,src=.cache/sec01-system-ca.pem` с ранее экспортированными публичными доверенными сертификатами. Не отключать TLS и не включать private credentials в build context. Production smoke: свой `docker run --rm --network none --label hoptrip.task=UI-02 --env HOSTNAME=127.0.0.1 ...`, HTTP checks внутри контейнера, остановка только после проверки label.

Headless Chrome desktop/mobile emulation/scoped axe не заменяют physical-device/screen-reader/full WCAG и field performance. Backend unchanged; pytest/PostgreSQL/Ruff/mypy/full E2E не запускались. Нет реальных бронирований/рассылок/paid APIs/production writes.

## Release / rollback

Согласованный web release включает компонент/CSS/registry и local public assets+credits; Docker runner обязательно содержит public. Rollback только UI-02 delta: прежний homepage блок текстовых links, убрать новый компонент/registry/локальные assets и связанное использование. Не откатывать весь dirty checkout или более ранние задачи. Copy public можно сохранить для других будущих assets; без фотографий нет новых data/storage contracts. Нет DB migrations, cookie/storage cleanup или API rollout. Старые открытые страницы сохраняют загруженный bundle; mixed asset/code rollout не проверялся.

UI-02 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production не менялся. UI-03 не начата; остановка после UI-02.
