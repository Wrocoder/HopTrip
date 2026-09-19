from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TravelOffer(Base):
    __tablename__ = "travel_offers"
    __table_args__ = (
        Index("ix_travel_offers_search", "origin_airport_id", "destination_id", "depart_at"),
        Index("ix_travel_offers_freshness", "expires_at", "last_verified_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    data_provider_id: Mapped[int] = mapped_column(ForeignKey("data_providers.id"), index=True)
    external_id: Mapped[str] = mapped_column(String(240), index=True)
    product_type: Mapped[str] = mapped_column(String(32), default="FLIGHT", nullable=False)
    origin_airport_id: Mapped[int | None] = mapped_column(ForeignKey("airports.id"), index=True)
    destination_id: Mapped[int | None] = mapped_column(ForeignKey("destinations.id"), index=True)
    depart_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    return_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    original_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    original_currency: Mapped[str] = mapped_column(String(3))
    price_pln: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    exchange_rate: Mapped[Decimal | None] = mapped_column(Numeric(16, 8))
    exchange_rate_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source: Mapped[str] = mapped_column(String(80))
    raw_payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PriceObservation(Base):
    __tablename__ = "price_observations"
    __table_args__ = (
        Index("ix_price_observations_route_date", "origin_airport_id", "destination_id", "departure_date"),
        Index("ix_price_observations_observed_at", "observed_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    data_provider_id: Mapped[int] = mapped_column(ForeignKey("data_providers.id"), index=True)
    origin_airport_id: Mapped[int | None] = mapped_column(ForeignKey("airports.id"), index=True)
    destination_id: Mapped[int | None] = mapped_column(ForeignKey("destinations.id"), index=True)
    product_type: Mapped[str] = mapped_column(String(32), default="FLIGHT", nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, index=True)
    trip_duration_days: Mapped[int | None] = mapped_column(Integer)
    observed_price_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    original_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    original_currency: Mapped[str] = mapped_column(String(3))
    source: Mapped[str] = mapped_column(String(80))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
