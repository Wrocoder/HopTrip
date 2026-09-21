"""Approved stored partner link adapter. No fabricated provider HTTP contract."""

import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


class LinkUnavailable(ValueError):
    pass


def build_deep_link(
    url: object, *, allowed_hosts: list[str], tracking_param: str | None, tracking_id: str | None
) -> str:
    if not isinstance(url, str) or any(ord(c) < 33 for c in url) or "\\" in url:
        raise LinkUnavailable("INVALID_LINK")
    try:
        parsed = urlsplit(url)
        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.port not in (None, 443)
            or parsed.fragment
            or parsed.hostname.lower() not in {h.lower() for h in allowed_hosts}
        ):
            raise LinkUnavailable("UNAPPROVED_HOST")
    except ValueError as exc:
        raise LinkUnavailable("INVALID_LINK") from exc
    if tracking_param:
        if not re.fullmatch(r"[a-zA-Z][a-zA-Z0-9_]{0,39}", tracking_param):
            raise LinkUnavailable("UNSUPPORTED_TRACKING")
        if tracking_id:
            query = [
                (k, v)
                for k, v in parse_qsl(parsed.query, keep_blank_values=True)
                if k != tracking_param
            ]
            query.append((tracking_param, tracking_id))
            parsed = parsed._replace(query=urlencode(query))
    return urlunsplit(parsed)
