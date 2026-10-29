"""Private editorial records. There is intentionally no delivery queue in SOC-02."""
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EditorSession(Base):
    __tablename__ = "editor_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    csrf_token: Mapped[str] = mapped_column(String(64))
    owner: Mapped[str] = mapped_column(String(100))
    credential_hash: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class EditorialItem(Base):
    __tablename__ = "editorial_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(20))
    source: Mapped[dict] = mapped_column(JSON)
    version: Mapped[int] = mapped_column(default=1)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class EditorialRevision(Base):
    __tablename__ = "editorial_revisions"
    __table_args__ = (UniqueConstraint("item_id", "version", name="uq_editorial_revision"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("editorial_items.id"), index=True)
    version: Mapped[int]
    snapshot: Mapped[dict] = mapped_column(JSON)
    variants: Mapped[dict] = mapped_column(JSON)
    artifacts: Mapped[dict] = mapped_column(JSON)
    checksum: Mapped[str] = mapped_column(String(64))
    owner: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class EditorialAudit(Base):
    __tablename__ = "editorial_audit"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("editorial_items.id"), index=True)
    version: Mapped[int]
    action: Mapped[str] = mapped_column(String(30))
    owner: Mapped[str] = mapped_column(String(100))
    details: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class EditorialApproval(Base):
    __tablename__ = "editorial_approvals"
    __table_args__ = (UniqueConstraint("item_id", "version", name="uq_editorial_approval"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("editorial_items.id"))
    version: Mapped[int]
    channels: Mapped[list] = mapped_column(JSON)
    checksum: Mapped[str] = mapped_column(String(64))
    owner: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
