from datetime import UTC, datetime
from secrets import compare_digest

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.affiliate import AffiliateProgram, AffiliateProvider, OnboardingStatus
from app.models.affiliate_click import AffiliateClick
from app.models.conversion import AffiliateConversion
from app.models.deal import Deal, DealComponent
from app.models.job import JobRun
from app.schemas.affiliate import (
    OnboardingUpdate,
    ProgramRead,
    ProviderHealthUpdate,
    ProviderRead,
    ProviderUpdate,
    SystemStatusRead,
)
from app.schemas.conversion import ConversionCreate, ConversionRead, ConversionUpsertResponse
from app.schemas.job import JobRunRead
from app.schemas.management import ComponentUpdate, DealUpdate, ProgramCreate, ProgramUpdate

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    if not x_admin_token or not compare_digest(
        x_admin_token.encode(), get_settings().admin_token.encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid admin token")


@router.get(
    "/system/status",
    response_model=SystemStatusRead,
    dependencies=[Depends(require_admin)],
)
def system_status(db: Session = Depends(get_db)) -> SystemStatusRead:
    settings = get_settings()
    from app.services.affiliate import component_policy

    policies = [component_policy(db, c) for c in db.scalars(select(DealComponent))]
    enabled = [p for p in policies if p.available]
    token = bool(settings.travelpayouts_api_token)
    blockers = [] if token else ["TRAVELPAYOUTS_API_TOKEN is not configured"]
    if not enabled:
        blockers.append("No component has an approved configured affiliate program")
    tracking = any(p.program and p.program.tracking_param for p in enabled)
    return SystemStatusRead(
        status="READY" if token and enabled else "BLOCKED",
        app_env=settings.app_env,
        provider_token_configured=token,
        affiliate_hosts_configured=bool(enabled),
        affiliate_tracking_configured=tracking,
        blockers=blockers,
        warnings=[] if tracking else ["No enabled program has SubID tracking"],
        website_status="READY",
        data_status="CONFIGURED_UNVERIFIED" if token else "NOT_CONFIGURED",
        monetization_status="CONFIGURED_UNVERIFIED" if enabled else "NOT_CONFIGURED",
    )


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
    payload: ProgramUpdate,
    db: Session = Depends(get_db),
) -> AffiliateProgram:
    program = db.get(AffiliateProgram, program_id)
    if program is None:
        raise HTTPException(status_code=404, detail="Affiliate program not found")
    _apply_onboarding_update(program, payload)
    for field in ("capabilities_json", "allowed_hosts", "tracking_param", "adapter_code"):
        if field in payload.model_fields_set:
            value = getattr(payload, field)
            if value is None and field != "tracking_param":
                raise HTTPException(422, "Configuration list and adapter cannot be null")
            setattr(program, field, value)
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
def record_conversion(
    payload: ConversionCreate, db: Session = Depends(get_db)
) -> ConversionUpsertResponse:
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
        provider = db.get(AffiliateProvider, click.provider_id) if click.provider_id else None
        if provider is None or provider.code != payload.provider_code:
            raise HTTPException(400, "Click provider does not match conversion")
        program = db.get(AffiliateProgram, click.program_id) if click.program_id else None
        if payload.program_code and (not program or program.code != payload.program_code):
            raise HTTPException(400, "Click program does not match conversion")
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
    if payload.program_code is not None:
        conversion.program_code = payload.program_code
    if click_id is not None:
        if existing and existing.click_id not in (None, click_id):
            raise HTTPException(409, "Conversion already attributed to another click")
        conversion.click_id = click_id
    if deal_id is not None:
        if existing and existing.deal_id not in (None, deal_id):
            raise HTTPException(409, "Conversion already attributed to another deal")
        conversion.deal_id = deal_id
    for field in (
        "booking_category",
        "booking_value",
        "commission",
        "currency",
        "status",
        "occurred_at",
        "confirmed_at",
    ):
        if created or field in payload.model_fields_set:
            setattr(conversion, field, getattr(payload, field))
    if created or "metadata" in payload.model_fields_set:
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


@router.post("/programs", response_model=ProgramRead, dependencies=[Depends(require_admin)])
def create_program(payload: ProgramCreate, db: Session = Depends(get_db)):
    if not db.get(AffiliateProvider, payload.provider_id):
        raise HTTPException(404, "Provider not found")
    if db.scalar(
        select(AffiliateProgram).where(
            AffiliateProgram.provider_id == payload.provider_id,
            AffiliateProgram.code == payload.code,
        )
    ):
        raise HTTPException(409, "Program already exists")
    program = AffiliateProgram(
        provider_id=payload.provider_id,
        code=payload.code,
        name=payload.name,
        onboarding_status=OnboardingStatus.NOT_CONFIGURED,
        is_active=False,
    )
    db.add(program)
    db.flush()
    return update_program(program.id, payload, db)


@router.get("/deals", dependencies=[Depends(require_admin)])
def moderation_list(q: str = "", limit: int = 50, db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Deal)
        .where(Deal.slug.contains(q[:220]))
        .order_by(Deal.id.desc())
        .limit(max(1, min(limit, 100)))
    )
    return [
        dict(
            id=d.id,
            slug=d.slug,
            status=d.status,
            is_visible=d.is_visible,
            is_featured=d.is_featured,
            score_version=d.score_version,
            score_components=d.score_components,
            confidence=str(d.confidence),
            components=[
                {
                    "id": component.id,
                    "component_type": component.component_type,
                    "affiliate_program_id": component.affiliate_program_id,
                }
                for component in db.scalars(
                    select(DealComponent).where(DealComponent.deal_id == d.id)
                )
            ],
        )
        for d in rows
    ]


@router.patch("/deals/{deal_id}", dependencies=[Depends(require_admin)])
def moderate_deal(deal_id: int, payload: DealUpdate, db: Session = Depends(get_db)):
    deal = db.get(Deal, deal_id)
    if not deal:
        raise HTTPException(404, "Deal not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(deal, field, value)
    db.commit()
    return {"id": deal.id, "is_visible": deal.is_visible, "is_featured": deal.is_featured}


@router.patch("/components/{component_id}", dependencies=[Depends(require_admin)])
def configure_component(component_id: int, payload: ComponentUpdate, db: Session = Depends(get_db)):
    component = db.get(DealComponent, component_id)
    if not component:
        raise HTTPException(404, "Component not found")
    if payload.affiliate_program_id and not db.get(AffiliateProgram, payload.affiliate_program_id):
        raise HTTPException(404, "Program not found")
    if "affiliate_program_id" in payload.model_fields_set:
        component.affiliate_program_id = payload.affiliate_program_id
    if "outbound_url" in payload.model_fields_set:
        component.metadata_json = {**component.metadata_json, "outbound_url": payload.outbound_url}
    db.commit()
    from app.services.affiliate import component_policy

    policy = component_policy(db, component)
    return {"id": component.id, "available": policy.available, "reason": policy.reason}
