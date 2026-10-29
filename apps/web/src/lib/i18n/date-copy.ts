import type {Locale} from './config.ts';

export const dateCopy:Record<Locale,{invalid:string}>={
 pl:{invalid:'Wpisz poprawną datę z czterocyfrowym rokiem (0001–9999).'},
 en:{invalid:'Enter a valid date with a four-digit year (0001–9999).'},
 ru:{invalid:'Укажите корректную дату с четырёхзначным годом (0001–9999).'},
 uk:{invalid:'Укажіть коректну дату з чотиризначним роком (0001–9999).'},
};
