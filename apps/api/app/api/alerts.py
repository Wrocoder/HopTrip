from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.schemas.alert import AlertSignup, AlertToken, AlertUpdate
from app.services import alerts

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("/status")
def status(settings: Settings = Depends(get_settings)):
    return {"enabled": settings.alerts_enabled}


@router.post("", status_code=202)
def signup(value: AlertSignup, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    alerts.signup(db, settings, value)
    return {"message": "Check your email if this address can receive alerts"}


@router.post("/confirm")
def confirm(value: AlertToken, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    return {"token": alerts.confirm(db, settings, value.token)}


@router.post("/manage")
def manage(value: AlertToken, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    alert = alerts.authorized(db, settings, value.token, "manage")
    return {"status": alert.status, "filters": alert.filters}


@router.patch("/manage")
def update(value: AlertUpdate, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    alert = alerts.authorized(db, settings, value.token, "manage")
    if alert.status != "ACTIVE":
        raise HTTPException(409, "Only confirmed active alerts can be edited")
    alert.filters = alerts.normalized_filters(db, value.filters)
    db.commit()
    return {"status": alert.status, "filters": alert.filters}


@router.post("/unsubscribe")
def unsubscribe(value: AlertToken, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    alert = alerts.authorized(db, settings, value.token, "manage")
    if alert.status != "STOPPED":
        alert.status = "STOPPED"
        alert.stopped_at = datetime.now(UTC)
        db.commit()
    return {"status": "STOPPED"}
