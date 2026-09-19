from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.affiliate import AffiliateProgram, AffiliateProvider
from app.models.job import JobRun
from app.schemas.affiliate import ProgramRead, ProviderRead
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


@router.get("/jobs", response_model=list[JobRunRead], dependencies=[Depends(require_admin)])
def list_jobs(db: Session = Depends(get_db)) -> list[JobRun]:
    return list(db.scalars(select(JobRun).order_by(JobRun.started_at.desc()).limit(50)).all())
