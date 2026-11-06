# HopTrip — дизайн-система

Дата: 2026-11-01. UI-01, текущий checkout. Production deployment не выполнялся.

Источник значений: [design-tokens.css](../apps/web/src/app/design-tokens.css). Общие правила и варианты: [globals.css](../apps/web/src/app/globals.css); CSS modules используют те же роли. Новых UI dependencies, demo routes или обязательных React-обёрток нет. Существующие native elements/компоненты остаются основой, бизнес-логика не переносится в CSS.

## Основа

Сохраняем зелёный бренд HopTrip и локальные DM Sans/Fraunces. Предложенная мастер-планом синяя палитра была отправной точкой с условием existing branding, а не требованием ребрендинга. Семантические роли отделены от названий оттенков; прежние --green-dark/--ink/--surface/--border и другие имена остаются aliases. Новые компоненты должны использовать подходящую роль, а не копировать hex из отдельного widget.

| Роль | Token / значение | Назначение |
|---|---|---|
| Background / surface | --color-background #F5F7F2 / --color-surface #FFFFFF | Страница / плоскость карточки |
| Text / secondary | --color-text #1F302E / --color-text-secondary #4E625D | Основной и поясняющий текст |
| Primary / hover / text | --color-primary #245C40 / --color-primary-hover #38734E / --color-on-primary #FFFFFF | Основное действие |
| Decorative border | --color-border #DFE7DF | Разделитель/карточка, не граница поля |
| Control border / background | --color-control-border #758B81 / --control-background #FCFDFB | Различимая граница ввода |
| Success | --color-success #245C40 / --color-success-surface #F0F6ED | Известное позитивное состояние, только с текстом |
| Warning | --color-warning #6D430E / --color-warning-border #966014 / --color-warning-surface #FFF7E7 | Проверка/ограничение/недоступность |
| Danger | --color-danger #A12622 / --color-danger-surface #FFF1ED | Ошибка ввода/ошибка чтения/конфликт |
| Info | --color-info #536C78 / --color-info-surface #F2F5F6 | Недостаточная/поясняющая информация |
| Scrim / skeleton | --color-scrim / --color-skeleton | Native dialog backdrop / loading placeholder |

Цвет не заменяет текст, aria-invalid, data-state или фактическую классификацию. Зелёный статус flight-fit не подтверждает availability; warning/danger не изменяют данные оферты. Изображения и новые источники цен не входят в UI-01.

## Типографика и размеры

- --font-ui: установленный --font-body (DM Sans), system fallback. --font-display: установленный --font-heading (Fraunces), serif fallback.
- Общие уровни текста: --text-xs .75rem, --text-sm .875rem, --text-md 1rem, --text-lg 1.125rem. Body line-height1.6, headings1.12; weights400/500/600. Page-specific responsive heading clamps и существующая плотность длинных editorial explanations сохраняются, не превращаются в один фиксированный размер.
- Spacing:4/8/12/16/20/24/32/40/48px, --space-1/2/3/4/5/6/8/10/12. Используется для общих gaps/padding; grid tracks, responsive breakpoints, специфические интервалы расписания и first-fold composition остаются у feature CSS.
- Radius: controls10px, small inset8px, cards16px, sections/modal24px, badges/pills999px. --radius и --radius-medium сохраняют прежние aliases24/16.
- Shadows: --shadow-card для лёгкого elevation, --shadow-raised для elevated/hover/dialog, --shadow compatibility alias. Не использовать shadow как единственный focus indicator.
- Основные controls/buttons минимум48px; compact links/icon/remove actions минимум44px. Высота растёт с длинной подписью, text clipping не используется.

## Общие элементы

| Элемент | Реализация / состояния |
|---|---|
| Primary action | .button / .cta / существующий submit в .filters: primary+on-primary,10px radius, hover только enabled |
| Secondary action | .button.button-secondary: surface+primary text+control border; hover sage-light. Самостоятельный реальный variant, не второй primary |
| Compact action | Existing retry/remove/close/nav targets: те же tokens,44px допустим для compact/icon; retry/default controls48px |
| Disabled | Native disabled остаётся источником поведения; CSS даёт opacity/cursor без hover movement. Не имитировать disabled одним цветом или pointer-events |
| Form | Native input/select/textarea; control border/background/radius/font. aria-invalid=true получает danger. Checkbox/radio/range/hidden не растягиваются общей text-field геометрией |
| Card / panel | Existing deal/activities/events/planned/saved modules; card16px, panel24px; padding/layout у владельца функции |
| Badge | .badge/.score-badge/event category используют pill; текущие labels и их meaning сохранены |
| Notice | Existing role=note/notice, event fit/sale states и saved warnings: semantic tokens, видимый текст; не использовать цвет вместо объяснения |
| Recovery | OfferState — loading/empty/error/unavailable. Empty dashed; error danger; unavailable warning; loading subtle surface |
| Loading | Existing loading-line/skeleton styles получают shared background/motion; no new asynchronous data paths |
| Modal | Native ScoreTrigger dialog:24px, shared scrim/shadow, background isolation/Escape/return focus/scroll locking сохранены; переход к интерфейсу браузера на Tab boundary не подменяется custom trap |

## Focus и системные режимы

Общий :focus-visible включает links/buttons/input/select/textarea/summary/tabindex targets. Outline3px primary, offset3px и белая separating shadow. Это не только изменение цвета border. На inverse brand surface прежний yellow focus остаётся контрастным вариантом. Existing trip field :focus также использует эти tokens. Forced-colors получает системный Highlight outline без box-shadow; custom trip select сохраняет native appearance в этом режиме.

Skip-link скрывается fixed top:-100vh, без transform/transition. При keyboard focus top возвращается в12px; Enter ведёт в прежний #content с tabindex=-1; после потери focus ссылка снова за экраном. Это изменение механизма визуального focus, не новый навигационный маршрут. Keyboard/live computed rect и mobile capture проверяются в UI-01 отчёте (`docs/ui01/README.md`; исторический файл удалён).

prefers-reduced-motion сохраняет прежнее отключение animation/transition, дополнительно убирает hover transform с article deal-card. Loading marker не требует анимации для понимания текста состояния. Native roles/labels и handlers не заменяются декоративными div.

## Контраст и проверка новых изменений

Для обычного текста проверяем4.5:1, для необходимых control boundaries/focus cues —3:1, без округления пограничных результатов вверх. Основание: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Декоративная граница карточки не приравнивается к border поля; inactive controls имеют отдельные условия стандарта.

Вычисленные пары и before/after (`docs/ui01/contrast.json`; исторический файл удалён), [Node contract tests](../apps/web/tests/design-tokens.test.mjs) и browser computed styles/axe покрывают выбранные состояния. Это не декларация полной WCAG conformant accessibility для всего сайта. Проверять обычный/hover/disabled/focus/invalid и оба surface типа; при новой semantic role добавить её в таблицу тестов, сохранить текстовое описание.

Для повторного применения использовать существующий class/компонент и token, не копировать local hex/radius. Проверить4 языка, стандартный и узкий viewport, keyboard/Escape, reduced motion/forced colors; убедиться, что визуальное изменение не изменило search/purchase/consent/plan state. Результаты, границы и rollback UI-01 (`docs/ui01/README.md`; исторический файл удалён).
