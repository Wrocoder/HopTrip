"""Private SOC-02 editor. Approvals authorize a dry-run package only."""
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import FileResponse
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.deal import Deal
from app.models.editorial import (
    EditorialApproval,
    EditorialAudit,
    EditorialItem,
    EditorialRehearsal,
    EditorialRevision,
    EditorSession,
)
from app.models.event import LocalEvent
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.editor_auth import digest, verify_password
from app.services.editor_rehearsal import (
    check_job,
    describe_rehearsal,
    invalidate_rehearsals,
    schedule,
)
from app.services.editorial import (
    CHANNELS,
    GUIDES,
    TEXT_LIMIT,
    audit,
    build_artifacts,
    check_revision,
    checksum,
    draft_text,
    now,
    render_text,
    revision_checksum,
    source_snapshot,
    utc,
)

PREFIX = "/api/v1/editor"
COOKIE = "hoptrip_editor"
STATIC = Path(__file__).resolve().parents[1] / "editor"


def enabled():
    if not get_settings().editor_enabled:
        raise HTTPException(404, "Not found")


router = APIRouter(prefix=PREFIX, tags=["private editor"], dependencies=[Depends(enabled)])


def same_origin(request: Request):
    if request.headers.get("origin") != get_settings().editor_origin:
        raise HTTPException(403, "Откройте редактор по настроенному EDITOR_ORIGIN")


def owner(request: Request, db: Session = Depends(get_db)) -> EditorSession:
    settings = get_settings()
    session = db.get(EditorSession, digest(request.cookies.get(COOKIE, "")))
    if (not session or utc(session.expires_at) <= now()
            or session.credential_hash != digest(settings.editor_password_hash.get_secret_value())
            or session.owner != settings.editor_owner):
        raise HTTPException(401, "Войдите в редактор")
    if request.method != "GET":
        same_origin(request)
        if not secrets.compare_digest(request.headers.get("x-csrf-token", ""), session.csrf_token):
            raise HTTPException(403, "Сессия страницы устарела. Обновите страницу")
    return session


class Login(BaseModel):
    password: str = Field(min_length=1, max_length=512)


@router.post("/login")
def login(body: Login, request: Request, response: Response, db: Session = Depends(get_db)):
    same_origin(request)
    settings = get_settings()
    encoded = settings.editor_password_hash.get_secret_value()
    if not verify_password(body.password, encoded):
        raise HTTPException(401, "Неверный пароль")
    token, csrf = secrets.token_urlsafe(32), secrets.token_hex(32)
    db.execute(delete(EditorSession).where(EditorSession.expires_at <= now()))
    db.add(EditorSession(token_hash=digest(token), csrf_token=csrf, owner=settings.editor_owner,
                         credential_hash=digest(encoded), expires_at=now() + timedelta(hours=8)))
    db.commit()
    response.set_cookie(COOKIE, token, httponly=True, secure=settings.editor_origin.startswith("https:"),
                        samesite="strict", path=PREFIX, max_age=8 * 3600)
    return {"owner": settings.editor_owner, "csrf": csrf}


@router.get("/session")
def session_status(session: EditorSession = Depends(owner)):
    return {"owner": session.owner, "csrf": session.csrf_token}


@router.post("/logout")
def logout(response: Response, session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    db.delete(session)
    db.commit()
    response.delete_cookie(COOKIE, path=PREFIX)
    return {"ok": True}


@router.get("/", response_class=FileResponse)
def index():
    return FileResponse(STATIC / "index.html", headers={
        "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; "
        "img-src 'self' blob:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
        "X-Robots-Tag": "noindex, nofollow"})


@router.get("/assets/{name}")
def asset(name: Literal["editor.js", "editor.css"]):
    return FileResponse(STATIC / name)


class Create(BaseModel):
    model_config = ConfigDict(extra="forbid")
    kind: Literal["offer", "guide"]
    deal_id: int | None = None
    event_id: int | None = None
    stay_until: str = Field(default="", max_length=10)
    guide: str = Field(default="baggage", max_length=80)


class Version(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: int = Field(ge=1)


class Edit(Version):
    variants: dict[str, str]
    refresh_source: bool = False

    @model_validator(mode="after")
    def valid_variants(self):
        if set(self.variants) != set(CHANNELS) or any(
                not text.strip() or len(text) > TEXT_LIMIT for text in self.variants.values()):
            raise ValueError(f"Provide all five channel texts, 1–{TEXT_LIMIT} characters each")
        return self


class Approve(Version):
    channels: list[Literal["telegram", "facebook", "instagram", "tiktok", "linkedin"]] = Field(
        min_length=1, max_length=5)


class Rehearse(Version):
    scheduled_at: AwareDatetime | None = None


def load(db: Session, item_id: int) -> tuple[EditorialItem, EditorialRevision]:
    item = db.get(EditorialItem, item_id)
    if not item:
        raise HTTPException(404, "Черновик не найден")
    revision = db.scalar(select(EditorialRevision).where(
        EditorialRevision.item_id == item.id, EditorialRevision.version == item.version))
    assert revision is not None
    return item, revision


def lock(db: Session, item: EditorialItem, version: int):
    # Atomic compare-and-set also works on SQLite. The DB lock lasts through commit.
    result = db.execute(update(EditorialItem).where(
        EditorialItem.id == item.id, EditorialItem.version == version,
    ).values(version=EditorialItem.version).returning(EditorialItem.id).execution_options(synchronize_session=False))
    if result.scalar_one_or_none() is None:
        db.rollback()
        raise HTTPException(409, "Черновик изменён в другой вкладке. Откройте его заново")
    db.refresh(item)


def describe(db: Session, item: EditorialItem, revision: EditorialRevision) -> dict:
    _, issue = check_revision(db, item, revision)
    approval = db.scalar(select(EditorialApproval).where(
        EditorialApproval.item_id == item.id, EditorialApproval.version == item.version))
    valid_approval = (approval and item.status == "APPROVED" and not issue
                      and utc(approval.expires_at) > now() and approval.checksum == revision.checksum)
    return {"id": item.id, "kind": item.kind, "version": item.version,
            "status": "NEEDS_REVIEW" if issue and item.status != "REJECTED" else item.status,
            "snapshot": revision.snapshot, "variants": revision.variants,
            "rendered": {c: render_text(revision, c) for c in CHANNELS},
            "issue": issue, "checksum": revision.checksum,
            "media": {"url": f"{PREFIX}/items/{item.id}/media?version={item.version}",
                      "checksum": checksum(revision.artifacts["media_svg"]), "template": 1,
                      "rights": "HopTrip: собственная SVG-карточка, без сторонних фото"},
            "approved_channels": approval.channels if valid_approval and approval else [],
            "approval_expires_at": utc(approval.expires_at).isoformat() if valid_approval and approval else None,
            "rehearsals": [describe_rehearsal(job) for job in db.scalars(
                select(EditorialRehearsal).where(EditorialRehearsal.item_id == item.id)
                .order_by(EditorialRehearsal.id.desc()).limit(10))],
            "history": [{"version": a.version, "action": a.action, "owner": a.owner,
                         "at": utc(a.created_at).isoformat(), "details": a.details}
                        for a in db.scalars(select(EditorialAudit).where(
                            EditorialAudit.item_id == item.id).order_by(EditorialAudit.id.desc()).limit(100))]}


@router.get("/sources")
def sources(_: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    deals = list(db.scalars(available_deals_query().order_by(Deal.deal_score.desc()).limit(50)))
    return {"guides": GUIDES, "deals": [{"id": d.id, "slug": d.slug,
        "title": f"{c.origin_city} → {c.destination_city}", "start": str(d.trip_start),
        "end": str(d.trip_end), "trip_type": c.trip_type,
        "price": str(d.flight_price_pln)} for d in deals for c in [serialize_deal(db, d)]]}


@router.get("/sources/{deal_id}/events")
def events_for_source(deal_id: int, _: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    deal = db.scalar(available_deals_query().where(Deal.id == deal_id))
    if not deal:
        raise HTTPException(404, "Перелёт недоступен")
    # Candidates only: exact arrival/return times and selected stay are checked on creation.
    rows = db.scalars(select(LocalEvent).where(LocalEvent.destination_id == deal.destination_id,
        LocalEvent.active.is_(True), LocalEvent.start_date >= deal.trip_start,
        LocalEvent.start_date <= deal.trip_start + timedelta(days=30),
        LocalEvent.checked_at >= now() - timedelta(hours=get_settings().events_max_age_hours),
    ).order_by(LocalEvent.start_date, LocalEvent.id).limit(100))
    return [{"id": e.id, "name": e.payload.get("name"), "date": str(e.start_date)} for e in rows]


@router.get("/items")
def items(_: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    result = []
    for item in db.scalars(select(EditorialItem).order_by(EditorialItem.id.desc()).limit(100)):
        revision = load(db, item.id)[1]
        result.append({"id": item.id, "title": revision.snapshot["facts"]["title"],
                       "version": item.version, "status": item.status, "kind": item.kind})
    return result


@router.post("/items", status_code=201)
def create(body: Create, session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    source = body.model_dump(exclude={"kind"})
    snapshot = source_snapshot(db, body.kind, source)
    item = EditorialItem(kind=body.kind, source=source, version=1, status="DRAFT", created_at=now())
    db.add(item)
    db.flush()
    variants = dict.fromkeys(CHANNELS, draft_text(snapshot, body.kind))
    revision = EditorialRevision(item_id=item.id, version=1, snapshot=snapshot, variants=variants,
        artifacts=build_artifacts(snapshot, variants),
        checksum=revision_checksum(snapshot, variants), owner=session.owner, created_at=now())
    db.add(revision)
    audit(db, item, session.owner, "CREATED")
    db.commit()
    return describe(db, item, revision)


@router.get("/items/{item_id}")
def detail(item_id: int, _: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    return describe(db, *load(db, item_id))


@router.get("/items/{item_id}/media")
def media(item_id: int, version: int, _: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    revision = db.scalar(select(EditorialRevision).where(
        EditorialRevision.item_id == item_id, EditorialRevision.version == version))
    if not revision:
        raise HTTPException(404, "Версия не найдена")
    return Response(revision.artifacts["media_svg"], media_type="image/svg+xml",
                    headers={"Content-Security-Policy": "default-src 'none'; sandbox"})


@router.post("/items/{item_id}/revise")
def revise(item_id: int, body: Edit, session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    item, old = load(db, item_id)
    lock(db, item, body.version)
    snapshot = source_snapshot(db, item.kind, item.source) if body.refresh_source else old.snapshot
    invalidate_rehearsals(db, item, session.owner)
    variants = dict.fromkeys(CHANNELS, draft_text(snapshot, item.kind)) if body.refresh_source else body.variants
    item.version += 1
    item.status = "DRAFT"
    revision = EditorialRevision(item_id=item.id, version=item.version, snapshot=snapshot,
        artifacts=build_artifacts(snapshot, variants),
        variants=variants, checksum=revision_checksum(snapshot, variants),
        owner=session.owner, created_at=now())
    db.add(revision)
    audit(db, item, session.owner, "REVISED", {"source_refreshed": body.refresh_source})
    db.commit()
    return describe(db, item, revision)


def verify_or_invalidate(db: Session, item: EditorialItem, revision: EditorialRevision, owner_name: str):
    _, issue = check_revision(db, item, revision)
    if issue:
        item.status = "NEEDS_REVIEW"
        audit(db, item, owner_name, "STALE", {"reason": issue})
        db.commit()
        raise HTTPException(409, issue)


@router.post("/items/{item_id}/approve")
def approve(item_id: int, body: Approve, session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    item, revision = load(db, item_id)
    lock(db, item, body.version)
    verify_or_invalidate(db, item, revision, session.owner)
    if item.status in {"REJECTED", "NEEDS_REVIEW"}:
        raise HTTPException(409, "Сначала создайте новую версию")
    channels = sorted(set(body.channels))
    previous = db.scalar(select(EditorialApproval).where(
        EditorialApproval.item_id == item.id, EditorialApproval.version == item.version))
    if previous:
        if previous.channels != channels or item.status != "APPROVED":
            raise HTTPException(409, "Для изменения одобрения создайте новую версию")
    else:
        db.add(EditorialApproval(item_id=item.id, version=item.version, channels=channels,
            checksum=revision.checksum, owner=session.owner, created_at=now(),
            expires_at=utc(datetime.fromisoformat(revision.snapshot["valid_until"]))))
        audit(db, item, session.owner, "APPROVED_DRY_RUN", {"channels": channels, "accounts": []})
    item.status = "APPROVED"
    db.commit()
    return describe(db, item, revision)


@router.post("/items/{item_id}/reject")
def reject(item_id: int, body: Version, session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    item, revision = load(db, item_id)
    lock(db, item, body.version)
    if item.status != "REJECTED":
        invalidate_rehearsals(db, item, session.owner)
        item.status = "REJECTED"
        audit(db, item, session.owner, "REJECTED")
    db.commit()
    return describe(db, item, revision)


@router.post("/items/{item_id}/rehearsal", status_code=201)
def rehearse(item_id: int, body: Rehearse, session: EditorSession = Depends(owner),
             db: Session = Depends(get_db)):
    item, revision = load(db, item_id)
    lock(db, item, body.version)
    job = schedule(db, item, revision, body.scheduled_at, session.owner)
    db.commit()
    return describe_rehearsal(job)


@router.post("/items/{item_id}/rehearsal/{action}")
def rehearsal_action(item_id: int, action: Literal["run", "cancel"], body: Version,
                     session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    item, revision = load(db, item_id)
    lock(db, item, body.version)
    job = db.scalar(select(EditorialRehearsal).where(EditorialRehearsal.revision_id == revision.id))
    if not job:
        raise HTTPException(404, "Пробная задача не найдена")
    if action == "cancel":
        invalidate_rehearsals(db, item, session.owner)
    else:
        check_job(db, item, job, session.owner)
    db.commit()
    return {**describe_rehearsal(job), "package": job.package}


@router.post("/items/{item_id}/dry-run")
def dry_run(item_id: int, body: Version, session: EditorSession = Depends(owner), db: Session = Depends(get_db)):
    item, revision = load(db, item_id)
    lock(db, item, body.version)
    verify_or_invalidate(db, item, revision, session.owner)
    approval = db.scalar(select(EditorialApproval).where(
        EditorialApproval.item_id == item.id, EditorialApproval.version == item.version))
    if (item.status != "APPROVED" or not approval or utc(approval.expires_at) <= now()
            or approval.checksum != revision.checksum):
        raise HTTPException(409, "Требуется действующее одобрение этой версии")
    audit(db, item, session.owner, "DRY_RUN", {"channels": approval.channels})
    db.commit()
    return {"mode": "dry-run", "publishable": False, "accounts": [],
            "notice": "Редакционное одобрение. Для публикации потребуется подключённый аккаунт и новое одобрение.",
            "id": item.id, "version": item.version, "checksum": revision.checksum,
            "locale": "pl", "checked_at": now().isoformat(),
            "approved_by": approval.owner, "approval_expires_at": utc(approval.expires_at).isoformat(),
            "snapshot": revision.snapshot, "media_svg": revision.artifacts["media_svg"],
            "media_rights": "HopTrip original template v1",
            "variants": {c: {"text": render_text(revision, c), "delivery": "not_connected",
                              "requires_video": c == "tiktok"} for c in approval.channels}}
