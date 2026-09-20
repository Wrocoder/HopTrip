from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OnboardingStatus(StrEnum):
    NOT_CONFIGURED = "NOT_CONFIGURED"
    APPLICATION_PLANNED = "APPLICATION_PLANNED"
    APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"
    DISABLED = "DISABLED"


class ProviderCapability(StrEnum):
    AFFILIATE_LINK = "AFFILIATE_LINK"
    DEEP_LINK = "DEEP_LINK"
    SEARCH_API = "SEARCH_API"
    PRICE_API = "PRICE_API"
    BOOKING_API = "BOOKING_API"
    CONVERSION_API = "CONVERSION_API"
    WEBHOOK = "WEBHOOK"
    PRODUCT_FEED = "PRODUCT_FEED"


class AffiliateProvider(Base):
    __tablename__ = "affiliate_providers"
    __table_args__ = (UniqueConstraint("code", name="uq_affiliate_providers_code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(160))
    onboarding_status: Mapped[OnboardingStatus] = mapped_column(
        String(32), default=OnboardingStatus.NOT_CONFIGURED, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    website_url: Mapped[str | None] = mapped_column(String(500))
    configuration_ref: Mapped[str | None] = mapped_column(String(200))
    capabilities_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    last_health_check: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_health_check_error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    @property
    def capabilities(self) -> list[str]:
        return self.capabilities_json


class AffiliateProgram(Base):
    __tablename__ = "affiliate_programs"
    __table_args__ = (UniqueConstraint("provider_id", "code", name="uq_program_provider_code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("affiliate_providers.id"), index=True)
    code: Mapped[str] = mapped_column(String(80))
    name: Mapped[str] = mapped_column(String(160))
    onboarding_status: Mapped[OnboardingStatus] = mapped_column(
        String(32), default=OnboardingStatus.NOT_CONFIGURED, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    applied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
