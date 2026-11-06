import type {Locale} from './config.ts';
import type {BudgetOriginKind} from '../budget-provenance.ts';
type Copy=Record<BudgetOriginKind,string>&{details:string;recorded:string;offer:string;reference:string;rate:string;quantity:string;dateUnknown:string;note:string;changed:string};
export const budgetOriginCopy:Record<Locale,Copy>={
 pl:{UNKNOWN:'Nieznane',INVALID:'Wymaga poprawy',MANUAL:'Własna kwota — do weryfikacji',OFFER:'Skopiowana obserwacja ceny lotu — nie cena na żywo',REFERENCE:'Założenie według taryfy referencyjnej — do weryfikacji',
  details:'Pochodzenie kwoty',recorded:'Zapisana data ceny',offer:'Zapisana oferta lotu',reference:'Źródło taryfy',rate:'Zapisany kurs EUR/PLN',quantity:'Liczba biletów na osobę',dateUnknown:'Data nieznana',
  note:'To pochodzenie zapisane w planie, nie potwierdzenie aktualności ceny, dostępności ani autentyczności otrzymanej kopii. Ręczna edycja kwoty zastępuje to oznaczenie własnym szacunkiem.',
  changed:'Plan zmienił się podczas przeliczania. Nie wpisaliśmy kwoty. Sprawdź plan i spróbuj ponownie.'},
 en:{UNKNOWN:'Unknown',INVALID:'Needs correction',MANUAL:'Your amount — verify it',OFFER:'Copied flight price observation — not a live price',REFERENCE:'Assumption from a reference fare — verify it',
  details:'Amount origin',recorded:'Recorded price date',offer:'Saved flight offer',reference:'Fare source',rate:'Recorded EUR/PLN rate',quantity:'Tickets per person',dateUnknown:'Date unknown',
  note:'This is the origin recorded in the plan, not confirmation of current price, availability or the authenticity of a received copy. Editing the amount replaces this label with your own estimate.',
  changed:'The plan changed during conversion. No amount was entered. Check the plan and try again.'},
 ru:{UNKNOWN:'Неизвестно',INVALID:'Нужно исправить',MANUAL:'Ваша сумма — требует проверки',OFFER:'Скопированная запись цены перелёта — не цена в реальном времени',REFERENCE:'Допущение по справочному тарифу — требует проверки',
  details:'Происхождение суммы',recorded:'Записанная дата цены',offer:'Сохранённое предложение перелёта',reference:'Источник тарифа',rate:'Записанный курс EUR/PLN',quantity:'Билетов на человека',dateUnknown:'Дата неизвестна',
  note:'Это происхождение, записанное в плане, а не подтверждение актуальности цены, наличия или подлинности полученной копии. Ручное изменение суммы заменяет эту отметку вашей оценкой.',
  changed:'План изменился во время пересчёта. Сумма не добавлена. Проверьте план и попробуйте ещё раз.'},
 uk:{UNKNOWN:'Невідомо',INVALID:'Потрібно виправити',MANUAL:'Ваша сума — потребує перевірки',OFFER:'Скопійований запис ціни перельоту — не ціна в реальному часі',REFERENCE:'Припущення за довідковим тарифом — потребує перевірки',
  details:'Походження суми',recorded:'Записана дата ціни',offer:'Збережена пропозиція перельоту',reference:'Джерело тарифу',rate:'Записаний курс EUR/PLN',quantity:'Квитків на людину',dateUnknown:'Дата невідома',
  note:'Це походження, записане в плані, а не підтвердження актуальності ціни, наявності чи справжності отриманої копії. Ручна зміна суми замінює цю позначку вашою оцінкою.',
  changed:'План змінився під час перерахунку. Суму не додано. Перевірте план і спробуйте ще раз.'},
};
