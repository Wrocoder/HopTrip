export const pl = {
  title: "HopTrip — okazje lotnicze z Polski",
  description: "Porównuj ceny lotów z historią trasy i sprawdzaj świeżość danych.",
  home: "Strona główna", deals: "Aktualne okazje", empty: "Brak aktualnych ofert dla wybranych warunków.",
  error: "Nie udało się pobrać ofert. Spróbuj ponownie za chwilę.",
  invalid: "Sprawdź lotnisko, kierunek oraz zakres dat, budżetu i długości pobytu.",
  heading: "Dokąd polecisz z Polski?", from: "Skąd", to: "Dokąd", budget: "Budżet na lot / osobę (PLN)",
  departure_from: "Wylot od", departure_to: "Wylot do", duration_min: "Pobyt od (dni)", duration_max: "Pobyt do (dni)",
  filter: "Filtruj", next: "Następna strona", previous: "Poprzednia strona",
  perPerson: "za osobę", roundTrip: "W obie strony", oneWay: "W jedną stronę",
  flightOnly: "Cena obejmuje lot. Nocleg, bagaż dodatkowy i dojazdy nie są uwzględnione.",
  cached: "Cena pochodzi z zapisanej obserwacji. Dostępność i ostateczną cenę sprawdzisz u partnera.",
  checked: "Ostatnia obserwacja", why: "Jak oceniamy ofertę", score: "Ocena",
  cta: "Sprawdź ofertę u partnera", noLink: "Link do rezerwacji nie jest jeszcze dostępny.",
  disclosure: "Link partnerski: możemy otrzymać prowizję po dokonaniu rezerwacji. Nie sprzedajemy biletów.",
  airports: "Lotniska wylotu", destinations: "Kierunki", loading: "Ładowanie ofert…",
  notFound: "Nie znaleziono aktualnej strony lub oferta wygasła.",
  draft: "Wersja robocza — dane operatora wymagają uzupełnienia przed publikacją.",
  retry: "Spróbuj ponownie", about: "O HopTrip", contact: "Kontakt", privacy: "Prywatność",
  terms: "Zasady korzystania", partners: "Współpraca partnerska",
  routeIntro: "Sprawdź daty i lotnisko przed zakupem. Porównuj oferty o podobnej długości pobytu. Niska cena lotu nie oznacza niskiego kosztu całej podróży.",
  explanations: {
    BELOW_MEDIAN: "Cena poniżej mediany zapisanych obserwacji tej trasy.",
    HISTORY_AVAILABLE: "Dostępna historia cen wspiera porównanie.",
    LIMITED_HISTORY: "Historia cen jest ograniczona; porównanie ma niższą pewność.",
    CACHED_PRICE: "Cena z pamięci podręcznej, wymaga sprawdzenia u sprzedawcy.",
    CONVENIENCE_UNKNOWN: "Nie mamy pełnych danych o wygodzie lotu; ocena tej części jest neutralna.",
  } as Record<string,string>,
};
export function money(value: string | null): string {
  if (value === null || !/^-?\d+(\.\d+)?$/.test(value)) return "—";
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("pl-PL", {style:"currency",currency:"PLN"}).format(number) : "—";
}
export function date(value: string): string {
  const parsed = new Date(value.length === 10 ? value + "T12:00:00Z" : value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("pl-PL", {timeZone:"Europe/Warsaw",dateStyle:"medium"}).format(parsed);
}
