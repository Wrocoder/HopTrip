from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RouteStatistics(Base):
    __tablename__ = "route_statistics"
    __table_args__ = (
        UniqueConstraint(
            "data_provider_id",
            "origin_airport_id",
            "destination_id",
            "product_type",
            "departure_month",
            "trip_duration_days",
            name="uq_route_statistics_bucket",
        ),
        Index(
            "ix_route_statistics_route", "origin_airport_id", "destination_id", "departure_month"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    data_provider_id: Mapped[int] = mapped_column(ForeignKey("data_providers.id"), index=True)
    origin_airport_id: Mapped[int] = mapped_column(ForeignKey("airports.id"), index=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id"), index=True)
    product_type: Mapped[str] = mapped_column(String(32), default="FLIGHT", nullable=False)
    departure_month: Mapped[str] = mapped_column(String(7), index=True)
    trip_duration_days: Mapped[int | None] = mapped_column(Integer)
    sample_count: Mapped[int] = mapped_column(Integer, nullable=False)
    min_price_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    p25_price_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    median_price_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    p75_price_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    max_price_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


Index(
    "uq_route_statistics_duration",
    RouteStatistics.data_provider_id,
    RouteStatistics.origin_airport_id,
    RouteStatistics.destination_id,
    RouteStatistics.product_type,
    RouteStatistics.departure_month,
    func.coalesce(RouteStatistics.trip_duration_days, -1),
    unique=True,
)
