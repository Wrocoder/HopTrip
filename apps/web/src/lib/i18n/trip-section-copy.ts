import type {Locale} from './config';

export const tripSectionCopy={
 pl:{flight:'Lot i rezerwacja',stay:'Nocleg i atrakcje',budget:'Budżet całej podróży',save:'Zapisz i udostępnij',unavailable:'Oferta jest niedostępna do planowania noclegu i atrakcji. Wpisane koszty i wydarzenia pozostają w budżecie.'},
 en:{flight:'Flight and booking',stay:'Accommodation and activities',budget:'Total trip budget',save:'Save and share',unavailable:'The offer is unavailable for accommodation and activity planning. Entered costs and events remain in the budget.'},
 ru:{flight:'Перелёт и бронирование',stay:'Жильё и досуг',budget:'Бюджет всей поездки',save:'Сохранить и поделиться',unavailable:'Предложение недоступно для планирования жилья и досуга. Введённые расходы и события остаются в бюджете.'},
 uk:{flight:'Переліт і бронювання',stay:'Житло й дозвілля',budget:'Бюджет усієї подорожі',save:'Зберегти й поділитися',unavailable:'Пропозиція недоступна для планування житла й дозвілля. Введені витрати й події залишаються в бюджеті.'},
} satisfies Record<Locale,{flight:string;stay:string;budget:string;save:string;unavailable:string}>;
