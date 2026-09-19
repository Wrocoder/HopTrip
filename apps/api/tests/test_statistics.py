from datetime import UTC, datetime
from decimal import Decimal

from app.db.base import Base
from app.models.data_provider import DataProvider
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation
from app.models.statistics import RouteStatistics
from app.services.statistics import recalculate_route_statistics
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session


def test_route_statistics_calculates_explainable_baseline() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        provider = DataProvider(code="test_data", name="Test")
        airport = Airport(iata_code="WRO", name="Wroclaw", city="Wroclaw", country_code="PL")
        destination = Destination(
            iata_code="BCN", city="Barcelona", country="Spain", country_code="ES", slug="barcelona"
        )
        db.add_all([provider, airport, destination])
        db.flush()
        for price in [100, 200, 300, 400, 500]:
            db.add(
                PriceObservation(
                    data_provider_id=provider.id,
                    origin_airport_id=airport.id,
                    destination_id=destination.id,
                    departure_date=datetime(2026, 10, 18, tzinfo=UTC).date(),
                    observed_price_pln=Decimal(price),
                    original_price=Decimal(price),
                    original_currency="PLN",
                    source="test_data",
                )
            )
        db.commit()

        assert recalculate_route_statistics(db) == 1
        stats = db.scalar(select(RouteStatistics))
        assert stats is not None
        assert stats.sample_count == 5
        assert stats.median_price_pln == Decimal("300.00")
        assert stats.p25_price_pln == Decimal("200.00")
        assert stats.p75_price_pln == Decimal("400.00")
        assert stats.confidence == Decimal("0.1667")
