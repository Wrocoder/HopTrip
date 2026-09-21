from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Airport(Base):
    __tablename__ = "airports"
    __table_args__ = (UniqueConstraint("iata_code", name="uq_airports_iata_code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    iata_code: Mapped[str] = mapped_column(String(3), index=True)
    name: Mapped[str] = mapped_column(String(200))
    city: Mapped[str] = mapped_column(String(120), index=True)
    country_code: Mapped[str] = mapped_column(String(2), index=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    timezone: Mapped[str | None] = mapped_column(String(64))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Destination(Base):
    __tablename__ = "destinations"
    __table_args__ = (UniqueConstraint("slug", name="uq_destinations_slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    city: Mapped[str] = mapped_column(String(120), index=True)
    country: Mapped[str] = mapped_column(String(120))
    country_code: Mapped[str] = mapped_column(String(2), index=True)
    iata_code: Mapped[str | None] = mapped_column(String(3), index=True)
    slug: Mapped[str] = mapped_column(String(160), index=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    timezone: Mapped[str | None] = mapped_column(String(64))
    destination_type: Mapped[str] = mapped_column(String(40), default="CITY", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class DestinationAlias(Base):
    __tablename__ = "destination_aliases"
    __table_args__ = (
        UniqueConstraint("provider_code", "code", "kind", name="uq_destination_alias"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    provider_code: Mapped[str] = mapped_column(String(80))
    code: Mapped[str] = mapped_column(String(3))
    kind: Mapped[str] = mapped_column(String(8))
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id"))
