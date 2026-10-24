from datetime import date, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LocalEvent(Base):
    __tablename__ = 'events'
    __table_args__ = (
        UniqueConstraint('source', 'external_id', name='uq_events_source_external'),
        Index('ix_events_destination_dates', 'destination_id', 'start_date', 'end_date'),
        Index('ix_events_checked', 'checked_at'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(40), default='ticketmaster')
    external_id: Mapped[str] = mapped_column(String(200))
    destination_id: Mapped[int] = mapped_column(ForeignKey('destinations.id'))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    category: Mapped[str] = mapped_column(String(20))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Only normalized, validated public fields. Never store provider responses or API keys.
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class EventWindow(Base):
    __tablename__ = 'event_sync_windows'
    __table_args__ = (
        UniqueConstraint('destination_id', 'start_date', 'end_date', name='uq_event_sync_window'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey('destinations.id'))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20))
