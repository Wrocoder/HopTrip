import type {Locale} from './config';

export const flightRouteCopy = {
 pl:{unknown:'Sprawdź lotniska powrotu u partnera przed zaplanowaniem transferu.',
  departure:'Powrót z innego lotniska: {back} (przylot: {out}).',
  arrival:'Powrót do innego lotniska: {back} (wylot: {out}).',
  connections:'Poszczególne loty',returnCarrier:'Przewoźnik powrotny do sprawdzenia'},
 en:{unknown:'Check the return airports with the partner before planning transfers.',
  departure:'Return from a different airport: {back} (arrival: {out}).',
  arrival:'Return to a different airport: {back} (departure: {out}).',
  connections:'Individual flights',returnCarrier:'Check the return airline'},
 ru:{unknown:'Уточните аэропорты обратного рейса у партнёра перед планированием трансфера.',
  departure:'Обратно из другого аэропорта: {back} (прилёт: {out}).',
  arrival:'Возвращение в другой аэропорт: {back} (вылет: {out}).',
  connections:'Отдельные рейсы',returnCarrier:'Перевозчика обратно нужно уточнить'},
 uk:{unknown:'Уточніть аеропорти зворотного рейсу в партнера перед плануванням трансферу.',
  departure:'Назад з іншого аеропорту: {back} (приліт: {out}).',
  arrival:'Повернення до іншого аеропорту: {back} (виліт: {out}).',
  connections:'Окремі рейси',returnCarrier:'Зворотного перевізника потрібно уточнити'},
} satisfies Record<Locale,Record<string,string>>;
