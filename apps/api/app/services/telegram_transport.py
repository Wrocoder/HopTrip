"""Fixed-host TLS transport. Never log URL-bearing exceptions or provider bodies."""

import json
import ssl
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, HTTPSHandler, Request, build_opener

from app.config import Settings


class TelegramFailure(Exception):
    def __init__(self, kind: str = 'UNCERTAIN', retry_after: int = 0):
        super().__init__('Telegram delivery failed')
        self.kind, self.retry_after = kind, retry_after


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class TelegramClient:
    def __init__(self, settings: Settings):
        self.token = settings.telegram_bot_token
        self.opener = build_opener(HTTPSHandler(context=ssl.create_default_context()), NoRedirect())

    def send(self, chat_id: int, text: str) -> None:
        if not text or len(text.encode('utf-16-le')) // 2 > 4096:
            raise TelegramFailure()
        request = Request(
            'https://api.telegram.org/bot' + self.token.get_secret_value() + '/sendMessage',
            data=json.dumps({'chat_id': chat_id, 'text': text,
                             'link_preview_options': {'is_disabled': True},
                             'allow_paid_broadcast': False}).encode(),
            headers={'Content-Type': 'application/json'}, method='POST',
        )
        try:
            try:
                response = self.opener.open(request, timeout=5)
            except HTTPError as error:
                response = error
            with response:
                raw = response.read(65537)
                if len(raw) > 65536:
                    raise TelegramFailure()
                result = json.loads(raw)
                if not isinstance(result, dict):
                    raise TelegramFailure()
                code = result.get('error_code', response.code)
                if code == 403:
                    raise TelegramFailure('BLOCKED')
                if code == 429:
                    delay = result.get('parameters', {}).get('retry_after')
                    if type(delay) is int and 1 <= delay <= 604800:
                        raise TelegramFailure('RATE_LIMITED', delay)
                    raise TelegramFailure()
                sent = result.get('result')
                if (response.code != 200 or result.get('ok') is not True
                        or not isinstance(sent, dict) or type(sent.get('message_id')) is not int
                        or sent.get('chat', {}).get('id') != chat_id):
                    raise TelegramFailure()
        except TelegramFailure:
            raise
        except Exception:
            raise TelegramFailure() from None
