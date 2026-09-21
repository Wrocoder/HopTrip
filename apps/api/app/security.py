"""Bounded ASGI body reader and per-process rate limit for one API worker."""

import logging
from collections import OrderedDict
from time import monotonic
from uuid import uuid4

from starlette.responses import JSONResponse

logger = logging.getLogger("hoptrip.requests")


class SecurityMiddleware:
    def __init__(self, app, *, rate_limit: int = 120, max_body: int = 65536):
        self.app, self.rate_limit, self.max_body = app, rate_limit, max_body
        self.buckets: OrderedDict[str, tuple[float, int]] = OrderedDict()

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        request_id = uuid4().hex
        headers = [
            (b"x-request-id", request_id.encode()),
            (b"x-content-type-options", b"nosniff"),
            (b"referrer-policy", b"strict-origin-when-cross-origin"),
            (b"x-frame-options", b"DENY"),
            (b"cache-control", b"no-store"),
        ]

        async def secured_send(message):
            if message["type"] == "http.response.start":
                message["headers"] = list(message.get("headers", [])) + headers
                logger.info(
                    "request_id=%s method=%s status=%s",
                    request_id,
                    scope["method"],
                    message["status"],
                )
            await send(message)

        async def reject(code, detail):
            await JSONResponse({"detail": detail}, status_code=code)(scope, receive, secured_send)

        path = scope.get("path", "")
        if scope["method"] in ("POST", "PATCH") or path.startswith("/go/"):
            # Client is the socket peer; never trust arbitrary X-Forwarded-For here.
            peer = (scope.get("client") or ("unknown",))[0]
            now = monotonic()
            while self.buckets and next(iter(self.buckets.values()))[0] <= now - 60:
                self.buckets.popitem(last=False)
            start, count = self.buckets.get(peer, (now, 0))
            if count >= self.rate_limit or (
                peer not in self.buckets and len(self.buckets) >= 10000
            ):
                return await reject(429, "Rate limit exceeded")
            self.buckets[peer] = (start, count + 1)
            messages, size = [], 0
            while True:
                msg = await receive()
                if msg["type"] == "http.disconnect":
                    return
                size += len(msg.get("body", b""))
                if size > self.max_body:
                    return await reject(413, "Request too large")
                messages.append(msg)
                if not msg.get("more_body", False):
                    break

            async def buffered_receive():
                if messages:
                    return messages.pop(0)
                return await receive()

            return await self.app(scope, buffered_receive, secured_send)
        return await self.app(scope, receive, secured_send)
