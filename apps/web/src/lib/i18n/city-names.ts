import type {Locale} from "./config.ts";
// Presentation and search aliases only. Never use these names as provider IDs.
const names:Record<string,readonly [string,string,string]>={
 krakow:["Kraków","Краков","Краків"],wroclaw:["Wrocław","Вроцлав","Вроцлав"],warsaw:["Warsaw","Варшава","Варшава"],
 gdansk:["Gdańsk","Гданьск","Гданськ"],katowice:["Katowice","Катовице","Катовиці"],poznan:["Poznań","Познань","Познань"],
 lodz:["Łódź","Лодзь","Лодзь"],rzeszow:["Rzeszów","Жешув","Ряшів"],szczecin:["Szczecin","Щецин","Щецин"],
 bydgoszcz:["Bydgoszcz","Быдгощ","Бидгощ"],lublin:["Lublin","Люблин","Люблін"],
 "zielona gora":["Zielona Góra","Зелёна-Гура","Зелена Гура"],olsztyn:["Olsztyn","Ольштын","Ольштин"],
 rome:["Rome","Рим","Рим"],milan:["Milan","Милан","Мілан"],paris:["Paris","Париж","Париж"],barcelona:["Barcelona","Барселона","Барселона"],
 london:["London","Лондон","Лондон"],lisbon:["Lisbon","Лиссабон","Лісабон"],athens:["Athens","Афины","Афіни"],
 brussels:["Brussels","Брюссель","Брюссель"],chisinau:["Chișinău","Кишинёв","Кишинів"],basel:["Basel","Базель","Базель"],
 budapest:["Budapest","Будапешт","Будапешт"],venice:["Venice","Венеция","Венеція"],nice:["Nice","Ницца","Ніцца"],
 valencia:["Valencia","Валенсия","Валенсія"],stockholm:["Stockholm","Стокгольм","Стокгольм"],pisa:["Pisa","Пиза","Піза"],
 bologna:["Bologna","Болонья","Болонья"],bratislava:["Bratislava","Братислава","Братислава"],vilnius:["Vilnius","Вильнюс","Вільнюс"],
 prague:["Prague","Прага","Прага"],vienna:["Vienna","Вена","Відень"],dubrovnik:["Dubrovnik","Дубровник","Дубровник"],
 bucharest:["Bucharest","Бухарест","Бухарест"],bourgas:["Burgas","Бургас","Бургас"],copenhagen:["Copenhagen","Копенгаген","Копенгаген"],
 riga:["Riga","Рига","Рига"],madrid:["Madrid","Мадрид","Мадрид"],brasov:["Brașov","Брашов","Брашов"],
 catania:["Catania","Катания","Катанія"],naples:["Naples","Неаполь","Неаполь"],larnaca:["Larnaca","Ларнака","Ларнака"],
 paphos:["Paphos","Пафос","Пафос"],aalesund:["Ålesund","Олесунн","Олесунн"],tromso:["Tromsø","Тромсё","Тромсе"],
 oslo:["Oslo","Осло","Осло"],bergen:["Bergen","Берген","Берген"],reykjavik:["Reykjavík","Рейкьявик","Рейк’явік"],
};
const normalize=(value:string)=>value.trim().toLowerCase().replace(/ł/g,"l").normalize("NFKD").replace(/\p{M}/gu,"");
export function translatedCity(city:string,slug:string|undefined,locale:Locale):string|undefined {
 if(locale==="pl")return undefined;
 const row=names[normalize(slug??city)] ?? names[normalize(city)];
 return row?.[({en:0,ru:1,uk:2} as const)[locale]];
}
