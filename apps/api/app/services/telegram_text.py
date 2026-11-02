"""Private bot messages in the four supported locales. Commands are stable identifiers."""

LOCALES = ('pl', 'en', 'ru', 'uk')
COPY = {
    'help': (
        'Alerty lotnicze HopTrip. /subscribe origin=WRO budget=250 zapisuje warunki; dopiero /confirm włącza subskrypcję. /settings pokazuje warunki, /set budget=220 je zmienia, /stop wyłącza alert. Opcjonalnie: destination=milan (anywhere = dowolny), max_connections=0, departure_from=2030-06-01, departure_to=2030-06-30, duration_min=2, duration_max=4, weekend=true, frequency=daily lub weekly. Daty to zakres wylotu; budżet dotyczy lotu na osobę, bez noclegu. Brak limitu przesiadek nie oznacza lotu bezpośredniego.',
        'HopTrip flight alerts. /subscribe origin=WRO budget=250 saves preferences; only /confirm activates the subscription. /settings shows preferences, /set budget=220 changes them, /stop disables alerts. Optional: destination=milan (anywhere = any destination), max_connections=0, departure_from=2030-06-01, departure_to=2030-06-30, duration_min=2, duration_max=4, weekend=true, frequency=daily or weekly. Dates are the departure range; budget is for flights per person, without accommodation. No connection limit does not mean a direct flight.',
        'Уведомления HopTrip. /subscribe origin=WRO budget=250 сохраняет условия; только /confirm включает подписку. /settings показывает условия, /set budget=220 меняет их, /stop отключает уведомления. Дополнительно: destination=milan (anywhere = любое направление), max_connections=0, departure_from=2030-06-01, departure_to=2030-06-30, duration_min=2, duration_max=4, weekend=true, frequency=daily или weekly. Даты задают диапазон вылета; бюджет — перелёт на человека без проживания. Отсутствие лимита пересадок не означает прямой рейс.',
        'Сповіщення HopTrip. /subscribe origin=WRO budget=250 зберігає умови; лише /confirm вмикає підписку. /settings показує умови, /set budget=220 змінює їх, /stop вимикає сповіщення. Додатково: destination=milan (anywhere = будь-який напрямок), max_connections=0, departure_from=2030-06-01, departure_to=2030-06-30, duration_min=2, duration_max=4, weekend=true, frequency=daily або weekly. Дати задають діапазон вильоту; бюджет — переліт на людину без проживання. Відсутність ліміту пересадок не означає прямого рейсу.',
    ),
    'confirm': ('Aby wyrazić zgodę na wiadomości z nowymi lotami według tych warunków, wyślij /confirm w ciągu24h. Do tego czasu nie wysyłamy ofert.', 'To opt in to new-flight messages matching these preferences, send /confirm within24h. No offers will be sent before then.', 'Чтобы согласиться на сообщения о новых перелётах по этим условиям, отправьте /confirm в течение24ч. До этого предложения не отправляются.', 'Щоб погодитися на повідомлення про нові перельоти за цими умовами, надішліть /confirm протягом24год. До цього пропозиції не надсилаються.'),
    'active': ('Subskrypcja aktywna. /stop wyłącza wiadomości.', 'Subscription active. /stop disables messages.', 'Подписка активна. /stop отключает сообщения.', 'Підписка активна. /stop вимикає повідомлення.'),
    'stopped': ('Alert wyłączony. Ponowny zapis wymaga /subscribe i /confirm.', 'Alerts disabled. Resubscribe with /subscribe and /confirm.', 'Уведомления отключены. Для повторной подписки нужны /subscribe и /confirm.', 'Сповіщення вимкнено. Для повторної підписки потрібні /subscribe та /confirm.'),
    'expired': ('Potwierdzenie wygasło. Użyj ponownie /subscribe.', 'Confirmation expired. Use /subscribe again.', 'Подтверждение просрочено. Используйте /subscribe заново.', 'Підтвердження прострочено. Скористайтеся /subscribe знову.'),
    'none': ('Brak aktywnej subskrypcji. Użyj /subscribe.', 'No active subscription. Use /subscribe.', 'Активной подписки нет. Используйте /subscribe.', 'Активної підписки немає. Скористайтеся /subscribe.'),
    'updated': ('Warunki zapisane.', 'Preferences saved.', 'Условия сохранены.', 'Умови збережено.'),
    'invalid': ('Sprawdź parametry i zakresy. /help pokazuje dostępne opcje. Nie wysyłaj emaila ani tokenów.', 'Check parameters and ranges. /help lists available options. Do not send email addresses or tokens.', 'Проверьте параметры и диапазоны. /help показывает доступные условия. Не отправляйте email или токены.', 'Перевірте параметри й діапазони. /help показує доступні умови. Не надсилайте email або токени.'),
    'paused': ('Wysyłka ofert jest wstrzymana; ustawienia i /stop pozostają dostępne.', 'Offer delivery is paused; preferences and /stop remain available.', 'Отправка предложений приостановлена; настройки и /stop доступны.', 'Надсилання пропозицій призупинено; налаштування й /stop доступні.'),
    'settings': ('Ustawienia', 'Preferences', 'Условия', 'Умови'),
    'privacy': ('Prywatność', 'Privacy', 'Конфиденциальность', 'Конфіденційність'),
    'header': ('Nowe dopasowania HopTrip', 'New HopTrip matches', 'Новые предложения HopTrip', 'Нові пропозиції HopTrip'),
    'price': ('Zaobserwowana cena lotu/os.', 'Observed flight price/person', 'Наблюдаемая цена перелёта/чел.', 'Спостережена ціна перельоту/люд.'),
    'seen': ('Obserwacja', 'Observed', 'Наблюдение', 'Спостереження'),
    'connections': ('Przesiadki: wylot/powrót', 'Connections: outbound/return', 'Пересадки: туда/обратно', 'Пересадки: туди/назад'),
    'unknown': ('brak danych', 'unknown', 'нет данных', 'немає даних'),
    'nights': ('noce', 'nights', 'ночей', 'ночей'),
    'disclaimer': ('Lot w obie strony. Nocleg, dojazdy i bagaż sprawdź osobno. Cena i dostępność mogą się zmienić; potwierdź warunki u sprzedawcy. Weekend nie gwarantuje wyjazdu bez urlopu. Linki na stronie mogą być afiliacyjne. /settings /stop', 'Round trip. Check accommodation, transfers and baggage separately. Price and availability can change; confirm terms with the seller. A weekend does not guarantee a trip without leave. Website links may be affiliate links. /settings /stop', 'Туда и обратно. Проживание, трансферы и багаж проверьте отдельно. Цена и наличие могут измениться; подтвердите условия у продавца. Выходные не гарантируют поездку без отпуска. Ссылки на сайте могут быть партнёрскими. /settings /stop', 'Туди й назад. Проживання, трансфери та багаж перевірте окремо. Ціна й наявність можуть змінитися; підтвердьте умови у продавця. Вихідні не гарантують поїздки без відпустки. Посилання на сайті можуть бути партнерськими. /settings /stop'),
}


def locale_for(value: object) -> str:
    language = value.split('-')[0].lower() if isinstance(value, str) else 'pl'
    return language if language in LOCALES else 'pl'


def message(key: str, locale: str) -> str:
    return COPY[key][LOCALES.index(locale_for(locale))]
