# Контакты и privacy: подготовка к публикации

Проверено по коду 2026-09-25. Это рабочий документ, не опубликованная политика.
Реализовано управление согласием: аналитика и Drive выключены до отдельного выбора,
есть отказ и сохранение выбранных целей. Выбор хранится 180 дней; настройки доступны
в footer. Отзыв очищает session localStorage, прекращает аналитику; для Drive выполняется
перезагрузка, чтобы остановить уже исполняемый скрипт. Без analytics consent переход
не создаёт AnalyticsEvent и сохраняет техническую запись с session=not-provided.
82 браузерных проверки desktop/mobile прошли, включая axe для панели согласия.
Страницы contact/privacy остаются draft до заполнения и проверки сведений ниже.

## Что нужно от владельца

- Имя оператора или наименование организации, страна и адрес для обращений.
- Действующий email, который можно публиковать и на который принимаются обращения.
- Подтверждение условий хостинга и обработки данных: регион Oracle, получатели,
  договоры и применимые условия международной передачи.
- Правовые основания для аналитики и партнёрского отслеживания, порядок согласия
  посетителя и отзыва. Разрешение владельца установить Drive не является согласием посетителя.
- Срок хранения переписки и оставшихся записей о партнёрских переходах/расчётах.

Не подставлять предполагаемый kontakt@hoptrip.pl без работающего почтового ящика.
Перед публикацией проверить доставку входящего письма и ответа.

## Подготовленный текст Kontakt (PL)

Operatorem HopTrip jest [NAZWA / IMIĘ I NAZWISKO], [ADRES, KRAJ].
Kontakt: [DZIAŁAJĄCY EMAIL]. Na ten adres możesz zgłosić błąd w ofercie,
problem z działaniem serwisu lub pytanie dotyczące danych osobowych.

HopTrip prezentuje znalezione oferty i odsyła do serwisów partnerów.
Nie przyjmujemy płatności ani rezerwacji. Pytania o zakupiony bilet, zmianę
rezerwacji lub zwrot kieruj do sprzedawcy wskazanego w potwierdzeniu zakupu.
Linki mogą być linkami partnerskimi; po zakupie u partnera możemy otrzymać prowizję.

## Подготовленные фактические разделы privacy (PL)

### Administrator i kontakt

Administratorem danych przetwarzanych przez HopTrip jest [NAZWA, ADRES, KRAJ].
W sprawach danych osobowych skontaktuj się z nami: [EMAIL].

### Korzystanie z serwisu i statystyki

HopTrip nie oferuje kont użytkowników ani formularza płatności lub rezerwacji.
Do statystyk wykorzystujemy losowy identyfikator sesji oraz zdarzenia takie jak
wyświetlenie strony lub oferty, wyszukiwanie, użycie filtrów i przejście do partnera.
Zapisujemy też oznaczenia źródła i kampanii, jeżeli znajdują się w adresie wejścia.
Identyfikator pseudonimowy nie oznacza pełnej anonimowości danych.

W pamięci localStorage przeglądarki zapisujemy klucz `hoptrip.session.v2`:
identyfikator, czas ostatniej aktywności i ewentualne oznaczenia kampanii.
Po co najmniej 30 minutach braku aktywności przy kolejnym użyciu serwisu
tworzony jest nowy identyfikator. Sam wpis w localStorage nie znika automatycznie
po 30 minutach; można go usunąć przez wyczyszczenie danych witryny w przeglądarce.

Zdarzenia analityczne starsze niż 90 dni są usuwane podczas zadania utrzymaniowego.
W starszych zapisach przejść partnerskich usuwamy powiązanie z sesją i oznaczenia
źródła/kampanii. Same zapisy przejść oraz identyfikatory rozliczeniowe pozostają:
[UZUPEŁNIĆ CEL, PODSTAWĘ I OKRES PRZECHOWYWANIA].

### Partnerzy i Travelpayouts Drive

Po osobnej zgodzie marketingowej na stronach hoptrip.pl działa Travelpayouts Drive,
pobierany z domeny emrld.ltd. Analityka HopTrip wymaga osobnego wyboru.
Możesz odmówić obu celów bez utraty dostępu do ofert; wybór zapisujemy na 180 dni
w localStorage pod kluczem hoptrip.consent.v1. Zgodę można wycofać w ustawieniach
prywatności w stopce. Wycofanie zgody na Drive odświeża stronę i blokuje ponowne
ładowanie skryptu. Wcześniejsze dane stron trzecich można usunąć w przeglądarce.
Skrypt ma dostęp do zawartości strony i może zmieniać linki na partnerskie.
Połączenie z usługą zewnętrzną przekazuje jej dane techniczne żądania,
w tym adres IP. Nie deklarujemy, że Drive nie korzysta z cookies lub innych
identyfikatorów; szczegółowy wykaz wymaga sprawdzenia konfiguracji usługi.

Po wybraniu oferty możesz przejść przez domenę partnerską tp.media do Aviasales
lub serwisu sprzedawcy. Dalsze przetwarzanie danych opisują zasady danego serwisu.
Warunki i cena zakupu są potwierdzane u sprzedawcy.

### Wiadomości

Jeżeli napiszesz do nas, wykorzystamy dane zawarte w wiadomości do obsługi kontaktu.
[UZUPEŁNIĆ PODSTAWĘ, DOSTAWCĘ POCZTY I OKRES PRZECHOWYWANIA].

## Проверка перед снятием draft

- Дополнить цели/основания, получателей и передачи, сроки, права посетителя,
  порядок обращения и жалобы по применимым требованиям. Не копировать основания
  обработки или обещания из чужой политики без проверки собственной реализации.
- Проверить фактические cookies/запросы Drive и настроить согласие/отзыв там, где
  требуется. Механизм согласия реализован; полный перечень сторонних cookies,
  получателей и условий обработки ещё требует проверки до завершения политики.
- Сверить технические журналы и их сроки; не обещать отсутствие обработки IP.
- Заполнить текст без плейсхолдеров, обновить draft-страницы в content.ts,
  добавить ссылки в навигацию, проверить sitemap/превью и контакты на мобильном.

Ориентиры для проверки: [EDPB — права и прозрачность](https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en),
[описание Drive](https://support.travelpayouts.com/hc/en-us/articles/21844777943058-What-is-Travelpayouts-Drive),
[Travelpayouts privacy](https://support.travelpayouts.com/hc/en-us/articles/360004121052-Privacy-Policy).
Политика Travelpayouts сама по себе не заменяет политику HopTrip и не подтверждает
конкретный набор cookies Drive.
