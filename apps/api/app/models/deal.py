from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Deal(Base):
    __tablename__ = "deals"
    __table_args__ = (
        Index("ix_deals_discovery", "origin_airport_id", "trip_start", "is_visible", "deal_score"),
        Index("ix_deals_freshness", "expires_at", "is_visible"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    depart_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    score_version: Mapped[str] = mapped_column(String(32), default="flight-v2", nullable=False)
    score_components: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    explanation_codes: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    origin_airport_id: Mapped[int] = mapped_column(ForeignKey("airports.id"), index=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id"), index=True)
    trip_start: Mapped[date] = mapped_column(Date, index=True)
    trip_end: Mapped[date] = mapped_column(Date)
    nights: Mapped[int | None] = mapped_column(Integer)
    travelers: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    flight_price_pln: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    hotel_price_pln: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    other_costs_pln: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    total_estimated_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    price_per_person_pln: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    historical_baseline_pln: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    discount_percent: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    deal_score: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False)
    explanation: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DealComponent(Base):
    __tablename__ = "deal_components"
    __table_args__ = (Index("ix_deal_components_deal", "deal_id", "component_type"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    affiliate_program_id: Mapped[int | None] = mapped_column(ForeignKey("affiliate_programs.id"))
    deal_id: Mapped[int] = mapped_column(ForeignKey("deals.id", ondelete="CASCADE"), index=True)
    travel_offer_id: Mapped[int | None] = mapped_column(ForeignKey("travel_offers.id"), index=True)
    component_type: Mapped[str] = mapped_column(String(32), nullable=False)
    price_pln: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    label: Mapped[str | None] = mapped_column(String(160))
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
