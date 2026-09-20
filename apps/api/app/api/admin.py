from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.affiliate import AffiliateProgram, AffiliateProvider, OnboardingStatus
from app.models.affiliate_click import AffiliateClick
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal
from app.models.job import JobRun
from app.schemas.affiliate import (
    OnboardingUpdate,
    ProgramRead,
    ProviderHealthUpdate,
    ProviderRead,
    ProviderUpdate,
)
from app.schemas.conversion import ConversionCreate, ConversionRead, ConversionUpsertResponse
from app.schemas.job import JobRunRead

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    if x_admin_token != get_settings().admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")


@router.get("/providers", response_model=list[ProviderRead], dependencies=[Depends(require_admin)])
def list_providers(db: Session = Depends(get_db)) -> list[AffiliateProvider]:
    return list(db.scalars(select(AffiliateProvider).order_by(AffiliateProvider.priority)).all())


@router.get("/programs", response_model=list[ProgramRead], dependencies=[Depends(require_admin)])
def list_programs(db: Session = Depends(get_db)) -> list[AffiliateProgram]:
    return list(db.scalars(select(AffiliateProgram).order_by(AffiliateProgram.provider_id)).all())


def _apply_onboarding_update(
    entity: AffiliateProvider | AffiliateProgram,
    payload: OnboardingUpdate,
) -> None:
    if payload.onboarding_status is not None:
        entity.onboarding_status = payload.onboarding_status
        now = datetime.now(UTC)
        if isinstance(entity, AffiliateProgram):
            if (
                payload.onboarding_status == OnboardingStatus.APPLICATION_SUBMITTED
                and entity.applied_at is None
            ):
                entity.applied_at = now
            if payload.onboarding_status == OnboardingStatus.APPROVED:
                entity.approved_at = now
        if payload.onboarding_status != OnboardingStatus.APPROVED:
            entity.is_active = False
    if payload.is_active is not None:
        if payload.is_active and entity.onboarding_status != OnboardingStatus.APPROVED:
            raise HTTPException(status_code=400, detail="Only approved affiliates can be enabled")
        entity.is_active = payload.is_active
    if "notes" in payload.model_fields_set:
        entity.notes = payload.notes


@router.patch(
    "/providers/{provider_id}",
    response_model=ProviderRead,
    dependencies=[Depends(require_admin)],
)
def update_provider(
    provider_id: int,
    payload: ProviderUpdate,
    db: Session = Depends(get_db),
) -> AffiliateProvider:
    provider = db.get(AffiliateProvider, provider_id)
    if provider is None:
        raise HTTPException(status_code=404, detail="Affiliate provider not found")
    _apply_onboarding_update(provider, payload)
    if payload.capabilities is not None:
        provider.capabilities_json = [capability.value for capability in payload.capabilities]
    db.commit()
    db.refresh(provider)
    return provider


@router.post(
    "/providers/{provider_id}/health",
    response_model=ProviderRead,
    dependencies=[Depends(require_admin)],
)
def record_provider_health(
    provider_id: int,
    payload: ProviderHealthUpdate,
    db: Session = Depends(get_db),
) -> AffiliateProvider:
    provider = db.get(AffiliateProvider, provider_id)
    if provider is None:
        raise HTTPException(status_code=404, detail="Affiliate provider not found")
    if not payload.success and not payload.error:
        raise HTTPException(status_code=422, detail="A failed health check requires an error")
    checked_at = payload.checked_at or datetime.now(UTC)
    if checked_at.tzinfo is None:
        checked_at = checked_at.replace(tzinfo=UTC)
    provider.last_health_check = checked_at
    provider.last_health_check_error = None if payload.success else payload.error
    db.commit()
    db.refresh(provider)
    return provider


@router.patch(
    "/programs/{program_id}",
    response_model=ProgramRead,
    dependencies=[Depends(require_admin)],
)
def update_program(
    program_id: int,
    payload: OnboardingUpdate,
    db: Session = Depends(get_db),
) -> AffiliateProgram:
    program = db.get(AffiliateProgram, program_id)
    if program is None:
        raise HTTPException(status_code=404, detail="Affiliate program not found")
    _apply_onboarding_update(program, payload)
    db.commit()
    db.refresh(program)
    return program


@router.get("/jobs", response_model=list[JobRunRead], dependencies=[Depends(require_admin)])
def list_jobs(db: Session = Depends(get_db)) -> list[JobRun]:
    return list(db.scalars(select(JobRun).order_by(JobRun.started_at.desc()).limit(50)).all())


@router.post(
    "/conversions",
    response_model=ConversionUpsertResponse,
    status_code=201,
    dependencies=[Depends(require_admin)],
)
def record_conversion(payload: ConversionCreate, db: Session = Depends(get_db)) -> ConversionUpsertResponse:
    deal_id = None
    if payload.deal_slug:
        deal_id = db.scalar(select(Deal.id).where(Deal.slug == payload.deal_slug))
        if deal_id is None:
            raise HTTPException(status_code=404, detail="Deal not found")

    click_id = payload.click_id
    if payload.tracking_id is not None:
        tracked_click = db.scalar(
            select(AffiliateClick).where(AffiliateClick.tracking_id == payload.tracking_id)
        )
        if tracked_click is None:
            raise HTTPException(status_code=404, detail="Affiliate tracking ID not found")
        if click_id is not None and click_id != tracked_click.id:
            raise HTTPException(status_code=400, detail="Tracking ID does not match click")
        click_id = tracked_click.id

    if click_id is not None:
        click = db.get(AffiliateClick, click_id)
        if click is None:
            raise HTTPException(status_code=404, detail="Affiliate click not found")
        if deal_id is not None and click.deal_id != deal_id:
            raise HTTPException(status_code=400, detail="Click does not belong to deal")
        deal_id = deal_id or click.deal_id

    existing = db.scalar(
        select(AffiliateConversion).where(
            AffiliateConversion.provider_code == payload.provider_code,
            AffiliateConversion.provider_conversion_id == payload.provider_conversion_id,
        )
    )
    created = existing is None
    conversion = existing or AffiliateConversion(
        provider_code=payload.provider_code,
        provider_conversion_id=payload.provider_conversion_id,
    )
    conversion.program_code = payload.program_code
    conversion.click_id = click_id
    conversion.deal_id = deal_id
    conversion.booking_category = payload.booking_category
    conversion.booking_value = payload.booking_value
    conversion.commission = payload.commission
    conversion.currency = payload.currency
    conversion.status = payload.status
    conversion.occurred_at = payload.occurred_at
    conversion.confirmed_at = payload.confirmed_at
    conversion.metadata_json = payload.metadata
    if created:
        db.add(conversion)
    db.commit()
    db.refresh(conversion)
    return ConversionUpsertResponse(id=conversion.id, created=created)


@router.get(
    "/conversions",
    response_model=list[ConversionRead],
    dependencies=[Depends(require_admin)],
)
def list_conversions(db: Session = Depends(get_db)) -> list[AffiliateConversion]:
    return list(
        db.scalars(
            select(AffiliateConversion).order_by(AffiliateConversion.created_at.desc()).limit(100)
        ).all()
    )
