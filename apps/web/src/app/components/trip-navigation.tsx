export function TripNavigation({hasAccommodation=true}:{hasAccommodation?:boolean}) {
 return <nav className="trip-navigation" aria-label="Sekcje planu podróży">
  <a href="#trip-flight">Lot</a>
  {hasAccommodation && <a href="#accommodation">Nocleg</a>}
  <a href="#calculator">Budżet</a>
  <a href="#trip-save">Zapisz</a>
 </nav>;
}
