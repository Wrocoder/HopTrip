import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">HopTrip</p>
        <h1>Znajdź tani wyjazd z Polski, nie tylko tani lot.</h1>
        <p className="lead">
          Budujemy przejrzyste okazje podróżnicze na podstawie rzeczywistych cen i historii ofert.
        </p>
        <Link className="selector" href="/deals" aria-label="Otwórz listę okazji">
          <span>Skąd lecisz?</span>
          <strong>Zobacz aktualne okazje →</strong>
        </Link>
      </section>
      <section className="empty-state">
        <h2>Najlepsze okazje pojawią się tutaj</h2>
        <p>Źródła danych są właśnie konfigurowane. Nie pokazujemy zmyślonych cen.</p>
      </section>
      <section className="route-links">
        <h2>Popularne lotniska w Polsce</h2>
        <div className="route-link-grid">
          <Link href="/from/WRO">Wrocław (WRO)</Link>
          <Link href="/from/WAW">Warszawa (WAW)</Link>
          <Link href="/from/KRK">Kraków (KRK)</Link>
          <Link href="/from/GDN">Gdańsk (GDN)</Link>
        </div>
      </section>
      <section className="route-links">
        <h2>Popularne kierunki</h2>
        <div className="route-link-grid">
          <Link href="/destinations/barcelona">Barcelona</Link>
          <Link href="/destinations/rome">Rzym</Link>
          <Link href="/destinations/lisbon">Lizbona</Link>
          <Link href="/destinations/athens">Ateny</Link>
        </div>
      </section>
    </main>
  );
}
