import type {Locale} from './i18n/config';

const captions={
 paris:['Wieża Eiffla wiosną','The Eiffel Tower in spring','Эйфелева башня весной','Ейфелева вежа навесні'],
 milan:['Kanał Naviglio Grande w Mediolanie','Naviglio Grande canal in Milan','Канал Навильо-Гранде в Милане','Канал Навільйо-Ґранде в Мілані'],
 budapest:['Gmach parlamentu w Budapeszcie nad Dunajem','The Hungarian Parliament Building beside the Danube in Budapest','Здание парламента в Будапеште на берегу Дуная','Будівля парламенту в Будапешті на березі Дунаю'],
 stockholm:['Gamla Stan w Sztokholmie','Gamla Stan in Stockholm','Гамла-Стан в Стокгольме','Ґамла-Стан у Стокгольмі'],
 oslo:['Nabrzeże Operaallmenningen w Oslo','Operaallmenningen waterfront in Oslo','Набережная Опералменнинген в Осло','Набережна Опералменнінґен в Осло'],
 lisbon:['Panorama Lizbony','Lisbon skyline','Панорама Лиссабона','Панорама Лісабона'],
 athens:['Akropol w Atenach widziany ze wzgórza Areopag','The Acropolis of Athens seen from Areopagus hill','Афинский Акрополь с холма Ареопаг','Афінський Акрополь із пагорба Ареопаг'],
 london:['Pałac Westminsterski w Londynie','The Palace of Westminster in London','Вестминстерский дворец в Лондоне','Вестмінстерський палац у Лондоні'],
 madrid:['Plaza Mayor w Madrycie','Plaza Mayor in Madrid','Площадь Пласа-Майор в Мадриде','Площа Пласа-Майор у Мадриді'],
 valencia:['Katedra w Walencji','Valencia Cathedral','Кафедральный собор Валенсии','Кафедральний собор Валенсії'],
 alicante:['Zamek Santa Bárbara w Alicante','Santa Bárbara Castle in Alicante','Замок Санта-Барбара в Аликанте','Замок Санта-Барбара в Аліканте'],
 malaga:['Panorama Malagi ze wzgórza Gibralfaro','Málaga seen from Gibralfaro hill','Панорама Малаги с холма Гибральфаро','Панорама Малаґи з пагорба Ґібральфаро'],
 porto:['Łodzie rabelo i nabrzeże Ribeira w Porto','Rabelo boats and the Ribeira waterfront in Porto','Лодки рабелу и набережная Рибейра в Порту','Човни рабелу та набережна Рібейра в Порту'],
 vienna:['Wiedeń widziany z wieży katedry św. Szczepana','Vienna from the tower of St Stephen’s Cathedral','Вена с башни собора Святого Стефана','Відень із вежі собору Святого Стефана'],
 prague:['Most Karola w Pradze od północy','Charles Bridge in Prague from the north','Карлов мост в Праге с северной стороны','Карлів міст у Празі з північного боку'],
 copenhagen:['Kolorowe kamienice i łodzie przy Nyhavn w Kopenhadze','Colourful houses and boats at Nyhavn in Copenhagen','Разноцветные дома и лодки в Нюхавне, Копенгаген','Різнокольорові будинки й човни в Нюгавні, Копенгаген'],
 amsterdam:['Kamienice nad wodą przy Damrak w Amsterdamie','Waterfront houses at Damrak in Amsterdam','Дома у воды на Дамраке в Амстердаме','Будинки біля води на Дамраку в Амстердамі'],
 wroclaw:['Kamienice na wrocławskim Rynku','Houses on Wrocław’s Market Square','Дома на Рыночной площади Вроцлава','Будинки на Ринковій площі Вроцлава'],
 warsaw:['Rynek Starego Miasta w Warszawie','Old Town Market Square in Warsaw','Рыночная площадь Старого города Варшавы','Ринкова площа Старого міста Варшави'],
 krakow:['Sukiennice i wieża ratuszowa w Krakowie','The Cloth Hall and Town Hall Tower in Kraków','Суконные ряды и Ратушная башня в Кракове','Суконні ряди та Ратушна вежа у Кракові'],
 gdansk:['Nabrzeże Motławy w Gdańsku','The Motława waterfront in Gdańsk','Набережная Мотлавы в Гданьске','Набережна Мотлави у Ґданську'],
 katowice:['Spodek w Katowicach od wschodu','Spodek in Katowice from the east','Сподек в Катовице с восточной стороны','Сподек у Катовіце зі східного боку'],
 poznan:['Ratusz w Poznaniu','Poznań Town Hall','Познанская ратуша','Познанська ратуша'],
 norway:['Drewniane domy Bryggen w Bergen','The wooden houses of Bryggen in Bergen','Деревянные дома Брюггена в Бергене','Дерев’яні будинки Брюґґена в Берґені'],
 iceland:['Panorama Reykjavíku','Reykjavík skyline','Панорама Рейкьявика','Панорама Рейк’явіка'],
 flight:['Skrzydło samolotu nad chmurami','An aircraft wing above the clouds','Крыло самолёта над облаками','Крило літака над хмарами'],
 luggage:['Bagaże oczekujące na załadunek do samolotu','Luggage awaiting loading onto an aircraft','Багаж, ожидающий погрузки в самолёт','Багаж, що очікує на завантаження в літак'],
 barcelona:['Park Güell na tle panoramy Barcelony','Park Güell overlooking Barcelona','Парк Гуэль на фоне панорамы Барселоны','Парк Ґуель на тлі панорами Барселони'],
 rome:['Ulica w dzielnicy Trastevere w Rzymie','A street in Rome’s Trastevere neighbourhood','Улица в римском районе Трастевере','Вулиця в римському районі Трастевере'],
 nigardsbreen:['Lodowiec Nigardsbreen w Norwegii','Nigardsbreen glacier in Norway','Ледник Нигардсбреен в Норвегии','Льодовик Ніґардсбреен у Норвегії'],
 solheimajokull:['Lodowiec Sólheimajökull w Islandii','Sólheimajökull glacier in Iceland','Ледник Соульхеймайёкюдль в Исландии','Льодовик Соульгеймайокутль в Ісландії'],
} as const;
export type ArticlePhotoKey=keyof typeof captions;
const positions:Record<Locale,0|1|2|3>={pl:0,en:1,ru:2,uk:3};
export function articlePhotoCaption(key:ArticlePhotoKey,locale:Locale){return captions[key][positions[locale]];}

export const articlePhotoCopy={
 pl:{photo:'Fotografia',details:'Źródło i licencja zdjęcia',edited:'Kadr i rozmiar zmienione przez HopTrip; format WebP.',adapted:'Ta przetworzona fotografia jest udostępniana na tej samej licencji co oryginał.',unavailable:'Fotografia jest chwilowo niedostępna.',context:'Zdjęcie ilustracyjne, nie informacja o aktualnych warunkach ani dostępności.',city:'Widok miasta, nie terminala ani trasy transferu.'},
 en:{photo:'Photography',details:'Image source and licence',edited:'Cropped and resized by HopTrip; WebP format.',adapted:'This adapted photograph is shared under the same licence as the original.',unavailable:'The photograph is temporarily unavailable.',context:'Illustrative photograph, not a statement of current conditions or availability.',city:'A city view, not an airport terminal or transfer route.'},
 ru:{photo:'Фото',details:'Источник и лицензия фотографии',edited:'Кадрирование и размер изменены HopTrip; формат WebP.',adapted:'Эта обработанная фотография распространяется по той же лицензии, что и оригинал.',unavailable:'Фотография временно недоступна.',context:'Иллюстрация, а не сведения о текущих условиях или наличии предложений.',city:'Вид города, а не терминала аэропорта или маршрута трансфера.'},
 uk:{photo:'Фото',details:'Джерело та ліцензія фотографії',edited:'Кадрування та розмір змінені HopTrip; формат WebP.',adapted:'Ця оброблена фотографія поширюється за тією самою ліцензією, що й оригінал.',unavailable:'Фотографія тимчасово недоступна.',context:'Ілюстрація, а не відомості про поточні умови чи наявність пропозицій.',city:'Вид міста, а не термінала аеропорту чи маршруту трансферу.'},
} satisfies Record<Locale,Record<string,string>>;
