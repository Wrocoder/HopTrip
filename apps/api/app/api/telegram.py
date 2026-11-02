import hmac

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.services.telegram_subscriptions import receive_update

router = APIRouter(prefix='/api/v1/telegram', tags=['telegram'])


@router.get('/status')
def status(settings: Settings = Depends(get_settings)):
    return {'enabled': settings.telegram_enabled,
            'delivery_enabled': settings.telegram_enabled and settings.telegram_delivery_enabled}


@router.post('/webhook')
def webhook(
    value: dict, secret: str = Header(default='', alias='X-Telegram-Bot-Api-Secret-Token'),
    db: Session = Depends(get_db), settings: Settings = Depends(get_settings),
):
    if not settings.telegram_enabled:
        raise HTTPException(503, 'Telegram subscriptions unavailable')
    expected = settings.telegram_webhook_secret.get_secret_value()
    if not expected or not hmac.compare_digest(secret.encode(), expected.encode()):
        raise HTTPException(403, 'Invalid webhook authentication')
    receive_update(db, settings, value)
    return {'ok': True}
