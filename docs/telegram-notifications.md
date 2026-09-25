# Подключение уведомлений HopTrip

В Windows PowerShell подключитесь к серверу:

```powershell
ssh -i "$env:USERPROFILE\.ssh\domarion_oci_staging_ed25519" ubuntu@141.144.246.78
```

Дальше команды выполняются на сервере.

1. Подключите бота:

   ```sh
   sudo /usr/bin/python3 /opt/hoptrip/scripts/setup-notifications.py
   ```

   Вставьте токен: символы не отображаются. Откройте указанного бота в личном чате,
   нажмите Start, отправьте показанный код `hoptrip-…`, затем Enter в терминале.
   Chat ID определяется автоматически. Используйте отдельного бота без webhook.

2. Подключите входящие письма:

   ```sh
   sudo /usr/bin/python3 /opt/hoptrip/scripts/setup-notifications.py --mail
   ```

   Enter выбирает `kontakt@hoptrip.pl`. Введите пароль этого ящика Zimbra (скрытый ввод).
   Скрипт проверяет вход через `imap.mail.ovh.net:993` с TLS, затем сохраняет данные.
   SMTP не требуется. Инструкция OVH: https://docs.ovhcloud.com/en/guides/web-cloud/email-and-collaborative-solutions/zimbra/mail-apps

3. Проверьте доставку и задайте исходную точку для почты:

   ```sh
   sudo systemd-run --wait --pipe --collect --property=EnvironmentFile=/etc/hoptrip/monitor.env /usr/bin/python3 /opt/hoptrip/scripts/monitor.py --test-alert
   sudo systemctl start hoptrip-activity.service
   ```

   В Telegram должно прийти тестовое сообщение и сводка последнего обновления данных.
   Затем отправьте новое письмо на `kontakt@hoptrip.pl`: уведомление ожидается примерно
   в течение минуты. Старые письма при подключении не рассылаются.

Таймеры уже включены: события/почта каждую минуту, проверки сайта/backup/pipeline каждые
5 минут. Ошибки и восстановление отправляются отдельно. Для проверки без секретов:

```sh
sudo systemctl list-timers 'hoptrip-*'
sudo journalctl -u hoptrip-activity.service -u hoptrip-monitor.service -n 20 --no-pager
```

Токен и пароль хранятся только в `/etc/hoptrip/monitor.env`, доступ root 600.
Не присылайте этот файл, токен или пароль в чат. Скрипт сохраняет остальные настройки.
При падении всей VM этот монитор не сможет отправить уведомление: внешний мониторинг
остаётся отдельной задачей.
