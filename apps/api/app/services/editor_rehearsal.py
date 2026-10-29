"""Scheduled rehearsal only. This module has no network or delivery adapter."""
from datetime import datetime

from app.models.editorial import (
    EditorialApproval,
    EditorialItem,
    EditorialRehearsal,
    EditorialRevision,
)
from app.services.editorial import audit, check_revision, now, render_text, utc
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session


def describe_rehearsal(job: EditorialRehearsal) -> dict:
    return {"id": job.id, "version": job.version, "mode": "dry-run", "publishable": False,
            "accounts": [], "state": job.state, "reason": job.reason,
            "channels": job.channels, "scheduled_at": utc(job.scheduled_at).isoformat(),
            "checked_at": utc(job.checked_at).isoformat() if job.checked_at else None}


def invalidate_rehearsals(db: Session, item: EditorialItem, owner: str):
    for job in db.scalars(select(EditorialRehearsal).where(
            EditorialRehearsal.item_id == item.id,
            EditorialRehearsal.state.in_(["SCHEDULED", "READY"]))):
        job.state, job.package = "CANCELLED", None
        job.reason = "Версия изменена или отклонена"
        audit(db, item, owner, "REHEARSAL_CANCELLED", {"rehearsal_id": job.id})


def schedule(db: Session, item: EditorialItem, revision: EditorialRevision,
             scheduled_at: datetime | None, owner: str) -> EditorialRehearsal:
    # Caller holds the item lock, shared by revise/reject and queue consumers.
    approval = db.scalar(select(EditorialApproval).where(
        EditorialApproval.item_id == item.id, EditorialApproval.version == item.version))
    checked = now()
    if (item.status != "APPROVED" or not approval or utc(approval.expires_at) <= checked
            or approval.checksum != revision.checksum):
        raise HTTPException(409, "Требуется действующее одобрение этой версии")
    _, issue = check_revision(db, item, revision)
    if issue:
        raise HTTPException(409, issue)
    previous = db.scalar(select(EditorialRehearsal).where(
        EditorialRehearsal.revision_id == revision.id))
    if previous:
        if (previous.state in {"SCHEDULED", "READY"}
                and (scheduled_at is None or utc(previous.scheduled_at) == scheduled_at)):
            return previous
        raise HTTPException(409, "Для нового расписания создайте и одобрите новую версию")
    scheduled_at = scheduled_at or checked
    if scheduled_at >= utc(approval.expires_at) or scheduled_at < checked:
        raise HTTPException(422, "Выберите будущее время до истечения одобрения")
    job = EditorialRehearsal(item_id=item.id, revision_id=revision.id, approval_id=approval.id,
        version=item.version, checksum=revision.checksum, channels=list(approval.channels),
        scheduled_at=scheduled_at, state="SCHEDULED", owner=owner, created_at=checked)
    db.add(job)
    db.flush()
    audit(db, item, owner, "REHEARSAL_SCHEDULED", {
        "rehearsal_id": job.id, "scheduled_at": scheduled_at.isoformat(),
        "checksum": revision.checksum, "channels": job.channels, "accounts": [], "publishable": False})
    return job


def check_job(db: Session, item: EditorialItem, job: EditorialRehearsal, owner: str):
    """Recheck even READY exports: persisted artifacts never bypass source validation."""
    checked = now()
    if job.state not in {"SCHEDULED", "READY"} or utc(job.scheduled_at) > checked:
        return
    revision = db.get(EditorialRevision, job.revision_id)
    approval = db.get(EditorialApproval, job.approval_id)
    reason = None
    state = "NEEDS_REVIEW"
    if (not revision or not approval or item.version != job.version or item.status != "APPROVED"
            or revision.item_id != item.id or revision.version != job.version
            or approval.item_id != item.id or approval.version != job.version
            or revision.checksum != job.checksum or approval.checksum != job.checksum
            or approval.channels != job.channels):
        reason = "Версия или одобрение изменились"
    elif utc(approval.expires_at) <= checked:
        state, reason = "EXPIRED", "Срок одобрения истёк"
    else:
        _, reason = check_revision(db, item, revision)
    previous = job.state
    job.checked_at = checked
    if reason:
        job.state, job.reason, job.package = state, reason, None
    else:
        assert revision is not None and approval is not None
        job.state, job.reason = "READY", None
        job.package = {"mode": "dry-run", "publishable": False, "accounts": [],
            "notice": "Пробная очередь. Отправка не подключена; потребуется новое одобрение получателя.",
            "id": item.id, "version": job.version, "checksum": job.checksum,
            "rehearsal_id": job.id, "scheduled_at": utc(job.scheduled_at).isoformat(),
            "locale": "pl", "checked_at": checked.isoformat(), "approved_by": approval.owner,
            "approval_expires_at": utc(approval.expires_at).isoformat(),
            "snapshot": revision.snapshot, "media_svg": revision.artifacts["media_svg"],
            "media_rights": revision.artifacts["media_rights"],
            "variants": {c: {"text": render_text(revision, c), "delivery": "not_connected",
                              "requires_video": c == "tiktok"} for c in job.channels}}
    if previous != job.state:
        audit(db, item, owner, "REHEARSAL_CHECKED", {
            "rehearsal_id": job.id, "state": job.state, "reason": job.reason})


def process_due(db: Session, owner: str = "rehearsal-worker", limit: int = 50) -> list[dict]:
    # Lock items first, matching the API. SKIP LOCKED lets other consumers proceed.
    items = list(db.scalars(select(EditorialItem).join(EditorialRehearsal,
        EditorialRehearsal.item_id == EditorialItem.id).where(
        EditorialRehearsal.state == "SCHEDULED", EditorialRehearsal.scheduled_at <= now(),
    ).order_by(EditorialItem.id).limit(limit).with_for_update(of=EditorialItem, skip_locked=True)))
    result = []
    for item in items:
        job = db.scalar(select(EditorialRehearsal).where(
            EditorialRehearsal.item_id == item.id, EditorialRehearsal.state == "SCHEDULED",
            EditorialRehearsal.scheduled_at <= now()))
        if job:
            check_job(db, item, job, owner)
            result.append(describe_rehearsal(job))
    db.commit()
    return result
