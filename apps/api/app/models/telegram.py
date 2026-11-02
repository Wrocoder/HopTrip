from datetime import datetime

from sqlalchemy import JSON, BigInteger, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TelegramSubscription(Base):
    __tablename__ = 'telegram_subscriptions'

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    chat_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    user_id: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(16), index=True)
    locale: Mapped[str] = mapped_column(String(2))
    filters: Mapped[dict] = mapped_column(JSON)
    consent_version: Mapped[str | None] = mapped_column(String(40))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    opted_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    stopped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_digest_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_update_id: Mapped[int] = mapped_column(BigInteger)


class TelegramUpdate(Base):
    __tablename__ = 'telegram_updates'

    update_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    chat_id: Mapped[int] = mapped_column(BigInteger, index=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class TelegramDelivery(Base):
    __tablename__ = 'telegram_deliveries'

    id: Mapped[int] = mapped_column(primary_key=True)
    subscription_id: Mapped[str | None] = mapped_column(
        ForeignKey('telegram_subscriptions.id', ondelete='CASCADE'), index=True,
    )
    chat_id: Mapped[int] = mapped_column(BigInteger, index=True)
    kind: Mapped[str] = mapped_column(String(8))
    status: Mapped[str] = mapped_column(String(16), index=True)
    deal_ids: Mapped[list] = mapped_column(JSON)
    filters: Mapped[dict | None] = mapped_column(JSON)
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    attempted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    attempts: Mapped[int] = mapped_column(default=0)
