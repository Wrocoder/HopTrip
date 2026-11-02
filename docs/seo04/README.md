# SEO-04 — Existing Guide Optimization

Дата:2026-11-02. SEO-04 DONE, SEO-01 DONE. Только SEO-04. SEO-05 не начата.

## Инвентаризация и решение

[Полная инвентаризация и триаж](INVENTORY.md):54 info records, из них46 опубликованных путеводителей с184 языковыми версиями PL/EN/RU/UK. Остальные8 — service/legal;5 indexable,3 noindex. JSON содержит intro, body word count, sources, sections, related links, routes, publication flags и text hashes. Проверены title/intro всех46 guides; выборочный source review ALC/AGP/VLC/VIE отделён от полного фактчека.7 областей мастер-плана разобраны в inventory.

В11 city guides primary CTA вёл на `/deals` без направления. Информация о городе терялась, хотя existing GuideFlights/destinationForGuide уже знают нужный slug. Исправлены11 routes в2 editorial data modules: добавлен destination по существующему mapping. Это44 языковые страницы. [Точный changeset](changes.json), [before](inventory-before.json), [after](inventory-after.json), [text integrity](inventory-summary.json).

Для vienna-airport ссылка WienTourismus теперь ведёт прямо к действующему уведомлению о перестройке2026–2027. Основное предупреждение в статье оказалось актуальным; общий review date не обновлялся. Остальные source URLs и фактические утверждения сохранены.

Неизменны все46 text hashes, titles/descriptions/intro/paragraphs, числа, dates, source indices, translated text arrays и reviewedAt. Новых renderer/helpers/dependencies нет. Root metadata/canonical/hreflang/sitemap/indexation/affiliate/consent/storage/API contracts не менялись. General catalog links вне primary city routes остаются общими; airport origin и private query params по догадке не добавляются.

## Доказательства и приоритеты

Сначала просмотрены Alicante/Málaga airport+weekend guides: [Google Polska,07.07.2026](https://blog.google/intl/pl-pl/nowosci-produktowe/odkrywanie-wyszukiwanie/zagraniczne-destynacje-i-wakacje-all-inclusive-trendy-podroznicze-2026-w-wyszukiwarce-google/) отмечал интерес к этим направлениям у пользователей из Польши летом2026. Существующие статьи уже имеют уникальные intro, планы и корректные city CTA — их не переписываем без причины. Этот исторический сезонный сигнал не измеряет спрос на точную статью, позиции/CTR/трафик HopTrip или ноябрьский спрос. Search Console/Keyword Planner connector/export не предоставлены/не обнаружены, search volumes не придуманы.11 исправлений приоритизированы по подтверждённой потере контекста, а не по недоступным query-level цифрам. SEO-05 content-opportunity strategy не начиналась.

Выбранные transport facts подтверждаются первичными источниками:

- [Aena Alicante](https://www.aena.es/en/alicante-elche-miguel-hernandez/how-to-get-there/bus.html):C6 связывает терминал и город, есть пересадки на TRAM.
- [Aena Málaga](https://www.aena.es/en/malaga-costa-del-sol/getting-there/trains.html):C1 и пересадка через María Zambrano.
- [Aena Valencia](https://www.aena.es/es/valencia/como-llegar/metro.html):линии3/5. Часы/тарифы не копируются в новый текст.
- [WienTourismus: direct notice](https://www.wien.info/en/travel-info/arrival-departure/airport-to-center/important-information-for-airport-travellers-2026-2027-1118558) и [CAT](https://www.cityairporttrain.com/en/info-service/main-line-closure/):действующая перестройка, CAT by bus и укороченная S7. Конкретные расписания по-прежнему проверяются для дат поездки.

8 статей с body<200 слов имеют по4 практических sections, уникальные intro, источники и related links. Word count не объявляется SEO-нормой или доказательством thin content.3 повторяющихся paragraph checklists у Malaga/Alicante/Prague weekend сохраняют полезные правила времени/багажа/бюджета; полные тексты/intro уникальны.2 guides без внешних sources описывают собственные calculator/one-way concepts. Массового переписывания, re-dating или удаления полезных инструкций нет; непроверенные детали помечены ограничением source-review, а не объявлены актуальными по одному возрасту review date.

Первый служебный inventory runner с default ES5 transpilation некорректно обработал spread Set в relatedInfoPages. Это выявлено сопоставлением с source; [diagnostic](inventory-diagnostic.json) сохранён отдельно. Итоговый runner использует ES2022 и корректно видит existing related links. Ошибка диагностики не переносилась в приложение и не выдаётся за отсутствие related content.

## Проверки

- [Before](e2e-before.json):0/1,26.37s — city CTA терял destination; errors содержит max-failures stop. Before не суммируется с acceptance.
- [Initial desktop](e2e-desktop.json):1passed/1failed/7not-run,17.38s. Новый тест ошибочно ожидал одну primary link для Rome/Lisbon, где уже есть city link и явно обозначенный общий каталог. Это выявило и избыточный первоначальный триаж13 кандидатов: две intentional alternatives восстановлены byte-identical с snapshot в three-day-guides.ts. Итог —11 исправлений в2 modules. Тест проверяет exact city href у11 guides и обе сохранённые ссылки Rome/Lisbon. Первоначальный [CTA diagnostic](inventory-cta-diagnostic.json) сохранён; assertions уточняют разные публичные сценарии, а не допускают произвольные URLs.
- [Unit](unit.txt):211/211; [ESLint](lint.txt), [TypeScript](typecheck.txt), [initial build](build.txt) и [final isolated production build](build-final.txt) passed. Unit/lint/tsc повторены после уточнения триажа.
- [guide-optimization.spec.ts](../../apps/web/tests/guide-optimization.spec.ts):11 primary hrefs×4 locales×desktop/mobile, canonical/robots/h1, direct Vienna source, scoped axe и overflow, CTA доступен при API outage; ordinary-UA/no-JS actual navigation Milan/Rome в тот же destination с0 observations. Existing guide-mobile-layout и technical-seo regressions выполняются отдельно от нового test contract.
- [Final desktop](e2e-desktop-final.json):9/9,93.82s; [mobile](e2e-mobile.json):5/5,22.94s.14/14 уникальных scenarios,unexpected0,skipped0,flaky0,errors=[],retries0;10 новых cases и4 существующих regression.11 changed primary hrefs плюс2 unchanged alternatives на4 locales×desktop/mobile,8 новых scoped axe scans без violations. No-JS Milan открывает city search, Rome сохраняет прежний city landing и общий catalog alternative;0 observations не превращаются в выдуманные offers. Повторы и before не суммируются.
- [Crawl](sitemap-audit.json):244 pages и51 editorial link HTTP200. Сохранены canonical/robots/hreflang inventory/title/description/h1/status policies. Два viewport captures нового CTA context просмотрены: [desktop](desktop-guide-cta.png), [mobile320](mobile-guide-cta.png); это не full-page/physical-device certification.
- [Verification](verification.json):573 runtime/public/Docker файла совпали с isolated source, selected tests отличаются только test-port normalization. Master plan/root next-env.d.ts/three-day-guides.ts unchanged; JSON/local Markdown links/added whitespace checked. Свои3125/8125 закрыты, чужие3100/8100 не трогали; предыдущие пользовательские/IDE изменения сохранены.

Guarded fixture на SDK PyCharm/Python3.12.10, без installs. Отдельные SQLite/.next/3125/8125,reuseExistingServer=false,APP_ENV=test,DATABASE_URL=sqlite://; alerts/digests/editor/event-sync disabled, consent false. Test controls derive URL из isolated config и проверяют `.ok`. Чужие3100/8100 не используются.

Подготовка `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-seo04` с явным включением прежних untracked CSS/public. Root config не менялся; в isolated config второй server command заменён на next start. Build с NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125,NEXT_PUBLIC_API_URL/HOPTRIP_API_URL=http://127.0.0.1:8125 и tests/fixtures/operator.json. Это local production-mode test, не deployment или performance comparison.

```powershell
npm run test:unit
npm run lint
npx tsc --noEmit
# isolated apps/web with the local URLs/operator fixture above:
npm run build
node node_modules/@playwright/test/cli.js test '(^|/)guide-optimization\.spec\.ts$' '(^|/)technical-seo\.spec\.ts$' '(^|/)guide-mobile-layout\.spec\.ts$' --project=desktop --max-failures=1 --output=test-results-seo04-desktop-final --reporter=json
node node_modules/@playwright/test/cli.js test '(^|/)guide-optimization\.spec\.ts$' --project=mobile --max-failures=1 --output=test-results-seo04-mobile --reporter=json
```

Backend/fixtures/config/assets/dependencies unchanged: pytest/PG/Ruff/mypy/Docker build не запускались. Full E2E/полный фактчек46 guides/live Search Console/Google indexing/traffic growth/field CWV/full WCAG/physical-device certification не заявляются. Production/credentials/paid APIs/real messages/campaigns не затрагивались.

## Release / rollback

Обычная web release-сборка с production environment. Для rollback вернуть только12 URL literals из changes.json в more-destination-guides.ts/city-break-guides.ts и связанные test expectations; не откатывать предыдущие пользовательские изменения. API/DB/storage/affiliate migrations и cleanup отсутствуют. SEO-05 не начата.
