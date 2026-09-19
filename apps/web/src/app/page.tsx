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
    </main>
  );
}
