# SEO-04 — инвентаризация существующих статей

Дата:2026-11-02.46 индексируемых guide records,184 языковые версии PL/EN/RU/UK. Ещё8 service/legal records перечислены в JSON и не считаются путеводителями;5 из них indexable,3 noindex. Исходная/итоговая структура: [before](inventory-before.json), [after](inventory-after.json); [сводка и text integrity](inventory-summary.json).

Слова считаются только в основном тексте/sections, без title/description/labels и без динамических блоков/related guides/attractions. «<200» — фильтр для ручного просмотра, не SEO-норма и не доказательство thin content. CTA означает primary routes статьи, остальные contextual links могут уже существовать. review date не доказывает актуальность всех фактов.

| Статья / исходник | Исходный title | Категория | Слов / intro | Sections / sources | Reviewed | Триаж |
|---|---|---|---|---|---|---|
| [baggage](../../apps/web/src/lib/travel-guides.ts) | Bagaż: co naprawdę obejmuje cena biletu | planning | 269/30 | 4/2 | 2026-09-23 | структурных флагов нет |
| [connections](../../apps/web/src/lib/travel-guides.ts) | Przesiadki: jedna rezerwacja czy osobne bilety | planning | 257/34 | 4/2 | 2026-09-23 | структурных флагов нет |
| [booking-with-agents](../../apps/web/src/lib/travel-guides.ts) | Zakup biletu u pośrednika: co sprawdzić | planning | 273/34 | 4/2 | 2026-09-23 | структурных флагов нет |
| [wro-airport](../../apps/web/src/lib/airport-guides.ts) | Wylot z Wrocławia: dojazd na WRO | airports | 233/36 | 4/2 | 2026-09-23 | структурных флагов нет |
| [waw-airport](../../apps/web/src/lib/airport-guides.ts) | Lotnisko Chopina: dojazd i wylot z WAW | airports | 216/31 | 4/2 | 2026-09-23 | структурных флагов нет |
| [wmi-airport](../../apps/web/src/lib/airport-guides.ts) | Warszawa-Modlin: jak zaplanować wylot z WMI | airports | 210/31 | 4/2 | 2026-09-23 | структурных флагов нет |
| [krk-airport](../../apps/web/src/lib/airport-guides.ts) | Kraków Airport: pociąg, autobus i wylot z KRK | airports | 222/31 | 4/2 | 2026-09-23 | структурных флагов нет |
| [gdn-airport](../../apps/web/src/lib/airport-guides.ts) | Gdańsk Airport: dojazd z Trójmiasta na GDN | airports | 206/32 | 4/2 | 2026-09-23 | структурных флагов нет |
| [ktw-airport](../../apps/web/src/lib/airport-guides.ts) | Katowice Airport w Pyrzowicach: dojazd na KTW | airports | 222/35 | 4/2 | 2026-09-23 | структурных флагов нет |
| [poz-airport](../../apps/web/src/lib/airport-guides.ts) | Poznań-Ławica: dojazd i powrót z POZ | airports | 224/34 | 4/2 | 2026-09-23 | структурных флагов нет |
| [barcelona-airports](../../apps/web/src/lib/destination-guides.ts) | Barcelona: BCN, Girona czy Reus | destinations | 249/39 | 4/3 | 2026-09-23 | структурных флагов нет |
| [rome-airports](../../apps/web/src/lib/destination-guides.ts) | Rzym: Fiumicino i Ciampino bez pomyłki | destinations | 222/32 | 4/3 | 2026-09-23 | структурных флагов нет |
| [lisbon-airport](../../apps/web/src/lib/destination-guides.ts) | Lizbona: dojazd z LIS i powrót do terminala | destinations | 220/33 | 4/3 | 2026-09-23 | структурных флагов нет |
| [athens-airport](../../apps/web/src/lib/destination-guides.ts) | Ateny: z ATH do centrum czy do portu | destinations | 224/35 | 4/3 | 2026-09-23 | структурных флагов нет |
| [paris-airports](../../apps/web/src/lib/destination-guides.ts) | Paryż: CDG, Orly i Beauvais w jednym porównaniu | destinations | 221/31 | 4/2 | 2026-09-23 | структурных флагов нет |
| [london-airports](../../apps/web/src/lib/destination-guides.ts) | Londyn: sześć lotnisk i różne drogi do miasta | destinations | 236/33 | 4/2 | 2026-09-23 | структурных флагов нет |
| [milan-airports](../../apps/web/src/lib/destination-guides.ts) | Mediolan: Linate, Malpensa czy Bergamo | destinations | 231/39 | 4/2 | 2026-09-23 | структурных флагов нет |
| [budapest-airport](../../apps/web/src/lib/destination-guides.ts) | Budapeszt: 100E czy 200E z lotniska BUD | destinations | 235/33 | 4/3 | 2026-09-23 | структурных флагов нет |
| [madrid-airport](../../apps/web/src/lib/more-destination-guides.ts) | Madryt: terminal MAD, metro i dalsza podróż | destinations | 204/41 | 4/2 | 2026-09-24 | исправлен city CTA |
| [valencia-airport](../../apps/web/src/lib/more-destination-guides.ts) | Walencja: z VLC do centrum i nad morze | destinations | 187/37 | 4/2 | 2026-09-24 | исправлен city CTA; короткая: ручной просмотр |
| [alicante-airport](../../apps/web/src/lib/more-destination-guides.ts) | Alicante: autobus C6 i dalsza droga po Costa Blanca | destinations | 196/38 | 4/2 | 2026-09-24 | короткая: ручной просмотр |
| [malaga-airport](../../apps/web/src/lib/more-destination-guides.ts) | Malaga: kolej C1, centrum i Costa del Sol | destinations | 191/37 | 4/2 | 2026-09-24 | короткая: ручной просмотр |
| [porto-airport](../../apps/web/src/lib/more-destination-guides.ts) | Porto: metro E, Andante i ostatni odcinek do noclegu | destinations | 193/40 | 4/2 | 2026-09-24 | исправлен city CTA; короткая: ручной просмотр |
| [vienna-airport](../../apps/web/src/lib/more-destination-guides.ts) | Wiedeń: dojazd z VIE podczas zmian na kolei | destinations | 192/41 | 4/2 | 2026-09-24 | исправлен city CTA; короткая: ручной просмотр; direct notice source |
| [prague-airport](../../apps/web/src/lib/more-destination-guides.ts) | Praga: trolejbus 59 czy Airport Express | destinations | 191/36 | 4/2 | 2026-09-24 | исправлен city CTA; короткая: ручной просмотр |
| [amsterdam-airport](../../apps/web/src/lib/more-destination-guides.ts) | Amsterdam: Schiphol, pociąg i autobus 397 | destinations | 192/37 | 4/2 | 2026-09-24 | короткая: ручной просмотр |
| [copenhagen-airport](../../apps/web/src/lib/more-destination-guides.ts) | Kopenhaga: metro czy pociąg z CPH | destinations | 198/40 | 4/2 | 2026-09-24 | исправлен city CTA; короткая: ручной просмотр |
| [stockholm-airports](../../apps/web/src/lib/more-destination-guides.ts) | Sztokholm: Arlanda i Skavsta to różne transfery | destinations | 205/39 | 4/2 | 2026-09-24 | исправлен city CTA |
| [milan-weekend](../../apps/web/src/lib/city-break-guides.ts) | Mediolan na weekend: co zobaczyć w 2 dni | destinations | 313/44 | 4/2 | 2026-10-02 | исправлен city CTA |
| [paris-weekend](../../apps/web/src/lib/city-break-guides.ts) | Paryż na weekend: plan zwiedzania na 2 dni | destinations | 343/50 | 4/2 | 2026-10-02 | исправлен city CTA |
| [stockholm-weekend](../../apps/web/src/lib/city-break-guides.ts) | Sztokholm w 2 dni: Gamla Stan i Djurgården | destinations | 325/44 | 4/3 | 2026-10-02 | исправлен city CTA |
| [oslo-weekend](../../apps/web/src/lib/city-break-guides.ts) | Oslo na weekend: fiord, opera i muzea w 2 dni | destinations | 325/41 | 4/2 | 2026-10-02 | исправлен city CTA |
| [concert-trip](../../apps/web/src/lib/city-break-guides.ts) | Wyjazd na koncert za granicę: lot, nocleg i bilety | planning | 394/45 | 5/2 | 2026-10-02 | структурных флагов нет |
| [city-break-planning](../../apps/web/src/lib/city-break-guides.ts) | Jak zaplanować city break na 2–3 dni | planning | 399/44 | 5/2 | 2026-10-02 | структурных флагов нет |
| [malaga-weekend](../../apps/web/src/lib/weekend-pilot-guides.ts) | Malaga w 48 godzin: stare miasto, Alcazaba i morze | destinations | 383/45 | 5/2 | 2026-10-07 | общий checklist |
| [alicante-weekend](../../apps/web/src/lib/weekend-pilot-guides.ts) | Alicante w 48 godzin: zamek, stare miasto i plaża | destinations | 392/50 | 5/2 | 2026-10-07 | общий checklist |
| [prague-weekend](../../apps/web/src/lib/weekend-pilot-guides.ts) | Praga w 48 godzin: Stare Miasto, most Karola i zamek | destinations | 396/50 | 5/3 | 2026-10-07 | общий checklist |
| [barcelona-3-days](../../apps/web/src/lib/three-day-guides.ts) | Barcelona w 3 dni: plan zwiedzania i budżet wyjazdu | destinations | 484/78 | 6/3 | 2026-10-13 | структурных флагов нет |
| [rome-3-days](../../apps/web/src/lib/three-day-guides.ts) | Rzym w 3 dni: Koloseum, centrum i Watykan bez pośpiechu | destinations | 479/80 | 6/3 | 2026-10-13 | структурных флагов нет |
| [lisbon-3-days](../../apps/web/src/lib/three-day-guides.ts) | Lizbona w 3 dni: Alfama, Belém i plan spokojnego city breaku | destinations | 511/79 | 6/3 | 2026-10-13 | структурных флагов нет |
| [gdzie-poleciec-na-weekend-jesienia](../../apps/web/src/lib/short-trip-guides.ts) | Gdzie polecieć na weekend jesienią? Rzym, Mediolan czy Lizbona | planning | 509/62 | 5/3 | 2026-10-17 | структурных флагов нет |
| [tanie-loty-last-minute](../../apps/web/src/lib/short-trip-guides.ts) | Tanie loty last minute: jak szukać i porównać cały wyjazd | planning | 458/49 | 5/1 | 2026-10-17 | структурных флагов нет |
| [norwegia-wieloryby-lodowce-fiordy](../../apps/web/src/lib/nordic-guides.ts) | Norwegia: wieloryby, lodowce i fiordy — co zobaczyć i kiedy jechać | destinations | 592/58 | 6/4 | 2026-10-17 | структурных флагов нет |
| [islandia-wieloryby-lodowce-atrakcje](../../apps/web/src/lib/nordic-guides.ts) | Islandia: wieloryby, lodowce i atrakcje — jak zaplanować pierwszy wyjazd | destinations | 624/62 | 7/7 | 2026-10-17 | структурных флагов нет |
| [trip-budget](../../apps/web/src/lib/content.ts) | Jak policzyć budżet całej podróży | planning | 326/31 | 4/0 | 2026-10-08 | внутренний product guide |
| [one-way-round-trip](../../apps/web/src/lib/content.ts) | Lot w jedną stronę czy w obie strony | planning | 283/32 | 4/0 | 2026-09-23 | внутренний product guide |

## Результат по семи областям

| Область | Проверенный результат / действие |
|---|---|
| Устаревшая информация | Возраст review16–40 дней — повод для проверки, не ошибка. Aena подтверждает C6 для Alicante, C1 для Málaga,3/5 для Valencia; официальные Vienna/CAT notices подтверждают текущую перестройку2026–2027. Полный фактчек46 статей не заявляется. Source Vienna уточнён до direct notice, reviewedAt не менялся |
| Внутренние ссылки |11 primary CTA теряли известный город при переходе в /deals. Добавлен destination из существующего guide mapping. RelatedInfoPages/airport/guide/budget links уже есть; их отсутствие не заявляется |
| Вступления | Прочитаны title/intro всех46 guides: конкретный airport/city/срок/тип покупки и практическая задача;46 уникальных вступлений. Подтверждённого основания для массового переписывания нет |
| Повторы |3 общих абзаца checklist у Malaga/Alicante/Prague weekend, но полные тексты и intro уникальны. Общие правила багажа/времени/бюджета полезны в каждом самостоятельном guide и сохранены. Search penalty не утверждается |
| Search intent | Главный подтверждённый разрыв — guide о конкретном городе → общий каталог.11 CTA теперь ведут в поиск по этому городу. Транспортный guide не превращён в обещание доступного перелёта |
| Краткость |8 статей имеют187–198 слов и по4 прикладных sections, airport distinctions, sources и related links; это не пустые страницы. Для ALC/AGP/VLC/VIE основные выбранные факты сверены. Остальные транспортные подробности требуют периодического source review, лишний текст по word quota не добавлялся |
| CTA clarity | Primary routes сохраняют город в4 локалях. Labels, guide text, numbers, section/source indices и metadata остаются прежними; интерфейс уточняет запрос обычным href |

## Приоритет существующих материалов

[Google Polska,07.07.2026](https://blog.google/intl/pl-pl/nowosci-produktowe/odkrywanie-wyszukiwanie/zagraniczne-destynacje-i-wakacje-all-inclusive-trendy-podroznicze-2026-w-wyszukiwarce-google/) отмечает интерес пользователей из Польши летом2026 к Alicante/Málaga и в целом к Италии/Испании. Это исторический агрегированный сигнал, не объём/CTR/позиция HopTrip и не спрос на конкретный airport guide.

| Приоритет проверки | Материалы | Evidence / решение |
|---|---|---|
| Сначала: прямой сезонный destination signal | alicante-airport/alicante-weekend, malaga-airport/malaga-weekend | Google называет Alicante/Málaga; Aena подтверждает выбранные transport facts. Городские CTA уже есть, intro/сценарии уникальны, сохраняем |
| Срочность информации | vienna-airport | Действующая перестройка транспорта. Основные предупреждения верны; даём прямую ссылку на официальное уведомление и исправляем city CTA |
| Подтверждённая usability ошибка |11 guides из changes.json, в том числе madrid/valencia/milan/rome | Потеря destination проверена по source и browser before. Общий интерес к странам не выдаётся за спрос на эти точные queries. Один небольшой pattern исправлен во всех11 местах |
| Дальнейший регулярный source review |8 short airport guides | Нужна периодическая сверка тарифов/расписаний; без фактической ошибки нет произвольного расширения текста |

Search Console/Keyword Planner/export в доступном контексте не обнаружены. Поэтому точный query-level demand ranking отсутствует, search volumes не придуманы. Новый content-opportunity план SEO-05 не создавался.

[Объём изменений, источники, проверки и ограничения](README.md).
