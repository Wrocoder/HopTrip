from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Index, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AffiliateConversion(Base):
    __tablename__ = "affiliate_conversions"
    __table_args__ = (
        UniqueConstraint(
            "provider_code",
            "provider_conversion_id",
            name="uq_affiliate_conversions_provider_id",
        ),
        Index("ix_affiliate_conversions_status_created", "status", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_code: Mapped[str] = mapped_column(String(80), index=True)
    program_code: Mapped[str | None] = mapped_column(String(80), index=True)
    provider_conversion_id: Mapped[str] = mapped_column(String(160))
    click_id: Mapped[int | None] = mapped_column(ForeignKey("affiliate_clicks.id"), index=True)
    deal_id: Mapped[int | None] = mapped_column(ForeignKey("deals.id"), index=True)
    booking_category: Mapped[str] = mapped_column(String(40))
    booking_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    commission: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="PLN")
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
