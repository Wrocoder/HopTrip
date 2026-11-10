import type {Destination} from './api.ts';
import type {Locale} from './i18n/config.ts';
import {destinationLabel} from './destinations.ts';

// Localized page shell, not newly generated travel advice or an indexation rule.
const copy={
 pl:{title:'{city} — loty z Polski i plan pobytu | HopTrip',description:'Porównaj zapisane oferty lotów z Polski: {city}. Sprawdź lotniska, daty i dojazd oraz zaplanuj nocleg i budżet. Dostępność i cenę potwierdź u partnera.'},
 en:{title:'{city} — flights from Poland and stay planning | HopTrip',description:'Compare recorded flight offers from Poland: {city}. Check airports, dates and transfers, then plan accommodation and your budget. Confirm availability and prices with the partner.'},
 ru:{title:'{city} — перелёты из Польши и план поездки | HopTrip',description:'Сравните сохранённые предложения перелётов из Польши: {city}. Проверьте аэропорты, даты и трансферы, спланируйте жильё и бюджет. Наличие и цену уточните у партнёра.'},
 uk:{title:'{city} — перельоти з Польщі та план подорожі | HopTrip',description:'Порівняйте збережені пропозиції перельотів із Польщі: {city}. Перевірте аеропорти, дати й трансфери, сплануйте житло та бюджет. Наявність і ціну уточніть у партнера.'},
};
export function destinationPresentation(destination:Destination,locale:Locale){
 const city=destinationLabel(destination,locale);
 return {title:copy[locale].title.replace('{city}',city),description:copy[locale].description.replace('{city}',city)};
}
