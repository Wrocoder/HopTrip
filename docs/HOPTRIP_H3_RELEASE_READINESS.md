# HopTrip H3 — готовность к релизу

Снимок **2026-11-06, после H3-17c1**. **Общий статус: IN_PROGRESS, production release не подтверждён.** Production deploy текущих изменений явно разрешён пользователем2026-11-07. Этот документ фиксирует gates; включение новых реальных уведомлений не выполняется.

| Gate | Состояние | Доказательства / что осталось |
|---|---|---|
| Падавший Telegram journey | DONE | Воспроизведён before fail. Тестовый clock согласован с dispatcher, предложение задаётся относительно clock; два сценария, включая Новый год в Warsaw. Runtime не изменён. [H3-17c1](h3-17c1/README.md) |
| Полный API и PostgreSQL | PASS локально | **1255passed,0failed,0skipped**, включая18PostgreSQL tests. Чистый локальный PG16, migrations→0021; временнаяБД удалена после проверок. Это не проверка production DB/обновления существующих production данных |
| Web build/lint/types/unit и целевые browser journeys | PASS в последнем b9 |332Node,84production-browser,48report accessibility/layout checks; build iCUtQkoCxvT-Hp9Yukz8Z. Runtime послеb9 не менялся. [b9](h3-18b9/README.md). После фикса test-only новые web-прогоны не требовались; полный релизный browser gate ещё не закрыт |
| Зафиксированный и проверенный release candidate | PENDING | HEAD=d928246561da713c4dd1f2a4c7fbdafb39a305ab; H3 изменения находятся в рабочем дереве, release commit/PR не создан. [Checkout snapshot](h3-17c1/checkout.json). Нужен review текущего diff, включая разрешённую очистку старых docs/images; сохранить пользовательские .idea изменения отдельно. Артефакты должны соответствовать одному кандидату |
| Актуальные release images и репетиция | PENDING | Построить из проверенного кандидата, пройти deployment/rollback rehearsal. Локальная b7 проверка static retention уже есть, но она не подтверждает выкладку текущего релизного образа. [b7](h3-17b7/README.md) |
| Установленный deployer/static cache overlay | PENDING_STAGING_ACTIVATION | Root-owned /usr/local/sbin/hoptrip-deploy автоматически изCI не обновляется. Нужны установка проверенной версии, overlay/mount/capacity checks и smoke старых/новых ресурсов. Не рассчитывать, что достаточно только нового Docker image |
| Финальная регрессия и доступность | PENDING | Основные journeys/4locale/320px/SEO URLs/assets/consent/save/share/partner boundaries на том же кандидате. Остались WebKit, physical devices/manual screen reader и известные duplicate landmark names при двух раскрытых карточках; triage/исправления вести отдельной задачей |
| Staging с целевой конфигурацией | NOT_VERIFIED | TLS/CDN/host overrides, migrations на копии реального состояния, readiness, старые ресурсы после переключения, rollback и postflight/monitoring. Доступ/конфигурация staging в этом шаге не использовались |
| Алерты/Telegram H3-14 | BLOCKED для активации | Unit/integration checks используют synthetic settings/in-memory sender. Реальная deliverability/внешняя доставка не подтверждена; не включать до отдельного gate. Тестовые enabled flags не означают активацию сайта |
| Аналитика H3-18 | IN_PROGRESS | Locale cohorts готовы локально; mobile/desktop split остаётся отдельной функциональной частью. Реальные baseline/after и field CWV требуют наблюдений сопоставимых периодов; их нельзя объявить выполненными до сбора данных |

**Следующая отдельная задача H3-17c2:** review и фиксация состава релизного кандидата, затем сборка его образов и локальная репетиция выкладки/отката. Далее staging gates и итоговое решение о production rollout. Эти этапы не выполнялись автоматически в H3-17c1.

H3-01–13/15/16 остаются DONE по локальным acceptance; H3-17/18 IN_PROGRESS, H3-14 BLOCKED. Рабочее приложение/production flags/credentials/схемаБД в H3-17c1 не менялись. Проверки прошлых задач с известным Telegram fail сохраняются как история; актуальный полный API gate теперь зелёный.
