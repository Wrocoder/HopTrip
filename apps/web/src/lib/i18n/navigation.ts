import type {Locale} from "./config.ts";
export const navigation:Record<Locale,{flights:string;weekend:string;destinations:string;budget:string;howItWorks:string;main:string;saved:string}>={
 pl:{flights:"Tanie loty",weekend:"Na weekend",destinations:"Kierunki",budget:"Kalkulator budżetu",howItWorks:"Jak działa HopTrip",main:"Nawigacja główna",saved:"Zapisane"},
 ru:{flights:"Недорогие перелёты",weekend:"На выходные",destinations:"Направления",budget:"Калькулятор бюджета",howItWorks:"Как работает HopTrip",main:"Основная навигация",saved:"Сохранённое"},
 en:{flights:"Cheap flights",weekend:"Weekends",destinations:"Destinations",budget:"Budget calculator",howItWorks:"How HopTrip works",main:"Main navigation",saved:"Saved"},
 uk:{flights:"Недорогі перельоти",weekend:"На вихідні",destinations:"Напрямки",budget:"Калькулятор бюджету",howItWorks:"Як працює HopTrip",main:"Основна навігація",saved:"Збережене"},
};

export function activeNavigation(path:string,hash:string):string|undefined {
 if(path==='/' && hash==='#home-destinations' || path==='/destinations' || path.startsWith('/destinations/'))return '/destinations';
 if(path==='/tanie-loty-na-weekend')return path;
 if(path==='/saved' || path==='/info/trip-budget')return path;
 if(['/deals','/from','/routes'].some(base=>path===base || path.startsWith(base+'/')) || path==='/city-break')return '/deals';
}
