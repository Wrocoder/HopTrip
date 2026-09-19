from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AffiliateClick(Base):
    __tablename__ = "affiliate_clicks"
    __table_args__ = (
        Index("ix_affiliate_clicks_deal_created", "deal_id", "created_at"),
        Index("ix_affiliate_clicks_status_created", "status", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    deal_id: Mapped[int] = mapped_column(ForeignKey("deals.id"), index=True)
    component_type: Mapped[str] = mapped_column(String(40))
    anonymous_session_id: Mapped[str] = mapped_column(String(120), index=True)
    source: Mapped[str | None] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    outbound_host: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
