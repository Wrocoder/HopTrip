Первый ESLint run завершился exit 1: interaction-feedback.spec.ts:21:48 warning '_ok' is defined but never used (@typescript-eslint/no-unused-vars), 0 errors, 1 warning; --max-warnings=0.
Исправлено только test harness: явно типизированный ClipboardHarness с пустым callback без неиспользуемого параметра.
Исходный lint.txt был перезаписан повторным запуском: попытка сохранить его использовала неверный cwd; этот контекст восстановлен из фактического tool output и не является raw log.
Та же команда с неверным cwd не скопировала test в isolated copy; копирование выполнено отдельной командой из корня до следующего browser run. Runtime от этого не менялся.
