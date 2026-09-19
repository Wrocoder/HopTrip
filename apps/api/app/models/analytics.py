from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    __table_args__ = (
        Index("ix_analytics_events_name_created", "event_name", "created_at"),
        Index("ix_analytics_events_session_created", "anonymous_session_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_name: Mapped[str] = mapped_column(String(40), index=True)
    anonymous_session_id: Mapped[str] = mapped_column(String(120), index=True)
    deal_id: Mapped[int | None] = mapped_column(ForeignKey("deals.id"), index=True)
    component: Mapped[str | None] = mapped_column(String(40))
    source: Mapped[str | None] = mapped_column(String(80))
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
